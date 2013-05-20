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
    
    runs(function(){
        
        Q.all([
            dao.findById(user._id),
            dao.findUserByUserGuid(user.userGuid),
            dao.findById(post._id),
            dao.findVoteByUserIdAndPostId(user._id, post._id),
            dao.findById(vote._id)
        ]).spread(function(fetchedUser1, fetchedUser2, fetchedPost, fetchedVote1, fetchedVote2) {
            expect(fetchedUser1._id).toEqual(user._id);
            expect(fetchedUser2._id).toEqual(user._id);
            expect(fetchedPost._id).toEqual(post._id);
            expect(fetchedVote1._id).toEqual(vote._id);
            expect(fetchedVote2._id).toEqual(vote._id);
            checked = true;
        }).then(console.log, function(err){
            console.log('got error in chain: ' + err);
        });
    });
    
    waitsFor(function(){return checked;}, "never checked", 10000);
    
  });
  
  it("deletes users from the database", function() {
      var self = this;
      
      var user = new User('fooId');
      
      runs(function() {
          dao.save(user);
      });

      waitsFor(function(){
          return user._id;
      }, "user._id never added", 10000);
      
      runs(function(){
          dao.remove(user);
      });
      
      waitsFor(function(){
          return user.deleted;
      });
      
      runs(function(){
          expect(user.deleted).toBe(true);
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
      });
  });
});

})();