/*
 * Unit tests for the CouchDB interactions.
 *
 * Here's a script to delete any uncleaned-up databases:
 * for thing in `curl http://localhost:5984/_all_dbs | egrep -o 'unit_test_[^"]+'`; do curl -X DELETE -d '{}' "http://localhost:5984/$thing"; done
 */

"use strict";

var

    Q    = require('q'),
    _    = require('underscore'),

    DAO  = require('../../src/server/db/DAO.js'),
    User = require('../../src/server/model/User.js'),
    Post = require('../../src/server/model/Post.js'),
    Vote = require('../../src/server/model/Vote.js'),
    Functions = require('../../src/server/util/Functions.js')
    ;

var dao;

beforeEach(function(){
    // create the database and check that it's initialized
    runs(function(){
        dao = new DAO({production : false});
        expect(dao.initialized).toBe(false);
        dao.init();
    });

    waitsFor(function(){
        return dao.initialized;
    }, "DAO never ititialized", 5000);

    runs(function(){
        expect(dao.initialized).toBe(true);
    });
});

afterEach(function(){
    // destroy the database we used for the tests

    runs(function(){
        dao.destroy();
    });

    waitsFor(function(){
        return dao.destroyed;
    }, "DAO never destroyed", 5000);

    runs(function(){
        expect(dao.destroyed).toBe(true);
    });
});

