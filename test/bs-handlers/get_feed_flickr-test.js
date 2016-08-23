/* eslint-disable no-underscore-dangle */
import fs from 'fs-extra-promise';
import pathExists from 'path-exists';

import getFeed from '../../bs-handlers/get_feed_flickr';
const FEED_URL = 'https://api.flickr.com/services/rest/?method=flickr.interestingness.getList';

describe('get_feed_flicker handler', () => {
  it('should download the feed file and generate json files', (done) => {
    // mock out flickr
    const flickrAPI = new Promise((resolve /* , reject*/) => {
      const flickr = {
        interestingness: {
          getList: (options, cb) => {
            fs.readJsonAsync(`${__dirname}/data/FEED_flickr.json`)
              .then((results) => cb(null, results))
              .catch((err) => {
                console.err(err);
                throw new Error(err);
              });
          },
        },
      };
      return resolve(flickr);
    });

    const jsonFeedFile = '/tmp/newspuppet_test/data/4d5fa5f13f29998f8951f96286a35b36/feed.json';

    const beanstalkWorker = getFeed({ projectDir: '/tmp/newspuppet_test', flickrAPI });
    fs.removeAsync('/tmp/newspuppet_test')
      .then(() => fs.mkdirsAsync('/tmp/newspuppet_test/data/4d5fa5f13f29998f8951f96286a35b36'))
      .then(() => beanstalkWorker._downloadFeed({
        feedId: 13, url: FEED_URL, md5: '4d5fa5f13f29998f8951f96286a35b36',
      }))
      .then(() => pathExists(jsonFeedFile))
      .then((exists) => {
        expect(exists).to.equal(true); // feed_file should have been generated in the correct directory
        return fs.readFileAsync(jsonFeedFile);
      })
      .then((fileContents) => {
        expect(fileContents.length).equal(7368);

        const articles = JSON.parse(fileContents);
        expect(articles.length).to.equal(30);
        expect(articles[0].title).to.equal('Borage');
        expect(articles[0].image_url).to.equal('https://farm8.staticflickr.com/7560/28831423151_369c6b6eb8_q.jpg');
        expect(articles[0].link).to.equal('https://www.flickr.com/photos/21846004@N03/28831423151');
      })
      .then(() => done())
      .catch((err) => {
        // console.error(err);
        done(err);
      });
  });
});
