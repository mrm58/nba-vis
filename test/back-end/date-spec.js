var request = require('supertest');
var should = require('chai').should();
var app = require('../../index').app;
var moment = require('moment');
var _ = require('lodash');

describe('gamedate page', function() {
  it('should get todays games', function(done) {
    request(app)
      .get('/date')
      .set('Accept', 'application/json')

      .end(function(err, res) {
        res.body.long_date.should.equal(moment().format('MMMM Do YYYY'));
        done();
      });
  });

  it('should get Dec 13 games', function(done) {
    request(app)
      .get('/date/20151213')
      .set('Accept', 'application/json')

      .end(function(err, res) {
        res.body.long_date.should.equal(moment('20151213', 'YYYYMMDD').format('MMMM Do YYYY'));
        res.body.games.should.have.length(4);
        done();
      });
  });

  it('should return an error for a bad date', function(done) {
    request(app)
      .get('/date/2051213')
      .set('Accept', 'application/json')

      .end(function(err, res) {
        should.exist(res.body.error);
        done();
      });
  });

});