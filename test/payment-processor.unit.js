'use strict';

const expect = require('chai').expect;
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const PaymentProcessorSchema = require('../lib/models/payment-processor');

let PaymentProcessor;
let connection;

require('mongoose-types').loadTypes(mongoose);

before(function (done) {
  connection = mongoose.createConnection(
    'mongodb://127.0.0.1:27017/__storj-bridge-test',
    { useNewUrlParser: true, useCreateIndex: true },
    () => {
      PaymentProcessor = PaymentProcessorSchema(connection);
      PaymentProcessor.deleteMany({}, done);
    }
  );
});

after(function (done) {
  connection.close(done);
});

describe('Storage/models/PaymentProcessor', () => {

  describe('@constructor', () => {
    it('should fail validation', function (done) {
      const pp = new PaymentProcessor({
        user: 'nobody@',
        name: 'stripe'
      });
      pp.save((err) => {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.match(/^paymentprocessor validation failed.*/i);
        done();
      })
      ;
    });
    it('should NOT fail validation', function (done) {
      const pp = new PaymentProcessor({
        user: 'somebody@somewhere.com',
        name: 'stripe'
      });
      pp.save(done);
    });
  });

  describe('#currentBillingPeriod', () => {
    it('should return a billing period range', () => {
      const pp = new PaymentProcessor({
        user: 'someone@somewhere.com',
        name: 'stripe',
        rawData: [{billingDate: 1}]
      });
      const actual = pp.currentBillingPeriod;
      expect(actual).to.have.property('startMoment');
      expect(actual).to.have.property('endMoment');
    });
  });

  describe('#toObject', () => {
    let pp;

    before(() => {
      pp = new PaymentProcessor({
        name: 'stripe',
        rawData: [{billingDate: 1}]
      });
    });

    it('should NOT include deleted members', () => {
      const actual = pp.toObject();
      expect(actual).to.not.have.property('__v');
      expect(actual).to.not.have.property('_id');
      expect(actual).to.not.have.property('rawData');
    });

    it('should include virtual members', () => {
      const actual = pp.toObject();
      expect(actual).to.have.property('data');
      expect(actual).to.have.property('adapter');
      expect(actual).to.have.property('defaultPaymentMethod');
    });
  });

  describe('#toJSON', () => {
    let pp;

    before(() => {
      pp = new PaymentProcessor({
        name: 'stripe',
        rawData: [{billingDate: 1}]
      });
    });

    it('should NOT include deleted members', () => {
      const actual = pp.toJSON();
      expect(actual).to.not.have.property('__v');
      expect(actual).to.not.have.property('_id');
      expect(actual).to.not.have.property('rawData');
    });

    it('should include virtual members', () => {
      const actual = pp.toJSON();
      expect(actual).to.have.property('data');
      expect(actual).to.have.property('adapter');
      expect(actual).to.have.property('defaultPaymentMethod');
    });
  });
});
