/* eslint-disable max-len */
const winston = require('winston');
const md5sum = require('./lib/md5sum');

// connect to rethinkdb and store connection in app
const dbConfig = require('./config/db.js');
dbConfig.db = `${dbConfig.dbName}_${process.env.NODE_ENV}`;
const rdb = require('rethinkdbdash')(dbConfig);

const dbSeed = require('./utils/dbSeed')(rdb);

const data = [
  { id: 1, name: 'Hacker News', url: 'https://news.ycombinator.com/rss' },
  { id: 2, name: 'BBC news', url: 'http://feeds.bbci.co.uk/news/rss.xml?edition=us' },
  { id: 3, name: 'Washington Post', url: 'http://feeds.washingtonpost.com/rss/national' },
  { id: 4, name: 'Ars Technica', url: 'http://arstechnica.com/feed/' },
  { id: 5, name: 'Engadget', url: 'https://www.engadget.com/rss.xml' },
  { id: 6, name: 'Gizmodo', url: 'http://feeds.gawker.com/gizmodo/full' },
  { id: 7, name: 'Techcrunch', url: 'https://techcrunch.com/feed/' },
  { id: 8, name: 'ReadWrite', url: 'http://readwrite.com/feed/' },
  { id: 9, name: 'TheNextWeb', url: 'http://feeds2.feedburner.com/thenextweb' },
  { id: 10, name: 'TheVerge', url: 'http://www.theverge.com/rss/full.xml' },
];
// add hash
for (const entry of data) {
  entry.hash = md5sum.digest(entry.url);
}

dbSeed.run(dbConfig.db, 'feeds', data, (results) => {
  winston.info(`results: ${JSON.stringify(results)}`);
  rdb.getPoolMaster().drain();
});

dbSeed.run(dbConfig.db, 'categories', [
  { id: 1, name: 'Entrepreneurship', feeds: [1, 7], priority: 2 },
  { id: 2, name: 'Headline News', feeds: [2, 3], priority: 1 },
  { id: 3, name: 'Tech', feeds: [4, 6, 5], priority: 3 },
  { id: 4, name: 'Web', feeds: [8, 9, 10], priority: 4 },
], (results) => {
  winston.info(`results: ${JSON.stringify(results)}`);
  rdb.getPoolMaster().drain();
});
