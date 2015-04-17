module.exports = function (config) {
  'use strict';

  var testFiles = __dirname + '/bundled/test/**/*.test.js',
      coverageFolder = __dirname + '/coverage/';

  config.set({
      basePath: '',
      frameworks: ['mocha', 'chai', 'sinon'],
      browsers: ['PhantomJS'],
      reporters: ['progress', 'coverage'],
      coverageReporter: {
        type : 'lcov',
        dir : coverageFolder,
      },
      plugins : [
        'karma-coverage',
        'karma-mocha',
        'karma-chai',
        'karma-sinon',
        'karma-phantomjs-launcher'
      ],
      preprocessors: {
        '**/bundled/test/**/*.test.js' : 'coverage'
      },
      files : [
        testFiles
      ],
      port: 9876,
      colors: true,
      autoWatch: false,
      logLevel: config.LOG_INFO
  });
};
