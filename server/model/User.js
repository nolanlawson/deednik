/*global module*/
(function(){

"use strict";

function User(userGuid) {
    this.type = "user";
    this.userGuid = userGuid;
}

module.exports = User;

})();