/* eslint-disable max-len, no-underscore-dangle */
const readFile = require('fs-readfile-promise');
const winston = require('winston');
const md5sum = require('../lib/md5sum');

module.exports = (config) => {
  const { rdb, emitter, projectDir } = config;
  this.type = 'load_feed';

  function _processFeed(data) {
    const feedContents = JSON.parse(data);
    const results = [];

    return new Promise((resolve /* , reject */) => {
      for (const item of feedContents) {
        if (item !== null && item.link !== null) {
          const itemMD5 = md5sum.digest(item.link);
          // console.log(`${itemMD5} - ${item.title}`);
          const newValue = {
            id: itemMD5,
            title: item.title,
            link: item.link,
            pub_date: item.pubdate ? (new Date(item.pubdate)) : new Date(),
          };
          // if it has comments add it
          if (item.comments) newValue.comments = item.comments;

          results.push(newValue);
        }
      }
      resolve(results);
    });
  }

  function _feedItemsMapFor(entries) {
    const results = {};
    for (const entry of entries) {
      results[entry.id] = entry;
    }
    return results;
  }

  // function _insertArticles(articles) {
  //   return rdb.table('feed_items').insert(articles, { conflict: 'update' }).run();
  // }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function _insertArticles(articles) {
    return rdb.table('feed_items').insert(articles).run();
  }

  function _articlesToBeInserted(feedId, entries) {
    // add the feed_id to each article
    const articles = entries.map((entry) => Object.assign({ feed_id: feedId }, entry));

    const feedItemIds = _feedItemsMapFor(articles);

    return new Promise((resolve, reject) => {
      // lookup these IDs to see if we have them already
      rdb.table('feed_items').getAll(...Object.keys(feedItemIds)) // as we have to supply getAll(23,45,33)
                            .pluck('id', 'link')
                            .run()
        .then((feedItems) => {
          // these feedItems ids are in the db as well as the loaded feed
          for (const feedItem of feedItems) {
            delete feedItemIds[feedItem.id]; // so remove it
          }
          // pull out all the values
          const values = Object.keys(feedItemIds).map(key => feedItemIds[key]);
          resolve(values);
        })
        .catch((err) => reject(err));
    });
  }
  function work(payload, callback) {
    let feed;
    let md5Digest;
    let newArticles;

    winston.info(`LOAD_FEED loading feedId:[${payload.feedId}]`);
    rdb.table('feeds').get(payload.feedId).run() // return feed for this feedId
      .then((feedResult) => {
        feed = feedResult;
        md5Digest = md5sum.digest(feed.url);

        const fileName = `${projectDir}/data/${md5Digest}/feed.json`;
        return readFile(fileName);
      })
      .then((data) => _processFeed(data))

      // get a list of articles that need to be inserted
      .then((entries) => _articlesToBeInserted(feed.id, entries))

      // this are articles we have already persisted to the db
      .then((articles) => {
        newArticles = articles;
        return _insertArticles(articles);
      })
      .then((results) => {
        winston.info(`feed_items inserted ${results.inserted} items`);

        // if we are interested in downloading the individual articles go kick them of
        if (feed.downloadable) {
          for (const article of newArticles) {
            const delay = getRandomInt(3, 92);
            emitter.put(0, delay, 60, JSON.stringify(['default', {
              type: 'load_page',
              payload: { feedItemId: article.id,
                        feedDigest: md5Digest,
                        url: article.link },
            }]), (error, jobId) => {
              if (error) throw error;

              winston.info(`feedItemId:${article.id} emitted job [load_page] in ${delay} secs jobId: ${jobId}`);
            });
          }
        }
        callback('success');
      })
      .catch((err) => {
        throw err;
      });
  }

  // TODO: is there a better way to expose private methods for testing???
  let exportFunctions;
  if (process.env.NODE_ENV === 'test') {
    exportFunctions = {
      // when running test, lets expose private functions so we want to test
      _processFeed,
      _articlesToBeInserted,
      _insertArticles,
      _feedItemsMapFor,
      work,
    };
  }
  else {
    exportFunctions = {
      work,
    };
  }
  return exportFunctions;
};
