/* 
 * Initial views to be added to CouchDB.
 * TODO: handle migrations
*/
/*global module emit sum*/
(function() {

    "use strict";
    
    module.exports = [{
        name: 'num_upvotes_by_post',
        map : function(doc) {
            if (doc.type === 'vote' && doc.positive) {
                emit(doc.postId, 1);
            }
        },
        reduce : function(key, values) {
            return sum(values);
        }
    }, {
        name: 'num_downvotes_by_post',
        map: function(doc) {
            if (doc.type === 'vote' && !doc.positive) {
                emit(doc.postId, 1);
            }
        },
        reduce: function(key, values) {
            return sum(values);
        }
    }, {
        name: 'by_user_guid',
        map: function(doc) {
            if (doc.type === 'user' && doc.userGuid) {
                emit(doc.userGuid, null);
            }
        }
    }];
    
})();