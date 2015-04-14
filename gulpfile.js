"use strict";

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************
var gulp        = require('gulp'),
    tslint      = require('gulp-tslint'),
    browserify  = require('browserify'),
    transform   = require('vinyl-transform'),
    tsc         = require('gulp-typescript'),
    karma       = require('gulp-karma'),
    uglify      = require('gulp-uglify'),
    docco       = require("gulp-docco"),
    runSequence = require('run-sequence');

//******************************************************************************
//* LINT
//******************************************************************************
gulp.task('lint', function() {
  return gulp.src(['./source/**/**.ts', './test/**/**.test.ts'])
             .pipe(tslint())
             .pipe(tslint.report('verbose'));
});

//******************************************************************************
//* BUILD
//******************************************************************************
var tsProject = tsc.createProject({
  removeComments : false,
  noImplicitAny : false,
  target : 'ES3',
  module : 'commonjs',
  declarationFiles : false
});

gulp.task('build-source', function() {
  return gulp.src('./source/**/**.ts')
             .pipe(tsc(tsProject))
             .js.pipe(gulp.dest('./build/source/'));
});

gulp.task('build-test', function() {
  return gulp.src('./test/*.test.ts')
             .pipe(tsc(tsProject))
             .js.pipe(gulp.dest('./build/test/'));
});

gulp.task('build', function(cb) {
  runSequence('lint', 'build-source', 'build-test', cb);
});

//******************************************************************************
//* DOCUMENT
//******************************************************************************
gulp.task('document', function () {
  return gulp.src("./build/source/*.js")
             .pipe(docco())
             .pipe(gulp.dest('./documentation'));
});

//******************************************************************************
//* BUNDLE
//******************************************************************************
// transform regular node stream to gulp (buffered vinyl) stream
var browserified = transform(function(filename) {
    var b = browserify({ entries: filename, debug: true });
    return b.bundle();
});

gulp.task('bundle-source', function () {
  return gulp.src('./build/source/index.js')
             .pipe(browserified)
             .pipe(gulp.dest('./bundled/source/'));
});

gulp.task('bundle-test', function () {
  return gulp.src('./build/test/*.test.js')
             .pipe(browserified)
             .pipe(gulp.dest('./bundled/test/'));

});

gulp.task('bundle', function(cb) {
  runSequence('build', 'bundle-source', 'bundle-test', cb);
});

//******************************************************************************
//* TEST
//******************************************************************************
//var server = karma.server;

gulp.task('karma', function(cb) {
  gulp.src('./bundled/test/*.test.js')
      .pipe(karma({
         configFile: 'karma.conf.js',
         action: 'run'
       }))
       .on('end', cb)
       .on('error', function(err) {
         throw err;
       });
});

gulp.task('test', function(cb) {
  runSequence('bundle', 'karma', cb);
});

//******************************************************************************
//* BAKE
//******************************************************************************
gulp.task('compress', function() {
  gulp.src('./bundled/source/**/**.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
});

gulp.task('bake', function(cb) {
  runSequence('test', 'compress', cb);
});

// TODO add version and add license

//******************************************************************************
//* DEFAULT
//******************************************************************************
gulp.task('default', function (cb) {
  runSequence(
    'lint',
    'build-source',
    'build-test',
    'document',
    'bundle-source',
    'bundle-test',
    'karma',
    'compress',
    cb);
});
