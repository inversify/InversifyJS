"use strict";

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************

// Enable ES6
require("harmonize")();

var gulp        = require("gulp"),
    tslint      = require("gulp-tslint"),
    tsc         = require("gulp-typescript"),
    codecov     = require("gulp-codecov"),
    uglify      = require("gulp-uglify"),
    typedoc     = require("gulp-typedoc"),
    rename      = require("gulp-rename"),
    runSequence = require("run-sequence"),
    mocha       = require("gulp-mocha"),
    istanbul    = require("gulp-istanbul");

//******************************************************************************
//* LINT
//******************************************************************************
gulp.task("lint", function() {
    
    var config =  { emitError: (process.env.CI) ? true : false };
    
    return gulp.src([
        "src/**/**.ts",
        "test/**/**.test.ts"
    ])
    .pipe(tslint())
    .pipe(tslint.report("verbose", config));
});

//******************************************************************************
//* SOURCE
//******************************************************************************
var tsLibProject = tsc.createProject("tsconfig.json", { module : "commonjs", typescript: require("typescript") });

gulp.task("build-lib", function() {
    return gulp.src([
        "typings/index.d.ts",
        "node_modules/reflect-metadata/reflect-metadata.d.ts",
        "src/interfaces/globals.d.ts",
        "src/**/*.ts"
    ])
    .pipe(tsc(tsLibProject))
    .on("error", function (err) {
        process.exit(1);
    })
    .js.pipe(gulp.dest("lib/"));
});

var tsEsProject = tsc.createProject("tsconfig.json", { module : "es2015", typescript: require("typescript") });

gulp.task("build-es", function() {
    return gulp.src([
        "typings/index.d.ts",
        "node_modules/reflect-metadata/reflect-metadata.d.ts",
        "src/interfaces/globals.d.ts",
        "src/**/*.ts"
    ])
    .pipe(tsc(tsEsProject))
    .on("error", function (err) {
        process.exit(1);
    })
    .js.pipe(gulp.dest("es/"));
});

//******************************************************************************
//* TESTS
//******************************************************************************
var tstProject = tsc.createProject("tsconfig.json");

gulp.task("build-src", function() {
    return gulp.src([
        "typings/index.d.ts",
        "node_modules/reflect-metadata/reflect-metadata.d.ts",
        "src/interfaces/globals.d.ts",
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
        "typings/index.d.ts",
        "node_modules/reflect-metadata/reflect-metadata.d.ts",
        "src/interfaces/globals.d.ts",
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
      .pipe(codecov());
});

gulp.task("test", function(cb) {
  runSequence("istanbul:hook", "mocha", "cover", cb);
});

gulp.task("build", function(cb) {
  runSequence(
      "lint",
      ["build-src", "build-es", "build-lib"],   // tests + build es and lib
      "build-test", cb);
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
            target: "es6",
            module: "commonjs",
            moduleResolution: "node",
            isolatedModules: false,
            jsx: "react",
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            noImplicitAny: true,
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
