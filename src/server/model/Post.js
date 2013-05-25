/* Simple POJO for a post by a user */

(function(){

"use strict";

var _ = require('underscore');

function Post(content, timestamp) {
    this.type = "post";
    this.content = content;
    this.timestamp = (timestamp || new Date().getTime());
}

function toHash(obj) {
    return _.pick(obj, 'type', 'content', '_id', '_rev');
}

Post.prototype.equals = function(other) {
    return _.isEqual(toHash(this), toHash(other));
};

module.exports = Post;


})();