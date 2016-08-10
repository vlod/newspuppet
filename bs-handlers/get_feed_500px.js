/* eslint-disable no-underscore-dangle */
const fs = require('fs-extra-promise');
const winston = require('winston');
const handlersCommon = require('./handlers_common');

module.exports = (config) => {
  const { api500px, emitter, projectDir, rdb } = config;
  this.type = 'get_feed_500px';

  function _downloadFeed(data) {
    const feedFileDirName = `${projectDir}/data/${data.md5}`;
    const feedFileName = `${feedFileDirName}/feed_file.json`;
    const jsonFileName = `${feedFileDirName}/feed.json`;

    return api500px.photos.getPopular({ sort: 'highest_rating', rpp: '20' })
      .then((results) => {
        fs.writeJSONAsync(feedFileName, results)
          .then(() => {
            const output = [];

            for (const photo of results.photos) {
              // winston.info(`adding: ${photo.name}`);
              output.push({
                title: photo.name,
                image_url: photo.image_url,
                link: `https://500px.com${photo.url}`,
                pubdate: photo.created_at,
              });
            }
            // create the json out file
            return fs.writeJSONAsync(jsonFileName, output);
          })
          .then(() => Promise.resolve())
          .catch((err) => {
            winston.error(`promise reject: ${err}`);
            return Promise.reject(err);
          });
      })
      .catch((err) => {
        winston.error(err);
        return Promise.reject(err);
      });
  }

  return {
    _downloadFeed,
    work: (payload, callback) => {
      let feedUrl;

      if (payload.feedId === undefined) {
        winston.err('GET_FEED_500PX blank feedId, ignoring');
        return callback();
      }
      // winston.info(`get_feed loading feedId:[${payload.feedId}]`);
      rdb.table('feeds').get(payload.feedId).run()
        .then((results) => {
          feedUrl = results.url;
          winston.info('GET_FEED_500PX:', { feedId: payload.feedId, feedUrl });

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
              callback();
            });
        })
        .catch((err) => {
          throw err;
        });
    },
  };
};
