/* eslint-disable global-require, max-len */
/* global PhusionPassenger */

// getting it to work with passenger: http://goo.gl/FWHFU9
if (typeof(PhusionPassenger) !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
}

const fs = require('fs-extra-promise');
const express = require('express');
const path = require('path');
// var favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const hoganExpress = require('hogan-express');
const winston = require('winston');
const chalk = require('chalk'); // https://github.com/chalk/chalk
const helmet = require('helmet'); // https://github.com/helmetjs/helmet
const Category = require('./models/category');
const router = require('./routes');

const app = express();
app.use(helmet());

// connect to 500px api endpoint
// e.g. const credentials500px = {
//   consumer_key: '123', consumer_secret: '456',
//   token: '789', token_secret: '101112',
// };
let api500px;
if (app.get('env') !== 'test') {
  if (process.env.API500PX_CREDENTIALS === undefined) {
    throw new Error('ERROR: API500PX_CREDENTIALS in env not found');
  }
  const credentials500px = JSON.parse(process.env.API500PX_CREDENTIALS);
  const API500px = require('600px');
  api500px = new API500px(credentials500px);
}

// connect to flickr api endpoint and return it as a promise
if (process.env.FLICKR_API_KEY === undefined) {
  throw new Error('ERROR: FLICKR_API_KEY in env not found');
}
const Flickr = require('flickrapi');
const flickrAPI = new Promise((resolve, reject) => {
  Flickr.tokenOnly({ api_key: process.env.FLICKR_API_KEY }, (err, flickr) => {
    return err === null ? resolve(flickr) : reject(err);
  });
});

// connect to rethinkdb and store connection in app
const dbConfig = require(`${__dirname}/config/db.js`);
dbConfig.db = `${dbConfig.dbName}_${app.get('env')}`; // i.e. newspuppet_development
app.locals.rdb = require('rethinkdbdash')(dbConfig);

// set up category caching
fs.mkdirsAsync('./data')
  .then(() => fs.removeAsync('./public/categories'))
  .then(() => new Promise((resolve, reject) => {
    if (app.get('env') !== 'production') return resolve();
    // for production cache
    return fs.mkdirsAsync('./public/categories')
              .then(() => Category.all(app.locals.rdb))
              .then((categories) => fs.writeFileAsync('./public/categories/index.json', JSON.stringify(categories)))
              .catch((err) => reject(err));
  }))
  .catch((err) => {
    throw err;
  });

// create db, tables and indexes
const dbSchema = require(`${__dirname}/config/dbSchema`);
const dbUtils = require('./utils/db')(app.locals.rdb);
dbUtils.setup(dbConfig.db, dbSchema);

// setup beanstalkd
winston.info('connecting to beanstalkd');
if (app.get('env') !== 'test') {
  const beanstalkdConnector = require('./config/beanstalkdConnector')();
  const workerConfig = ({ rdb: app.locals.rdb,
                          emitter: beanstalkdConnector.emitter,
                          projectDir: __dirname,
                          api500px,
                          flickrAPI,
                        });

  beanstalkdConnector.addHandlers({
    get_feed: require('./bs-handlers/get_feed')(workerConfig),
    load_feed: require('./bs-handlers/load_feed')(workerConfig),
    get_feed_500px: require('./bs-handlers/get_feed_500px')(workerConfig),
    get_feed_flickr: require('./bs-handlers/get_feed_flickr')(workerConfig),
    cache_category: require('./bs-handlers/cache_category')(workerConfig),
    cache_categories: require('./bs-handlers/cache_categories')(workerConfig),
  });
}



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('layout', 'layout');
app.enable('view cache');
app.engine('html', hoganExpress);

if (app.get('env') === 'production') {
  const resManifest = require('./public/resources/resources-manifest-output.json');
  app.resourcesManifest = { application_js: resManifest['application.js'], application_css: resManifest['application.css'] };
}
else {
  app.resourcesManifest = { application_js: 'application.js', application_css: 'application.css' };
}

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(router);

app.use(express.static('public'));

const serverModeMessage = `Server running in NODE_ENV: ${app.get('env')}`;
winston.info(app.get('env') === 'production' ? chalk.white.bgRed.bold(serverModeMessage) : chalk.white.bgBlue.bold(serverModeMessage));

// support hot-loading (only in dev mode)
if (app.get('env') === 'development') {
  const enableHotDevLoading = require('./config/hotDevLoading');
  enableHotDevLoading(app);
}

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res /* , next */) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res /* , next */) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

// getting it to work with passenger: http://goo.gl/FWHFU9
if (typeof(PhusionPassenger) !== 'undefined') {
  app.listen('passenger');
}

module.exports = app;
