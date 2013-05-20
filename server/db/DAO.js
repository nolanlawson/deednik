/*
 * Logic for dealing with the CouchDB database 
*/
/*global require console module*/
(function() {

    "use strict";

    var
        // imports
        nano  = require('nano')('http://localhost:5984'),
        Q     = require('q'),
        _     = require('underscore'),
        views = require('./views.js'),

        // constants
        PRODUCTION_DB_NAME = 'onegoodturn'
        ;

    function DAO(options) {

        var self = this;

        dbName = options.production ? 
                PRODUCTION_DB_NAME : 
                'unit_test_' + new Date().getTime() + "_" + Math.floor((Math.random() * 1000));

        //
        // private variables
        // 
        var dbName = dbName;
        var db = null;

        //
        // public variables
        //
        /* true if the DB was successfully initialized */
        self.initialized = false;

        /* true if the DB was successfully destroyed */
        self.destroyed = false;

        //
        // private functions
        //

        function useDB() {
            return Q.fcall(function() {
                console.log('using the existing db: ' + dbName);
                db = nano.use(dbName);
            });
        }

        function setInitialized() {
            return Q.fcall(function() {
                console.log('initialized db');
                self.initialized = true;
            });
        }

        function createViews() {
            return Q.allResolved(views.map(function(view) {
                var viewDef = {};
                viewDef[view.name] = _.pick(view,'map','reduce');
                
                return Q.nfcall(db.insert, {
                    language: 'javascript',
                    views: viewDef
                }, ('_design/' + view.name));
            }));
        }

        //
        // public functions
        //
        /* initialize the database.  creates it if it doesn't exist, and adds any necessary initial views */
        self.init = function() {

            // create the couchdb database if it doesn't exist already
            Q.nfcall(nano.db.get, dbName).
            then(useDB).
            then(setInitialized, function(err) {
                console.log('db "' + dbName + '" needs to be created, got err: ' + err);

                Q.nfcall(nano.db.create, dbName).
                then(useDB).
                then(createViews).
                then(setInitialized, console.log);
            });
        };

        /* delete (drop) the database */
        self.destroy = function() {

            console.log('destroying ' + dbName);
            nano.db.destroy(dbName, function() {
                console.log('destroyed ' + dbName);
                self.destroyed = true;
            });
        };

        /* save an object, hibernate style: save the object and then set the generated id and rev*/
        self.save = function(object) {

            Q.nfcall(db.insert, object).
            then(function(body) {
                if (body && body[0] && body[0].ok) {
                    object._id = body[0].id;
                    object._rev = body[0].rev;
                } else {
                    console.log('improper body object: ' + JSON.stringify(body));
                }
            }, function(err) {
                console.log('save error: ' + err);
            });
        };

        self.findById = function(id) {
            return Q.nfcall(db.get, id, {
                revs_info: false
            });
        };

        self.findByUserId = function(userId) {
            return Q.nfcall(db.view, 'by_user_id', 'by_user_id', {
                include_docs: true,
                key: userId
            });
        };
    }

    module.exports = DAO;

})();
