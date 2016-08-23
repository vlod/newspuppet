/* eslint-disable no-underscore-dangle */
const fs = require('fs-extra-promise');
const winston = require('winston');
const handlersCommon = require('./handlers_common');
const flickrInterestingness = require('../lib/flickr-interestingness-promise');

module.exports = (config) => {
  const { flickrAPI, emitter, projectDir, rdb } = config;
  const type = 'get_feed_flickr';

  function _downloadFeed(data) {
    const feedFileDirName = `${projectDir}/data/${data.md5}`;
    const jsonFileName = `${feedFileDirName}/feed.json`;
    const photos = [];

    return flickrAPI
      .then((flickr) => {
        return flickrInterestingness(flickr).getList();
      })
      .then((results) => {
        for (const photo of results.photos.photo) {
          // console.log(`photo ${JSON.stringify(photo)}`);
          photos.push({
            title: photo.title, // how to build flickr urls: https://goo.gl/FGiBdo
            image_url: `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_q.jpg`,
            link: `https://www.flickr.com/photos/${photo.owner}/${photo.id}`,
            pub_date: new Date(),
          });
        }
        return fs.writeJSONAsync(jsonFileName, photos); // write the photos out
      })
      .then(() => Promise.resolve(photos))
      .catch((err) => {
        winston.error(`get_feed_flickr promise reject: ${err}`);
        return Promise.reject(err);
      });
  }

  return {
    _downloadFeed,
    work: (payload, callback) => {
      let feedUrl;

      if (payload.feedId === undefined) {
        winston.err('GET_FEED_FLICKR blank feedId, ignoring');
        return callback();
      }
      // winston.info(`get_feed loading feedId:[${payload.feedId}]`);
      rdb.table('feeds').get(payload.feedId).run()
        .then((results) => {
          feedUrl = results.url;
          winston.info('GET_FEED_FLICKR:', { feedId: payload.feedId, feedUrl });

          handlersCommon.setupFeedDir(projectDir, feedUrl)
            .then((feedDirName) => _downloadFeed({ md5: feedDirName }))
            .then(() => {
              // emit LOAD_FEED
              emitter.put(0, 0, 60, JSON.stringify(['default', {
                type: 'load_feed', payload: { feedId: payload.feedId },
              }]), (error, jobId) => {
                if (error) throw error;
                winston.info(`feed_id: ${payload.feedId} emitted job [load_feed] jobId: ${jobId}`);
                callback();
              });
            });
        })
        .catch((err) => {
          throw err;
        });
    },
  };
};
