/*
 * Service for interacting with the server.  Makes $http less of a pain
 */
/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, browser:true */
/*global angular*/
(function() {

    "use strict";

    angular.module('one-good-turn').factory('server', ['$http', function ($http) {

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
})();