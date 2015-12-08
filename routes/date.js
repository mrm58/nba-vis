// ./routes/date.js
var express = require('express');
var app = express.Router();

var rp = require('request-promise');
var moment = require('moment');
var baseUrl = 'http://data.nba.com/data/';

var accepts = {
  'json': 'application/json',
  'html': 'text/html'
};

app.param('format', function checkFormat(req, res, next, param) {
  req.headers.accept = accepts[param];
  next();
});

app.get('/', function(req, res) {
  var cur_moment = moment();
  var prevDate = moment().subtract(1, 'days');
  var nextDate = moment().add(1, 'days');
  getDateResponse(cur_moment, prevDate, nextDate, req, res);

});

app.get('/:date_of_games', function(req, res) {
  var date_moment = moment(req.params.date_of_games, 'YYYYMMDD');
  var prevDate = moment(req.params.date_of_games, 'YYYYMMDD').subtract(1, 'days');
  var nextDate = moment(req.params.date_of_games, 'YYYYMMDD').add(1, 'days');
  getDateResponse(date_moment, prevDate, nextDate, req, res);

});

function getDateResponse(requested_date_moment, prevDay, nextDay, req, res) {
  var yyyy = requested_date_moment.format('YYYY');
  var mm = requested_date_moment.format('MM');
  var season = (mm > 9) ? yyyy : yyyy - 1;
  var todaysDate = requested_date_moment.format('YYYYMMDD');
  var longDate = requested_date_moment.format('MMMM Do YYYY');
  var dateUrl = baseUrl + 'json/nbacom/' + season + '/gameline/' + todaysDate + '/games.json';
  // var nextDay = requested_date_moment.subtract(1, 'days');
  // var prevDay = requested_date_moment.add(1, 'days');
  var prevDate = prevDay.format('YYYYMMDD');
  var prevDate_long = prevDay.format('MMMM Do YYYY');
  var nextDate = nextDay.format('YYYYMMDD');
  var nextDate_long = nextDay.format('MMMM Do YYYY');

  rp(dateUrl)
    .then(function(jsonResp) {
      res.format({
        html: function() {
          res.render('dateView', {
            games: JSON.parse(jsonResp).games,
            long_date: longDate,
            season: season,
            prevDate_long: prevDate_long,
            prevDate: prevDate,
            nextDate_long: nextDate_long,
            nextDate: nextDate
          });
        },
        json: function() {
          res.json({
            games: JSON.parse(jsonResp).games,
            long_date: longDate,
            season: season,
            prevDate_long: prevDate_long,
            prevDate: prevDate,
            nextDate_long: nextDate_long,
            nextDate: nextDate
          });
        }
      });
    })
    .catch(function(err) {
      res.format({
        html: function() {
          res.render('dateView', {
            error: 'There seem to be no games on this day.  Please check the requested date.',
            long_date: longDate,
            season: season,
            prevDate_long: prevDate_long,
            prevDate: prevDate,
            nextDate_long: nextDate_long,
            nextDate: nextDate
          });
        },
        json: function() {
          res.json({
            error: 'There seem to be no games on this day.  Please check the requested date.',
            long_date: longDate,
            season: season,
            prevDate_long: prevDate_long,
            prevDate: prevDate,
            nextDate_long: nextDate_long,
            nextDate: nextDate
          });
        }
      });
    });
}


module.exports = app;