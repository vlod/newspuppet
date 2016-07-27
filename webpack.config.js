/* eslint-disable max-len */

const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: path.resolve('client'),

  entry: {
    application: [
      'webpack-hot-middleware/client',
      './index.jsx',
    ],
  },
  output: {
    path: path.resolve('public/resources'), // where to write filename
    filename: 'application.js',
    publicPath: '/resources/', // maps the browser request url to path above
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel' },
      { test: /\.css$/, exclude: /node_modules/, loader: 'style!css' },
      { test: /\.scss$/, exclude: /node_modules/, loader: 'style!css!sass' },
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' }, // inline base64 URLs for <=8k images, direct URLs for the rest
    ],
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __DEV__: process.env.NODE_ENV !== 'production',
      __PRODUCTION__: process.env.NODE_ENV === 'production',
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ],
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
};
