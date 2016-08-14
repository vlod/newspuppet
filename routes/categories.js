/* eslint-disable new-cap */

const express = require('express');
const router = express.Router();

const BASE_TEN_RADIX = 10; // for parseInt() https://goo.gl/5i2Fz

function getFeedItemsFor(rdb, feedId, limit = 24) {
  return rdb.table('feed_items')
              .getAll(feedId, { index: 'feed_id' })
              .pluck(['id', 'link', 'title', 'feed_id', 'pub_date', 'comments', 'image_url'])
              .orderBy(rdb.desc('pub_date'))
              .limit(limit);
}

/* GET users listing. */
router.get('/', (req, res /* , next */) => {
  const rdb = req.app.locals.rdb;

  rdb.table('categories').orderBy('priority').run()
  .then((results) => {
    res.json(results);
  });
});

router.get('/:id', (req, res /* , next */) => {
  const rdb = req.app.locals.rdb;
  const categoryId = req.params.id;

  let categoriesRQL = rdb.table('categories');
  if (categoryId === 'home') {
    categoriesRQL = categoriesRQL.orderBy(rdb.asc('priority')).nth(0);
  }
  else {
    categoriesRQL = categoriesRQL.get(parseInt(categoryId, BASE_TEN_RADIX));
  }

  // pull category feed info
  categoriesRQL
    .getField('feeds')
    .eqJoin((x) => x, rdb.table('feeds'), { ordered: true })
    .zip()
    .pluck(['id', 'name', 'hash', 'type', 'site_url', 'icon']) // only these fields from feeds
    .run()
      .then((feeds) => {
        // TODO: do we need to check that feeds has at least one valid entry?

        // we'll store the feed articles on the feed object
        // feedArticels is used to a reference into the articles property,
        // so we can push articles to it easily
        const feedArticles = {};
        for (const feed of feeds) {
          feed.articles = [];
          feedArticles[feed.id] = feed.articles;
        }

        // feeds : feeds for this category
        if (feeds) {
          // build up the db statement that will pull all the feed_items for all feeds
          let dbStmt = getFeedItemsFor(rdb, feeds[0].id);

          for (let i = 1; i < feeds.length; i++) {
            dbStmt = dbStmt.union(getFeedItemsFor(rdb, feeds[i].id));
          }

          // okay, everything is union(), let's run it
          dbStmt.run()
            .then((feedItems) => {
              // console.log('results: ', feedItems);
              for (const feedItem of feedItems) {
                // only pull out the properties we want to send back
                const { id, link, title, comments, image_url } = feedItem;
                feedArticles[feedItem.feed_id].push({ id, link, title, comments, image_url });
              }
              res.json({ status: 'ok', results: feeds });
            })
            .catch((err) => {
              throw err;
            });
        }
        else {
          res.json({ status: 'error', description: 'No such categoryId' });
        }
      });
});

module.exports = router;
