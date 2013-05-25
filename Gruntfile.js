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
          }          
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
          '1goodturn': {
            src : ['build/client/**/*.js'],
            options: {
              specs : 'spec/client/**/*.spec.js'
            }
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
        files : ['spec/**/*.js', 'src/**/*.js', '!**/*.min.js', 'styles/**/*.scss'],
        tasks : ['jshint', 'jasmine_node', 'concat', 'uglify', 'jasmine', 'sass']
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

  // Default task(s).
  grunt.registerTask('build', ['copy', 'concat', 'uglify', 'sass']);
  grunt.registerTask('test', ['jshint', 'jasmine_node', 'jasmine']);
  grunt.registerTask('default', ['build', 'test', 'watch']);

};