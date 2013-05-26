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
        Post         = require('./model/Post.js')
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
        socketServer.updateSockets(savedPost);
        res.json({success : true});
    }, function(err){
        res.json({error : err});
    }).done();
    

});

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

    dao.findLastPosts(n).
    then(function(rows){
        res.json({success : true, rows : rows});
    },
    function(err){
        res.json({error : err});
    });

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

    dao.findPostsByTimestampBefore(timestamp, limit).
        then(function(rows){
            res.json({success : true, rows : rows, exhausted : (rows.length < limit)});
        }, function(err){
            res.json({error : err});
        }).done();

});

app.get('/jsapi-v1/findPostsByTimestampSince', function(req, res){

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
