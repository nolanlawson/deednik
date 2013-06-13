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
    $scope.session = session;
    $scope.signinWarning = false;

    $scope.passwordWarning = function() {
        return $scope.password && $scope.confirmPassword && $scope.password !== $scope.confirmPassword;
    };

    $scope.$watch('username + password + confirmPassword', function(){
        $scope.signinWarning = false;
    });

    $scope.submit = function() {

        if ($scope.passwordWarning()) {
            return;
        }


        $scope.submitting = true;
        restServer.signupOrLogin($scope.username, $scope.password, $scope.alreadyHaveAccount)
            .success(function(data){
                if (data && data.success) {
                    $scope.signinWarning = false;
                    session.loggedIn = true;
                    jQuery('#signup-login-modal').modal('hide'); // TODO: move this to directive
                } else {
                    $scope.signinWarning = true;
                }
                $scope.submitting = false;
            })
            .error(function(err){
                console.log("error: " + err);
                $scope.signinWarning = true;
                $scope.submitting = false;
            });
    };


}]);