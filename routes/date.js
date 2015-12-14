// ./routes/date.js
var express = require('express');
var app = express.Router();

var rp = require('request-promise');
var moment = require('moment-timezone');
var dataUrl = 'http://data.nba.com/data/';
var logoUrl = 'http://i.cdn.turner.com/nba/nba/.element/img/2.0/sect/gameinfo/teamlogos/small/';

var accepts = {
  'json': 'application/json',
  'html': 'text/html'
};

app.param('format', function checkFormat(req, res, next, param) {
  req.headers.accept = accepts[param];
  next();
});

app.get('/', function(req, res) {
  var cur_moment = moment().tz('America/New_York');
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
  var dateUrl = dataUrl + 'json/nbacom/' + season + '/gameline/' + todaysDate + '/games.json';
  
  var prevDate = prevDay.format('YYYYMMDD');
  var prevDate_long = prevDay.format('MMMM Do YYYY');
  var nextDate = nextDay.format('YYYYMMDD');
  var nextDate_long = nextDay.format('MMMM Do YYYY');

  var jsonRet = {
    long_date: longDate,
    season: season,
    prevDate_long: prevDate_long,
    prevDate: prevDate,
    nextDate_long: nextDate_long,
    nextDate: nextDate,
    logoUrl: logoUrl
  };

  rp(dateUrl)
    .then(function(jsonResp) {
      jsonRet.games = JSON.parse(jsonResp).games;
      res.format({
        html: function() {
          res.render('dateView', jsonRet);
        },
        json: function() {
          res.json(jsonRet);
        }
      });
    })
    .catch(function(err) {
      jsonRet.error = 'There seem to be no games on this day.  Please check the requested date.';
      res.format({
        html: function() {
          res.render('dateView', jsonRet);
        },
        json: function() {
          res.json(jsonRet);
        }
      });
    });
}


module.exports = app;