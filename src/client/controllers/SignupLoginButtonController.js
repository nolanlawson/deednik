"use strict";

angular.module('deednik').controller('SignupLoginButtonController', ['$scope', 'restServer', 'session',
        function($scope, restServer, session){


            $scope.session = session;

            $scope.logout = function() {
                restServer.logout()
                    .success(function(data){
                        if (data && data.success) {
                            session.loggedIn = false;
                        }
                    })
                    .error(function(err){console.log("error: " + err);});
            };

}]);