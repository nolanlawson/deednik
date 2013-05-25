/* represents post content that the user types into the textarea */

"use strict";

function NewPost() {
    this.content = null;
}

NewPost.prototype.getLength = function() {
    return this.content ? this.content.length : 0;
};

angular.module('one-good-turn').service('newPost', ['restServer', NewPost]);