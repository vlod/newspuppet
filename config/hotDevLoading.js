const winston = require('winston');

const webpack = require('webpack');
const webpackConfig = require('../webpack.config');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

module.exports = (app) => {
  winston.info('node running in development, using webpack-dev-middleware');

  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: '/resources',
    stats: { colors: true },
  }));
  app.use(webpackHotMiddleware(compiler, {
    log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000,
  }));
};