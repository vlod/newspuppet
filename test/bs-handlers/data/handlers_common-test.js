/* eslint-disable no-underscore-dangle */
const expect = require('chai').expect;
const fs = require('fs-extra-promise');
const pathExists = require('path-exists');

const handlersCommon = require('../../../bs-handlers/handlers_common');
const projectDir = '/tmp/newspuppet_test';
const FEED_URL = 'http://feeds.bbci.co.uk/news/technology/rss.xml';

describe('handlers_common', () => {
  it('creates directories for feed', (done) => {
    const feedDir = `${projectDir}/data/50cc46cbf0ad93502ea742c8e4008c52`;

    // clean up old feed directory
    fs.removeAsync(projectDir)
      .then(() => handlersCommon.setupFeedDir(projectDir, FEED_URL))
      .then((feedDirName) => {
        // make sure this hash is what we expect
        expect(feedDirName).to.equal('50cc46cbf0ad93502ea742c8e4008c52');
        return pathExists(feedDir);
      })
      .then((exists) => {
        expect(exists).to.equal(true); // main feed download area path setup
        return pathExists(`${feedDir}/FEED_feeds-bbci-co-uk-news-technology-rss-xml`);
      })
      .then((exists) => {
        expect(exists).to.equal(true); // feed indicator file
        done();
      })
      .catch((err) => done(err));
  });

  it('should return correct hash even if feed directory exists', (done) => {
    // tell the cache its already been loaded
    handlersCommon._updateFeedDirCreatedCache('50cc46cbf0ad93502ea742c8e4008c52', true);
    handlersCommon.setupFeedDir(projectDir, FEED_URL)
      .then((feedDirName) => {
        // make sure this hash is what we expect
        expect(feedDirName).to.equal('50cc46cbf0ad93502ea742c8e4008c52');
        done();
      })
      .catch((err) => done(err));
  });
});