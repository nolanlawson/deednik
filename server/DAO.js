/*global require console module emit*/
(function(){

"use strict";


var 
        // imports
        nano        = require('nano')('http://localhost:5984'), // TODO: don't hardcode
        Q           = require('q'),
        
        // constants
        PRODUCTION_DB_NAME     = 'onegoodturn'
        ;



module.exports.DAO = function(options) {
    var dbName = options.production ? 
        PRODUCTION_DB_NAME : 
        'unit_test_' + new Date().getTime() + "_" + Math.floor((Math.random() * 1000));
    
    var self = {
        
        //
        // private variables
        // 
        
        dbName : dbName,
        db : null,
        
        //
        // public variables
        //
        
        /* true if the DB was successfully initialized */
        initialized : false,
        
        /* true if the DB was successfully destroyed */
        destroyed   : false,
        
        //
        // public functions
        //
        
        /* initialize the database.  creates it if it doesn't exist, and adds any necessary initial views */
        init : function() {
            
            // create the couchdb database if it doesn't exist already
        
            Q.nfcall(nano.db.get, self.dbName).
            then(self.useDB).
            then(self.setInitialized, function(err) {
                console.log('db "' + self.dbName +'" needs to be created, got err: ' + err);
                
                Q.nfcall(nano.db.create, self.dbName).
                then(self.useDB).
                then(self.createViews).
                then(self.setInitialized, console.log);
            });
        },
        
        /* delete (drop) the database */
        destroy : function() {
            
            console.log('destroying ' + self.dbName);
            nano.db.destroy(self.dbName, function(){
                console.log('destroyed ' + self.dbName);
                self.destroyed = true;
            });
        },
        
        //
        // private functions
        //
        
        useDB : function() {
            return Q.fcall(function(){
                console.log('using the existing db: ' + self.dbName);
                self.db = nano.use(self.dbName);
            });
        },
        setInitialized : function() {
            return Q.fcall(function(){
                console.log('initialized db');
                self.initialized = true;
            });
        },
        createViews : function() {
            return Q.nfcall(self.db.insert, { 
                    language : 'javascript',
                    views    : 
                        { "by_name_and_city": 
                            { "map": function(doc) { emit([doc.name, doc.city], doc._id); } } 
                        }
                  }, '_design/by_name_and_city');
        }
    };
    return self;
};

})();