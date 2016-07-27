const expect = require('chai').expect;
const md5sum = require('../../lib/md5sum');

describe('MD5Sum', () => {
  it('return correct md5 hash for link', () => {
    const feedItem = {
      link: 'http://www.bbc.co.uk/news/world-middle-east-36438333',
      title: 'Hidden forces',
    };

    const md5Digest = md5sum.digest(feedItem.link);
    expect(md5Digest).to.equal('35676f6751e2b9fae10b475a2ae68486');
  });
});
