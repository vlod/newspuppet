/* eslint-disable no-underscore-dangle */
const fs = require('fs');
const FeedParser = require('feedparser');
const request = require('request');
const winston = require('winston');
const Iconv = require('iconv').Iconv;
// const fivebeans = require('fivebeans');
const mkdirp = require('mkdirp-promise');
const md5sum = require('../lib/md5sum');

const feedDirAlreadyCreated = {};

module.exports = (config) => {
  const { rdb, emitter, projectDir } = config;
  this.type = 'get_feed';

  // from: https://github.com/danmactough/node-feedparser/blob/master/examples/iconv.js
  function maybeTranslate(res, charset) {
    let iconv;
    // Use iconv if its not utf8 already.
    if (!iconv && charset && !/utf-*8/i.test(charset)) {
      try {
        iconv = new Iconv(charset, 'utf-8');
        winston.info(`Converting from charset %s to utf-8 ${charset}`);
        iconv.on('error', (err) => {
          throw err;
        });
        // If we're using iconv, stream will be the output of iconv
        // otherwise it will remain the output of request
        res = res.pipe(iconv);
      }
      catch (err) {
        res.emit('error', err);
      }
    }
    return res;
  }

  function getParams(str) {
    const params = str.split(';').reduce((parameters, param) => {
      const parts = param.split('=').map((part) => part.trim());
      if (parts.length === 2) {
        parameters[parts[0]] = parts[1];
      }
      return parameters;
    }, {});

    return params;
  }

  function _downloadFeed(data) {
    const feedFileName = `${projectDir}/data/${data.md5}/`;
    const xmlFeedFile = fs.createWriteStream(`${feedFileName}feed.xml`);
    const jsonFeedFile = fs.createWriteStream(`${feedFileName}feed.json`);
    jsonFeedFile.write('[');

    return new Promise((resolve, reject) => {
      try {
        const feedParser = new FeedParser();
        feedParser.on('error', (err) => {
          winston.info('feedparser err:', { err });
          return reject(err);
        });

        feedParser.on('readable', () => {
          let item = feedParser.read();
          while (item) {
            // console.log(` item: ${item.title} - ${item.link}`);
            jsonFeedFile.write(`${JSON.stringify(item)},`);
            // get the next item, if none, then item will be null next time
            item = feedParser.read();
          }
        });

        // pull down the feed
        const req = request(data.url);
        req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
        req.setHeader('accept', 'text/html,application/xhtml+xml');

        req.on('response', (res) => {
          winston.info(`got response etag:[${res.headers.etag}] last-modified:[${res.headers['last-modified']}]`);
          const charset = getParams(res.headers['content-type'] || '').charset;
          res = maybeTranslate(res, charset);
          res.pipe(xmlFeedFile);
          res.pipe(feedParser);
        });
        req.on('end', () => {
          xmlFeedFile.end();
          jsonFeedFile.write('null]');
          jsonFeedFile.end();

          winston.info('got end for feed_id:', { feedId: data.feedId });
          return resolve();
        });
      }
      catch (err) {
        reject(err);
      }
    });
  }

  function _setupFeedDir(feedUrl) {
    return new Promise((resolve, reject) => {
      const feedDirNameHash = md5sum.digest(feedUrl); // eg 50cc46cbf0ad93502ea742c8e4008c52
      console.log(`_setupFeedDir:${feedUrl} feedDirNameHash:${feedDirNameHash}`);
      // no point recreating feed directory as we've done it before
      if (feedDirAlreadyCreated[feedDirNameHash]) {
        return resolve(feedDirNameHash);
      }

      const fullPathFeedDir = `${projectDir}/data/${feedDirNameHash}`;
      mkdirp(fullPathFeedDir)
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
  }

  return {
    _updateFeedDirCreatedCache: (feedDirNameHash, value) => {
      feedDirAlreadyCreated[feedDirNameHash] = value;
    },
    _downloadFeed,
    _setupFeedDir,
    work: (payload, callback) => {
      let feedUrl;

      // winston.info(`get_feed loading feedId:[${payload.feedId}]`);
      rdb.table('feeds').get(payload.feedId).run()
        .then((results) => {
          feedUrl = results.url;
          winston.info('GET_FEED:', { feedId: payload.feedId, feedUrl });

          _setupFeedDir(feedUrl)
            .then((feedDirName) => _downloadFeed({ feedId: payload.feedId, url: feedUrl, md5: feedDirName }))
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
