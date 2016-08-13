/* eslint-disable no-underscore-dangle */
const expect = require('chai').expect;
const fs = require('fs-extra-promise');
const pathExists = require('path-exists');

const getFeed = require('../../bs-handlers/get_feed_500px');
const FEED_URL = 'https://api.500px.com/v1/photos';

describe('get_feed_500px handler', () => {
  it('should download the feed file and generate json files', (done) => {
    // mock out api500px
    const api500px = {
      photos: {
        getPopular: () => fs.readJsonAsync(`${__dirname}/data/FEED_api-500px.json`),
      },
    };

    const feedFile = '/tmp/newspuppet_test/data/ddcb71544f186074e7827d8c14eea6ad/feed_file.json';
    const jsonFeedFile = '/tmp/newspuppet_test/data/ddcb71544f186074e7827d8c14eea6ad/feed.json';

    const beanstalkWorker = getFeed({ projectDir: '/tmp/newspuppet_test', api500px });
    fs.removeAsync('/tmp/newspuppet_test')
      .then(() => fs.mkdirsAsync('/tmp/newspuppet_test/data/ddcb71544f186074e7827d8c14eea6ad'))
      .then(() => beanstalkWorker._downloadFeed({
        feedId: 11, url: FEED_URL, md5: 'ddcb71544f186074e7827d8c14eea6ad',
      }))
      .then(() => pathExists(feedFile))
      .then((exists) => {
        expect(exists).to.equal(true); // feed_file should have been generated in the correct directory
        return fs.readFileAsync(feedFile);
      })
      .then((fileContents) => {
        expect(fileContents.length).equal(69760);
        return pathExists(jsonFeedFile);
      })
      .then((exists) => {
        expect(exists).to.equal(true); // is the generated file created?
        return fs.readFileAsync(jsonFeedFile);
      })
      .then((fileContents) => {
        expect(fileContents.length).not.equal(0);

        const articles = JSON.parse(fileContents);
        expect(articles.length).to.equal(20);
        expect(articles[0].title).to.equal('The Morning Still');
        expect(articles[0].image_url).to.equal('https://drscdn.500px.org/photo/165712131/q%3D50_w%3D140_h%3D140/c4ca935ef67191a46bfb0501ab7111ab?v=3');
        expect(articles[0].link).to.equal('https://500px.com/photo/165712131/the-morning-still-by-lizzy-gadd');
        // expect(articles[0].pub_date).to.equal('2016-07-31T13:49:07-04:00');

        expect(articles[19].title).to.equal('proximity.');
      })
      .then(() => done())
      .catch((err) => {
        // console.error(err);
        done(err);
      });
  });
});
