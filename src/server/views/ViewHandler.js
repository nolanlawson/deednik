/*
 * Logic for displaying Jade views.
 */
(function() {

    "use strict";

    var path = require('path'),
        _    = require('underscore');

    function ViewHandler() {
    }

    ViewHandler.prototype.init = function(app, APP_INFO){

        var appDisplayInfo = _.pick(APP_INFO, "version", "description", "name", "production");

        app.set('view engine', 'jade');
        app.set('views', path.join(__dirname, '../../../views'));
        app.locals.pretty = !APP_INFO.production;

        // redirect to the main app path
        app.get('/', function(req, res){
            res.render('index', {APP_INFO : appDisplayInfo});
        });

        app.get('/partials/home.html', function(req, res){
            res.render('partials/home', {APP_INFO : appDisplayInfo});
        });

        app.get('/partials/about.html', function(req, res){
            res.render('partials/about', {APP_INFO : appDisplayInfo});
        });
    };

    module.exports = ViewHandler;

})();