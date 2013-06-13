"use strict";

var
    _                = require('underscore'),
    crypto           = require('crypto'),
    passport         = require('passport'),
    LocalStrategy    = require('passport-local').Strategy
    ;

function encrypt(password, salt) {
    var hash = crypto.createHash('sha512');
    hash.update(password + salt);
    return hash.digest('base64');
}

module.exports = function(app, dao) {

    passport.use(new LocalStrategy(
        function(username, password, done) {

            dao.findUserByUserGuid(username.trim().toLowerCase()).then(function(user){

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

    app.use(passport.initialize());
    app.use(passport.session());



    app.get('/jsapi-v1/logout', function(req, res){

        console.log("user wants to log out: " + (req.user && req.user.userGuid));

        if (req.user) {
            req.logout();
            res.json({success : true});
        } else{
            return res.json({error : true});
        }
    });

    app.get('/jsapi-v1/session', function(req, res){
        console.log("found user: " + (req.user && req.user.userGuid));

        res.json({success : (req.user && true), username : (req.user && req.user.userGuid)});
    });

    function login(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) {
                console.log('got error: ' + err);
                return res.json({error : true, info : info});
            }
            console.log('got user: ' + (user && user.userGuid));
            req.login(user, function(err){
                if (err) {
                    console.log('got login error: ' + err);
                    return res.json({error : true});
                }
                return res.json({success : true, username : user.userGuid});
            });

        })(req, res, next);
    }

    function signup(req, res) {

        var username = req.param('username').trim().toLowerCase();
        var password = req.param('password');

        var salt = crypto.randomBytes(32).toString('base64');
        var digest = encrypt(password, salt);

        console.log('digest is ' + digest);

        dao.findUserByUserGuid(username)
            .then(function(){
                return res.json({error : "user already exists"});
            }, function() {
                dao.upsertUser(username, {userGuid : username, salt : salt, digest : digest})
                    .then(function(user) {
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
                                return res.json({success : true, username : user.userGuid});
                            });
                        });

                    }).done();
            }).done();
    }

    app.post('/jsapi-v1/signupOrLogin', function(req, res, next){

        req.assert('username', 'Invalid username').notEmpty().isEmail();
        req.assert('password', 'Invalid password').notEmpty().isAlphanumeric().len;
        req.assert('login', 'Invalid login').notNull();
        req.sanitize('username').trim().toLowerCase();
        req.sanitize('login').toBoolean();

        if (req.validationErrors()) {
            return res.json({error : req.validationErrors(true)});
        }

        if (req.param('login')) {
            login(req, res, next);
        } else { // signup
            signup(req, res);
        }
    });

};