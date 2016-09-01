const expect = require('chai').expect;
const Category = require('../../models/category');

// setup connection to rdb for fixtures
const dbConfig = require('../../config/db.js');
dbConfig.db = `${dbConfig.dbName}_${process.env.NODE_ENV}`;
const rdb = require('rethinkdbdash')(dbConfig);

describe('Models Category', () => {
  const feedItemFixtures = [
    { id: 1, feed_id: 5, link: 'https://www.engadget.com/2016/08/30/vmware-offers-rare-free-upgrade/', title: 'VMware won\'t charge you to run a new OS in Fusion' },
    { id: 2, feed_id: 5, link: 'https://example.com/foo', title: 'Example foo' },
    { id: 3, feed_id: 6, link: 'https://example.com/foo1', title: 'Example foo1' },
    { id: 4, feed_id: 6, link: 'https://example.com/foo2', title: 'Example foo2' },
    { id: 5, feed_id: 6, link: 'https://example.com/foo3', title: 'Example foo3' },
  ];
  const feedFixtures = [
    { id: 5, hash: '1b9e1665491d16402eed265c92aec827', name: 'Ars Technica', url: 'http://arstechnica.com/feed/' },
    { id: 6, hash: 'f011fadb7cbaf9f96d7be5482ccbddc8', name: 'Engadget', url: ' https://www.engadget.com/rss.xml' },
  ];
  const categoriesFixtures = [{ id: 1, name: 'Tech', priority: 2, feeds: [5, 6] }];

  before((done) => {
    try {
      rdb.table('feeds').delete().run()
        .then(() => rdb.table('feeds').insert(feedFixtures).run())
        .then(() => rdb.table('categories').delete().run())
        .then(() => rdb.table('categories').insert(categoriesFixtures).run())
        .then(() => rdb.table('feed_items').delete().run())
        .then(() => rdb.table('feed_items').insert(feedItemFixtures).run())
        .then(() => done())
        .catch((err) => done(err));
    }
    catch (err) {
      done(err);
    }
  });

  it('should return correct results for category', (done) => {
    Category.feedItems(rdb, 1)
      .then((results) => {
        expect(results).to.not.equal(null);
        expect(results.length).to.equal(2);

        expect(results[0].id).to.equal(5);
        expect(results[0].name).to.equal('Ars Technica');
        expect(results[0].articles.length).to.equal(2);
        expect(results[0].articles[0].title).to.equal('Example foo');
        expect(results[1].id).to.equal(6);
        expect(results[1].name).to.equal('Engadget');
        expect(results[1].articles.length).to.equal(3);
        expect(results[1].articles[0].title).to.equal('Example foo2');
        expect(results[1].articles[1].title).to.equal('Example foo3');
        expect(results[1].articles[2].title).to.equal('Example foo1');
        done();
      })
      .catch((err) => done(err));
  });

  it('should return no results for bad categoryId', (done) => {
    Category.feedItems(rdb, 222222)
      .then((results) => {
        expect(results).to.not.equal(null);
        done();
      })
      .catch((err) => {
        expect(err.name).to.equal('ReqlRuntimeError');
        done();
      });
  });
});