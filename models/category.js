
const BASE_TEN_RADIX = 10; // for parseInt() https://goo.gl/5i2Fz
const FEED_ITEMS_LIMIT = 24;

let rdb;

function feedItemsRQL(feedId, limit = FEED_ITEMS_LIMIT) {
  return rdb.table('feed_items')
            .getAll(feedId, { index: 'feed_id' })
            .pluck(['id', 'link', 'title', 'feed_id', 'pub_date', 'comments', 'image_url'])
            .orderBy(rdb.desc('pub_date'))
            .limit(limit);
}

function feedItemsFor(feeds) {
  return new Promise((resolve, reject) => {
    if (feeds) {
      // we'll store the feed articles on the feed object
      // feedArticles is used to a reference into the articles property,
      // so we can push articles to it easily
      const feedArticles = {};
      for (const feed of feeds) {
        feed.articles = [];
        feedArticles[feed.id] = feed.articles;
      }

      // build up the db statement that will pull all the feed_items for all feeds
      let dbStmt = feedItemsRQL(feeds[0].id);

      for (let i = 1; i < feeds.length; i++) {
        dbStmt = dbStmt.union(feedItemsRQL(feeds[i].id));
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
          return resolve(feeds);
        })
        .catch((err) => reject(err));
    }
    else {
      return resolve();
    }
  });
}

module.exports = {
  all: (rdbConn) => rdbConn.table('categories').orderBy('priority').run(),
  feedItems: (rdbConn, categoryId) => {
    rdb = rdbConn;

    let categoriesRQL = rdb.table('categories');
    if (categoryId === 'home') categoriesRQL = categoriesRQL.orderBy(rdb.asc('priority')).nth(0);
    else categoriesRQL = categoriesRQL.get(parseInt(categoryId, BASE_TEN_RADIX));

    // pull category feed info
    return categoriesRQL
        .getField('feeds')
        .eqJoin((x) => x, rdb.table('feeds'), { ordered: true })
        .zip()
        .pluck(['id', 'name', 'hash', 'type', 'site_url']) // only these fields from feeds
        .run()
          .then((feeds) => feedItemsFor(feeds))
          .then((results) => Promise.resolve(results));
  },
};