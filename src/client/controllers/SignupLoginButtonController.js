"use strict";

angular.module('deednik').controller('SignupLoginButtonController', ['$scope', 'restServer', 'session',
        function($scope, restServer, session){


            $scope.session = session;

            $scope.logout = function() {
                restServer.logout()
                    .success(function(){
                        // doesn't matter whether data says success or error; user can be considered logged out
                        // if the server responded
                        session.loggedIn = false;
                    })
                    .error(function(err){
                        console.log("error: " + err);
                    });
            };

}]);