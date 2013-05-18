/*global require describe it expect waitsFor runs beforeEach afterEach*/
(function(){

"use strict";

var DAO = require('../server/DAO.js');  

describe("DAO test suite", function() {
    
    var dao;
    
    beforeEach(function(){
        // create the database and check that it's initialized
        runs(function(){
            dao = DAO.DAO({production : false});
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
    
  it("contains spec with an expectation", function() {
    

  });
});

  

/*
describe('jasmine-node', function(){

  it('should pass', function(){
    expect(1+2).toEqual(3);
  });

  it('shows asynchronous test', function(){
    setTimeout(function(){
      expect('second').toEqual('second');
      asyncSpecDone();
    }, 1);
    expect('first').toEqual('first');
    asyncSpecWait();
  });

  it('shows asynchronous test node-style', function(done){
    setTimeout(function(){
      expect('second').toEqual('second');
      // If you call done() with an argument, it will fail the spec 
      // so you can use it as a handler for many async node calls
      done();
    }, 1);
    expect('first').toEqual('first');
  });
});*/

})();