'use strict';

const assert = require('assert');
const mongoose = require('mongoose');
const merge = require('merge');
require('dotenv').config({ silent: true });

require('mongoose-types').loadTypes(mongoose);

mongoose.Promise = require('bluebird');

/**
 * MongoDB storage interface
 * @constructor
 * @param {Object} mongoConf
 * @param {Object} options
 */
function Storage(mongoURI, mongoOptions, storageOptions) {
  if (!(this instanceof Storage)) {
    return new Storage(mongoURI, mongoOptions, storageOptions);
  }

  assert(typeof mongoOptions === 'object', 'Invalid mongo options supplied');

  this._uri = mongoURI;
  this._options = mongoOptions;

  const defaultLogger = {
    info: console.log,
    debug: console.log,
    error: console.error,
    warn: console.warn
  };
  this._log = defaultLogger;
  if (storageOptions && storageOptions.logger) {
    this._log = storageOptions.logger;
  }

  // connect to the database
  this._connect();
}

Storage.models = require('./lib/models');
Storage.constants = require('./lib/constants');

/**
 * Connects to the database
 * @returns {mongoose.Connection}
 */
Storage.prototype._connect = function() {
  var self = this;

  var defaultOpts = {
    ssl: false,    
  };

  var opts = merge.recursive(true, defaultOpts, this._options);

  if (opts.server){
    this._log.warn(`Deprecated 'server' option detected in database configuration. This option was removed in MongoDB driver 4.x and will be ignored. Please remove it from your configuration. Value: ${JSON.stringify(opts.server)}`);
    delete opts.server
  }

  this._log.info('opening database connection at %s', this._uri);

  this.connection = mongoose.createConnection(this._uri, opts);

  this.connection.on('error', function(err) {
    self._log.error('database connection error: %s', err.message);
  });

  this.connection.on('disconnected', function() {
    self._log.warn('disconnected from database');
  });

  this.connection.on('connected', function() {
    self._log.info('connected to database');
  });

  this.models = this._createBoundModels();
};

/**
 * Return a dictionary of models bound to this connection
 * @returns {Object}
 */
Storage.prototype._createBoundModels = function() {
  var bound = {};

  for (let model in Storage.models) {
    bound[model] = Storage.models[model](this.connection);
  }

  return bound;
};


Storage.prototype.ready = function() {
  return this._connectionPromise;
};

module.exports = Storage;
