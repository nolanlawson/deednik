/*
 * Keeps track of the session that the user is in (i.e. logged in, logged out)
 */

"use strict";

function SessionService(restServer, constants, $cookieStore) {

    var self = this;

    self.$cookieStore = $cookieStore;
    self.lastUsername = $cookieStore.get('deednik-username');

    function checkLoggedIn() {
        restServer.session()
            .success(function(data){
                if (data.success) {
                    // server sez we're logged in
                    self.login(data.username);
                } else {
                    // server sez we got logged out!
                    self.logout();
                }
            })
            .error(function(err){console.log("error: "+ err);});
    }

    checkLoggedIn();

    setInterval(checkLoggedIn, constants.SESSION_CHECK_INTERVAL);
}

SessionService.prototype.login = function(username){
    this.loggedIn = true;
    this.username = username;
    this.$cookieStore.put('deednik-username', username); // save the last username for quicker sign-in later
    this.lastUsername = username;
};

SessionService.prototype.logout = function(){
    this.loggedIn = false;
};


angular.module('deednik').service('session', ['restServer', 'constants', '$cookieStore', SessionService]);

