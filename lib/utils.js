'use strict';

const crypto = require('crypto');
const moment = require('moment');

module.exports.isValidEmail = function (email) {
  // NB: emails must conform to RFC 3969 (https://tools.ietf.org/html/rfc3696)
  //     excluding @heroku.storj.io emails - because they're huge
  const tester = /^(.{1,64}@.{1,255}|.{1,255}@heroku\.storj\.io)$/;
  if (!tester.test(email)) {
    return false;
  }
  return true;
};

/**
 * Adds X num of months from today to set expiration date on promo_amount
 * @param {number} numOfMonths
 */
module.exports.setPromoExpiration = function(value, unit) {
  return moment.utc().add(value, unit).toDate();
};

module.exports.keysOf = function(obj) {
  return Object.keys(obj).map((key) => obj[key]);
};

const sha256 = function (input, encoding) {
  return crypto.createHash('sha256').update(input, encoding).digest('hex');
};

const ripemd160 = function (input, encoding) {
  return crypto.createHash('ripemd160').update(input, encoding).digest('hex');
};

/**
 * Returns the RIPEMD-160 hash of the SHA-256 hash of the input
 * @param {String|Buffer} input - Data to hash
 * @param {String} encoding - The encoding type of the data
 * @returns {String}
 */
module.exports.ripemd160sha256 = function (input, encoding) {
  return ripemd160(Buffer.from(sha256(input, encoding), 'hex'));
};

/**
 * Indicates if the value is a hexadecimal string
 * @param {*} value
 * @returns {Boolean}
 */
module.exports.isHexaString = function (value) {
  return typeof value === 'string' && /^[0-9a-fA-F]+$/.test(value);
};

/**
 * Returns the next power of two for the number
 * @param {Number} num
 * @returns {Number}
 */
module.exports.getNextPowerOfTwo = function (num) {
  return Math.pow(2, Math.ceil(Math.log(num) / Math.log(2)));
};

/**
 * Calculates the bucket id of a user and a bucket name
 * @param {String} user
 * @param {String} bucketName
 * @returns {String}
 */
module.exports.calculateBucketId = function (user, bucketName) {
  const hash = module.exports.ripemd160sha256(user + bucketName, 'utf-8');

  return hash.substring(0, 24);
};
