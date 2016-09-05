/* eslint-disable no-underscore-dangle */
const winston = require('winston');

module.exports = (config) => {
  const { rdb, emitter } = config;
  const type = 'cache_categories';

  return {
    work: (payload, callback) => {
      const categoryId = payload.categoryId;

      winston.info(`cache_categories saving category:[${categoryId}]`);
      rdb.table('categories').pluck('id')
        .then((categories) => {
          for (const category of categories) {
            console.log(category);
            emitter.put(0, 0, 60, JSON.stringify(['default', {
              type: 'cache_category', payload: { categoryId: category.id },
            }]), (error, jobId) => {
              if (error) throw error;
              winston.info(`category_id: ${category.id} emitted job [cache_category] jobId: ${jobId}`);
            });
          }
        })
        .then(() => callback('success'))
        .catch((err) => {
          throw (err);
        });
    },
  };
};