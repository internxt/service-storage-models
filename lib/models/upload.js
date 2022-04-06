'use strict';

const assert = require('assert');
const mongoose = require('mongoose'); mongoose.Promise = global.Promise;
const { validate: uuidValidate, version: uuidVersion } = require('uuid');
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
      validator: value => (uuidValidate(value) && uuidVersion(value) === 4),
      message: 'Invalid UUID'
    }
  },
  index: {
    type: String,
    required: true
  },
  data_size: {
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

  assert(typeof this.index === 'string', 'Index must be string');
  assert(this.index.length === 64, 'Index must have 64 characters');
  const hexRegexp = /^([0-9a-fA-F]{2})+$/;
  assert(this.index.match(hexRegexp), 'Index must be hexadecimal');

  assert(typeof this.data_size === 'number', 'Size must be number');
  assert(this.data_size > 0, 'Size must be greater than 0');

  assert(Array.isArray(contracts), 'Invalid contracts supplied');
  assert(contracts.length, 'Not enough contracts supplied');
  contracts.forEach(function (contract) {
    assert(Number.isInteger(contract.contract.version), 'Version must be an integer');
    assert(contract.contract.version > 0, 'Version must be greater than 0');
    assert(Number.isFinite(contract.contract.data_size), 'Size of contract must be finite');
    assert(contract.contract.data_size > 0, 'Size of contract must be greater than 0');
  });
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
