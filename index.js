var express = require('express');
//var app = express();
var app = exports.app = express();

// require('express-debug')(app, {});

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
// if (process.env.REDIS_URL) {
//   var RedisStore = require('connect-redis')(session);

//   app.use(session({
//     store: new RedisStore({ url: process.env.REDIS_URL }),
//     secret: 'I see undead people',
//     saveUninitialized: false,
//     resave: false
//   }));
// } else {
//   var Sequelize = require('sequelize');
//   var SequelizeStore = require('connect-session-sequelize')(session.Store);

//   var sequelize = new Sequelize(
//     "database",
//     "username",
//     "password", {
//       "dialect": "sqlite",
//       "storage": "./store/session.sqlite"
//     });

//   var store = new SequelizeStore({ db: sequelize });
//   store.sync();
//   app.use(session({
//     saveUninitialized: false,
//     resave: false,
//     secret: 'I see dead people',
//     store: store
//   }));
// }

//app.use(require('flash')());

app.use(require('morgan')('dev'));    // what is this?

app.set('view engine', 'jade');

var nba = require('nba');
var Promise = require('bluebird');
var nbaAPI = Promise.promisifyAll(nba.api);

/*********************************************************************
*--------------------------------------------------------------------*
* NBA Functions                                                      *
*--------------------------------------------------------------------*
nba.api
nba.findPlayer
nba.playerIdFromName
nba.players
nba.ready
nba.searchPlayers
nba.sportVu
nba.stats
nba.teamIdFromName
nba.teams
nba.updatePlayers
nba.updateTeams
nba.usePromises
*--------------------------------------------------------------------*
* NBA API Functions                                                  *
*   *Async versions are promisified by the Bluebird library          *
*--------------------------------------------------------------------*
nbaAPI.boxScoreAdvanced, nbaAPI.boxScoreAdvancedAsync
nbaAPI.boxScoreFourFactors, nbaAPI.boxScoreFourFactorsAsync
nbaAPI.boxScoreMisc, nbaAPI.boxScoreMiscAsync
nbaAPI.boxScoreScoring, nbaAPI.boxScoreScoringAsync
nbaAPI.boxScoreUsage, nbaAPI.boxScoreUsageAsync
nbaAPI.commonTeamRoster, nbaAPI.commonTeamRosterAsync
nbaAPI.playByPlay, nbaAPI.playByPlayAsync
nbaAPI.playerDashPtReboundLogs, nbaAPI.playerDashPtReboundLogsAsync
nbaAPI.playerDashPtShotLog, nbaAPI.playerDashPtShotLogAsync
nbaAPI.playerInfo, nbaAPI.playerInfoAsync
nbaAPI.playerProfile, nbaAPI.playerProfileAsync
nbaAPI.playerSplits, nbaAPI.playerSplitsAsync
nbaAPI.playersInfo, nbaAPI.playersInfoAsync
nbaAPI.scoreboard, nbaAPI.scoreboardAsync
nbaAPI.shots, nbaAPI.shotsAsync
nbaAPI.teamHistoricalLeaders, nbaAPI.teamHistoricalLeadersAsync
nbaAPI.teamInfoCommon, nbaAPI.teamInfoCommonAsync
nbaAPI.teamPlayerDashboard, nbaAPI.teamPlayerDashboardAsync
nbaAPI.teamSplits, nbaAPI.teamSplitsAsync
nbaAPI.teamStats, nbaAPI.teamStatsAsync
nbaAPI.teamYears, nbaAPI.teamYearsAsync
*********************************************************************/

/*********************************************************************
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

// app.get('/', function(req, res) {
//   var jsonObj = {nba: nba};
//   var lebron = nba.findPlayer('lebron james');
//   jsonObj.lebron = lebron;
//   jsonObj.lebronID = lebron.playerId;

//   nbaAPI.playerProfileAsync({playerId: lebron.playerId})
//     .then(function(profile) {
//       return nbaAPI.playerInfoAsync({playerId: lebron.playerId})
//         .then(function(info) {
//           jsonObj.lebronProfile = profile;
//           jsonObj.lebronInfo = info;
//           res.send(jsonObj);
//         });
//     }).catch(function(err){
//       jsonObj.err = err;
//       res.json(jsonObj);
//     });
// });

// app.get('/team', function(req, res) {
//   //nba.updateTeams();
//   var jsonObj = {nba: nba};
//   var knicksID = nba.teamIdFromName('knicks');
//   nbaAPI.teamInfoCommonAsync({teamId: knicksID})
//     .then(function(teamInfo) {
//       return nbaAPI.commonTeamRosterAsync({teamId: knicksID})
//         .then(function(teamRoster) {
//           jsonObj.knicks = teamInfo;
//           jsonObj.roster = teamRoster;
//           res.json(jsonObj);
//         });
//     });
// });


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
