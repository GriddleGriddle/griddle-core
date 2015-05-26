var webpack = require('webpack');

var exports = {
  plugins: [
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  watch: true,
  output: {
    path: __dirname + '/build/',
    filename: 'griddle.js',
    publicPath: '/build/',
    libraryTarget: 'commonjs2'
  },
  entry: './js/module',
  module: {
    loaders: [
      { test: /\.jsx?$/, loaders: ['babel?{"plugins":["babel-plugin-object-assign"]}'], exclude: /node_modules/ }
    ]
  }
};

module.exports = exports;
