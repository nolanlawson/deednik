"use strict";

var phonyPosts = [{_id : 'foo', _rev : 'bar', type : 'post', content : 'hello'}];

describe("restServer", function(){

    var _$httpBackend;
    var _restServer;

    beforeEach(module('one-good-turn'));

    beforeEach(inject(function($injector, restServer) {

        _$httpBackend = $injector.get('$httpBackend');
        _restServer = restServer;

        // backend definition common for all tests
        _$httpBackend.when('GET', '/jsapi-v1/findLastPosts?n=10').respond({success : true, rows : phonyPosts});
        _$httpBackend.when('POST', '/jsapi-v1/insertPost').respond({success : true});
    }));

    it('should fetch latest posts', function() {

        _$httpBackend.expect('GET', '/jsapi-v1/findLastPosts?n=10');
        _restServer.findLastPosts(10).then(function(response){
            expect(response.data.rows.length).toEqual(1);
            expect(response.data.rows[0].content).toEqual("hello");
        });

        _$httpBackend.expect('POST', '/jsapi-v1/insertPost', {postContent : "hello world"});
        _restServer.insertPost("hello world");

        _$httpBackend.flush();

    });

    afterEach(function() {
        _$httpBackend.verifyNoOutstandingExpectation();
        _$httpBackend.verifyNoOutstandingRequest();
    });
});

