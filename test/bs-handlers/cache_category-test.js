/* eslint-disable no-underscore-dangle */
/* global expect */

import fs from 'fs-extra-promise';
import pathExists from 'path-exists';
import cacheFeed from '../../bs-handlers/cache_category';

import dbConfig from '../../config/db.js';
dbConfig.db = `${dbConfig.dbName}_${process.env.NODE_ENV}`;
import rethinkdbdash from 'rethinkdbdash';
const rdb = rethinkdbdash(dbConfig);

const workerConfig = { projectDir: '/tmp/newspuppet_test', rdb };

describe('cache_category handler', () => {
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

  before((done) => {
    try {
      rdb.table('feeds').getAll(5, 6).delete().run()
        .then(() => rdb.table('feeds').insert(feedFixtures).run())
        .then(() => rdb.table('categories').get(1).delete().run())
        .then(() => rdb.table('categories').insert(categoriesFixtures).run())
        .then(() => rdb.table('feed_items').getAll(1, 2, 3, 4, 5).delete().run())
        .then(() => rdb.table('feed_items').insert(feedItemFixtures).run())
        .then(() => done())
        .catch((err) => done(err));
    }
    catch (err) {
      done(err);
    }
  });

  it('should cache the category', (done) => {
    const categoryId = categoriesFixtures[0].id;
    const outputJSONFileName = `${workerConfig.projectDir}/public/categories/${categoryId}.html`;
    const cf = cacheFeed(workerConfig);

    fs.removeAsync(`${workerConfig.projectDir}/public/categories`)
      .then(() => fs.mkdirsAsync(`${workerConfig.projectDir}/public/categories`))
      .then(() => {
        cf.work({ categoryId }, (mesg) => {
          expect(mesg).to.equal('success');

          pathExists(outputJSONFileName)
            .then((exists) => {
              expect(exists).to.equal(true);

              return fs.readJSONAsync(outputJSONFileName);
            })
            .then((results) => {
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
            })
            .then(() => {
              done();
            })
            .catch((err) => done(err));
        });
      });
  });
});

