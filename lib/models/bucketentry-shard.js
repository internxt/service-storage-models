'use strict';

const mongoose = require('mongoose'); mongoose.Promise = global.Promise;

/**
 * Relation between BucketEntry and Shard
 * @constructor
 */
var BucketEntryShard = new mongoose.Schema({
  bucketEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BucketEntry',
  },
  shard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shard',
  },
  index: {
    type: Number,
  },
});

module.exports = function(connection) {
  return connection.model('BucketEntryShard', BucketEntryShard);
};

module.exports.Schema = BucketEntryShard;
