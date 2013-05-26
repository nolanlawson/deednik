/* Main server definition for 1 Good Turn. */
(function(){

"use strict";

var

        // imports
        express          = require('express'),
        expressValidator = require('express-validator'),
        app              = express(),
        server           = require('http').createServer(app),
        path             = require('path'),
        _                = require('underscore'),

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
        Functions    = require('./util/Functions.js')
        ;


app.use("/css", express['static'](path.join(__dirname, '../../build/css')));
app.use("/images", express['static'](path.join(__dirname, '../../images')));
app.use("/js", express['static'](path.join(__dirname, '../../build/js')));
app.use(express.bodyParser());
app.use(expressValidator);


var dao = new DAO({production : true});
dao.init();

var socketServer = new SocketServer();
socketServer.init(server);

var viewHandler = new ViewHandler();
viewHandler.init(app, APP_INFO);

app.post('/jsapi-v1/insertPost', function(req, res){
    console.log('/jsapi-v1/insertPost from ' + req.connection.remoteAddress);

    req.assert('postContent', 'Invalid postContent').notEmpty().len(MIN_POST_SIZE, MAX_POST_SIZE);

    if (req.validationErrors()) {
        res.json({error : req.validationErrors(true)});
        return;
    }

    var content = req.param('postContent');
    
    var post = new Post(content);

    dao.save(post).
        then(function(savedPost){
            // notify any listening clients on the socket
            dao.findPostDetails(savedPost._id).then(function(postDetails){
                    var postWithDetails = _.extend(savedPost, postDetails);
                    socketServer.onNewPost(postWithDetails);
                    res.json({success : true});
                },
                function(err){
                    res.json({error : err});
                }).done();
        }, function(err){
            res.json({error : err});
        }).done();

});
app.get('/jsapi-v1/findUserVotes', function(req, res){
    console.log('/jsapi-v1/findUserVotes from ' + req.connection.remoteAddress);

    var userGuid = req.connection.remoteAddress;

    dao.upsertUser(userGuid).then(function(user){
        return dao.findVotesByUserId(user._id);
    }).then(function(votes){
            res.json({success : true, rows : votes});
        },function(err){
            res.json({error : err});
        }).done();
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

    var userGuid = req.connection.remoteAddress;

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

})();
