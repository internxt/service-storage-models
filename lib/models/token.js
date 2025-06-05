'use strict';

const crypto = require('crypto');
const mongoose = require('mongoose');
const ms = require('ms');
const SchemaOptions = require('../options');
const TOKEN_TTL = ms('1h');

/**
 * Represents a token (for pulling/pushing files)
 * @constructor
 */
var Token = new mongoose.Schema({
  _id: { // token
    type: String,
    required: true
  },
  bucket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bucket',
    required: true
  },
  expires: {
    type: Date,
    default: Date.now,
    required: true
  },
  operation: {
    type: String,
    enum: ['PUSH', 'PULL'],
    required: true
  }
});

Token.plugin(SchemaOptions, {
  read: 'secondaryPreferred'
});

Token.set('toObject', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret._id;
  }
});

Token.virtual('token').get(function() {
  return this._id;
});

Token.methods.expire = async function(callback) {
  this.expires = Date.now();
  
  try {
    await this.save();
    callback();
  } catch (err) {
    callback(err);
  }
};

/**
 * Creates a one time use token for pushing/pulling a file to/from a bucket
 * @param {storage.models.Bucket} bucket
 * @param {String} operation - ['PUSH', 'PULL']
 * @param {Function} callback
 */
Token.statics.create = async function(bucket, operation, callback) {
  let Token = this;
  let token = new Token({
    bucket: bucket._id,
    _id: Token.generate(),
    expires: Date.now() + TOKEN_TTL,
    operation: operation
  });

  try {
    await token.save();
    callback(null, token);
  } catch (err) {
    callback(err);
  }
};


/**
 * Creates a random token by hashing some random bytes and a timestamp
 * @static
 */
Token.statics.generate = function() {
  var rbytes = crypto.randomBytes(512);
  var tstamp = Buffer.from(Date.now().toString());
  var source = Buffer.concat([rbytes, tstamp]);

  return crypto.createHash('sha256').update(source).digest('hex');
};

/**
 * Lookup a token by it's string and return it if valid
 * @param {String} tokenString
 * @param {Function} callback
 */
Token.statics.lookup = async function(tokenString, callback) {
  let Token = this;

  try {
    const token = await Token.findOne({
      _id: tokenString
      // expires: { $gt: Date.now() }
    });

    if (!token) {
      return callback(new Error('Invalid or expired token'));
    }

    callback(null, token);
  } catch (err) {
    callback(err);
  }
};

module.exports = function(connection) {
  return connection.model('Token', Token);
};
