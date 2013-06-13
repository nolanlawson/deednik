// Karma configuration
// Generated on Thu Jun 13 2013 11:11:28 GMT+0200 (CEST)


// base path, that will be used to resolve files and exclude
basePath = '';

// the following two are bugfixes according to
// http://stackoverflow.com/questions/15665960/can-do-i-use-testacular-to-test-web-pages-that-are-not-not-on-my-localhost
proxies = {'/': 'http://localhost:3000/'}; // assume your app is running on port 9000
urlRoot = '/_karma_/';  // important, could be any non-trivial path

// list of files / patterns to load in the browser
files = [
    ANGULAR_SCENARIO,
    ANGULAR_SCENARIO_ADAPTER,
    // explicitly use angular 1.1.3 for testing due to a bug in Angular 1.1.4+
    'src/client/lib/jquery-1.8.3.min.js',
    'src/client/lib/angular-1.1.3.min.js',
    'src/client/lib/angular-mocks.min.js',
    'src/client/lib/bootstrap-2.3.1.min.js',
    'src/client/lib/moment-2.0.0.min.js',
    'src/client/lib/socket.io.min.js',
    'src/client/lib/underscore-1.4.4.min.js',

    'src/client/application.js',
    'src/client/services/**/*.js',
    'src/client/factories/**/*.js',
    'src/client/controllers/**/*.js',

    'spec/client/e2e/*.js'
];

// list of files to exclude
exclude = [];


// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['progress'];


// web server port
port = 9109;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['Chrome'];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;



// enable / disable watching file and executing tests whenever any file changes
autoWatch = false;

// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
