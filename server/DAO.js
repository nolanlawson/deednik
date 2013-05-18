/*global require console module emit*/
(function(){

"use strict";


var 
        // imports
        nano        = require('nano')('http://localhost:5984'), // TODO: don't hardcode
        Q           = require('q'),
        
        // constants
        PRODUCTION_DB_NAME     = 'onegoodturn',
        db
        ;



module.exports.DAO = function(options) {
    var self = {
        dbName : (options.production ? PRODUCTION_DB_NAME : 'unit_test_foo' /*+ new Date().getTime()*/),
        
        destroy : function(callback) {
            console.log('destroying ' + self.dbName);
            nano.db.destroy(self.dbName, callback);
        },
        
        init : function(callback) {
            
            // create the couchdb database if it doesn't exist already
        
            Q.nfcall(nano.db.get, self.dbName).
            then(function() {
                console.log('db exists, nothing to do');
                db = nano.use(self.dbName);
                if (callback) {
                    callback();
                }
            }, function(err) {
                console.log('db "' + self.dbName +'" needs to be created, got err: ' + err);
            
                Q.nfcall(nano.db.create, self.dbName).
                then(function() {
                    console.log('adding initial views');
                    db = nano.use(self.dbName);
                    return Q.nfcall(db.insert, { 
                            language : 'javascript',
                            views    : 
                                { "by_name_and_city": 
                                    { "map": function(doc) { emit([doc.name, doc.city], doc._id); } } 
                                }
                          }, '_design/by_name_and_city');
                }).then(function(){
                    console.log('success!');
                    if (callback) {
                        callback();
                    }
                }, function(err){
                    console.log('error! ' + err);
                });
            });
        }
    };
    return self;
};

})();