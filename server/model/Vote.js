/*global module*/
(function(){

"use strict";

function Vote(positive, userId, postId) {
    this.type = "vote";
    this.positive = positive;
    this.userId = userId;
    this.postId = postId;
}

module.exports = Vote;

})();