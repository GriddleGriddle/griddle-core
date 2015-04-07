module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'browserify'],
    files: [
      './node_modules/phantomjs-polyfill/bind-polyfill.js',
      'test/**/*.js'
    ],
    exclude: [
    ],
    preprocessors: {
      'js/**/*.js': ['browserify', 'babel'],
      'test/**/*.js': ['browserify', 'babel']
    },

    "babelPreprocessor": {
      options: {
        sourceMap: "inline"
      },
      filename: function(file) {
        return file.originalPath.replace(/\.js$/, ".es5.js");
      },
      sourceFileName: function(file) {
        return file.originalPath;
      }
    },

    browserify: {
      debug: true,
      transform: [ 'babelify' ]
    },

    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: false
  });
};
