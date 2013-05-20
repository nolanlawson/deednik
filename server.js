/*global require __dirname console */
(function(){

"use strict";


var

        // constants
        APP_NAME        = 'One Good Turn',
        APP_VERSION     = '1.0',
        PRODUCTION      = false,
        MAX_POST_SIZE   = 1024,
        PORT            = 3000,
        APP_INFO        = {appName : APP_NAME, appVersion : APP_VERSION, production : PRODUCTION}, 
        
        // imports
        express     = require('express'), 
        app         = express(),
        server      = require('http').createServer(app),
        //http        = require('http'),
        //NodeCache   = require("node-cache"),
        //querystring = require('querystring'),
        //Q           = require('q'),
        path        = require('path'),
        io          = require('socket.io').listen(server),
        
        // in-app dependencies
        DAO         = require('./server/db/DAO.js'),
        Post        = require('./server/model/Post.js')
        ;
        
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));
app.use("/css", express['static'](path.join(__dirname, 'build/css')));
app.use("/images", express['static'](path.join(__dirname, 'images')));
app.use("/js", express['static'](path.join(__dirname, 'build/js')));
app.locals.pretty = true;

var dao = new DAO({production : true});

dao.init();

var sockets = [];

function updateSockets(post) {
    // inform the sockets that we have a new post
    // TODO: batch these
    sockets.forEach(function(socket){
        try {
            // TODO: deal with dead sockets eating up memory
            if (socket.volatile) {
                socket.volatile.emit('new:post', post);
            }
        } catch (err) {
            console.log('error with socket: ' + err);
        }
    });
}

// redirect to the main app path
app.get('/', function(req, res){
    res.render('index', APP_INFO);
});

app.get('/partials/home.html', function(req, res){
    res.render('partials/home', APP_INFO);
});

app.get('/partials/about.html', function(req, res){
    res.render('partials/about', APP_INFO);
});

// JSON API below
app.get('/jsapi-v1/info', function(req, res){
    res.json(APP_INFO);
});

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
        updateSockets(savedPost);
        res.json({success : true});
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
        res.json({success : true, rows : rows});
    }, function(err){
        res.json({error : err});
    }).done();
});

io.sockets.on('connection', function(socket){
    console.log('connection made');
    
    console.log('socket connect, there were ' + sockets.length + ' sockets...');
    sockets.push(socket);
    console.log('now there are ' + sockets.length + ' sockets');
    
    socket.on('request:refresh', function(){
        // given the user the last few posts from couchdb
        dao.findLastPosts(10).
        then(function(posts){
            socket.emit('get:refresh', posts);
        }).done();
    });
    
    socket.on('disconnect', function() {
        console.log('socket disconnect, there were ' + sockets.length + ' sockets...');
        sockets.splice(sockets.indexOf(socket), 1);
        console.log('now there are ' + sockets.length + ' sockets');
    });
});


server.listen(PORT);
console.log('Listening on port ' + PORT);

})();
