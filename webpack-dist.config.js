var webpack = require('webpack');

var reactExternal = {
  root: 'React',
  commonjs2: 'react',
  commonjs: 'react',
  amd: 'react'
};

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
  externals: {
    'react': reactExternal
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      exclude: /node_modules/,
    } ]
  }
};