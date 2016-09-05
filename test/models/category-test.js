/* global expect */
const Category = require('../../models/category');

// setup connection to rdb for fixtures
const dbConfig = require('../../config/db.js');
dbConfig.db = `${dbConfig.dbName}_${process.env.NODE_ENV}`;
const rdb = require('rethinkdbdash')(dbConfig);

describe('Models Category', () => {
  const dt = new Date();

  const feedItemFixtures = [
    { id: 1, feed_id: 5, link: 'http://arstechnica.com/gadgets/2016/09/razer-gives-its-blades-a-kaby-lake-geforce-10-series-bump/', title: 'Razer gives its Blades a Kaby Lake, GeForce 10-series bump', pub_date: dt.setHours(1) },
    { id: 2, feed_id: 5, link: 'http://arstechnica.com/science/2016/09/first-look-at-jupiters-north-pole-bluer-and-hardly-recognizable/', title: 'First look at Jupiter’s north pole—bluer and "hardly recognizable"', pub_date: dt.setHours(2) },
    { id: 3, feed_id: 6, link: 'https://www.engadget.com/2016/09/02/lg-smartthinq-hub-amazon-alexa-support/', title: 'Amazon Alexa support coming to LG\'s SmartThinQ hub', pub_date: dt.setHours(4) },
    { id: 4, feed_id: 6, link: 'https://www.engadget.com/2016/09/02/google-project-ara-modular-phone-shut-down/', title: 'Google officially ends its Project Ara modular phone initiative', pub_date: dt.setHours(3) },
    { id: 5, feed_id: 6, link: 'https://www.engadget.com/2016/09/02/brave-browser-lets-you-tip-your-favorite-sites-in-bitcoin/', title: 'Brave browser lets you tip your favorite sites in bitcoin', pub_date: dt.setHours(5) },
  ];
  const feedFixtures = [
    { id: 5, hash: '1b9e1665491d16402eed265c92aec827', name: 'Ars Technica', url: 'http://arstechnica.com/feed/' },
    { id: 6, hash: 'f011fadb7cbaf9f96d7be5482ccbddc8', name: 'Engadget', url: ' https://www.engadget.com/rss.xml' },
  ];
  const categoriesFixtures = [{ id: 1, name: 'Tech', priority: 2, feeds: [5, 6] }];

  function cleanTables() {
    return rdb.table('feeds').delete().run()
              .then(() => rdb.table('categories').delete().run())
              .then(() => rdb.table('feed_items').delete().run());
  }
  before((done) => {
    try {
      // rdb.table('feeds').delete().run()
      //   .then(() => rdb.table('feeds').insert(feedFixtures).run())
      //   .then(() => rdb.table('categories').delete().run())
      //   .then(() => rdb.table('categories').insert(categoriesFixtures).run())
      //   .then(() => rdb.table('feed_items').delete().run())
      //   .then(() => rdb.table('feed_items').insert(feedItemFixtures).run())
      //   .then(() => done())
      //   .catch((err) => done(err));
      cleanTables()
        .then(() => rdb.table('feeds').insert(feedFixtures).run())
        .then(() => rdb.table('categories').insert(categoriesFixtures).run())
        .then(() => rdb.table('feed_items').insert(feedItemFixtures).run())
        .then(() => done())
        .catch((err) => done(err));
    }
    catch (err) {
      done(err);
    }
  });
  after((done) => cleanTables().then(() => done()).catch((err) => done(err)));

  it('should return all categories', (done) => {
    rdb.table('categories').delete().run()
      .then(() => rdb.table('categories').insert([
        { id: 1, name: '1Tech', priority: 2, feeds: [5, 6] },
        { id: 2, name: '2Tech', priority: 2, feeds: [5, 6] },
        { id: 3, name: '3Tech', priority: 2, feeds: [5, 6] },
      ]).run())
      .then(() => Category.all(rdb))
      .then((results) => {
        expect(results.length).to.equal(3);
        done();
      })
      .catch((err) => done(err));
  });

  it('should return correct results for category', (done) => {
    const categoryId = 1;

    Category.feedItems(rdb, categoryId)
      .then((results) => {
        expect(results).to.not.equal(null);
        expect(results.length).to.equal(2);

        expect(results[0].id).to.equal(5);
        expect(results[0].name).to.equal('Ars Technica');
        expect(results[0].articles.length).to.equal(2);
        expect(results[0].articles[0].title).to.equal('First look at Jupiter’s north pole—bluer and "hardly recognizable"');
        expect(results[1].id).to.equal(6);
        expect(results[1].name).to.equal('Engadget');
        expect(results[1].articles.length).to.equal(3);
        expect(results[1].articles[0].title).to.equal('Brave browser lets you tip your favorite sites in bitcoin');
        expect(results[1].articles[1].title).to.equal('Amazon Alexa support coming to LG\'s SmartThinQ hub');
        expect(results[1].articles[2].title).to.equal('Google officially ends its Project Ara modular phone initiative');
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