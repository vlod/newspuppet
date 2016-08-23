/* eslint-disable no-underscore-dangle */
import fs from 'fs-extra-promise';
import pathExists from 'path-exists';
import nock from 'nock';

import getFeed from '../../bs-handlers/get_feed';
const FEED_URL = 'http://feeds.bbci.co.uk/news/technology/rss.xml';
// const workerConfig = ({ projectDir: '/tmp/newspuppet_test' });

describe('get_feed handler', () => {
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
