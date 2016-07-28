/* eslint-disable global-require, max-len */
/* global PhusionPassenger */

// getting it to work with passenger: http://goo.gl/FWHFU9
if (typeof(PhusionPassenger) !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
}

const express = require('express');
const path = require('path');
// var favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const hoganExpress = require('hogan-express');
const winston = require('winston');
const mkdirp = require('mkdirp-promise');
const chalk = require('chalk'); // https://github.com/chalk/chalk
const helmet = require('helmet'); // https://github.com/helmetjs/helmet

const app = express();
app.use(helmet());

// setup data directories
mkdirp('./data')
  .then(() => mkdirp('./public/data'))
  .catch((err) => winston.error(`Error creating directories ${err}`));

winston.info('connecting to beanstalkd');

// connect to rethinkdb and store connection in app
const dbConfig = require(`${__dirname}/config/db.js`);
dbConfig.db = `${dbConfig.dbName}_${app.get('env')}`; // i.e. newspuppet_development
app.locals.rdb = require('rethinkdbdash')(dbConfig);

// create db, tables and indexes
const dbSchema = require(`${__dirname}/config/dbSchema`);
const dbUtils = require('./utils/db')(app.locals.rdb);
dbUtils.setup(dbConfig.db, dbSchema);

// setup beanstalkd
if (app.get('env') !== 'test') {
  const beanstalkdConnector = require('./config/beanstalkdConnector')();
  const workerConfig = ({ rdb: app.locals.rdb, emitter: beanstalkdConnector.emitter, projectDir: __dirname });

  beanstalkdConnector.addHandlers({
    get_feed: require('./bs-handlers/get_feed')(workerConfig),
    load_feed: require('./bs-handlers/load_feed')(workerConfig),
  });
}

const routes = require('./routes/index');
const categories = require('./routes/categories');

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
app.use(express.static(path.join(__dirname, 'public')));

// IMPORTANT: handle routes in the front end. see react-router https://goo.gl/1CZMd8
// i.e. handle every other route with index.html (search: Configuring Your Server
// TODO: should figure out a better way.. at least autogenerate it.

// frontend
app.use('/', routes);
app.use('/home', routes);
app.use('/category/:id', routes);

// backend
app.use('/categories', categories);

if (app.get('env') === 'development') {
  app.get('*', routes);
}

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
