Deednik
=========================

Developer
-----------

[Nolan Lawson][7]


License
-----------

[Apache 2.0][1].

Summary
-----------

TODO

Unit tests
----------------

Make sure CouchDB is running at localhost:5984, then run:

```
npm install
grunt test
```

Build for production
--------------------

```
npm install
grunt build
```

will write images, javascript, and css to the ```build/``` directory.  Then just run

```
node src/server/server.js
```

to start the server on localhost:3000.

Developer workflow
-----------------

There are two environment variables you need to set:

* ```NODE_ENV``` defaults to ```production```, but may be set to ```development``` to enable pretty-printing and disable uglification.
* ```COUCHDB_PATH``` defaults to ```http://localhost:5984```, but this may not work if your CouchDB isn't an Admin Party.

### Running the app

In one shell, run:

```
NODE_ENV=development COUCHDB_PATH=http://username:password@localhost:5984 supervisor src/server/server.js
```

to watch for changes and redeploy on localhost:3000.

### Running unit tests, lint, minify, etc.

In another shell, run

```
COUCHDB_PATH=http://username:password@localhost:5984 grunt
```

to watch for changes and automatically lint, minify, run server unit tests, run client unit tests, and build.

### E2E tests with Karma

In another shell, run

```
grunt karma:continuous
```

to launch Chrome (default browser) and run e2e tests.

Or, if you prefer to run the e2e tests purely from the command line (with PhantomJS), you can do:

```
grunt karma:dev
```


[1]: http://www.apache.org/licenses/LICENSE-2.0.html
[6]: http://www.hon.ch
[7]: http://nolanlawson.com
