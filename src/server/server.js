/* Main server definition for 1 Good Turn. */
"use strict";

var

        // imports
        express          = require('express'),
        expressValidator = require('express-validator'),
        app              = express(),
        server           = require('http').createServer(app),
        path             = require('path'),
        _                = require('underscore'),
        crypto           = require('crypto'),
        passport         = require('passport'),
        LocalStrategy    = require('passport-local').Strategy,

        // constants

        PRODUCTION      = (process.env.NODE_ENV !== 'development'),
        APP_INFO        = _.extend({production : PRODUCTION}, require('./../../package.json')),
        MAX_POST_SIZE   = 1024,
        MIN_POST_SIZE   = 1,// TODO: reconsider this
        PORT            = 3000,
        
        // in-app dependencies
        DAO          = require('./db/DAO.js'),
        SocketServer = require('./sockets/SocketServer.js'),
        ViewHandler  = require('./views/ViewHandler.js'),
        Post         = require('./model/Post.js'),
        Functions    = require('./util/Functions.js'),
        auth         = require('./routes/auth.js')(app, passport)
        ;


app.use("/css", express['static'](path.join(__dirname, '../../build/css')));
app.use("/images", express['static'](path.join(__dirname, '../../images')));
app.use("/js", express['static'](path.join(__dirname, '../../build/js')));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({secret : 'does-not-matter-if-we-use-ssl'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(expressValidator);


var dao = new DAO({production : true});
dao.init();

passport.use(new LocalStrategy(
    function(username, password, done) {

        dao.findUserByUserGuid(username).then(function(user){

            var digest = encrypt(password, user.salt);

            if (digest !== user.digest) {
                return done(null, false, { message : "Incorrect password."});
            }

            return done(null, user);

        }, function(err){
            return done(null, false, { message : "Incorrect username."});
        }).done();
    }
));

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    dao.findById(id).then(function(user){done(null, user);}, function(err){done(err);}).done();
});

var socketServer = new SocketServer();
socketServer.init(server);

var viewHandler = new ViewHandler();
viewHandler.init(app, APP_INFO);

function getUserIpAddress(req) {
    // on production, I'm behind a Nginx proxy
    console.log('req is ' + JSON.stringify(_.keys(req)));
    console.log('req.connection is ' + JSON.stringify(_.keys(req.connection)));
    console.log('req.headers is ' + JSON.stringify(_.keys(req.headers)));
    return PRODUCTION ?
        (req.headers['x-forwarded-for'] || req.connection.remoteAddress) :
        req.headers['user-agent']; // every browser is its own user
}

function encrypt(password, salt) {
    var hash = crypto.createHash('sha512');
    hash.update(password + salt);
    return hash.digest('base64');
}

app.post('/jsapi-v1/insertPost', function(req, res){
    console.log('/jsapi-v1/insertPost from ' + req.connection.remoteAddress);

    req.assert('postContent', 'Invalid postContent').notEmpty().len(MIN_POST_SIZE, MAX_POST_SIZE);

    if (req.validationErrors()) {
        res.json({error : req.validationErrors(true)});
        return;
    }

    var content = req.param('postContent');
    var post = new Post(content);
    var userGuid = getUserIpAddress(req);

    // steps to perform:
    // save post -> upsert user -> upsert new "pos" vote -> lookup post details -> inform sockets
    // (the user should, by default, "like" his/her own post)
    var savedPost, user, votes, savedPostWithDetails;
    var successFromUsersPov; // the user doesn't care about other sockets
    dao.save(post).
        then(function(_savedPost){
            savedPost = _savedPost;
            votes = {};
            votes[savedPost._id] = "pos";
            return dao.upsertUser(userGuid);
        }).then(function(_user){
            user = _user;
            return dao.upsertVotes(user._id, votes);
        }).then(function(){
            res.json({success : true, postId : savedPost._id});
            successFromUsersPov = true;
            return dao.findPostDetails(savedPost._id);
        }).then(function(postDetails){
            savedPostWithDetails = _.extend(savedPost, postDetails);
            socketServer.onNewPost(savedPostWithDetails);
        }, function(err){
            if (!successFromUsersPov) {
                res.json({error : err});
            }
            console.log('serious error while posting: ' + err);
        }).done();
});

app.get('/jsapi-v1/findUserVotes', function(req, res){
    console.log('/jsapi-v1/findUserVotes from ' + req.connection.remoteAddress);

    var userGuid = getUserIpAddress(req);

    dao.upsertUser(userGuid).then(function(user){
        return dao.findVotesByUserId(user._id);
    }).then(function(votes){
            res.json({success : true, rows : votes});
        },function(err){
            res.json({error : err});
        }).done();
});


