var express = require('express');
var app = exports.app = express();

app.use('/bower_components',
  express.static(__dirname + '/bower_components'));
app.use('/public', express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000);

var bodyParser = require('body-parser');
app.use(bodyParser.json());     // what is this?
app.use(bodyParser.urlencoded( {extended: false} ));
// var models = require('./models');
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(cookieParser());

//app.use(require('flash')());

app.use(require('morgan')('dev'));    // what is this?

app.set('view engine', 'jade');

/*********************************************************************
small images:
  http://i.cdn.turner.com/nba/nba/.element/img/2.0/sect/gameinfo/teamlogos/small/DET.gif

commonAllPlayers
  Request URL:http://stats.nba.com/stats/commonallplayers?IsOnlyCurrentSeason=0&LeagueID=00&Season=2015-16
commonTeamRoster (Warriors example)
  Request URL:http://stats.nba.com/stats/commonteamroster?LeagueID=00&Season=2015-16&TeamID=1610612744
teamInfoCommon (Warriors example)
  Request URL:http://stats.nba.com/stats/teaminfocommon?LeagueID=00&SeasonType=Regular+Season&TeamID=1610612744&season=2015-16
*********************************************************************/

/*********************************************************************
rp('http://data.nba.com/data/json/nbacom/2015/gameline/20151129/games.json')
  .then(function(jsonResp) {
    todaysGames = jsonResp;
  })
  .catch(function(err) {
    console.log('There was an error: ' + err);
  });
*********************************************************************/
app.use(require('./routes'));


if (app.get('env') === 'development') {
  app.locals.pretty = true;
} //is used to make what comes back from Curl requests more user friendly

if (process.env.NODE_ENV !== 'test') {
  var server = exports.server = app.listen(app.get('port'), function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
  });
}

// //var server = app.listen(3000, function() {
// var server = app.listen(app.get('port'), function() {
//   var host = server.address().address;
//   var port = server.address().port;

//   console.log('Example app listening at http://%s:%s', host, port);
// });
