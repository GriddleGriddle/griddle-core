var webpack = require('webpack');

var currentEnv = process.env['NODE_ENV'];

var env = {
  production: currentEnv === 'production',
  development: currentEnv === 'development'
};

var entry = null;
var plugins = [];
var moduleLoaders = null;
var output = {
    path: __dirname + '/build/',
    filename: 'griddle.js',
    publicPath: '/build/'
};

if(env.production){
  plugins.push(new webpack.optimize.DedupePlugin());
  plugins.push(new webpack.optimize.UglifyJsPlugin({ output: {comments: false} }));
  moduleLoaders = {
    loaders: [
      { test: /\.jsx?$/, loaders: ['babel'], exclude: /node_modules/ }
    ]
  };
  output.libraryTarget = 'commonjs2';
  entry = './js/module';
} else {
  plugins.push(new webpack.HotModuleReplacementPlugin()),
  plugins.push(new webpack.NoErrorsPlugin())
  moduleLoaders ={
    loaders: [
      { test: /\.jsx?$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/ }
    ]
  };
  entry = [
      'webpack-dev-server/client?http://localhost:3000',
      'webpack/hot/only-dev-server',
      './js/index'
    ]
}

var exports = {
  devtool: 'source-map',
  plugins: plugins,
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  output: output,
  entry: entry,
  module: moduleLoaders
};

module.exports = exports;
