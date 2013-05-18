/*global require console module emit*/
(function(){

"use strict";


var 
        // imports
        nano        = require('nano')('http://localhost:5984'), // TODO: don't hardcode
        Q           = require('q'),
        
        // constants
        DB_NAME     = 'onegoodturn',
        db
        ;

var DAO = {
    
    init : function() {
        // create the couchdb database if it doesn't exist already
        
        Q.nfcall(nano.db.get, DB_NAME).then(function() {
            console.log('db exists, nothing to do');
            db = nano.use(DB_NAME);
        }, function(err) {
            console.log('db needs to be created, got err: ' + err);
            
            Q.nfcall(nano.db.create, DB_NAME).
            then(function() {
                console.log('adding initial views');
                db = nano.use(DB_NAME);
                return Q.nfcall(db.insert, { 
                        language : 'javascript',
                        views    : 
                            { "by_name_and_city": 
                                { "map": function(doc) { emit([doc.name, doc.city], doc._id); } } 
                            }
                      }, '_design/by_name_and_city');
            }).then(function(){
                console.log('success!');
            }, function(err){
                console.log('error! ' + err);
            });
        });
    }
    
};

module.exports.DAO = function() {
    return DAO; 
};

})();