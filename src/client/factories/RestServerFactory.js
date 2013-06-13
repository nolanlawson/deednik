/*
 * Service for interacting with the server.  Makes $http less of a pain
 */

"use strict";

angular.module('deednik').factory('restServer', ['$http', function ($http) {

    return {
        findUserVotes : function() {
            return $http({
                method : 'GET',
                url    : '/jsapi-v1/findUserVotes'
            });
        },
        postUserVotes : function(votes) {
            return $http({
                method : 'POST',
                url    : '/jsapi-v1/postUserVotes',
                data   : {votes : votes}
            });
        },
        findLastPosts : function(n) {

            return $http({
                method : 'GET',
                url    : '/jsapi-v1/findLastPosts',
                params   : {n : (n || 10)}
            });
        },

        findPostsByTimestampBefore : function(timestamp, limit) {
            return $http({
                method : 'GET',
                url    : '/jsapi-v1/findPostsByTimestampBefore',
                params : {timestamp : timestamp, limit : (limit || 10)}
            });
        },

        insertPost : function(postContent) {
            var url = '/jsapi-v1/insertPost';
            return $http({
                method: 'POST',
                url: url,
                data: {postContent : postContent}
            });
        },

        signupOrLogin : function(username, password, login) {
            var url = '/jsapi-v1/signupOrLogin';
            return $http({
                method : 'POST',
                url : url,
                data : {username : username, password : password, login : (login ? "true" : "false")}
            });
        },

        session : function() {
            var url = '/jsapi-v1/session';
            return $http({
                method : 'GET',
                url : url
            });
        },

        logout : function(username, password) {
            var url = '/jsapi-v1/logout';
            return $http({
                method : 'GET',
                url : url
            });
        }


    };

}]);