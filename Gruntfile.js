module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        sourceMap: "dist/minquery.js.map"
      },
      build: {
        src: "dist/minquery.js",
        dest: "dist/minquery.min.js"
      }
    },

    concat: {
      options: {
        banner: "var MinQuery = (function () {\n  'use strict';\n",
        footer: "  return MinQuery;\n}());\n"
      },
      dist: {
        src: ["src/loader.js", "src/modules/*.js", "src/minquery.js"],
        dest: "dist/minquery.js",
        nonull: true
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.registerTask("default", ["concat", 'uglify']);
};