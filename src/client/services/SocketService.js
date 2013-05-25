/*
 * Super cool web socket service!  Thanks HTML5rocks docs!
 * @see http://www.html5rocks.com/en/tutorials/frameworks/angular-websockets/
 */
(function() {

"use strict";

angular.module('one-good-turn').factory('socket', ['$rootScope', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
}]);

})();