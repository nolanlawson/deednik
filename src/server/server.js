/*global require __dirname console */
(function(){

"use strict";


var

        // imports
        express     = require('express'), 
        app         = express(),
        server      = require('http').createServer(app),
        path        = require('path'),
        _           = require('underscore'),

        // constants

        PRODUCTION      = (process.env.NODE_ENV !== 'development'),
        APP_INFO        = _.extend({production : PRODUCTION}, require('./../../package.json')),
        MAX_POST_SIZE   = 1024,
        PORT            = 3000,
        
        // in-app dependencies
        DAO          = require('./db/DAO.js'),
        SocketServer = require('./sockets/SocketServer.js'),
        ViewHandler  = require('./views/ViewHandler.js'),
        Post         = require('./model/Post.js')
        ;


app.use("/css", express['static'](path.join(__dirname, '../../build/css')));
app.use("/images", express['static'](path.join(__dirname, '../../images')));
app.use("/js", express['static'](path.join(__dirname, '../../build/js')));



var dao = new DAO({production : true});
dao.init();

var socketServer = new SocketServer();
socketServer.init(server);

var viewHandler = new ViewHandler();
viewHandler.init(app, APP_INFO);

app.get('/jsapi-v1/insertPost', function(req, res){
    console.log('/jsapi-v1/insertPost from ' + req.connection.remoteAddress);
    
    if(!req.query.postContent){
        res.json({error : 'no postContent'});
        return;
    } else if (req.query.postContent.length > MAX_POST_SIZE) {
        res.json({error : 'postContent too long'});
        return;
    }
    
    var content = req.query.postContent;
    
    var post = new Post(content);
    
    dao.save(post).
    then(function(savedPost){
        // notify any listening clients on the socket
        socketServer.updateSockets(savedPost);
        res.json({success : true});
    }, function(err){
        res.json({error : err});
    }).done();
    

});

app.get('/jsapi-v1/findLastPosts', function(req, res){
    var n = req.query.n && parseInt(req.query.n, 10);

    console.log('getting last ' + n + ' timestamps');

    dao.findLastPosts(n).
    then(function(rows){
        res.json({success : true, rows : rows});
    },
    function(err){
        res.json({error : err});
    });

});

app.get('/jsapi-v1/findPostsByTimestampBefore', function(req, res){

    var timestamp = req.query.timestamp && parseInt(req.query.timestamp, 10);

    console.log('timestamp is ' + timestamp);

    if (typeof timestamp !== 'number' || isNaN(timestamp)) {
        res.json({error : 'no timestamp'});
        return;
    }

    var limit = req.query.limit || 10;

    dao.findPostsByTimestampBefore(timestamp, limit).
        then(function(rows){
            res.json({success : true, rows : rows, exhausted : (rows.length < limit)});
        }, function(err){
            res.json({error : err});
        }).done();

});

app.get('/jsapi-v1/findPostsByTimestampSince', function(req, res){
    
    var timestamp = req.query.timestamp && parseInt(req.query.timestamp, 10);
    
    console.log('timestamp is ' + timestamp);
    
    if (typeof timestamp !== 'number' || isNaN(timestamp)) {
        res.json({error : 'no timestamp'});
        return;
    }
    
    var limit = req.query.limit || 10;
    
    dao.findPostsByTimestampSince(timestamp, limit).
    then(function(rows){
        res.json({success : true, rows : rows, exhausted : (rows.length < limit)});
    }, function(err){
        res.json({error : err});
    }).done();
});


server.listen(PORT);
console.log('Listening on port ' + PORT + ' in ' + (PRODUCTION ? 'production' : 'development') + ' mode.');

})();
