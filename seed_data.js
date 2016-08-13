/* eslint-disable max-len */
const winston = require('winston');
const md5sum = require('./lib/md5sum');

// connect to rethinkdb and store connection in app
const dbConfig = require('./config/db.js');
dbConfig.db = `${dbConfig.dbName}_${process.env.NODE_ENV}`;
const rdb = require('rethinkdbdash')(dbConfig);

const dbSeed = require('./utils/dbSeed')(rdb);

const data = [
  { id: 1, type: 'TEXT', name: 'Hacker News', url: 'https://news.ycombinator.com/rss' },
  { id: 2, type: 'TEXT', name: 'BBC news', url: 'http://feeds.bbci.co.uk/news/rss.xml?edition=us' },
  { id: 3, type: 'TEXT', name: 'Washington Post', url: 'http://feeds.washingtonpost.com/rss/national' },
  { id: 4, type: 'TEXT', name: 'Ars Technica', url: 'http://arstechnica.com/feed/' },
  { id: 5, type: 'TEXT', name: 'Engadget', url: 'https://www.engadget.com/rss.xml' },
  { id: 6, type: 'TEXT', name: 'Gizmodo', url: 'http://feeds.gawker.com/gizmodo/full' },
  { id: 7, type: 'TEXT', name: 'Techcrunch', url: 'https://techcrunch.com/feed/' },
  { id: 8, type: 'TEXT', name: 'ReadWrite', url: 'http://readwrite.com/feed/' },
  { id: 9, type: 'TEXT', name: 'TheNextWeb', url: 'http://feeds2.feedburner.com/thenextweb' },
  { id: 10, type: 'TEXT', name: 'TheVerge', url: 'http://www.theverge.com/rss/full.xml' },
  { id: 11, type: 'IMAGE', name: '500px Popular', url: 'https://api.500px.com/v1/photos' },
  { id: 12, type: 'TEXT', name: 'recode', url: 'http://www.recode.net/rss/index.xml' },
  { id: 13, type: 'IMAGE', name: 'Flickr Interesting', url: 'https://api.flickr.com/services/rest/?method=flickr.interestingness.getList' },
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
  { id: 4, name: 'Web', feeds: [10, 8, 9, 12], priority: 4 },
  { id: 5, name: 'Photos', feeds: [11, 13], priority: 5 },
], (results) => {
  winston.info(`results: ${JSON.stringify(results)}`);
  rdb.getPoolMaster().drain();
});
