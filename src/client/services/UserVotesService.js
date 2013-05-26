/* represents votes the user has made on posts.  needs to be synced with CouchDB
 * TODO: do this in something like PouchDB instead */

"use strict";

function UserVotes(restServer) {
    var self = this;

    self.votes = {};
    self.dirtyVotes = {};
    self.postInProgress = false;

    restServer.findUserVotes()
        .success(function(response){
            _.extend(self.votes, _.object(_.map(response.rows, function(vote) {
                return [vote.postId, vote.opinion];
            })));
            //console.info('self.votes is now: ' + JSON.stringify(self.votes));
        }).error(function(data, status, headers, config) {
            // TODO: handle a fail more gracefully
            window.console.log('failed to get, got args: ' + JSON.stringify([data, status, headers, config]));
        });

    // periodically sync back to the server
    setInterval(function() {
        if (!self.postInProgress && _.keys(self.dirtyVotes).length > 0) {
            self.postInProgress = true;
            restServer.postUserVotes(self.dirtyVotes)
                .success(function(response) {
                    if (response.success) {
                        self.dirtyVotes = {};
                    }
                    self.postInProgress = false;
                }).error(function(data, status, headers, config) {
                    // TODO: handle a fail more gracefully
                    self.postInProgress = false;
                    window.console.log('failed to get, got args: ' + JSON.stringify([data, status, headers, config]));
                });

        }
    }, 4000);
}

UserVotes.prototype.getOpinion = function(postId) {
    return this.votes[postId] || 'neutral';
};

UserVotes.prototype.updateOpinion = function(postId, opinion) {
    this.votes[postId] = opinion;
    this.dirtyVotes[postId] = opinion;
};

angular.module('one-good-turn').service('userVotes', ['restServer', UserVotes]);