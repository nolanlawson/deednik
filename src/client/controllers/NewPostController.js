/*
 * Main AngularJS Controller
 */


"use strict";

angular.module('one-good-turn').controller('NewPostController',
    ['$scope', '$rootScope', 'restServer', 'constants', 'recentPosts', 'newPost',
        function ($scope, $rootScope, restServer, constants, recentPosts, newPost) {


    $scope.recentPosts = recentPosts;
    $scope.randomPlaceholder = (constants.PLACEHOLDERS[_.random(0, constants.PLACEHOLDERS.length - 1)]) + ", etc.";
    $scope.newPost = newPost;

    // fixes problem of animation running on initial page load
    $scope.initialClick = false;
    $scope.$watch('postContent', function () {
        $scope.initialClick = true;
    });

    // callbacks
    $scope.showLengthWarning = function () {
        return !$scope.showLengthError() && newPost.getLength() > constants.MAX_CONTENT_LENGTH - 10;
    };

    $scope.showLengthError = function () {
        return newPost.getLength() > constants.MAX_CONTENT_LENGTH;
    };

    $scope.getRemainingCharacters = function () {
        return constants.MAX_CONTENT_LENGTH - newPost.getLength();
    };

    $scope.submit = function () {
        if (newPost.getLength() > 0 && !$scope.showLengthError()) {
            $scope.disabled = true;
            // TODO: post instead of get?

            restServer.insertPost(newPost.content).
                success(function () {
                    window.console.log('posted successfully');
                    newPost.content = '';
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
