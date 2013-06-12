/*
 * Handles signups/logins
 */

"use strict";

angular.module('deednik').controller('SignupLoginController', ['$scope', 'restServer', 'session',
            function($scope, restServer, session){

    $scope.alreadyHaveAccount = false; // default to false for now
    $scope.username = "";
    $scope.password = "";
    $scope.confirmPassword = "";

    $scope.passwordWarning = function() {
        return $scope.password && $scope.confirmPassword && $scope.password !== $scope.confirmPassword;
    };

    $scope.submit = function() {

        if ($scope.passwordWarning()) {
            return;
        }

        restServer.signupOrLogin($scope.username, $scope.password, $scope.alreadyHaveAccount)
            .success(function(data){

                if (data && data.success) {
                    $scope.session = true;
                    session.loggedIn = true;
                }
            })
            .error(function(err){
                console.log("error: " + err);
                // todo : handle error
            });
    };


}]);