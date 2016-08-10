/* eslint-disable no-underscore-dangle */
const expect = require('chai').expect;

const fs = require('fs-extra-promise');
const pathExists = require('path-exists');
const nock = require('nock');

const getFeed = require('../../bs-handlers/get_feed');
const FEED_URL = 'http://feeds.bbci.co.uk/news/technology/rss.xml';
// const workerConfig = ({ projectDir: '/tmp/newspuppet_test' });

describe('get_feed handler', () => {
  // it('creates directories for feed', (done) => {
  //   const feedDir = '/tmp/newspuppet_test/data/50cc46cbf0ad93502ea742c8e4008c52';

  //   const beanstalkWorker = getFeed(workerConfig);
  //   // clean up old feed directory
  //   fs.removeAsync('/tmp/newspuppet_test')
  //     .then(() => beanstalkWorker._setupFeedDir(FEED_URL))
  //     .then((feedDirName) => {
  //       // make sure this hash is what we expect
  //       expect(feedDirName).to.equal('50cc46cbf0ad93502ea742c8e4008c52');
  //       return pathExists(feedDir);
  //     })
  //     .then((exists) => {
  //       expect(exists).to.equal(true); // main feed download area path setup
  //       return pathExists(`${feedDir}/FEED_feeds-bbci-co-uk-news-technology-rss-xml`);
  //     })
  //     .then((exists) => {
  //       expect(exists).to.equal(true); // feed indicator file
  //       done();
  //     })
  //     .catch((err) => done(err));
  // });

  // it('should return correct hash even if feed directory exists', (done) => {
  //   const beanstalkWorker = getFeed(workerConfig);
  //   // tell the cache its already been loaded
  //   beanstalkWorker._updateFeedDirCreatedCache('50cc46cbf0ad93502ea742c8e4008c52', true);
  //   beanstalkWorker._setupFeedDir(FEED_URL)
  //     .then((feedDirName) => {
  //       // make sure this hash is what we expect
  //       expect(feedDirName).to.equal('50cc46cbf0ad93502ea742c8e4008c52');
  //       done();
  //     })
  //     .catch((err) => done(err));
  // });

  it('should download the xml and json files', (done) => {
    // stub feed lookup
    nock('http://feeds.bbci.co.uk')
      .get('/news/technology/rss.xml')
      .replyWithFile(200, `${__dirname}/data/FEED_bbci-co-uk-news-technology-rss.xml`);

    const xmlFeedFile = '/tmp/newspuppet_test/data/50cc46cbf0ad93502ea742c8e4008c52/feed.xml';
    const jsonFeedFile = '/tmp/newspuppet_test/data/50cc46cbf0ad93502ea742c8e4008c52/feed.json';

    const beanstalkWorker = getFeed({ projectDir: '/tmp/newspuppet_test' });
    fs.removeAsync('/tmp/newspuppet_test') // clean up old
      .then(() => fs.mkdirsAsync('/tmp/newspuppet_test/data/50cc46cbf0ad93502ea742c8e4008c52'))
      .then(() => beanstalkWorker._downloadFeed({
        feedId: 2, url: FEED_URL, md5: '50cc46cbf0ad93502ea742c8e4008c52',
      }))
      .then(() => pathExists(xmlFeedFile))
      .then((exists) => {
        expect(exists).to.equal(true); // feed.xml should have been generated in the correct directory
        return fs.readFileAsync(xmlFeedFile);
      })
      .then((fileContents) => {
        expect(fileContents.length).equal(28292); // size of xml feed file
        return pathExists(jsonFeedFile);
      })
      .then((exists) => {
        expect(exists).to.equal(true); // let make sure the json file was written
        return fs.readFileAsync(jsonFeedFile);
      })
      .then((fileContents) => {
        expect(fileContents.length).equal(135751); // size of json feed file

        // inspect the feed file
        const articles = JSON.parse(fileContents);
        expect(articles.length).to.equal(44); // number of articles + ,null at end
        expect(articles[0].title).to.equal('newspuppet - Facebook tests \'secret message\' service');
        expect(articles[42].title).to.equal('foo E3: Could VR bring back the games arcade?');

        done();
      })
      .catch((err) => done(err));
  });
});
