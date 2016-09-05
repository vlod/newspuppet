/* eslint-disable no-underscore-dangle */
const fs = require('fs-extra-promise');
const winston = require('winston');
const Category = require('../models/category');

module.exports = (config) => {
  const { rdb, projectDir } = config;
  const type = 'cache_category';

  return {
    work: (payload, callback) => {
      const categoryId = payload.categoryId;

      winston.info(`cache_category saving category:[${categoryId}]`);
      Category.feedItems(rdb, categoryId)
        .then((categoryResults) => {
          const returning = { status: 'ok', type: 'cached', results: categoryResults };
          fs.writeFileAsync(`${projectDir}/public/categories/${categoryId}.json`, JSON.stringify(returning));
        })
        .then(() => {
          callback('success');
        })
        .catch((err) => {
          throw (err);
        });
    },
  };
};