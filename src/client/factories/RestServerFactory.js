/*
 * Service for interacting with the server.  Makes $http less of a pain
 */

"use strict";

angular.module('one-good-turn').factory('restServer', ['$http', function ($http) {

    return {
        findLastPosts : function(n) {

            return $http({
                method : 'GET',
                url    : '/jsapi-v1/findLastPosts',
                params   : {n : (n || 10)}
            });
        },

        findPostsByTimestampSince : function(timestamp, limit) {
            return $http({
                method : 'GET',
                url    : '/jsapi-v1/findPostsByTimestampSince',
                params : {timestamp : timestamp, limit : (limit || 10)}
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
        }
    };

}]);