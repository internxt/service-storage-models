'use strict';

/*jshint expr: true*/

const expect = require('chai').expect;
const mongoose = require('mongoose'); mongoose.Promise = global.Promise;
const storj = require('storj-lib');

require('mongoose-types').loadTypes(mongoose);

const MirrorSchema = require('../lib/models/mirror');
const ContactSchema = require('../lib/models/contact');

var Mirror;
var Contact;
var connection;

before(done => {
  connection = mongoose.createConnection(
    'mongodb://127.0.0.1:27017/__storj-bridge-test',
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    },
    function() {
      Mirror = MirrorSchema(connection);
      Contact = ContactSchema(connection);
      Mirror.deleteMany({}, function() {
        Contact.deleteMany({}, function() {
          done();
        });
      });

    }
  );
});

after(done => {
  connection.close(done);
});

describe('Storage/models/Mirror', function() {

  describe('#create', function() {

    it('should fail without contract', done => {
      Mirror.create({}, {}, function(err, mirror) {
        expect(err).to.be.an.instanceOf(Error);
        expect(mirror).to.be.undefined;
        done();
      });
    });

    it ('should fail without contact', done => {
      Mirror.create({ data_hash: 'data_hash' }, {}, function(err, mirror) {
        expect(err).to.be.an.instanceOf(Error);
        expect(mirror).to.be.undefined;
        done();
      });
    });

    it('should create with default props', done => {
      Contact.record({
        address: '127.0.0.1',
        port: 1337,
        nodeID: storj.KeyPair().getNodeID(),
        lastSeen: Date.now()
      }, function(err, contact) {
        Mirror.create(
          { data_hash: 'data_hash' },
          contact,
          function(err, mirror) {
            expect(err).to.not.be.an.instanceOf(Error);
            // need to check for type of hash?
            expect(mirror.shardHash).to.be.a('string');
            expect(mirror.contact).to.be.a('string');
            expect(mirror.contract).to.be.an('object');
            expect(mirror.isEstablished).to.be.false;
            done();
          });
      });
    });

  });

  describe('#createWithToken', function() {

    it('create with token', done => {
      let contract = {
        data_hash: '838fcd890e2615dcf9a85c372effc388ce5420f2'
      };
      let contact = {
        nodeID: '26a2172fa618c456782103003a5149589076d071'
      };
      let token = '54e462fc1e65b0e1cb5748489d0e104890af5fa383dfd2c8c1' +
          '4986a0b1708b44';
      Mirror.createWithToken(contract, contact, token, function(err, mirror) {
        if (err) {
          return done(err);
        }
        expect(mirror);
        expect(mirror.token).to.equal(token);
        done();
      });
    });

  });

  describe('#toObject', function() {

    it('should contain specified properties', done => {
      Contact.record({
        address: '127.0.0.1',
        port: 1337,
        nodeID: storj.KeyPair().getNodeID(),
        lastSeen: Date.now()
      }, function(err, contact) {
        Mirror.create(
          { data_hash: 'data_hash' },
          contact,
          function(err, mirror) {
            expect(err).to.not.be.an.instanceOf(Error);
            const keys = Object.keys(mirror.toObject());
            expect(keys).to.not.contain('__v', '_id');
            done();
          });
      });
    });

  });

});
