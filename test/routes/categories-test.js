const request = require('supertest');
const expect = require('chai').expect;
const server = require('../../server');

// setup connection to rdb for fixtures
const dbConfig = require('../../config/db.js');
dbConfig.db = `${dbConfig.dbName}_${process.env.NODE_ENV}`;
const rdb = require('rethinkdbdash')(dbConfig);

describe('categories route:', () => {
  const feedFixtures = [
    { id: 2, hash: '50cc46cbf0ad93502ea742c8e4008c52', name: 'BBC news', url: 'http://feeds.bbci.co.uk/news/technology/rss.xml', downloadable: true },
    { id: 3, hash: '85b0809277cb6106e362a0371d26e68a', name: 'Washington Post', url: ' http://feeds.washingtonpost.com/rss/national' },
  ];
  const categoriesFixtures = [
    { id: 2, name: 'Headline News', priority: 1, feeds: [2, 3] },
  ];
  before((done) => {
    try {
      rdb.table('feeds').delete().run()
        .then(() => rdb.table('categories').delete().run())
        .then(() => rdb.table('feeds').insert(feedFixtures).run())
        .then(() => rdb.table('categories').insert(categoriesFixtures).run())
        .then(() => done())
        .catch((err) => done(err));
    }
    catch (err) {
      done(err);
    }
  });

  it('should get all categories', (done) => {
    request(server)
    .get('/categories')
    .expect(200)
    .expect((res) => {
      const body = res.body;
      // console.log(body);
      expect(body.length).to.equal(1, 'should just return 1 category');

      expect(body[0].name).to.equal('Headline News');
      expect(body[0].id).to.equal(2);
      expect(body[0].priority).to.equal(1);
      expect(body[0].feeds[0]).to.equal(2);
      expect(body[0].feeds[1]).to.equal(3);
      return done();
    })
    .end((err) => {
      if (err) done(err);
    });
  });

  it('should get feeds for a specific category', (done) => {
    request(server)
      .get('/categories/2')
      .expect(200)
      .expect((res) => {
        // console.log(`body: ${JSON.stringify(res.body)}`);
        expect(res.body.status).to.equal('ok');

        const results = res.body.results;
        expect(results.length).to.equal(2, 'should just return 2 feeds for this category');

        expect(results[0].name).to.equal('BBC news');
        expect(results[0].id).to.equal(2);
        expect(results[0].hash).to.equal('50cc46cbf0ad93502ea742c8e4008c52');
        expect(results[1].name).to.equal('Washington Post');
        expect(results[1].id).to.equal(3);
        expect(results[1].hash).to.equal('85b0809277cb6106e362a0371d26e68a');
        return done();
      })
      .end((err) => {
        if (err) done(err);
      });
  });
});
