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
    typedoc     = require("gulp-typedoc"),
    rename      = require("gulp-rename"),
    runSequence = require("run-sequence"),
    header      = require("gulp-header"),
    mocha       = require("gulp-mocha"),
    istanbul    = require("gulp-istanbul");

//******************************************************************************
//* LINT
//******************************************************************************
gulp.task("lint", function() {
    
    var config =  { emitError: (process.env.CI) ? true : false };
    
    return gulp.src([
        "src/**/**.ts",
        "test/**/**.test.ts",
        "type_definitions/**/**.ts"
    ])
    .pipe(tslint())
    .pipe(tslint.report("verbose", config));
});

//******************************************************************************
//* BUILD
//******************************************************************************
var tsProject = tsc.createProject("tsconfig.json");

gulp.task("build-source", function() {
    return gulp.src([
        "src/**/**.ts",
        "typings/browser.d.ts",
        "node_modules/reflect-metadata/reflect-metadata.d.ts"
    ])
    .pipe(tsc(tsProject))
    .on('error', function (err) {
        process.exit(1);
    })
    .js.pipe(gulp.dest("src/"));
});

var tsTestProject = tsc.createProject("tsconfig.json");

gulp.task("build-test", function() {
    return gulp.src([
        "test/**/*.ts",
        "typings/browser.d.ts",
        "node_modules/reflect-metadata/reflect-metadata.d.ts"
    ])
    .pipe(tsc(tsTestProject))
    .on('error', function (err) {
        process.exit(1);
    })
    .js.pipe(gulp.dest("test/"));
});

var tsTypeDefinitionsProject = tsc.createProject("tsconfig.json");

gulp.task("build-type-definitions", function() {
  return gulp.src("type_definitions/**/*.ts")
             .pipe(tsc(tsTypeDefinitionsProject))
             .on('error', function (err) {
                 process.exit(1);
             })
             .js.pipe(gulp.dest("type_definitions/"));
});

gulp.task("build", function(cb) {
  runSequence("lint", "build-source", "build-test", "build-type-definitions", cb);
});

//******************************************************************************
//* DOCUMENT
//******************************************************************************
gulp.task("document", function () {
	return gulp
		.src(["src/*.ts"])
		.pipe(typedoc({ 
			// TypeScript options (see typescript docs) 
            target: "es5",
            module: "commonjs",
            moduleResolution: "node",
            isolatedModules: false,
            jsx: "react",
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            noImplicitAny: false,
            noLib: false,
            preserveConstEnums: true,
            suppressImplicitAnyIndexErrors: true,
			// Output options (see typedoc docs) 
			out: "./documentation",
			name: "InversifyJS",
			version: true
		}));
});

//******************************************************************************
//* BUNDLE
//******************************************************************************
gulp.task("bundle", function () {
    
  var b = browserify({
    standalone : 'inversify',
    entries:  "src/inversify.js",
    debug: true
  });

  return b.bundle()
    .pipe(source("inversify.js"))
    .pipe(buffer())
    .pipe(gulp.dest("bundled/src/"));

});

//******************************************************************************
//* TEST
//******************************************************************************
gulp.task("mocha", function() {
  return gulp.src([
      'node_modules/reflect-metadata/Reflect.js',
      'test/**/*.test.js'
    ])
    .pipe(mocha({ui: 'bdd'}))
    .pipe(istanbul.writeReports());
});

gulp.task("istanbul:hook", function() {
  return gulp.src(['src/**/*.js'])
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
  runSequence("istanbul:hook", "mocha", "cover", cb);
});

//******************************************************************************
//* BAKE
//******************************************************************************
gulp.task("copy", function() {
  return gulp.src("bundled/src/inversify.js")
    .pipe(gulp.dest("dist/"));
});

gulp.task("compress", function() {
  return gulp.src("bundled/src/inversify.js")
             .pipe(uglify({ preserveComments : false }))
             .pipe(rename({
                extname: '.min.js'
              }))
             .pipe(gulp.dest("dist/"))
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

  gulp.src("dist/inversify.js")
             .pipe(header(banner, { pkg : pkg } ))
             .pipe(gulp.dest("dist/"));

  return gulp.src("dist/inversify.min.js")
             .pipe(header(banner, { pkg : pkg } ))
             .pipe(gulp.dest("dist/"));
});

gulp.task("dist", function(cb) {
  runSequence("bundle", "copy", "compress", "header", cb);
});

//******************************************************************************
//* DEFAULT
//******************************************************************************
gulp.task("default", function (cb) {
  runSequence(
    "build",
    "test",
    "dist",
    cb);
});