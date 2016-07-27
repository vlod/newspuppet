/* eslint-disable max-len */
const rethinkdbdash = require('rethinkdbdash');
const dbUtils = require('./db');
const dbSchema = require(`${__dirname}/../config/dbSchema`);

// connect to rethinkdb and store connection in app
const dbConfig = require(`${__dirname}/../config/db.js`);
dbConfig.db = `${dbConfig.dbName}_${process.env.NODE_ENV}`; // i.e. newspuppet_development
const rdbENV = rethinkdbdash(dbConfig);

// create db, tables and indexes
let dbConn = dbUtils(rdbENV);
dbConn.setup(dbConfig.db, dbSchema);

setTimeout(() => {
  rdbENV.getPoolMaster().drain();
}, 500);

// if we are in development, create the test db schema as well
if (process.env.NODE_ENV === 'development') {
  dbConfig.db = `${dbConfig.dbName}_test`;
  const rdbTEST = rethinkdbdash(dbConfig);
  dbConn = dbUtils(rdbTEST);

  // create db, tables and indexes
  dbConn.setup(dbConfig.db, dbSchema);
  setTimeout(() => {
    rdbTEST.getPoolMaster().drain();
  }, 500);
}
