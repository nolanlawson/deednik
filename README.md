One Good Turn
=========================

Current version : 0.0.01

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

In one shell, run

```
grunt
```

to watch for changes and automatically re-test and re-build.

In another shell, run

```
NODE_ENV=development supervisor src/server/server.js
```

to watch for changes and redeploy on localhost:3000.

[1]: http://www.apache.org/licenses/LICENSE-2.0.html
[6]: http://www.hon.ch
[7]: http://nolanlawson.com
