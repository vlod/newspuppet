/* eslint-disable max-len */
const _ = require('lodash');
const winston = require('winston');

// util to create a database, tables and indexes
// Usage:
// const dbUtils = require('./utils/db')(app.locals.rdb);
// dbUtils.setup(config.rethinkdb.db, {
//   'sessions':[],
//   'users':['email'],
//   'password_reset':['userId'],
//   'ambassadors':[]
// });
// TODO: should be its own npm module

module.exports = (rdb) => {
  function createIndex(table, index) {
    rdb.table(table)
      .indexCreate(index).run()
        .then(() => {
          winston.info('- creating index', { index, table });
          return true;
        });
  }

  function dropIndex(table, index) {
    rdb.table(table)
      .indexDrop(index).run()
        .then(() => {
          winston.info('- dropped index', { index, table });
          return true;
        });
  }

  return {
    setup: (dbName, schema) => {
      // set up the dbase if we can't find it
      rdb.dbList().run()
        .then((dbNames) => {
          for (let i = 0; i < dbName.length; i++) {
            if (dbNames[i] === dbName) return true;
          }
          // can't find dbase, lets create it
          winston.info(' - database not found, creating:', { dbName });
          rdb.dbCreate(dbName).run();

          return true;
        })
        .then(() => {
          rdb.tableList().run()
            .then((dbTables) => {
              const tables = {};
              // build up a list of tables
              for (const table of dbTables) {
                tables[table] = true;
              }
              _.forOwn(schema, (indexes, tableName) => {
                // dont have this table and therefor all its indexes
                if (_.isUndefined(tables[tableName])) {
                  winston.info(' - creating table:', { tableName });
                  rdb.tableCreate(tableName).run()
                    .then(() => {
                      // now create its indexes
                      for (const index of indexes) {
                        createIndex(tableName, index);
                      }
                      return true;
                    });
                }
                else {
                  rdb.table(tableName).indexList().run()
                    .then((indexList) => {
                      const dbIndexes = {};

                      for (const index of indexList) {
                        dbIndexes[index] = true;
                      }
                      for (const index of indexes) {
                        if (_.isUndefined(dbIndexes[index])) {
                          createIndex(tableName, index);
                        }
                        else {
                          // remove index from list as we need to track indexes in the dbase but that are no longer in the defintiion
                          delete dbIndexes[index];
                        }
                      }
                      // drop indexes as no longer present in the defintion
                      _.forOwn(dbIndexes, (val, indexName) => {
                        dropIndex(tableName, indexName);
                      });
                    });
                }
              });
            });
        });
    },
  };
};
