/*Simple POJO for a vote from a user on a post */
(function(){

"use strict";

var _ = require('underscore');

function Vote(positive, userId, postId) {
    this.type = "vote";
    this.positive = positive;
    this.userId = userId;
    this.postId = postId;
}

function toHash(obj) {
    return _.pick(obj, 'type', 'positive', 'userId', 'postId', '_id', '_rev');
}

Vote.prototype.equals = function(other) {
    return _.isEqual(toHash(this), toHash(other));
};

module.exports = Vote;

})();