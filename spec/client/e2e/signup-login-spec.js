"use strict";

describe('signup/login behavior', function(){
    beforeEach(function(){
        browser().navigateTo('/');

        // log out if necessary
        sleep(1);
        element(logoutButton).click();
        sleep(1);
    });

    it('should automatically redirect to /home when the fragment is empty', function() {
        expect(browser().location().url()).toBe("/home");
    });

    var username = "fake_" + new Date().getTime() + "@fake.com";

    var modal = '#signup-login-modal';
    var loginButton = '#login-btn';
    var logoutButton = '#logout-btn';
    var submit = 'button[type=submit]';

    function expectLoggedIn() {
        expect(element(loginButton + ':visible').count()).toBe(0);
        expect(element(logoutButton + ':visible').count()).toBe(1);
    }

    function expectLoggedOut() {
        expect(element(loginButton + ':visible').count()).toBe(1);
        expect(element(logoutButton + ':visible').count()).toBe(0);
    }

    it('should allow me to create a new user', function(){

        // clicking the "login" button pops up the login modal
        expect(element(modal + ':visible').count()).toBe(0);
        expectLoggedOut();

        element(loginButton).click();

        sleep(1);

        expect(element(modal + ':visible').count()).toBe(1);

        input('username').enter(username);
        input('password').enter('password');
        input('confirmPassword').enter('password');

        // uncheck
        if (input('alreadyHaveAccount').val() === 'on') {
            input('alreadyHaveAccount').check();
        }

        element(submit).click();

        sleep(3);

        expect(element(modal+':visible').count()).toBe(0);
        expectLoggedIn();
    });

    it('should allow me to log in and log out', function(){

        expectLoggedOut();
        element(loginButton).click();

        sleep(1);

        expect(element(modal + ':visible').count()).toBe(1);

        input('username').enter(username);
        input('password').enter('password');

        // uncheck
        if (input('alreadyHaveAccount').val() !== 'on') {
            input('alreadyHaveAccount').check();
        }

        element(submit).click();

        sleep(3);

        expectLoggedIn();
        element(logoutButton).click();

        sleep(1);

        expectLoggedOut();
    });

    it('should not allow me to log in with a bad password', function(){
        expectLoggedOut();
        element(loginButton).click();
        sleep(1);

        input('username').enter(username);
        input('password').enter('badPassword!!');

        // uncheck
        if (input('alreadyHaveAccount').val() !== 'on') {
            input('alreadyHaveAccount').check();
        }

        element(submit).click();

        sleep(3);

        expect(element('.alert:visible').count()).toBe(1);
        expect(element(modal + ':visible').count()).toBe(1);
        expectLoggedOut();


    });
});