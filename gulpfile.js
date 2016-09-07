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
    sourcemaps  = require("gulp-sourcemaps"),
    uglify      = require("gulp-uglify"),
    rename      = require("gulp-rename"),
    runSequence = require("run-sequence"),
    mocha       = require("gulp-mocha"),
    istanbul    = require("gulp-istanbul"),
    karma       = require("karma");

//******************************************************************************
//* LINT
//******************************************************************************
gulp.task("lint", function() {
    
    var config =  { formatter: "verbose", emitError: (process.env.CI) ? true : false };
    
    return gulp.src([
        "src/**/**.ts",
        "test/**/**.test.ts"
    ])
    .pipe(tslint(config))
    .pipe(tslint.report());
});

//******************************************************************************
//* BUILD
//******************************************************************************
var tsLibProject = tsc.createProject("tsconfig.json", { module : "commonjs", typescript: require("typescript") });

gulp.task("build-lib", function() {
    return gulp.src([
        "typings/index.d.ts",
        "node_modules/reflect-metadata/reflect-metadata.d.ts",
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
        "src/**/*.ts"
    ])
    .pipe(tsc(tsEsProject))
    .on("error", function (err) {
        process.exit(1);
    })
    .js.pipe(gulp.dest("es/"));
});

//******************************************************************************
//* TESTS NODE
//******************************************************************************
var tstProject = tsc.createProject("tsconfig.json", { typescript: require("typescript") });

gulp.task("build-src", function() {
    return gulp.src([
        "typings/index.d.ts",
        "node_modules/reflect-metadata/reflect-metadata.d.ts",
        "src/**/*.ts"
    ])
    .pipe(tsc(tstProject))
    .on("error", function (err) {
        process.exit(1);
    })
    .js.pipe(gulp.dest("src/"));
});

var tsTestProject = tsc.createProject("tsconfig.json", { typescript: require("typescript") });

gulp.task("build-test", function() {
    return gulp.src([
        "typings/index.d.ts",
        "node_modules/reflect-metadata/reflect-metadata.d.ts",
        "test/**/*.ts"
    ])
    .pipe(tsc(tsTestProject))
    .on("error", function (err) {
        process.exit(1);
    })
    .js.pipe(gulp.dest("test/"));
});

gulp.task("mocha", [ "istanbul:hook" ], function() {
  return gulp.src([
      "node_modules/reflect-metadata/Reflect.js",
      "test/**/*.test.js"
    ])
    .pipe(mocha({ui: "bdd"}))
    .pipe(istanbul.writeReports());
});

gulp.task("istanbul:hook", function() {
  return gulp.src(["src/**/*.js"])
      .pipe(istanbul())
      .pipe(sourcemaps.write("."))
      .pipe(istanbul.hookRequire());
});

//******************************************************************************
//* TESTS BROWSER
//******************************************************************************
gulp.task("build-bundle-test", function() {

  var mainTsFilePath = "test/inversify.test.ts";
  var outputFolder   = "temp/";
  var outputFileName = "bundle.test.js";

  var bundler = browserify({
    debug: true,
    standalone : "inversify"
  });

  // TS compiler options are in tsconfig.json file
  return bundler.add(mainTsFilePath)
                .plugin(tsify, { typescript: require("typescript") })
                .bundle()
                .pipe(source(outputFileName))
                .pipe(buffer())
                .pipe(sourcemaps.init({ loadMaps: true }))
                .pipe(sourcemaps.write("."))
                .pipe(gulp.dest(outputFolder));
});

gulp.task("karma", ["build-bundle-test"], function (done) {
  new karma.Server({
    configFile: __dirname + "/karma.conf.js"
  }, function(code) {
        if (code === 1){
           console.log('Browser test failures, exiting process');
           done('Browser test Failures');
        } else {
            console.log('Browser tests passed');
            done();
        }
    }).start();
});

// Run browser testings on AppVeyor not in Travis CI
if (process.env.APPVEYOR) {
    gulp.task("test", function(cb) {
        runSequence("mocha", "karma", cb);
    });
} else {
    gulp.task("test", function(cb) {
        runSequence("mocha", cb);
    });
}

//******************************************************************************
//* DEFAULT
//******************************************************************************
gulp.task("build", function(cb) {
  runSequence(
      "lint", 
      ["build-src", "build-es", "build-lib"],   // tests + build es and lib
      "build-test", cb);
});

gulp.task("default", function (cb) {
  runSequence(
    "build",
    "test",
    cb);
});
