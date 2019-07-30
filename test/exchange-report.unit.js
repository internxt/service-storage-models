'use strict';

// const storj = require('storj-lib');
const expect = require('chai').expect;
const mongoose = require('mongoose'); mongoose.Promise = global.Promise;

require('mongoose-types').loadTypes(mongoose);

const ExchangeReportSchema = require('../lib/models/exchange-report');

var ExchangeReport;
var connection;

before(done => {
  connection = mongoose.createConnection(
    'mongodb://127.0.0.1:27017/__storj-bridge-test',
    { useNewUrlParser: true, useCreateIndex: true },
    function() {
      ExchangeReport = ExchangeReportSchema(connection);
      ExchangeReport.deleteMany({}, function() {
        done();
      });
    }
  );
});

after(done => {
  connection.close(done);
});

describe('Storage/models/Exchange-Report', function() {

  it('should create exchange report with default props', done => {
    var newExchangeReport = new ExchangeReport({
      reporterId: 'reporterId',
      clientId: 'clientId',
      farmerId: 'farmerId',
      dataHash: 'dataHash',
      exchangeStart: new Date(),
      exchangeEnd: new Date(),
      exchangeResultCode: 1,
      exchangeResultMessage: 'succeeded'
    });

    newExchangeReport.save(function(err, report) {
      expect(err).to.not.be.an.instanceOf(Error);
      expect(report.created).to.be.an.instanceOf(Date);
      expect(report.reporterId).to.be.a('string');
      expect(report.clientId).to.be.a('string');
      expect(report.farmerId).to.be.a('string');
      expect(report.dataHash).to.be.a('string');
      expect(report.exchangeStart).to.be.an.instanceOf(Date);
      expect(report.exchangeEnd).to.be.an.instanceOf(Date);
      expect(report.exchangeResultCode).to.be.a('number');
      expect(report.exchangeResultMessage).to.be.a('string');
      done();
    });

  });

});
