var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: './js/module',
  output: {
    path: __dirname + '/build/',
    filename: 'griddle.js',
    publicPath: '/build/',
    libraryTarget: 'commonjs2'
  },
  plugins: [
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      exclude: /node_modules/,
    } ]
  }
};