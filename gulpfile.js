"use strict";

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************
var gulp        = require("gulp"),
    fs          = require("fs"),
    browserify  = require("browserify"),
    source      = require("vinyl-source-stream"),
    buffer      = require("vinyl-buffer"),
    run         = require("gulp-run"),
    tslint      = require("gulp-tslint"),
    tsc         = require("gulp-typescript"),
    karma       = require("karma").server,
    uglify      = require("gulp-uglify"),
    docco       = require("gulp-docco"),
    runSequence = require("run-sequence"),
    header      = require("gulp-header"),
    pkg         = require(__dirname + "/package.json");

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
  target : "ES3",
  module : "commonjs",
  declarationFiles : false
});

gulp.task("build-source", function() {
  return gulp.src(__dirname + "/source/**/**.ts")
             .pipe(tsc(tsProject))
             .js.pipe(gulp.dest(__dirname + "/build/source/"));
});

gulp.task("build-test", function() {
  return gulp.src(__dirname + "/test/*.test.ts")
             .pipe(tsc(tsProject))
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
    entries: __dirname + "/build/source/inversify.js",
    debug: true
  });

  return b.bundle()
    .pipe(source("inversify.js"))
    .pipe(buffer())
    .pipe(gulp.dest(__dirname + "/bundled/source/"));
});

gulp.task("bundle-test", function (cb) {

  var path = __dirname + "/build/test/"
  fs.readdir(path, function (err, files) {
      if (err) {
          throw err;
      }
      files.forEach(function (file) {
        if(file.indexOf(".test.js") != -1) {

          var b = browserify({
            entries: path + file,
            debug: true
          });

          b.bundle()
           .pipe(source(file))
           .pipe(buffer())
           .pipe(gulp.dest(__dirname + "/bundled/test/"));
        }
      });
      cb();
  });
});

gulp.task("bundle", function(cb) {
  runSequence("build", "bundle-source", "bundle-test", "document", cb);
});

//******************************************************************************
//* TEST
//******************************************************************************
gulp.task("karma", function(cb) {
  karma.start({
    configFile : __dirname + "/karma.conf.js",
    singleRun: true
  }, cb);
});

gulp.task("test", function(cb) {
  runSequence("bundle", "karma", "cover", cb);
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
    "karma",
    "compress",
    "header",
    cb);
});
