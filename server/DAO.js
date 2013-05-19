/*global require console module emit sum*/
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
        
        /* save an object, hibernate style: save the object and then set the generated id and rev*/
        save : function(object) {
            
            Q.nfcall(self.db.insert, object).
            then(function(body){
                if (body && body[0] && body[0].ok) {
                    object._id = body[0].id;
                    object._rev = body[0].rev;
                } else {
                    console.log('improper body object: ' + JSON.stringify(body));
                }
            }, function(err){
                console.log('save error: ' + err);
            });
        },
        
        findById : function(id) {
            return Q.nfcall(self.db.get, id, { revs_info: false });
        },
        
        findByUserId : function(userId) {
            return Q.nfcall(self.db.view, 'by_user_id', 'by_user_id', { include_docs: true, key : userId });
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
            return Q.allResolved(
                Q.nfcall(self.db.insert, { 
                    language : 'javascript',
                    views    : 
                        { "num_upvotes_by_post": 
                            { 
                                'map'    : function(doc) {
                                    if (doc.type === 'vote' && doc.positive) {
                                        emit(doc.postId, 1); 
                                    }
                                },
                                'reduce' : function (key, values) {
                                   return sum(values);
                                }
                            } 
                        }
                  }, '_design/num_upvotes_by_post'),
                  Q.nfcall(self.db.insert, { 
                    language : 'javascript',
                    views    : 
                        { "by_user_id": 
                            { 
                                'map'    : function(doc) {
                                    if (doc.type === 'user') {
                                        emit(doc.userId, null); 
                                    }
                                }
                            } 
                        }
                  }, '_design/by_user_id'),                  
                  Q.nfcall(self.db.insert, { 
                      language : 'javascript',
                      views    : 
                          { "num_downvotes_by_post": 
                              { 
                                  'map'    : function(doc) {
                                      if (doc.type === 'vote' && !doc.positive) {
                                          emit(doc.postId, 1); 
                                      }
                                  },
                                  'reduce' : function (key, values) {
                                     return sum(values);
                                  }
                              } 
                          }
                    }, '_design/num_downvotes_by_post')
            );               
        }
    };
    return self;
};

})();