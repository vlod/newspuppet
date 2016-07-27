/* eslint-disable max-len */
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const ManifestPlugin = require('webpack-manifest-plugin');

const devConfig = require('./webpack.config.js');
devConfig.entry.application = ['./index'];
devConfig.module.loaders = [
  { test: /\.jsx?$/, exclude: 'node_modules', loader: 'babel' },
  { test: /\.css$/, exclude: /node_modules/, loader: ExtractTextPlugin.extract('style', 'css') },
  { test: /\.scss$/, exclude: /node_modules/, loader: ExtractTextPlugin.extract('style', 'css!sass') },
  { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' }, // inline base64 URLs for <=8k images, direct URLs for the rest
];

devConfig.output.filename = 'application-[chunkhash].js';
devConfig.plugins = [
  new ExtractTextPlugin('application-[contenthash].css', { allChunks: true }),
  new WebpackMd5Hash(),
  new ManifestPlugin({ fileName: 'resources-manifest-output.json' }),
  new webpack.DefinePlugin({
    __DEV__: process.env.NODE_ENV !== 'production',
    __PRODUCTION__: process.env.NODE_ENV === 'production',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  }),
];
devConfig.devtool = 'none';

module.exports = devConfig;
