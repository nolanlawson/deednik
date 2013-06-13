"use strict";

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        //
        jshint: {
            server : {
                src     : ['src/server/**/*.js'],
                options : {
                    jshintrc : 'src/server/.jshintrc'
                }
            },
            client : {
                src     : ['src/client/**/*.js', '!**/*.min.js'],
                options : {
                    jshintrc : 'src/client/.jshintrc'
                }
            },
            miscellaneous : {
                src : ['spec/**/*.js', 'Gruntfile.js'],
                options : {
                    jshintrc : ".jshintrc"
                }
            }
        },

        // run jasmine tests on the server side
        jasmine_node : {
            specNameMatcher : '*',
            projectRoot     : 'spec/server'
        },

        clean: ["build"],

        // concat all client-side javascript
        concat: {
            options: {
                separator: '\n;\n'
            },
            dist: {
                src: ['src/client/application.js',
                    'src/client/services/*.js',
                    'src/client/factories/*.js',
                    'src/client/controllers/*.js'],
                dest: 'build/js/application-concat.js'
            }
        },

        // copy the js lib files over to build/
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: ['src/client/lib/**/*.js'],
                        dest: 'build/js/lib',
                        filter: 'isFile',
                        flatten: true
                    },
                    {
                        expand: true,
                        src: ['images/*'],
                        dest: 'build/images',
                        filter: 'isFile',
                        flatten: true
                    },
                    {   expand : true,
                        src : ['**/*'],
                        cwd: 'styles/lib/',
                        dest : 'build/css/lib',
                        flatten : false}
                ]
            }
        },

        // minify/uglify the client-side javascript
        uglify: {
            options: {
                banner: '/*! Application <%= pkg.name %> v<%= pkg.version %>, created by Nolan Lawson, ' +
                    'built by Grunt on <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                wrap : "oneGoodTurn",
                report : "gzip"
            },
            build: {
                src : 'build/js/application-concat.js',
                dest: 'build/js/application-concat.min.js'
            }
        },

        // run client-side jasmine tests
        jasmine: {
            unminified : {
                // explicitly use angular 1.1.3 for testing due to a bug in Angular 1.1.4+
                src : ['src/client/lib/**/jquery*.js', 'src/client/lib/**/angular-1.1.3.min.js', 'src/client/application.js',
                    'src/client/**/*.js', '!**/*/angular-1.1.5.min.js'],
                options: {
                    specs : 'spec/client/unit/**/*-spec.js'
                }
            },

            minified : {
                src : ['src/client/lib/**/jquery*.js', 'src/client/lib/**/angular-1.1.3.min.js', 'src/client/application.js',
                    'src/client/**/*.js', '!**/*/angular-1.1.5.min.js'],
                options: {
                    specs : 'spec/client/unit/**/*-spec.js'
                }
            }
        },

        karma: {
            unit: {
                configFile: 'karma.conf.js',
            }
        },

        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'build/css/application.min.css' : 'styles/application.scss'
                }
            },
            dev: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'build/css/application.css' : 'styles/application.scss'
                }
            }
        },
        watch : {
            sass : {
                files : ['styles/**/*.scss'],
                tasks : ['sass']
            },
            serverjs : {
                files : ['src/server/**/*.js', 'spec/server/**/*.js', '!**/*.min.js'],
                tasks : ['jshint', 'jasmine_node']
            },
            clientjs : {
                files : ['src/client/**/*.js', 'spec/client/**/*.js', '!**/*.min.js'],
                tasks : ['jshint', 'jasmine:unminified', 'build', 'jasmine:minified']
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-karma');

    // Default task(s).
    grunt.registerTask('build', ['clean', 'copy', 'concat', 'uglify', 'sass']);
    grunt.registerTask('test', ['jshint', 'jasmine_node', 'jasmine:unminified', 'build', 'jasmine:minified']);
    grunt.registerTask('default', ['test', 'watch']);

};
