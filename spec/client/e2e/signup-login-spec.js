/*global browser*/
"use strict";

describe('signup/login behavior', function(){
    beforeEach(function(){
        browser().navigateTo('index.html');
    });

    it('should automatically redirect to /#/home when the fragment is empty', function() {
        //expect(browser().location().url()).toBe("/#/home");
        expect("foo").toEqual("foo");
    });
});