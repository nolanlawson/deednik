/*
 * Unit tests for the CouchDB interactions, part 2: the revenge.
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

beforeEach(function(){
    var self = this;

    // create the database
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

    // save some test data
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

describe("DAO test suite #2", function() {

    it("allows users to change their votes to neutral", function() {
        var self = this;

        var done = false;

        runs(function(){
            // situation: user3 changes his vote on post2 to neutral
            dao.upsertVote("neutral", users[2]._id, posts[1]._id).then(
                function(vote) {
                    expect(vote.userId).toEqual(users[2]._id);
                    expect(vote.postId).toEqual(posts[1]._id);
                    expect(vote.opinion).toEqual("neutral");
                    done = true;
                }, Functions.failTest(self));
        });

        waitsFor(function(){return done; }, "never done", 5000);

        var done2 = false;

        runs(function(){
            dao.findPostDetails(posts[1]._id).then(function(post){
                expect(post.posCount).toEqual(2);
                expect(post.negCount).toEqual(0);
                done2 = true;
            }, Functions.failTest(self));
        });

        waitsFor(function(){return done2; }, "never done2", 5000);

    });

    it("allows users to change multiple votes at once", function() {
        var self = this;

        var done = false;

        runs(function(){
            // situation: user3 changes his votes to pos,neutral,neg

            var newOpinions = {};
            newOpinions[posts[0]._id] = "pos";
            newOpinions[posts[1]._id] = "neutral";
            newOpinions[posts[2]._id] = "neg";

            dao.upsertVotes(users[2]._id, newOpinions).then(
                function(votes) {
                    expect(votes.length).toEqual(3);
                    expect(votes[0].postId).toEqual(posts[0]._id);
                    expect(votes[0].opinion).toEqual("pos");
                    expect(votes[1].postId).toEqual(posts[1]._id);
                    expect(votes[1].opinion).toEqual("neutral");
                    expect(votes[2].postId).toEqual(posts[2]._id);
                    expect(votes[2].opinion).toEqual("neg");
                    expect(_.every(votes, function(x){return x.userId === users[2]._id;})).toEqual(true);

                    done = true;
                }, Functions.failTest(self));
        });

        waitsFor(function(){return done; }, "never done", 5000);

        var done2 = false;

        runs(function(){
            dao.findPostDetails(posts.map(Functions.getId())).then(function(postDetails){
                expect(postDetails[0].posCount).toEqual(2);
                expect(postDetails[0].negCount).toEqual(1);
                expect(postDetails[1].posCount).toEqual(2);
                expect(postDetails[1].negCount).toEqual(0);
                expect(postDetails[2].posCount).toEqual(0);
                expect(postDetails[2].negCount).toEqual(1);
                done2 = true;
            }, Functions.failTest(self));
        });

        waitsFor(function(){return done2; }, "never done2", 5000);

    });

    it("upserts users", function() {
        var self = this;

        var done1 = false;

        runs(function(){
            // upsert user 1, check there are still only 3
            dao.upsertUser('foo').then(function(user){
                expect(user._id).toEqual(users[0]._id);
                dao.countType("user").then(function(count){
                    expect(count).toEqual(3);
                    done1 = true;
                }, Functions.failTest(self));
            }, Functions.failTest(self));
        });

        waitsFor(function(){return done1;}, 'done1', 5000);

        var done2 = false;

        runs(function(){
            // upsert user 2, check that there are now 4
            dao.upsertUser('quux').then(function(user){
                expect(user.userGuid).toEqual('quux');
                dao.countType("user").then(function(count){
                    expect(count).toEqual(4);
                    done2 = true;
                }, Functions.failTest(self));
            }, Functions.failTest(self));
        });

        waitsFor(function(){return done2;}, 'done2', 5000);

    });

    it("can find votes by user ids", function(){
        var self = this;

        var done = false;

        runs(function(){
            Q.all([
                    dao.findVotesByUserId(users[0]._id),
                    dao.findVotesByUserId(users[1]._id),
                    dao.findVotesByUserId(users[2]._id),
                    dao.findVotesByUserId("fakeUser")
                ]).spread(function(user1votes, user2votes, user3votes, fakeUserVotes){

                    expect(user1votes.length).toEqual(2);
                    expect(user2votes.length).toEqual(2);
                    expect(user3votes.length).toEqual(1);
                    expect(fakeUserVotes.length).toEqual(0);

                    done = true;
                }, Functions.failTest(self)).done();
        });

        waitsFor(function(){return done;}, 'done', 5000);
    });

});


