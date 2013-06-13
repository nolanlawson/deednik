/*
 * Logic for displaying Jade views.
 */

"use strict";

var path = require('path'),
    _    = require('underscore'),
    sharedConstants = require('../util/SharedConstants.js');

function ViewHandler() {
}

ViewHandler.prototype.init = function(app, APP_INFO){

    var appDisplayInfo = _.pick(APP_INFO, "version", "description", "name", "production");

    var data = {APP_INFO : appDisplayInfo, sharedConstants : sharedConstants};

    app.set('view engine', 'jade');
    app.set('views', path.join(__dirname, '../../../views'));
    app.locals.pretty = !APP_INFO.production;

    // redirect to the main app path
    app.get('/', function(req, res){
        res.render('index', data);
    });

    app.get('/partials/home.html', function(req, res){
        res.render('partials/home', data);
    });

    app.get('/partials/about.html', function(req, res){
        res.render('partials/about', data);
    });
};

module.exports = ViewHandler;

