/*
 * Unit tests for the CouchDB interactions.
 *
 * Here's a script to delete any uncleaned-up databases:
 * for thing in `curl http://localhost:5984/_all_dbs | egrep -o 'unit_test_[^"]+'`; do curl -X DELETE -d '{}' "http://localhost:5984/$thing"; done
 */
/*global require describe it expect waitsFor runs beforeEach afterEach jasmine console*/
(function(){

"use strict";

var 
    
    Q    = require('q'),
    
    DAO  = require('../server/db/DAO.js'),
    User = require('../server/model/User.js'),
    Post = require('../server/model/Post.js'),
    Vote = require('../server/model/Vote.js')
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
    }, "DAO never ititialized", 10000);

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
    }, "DAO never destroyed", 10000);

    runs(function(){
        expect(dao.destroyed).toBe(true);
    });        
});

describe("DAO test suite", function() {
    
  it("saves users, posts, and votes to the database", function() {
    
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
    }, "user._id or post._id never added", 10000);
    
    runs(function(){
        vote = new Vote(true, user._id, post._id);
        
        expect(vote._id).not.toBeDefined();
        expect(vote._rev).not.toBeDefined();
        
        dao.save(vote);
    });
    
    waitsFor(function(){
        return vote._id;
    }, "vote._id never added", 10000);
    
    runs(function(){
        expect(user._id).toEqual(jasmine.any(String));
        expect(user._rev).toEqual(jasmine.any(String));
        expect(post._id).toEqual(jasmine.any(String));
        expect(post._rev).toEqual(jasmine.any(String));
        expect(vote._id).toEqual(jasmine.any(String));
        expect(vote._rev).toEqual(jasmine.any(String));
    });
    
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
        });
    });
    
    waitsFor(function(){return checked;}, "never checked", 10000);
    
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
      }, "user._id or post._id never added", 10000);
      
      runs(function(){
          vote = new Vote(true, user._id, post._id);
          dao.save(vote);
      });

      waitsFor(function(){
          return vote._id;
      }, "vote._id never added", 10000);
      
      runs(function(){
          dao.remove(user);
          dao.remove(post);
          dao.remove(vote);
      });
      
      waitsFor(function(){
          return user.deleted;
      });
      
      runs(function(){
          expect(user.deleted).toBe(true);
          expect(post.deleted).toBe(true);
          expect(vote.deleted).toBe(true);
          
          dao.findUserByUserGuid(user.userGuid).then(function(){
              self.fail(new Error('user not deleted'));
          }, function(err){
              expect(err).not.toBe(null);
          });
          
          dao.findById(user._id).then(function(){
                self.fail(new Error('user not deleted'));
            }, function(err){
                expect(err).not.toBe(null);
          });
          
          dao.findById(post._id).then(function(){
                  self.fail(new Error('post not deleted'));
              }, function(err){
                  expect(err).not.toBe(null);
          });
          
          dao.findById(vote._id).then(function(){
                    self.fail(new Error('vote not deleted'));
                }, function(err){
                    expect(err).not.toBe(null);
          });
          
          dao.findVoteByUserIdAndPostId(user._id, post._id).then(function(){
                    self.fail(new Error('vote not deleted'));
                }, function(err){
                    expect(err).not.toBe(null);
          });
          
      });
  });
  
  it("finds multiple posts by timestamp", function() {
 
    var self = this;
 
    var post1 = new Post('blah blah blah', 1300000000);
    var post2 = new Post('blah blah blah', 1400000000);
    var post3 = new Post('blah blah blah', 1500000000);

    runs(function() {
        dao.save(post1);
        dao.save(post2);
        dao.save(post3);
    });

    waitsFor(function(){
        return post1._id && post2._id && post3._id;
    }, "post._id never added", 10000);
    
    //waitsFor(function(){return false;}, 'sleep', 30000);
    
    runs(function(){
        Q.allResolved([
            dao.findPostsByTimestampSince(0, 10),
            dao.findPostsByTimestampSince(1299999999, 10),
            dao.findPostsByTimestampSince(1300000000, 10),
            dao.findPostsByTimestampSince(1399999999, 10),
            dao.findPostsByTimestampSince(1400000000, 10),
            dao.findPostsByTimestampSince(1499999999, 10),
            dao.findPostsByTimestampSince(1500000000, 10),
            dao.findPostsByTimestampSince(1500000001, 10)
        ]).then(function(results){
            expect(results.map(function(element){return element.valueOf().length;})).toBe([3, 3, 3, 2, 2, 1, 1, 0]);
        }, function(err){
            self.fail(new Error(err));
        });
        
    });
    
  });
  
  
});

})();