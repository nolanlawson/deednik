/*
 * Super cool socket controller for the stream of user data coming from the client.
 */


"use strict";

angular.module('one-good-turn').controller('StreamController',
    ['$rootScope', '$scope', 'socket', 'restServer', 'recentPosts',
            function($rootScope, $scope, socket, restServer, recentPosts){
    
    // do this whenever the controller is created to request new data
    socket.on('init', function(){
        console.log('socket init!');
    });
    
    socket.on('new:post', function(post){
        recentPosts.addToFront(post);
    });
    
    $scope.getFriendlyDate = function(post) {
        return moment(post.timestamp).format('MMMM Do YYYY, h:mm a');
    };

    $scope.loadMore = function() {
        $scope.loadingMore = true;
        restServer.findPostsByTimestampBefore(_.last(recentPosts.list).timestamp).
        success(function(response){
                _.forEach(response.rows, function(post) {
                    recentPosts.addToBack(post);
                });
                $scope.loadingMore = false;
                recentPosts.exhausted = response.exhausted;
        }).
        error(function(){
                window.console.log('error fetching posts...');
                $scope.loadingMore = false;
                recentPosts.exhausted = false;
        });
    };

    
}]);