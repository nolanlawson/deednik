/*global module require*/
(function(){

"use strict";

var _ = require('underscore');

function Post(content) {
    this.type = "post";
    this.content = content;
}

function toHash(obj) {
    return _.pick(obj, 'type', 'content', '_id', '_rev');
}

Post.prototype.equals = function(other) {
    return _.isEqual(toHash(this), toHash(other));
};

module.exports = Post;


})();