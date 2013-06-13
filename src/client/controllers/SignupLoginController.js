/*
 * Handles signups/logins
 */

"use strict";

angular.module('deednik').controller('SignupLoginController', ['$scope', 'restServer', 'session', 'sharedConstants',
            function($scope, restServer, session, sharedConstants) {

    $scope.alreadyHaveAccount = (session.lastUsername && true);
    $scope.username = session.lastUsername || "";
    $scope.password = "";
    $scope.confirmPassword = "";
    $scope.session = session;
    $scope.sharedConstants = sharedConstants;

    // warning that the signin failed
    $scope.signinWarning = false;

    // warning that the passwords are mismatched
    $scope.passwordMatchWarning = function() {
        return !$scope.alreadyHaveAccount &&
            $scope.password !== $scope.confirmPassword;
    };

    // warning that the password is too short
    $scope.passwordLengthWarning = function() {
        return $scope.clickedOnce && !$scope.passwordMatchWarning() &&
            !$scope.alreadyHaveAccount &&
            (!$scope.password || $scope.password.length < sharedConstants.MIN_PASSWORD_LENGTH ||
                $scope.password.length > sharedConstants.MAX_PASSWORD_LENGTH);
    };

    $scope.$watch('username + password + confirmPassword', function(){
        $scope.signinWarning = false;
    });

    $scope.submit = function() {

        $scope.clickedOnce = true;

        if ($scope.passwordMatchWarning() || $scope.passwordLengthWarning()) {
            return;
        }

        $scope.submitting = true;

        restServer.signupOrLogin($scope.username, $scope.password, $scope.alreadyHaveAccount)
            .success(function(data){
                if (data && data.success) {
                    $scope.signinWarning = false;
                    session.login(data.username);
                    jQuery('#signup-login-modal').modal('hide'); // TODO: move this to directive
                } else {
                    $scope.signinWarning = true;
                    $scope.lastSigninError = getErrorText(data);
                }
                $scope.submitting = false;
            })
            .error(function(err){
                console.log("error: " + err);
                $scope.submitting = false;
            });
    };

    function getErrorText(data) {

        if (data && data.error) {

            if (_.isString(data.error)) {
                // passport error
                return data.error;
            } else if (_.isObject(data.error)) {
                // express validation error
                var firstKey = _.keys(data.error)[0];
                if (firstKey && _.contains(_.keys(sharedConstants.ERRORS.PARAMETER), firstKey)) {
                    return sharedConstants.ERRORS.PARAMETER[firstKey];
                }
            }

        }

        return sharedConstants.ERRORS.UNKNOWN;
    }


}]);