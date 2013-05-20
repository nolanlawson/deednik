/*global require describe it expect waitsFor runs beforeEach afterEach jasmine*/
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
        
        Q.allResolved([
            dao.findById(user._id),
            dao.findByUserId(user.userId),
            dao.findById(post._id),
            dao.findById(vote._id)
        ]).spread(function(fetchedUser1, fetchedUser2, fetchedPost, fetchedVote) {
            expect(fetchedUser1[0]._id).toEqual(user._id);
            expect(fetchedUser2[0].rows[0].doc._id).toEqual(user._id);
            expect(fetchedPost[0]._id).toEqual(post._id);
            expect(fetchedVote[0]._id).toEqual(vote._id);
            checked = true;
        });
    });
    
    waitsFor(function(){return checked;}, "never checked", 10000);
    
  });
  
  it("deletes users, posts, and votes from the database", function() {
      
      
      
  });
});

})();