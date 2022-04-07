'use strict';

const mongoose = require('mongoose'); mongoose.Promise = global.Promise;
const SchemaOptions = require('../options');

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

BucketEntryShard.plugin(SchemaOptions);

module.exports = function(connection) {
  return connection.model('BucketEntryShard', BucketEntryShard);
};
