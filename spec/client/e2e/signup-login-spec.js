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

    function expectAlerts() {
        expect(element('.alert:visible').count()).not().toBe(0);
    }

    function checkIt(input) {
        if (input.val() !== 'on') {
            input.check();
        }
    }

    function uncheckIt(input) {
        if (input.val() === 'on') {
            input.check();
        }
    }

    function expectModal(visible) {
        expect(element(modal+':visible').count()).toBe(visible ? 1 : 0);
    }


    it('should allow me to create a new user', function(){

        // clicking the "login" button pops up the login modal
        expectModal(false);
        expectLoggedOut();

        element(loginButton).click();

        sleep(1);

        expectModal(true);

        input('username').enter(username);
        input('password').enter('password');
        input('confirmPassword').enter('password');
        uncheckIt(input('alreadyHaveAccount'));

        element(submit).click();

        sleep(1);

        expectModal(false);
        expectLoggedIn();
    });

    it('should allow me to log in and log out', function(){

        expectLoggedOut();
        element(loginButton).click();

        sleep(1);

        expectModal(true);

        input('username').enter(username);
        input('password').enter('password');

        checkIt(input('alreadyHaveAccount'));

        element(submit).click();

        sleep(1);

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

        checkIt(input('alreadyHaveAccount'));

        element(submit).click();

        sleep(1);

        expectAlerts();
        expectModal(true);
        expectLoggedOut();

    });

    it('should not allow me to sign up with mismatched passwords or short passwords', function(){
        expectLoggedOut();
        element(loginButton).click();
        sleep(1);

        input('username').enter("foo123@bar.com");
        input('password').enter('password');
        input('confirmPassword').enter('password123');

        uncheckIt(input('alreadyHaveAccount'));

        element(submit).click();

        sleep(1);

        expectLoggedOut();

        input('password').enter('p');
        input('confirmPassword').enter('p');

        element(submit).click();

        sleep(1);

        expectAlerts();
        expectLoggedOut();
    });


    it('should not allow me to re-register the same user', function(){
        expectLoggedOut();
        element(loginButton).click();
        sleep(1);

        input('username').enter(username);
        input('password').enter('password');
        input('confirmPassword').enter('password');

        uncheckIt(input('alreadyHaveAccount'));

        element(submit).click();

        sleep(1);

        expectAlerts();
        expectModal(true);
        expectLoggedOut();

    });

    it('ignores case with email logins (LC->UC)', function(){
        expectLoggedOut();
        element(loginButton).click();
        sleep(1);


        // cannot re-register with the same username in uppercase

        input('username').enter(username.toUpperCase());
        input('password').enter('fooled you!');
        input('confirmPassword').enter('fooled you!');

        checkIt(input('alreadyHaveAccount'));

        element(submit).click();

        sleep(1);

        expectAlerts();
        expectModal(true);
        expectLoggedOut();

        // but we can sign in with the uppercase username

        input('password').enter('password');
        uncheckIt(input('alreadyHaveAccount'));

        element(submit).click();

        sleep(1);

        expectLoggedIn();
    });

    it('ignores case with email logins (UC->LC)', function(){
        expectLoggedOut();
        element(loginButton).click();

        var originalUsername = "NEW_" + username.toUpperCase();
        input('username').enter(originalUsername);
        input('password').enter('password');
        input('confirmPassword').enter('password');

        uncheckIt(input('alreadyHaveAccount'));

        element(submit).click();

        sleep(1);

        expectLoggedIn();

        element(logoutButton).click();

        sleep(1);

        expectLoggedOut();

        element(loginButton).click();

        sleep(1);

        input('username').enter(originalUsername.toLowerCase());
        input('password').enter('password');

        checkIt(input('alreadyHaveAccount'));
        element(submit).click();
        sleep(1);

        expectLoggedIn();
    });
});