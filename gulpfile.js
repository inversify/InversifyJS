"use strict";

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************

// Enable ES6
require("harmonize")(["harmony", "harmony-proxies", "harmony_proxies"]);

var gulp        = require("gulp"),
    browserify  = require("browserify"),
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
        "src/**/*.ts"
    ])
    .pipe(tsLibProject())
    .on("error", function (err) {
        process.exit(1);
    })
    .js.pipe(gulp.dest("lib/"));
});

var tsAmdProject = tsc.createProject("tsconfig.json", { module : "amd", typescript: require("typescript") });

gulp.task("build-amd", function() {
    return gulp.src([
        "src/**/*.ts"
    ])
    .pipe(tsAmdProject())
    .on("error", function (err) {
        process.exit(1);
    })
    .js.pipe(gulp.dest("amd/"));
});

var tsEsProject = tsc.createProject("tsconfig.json", { module : "es2015", typescript: require("typescript") });

gulp.task("build-es", function() {
    return gulp.src([
        "src/**/*.ts"
    ])
    .pipe(tsEsProject())
    .on("error", function (err) {
        process.exit(1);
    })
    .js.pipe(gulp.dest("es/"));
});

var tsDtsProject = tsc.createProject("tsconfig.json", {
    declaration: true,
    noResolve: false,
    typescript: require("typescript") 
});

gulp.task("build-dts", function() {
    return gulp.src([
        "src/**/*.ts"
    ])
    .pipe(tsDtsProject())
    .on("error", function (err) {
        process.exit(1);
    })
    .dts.pipe(gulp.dest("dts"));

});

//******************************************************************************
//* TESTS NODE
//******************************************************************************
var tstProject = tsc.createProject("tsconfig.json", { typescript: require("typescript") });

gulp.task("build-src", function() {
    return gulp.src([
        "src/**/*.ts"
    ])
    .pipe(sourcemaps.init())
    .pipe(tstProject())
    .on("error", function (err) {
        process.exit(1);
    })
    .js.pipe(sourcemaps.write())
    .pipe(gulp.dest("src/"));
});

var tsTestProject = tsc.createProject("tsconfig.json", { typescript: require("typescript") });

gulp.task("build-test", function() {
    return gulp.src([
        "test/**/*.ts"
    ])
    .pipe(sourcemaps.init())
    .pipe(tsTestProject())
    .on("error", function (err) {
        process.exit(1);
    })
    .js.pipe(sourcemaps.write())
    .pipe(gulp.dest("test/"));
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
gulp.task("bundle-test", function() {

  var mainJsFilePath = "test/inversify.test.js";
  var outputFolder   = "temp/";
  var outputFileName = "bundle.test.js";

  var bundler = browserify({
    debug: true,
    standalone : "inversify"
  });

  return bundler.add(mainJsFilePath)
                .bundle()
                .pipe(source(outputFileName))
                .pipe(buffer())
                .pipe(sourcemaps.init({ loadMaps: true }))
                .pipe(sourcemaps.write("."))
                .pipe(gulp.dest(outputFolder));
});

gulp.task("karma", ["bundle-test"], function (done) {
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
        [
            "build-src",
            "build-es",
            "build-lib",
            "build-amd",
            "build-dts"
        ],
        "build-test", cb
    );
});

gulp.task("default", function (cb) {
  runSequence(
    "build",
    "test",
    cb);
});
