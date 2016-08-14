/* eslint-disable max-len */
const winston = require('winston');
const md5sum = require('./lib/md5sum');

// connect to rethinkdb and store connection in app
const dbConfig = require('./config/db.js');
dbConfig.db = `${dbConfig.dbName}_${process.env.NODE_ENV}`;
const rdb = require('rethinkdbdash')(dbConfig);

const dbSeed = require('./utils/dbSeed')(rdb);

const data = [
  { id: 1, type: 'TEXT', name: 'Hacker News', url: 'https://news.ycombinator.com/rss', site_url: 'https://news.ycombinator.com/news', icon: 'https://news.ycombinator.com/favicon.ico' },
  { id: 2, type: 'TEXT', name: 'BBC news', url: 'http://feeds.bbci.co.uk/news/rss.xml?edition=us', site_url: 'http://www.bbc.com/news', icon: 'http://static.bbci.co.uk/news/1.142.0531/apple-touch-icon-57x57-precomposed.png' },
  { id: 3, type: 'TEXT', name: 'Washington Post', url: 'http://feeds.washingtonpost.com/rss/national', site_url: 'https://www.washingtonpost.com', icon: 'http://img.washingtonpost.com/wp-stat/classic300.png' },
  { id: 4, type: 'TEXT', name: 'Ars Technica', url: 'http://arstechnica.com/feed/', site_url: 'http://arstechnica.com', icon: 'https://cdn.arstechnica.net/favicon.ico' },
  { id: 5, type: 'TEXT', name: 'Engadget', url: 'https://www.engadget.com/rss.xml', site_url: 'https://www.engadget.com', icon: 'https://s.blogsmithmedia.com/www.engadget.com/assets-hf61d9e81fcb37daa994d38e5f73fea61/images/apple-touch-icon-57x57.png'},
  { id: 6, type: 'TEXT', name: 'Gizmodo', url: 'http://feeds.gawker.com/gizmodo/full', site_url: 'http://gizmodo.com', icon: 'https://i.kinja-img.com/gawker-media/image/upload/s--O07tru6M--/c_fill,fl_progressive,g_center,h_80,q_80,w_80/fdj3buryz5nuzyf2k620.png'},
  { id: 7, type: 'TEXT', name: 'Techcrunch', url: 'https://techcrunch.com/feed/', site_url: 'https://techcrunch.com', icon: 'https://s0.wp.com/wp-content/themes/vip/techcrunch-2013/assets/images/homescreen_TCIcon.png' },
  { id: 8, type: 'TEXT', name: 'ReadWrite', url: 'http://readwrite.com/feed/', site_url: 'http://readwrite.com', icon: 'http://15809-presscdn-0-93.pagely.netdna-cdn.com/wp-content/themes/readwrite/favicon.png' },
  { id: 9, type: 'TEXT', name: 'TheNextWeb', url: 'http://feeds2.feedburner.com/thenextweb', site_url: 'http://thenextweb.com', icon: 'http://cdn1.tnwcdn.com/wp-content/themes/cyberdelia/assets/icons/apple-touch-icon-57x57.png?v=1470647965' },
  { id: 10, type: 'TEXT', name: 'TheVerge', url: 'http://www.theverge.com/rss/full.xml', site_url: 'http://www.theverge.com', icon: 'https://cdn0.vox-cdn.com/images/verge/2.0/iphone-touch-icon.v3486ec7.png' },
  { id: 11, type: 'IMAGE', name: '500px Popular', url: 'https://api.500px.com/v1/photos', site_url: 'https://500px.com/popular', icon: 'https://assetcdn.500px.org/assets/favicon-7d8942fba5c5649f91a595d0fc749c83.ico' },
  { id: 12, type: 'TEXT', name: 'recode', url: 'http://www.recode.net/rss/index.xml', site_url: 'http://www.recode.net', icon: 'https://cdn0.vox-cdn.com/uploads/chorus_asset/file/6397031/recode_favicon-64.0.png' },
  { id: 13, type: 'IMAGE', name: 'Flickr Interesting', url: 'https://api.flickr.com/services/rest/?method=flickr.interestingness.getList', site_url: 'https://www.flickr.com/explore', icon: 'https://www.flickr.com/apple-touch-icon.png' },
  { id: 14, type: 'TEXT', name: 'Lifehacker', url: 'http://feeds.gawker.com/lifehacker/full', site_url: 'http://lifehacker.com', icon: 'https://i.kinja-img.com/gawker-media/image/upload/s--N2eqEvT8--/c_fill,fl_progressive,g_center,h_80,q_80,w_80/u0939doeuioaqhspkjyc.png' },
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
  { id: 5, name: 'Photos', feeds: [11, 13], priority: 6 },
  { id: 6, name: 'Productivity', feeds: [14], priority: 5 },
], (results) => {
  winston.info(`results: ${JSON.stringify(results)}`);
  rdb.getPoolMaster().drain();
});
