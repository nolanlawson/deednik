/*
 * Handles signups/logins
 */

"use strict";

angular.module('deednik').controller('SignupLoginController', ['$scope', 'restServer', 'session', 'constants',
            function($scope, restServer, session, constants){

    $scope.alreadyHaveAccount = false; // default to false for now
    $scope.username = "";
    $scope.password = "";
    $scope.confirmPassword = "";
    $scope.session = session;
    $scope.constants = constants;

    // warning that the signin failed
    $scope.signinWarning = false;

    // warning that the passwords are mismatched
    $scope.passwordMatchWarning = function() {
        return !$scope.alreadyHaveAccount &&
            $scope.password !== $scope.confirmPassword;
    };

    // warning that the password is too short
    $scope.passwordLengthWarning = function() {
        return !$scope.passwordMatchWarning() &&
            !$scope.alreadyHaveAccount &&
            (!$scope.password || $scope.password.length < constants.MIN_PASSWORD_LENGTH);
    };

    $scope.$watch('username + password + confirmPassword', function(){
        $scope.signinWarning = false;
    });

    $scope.submit = function() {

        if ($scope.passwordMatchWarning() || $scope.passwordLengthWarning()) {
            return;
        }

        $scope.submitting = true;

        restServer.signupOrLogin($scope.username, $scope.password, $scope.alreadyHaveAccount)
            .success(function(data){
                if (data && data.success) {
                    $scope.signinWarning = false;
                    session.loggedIn = true;
                    session.username = data.username;
                    jQuery('#signup-login-modal').modal('hide'); // TODO: move this to directive
                } else {
                    $scope.signinWarning = true;
                }
                $scope.submitting = false;
            })
            .error(function(err){
                console.log("error: " + err);
                $scope.submitting = false;
            });
    };


}]);