describe("DAO test suite", function() {

    it("saves users, posts, and votes to the database", function() {
        var self = this;

        var checkedZeroCount = false;

        runs(function(){
            Q.all([
                    dao.countType('user'),
                    dao.countType('post'),
                    dao.countType('vote')
                ]).spread(function(userCount, postCount, voteCount) {
                    expect(userCount).toEqual(0);
                    expect(postCount).toEqual(0);
                    expect(voteCount).toEqual(0);
                    checkedZeroCount = true;
                }, Functions.failTest(self));
        });


        waitsFor(function(){return checkedZeroCount;}, 'checkedZeroCount', 5000);

        var user = new User('fooId');
        var post = new Post('foo');
        var vote;

        expect(user._id).not.toBeDefined();
        expect(user._rev).not.toBeDefined();
        expect(post._id).not.toBeDefined();
        expect(post._rev).not.toBeDefined();

        runs(function() {
            dao.save(user);
            dao.save(post);
        });

        waitsFor(function(){
            return user._id && post._id;
        }, "user._id or post._id never added", 5000);

        runs(function(){
            vote = new Vote("pos", user._id, post._id);

            expect(vote._id).not.toBeDefined();
            expect(vote._rev).not.toBeDefined();

            dao.save(vote);
        });

        waitsFor(function(){
            return vote._id;
        }, "vote._id never added", 5000);

        runs(function(){
            expect(user._id).toEqual(jasmine.any(String));
            expect(user._rev).toEqual(jasmine.any(String));
            expect(post._id).toEqual(jasmine.any(String));
            expect(post._rev).toEqual(jasmine.any(String));
            expect(vote._id).toEqual(jasmine.any(String));
            expect(vote._rev).toEqual(jasmine.any(String));
        });

        var checkedNonZeroCount = false;

        runs(function(){
            Q.all([
                    dao.countType('user'),
                    dao.countType('post'),
                    dao.countType('vote')
                ]).spread(function(userCount, postCount, voteCount) {
                    expect(userCount).toEqual(1);
                    expect(postCount).toEqual(1);
                    expect(voteCount).toEqual(1);
                    checkedNonZeroCount = true;
                }, Functions.failTest(self));
        });

        waitsFor(function(){return checkedNonZeroCount;}, 'checkedNonZeroCount', 5000);

        var checked = false;

        //waitsFor(function(){return false;}, 'sleep', 3000000);

        runs(function(){

            Q.all([
                    dao.findById(user._id),
                    dao.findUserByUserGuid(user.userGuid),
                    dao.findById(post._id),
                    dao.findPostsByTimestampSince(post.timestamp, 10),
                    dao.findVoteByUserIdAndPostId(user._id, post._id),
                    dao.findById(vote._id)
                ]).spread(function(fetchedUser1, fetchedUser2, fetchedPost, fetchedPosts, fetchedVote1, fetchedVote2) {
                    expect(user.equals(fetchedUser1)).toBe(true);
                    expect(user.equals(fetchedUser2)).toBe(true);
                    expect(post.equals(fetchedPost)).toBe(true);
                    expect(fetchedPosts.length).toBe(1);
                    expect(vote.equals(fetchedVote1)).toBe(true);
                    expect(vote.equals(fetchedVote2)).toBe(true);
                    checked = true;
                }).then(console.log, function(err){
                    console.log('got error in chain: ' + err);
                }).done();
        });

        waitsFor(function(){return checked;}, "never checked", 5000);

    });

    it("deletes users, votes, and posts from the database", function() {
        var self = this;

        var user = new User('fooId');
        var post = new Post('blah blah blah');
        var vote;

        runs(function() {
            dao.save(user);
            dao.save(post);
        });

        waitsFor(function(){
            return user._id && post._id;
        }, "user._id or post._id never added", 5000);

        runs(function(){
            vote = new Vote("pos", user._id, post._id);
            dao.save(vote);
        });

        waitsFor(function(){
            return vote._id;
        }, "vote._id never added", 5000);

        runs(function(){
            dao.remove(user);
            dao.remove(post);
            dao.remove(vote);
        });

        waitsFor(function(){
            return user.deleted && post.deleted && vote.deleted;
        });

        var doneCount = 0;

        runs(function(){
            expect(user.deleted).toBe(true);
            expect(post.deleted).toBe(true);
            expect(vote.deleted).toBe(true);

            dao.findUserByUserGuid(user.userGuid).then(function(){
                self.fail(new Error('user not deleted'));
            }, function(err){
                expect(err).not.toBe(null);
                doneCount++;
            }).done();

            dao.findById(user._id).then(function(){
                self.fail(new Error('user not deleted'));
            }, function(err){
                expect(err).not.toBe(null);
                doneCount++;
            }).done();

            dao.findById(post._id).then(function(){
                self.fail(new Error('post not deleted'));
            }, function(err){
                expect(err).not.toBe(null);
                doneCount++;
            }).done();

            dao.findById(vote._id).then(function(){
                self.fail(new Error('vote not deleted'));
            }, function(err){
                expect(err).not.toBe(null);
                doneCount++;
            }).done();

            dao.findVoteByUserIdAndPostId(user._id, post._id).then(function(){
                self.fail(new Error('vote not deleted'));
            }, function(err){
                expect(err).not.toBe(null);
                doneCount++;
            }).done();

        });

        waitsFor(function(){
            return doneCount === 5;
        }, "doneCount never 5", 5000);
    });

    it("finds multiple posts by timestamp", function() {

        var self = this;

        var post1 = new Post('past', 1300000000);
        var post2 = new Post('present', 1400000000);
        var post3 = new Post('future', 1500000000);

        runs(function() {
            dao.save(post1);
            dao.save(post2);
            dao.save(post3);
        });

        waitsFor(function(){
            return post1._id && post2._id && post3._id;
        }, "post._id never added", 5000);

        //waitsFor(function(){return false;}, 'sleep', 30000);

        var checked = false;

        runs(function(){
            Q.all([
                    dao.findPostsByTimestampSince(0, 10),
                    dao.findPostsByTimestampSince(1299999999, 10),
                    dao.findPostsByTimestampSince(1300000000, 10),
                    dao.findPostsByTimestampSince(1399999999, 10),
                    dao.findPostsByTimestampSince(1400000000, 10),
                    dao.findPostsByTimestampSince(1499999999, 10),
                    dao.findPostsByTimestampSince(1500000000, 10),
                    dao.findPostsByTimestampSince(1500000001, 10),
                    dao.findPostsByTimestampSince(1600000000, 10),
                    dao.findLastPosts(5),
                    dao.findLastPosts(3),
                    dao.findLastPosts(2),
                    dao.findLastPosts(1),
                    dao.findLastPosts(0),
                    dao.findLastPosts(),
                    dao.findPostsByTimestampBefore(1500000001, 10),
                    dao.findPostsByTimestampBefore(1500000000, 10),
                    dao.findPostsByTimestampBefore(1499999999, 10),
                    dao.findPostsByTimestampBefore(1400000001, 10),
                    dao.findPostsByTimestampBefore(1400000000, 10),
                    dao.findPostsByTimestampBefore(1399999999, 10),
                    dao.findPostsByTimestampBefore(1300000001, 10),
                    dao.findPostsByTimestampBefore(1300000000, 10),
                    dao.findPostsByTimestampBefore(1299999999, 10)
                ]).then(function(results) {
                    expect(results.map(function(element){
                        return element.valueOf().length;
                    })).toEqual([
                            3, 3, 3, 2, 2, 1, 1, 0, 0,
                            3, 3, 2, 1, 0, 3,
                            3, 2, 2, 2, 1, 1, 1, 0, 0]);

                    // make sure they're in descending order
                    expect(results[0].map(function(element){
                        return element.content;
                    })).toEqual(['future', 'present', 'past']);

                    checked = true;

                }, function(err){
                    self.fail(new Error('error in findPostsByTimestampSince: ' + err));
                }).done();
        });

        waitsFor(function(){return checked;});

    });

    it("votes for posts and can show the number of votes and votes per user", function() {

        var self = this;

        var posts = [
            new Post('past', 1300000000),
            new Post('present', 1400000000),
            new Post('future', 1500000000)
        ];

        var users = [
            new User('foo'),
            new User('bar'),
            new User('baz')
        ];

        var savedAll = false;

        runs(function() {
            Q.all(users.concat(posts).map(Functions.save(dao))).then(
                function(){
                    console.log('posts are now: ' + JSON.stringify(posts));
                    console.log('users are now: ' + JSON.stringify(users));
                    savedAll = true;
                },
                Functions.failTest(self));
        });

        waitsFor(function(){
            return savedAll;
        }, "savedAll never true", 5000);

        var checkedIds = false;

        runs(function(){
            console.log('checking ids for users: ' + JSON.stringify(users));
            console.log('get ids: ' + JSON.stringify(_.every(users, Functions.getId())));
            expect(_.every(users, Functions.getId())).toBe(true);
            expect(_.every(posts, Functions.getId())).toBe(true);
            checkedIds = true;
        });

        waitsFor(function(){
            return checkedIds;
        }, "checkedIds never true", 5000);


        // no votes have been made yet, so make sure that everything comes
        // back zero
        var checkedNoVotes = false;

        runs(function(){
            Q.all([
                    dao.findPostDetails(posts[0]._id),
                    dao.findPostDetails(posts[1]._id),
                    dao.findPostDetails(posts[2]._id),
                    dao.findPostDetails(posts.map(Functions.getId())),
                    dao.findVotesByUserIdAndPostIds(users[0]._id, posts.map(Functions.getId()))
                ]).spread(function(post0Res, post1Res, post2Res, allPostsRes, user1AllPostsRes){

                    var defaultObject = {posCount : 0, negCount : 0};

                    expect(post0Res).toEqual(defaultObject);
                    expect(post1Res).toEqual(defaultObject);
                    expect(post2Res).toEqual(defaultObject);
                    expect(allPostsRes).toEqual([defaultObject, defaultObject, defaultObject]);
                    expect(user1AllPostsRes).toEqual([]);

                    // check that doing a single lookup of userid+postid gives us an error
                    dao.findVoteByUserIdAndPostId(users[0]._id, posts[0]._id).then(
                        function(){
                            self.fail(new Error("don't expect this vote to exist"));
                        }, function(err) {
                            expect(err).not.toBeNull();
                            checkedNoVotes = true;
                        });


                }, Functions.failTest(self));
        });

        waitsFor(function(){
            return checkedNoVotes;
        }, "checkedNoVotes never true", 5000);


        var savedAllVotes = false;

        runs(function(){
            var votes = [
                // 1 neg, 1 pos for post1
                new Vote("pos",  users[0]._id, posts[0]._id),
                new Vote("neg",  users[1]._id, posts[0]._id),

                // 3 pos for post2
                new Vote("pos",  users[0]._id, posts[1]._id),
                new Vote("pos",  users[1]._id, posts[1]._id),
                new Vote("pos",  users[2]._id, posts[1]._id)
                // nothing for post3
            ];

            Q.all(_.map(votes, Functions.save(dao))).then(function(){
                savedAllVotes = true;
            }, Functions.failTest(self));
        });

        waitsFor(function(){
            return savedAllVotes;
        }, "savedAllVotes never true", 5000);

        //waitsFor(function(){return false;}, 'sleep', 300000);

        var allDone1 = false;

        runs(function(){

            // make sure that the API does the same thing
            // for multiple post ids and for a single post id
            var fetchSingle = _.map(posts, function(post){
                return dao.findPostDetails(post._id);
            });

            var fetchMultiple = dao.findPostDetails(posts.map(Functions.getId()));

            var fetchStrategies = [fetchSingle, fetchMultiple].map(function(fetchStrategy){
                var deferred = Q.defer();
                Q.all(fetchStrategy).spread(
                    function(post1, post2, post3){
                        console.log('got posts: ' + JSON.stringify([post1, post2, post3]));
                        expect(post1.posCount).toEqual(1);
                        expect(post1.negCount).toEqual(1);

                        expect(post2.posCount).toEqual(3);
                        expect(post2.negCount).toEqual(0);

                        expect(post3.posCount).toEqual(0);
                        expect(post3.negCount).toEqual(0);

                        deferred.resolve(true);
                    },
                    Functions.failTest(self));
                return deferred.promise;
            });

            console.log('fetch strategies is : ' + JSON.stringify(fetchStrategies));

            Q.all(fetchStrategies).then(function(){
                allDone1 = true;
            }, Functions.failTest(self));

        });


        waitsFor(function(){
            return allDone1;
        }, "allDone1 never finished", 5000);


        var allDone2 = false;

        runs(function() {

            var postIds = posts.map(Functions.getId());
            function checkUser(userId, expectedVoteValues) {
                var deferred = Q.defer();

                console.log('user id is ' + userId);

                Q.all(dao.findVotesByUserIdAndPostIds(userId, postIds)).then(
                    function(votes){
                        var voteValues = postIds.map(function(postId){
                            var vote = _.findWhere(votes, {postId : postId});
                            return vote ? vote.opinion : null;
                        });
                        expect(voteValues).toEqual(expectedVoteValues);
                        deferred.resolve(true);
                    },
                    Functions.failTest(self)
                );
                return deferred.promise;
            }

            Q.all([
                    // user 1 voted up post 1 and post 2
                    checkUser(users[0]._id, ["pos", "pos", null]),
                    // user 2 voted down post1 and up post 2
                    checkUser(users[1]._id, ["neg", "pos", null]),
                    // user 3 only voted up post 2
                    checkUser(users[2]._id, [null, "pos", null])
                ]).then(function(){
                    allDone2 = true;
                }, Functions.failTest(self));
        });

        waitsFor(function(){
            return allDone2;
        }, "allDone2 never finished", 5000);


    });


});