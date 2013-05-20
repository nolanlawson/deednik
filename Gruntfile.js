/*global module*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    //
    jshint: {
        server : {
            src     : ['Gruntfile.js', 'server/**/*.js']
        },
        client : {
            src     : ['client/**/*.js', '!**/*.min.js']
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
          separator: ';'
        },
        dist: {
          src: ['client/*.js'],
          dest: 'build/<%= pkg.name %>.js'
        }
      },
    
    // minify/uglify the client-side javascript
    uglify: {
      options: {
        banner: '/*! Application <%= pkg.name %>, created by Nolan Lawson, ' + 
                'built by Grunt on <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src : 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    
    // run client-side jasmine tests
    jasmine: {
          '1goodturn': {
            src : 'build/**/*.js',
            options: {
              specs : 'spec/client/**/*.spec.js'
            }
          }
        },
    watch : {
        files : ['**/*.js'],
        tasks : ['jshint', 'jasmine_node', 'concat', 'uglify', 'jasmine']
    }
     
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('test', ['jshint', 'jasmine_node', 'concat', 'uglify', 'jasmine']);
  grunt.registerTask('default', ['test', 'watch']);

};