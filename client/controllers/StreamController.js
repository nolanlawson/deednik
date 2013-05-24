/*
 * Super cool socket controller for the stream of user data coming from the client.
 */
/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, browser:true */
/*global angular console moment _*/

(function(){

"use strict";

angular.module('one-good-turn').controller('StreamController', ['$scope', 'socket', 'server',
            function($scope, socket, server){
    
    // do this whenever the controller is created to request new data
    socket.on('init', function(){
        console.log('socket init!');
    });
    
    socket.on('new:post', function(post){
        if (!_.findWhere($scope.recentPosts,{_id : post._id})) {
            $scope.recentPosts.splice(0, 0, post);
        }
    });
    
    $scope.getFriendlyDate = function(post) {
        return moment(post.timestamp).format('MMMM Do YYYY, h:mm a');
    };

    $scope.loadMore = function() {
        $scope.loadingMore = true;
        server.findPostsByTimestampBefore(_.last($scope.recentPosts).timestamp).
        success(function(response){
                _.forEach(response.rows, function(post) {
                    $scope.recentPosts.push(post);
                });
                $scope.loadingMore = false;
        }).
        error(function(){
                window.console.log('error fetching posts...');
                $scope.loadingMore = false;
        });
    };

    
}]);

})();