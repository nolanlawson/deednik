/*
 * Keeps track of the session that the user is in (i.e. logged in, logged out)
 */

"use strict";

function SessionService(restServer, constants) {

    var self = this;

    function checkLoggedIn() {
        restServer.session()
            .success(function(data){
                self.loggedIn = data && data.success;
                self.username = data && data.username;
            })
            .error(function(err){console.log("error: "+ err);});
    }

    checkLoggedIn();

    setInterval(checkLoggedIn, constants.SESSION_CHECK_INTERVAL);
}

angular.module('deednik').service('session', ['restServer', 'constants', SessionService]);

