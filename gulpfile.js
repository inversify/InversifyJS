"use strict";

var gulp        = require('gulp'),
    karma       = require('karma').server,
    uglify      = require('gulp-uglify'),
    runSequence = require('run-sequence'),
    reload      = browserSync.reload;

gulp.task('lint', function (cb) {
  // TODO
});

gulp.task('build', function() {
    // TODO
});

gulp.task('test', function(cb) {
  karma.start({
    configFile : __dirname + '/karma.conf.js',
    singleRun : true
  }, cb);
});

gulp.task('bunde', function() {
    // TODO
});

gulp.task('default', function (cb) {
  runSequence('lint', 'build', 'test', cb);
});
