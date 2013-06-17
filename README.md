# grunt-npm

**A set of Grunt tasks for dealing with NPM.

## Installation

Install npm package, next to your project's `Gruntfile.js` file:

    npm install grunt-npm --save-dev

Add this line to your project's `Gruntfile.js`:

    grunt.loadNpmTasks('grunt-npm');


## Tasks

### grunt npm-show (also aliased as show)
Show all the files that would be published to NPM. This is useful if you wanna make sure you are not publishing files you don't want to...

### grunt npm-publish (also aliased as publish)

#### Configuration
```js
'npm-publish': {
  options: {
    // list of tasks that are required before publishing
    requires: ['build'],
    // if the workspace is dirty, abort publishing (to avoid publishing local changes)
    abortIfDirty: true,
    // can also be a function that returns NPM tag (eg. to determine canary/latest tag based on the version)
    tag: 'canary'
  }
}
```

### grunt npm-contributors (also aliased as contributors)
Update contributors in `package.json` - all developers who commited to the repository, sorted by number of commits. A `.mailmap` file can be used to map multiple emails to a single person.

#### Configuration
```js
'npm-contributors': {
  options: {
    file: 'package.json',
    commit: true,
    commitMessage: 'Update contributors'
  }
}
```
