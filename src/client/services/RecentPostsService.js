/*
 * Service representing the list of recent posts shown in the main view.
 */

"use strict";

function RecentPosts(restServer) {
    var self = this;
    this.list = [];
    this.exhausted = false;

    restServer.findLastPosts().
        success(function(response){
            self.list.splice(0, self.list.length);
            _.forEach(response.rows, function(post){
                self.list.push(post);
            });
        }).
        error(function(data, status, headers, config) {
            // TODO: handle a fail more gracefully
            window.console.log('failed to get, got args: ' + JSON.stringify([data, status, headers, config]));
        });
}

RecentPosts.prototype.addToFront = function(post) {
    if (!_.findWhere(this.list,{_id : post._id})) {
        this.list.splice(0, 0, post);
    }
};

RecentPosts.prototype.addToBack = function(post) {
    if (!_.findWhere(this.list,{_id : post._id})) {
        this.list.push(post);
    }
};
angular.module('deednik').service('recentPosts', ['restServer', RecentPosts]);

