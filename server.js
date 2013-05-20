/*global require __dirname console*/
(function(){

"use strict";


var

        // constants
        APP_NAME        = 'One Good Turn',
        APP_VERSION     = '1.0',
        port = 3000,
        
        // imports
        express     = require('express'), 
        app         = express(),
        http        = require('http'),
        NodeCache   = require("node-cache"),
        querystring = require('querystring'),
        Q           = require('q'),
        _           = require('underscore'),
        
        // in-app dependencies
        DAO         = require('./server/db/DAO.js')
        ;
        


app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use("/styles", express['static'](__dirname + '/styles'));
app.use("/images", express['static'](__dirname + '/images'));
app.use("/build", express['static'](__dirname + '/js'));



var dao = new DAO({production : true});

dao.init();

// redirect to the main app path
app.get('/', function(req, res){
    res.render('index', 
        { 
            appVersion : APP_VERSION,
            appName : APP_NAME
        }
    );
});

app.listen(port);
console.log('Listening on port ' + port);

})();
