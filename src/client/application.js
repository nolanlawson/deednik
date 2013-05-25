/*
 * Main Angular definitions for 1 Good Turn.
 */

"use strict";

angular.module('one-good-turn', []).
constant('constants', {
    // max post size
    MAX_CONTENT_LENGTH : 1024,
    // some nice flavor text for the textarea
    PLACEHOLDERS : [
            "Helped a kitten down from a tree",
            "Helped an elderly gent across the street",
            "Gave a ride to a cool hitchhiker dude",
            "Gave directions to a lost-looking foreign couple",
            "Grew a gnarly Movember 'stache to raise money for prostate cancer",
            "Cleaned up after myself at a fast-food place",
            "Cooked up a mean taco soup for a soup kitchen",
            "Volunteered after school for my kid's PTA",
            "Gave a quarter to a dude who needed bus money"
    ]
}).
config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    when('/home', {
        templateUrl : 'partials/home.html'
    }).
    when('/about', {
        templateUrl : 'partials/about.html'
    }).    
    otherwise({
        redirectTo : '/home'
    });
}]);