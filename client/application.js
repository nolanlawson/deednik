/*
 * Main Angular definitions for 1 Good Turn.
 */
/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, browser:true */ 
/*global angular*/
(function() {

"use strict";
    
angular.module('one-good-turn', []).
config(['$routeProvider', function($routeProvider){
    $routeProvider.
    when('/home', {
        controller  : 'MainController',
        templateUrl : 'partials/home.html'
    }).
    when('/about', {
        controller  : 'MainController',
        templateUrl : 'partials/about.html'
    }).    
    otherwise({
        redirectTo : '/home'
    });
}]);

})();