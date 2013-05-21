/*
 * Main AngularJS Controller
 */
/*global angular _ console*/

(function() {

    "use strict";

    angular.module('one-good-turn').controller('MainController', ['$scope', '$rootScope', '$http', 
            function($scope, $rootScope, $http) {

        $rootScope.MAX_CONTENT_LENGTH = 1024;
        
        if (!$rootScope.postsToShow) {
            $rootScope.postsToShow = [];
        }
        
        if (!$rootScope.postContent) {
            $rootScope.postContent = '';
        }

        // some nice flavor text for the textarea
        var placeholders = [
                "Helped a kitten down from a tree", 
                "Helped an elderly gent across the street", 
                "Gave a ride to a cool hitchhiker dude", 
                "Gave directions to a lost-looking foreign couple", 
                "Grew a gnarly Movember 'stache to raise money for prostate cancer", 
                "Cleaned up after myself at a fast-food place", 
                "Cooked up a mean taco soup for a soup kitchen", 
                "Volunteered after school for my kid's PTA", 
                "Gave a quarter to a dude who needed bus money"
        ];

        $scope.randomPlaceholder = (placeholders[_.random(0, placeholders.length - 1)]) + ", etc.";


        // fixes problem of animation running on initial page load
        $scope.initialClick = false;
        $scope.$watch('postContent', function() {
            $scope.initialClick = true;
        });

        // callbacks
        $scope.showLengthWarning = function() {
            return !$scope.showLengthError() && $scope.postContent.length > $scope.MAX_CONTENT_LENGTH - 10;
        };

        $scope.showLengthError = function() {
            return $scope.postContent.length > $scope.MAX_CONTENT_LENGTH;
        };

        $scope.getRemainingCharacters = function() {
            return $scope.MAX_CONTENT_LENGTH - $scope.postContent.length;
        };

        $scope.submit = function() {
            if ($scope.postContent.length > 0 && $scope.postContent.length < $scope.MAX_CONTENT_LENGTH) {
                $scope.disabled = true;
                // TODO: post instead of get?
                var url = '/jsapi-v1/insertPost?postContent=' + encodeURIComponent($scope.postContent);
                $http({
                    method: 'GET',
                    url: url
                }).
                success(function() {
                    console.log('posted successfully');
                    $rootScope.postContent = '';
                    $scope.disabled = false;
                }).
                error(function(data, status, headers, config) {
                    // todo: handle a fail more gracefully
                    console.log('failed to post, got args: ' + JSON.stringify([data, status, headers, config]));
                    $scope.disabled = false;
                });
            }
        };
    }]);

})();
