'use strict';

const expect = require('chai').expect;
const storj = require('storj-lib');
const utils = require('../lib/utils');
const original = storj.utils;

describe('Storage/utils hash helpers', () => {
  it('When hashing, then it should match storj-lib', () => {
    expect(utils.ripemd160sha256('some-data'))
      .to.equal(original.ripemd160sha256('some-data'));
    expect(utils.ripemd160sha256('616263', 'hex'))
      .to.equal(original.ripemd160sha256('616263', 'hex'));
  });

  it('When calculating a bucket id, then it should match storj-lib', () => {
    expect(utils.calculateBucketId('user@domain.tld', 'New Bucket'))
      .to.equal(original.calculateBucketId('user@domain.tld', 'New Bucket'));
  });

  it('When getting a power of two, then it should match storj-lib', () => {
    [1, 2, 3, 4, 5, 1023, 1024, 1025].forEach((num) => {
      expect(utils.getNextPowerOfTwo(num))
        .to.equal(original.getNextPowerOfTwo(num));
    });
  });

  it('When checking a hex string, then it should match storj-lib', () => {
    ['abc123', 'ABCDEF', 'xyz', '', 123, null, undefined].forEach((value) => {
      expect(utils.isHexaString(value)).to.equal(original.isHexaString(value));
    });
  });
});
