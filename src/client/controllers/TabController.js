/*
 * TabController to handle the tab navigation
 */

(function(){

"use strict";

angular.module('one-good-turn').controller('TabController', [ '$scope', '$location', function($scope, $location){
    
    function Tab(id, title) {
        this.id = id;
        this.title = title;
    }
    
    Tab.prototype.getHref = function(){
        return '#' + this.id;
    };
    
    $scope.tabs = [
            new Tab('home', 'Home'),
            new Tab('about', 'About')
        ];
    $scope.selectedTabId = $location.path() === '/about' ? 'about' : 'home';
    
}]);

})();