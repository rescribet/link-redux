var path = require('path');
var libraryName = 'link-react';

module.exports = {
  entry: './src/index.js',
  output: {
    path: './dist',
    filename: libraryName + '.js',
    library: libraryName,
    libraryTarget: 'commonjs2'
  },
  externals: {
    redux: 'redux',
    react: 'react',
    immutable: 'immutable',
    'link-lib': 'link-lib'
  },
  module: {
    rules: [
      {
        test: /(\.js|\.jsx)$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /.json$/,
        use: 'json-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: [
      path.join(__dirname, 'src'),
      'node_modules'
    ]
  }
};
