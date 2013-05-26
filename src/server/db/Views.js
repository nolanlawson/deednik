/* 
 * Initial views to be added to CouchDB.
 * TODO: handle migrations
*/

"use strict";

module.exports = [{
    name: 'num_upvotes_by_post',
    map : function(doc) {
        if (doc.type === 'vote' && doc.opinion === "pos") {
            emit(doc.postId, 1);
        }
    },
    reduce : function(key, values) {
        return sum(values);
    }
}, {
    name: 'num_downvotes_by_post',
    map: function(doc) {
        if (doc.type === 'vote' && doc.opinion === "neg") {
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
}, {
    name: 'by_user_id_and_post_id',
    map: function(doc) {
        if (doc.type === 'vote' && doc.userId && doc.postId) {
            emit([doc.userId, doc.postId], null);
        }
    }
}, {
    name : 'by_timestamp',
    map : function(doc) {
        if (doc.type === 'post' && doc.timestamp) {
            emit(doc.timestamp, null);
        }
    }
}, {
    name : 'post_details_v2',
    map : function(doc) {
        if (doc.type === 'vote' && doc.postId) {
            emit(doc.postId, {
                posCount : (doc.opinion === "pos" ? 1 : 0),
                negCount : (doc.opinion === "neg" ? 1 : 0)
            });
        }
    },
    reduce : function (key, values) {
        var result = {
            posCount : 0,
            negCount  : 0
        };
        for (var i = 0; i < values.length ; i++) {
            var value = values[i];
            result.posCount = result.posCount + value.posCount;
            result.negCount = result.negCount + value.negCount;
        }
        return result;
    }
}, {
    name : 'by_user_and_post',
    map : function(doc) {
        if (doc.type === 'vote' && doc.userId && doc.postId) {
            emit([doc.userId, doc.postId], null);
        }
    }
}, {
    name : 'votes_by_user_id',
    map : function(doc) {
        if (doc.type === 'vote' && doc.userId) {
            emit(doc.userId, null);
        }
    }
}, {
    name : 'count_type',
    map : function(doc) {
        emit(doc.type, 1);
    },
    reduce : function(key, values) {
        return sum(values);
    }
}
];
