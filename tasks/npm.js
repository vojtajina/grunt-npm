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


  /**
   * Generate contributors, all developers who contributed, sorted by number of commits.
   */
  grunt.registerTask('npm-contributors', 'Update contributors in package.json', function() {
    var done = this.async();
    var opts = this.options({
      file: 'package.json',
      commit: true,
      commitMessage: 'Update contributors'
    });

    exec('git log --pretty=short | git shortlog -nse', function(err, stdout) {
      var pkg = grunt.file.readJSON(opts.file);

      pkg.contributors = stdout.toString().split('\n').slice(1, -1).map(function(line) {
        return line.replace(/^[\W\d]+/, '');
      });

      grunt.file.write(opts.file, JSON.stringify(pkg, null, '  ') + '\n');

      exec('git status -s ' + opts.file, function(err, stdout) {
        if (!stdout) {
          grunt.log.ok('The contributors list is already up to date.');
          return done();
        }

        exec('git commit ' + opts.file + ' -m "' + opts.commitMessage + '"', function(err, stdout, stderr) {
          if (err) {
            grunt.log.error('Cannot commit contributors changes:\n  ' + stderr);
          } else {
            grunt.log.ok('The contributors list has been updated.');
          }
          done();
        });
      });
    });
  });


  // aliases
  grunt.registerTask('contributors', 'npm-contributors');
  grunt.registerTask('show', 'npm-show');
  grunt.registerTask('publish', 'npm-publish');
};
