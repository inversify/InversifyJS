"use strict";

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************
var gulp        = require("gulp"),
    browserify  = require("browserify"),
    source      = require("vinyl-source-stream"),
    buffer      = require("vinyl-buffer"),
    tslint      = require("gulp-tslint"),
    tsc         = require("gulp-typescript"),
    coveralls   = require('gulp-coveralls'),
    uglify      = require("gulp-uglify"),
    docco       = require("gulp-docco"),
    runSequence = require("run-sequence"),
    header      = require("gulp-header"),
    pkg         = require(__dirname + "/package.json"),
    mocha       = require("gulp-mocha"),
    istanbul    = require("gulp-istanbul");

//******************************************************************************
//* LINT
//******************************************************************************
gulp.task("lint", function() {
  return gulp.src([
                __dirname + "/source/**/**.ts",
                __dirname + "/test/**/**.test.ts"
              ])
             .pipe(tslint())
             .pipe(tslint.report("verbose"));
});

//******************************************************************************
//* BUILD
//******************************************************************************
var tsProject = tsc.createProject({
  removeComments : false,
  noImplicitAny : false,
  target : "ES5",
  module : "commonjs",
  declarationFiles : false
});

gulp.task("build-source", function() {
  return gulp.src(__dirname + "/source/**/**.ts")
             .pipe(tsc(tsProject))
             .js.pipe(gulp.dest(__dirname + "/build/source/"));
});

var tsTestProject = tsc.createProject({
  removeComments : false,
  noImplicitAny : false,
  target : "ES5",
  module : "commonjs",
  declarationFiles : false
});

gulp.task("build-test", function() {
  return gulp.src(__dirname + "/test/*.ts")
             .pipe(tsc(tsTestProject))
             .js.pipe(gulp.dest(__dirname + "/build/test/"));
});

gulp.task("build", function(cb) {
  runSequence("lint", "build-source", "build-test", cb);
});

//******************************************************************************
//* DOCUMENT
//******************************************************************************
gulp.task("document", function () {
  return gulp.src(__dirname + "/build/source/*.js")
             .pipe(docco())
             .pipe(gulp.dest(__dirname + "/documentation"));
});

//******************************************************************************
//* BUNDLE
//******************************************************************************
gulp.task("bundle-source", function () {
  var b = browserify({
    standalone : 'inversify',
    entries: __dirname + "/build/source/inversify.js",
    debug: true
  });

  return b.bundle()
    .pipe(source("inversify.js"))
    .pipe(buffer())
    .pipe(gulp.dest(__dirname + "/bundled/source/"));
});

gulp.task("bundle-test", function () {
  var b = browserify({
    entries: __dirname + "/build/test/inversify.test.js",
    debug: true
  });

  return b.bundle()
    .pipe(source("inversify.test.js"))
    .pipe(buffer())
    .pipe(gulp.dest(__dirname + "/bundled/test/"));
});

gulp.task("bundle", function(cb) {
  runSequence("build", "bundle-source", "bundle-test", "document", cb);
});

//******************************************************************************
//* TEST
//******************************************************************************

gulp.task("mocha", function() {
  return gulp.src('build/test/**/*.test.js')
		.pipe(mocha({ui: 'bdd'}))
    .pipe(istanbul.writeReports());
});

gulp.task("istanbul:hook", function() {
  return gulp.src(['build/source/**/*.js'])
        // Covering files
      .pipe(istanbul())
      // Force `require` to return covered files
      .pipe(istanbul.hookRequire());
});

gulp.task("cover", function() {
  if (!process.env.CI) return;
  return gulp.src(__dirname + '/coverage/**/lcov.info')
      .pipe(coveralls());
});

//******************************************************************************
//* BAKE
//******************************************************************************
gulp.task("compress", function() {
  return gulp.src(__dirname + "/bundled/source/inversify.js")
             .pipe(uglify({ preserveComments : false }))
             .pipe(gulp.dest(__dirname + "/dist/"))
});

gulp.task("header", function() {

  var pkg = require(__dirname + "/package.json");

  var banner = ["/**",
    " * <%= pkg.name %> v.<%= pkg.version %> - <%= pkg.description %>",
    " * Copyright (c) 2015 <%= pkg.author %>",
    " * <%= pkg.license %> inversify.io/LICENSE",
    " * <%= pkg.homepage %>",
    " */",
    ""].join("\n");

  return gulp.src(__dirname + "/dist/inversify.js")
             .pipe(header(banner, { pkg : pkg } ))
             .pipe(gulp.dest(__dirname + "/dist/"));
});

gulp.task("bake", function(cb) {
  runSequence("bundle", "compress", "header", cb);
});

//******************************************************************************
//* DEFAULT
//******************************************************************************
gulp.task("default", function (cb) {
  runSequence(
    "lint",
    "build-source",
    "build-test",
    "bundle-source",
    "bundle-test",
    "document",
    "istanbul:hook",
    "mocha",
    "cover",
    "compress",
    "header",
    cb);
});

gulp.task("test", function (cb) {
  runSequence(
    "lint",
    "build-source",
    "build-test",
    "document",
    "istanbul:hook",
    "mocha",
    "cover",
    cb);
});
