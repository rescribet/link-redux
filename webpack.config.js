var path = require('path');
var libraryName = 'link-redux';

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve('./dist'),
    filename: libraryName + '.js',
    library: libraryName,
    libraryTarget: 'commonjs2'
  },
  externals: {
    // Runtime
    redux: 'redux',
    react: 'react',
    'react-redux': 'react-redux',
    rdflib: 'rdflib',
    'link-lib': 'link-lib',

    // Testtime
    chai: 'chai',
    enzyme: 'enzyme',
    'chai-enzyme': 'chai-enzyme',
    'sinon-chai': 'sinon-chai',
    immutable: 'immutable',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true,
    'react-addons-test-utils': 'react-dom',
    'redux-immutable': 'redux-immutable'
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
