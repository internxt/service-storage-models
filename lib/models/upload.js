'use strict';

const assert = require('assert');
const mongoose = require('mongoose'); mongoose.Promise = global.Promise;
const validateUUID = require('uuid-validate');
const SchemaOptions = require('../options');

/**
 * Represents an upload model
 * @constructor
 */
var UploadSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    validate: {
      validator: value => validateUUID(value, 4),
      message: 'Invalid UUID'
    }
  },
  index: {
    type: Number,
    required: true
  },
  contracts: [{
    _id: false,
    nodeID: String,
    contract: {
      version: Number,
      store_begin: {
        type: Date,
        default: function() {
          return Date.now();
        }
      },
      farmer_id: String,
      data_size: Number,
    }
  }],
});

UploadSchema.plugin(SchemaOptions);

UploadSchema.index({ uuid: 1 });

UploadSchema.set('toObject', {
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret._id;

    ret.id = doc._id;
  }
});

/**
 * Validates the provided upload data
 * @param {Object} upload
 * @private
 */
UploadSchema.methods._validate = function() {
  let contracts = this.contracts;
  
  assert(typeof this.index === 'number', 'Invalid index supplied');
  assert(Number.isFinite(this.index), 'Invalid index supplied');
  assert(this.index >= 0, 'Invalid index supplied');
  assert(Array.isArray(contracts), 'Invalid contracts supplied');
  assert(contracts.length, 'Not enough contracts supplied');
};

/**
 * Creates a Upload
 * @param {Function} callback
 */
UploadSchema.statics.create = function(item, callback) {
  let Upload = this;
  let upload = new Upload(item);

  try {
    upload._validate();
  } catch (err) {
    return callback(err);
  }

  upload.save(function(err) {
    if (err) {
      return callback(err);
    }

    callback(null, upload);
  });
};

module.exports = function(connection) {
  return connection.model('Upload', UploadSchema);
};
