// wraps flickr.interestingness.getList in a promise
module.exports = (flickr) => {
  return {
    getList: (getListOptions) => {
      const options = Object.assign({ per_page: 30 }, getListOptions);

      return new Promise((resolve, reject) => {
        flickr.interestingness.getList(options, (err, results) => {
          return (err === null || err === false) ? resolve(results) : reject(err);
        });
      });
    },
  };
};