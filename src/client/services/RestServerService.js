/*
 * Service for interacting with the server.  Makes $http less of a pain
 */

"use strict";

angular.module('one-good-turn').factory('restServer', ['$http', function ($http) {

    return {
        findLastPosts : function(n) {

            return $http({
                method : 'GET',
                url    : '/jsapi-v1/findLastPosts?n=' + encodeURIComponent(n || 10)
            });
        },

        findPostsByTimestampSince : function(timestamp, limit) {
            return $http({
                method : 'GET',
                url    : '/jsapi-v1/findPostsByTimestampSince?timestamp=' +
                    encodeURIComponent(timestamp) + '&limit=' + encodeURIComponent(limit || 10)
            });
        },

        findPostsByTimestampBefore : function(timestamp, limit) {
            return $http({
                method : 'GET',
                url    : '/jsapi-v1/findPostsByTimestampBefore?timestamp=' +
                    encodeURIComponent(timestamp) + '&limit=' + encodeURIComponent(limit || 10)
            });
        },

        insertPost : function(postContent) {
            var url = '/jsapi-v1/insertPost?postContent=' + encodeURIComponent(postContent);
            return $http({
                method: 'GET',
                url: url
            });
        }
    };

}]);