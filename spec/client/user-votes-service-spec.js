"use strict";

describe("UserVotesService", function(){

    var _$httpBackend;
    var _userVotesService;

    function fakePost(postId) {
        return {_id : postId};
    }

    beforeEach(module('deednik'));

    beforeEach(inject(function($injector) {

        _$httpBackend = $injector.get('$httpBackend');

        // backend definition common for all tests
        _$httpBackend.expect('GET', '/jsapi-v1/findUserVotes').respond(
            {success : true, rows : [
                {postId : 'foo', opinion : 'pos'},
                {postId : 'baz', opinion : 'neg'},
                {postId : 'bar', opinion : 'neutral'},
                {postId : 'quux', opinion : 'pos'}
            ]}
        );

        _$httpBackend.when('POST', '/jsapi-v1/postUserVotes').respond({success : true});
    }));

    beforeEach(inject(function(userVotes){
        _userVotesService = userVotes;
    }));

    it('should check for user votes and post 2 of them', function() {

        runs(function(){
            _$httpBackend.flush();
        });

        waitsFor(function(){
            //console.info('uservotes service votes is ' + JSON.stringify(_userVotesService.votes));
            return _.keys(_userVotesService.votes).length > 0;
        }, 'userVotesService never initialized', 5000);

        runs(function(){
            expect( _userVotesService.getOpinion('foo')).toEqual("pos");
            expect( _userVotesService.getOpinion('baz')).toEqual("neg");
            expect( _userVotesService.getOpinion('bar')).toEqual("neutral");
            expect( _userVotesService.getOpinion('quux')).toEqual("pos");
            expect( _userVotesService.getOpinion('toto')).toEqual("neutral");
            expect( _userVotesService.getOpinion('hehe')).toEqual("neutral");
        });

        runs(function(){
            _$httpBackend.expect('POST', '/jsapi-v1/postUserVotes', {votes : {foo : "neg", toto: "pos"}});
            // user changes his mind about foo a couple times
            _userVotesService.updateOpinion('foo', 'pos');
            _userVotesService.updateOpinion('foo', 'neutral');
            _userVotesService.updateOpinion('foo', 'neg');
            _userVotesService.updateOpinion('toto', 'pos');
        });

        runs(function(){
            expect( _userVotesService.getOpinion(fakePost('foo'))).toEqual("neg");
            expect( _userVotesService.getOpinion(fakePost('baz'))).toEqual("neg");
            expect( _userVotesService.getOpinion(fakePost('bar'))).toEqual("neutral");
            expect( _userVotesService.getOpinion(fakePost('quux'))).toEqual("pos");
            expect( _userVotesService.getOpinion(fakePost('toto'))).toEqual("pos");
            expect( _userVotesService.getOpinion(fakePost('hehe'))).toEqual("neutral");
        });

        waitsFor(function(){
            return _userVotesService.postInProgress;
        }, 'userVotesService never started posting', 10000);

        runs(function(){
            _$httpBackend.flush();
        });

        waitsFor(function(){
            return _.keys(_userVotesService.dirtyVotes).length === 0;
        }, 'dirtyVotes never emptied', 5000);

        // user has another change of heart
        runs(function(){
            _$httpBackend.expect('POST', '/jsapi-v1/postUserVotes',
                {votes:{hehe:"neg",toto:"neutral",foo:"pos"}});
            _userVotesService.updateOpinion(fakePost('hehe'), 'neg');
            _userVotesService.updateOpinion(fakePost('toto'), 'neutral');
            _userVotesService.updateOpinion(fakePost('foo'), 'pos');
        });

        runs(function(){
            expect( _userVotesService.getOpinion(fakePost('foo'))).toEqual("pos");
            expect( _userVotesService.getOpinion(fakePost('baz'))).toEqual("neg");
            expect( _userVotesService.getOpinion(fakePost('bar'))).toEqual("neutral");
            expect( _userVotesService.getOpinion(fakePost('quux'))).toEqual("pos");
            expect( _userVotesService.getOpinion(fakePost('toto'))).toEqual("neutral");
            expect( _userVotesService.getOpinion(fakePost('hehe'))).toEqual("neg");
        });

        waits(5000);

        runs(function(){
            _$httpBackend.flush();
        });

        waitsFor(function(){
            return _.keys(_userVotesService.dirtyVotes).length === 0;
        }, 'dirtyVotes never emptied (#2)', 5000);


    });

    afterEach(function() {
        _$httpBackend.verifyNoOutstandingExpectation();
        _$httpBackend.verifyNoOutstandingRequest();
    });
});

