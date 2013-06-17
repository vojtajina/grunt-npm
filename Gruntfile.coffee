module.exports = (grunt) ->

  # Project configuration.
  grunt.initConfig
    pkgFile: 'package.json'

  grunt.loadTasks 'tasks'
  grunt.loadNpmTasks 'grunt-bump'

  grunt.registerTask 'default', ['build', 'test', 'jshint', 'coffeelint']
  grunt.registerTask 'release', 'Build, bump and publish to NPM.', (type) ->
    grunt.task.run [
      "bump:#{type||'patch'}"
      'npm-publish'
    ]
