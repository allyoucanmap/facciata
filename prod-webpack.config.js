const path = require('path');
const DefinePlugin = require("webpack/lib/DefinePlugin");
const ParallelUglifyPlugin = require("webpack-parallel-uglify-plugin");

let webpackConfig = require('./webpack.config.js');

webpackConfig.entry = [
  './client.js'
];

webpackConfig.output = {
  path: path.join(__dirname, 'dist'),
  filename: 'facciata.js',
  publicPath: ''
};

webpackConfig.plugins = [
  new DefinePlugin({
    'process.env': {
      NODE_ENV: '"production"'
    }
  }),
  new ParallelUglifyPlugin({
    uglifyES: {
      sourceMap: false,
      compress: {warnings: false},
      mangle: true
    }
  })
];

webpackConfig.devtool = undefined;

module.exports = webpackConfig;
