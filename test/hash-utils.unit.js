'use strict';

const expect = require('chai').expect;
const utils = require('../lib/utils');

describe('Storage/utils hash helpers', () => {
  it('When hashing, then it should return the storj-lib result', () => {
    expect(utils.ripemd160sha256('some-data'))
      .to.equal('b83f0808a353639bf731b0e86288e4cfa92e9842');
    expect(utils.ripemd160sha256('616263', 'hex'))
      .to.equal('bb1be98c142444d7a56aa3981c3942a978e4dc33');
  });

  it('When calculating a bucket id, then it should be stable', () => {
    expect(utils.calculateBucketId('user@domain.tld', 'New Bucket'))
      .to.equal('d0c9ac287f89dac76deadfad');
  });

  it('When getting a power of two, then it should round up', () => {
    expect([1, 2, 3, 4, 5, 1023, 1024, 1025].map(utils.getNextPowerOfTwo))
      .to.eql([1, 2, 4, 4, 8, 1024, 1024, 2048]);
  });

  it('When checking a hex string, then it should only accept hex', () => {
    expect(['abc123', 'ABCDEF', 'xyz', '', 123, null].map(utils.isHexaString))
      .to.eql([true, true, false, false, false, false]);
  });
});
