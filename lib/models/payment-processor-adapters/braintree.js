'use strict';

const constants = require('../../constants');
// eslint-disable-next-line no-unused-vars
const BRAINTREE = constants.PAYMENT_PROCESSORS.BRAINTREE; // jshint ignore:line

const braintreeAdapter = {
  add: function(){
    return new Promise((resolve, reject) => {
      return reject({
        status: 'error',
        message: 'braintree payment processor adapter not yet implemented!'
      });
    });
  }
};

module.exports = braintreeAdapter;
