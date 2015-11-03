'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var shell = require('gulp-shell');

gulp.task('lint', function () {
    return gulp.src([
        './lib/**/*.js',
        './example/**/*.js'
    ])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('jsdoc', shell.task('./node_modules/jsdoc/jsdoc.js -r -R README.md lib -d docs/jsdoc'));

gulp.task('default', ['lint']);