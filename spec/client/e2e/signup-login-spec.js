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
    var uppercaseUsername = "FAKE_" + username.toUpperCase();

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

    function checkIt() {
        sleep(1);
        var future = element("input[ng-model='alreadyHaveAccount']").attr('checked');

        future.execute(function(){

            var checked = future.value;

            console.log("checkIt -> " + JSON.stringify(checked));

            if (!checked) {
                console.log("checking it");
                input('alreadyHaveAccount').check();
            }


        });

        sleep(2);

    }


    function uncheckIt() {
        sleep(1);
        var future = element("input[ng-model='alreadyHaveAccount']").attr('checked');

        future.execute(function(){

            var checked = future.value;

            console.log("uncheckIt -> " + JSON.stringify(checked));

            if (checked) {
                console.log("unchecking it");
                input('alreadyHaveAccount').check();
            }
        });
        sleep(2);
    }

    function expectModal(visible) {
        expect(element(modal+':visible').count()).toBe(visible ? 1 : 0);
    }


    function getValue(future) {
        future.execute(function(){});
        return future.value;
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

        sleep(1);

        uncheckIt();

        element(submit).click();

        sleep(1);

        expectModal(false);
        expectLoggedIn();
    });

    it('ignores case with email logins (LC->UC)', function(){
        expectLoggedOut();
        element(loginButton).click();
        sleep(1);

        // we can sign in with the uppercase username
        input('username').enter(username.toUpperCase());
        input('password').enter('password');

        pause();
        checkIt();
        pause();

        element(submit).click();

        sleep(1);

        expectLoggedIn();
    });

    it('ignores case with email logins (UC->LC) (part 1)', function(){
        expectLoggedOut();
        element(loginButton).click();


        input('username').enter(uppercaseUsername);
        input('password').enter('password');
        input('confirmPassword').enter('password');

        uncheckIt();

        element(submit).click();

        sleep(1);

        expectLoggedIn();

        element(logoutButton).click();

        sleep(1);

        expectLoggedOut();
    });

    it('ignores case with email logins (UC->LC) (part 2)', function(){
        expectLoggedOut();

        element(loginButton).click();

        sleep(1);

        input('username').enter(uppercaseUsername.toLowerCase());
        input('password').enter('password');

        checkIt();
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

        checkIt();

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

        checkIt();

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

        uncheckIt();

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

        uncheckIt();

        element(submit).click();

        sleep(1);

        expectAlerts();
        expectModal(true);
        expectLoggedOut();

    });

    it("remembers my username when I've logged in before", function(){

        // create a new user, log in, then log out
        expectLoggedOut();
        element(loginButton).click();

        var username = "fake_" + new Date().getTime() +"@bazbar.com";

        input('username').enter(username);
        input('password').enter('password');
        input('confirmPassword').enter('password');

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
        expect(input('alreadyHaveAccount').val()).toBe('off');

    });
});