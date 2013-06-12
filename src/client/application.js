/*
 * Main Angular definitions for 1 Good Turn.
 */

"use strict";

angular.module('deednik', []).
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
            "Cleaned up after myself at a restaurant, even though it's not \"my\" job",
            "Cooked up a mean taco soup for a soup kitchen",
            "Volunteered after school for my kid's PTA",
            "Gave a quarter to a dude who needed bus money"
    ],
    CHECK_INTERVAL : 5000
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