app.get('/jsapi-v1/logout', function(req, res){

    console.log("use wants to log out: " + (req.user && req.user.userGuid));

    if (req.user) {
        req.logout();
        res.json({success : true});
    } else{
        return res.json({error : true});
    }
});

app.get('/jsapi-v1/session', function(req, res){
    console.log("found user: " + (req.user && req.user.userGuid));

    res.json({'session' : (req.user && true)});
});

app.post('/jsapi-v1/signupOrLogin', function(req, res, next){

    req.assert('username', 'Invalid username').notEmpty().isEmail();
    req.assert('password', 'Invalid password').notEmpty().isAlphanumeric();
    req.assert('login', 'Invalid login').notNull();
    req.sanitize('login').toBoolean();

    if (req.validationErrors()) {
        return res.json({error : req.validationErrors(true)});
    }

    var username = req.param('username');
    var password = req.param('password');
    var login = req.param('login');

    if (login) {
        passport.authenticate('local', function(err, user, info) {
            if (err) {
                console.log('got error: ' + err);
                return res.json({error : true, info : info});
            }
            console.log('got user: ' + user);
            req.login(user, function(err){
                if (err) {
                    console.log('got login error: ' + err);
                    return res.json({error : true});
                }
                return res.json({success : true});
            });

        })(req, res, next);
    } else { // signup
        var salt = crypto.randomBytes(32).toString('base64');
        var digest = encrypt(password, salt);

        console.log('digest is ' + digest);

        dao.upsertUser(username, {userGuid : username, salt : salt, digest : digest}).then(
            function(user) {
                console.log('got user: ' + user);
                req.login(user, function(err) {
                    if (err) {
                        console.log('got signup error: ' + err);
                        return res.json({error : true});
                    }
                    req.login(user, function(err){
                        if (err) {
                            console.log('got signup error: ' + err);
                            return res.json({error : true});
                        }
                        return res.json({success : true});
                    });

                });
            }
        ).done();
    }

});

app.post('/jsapi-v1/postUserVotes', function(req, res){
    console.log('/jsapi-v1/postUserVotes from ' + req.connection.remoteAddress);

    var votes = req.param('votes');

    if (typeof votes !== 'object' ||
        !_.every(_.keys(votes), Functions.isString()) ||
        !_.every(_.values(votes), Functions.isString())) {

        res.json({error : 'votes must be valid string->string object'});
        return;
    }

    var userGuid = getUserIpAddress(req);

    dao.upsertUser(userGuid).then(function(user){
        return dao.upsertVotes(user._id, votes);
    }).then(function(){
            res.json({success : true});
        },function(err){
            res.json({error : err});
        }).done();

});


/**
 * render posts in JSON, with any post details included
 *  takes an express res object, limit of posts to return, and a dao function to call (with implied arguments
 *  afterwards)
 *  i.e. renderPosts(res, limit, fn [, arg1, arg2, arg3 ...])
 */
function renderPosts(res, limit, fn) {

    // var args - everything after "fn"
    var fnArgs = Array.prototype.slice.call(arguments).slice(3);

    fn.apply(dao, fnArgs).
        then(function(posts){

            dao.findPostDetails(posts.map(Functions.getId())).then(
                function(postDetails) {

                    var postsWithDetails = posts.map(function(post, idx){
                        return _.extend(post, postDetails[idx]);
                    });

                    res.json({success : true, rows : postsWithDetails, exhausted : (posts.length < limit)});
                }, function(err) {
                    res.json({error : err});
                }
            ).done();
        }, function(err){
            res.json({error : err});
        }).done();
}

app.get('/jsapi-v1/findLastPosts', function(req, res){
    console.log('/jsapi-v1/findLastPosts');

    req.assert('n', 'Invalid n - should be int').notEmpty().isInt();
    req.sanitize('n').toInt();

    if (req.validationErrors()) {
        res.json({error : req.validationErrors(true)});
        return;
    }

    var n = req.param('n');

    console.log('getting last ' + n + ' timestamps');

    renderPosts(res, n, dao.findLastPosts, n);
});

app.get('/jsapi-v1/findPostsByTimestampBefore', function(req, res){

    req.assert('timestamp', 'Invalid timestamp - should be int').notEmpty().isInt();
    req.sanitize('timestamp').toInt();
    req.assert('limit', 'Invalid limit - should be int').notEmpty().isInt();
    req.sanitize('limit').toInt();

    if (req.validationErrors()) {
        res.json({error : req.validationErrors(true)});
        return;
    }

    var timestamp = req.param('timestamp');
    var limit = req.param('limit');

    renderPosts(res, limit, dao.findPostsByTimestampBefore, timestamp, limit);

});

server.listen(PORT);
console.log('Listening on port ' + PORT + ' in ' + (PRODUCTION ? 'production' : 'development') + ' mode.');

