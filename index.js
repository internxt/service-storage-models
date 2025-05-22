'use strict';

const assert = require('assert');
const mongoose = require('mongoose'); mongoose.Promise = global.Promise;
const merge = require('merge');
require('dotenv').config({ silent: true });


mongoose.Promise = require('bluebird');
// Retains the default behavior of mongoose v5, when we upgrade to mongoose v7 we can remove this
mongoose.set('strictQuery', false);

/**
 * MongoDB storage interface
 * @constructor
 * @param {Object} mongoURI
 * @param {Object} mongoOptions
 * @param {Object} storageOptions
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

  this._log.info('opening database connection at %s', this._uri);
  this._log.info(`database connection options ${JSON.stringify(opts)}`);
  // TODO: investigate where the options of this._options come from. It is inserting options that are not
  // valid for mongoose. For example: { auto_reconnect: true, poolSize: 5 }
  this.connection = mongoose.createConnection(this._uri, defaultOpts);

   this._connectionPromise = this.connection.asPromise().then(() => {
    self._log.info('connected to database');
    this.models = this._createBoundModels();
    return self;
  }).catch(err => {
    self._log.error('database connection error: ', err);
    throw err;
  });
  // TODO: Remove. This should not be needed since we are using the promise-based connection
/*   if (this.connection.then) {
      self._log.info('Using promise-based connection');
    // handle promise rejections rather than using event emmiters
    this.connection.then(() => {
      self._log.info('connected to database');
    }).catch(err => {
      self._log.error('database connection error: ', err);
    });
  } else {
    self._log.info('Using event-based connection');
    // For unit tests
    this.connection.on('connected', () => {
      self._log.info('connected to database');
    });

    this.connection.on('error', err => {
      self._log.error('database connection error: ', err);
    });
    
    this.connection.on('disconnected', function() {
    self._log.warn('disconnected from database');
  });
  } */
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

/**
 * Wait for connection to be ready
 * @returns {Promise<Storage>}
 */
Storage.prototype.ready = function() {
  return this._connectionPromise;
};

module.exports = Storage;
