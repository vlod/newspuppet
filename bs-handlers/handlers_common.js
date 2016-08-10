const fs = require('fs-extra-promise');
const md5sum = require('../lib/md5sum');

const feedDirAlreadyCreated = {};

// function dateFeedDirCreatedCache(feedDirNameHash, value) {
//   feedDirAlreadyCreated[feedDirNameHash] = value;
// }

module.exports = {
  setupFeedDir: (projectDir, feedUrl) => {
    return new Promise((resolve, reject) => {
      const feedDirNameHash = md5sum.digest(feedUrl); // eg ddcb71544f186074e7827d8c14eea6ad

      // no point recreating feed directory as we've done it before
      if (feedDirAlreadyCreated[feedDirNameHash]) {
        return resolve(feedDirNameHash);
      }

      const fullPathFeedDir = `${projectDir}/data/${feedDirNameHash}`;
      fs.mkdirsAsync(fullPathFeedDir)
        .then(() => {
          feedDirAlreadyCreated[feedDirNameHash] = true; // no point doing this all the time

          const feedIdClean = feedUrl.replace(/http(s)*:\/+/, '').replace(/[\.\/]/g, '-');

          // create empty file to help find feeds
          fs.closeSync(fs.openSync(`${fullPathFeedDir}/FEED_${feedIdClean}`, 'w'));

          resolve(feedDirNameHash);
        })
        .catch((err) => {
          reject(err);
        });

      return true;
    });
  },
};