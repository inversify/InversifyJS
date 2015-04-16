module.exports = function (config) {
  'use strict';

  var testFiles = __dirname + '/bundled/test/*.test.js',
      coverageFolder = __dirname + '/bundled/test/*.test.js';

  config.set({
      basePath: '',
      frameworks: ['mocha', 'chai', 'sinon'],
      browsers: ['PhantomJS'],
      reporters: ['progress', 'coverage'],
      coverageReporter: {
        type : 'text',
        dir : coverageFolder,
        file : 'coverage.txt'
      },
      plugins : [
        'karma-coverage',
        'karma-mocha',
        'karma-chai',
        'karma-sinon',
        'karma-phantomjs-launcher'
      ],
      preprocessors: {
        testFiles : ['coverage']
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
