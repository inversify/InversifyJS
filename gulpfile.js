"use strict";

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************

// Enable ES6
require("harmonize")();

var gulp        = require("gulp"),
    browserify  = require("browserify"),
    tsify       = require("tsify"),
    source      = require("vinyl-source-stream"),
    buffer      = require("vinyl-buffer"),
    tslint      = require("gulp-tslint"),
    tsc         = require("gulp-typescript"),
    sourcemaps  = require('gulp-sourcemaps'),
    coveralls   = require("gulp-coveralls"),
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
        "type_definitions/inversify/*.ts"
    ])
    .pipe(tslint())
    .pipe(tslint.report("verbose", config));
});

//******************************************************************************
//* SOURCE
//******************************************************************************
var banner = ["/**",
    " * <%= pkg.name %> v.<%= pkg.version %> - <%= pkg.description %>",
    " * Copyright (c) 2015 <%= pkg.author %>",
    " * <%= pkg.license %> inversify.io/LICENSE",
    " * <%= pkg.homepage %>",
    " */",
    ""].join("\n");
var pkg = require("./package.json");

gulp.task("build-bundle-src", function() {

  var mainTsFilePath = "src/inversify.ts";
  var outputFolder   = "dist/";
  var outputFileName = "inversify.js";

  var bundler = browserify({
    debug: true,
    standalone : "inversify"
  });

  // TS compiler options are in tsconfig.json file
  return bundler.add(mainTsFilePath)
                .plugin(tsify)
                .bundle()
                .pipe(source(outputFileName))
                .pipe(buffer())
                .pipe(sourcemaps.init({ loadMaps: true }))
                .pipe(header(banner, { pkg : pkg } ))
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest(outputFolder));
});

gulp.task("build-bundle-compress-src", function() {

  var mainTsFilePath = "src/inversify.ts";
  var outputFolder   = "dist/";
  var outputFileName = "inversify.min.js";

  var bundler = browserify({
    debug: true,
    standalone : "inversify"
  });

  // TS compiler options are in tsconfig.json file
  return bundler.add(mainTsFilePath)
                .plugin(tsify)
                .bundle()
                .pipe(source(outputFileName))
                .pipe(buffer())
                .pipe(sourcemaps.init({ loadMaps: true }))
                .pipe(uglify())
                .pipe(header(banner, { pkg : pkg } ))
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest(outputFolder));
});

var tsLibProject = tsc.createProject("tsconfig.json", { module : "commonjs" });

gulp.task("build-lib", function() {
    return gulp.src([
        "src/**/*.ts"
    ])
    .pipe(tsc(tsLibProject ))
    .on("error", function (err) {
        process.exit(1);
    })
    .js
      .pipe(header(banner, { pkg : pkg } ))
      .pipe(gulp.dest("lib/"));
});

var tsEsProject = tsc.createProject("tsconfig.json", { module : "es2015" });

gulp.task("build-es", function() {
    return gulp.src([
        "src/**/*.ts"
    ])
    .pipe(tsc(tsEsProject))
    .on("error", function (err) {
        process.exit(1);
    })
    .js
      .pipe(header(banner, { pkg : pkg } ))
      .pipe(gulp.dest("es/"));
});

//******************************************************************************
//* TESTS
//******************************************************************************
var tstProject = tsc.createProject("tsconfig.json");

gulp.task("build-src", function() {
    return gulp.src([
        "src/**/*.ts"
    ])
    .pipe(tsc(tstProject))
    .on("error", function (err) {
        process.exit(1);
    })
    .js.pipe(gulp.dest("src/"));
});

var tsTestProject = tsc.createProject("tsconfig.json");

gulp.task("build-test", function() {
    return gulp.src([
        "test/**/*.ts"
    ])
    .pipe(tsc(tsTestProject))
    .on("error", function (err) {
        process.exit(1);
    })
    .js.pipe(gulp.dest("test/"));
});

gulp.task("mocha", function() {
  return gulp.src([
      "node_modules/reflect-metadata/Reflect.js",
      "test/**/*.test.js"
    ])
    .pipe(mocha({ui: "bdd"}))
    .pipe(istanbul.writeReports());
});

gulp.task("istanbul:hook", function() {
  return gulp.src(["src/**/*.js"])
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
//* TYPE DEFINITIONS
//******************************************************************************
var tsTypeDefinitionsProject = tsc.createProject("tsconfig.json");

gulp.task("build-type-definitions", function() {
  return gulp.src("type_definitions/**/*.ts")
             .pipe(tsc(tsTypeDefinitionsProject))
             .on("error", function (err) {
                 process.exit(1);
             })
             .js.pipe(gulp.dest("type_definitions/"));
});

gulp.task("build", function(cb) {
  runSequence(
      "lint", 
      "build-bundle-src",                       // for nodejs
      "build-bundle-compress-src",              // for browsers
      ["build-src", "build-es", "build-lib"],   // tests + build es and lib
      "build-test", 
      "build-type-definitions", cb);
});

//******************************************************************************
//* DOCS
//******************************************************************************
gulp.task("document", function () {
	return gulp
		.src([
            "src/**/**.ts",
            "typings/browser.d.ts",
            "node_modules/reflect-metadata/reflect-metadata.d.ts"
        ])
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
			out: "./docs",
			name: "InversifyJS",
			version: true,
            theme: "minimal"
		}));
});

//******************************************************************************
//* DEFAULT
//******************************************************************************
gulp.task("default", function (cb) {
  runSequence(
    "build",
    "test",
    cb);
});