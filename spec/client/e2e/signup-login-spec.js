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
    var uppercaseUsername = "fake_UPPERCASE_" + new Date().getTime() + "@fake.com";

    var modal = '#signup-login-modal';
    var loginButton = '#login-btn';
    var logoutButton = '#logout-btn';
    var submit = 'button[type=submit]';
    var loginCheckbox = 'input[ng-model=alreadyHaveAccount]';

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

    function expectModal(visible) {
        expect(element(modal+':visible').count()).toBe(visible ? 1 : 0);
    }

    it('should allow me to create a new user', function(){

        // clicking the "login" button pops up the login modal
        expectModal(false);
        expectLoggedOut();

        element(loginButton).click();

        sleep(2);

        expectModal(true);

        input('username').enter(username);
        input('password').enter('password');
        input('confirmPassword').enter('password');
        input('alreadyHaveAccount').setChecked(false);

        sleep(1);

        element(submit).click();

        sleep(1);

        expectModal(false);
        expectLoggedIn();
    });

    it("remembers my username when I've logged in before", function(){

        // create a new user, log in, then log out
        expectLoggedOut();
        element(loginButton).click();

        var username = "fake_" + new Date().getTime() +"@bazbar.com";

        input('username').enter(username);
        input('password').enter('password');
        input('confirmPassword').enter('password');
        input('alreadyHaveAccount').setChecked(false);

        element(submit).click();

        sleep(1);

        expectLoggedIn();

        element(logoutButton).click();

        sleep(1);

        expectLoggedOut();

        sleep(1);

        // I reload my browser
        browser().reload();

        sleep(1);

        // and now it welcomes me back with my username already filled in
        // (but not the password, of course)

        expectLoggedOut();

        element(loginButton).click();

        sleep(1);

        expect(input('username').val()).toBe(username);
        expect(input('password').val()).toBeFalsy();
        expect(element('input[ng-model=alreadyHaveAccount]').attr('checked')).toBeTruthy();

    });

    it('ignores case with email logins (UC->LC)', function(){

        expectLoggedOut();
        element(loginButton).click();


        // it allows me to register with an uppercase username
        input('username').enter(uppercaseUsername);
        input('password').enter('password');
        input('confirmPassword').enter('password');
        input('alreadyHaveAccount').setChecked(false);

        element(submit).click();

        sleep(1);

        expectLoggedIn();

        element(logoutButton).click();

        sleep(1);

        expectLoggedOut();

        element(loginButton).click();

        sleep(1);

        // and I can sign in like a normal user with the lowercase version of that username
        input('username').enter(uppercaseUsername.toLowerCase());
        input('password').enter('password');
        input('alreadyHaveAccount').setChecked(true);
        element(submit).click();
        sleep(1);

        expectLoggedIn();
    });

    it('ignores case with email logins (LC->UC)', function(){
        expectLoggedOut();
        element(loginButton).click();
        sleep(1);

        // we can sign in with the uppercase username
        input('username').enter(username.toUpperCase());
        input('password').enter('password');

        input('alreadyHaveAccount').setChecked(true); //TODO: make checkIt() actually work

        element(submit).click();

        sleep(1);

        expectLoggedIn();
    });

    it('should allow me to log in and log out', function(){

        expectLoggedOut();
        element(loginButton).click();

        sleep(1);

        expectModal(true);

        input('username').enter(username);
        input('password').enter('password');

        input('alreadyHaveAccount').setChecked(true);

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

        input('alreadyHaveAccount').setChecked(true);

        element(submit).click();

        sleep(1);

        expectAlerts();
        expectModal(true);
        expectLoggedOut();

    });

    it('should not allow me to sign up with mismatched passwords or short/long passwords', function(){
        expectLoggedOut();
        element(loginButton).click();
        sleep(1);

        input('username').enter("foo123@bar.com");
        input('password').enter('password');
        input('confirmPassword').enter('password123');

        input('alreadyHaveAccount').setChecked(false);

        element(submit).click();

        sleep(1);

        expectLoggedOut();

        input('password').enter('p');
        input('confirmPassword').enter('p');

        element(submit).click();

        sleep(1);

        expectAlerts();
        expectLoggedOut();

        var longPassword = 'password that is way too long password that is way too long ' +
            'password that is way too long password that is way too long password that is way too long ' +
            'password that is way too long password that is way too long password that is way too long ' +
            'password that is way too long password that is way too long password that is way too long ' +
            'password that is way too long password that is way too long password that is way too long ' +
            'password that is way too long password that is way too long password that is way too long ' +
            'password that is way too long password that is way too long password that is way too long ';

        input('password').enter(longPassword);
        input('confirmPassword').enter(longPassword);

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

        input('alreadyHaveAccount').setChecked(false);

        element(submit).click();

        sleep(2);

        expectAlerts();
        expectModal(true);
        expectLoggedOut();

    });

});