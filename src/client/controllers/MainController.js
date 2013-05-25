/*
 * Main AngularJS Controller
 */


"use strict";

angular.module('one-good-turn').controller('MainController',
    ['$scope', '$rootScope', 'restServer', 'constants', 'recentPosts',
        function ($scope, $rootScope, restServer, constants, recentPosts) {


    $scope.recentPosts = recentPosts;

    $scope.randomPlaceholder = (constants.PLACEHOLDERS[_.random(0, constants.PLACEHOLDERS.length - 1)]) + ", etc.";


    // fixes problem of animation running on initial page load
    $scope.initialClick = false;
    $scope.$watch('postContent', function () {
        $scope.initialClick = true;
    });

    function getPostLength() {
        return $rootScope.postContent ? $rootScope.postContent.length : 0;
    }

    // callbacks
    $scope.showLengthWarning = function () {
        return !$scope.showLengthError() && getPostLength() > constants.MAX_CONTENT_LENGTH - 10;
    };

    $scope.showLengthError = function () {
        return getPostLength() > constants.MAX_CONTENT_LENGTH;
    };

    $scope.getRemainingCharacters = function () {
        return constants.MAX_CONTENT_LENGTH - getPostLength();
    };

    $scope.submit = function () {
        if (getPostLength() > 0 && !$scope.showLengthError()) {
            $scope.disabled = true;
            // TODO: post instead of get?

            restServer.insertPost($scope.postContent).
                success(function () {
                    window.console.log('posted successfully');
                    $rootScope.postContent = '';
                    $scope.disabled = false;
                }).
                error(function (data, status, headers, config) {
                    // todo: handle a fail more gracefully
                    window.console.log('failed to post, got args: ' + JSON.stringify([data, status, headers, config]));
                    $scope.disabled = false;
                });
        }
    };
}]);
