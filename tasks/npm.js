module.exports = function(grunt) {

  var exec = require('child_process').exec;


  /**
   * Show content of the package to double check before publishing
   */
  grunt.registerTask('npm-show', 'Show files that would be published to NPM.', function() {
    var done = this.async();

    exec('npm pack', function(err, pkgFile) {
      exec('tar -tf ' + pkgFile, function(err, pkgContent) {
        console.log(pkgContent);
        exec('rm ' + pkgFile, done);
      });
    });
  });


  /**
   * Publish to NPM
   */
  grunt.registerTask('npm-publish', 'Publish to NPM.', function() {
    var opts = this.options({
      requires: [],
      abortIfDirty: true,
      tag: null
    });

    this.requires(opts.requires);

    var done = this.async();
    var queue = [];
    var next = function() {
      if (!queue.length) {
        return done();
      }
      queue.shift()();
    };
    var run = function(fn) {
      queue.push(fn);
    };
    var runIf = function(condition, fn) {
      if (condition) {
        run(fn);
      }
    }

    runIf(opts.abortIfDirty, function() {
      exec('git status -s', function(err, stdout) {
        if (stdout) {
          return grunt.warn('Dirty workspace, cannot push to NPM.\n' + stdout + '\n');
        }
        next();
      });
    });

    run(function() {
      var tag = opts.tag;
      if (typeof tag === 'function') {
        tag = tag();
      }

      exec('npm publish' + (tag ? ' --tag ' + tag : ''), function(err) {
        if (err) {
          return grunt.fatal(err.message.replace(/\n$/, '.'));
        }
        grunt.log.ok('Published to NPM' + (tag ? ' @' + tag : ''));
        next();
      });
    });

    next();
  });
};
