// util to create a seed a database
// Usage:
// dbSeed.run(config.rethinkdb.db, 'feeds', [
//   { id: 1, name: 'Hacker News', url: 'https://news.ycombinator.com/rss' },
//   { id: 2, name: 'BBC news', url: 'http://feeds.bbci.co.uk/news/technology/rss.xml' },
// ], (results) => {
//   console.log(`results: ${JSON.stringify(results)}`);
//   rdb.getPoolMaster().drain();
// });

module.exports = (rdb) => {
  return {
    run: (dbName, tableName, dataRows, callback) => {
      rdb.table(tableName).insert(dataRows, { conflict: 'replace' }).run()
        .then((results) => {
          callback(results);
        });
    },
  };
};
