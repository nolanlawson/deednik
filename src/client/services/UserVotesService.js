/* represents votes the user has made on posts.  needs to be synced with CouchDB
 * TODO: do this in something like PouchDB instead */

"use strict";

function UserVotes(restServer) {
    var self = this;

    var CHECK_INTERVAL = 2000;

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
    }, CHECK_INTERVAL);
}

UserVotes.prototype.getOpinion = function(postOrPostId) {

    var postId = typeof postOrPostId === 'string' ? postOrPostId : postOrPostId._id;

    return this.votes[postId] || 'neutral';
};

UserVotes.prototype.updateOpinion = function(postOrPostId, opinion) {

    var postId = typeof postOrPostId === 'string' ? postOrPostId : postOrPostId._id;

    var oldOpinion = this.votes[postId];

    this.votes[postId] = opinion;
    this.dirtyVotes[postId] = opinion;

    if (typeof postOrPostId !== 'string') {
        var post = postOrPostId;
        // update for the UI as well, since this is coming from the list of recent posts,
        // not a new post from the same user
        if (oldOpinion !== 'pos' && opinion === 'pos') {
            post.posCount++;
        } else if (oldOpinion !== 'neg' && opinion === 'neg') {
            post.negCount++;
        }

        if (oldOpinion === 'neg' && opinion !== 'neg') {
            post.negCount--;
        } else if (oldOpinion === 'pos' && opinion !== 'pos') {
            post.posCount--;
        }
    }
};

UserVotes.prototype.toggleOpinion = function(post, opinion) {
    var oldOpinion = this.votes[post._id];

    this.updateOpinion(post, oldOpinion === opinion ? 'neutral' : opinion);
};

angular.module('deednik').service('userVotes', ['restServer', UserVotes]);