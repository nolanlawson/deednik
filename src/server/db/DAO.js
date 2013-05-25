/*
 * Logic for dealing with the CouchDB database 
*/

"use strict";

var
    // imports
    nano  = require('nano')('http://localhost:5984'),
    Q     = require('q'),
    _     = require('underscore'),
    views = require('./Views.js'),

    // constants
    PRODUCTION_DB_NAME = 'onegoodturn'
    ;

function DAO(options) {

    var self = this;

    var dbName = options.production ?
            PRODUCTION_DB_NAME :
            'unit_test_' + new Date().getTime() + "_" + Math.floor((Math.random() * 1000000));

    //
    // private variables
    //
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

    function queryViewAndPromise(viewName, viewParams, returnMultiple, noDoc, defaultValue) {
        var deferred = Q.defer();
        db.view(viewName, viewName, _.extend({include_docs : !noDoc },viewParams), function(err, body) {
            if (err) {
                deferred.reject(new Error(err));
            } else if (!(body && body.rows && (returnMultiple || (body.rows[0] && (noDoc || body.rows[0].doc))))) {
                if (defaultValue) {
                    deferred.resolve(defaultValue);
                } else {
                    deferred.reject(new Error("unacceptable body received: " + JSON.stringify(body)));
                }
            } else if (returnMultiple) {
                if (noDoc) {
                    // can't be sure there aren't some nulls in here, since this is
                    // probably a reduce-type view, so make a map of keys to values
                    var lookup = _.object(body.rows.map(function(element){return [element.key, element.value];}));
                    deferred.resolve(viewParams.keys.map(function(key){
                        return lookup[key] || defaultValue;
                    }));
                } else {
                    deferred.resolve(body.rows.map(function(element){
                        return element.doc;
                    }));
                }
            } else {
                deferred.resolve(noDoc ? body.rows[0].value : body.rows[0].doc);
            }
        });

        return deferred.promise;
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
        }).done();
    };

    /* delete (drop) the database */
    self.destroy = function() {

        console.log('destroying ' + dbName);
        nano.db.destroy(dbName, function() {
            console.log('destroyed ' + dbName);
            self.destroyed = true;
        });
    };

    /*
     * Save an object, hibernate style: save the object and then set the generated id and rev.
     * Returns a promise of the object.
    */
    self.save = function(object) {

        var deferred = Q.defer();

        Q.nfcall(db.insert, object).
        then(function(body) {
            if (body && body[0] && body[0].ok) {
                object._id = body[0].id;
                object._rev = body[0].rev;
                deferred.resolve(object);
            } else {
                deferred.reject(new Error('improper body object: ' + JSON.stringify(body)));
            }
        }, function(err) {
            deferred.reject(new Error('save error: ' + err));
        }).done();

        return deferred.promise;
    };

    /*
     * returns a promise for the object body
     */
    self.findById = function(id) {
        var deferred = Q.defer();
        db.get(id, { revs_info: false }, function(err, body) {
            if (err) {
                deferred.reject(new Error(err));
            } else if (!body) {
                deferred.reject(new Error("unacceptable body received"));
            } else {
                deferred.resolve(body);
            }
        });
        return deferred.promise;
    };

    /*
     * deletes the object from couchdb based on the _id and _rev.
     * sets "deleted" on the object
     */
    self.remove = function(object) {
        db.destroy(object._id, object._rev, function(err){
            if (err) {
                console.log('unable to remove object: ' + err);
            } else {
                object.deleted = true;
            }
        });
    };


    /*
     * returns a promise for the object body
     */
    self.findUserByUserGuid = function(userGuid) {
        return queryViewAndPromise('by_user_guid', {key : userGuid});
    };

    /*
     * returns a promise for the object body, or error if it doesn't exist
     */
    self.findVoteByUserIdAndPostId = function(userId, postId) {
        return queryViewAndPromise('by_user_id_and_post_id', {key : [userId, postId]});
    };

    /*
     * returns a list of promises for the votes, or empty if there are none
     */
    self.findVotesByUserIdAndPostIds = function(userId, postIds) {
        var keys = _.map(postIds, function(postId){
            return [userId, postId];
        });
        return queryViewAndPromise('by_user_id_and_post_id', {keys : keys}, true);
    };

     /*
      * returns a promise for a list of posts
      */
    self.findPostsByTimestampSince = function(timestamp, limit) {
        var params = {endkey : timestamp, descending : true, limit : (limit || 10)};
        return queryViewAndPromise('by_timestamp', params, true);
    };

    /*
     * returns a promise for a list of posts
     */
    self.findPostsByTimestampBefore = function(timestamp, limit) {
        var params = {startkey : timestamp - 1, descending : true, limit : (limit || 10)};
        return queryViewAndPromise('by_timestamp', params, true);
    };

    /* returns the last 5 timestamps
     *
     */
    self.findLastPosts = function(limit) {
        return queryViewAndPromise('by_timestamp', {descending : true, limit : (typeof limit === 'undefined' ? 10 : limit)}, true);
    };

    /*
     * accepts either a single post id or a list of post ids
     * returns either an array of PostDetail object promises or a single PostDetail object promise
     * the details object looks like this: {posCount : 2, negCount : 0}
     *
     */
    self.findPostDetails = function(postId) {

        var defaultValue = {posCount : 0, negCount : 0};

        if (postId instanceof Array) {
            // check multiple ids
            return queryViewAndPromise('post_details', {keys : postId, reduce : true, group : true},
                true, true, defaultValue);
        } else {
            // check single id
            return queryViewAndPromise('post_details', {key : postId, reduce : true, group : true},
                false, true, defaultValue);
        }
    };
}

module.exports = DAO;
