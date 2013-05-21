/*
 * Super cool socket controller for the stream of user data coming from the client.
 */
/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, browser:true */
/*global angular console moment _*/

(function(){

"use strict";

angular.module('one-good-turn').controller('StreamController', ['$scope', 'socket', function($scope, socket){
    
    // do this whenever the controller is created to request new data
    socket.on('init', function(posts){
        console.log('socket init!');
        $scope.postsToShow.splice(0, $scope.postsToShow.length);
        _.forEach(posts, function(post){
            $scope.postsToShow.push(post);
        });
    });
    
    socket.on('new:post', function(post){
        if (!_.findWhere($scope.postsToShow,{_id : post._id})) {
            $scope.postsToShow.splice(0, 0, post);
        }
    });
    
    $scope.getFriendlyDate = function(post) {
        return moment(post.timestamp).format('MMMM Do YYYY, h:mm a');
    };
    
    
}]);

})();