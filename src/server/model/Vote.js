/*Simple POJO for a vote from a user on a post */

"use strict";

var _ = require('underscore');

function Vote(opinion, userId, postId) {
    this.type = "vote";
    this.opinion = opinion;
    this.userId = userId;
    this.postId = postId;
}

function toHash(obj) {
    return _.pick(obj, 'type', 'opinion', 'userId', 'postId', '_id', '_rev');
}

Vote.prototype.equals = function(other) {
    return _.isEqual(toHash(this), toHash(other));
};

module.exports = Vote;