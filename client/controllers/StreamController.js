/*
 * Super cool socket controller for the stream of user data coming from the client.
 */
/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, browser:true */
/*global angular console moment*/

(function(){

"use strict";

angular.module('one-good-turn').controller('StreamController', ['$scope', 'socket', function($scope, socket){
    
    $scope.postsToShow = [];
    
    // do this whenever the controller is created to request new data
    socket.emit('request:refresh', {});
    
    socket.on('init', function(){
        console.log('socket init!');
    });
    
    socket.on('get:refresh', function(posts){
        console.log('socket refresh!');
        $scope.postsToShow = posts;
    });
    
    socket.on('new:post', function(post){
        $scope.postsToShow.splice(0, 0, post);
    });
    
    $scope.getFriendlyDate = function(post) {
        return moment(post.timestamp).format('MMMM Do YYYY, h:mm a');
    };
    
    
}]);

})();