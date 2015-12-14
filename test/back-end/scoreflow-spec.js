var request = require('supertest');
var should = require('chai').should();
var app = require('../../index').app;
var moment = require('moment');

describe('scoreflow page', function() {

  it('should return an error for no GameID', function(done) {
    request(app)
      .get('/scoreflow')
      .set('Accept', 'application/json')

      .end(function(err, res) {
        should.exist(res.body.error);
        done();
      });
  });


  it('should return an error for a bad GameID', function(done) {
    request(app)
      .get('/scoreflow/01033')
      .set('Accept', 'application/json')

      .end(function(err, res) {
        should.exist(res.body.error);
        done();
      });
  });

});