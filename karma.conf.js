var browsers = [
  // 'Firefox',
  'Chrome',
  'IE',
  'PhantomJS'
];

var plugins = [
  'karma-mocha-reporter',
  'karma-mocha',
  'karma-chai',
  'karma-sinon',
  'karma-firefox-launcher',
  'karma-chrome-launcher',
  'karma-ie-launcher',
  'karma-phantomjs-launcher',
  'karma-es6-shim'
];

module.exports = function (config) {

  'use strict';

  config.set({
    singleRun: true,
    basePath: '',
    frameworks: ['mocha', 'chai', 'sinon', 'es6-shim'],
    browsers: browsers,
    reporters: ['mocha'],
    plugins: plugins,
    files: [
      { pattern: 'node_modules/reflect-metadata/Reflect.js', include: true },
      { pattern: 'test/bundle.test.js', included: true }
    ],
    port: 9876,
    colors: true,
    autoWatch: false,
    logLevel: config.LOG_INFO
  });

};
