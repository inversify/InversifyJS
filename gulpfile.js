"use strict";

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************
var gulp        = require('gulp'),
    glob        = require('glob'),
    tslint      = require('gulp-tslint'),
    source      = require('vinyl-source-stream'),
    buffer      = require('vinyl-buffer'),
    browserify  = require('browserify'),
    ts          = require('gulp-typescript'),
    karma       = require('karma'),
    uglify      = require('gulp-uglify'),
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
var tsProject = ts.createProject({
  removeComments : true,
  noImplicitAny : false,
  target : 'ES3',
  module : 'commonjs',
  declarationFiles : false
});

gulp.task('build-source', function() {
  return gulp.src('./source/**/**.ts')
             .pipe(ts(tsProject))
             .js.pipe(gulp.dest('./build/source/'));
});

gulp.task('build-test', function() {
  return gulp.src('./test/**/**.test.ts')
             .pipe(ts(tsProject))
             .js.pipe(gulp.dest('./build/test/'));
});

gulp.task('build', function(cb) {
  runSequence('lint', 'build-source', 'build-test', cb);
});

//******************************************************************************
//* BUNDLE
//******************************************************************************
gulp.task('bundle-source', function () {
  return browserify(['./build/source/index.js'])
        .bundle()
        .pipe(source('inversify.js'))
        .pipe(buffer())
        .pipe(gulp.dest('./bundled/source/'));
});

gulp.task('bundle', function(cb) {
  runSequence('build', 'bundle-source', cb);
});

//******************************************************************************
//* TEST
//******************************************************************************
var server = karma.server;

gulp.task('karma', function(cb) {
  gulp.src('./build/test/*.test.js')
      .pipe(server({
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
  runSequence('lint', 'build', 'bundle', 'test', 'bake', cb);
});
