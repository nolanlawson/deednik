/*Simple POJO for a user*/

"use strict";

var _ = require('underscore');

function User(userDef) {
    this.type = "user";

    if (typeof userGuid === "string") {
        this.userGuid = userDef; // simple string userguid
    } else { // map
        this.userGuid = userDef.userGuid;
        this.digest = userDef.digest;
        this.salt = userDef.salt;
    }
}

function toHash(obj) {
    return _.pick(obj, 'type', 'userGuid', '_id', '_rev');
}

User.prototype.equals = function(other) {
    return _.isEqual(toHash(this), toHash(other));
};

module.exports = User;