const crypto = require('crypto');
// might want to use a random random number below:
// ruby -e "require 'securerandom'; puts SecureRandom.hex(16)"
const salt = process.env.APP_MD5_SALT || '0a14b9c4388a3db33c77d7f6ae796b35';

module.exports = {
  digest(data) {
    return crypto.createHash('md5').update(salt + data).digest('hex');
  },
};
