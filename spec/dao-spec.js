/*global require describe it console expect*/
(function(){

"use strict";

var DAO = require('../server/DAO.js'),
    Q = require('q');


    
  var dao = DAO.DAO({production : false});
  
  Q.nfcall(dao.init).
  then(function(){
      return Q.nfcall(console.log, "i'm here");
  });
  /*
  dao.init(function(){
      console.log("i'm here!!");
      describe("DAO test suite", function() {
          it("contains spec with an expectation", function() {
              console.log("i'm here too!!");
            expect(true).toBe(true);
            dao.destroy();
          });
      });
  });*/
  

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