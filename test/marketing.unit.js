'use strict';

const chai = require('chai');
const expect = chai.expect;
const chaiDate = require('chai-datetime');
const mongoose = require('mongoose'); mongoose.Promise = global.Promise;

chai.use(chaiDate);
require('mongoose-types').loadTypes(mongoose);

const MarketingSchema = require('../lib/models/marketing');

var Marketing;
var connection;

before(done => {
  connection = mongoose.createConnection(
    'mongodb://127.0.0.1:27017/__storj-bridge-test',
    { useNewUrlParser: true, useCreateIndex: true },
    function() {
      Marketing = MarketingSchema(connection);
      Marketing.deleteMany({}, function() {
        done();
      });
    }
  );
});

after(done => {
  connection.close(done);
});

describe('/Storage/models/Marketing', function() {

  describe('#create', function() {

    it('should create a new marketing doc with default props', done => {
      var d = new Date();
      var date = new Date(d.getFullYear(), d.getMonth(), d.getDate());

      Marketing.create('user@domain.tld', function(err, marketing) {
        if (err) {
          return done(err);
        }
        expect(marketing.user).to.equal('user@domain.tld');
        expect(marketing.referralLink).to.be.a('string');
        expect(marketing.created).to.equalDate(date);
        done();
      });
    });

    it('should only create one marketing doc per user', done => {
      Marketing.create('user@domain.tld', function(err) {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal(
          'Marketing doc already exists for user user@domain.tld'
        );
        done();
      });
    });

  });

  describe('#_genReferralLink', function() {

    it('should generate a referral link', done => {
      const link = Marketing._genReferralLink();
      expect(link).to.be.a('string');
      done();
    });

  });

  describe('#_verifyReferralLink', function() {

    it('should return link if link is unique', done => {
      const linkIn = Marketing._genReferralLink();
      Marketing._verifyReferralLink(linkIn, function(err, linkOut) {
        if (err) {
          return done(err);
        }
        expect(linkIn).to.equal(linkOut);
        done();
      });
    });

    it('should fail if link already exists', done => {
      Marketing.create('user1@domain.tld', function(err, marketing) {
        if (err) {
          return done(err);
        }
        const dupLink = marketing.referralLink;
        Marketing._verifyReferralLink(dupLink, function(err) {
          expect(err).to.be.an.instanceOf(Error);
          expect(err.message).to.equal('Duplicate referral link');
          done();
        });
      });
    });

  });

  describe('#_genAndVerify', function() {

    it('should generate and verify referralLink', done => {
      Marketing._genAndVerify(function(err, referralLink) {
        if (err) {
          return done(err);
        }
        expect(referralLink).to.be.a('string');
        Marketing.find({ referralLink }, function(err, docs) {
          if (err) {
            return done(err);
          }
          expect(docs.length).to.equal(0);
          done();
        });
      });
    });

  });

  describe('#isValidReferralLink', function() {

    it('should return referral link if valid', done => {
      Marketing.create('user2@hai.tld', function(err, marketing) {
        if (err) {
          return done(err);
        }
        Marketing.isValidReferralLink(marketing.referralLink)
          .then((result) => {
            expect(result.referralLink).to.equal(marketing.referralLink);
            done();
          });
      });
    });

    it('should fail if referral link is invalid', done => {
      Marketing.isValidReferralLink('invalid-link-123')
        .catch((err) => {
          expect(err).to.be.an.instanceOf(Error);
          expect(err.message).to.equal('Invalid referral link');
          done();
        });
    });

  });

  describe('#toObject', function() {

    it('should contain specified properties', done => {
      Marketing.create('user100@tld.com', function(err, marketing) {
        if (err) {
          return done(err);
        }
        const keys = Object.keys(marketing.toObject());
        expect(keys).to.not.contain('__v', '_id');
        done();
      });
    });

  });

});
