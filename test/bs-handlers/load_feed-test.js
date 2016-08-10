/* eslint-disable no-underscore-dangle */
const fs = require('fs-extra-promise');
const expect = require('chai').expect;
// const uuid = require('node-uuid');
// const v= uuid.v4();

const loadFeed = require('../../bs-handlers/load_feed');
const dbConfig = require('../../config/db.js');
dbConfig.db = `${dbConfig.dbName}_${process.env.NODE_ENV}`;
const rdb = require('rethinkdbdash')(dbConfig);

describe('load_feed handler', () => {
  before((done) => {
    rdb.table('feed_items').delete().run()
      .then((results) => {
        expect(results.errors).to.equal(0, 'error cleaning feed_items');
        done();
      });
  });

  it('returns the correct key value pairs for feed data', (done) => {
    fs.readFileAsync(`${__dirname}/data/6df54be78bcaea7b6d402b4d78362bd8/feed.json`)
      .then((data) => loadFeed({ projectDir: `${__dirname}` })._processFeed(data))
      .then((entries) => {
        expect(entries.length).to.equal(30);

        expect(entries[0].title)
          .to.equal('How I Cracked a Keylogger and Ended Up in Someone\'s Inbox');
        expect(entries[0].link).to.equal('https://www.trustwave.com/Resources/SpiderLabs-Blog/How-I-Cracked-a-Keylogger-and-Ended-Up-in-Someone-s-Inbox/');
        expect(entries[0].comments).to.equal('https://news.ycombinator.com/item?id=12023397');
        expect(new Date(entries[0].pub_date).getTime())
          .to.equal(new Date('2016-07-02T18:33:23.000Z').getTime());

        // the second item doesn't have any comments, it shouldn't be present in the result
        expect(entries[1].title).to.equal('PostgreSQL Exercises');
        expect(entries[1].comments).to.equal(undefined);

        done();
      })
      .catch((err) => done(err));
  });

  it('returns the correct key value pairs for feed image data', (done) => {
    fs.readFileAsync(`${__dirname}/data/ddcb71544f186074e7827d8c14eea6ad/feed.json`)
      .then((data) => loadFeed({ projectDir: `${__dirname}` })._processFeed(data))
      .then((entries) => {
        expect(entries.length).to.equal(20);

        expect(entries[0].title).to.equal('Clarity');
        expect(entries[0].link).to.equal('https://500px.com/photo/166435685/clarity-by-elia-locardi');
        expect(entries[0].image_url).to.equal('https://drscdn.500px.org/photo/166435685/q%3D50_w%3D140_h%3D140/7e6f9e5dac7bdaca0e1177f50677e3af?v=3');
        expect(new Date(entries[0].pub_date).getTime())
          .to.equal(new Date('2016-08-05T08:23:42-04:00').getTime());

        done();
      })
      .catch((err) => done(err));
  });

  it('returns articles expect those with bad links for feed data', (done) => {
    fs.readFileAsync(`${__dirname}/data/missing_links/feed.json`)
      .then((data) => loadFeed({ projectDir: `${__dirname}` })._processFeed(data))
      .then((entries) => {
        expect(entries.length).to.equal(19); // has 20, but one has a bad link

        // The real one at this place: "This week, at least, the dinosaurs rule as Verizon has Yahoo for lunch" should not be picked up
        expect(entries[6].title)
          .to.equal('How Elizabeth Warren’s clout continues to grow inside the Senate'); // really the next one

        done();
      })
      .catch((err) => done(err));
  });

  it('should return the correct feedItem ids', (done) => {
    const lf = loadFeed({ projectDir: `${__dirname}` });

    fs.readFileAsync(`${__dirname}/data/6df54be78bcaea7b6d402b4d78362bd8/feed.json`)
      .then((data) => lf._processFeed(data))
      .then((entries) => {
        expect(entries.length).to.equal(30);

        const feedIds = lf._feedItemsMapFor(entries);
        expect(Object.keys(feedIds).length).to.equal(30);

        expect(feedIds['462a26429cccd399cd57b0a4af30919a']).to.not.equal(undefined);
        expect(feedIds['70aa5ebdb4d5137842aa0b70eeb7f3b9']).to.not.equal(undefined);
        done();
      })
      .catch((err) => done(err));
  });

  it('should insert correctly', (done) => {
    const lf = loadFeed({ projectDir: `${__dirname}`, rdb });
    const feedId = 'b65d537b-6479-4ced-9c49-e5a4104f2b98';
    const fixtures = [
      { id: '462a26429cccd399cd57b0a4af30919a', feed_id: feedId },
      { id: '70aa5ebdb4d5137842aa0b70eeb7f3b9', feed_id: feedId },
    ];

    // clean up old values in table
    rdb.table('feed_items').getAll(feedId, { index: 'feed_id' }).delete()
                           .run()
      // insert fixtures data into table
      .then(() => rdb.table('feed_items').insert(fixtures).run())
      .then((results) => {
        expect(results.errors).to.equal(0, 'error insering fixtures');
        expect(results.inserted).to.equal(2);
        return fs.readFileAsync(`${__dirname}/data/6df54be78bcaea7b6d402b4d78362bd8/feed.json`);
      })
      .then((data) => lf._processFeed(data))
      .then((entries) => {
        expect(entries.length).to.equal(30);
        return lf._articlesToBeInserted(feedId, entries);
      })
      .then((newArticles) => {
        const newArticlesLen = Object.keys(newArticles).length;
        expect(newArticlesLen).to.equal(28); // 30 in feed and 2 prev loaded as fixtures
        expect(newArticles[0].title).to.equal('PostgreSQL Exercises');
        expect(newArticles[0].feed_id).to.equal(feedId); // make sure feed_id was added

        return lf._insertArticles(newArticles);
      })
      .then((insertionResults) => {
        expect(insertionResults.errors).to.equal(0);
        expect(insertionResults.inserted).to.equal(28); // as 2 were prev inserted

        // pull in everything to verify
        return rdb.table('feed_items').getAll(feedId, { index: 'feed_id' })
                                      .orderBy(rdb.desc('pub_date'))
                                      .run();
      })
      .then((feedItems) => {
        expect(feedItems.length).to.equal(30);
        expect(feedItems[0].id).to.equal('094db21369bad602be97a836a2643e8a');
        expect(feedItems[0].title).to.equal('The Illicit Perks of the M.D. Club');
        expect(feedItems[0].feed_id).to.equal(feedId);
      })
      .then(() => done())
      .catch((err) => done(err));
  });

  it('should insert new articles from feed', (done) => {
    const lf = loadFeed({ projectDir: `${__dirname}`, rdb });
    const feedId = '1b9e1665491d16402eed265c92aec827';
    const feedFixtures = {
      id: feedId,
      name: 'Ars Technica',
      url: 'http://arstechnica.com/feed/',
    };
    const feedItemFixtures = [
      { id: '462a26429cccd399cd57b0a4af30919a', feed_id: feedId },
      { id: '70aa5ebdb4d5137842aa0b70eeb7f3b9', feed_id: feedId },
    ];
     // clean up old values in table
    rdb.table('feeds').get(feedId).delete().run()
      .then(() => rdb.table('feed_items').getAll(feedId, { index: 'feed_id' }).delete().run())
      .then(() => rdb.table('feeds').insert(feedFixtures).run())
      .then(() => rdb.table('feed_items').insert(feedItemFixtures).run())
      .then(() => {
        lf.work({ feedId }, (mesg) => {
          expect(mesg).to.equal('success');

          // pull in everything to verify
          rdb.table('feed_items').getAll(feedId, { index: 'feed_id' }).orderBy(rdb.desc('pub_date')).run()
            .then((feedItems) => {
              expect(feedItems.length).to.equal(20);
              expect(feedItems[0].title).to.equal('Welcome to the new, new Ars Technica!');
              expect(feedItems[0].feed_id).to.equal(feedId);
              expect(feedItems[0].link).to.equal('http://arstechnica.com/staff/2016/07/welcome-to-the-new-new-ars-technica/');

              expect(feedItems[19].title).to.equal('SpaceX in 2016: Launching more with a better rocket that it can land [Updated]');
              expect(feedItems[0].feed_id).to.equal(feedId);
              return;
            });
        });
      })
      .then(() => done())
      .catch((err) => done(err));
  });

  it('should insert new articles from images feed', (done) => {
    const lf = loadFeed({ projectDir: `${__dirname}`, rdb });
    const feedId = 'da8cee9d03b4489cac33-b6ed69197870';
    const feedFixtures = {
      id: feedId,
      name: '500px Popular',
      url: 'https://api.500px.com/v1/photos',
    };
     // clean up old values in table
    rdb.table('feeds').get(feedId).delete().run()
      .then(() => rdb.table('feed_items').getAll(feedId, { index: 'feed_id' }).delete().run())
      .then(() => rdb.table('feeds').insert(feedFixtures).run())
      .then(() => {
        lf.work({ feedId }, (mesg) => {
          expect(mesg).to.equal('success');

          // pull in everything to verify
          rdb.table('feed_items').getAll(feedId, { index: 'feed_id' }).orderBy(rdb.desc('pub_date')).run()
            .then((feedItems) => {
              expect(feedItems.length).to.equal(20);
              expect(feedItems[0].title).to.equal('Sparks Lake');
              expect(feedItems[0].feed_id).to.equal(feedId);
              expect(feedItems[0].link).to.equal('https://500px.com/photo/166924739/sparks-lake-by-%C4%B0lhan-eroglu');
              expect(feedItems[0].image_url).to.equal('https://drscdn.500px.org/photo/166924739/q%3D50_w%3D140_h%3D140/724c793e59cb3d4b21b6181e36cb231c?v=3');
              expect(new Date(feedItems[0].pub_date).getTime())
                        .to.equal(new Date('2016-08-08T14:57:00-04:00').getTime());

              expect(feedItems[19].title).to.equal('Dream');
              expect(feedItems[0].feed_id).to.equal(feedId);
              return;
            });
        });
      })
      .then(() => done())
      .catch((err) => done(err));
  });
});
