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
    rename      = require("gulp-rename"),
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
var tsProject = tsc.createProject("tsconfig.json");

gulp.task("build-source", function() {
  return gulp.src(__dirname + "/source/**/**.ts")
             .pipe(tsc(tsProject))
             .js.pipe(gulp.dest(__dirname + "/build/source/"));
});

var tsTestProject = tsc.createProject("tsconfig.json");

gulp.task("build-test", function() {
  return gulp.src(__dirname + "/test/**/*.ts")
             .pipe(tsc(tsTestProject))
             .js.pipe(gulp.dest(__dirname + "/build/test/"));
});

var tsTypeDefinitionsProject = tsc.createProject("tsconfig.json");

gulp.task("build-type-definitions", function() {
  return gulp.src(__dirname + "/type_definitions/**/*.ts")
             .pipe(tsc(tsTypeDefinitionsProject))
             .js.pipe(gulp.dest(__dirname + "/build/type_definitions/"));
});

gulp.task("build", function(cb) {
  runSequence("build-source", "build-test", "build-type-definitions", cb);
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
gulp.task("bundle", function () {
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
  return gulp.src("coverage/**/lcov.info")
      .pipe(coveralls());
});

gulp.task("test", function(cb) {
  runSequence("build", "istanbul:hook", "mocha", "cover", cb);
});

//******************************************************************************
//* BAKE
//******************************************************************************
gulp.task("copy", function() {
  return gulp.src(__dirname + "/bundled/source/inversify.js")
    .pipe(gulp.dest(__dirname + "/dist/"));
});

gulp.task("compress", function() {
  return gulp.src(__dirname + "/bundled/source/inversify.js")
             .pipe(uglify({ preserveComments : false }))
             .pipe(rename({
                extname: '.min.js'
              }))
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

  gulp.src(__dirname + "/dist/inversify.js")
             .pipe(header(banner, { pkg : pkg } ))
             .pipe(gulp.dest(__dirname + "/dist/"));

  return gulp.src(__dirname + "/dist/inversify.min.js")
             .pipe(header(banner, { pkg : pkg } ))
             .pipe(gulp.dest(__dirname + "/dist/"));
});

gulp.task("dist", function(cb) {
  runSequence("bundle", "copy", "compress", "header", "document", cb);
});

//******************************************************************************
//* DEFAULT
//******************************************************************************
gulp.task("default", function (cb) {
  runSequence(
    "lint",
    "build",
    "test",
    "dist",
    cb);
});
