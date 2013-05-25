/*Simple POJO for a user*/
(function(){

"use strict";

var _ = require('underscore');

function User(userGuid) {
    this.type = "user";
    this.userGuid = userGuid;
}

function toHash(obj) {
    return _.pick(obj, 'type', 'userGuid', '_id', '_rev');
}

User.prototype.equals = function(other) {
    return _.isEqual(toHash(this), toHash(other));
};

module.exports = User;

})();