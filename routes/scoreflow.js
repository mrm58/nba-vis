// ./routes/date.js
var express = require('express');
var app = express.Router();

var rp = require('request-promise');
var cheerio = require('cheerio');
var moment = require('moment');
var bluebird = require('bluebird');

var dataUrl = 'http://data.nba.com/data/';
var apiUrl = 'http://stats.nba.com/stats/';
var boxScoreParams = '/?StartPeriod=1&EndPeriod=4&StartRange=0&EndRange=0&RangeType=0&';
var baseGameUrl = 'http://www.nba.com/games/';
// + {date}/{Away}{Home}/gameinfo.html -> {gamecode} = {date}/{Away}{Home}
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
  res.json({error: 'Error: Please provide a GamID'});
});

app.get('/:requested_game', function(req, res) {
  getBoxScoreFromAPI(req.params.requested_game).then(function(boxScoreResp) {
    //console.log('got a boxScoreResp');
    getGameInfoHTML(boxScoreResp.gamecode).then(function(gameInfoHTMLresp) {
      //console.log('got a gameinfo html resp');
      return loadHTMLforParsing(gameInfoHTMLresp);
    }).then(function(gameInfoCheerioObj) {
      //console.log('got a gameInfoCheerioObj: ' + gameInfoCheerioObj);
      var scoreElements = searchForScoreRows(gameInfoCheerioObj);
      console.log('score elements grabbed, length of ' + scoreElements.length);
      res.json({
        game_id: boxScoreResp.game_id,
        gamecode: boxScoreResp.gamecode,
        game_status: boxScoreResp.game_status,
        game_status_id: boxScoreResp.game_status_id,
        away_team: boxScoreResp.away_team,
        home_team: boxScoreResp.home_team,
        score_elements: scoreElements.scoreElements,
        margins: scoreElements.margins,
        homeFlow: scoreElements.homeFlow,
        awayFlow: scoreElements.awayFlow
      });
    });
  })
  .catch(function(err) {
    res.json({error: 'Error: ' + err});
  });
});

function getBoxScoreFromAPI(game_id) {
  //http://stats.nba.com/stats/boxscore/
  //?StartPeriod=1&EndPeriod=4&StartRange=0&EndRange=0&RangeType=0&GameID={game_id}
  //Gamecode in the response is response.resultSets[0].rowSet[0][5]
  var boxScoreUrl = apiUrl + 'boxscore' + boxScoreParams + "GameID=" + game_id;
  console.log('box score api url: ' + boxScoreUrl);

  return rp(boxScoreUrl)
    .then(function(jsonResp) {
      //console.log('got a jsonResp from the boxScoreUrl');
      //console.log('jsonResp: ' + jsonResp);
      return {
        game_id: game_id,
        game_status: JSON.parse(jsonResp).resultSets[0].rowSet[0][4],
        game_status_id: JSON.parse(jsonResp).resultSets[0].rowSet[0][3],
        away_team: JSON.parse(jsonResp).resultSets[1].rowSet[1][4],
        home_team: JSON.parse(jsonResp).resultSets[1].rowSet[0][4],
        gamecode: JSON.parse(jsonResp).resultSets[0].rowSet[0][5]
      };
    })
    .catch(function(err) {
      //console.log('caught an error from the boxScoreUrl');
      throw 'Problem grabbing the game box score. Error:' + err;
    });
}

function getGameInfoHTML(gamecode) {
  // http://www.nba.com/games/{gamecode}/gameinfo.html -> 
  // {gamecode} = {date}/{Away}{Home}
  var gameInfoUrl = baseGameUrl + gamecode + '/gameinfo.html';
  console.log('gameInfoUrl: ' + gameInfoUrl);
  return rp(gameInfoUrl)
    .then(function(htmlResp) {
      console.log('got an html resp from gameInfoUrl');
      //console.log('html resp: ' + htmlResp);
      return htmlResp;
    })
    .catch(function(err) {
      console.log('caught an error grabbing the gameinfo html');
      throw 'Problem grabbing the gameinfo HTML page. Error: ' + err;
    });
}

function loadHTMLforParsing(gameInfoHTML) {
  // parse the HTML using cheerio for score updates
  // the scores are all within a table element with class "nbaGIPbPMidScore"
  // example: <td class="nbaGIPbPMidScore">05:52 <br>[POR 18-6]</td>
  console.log('in loadHTMLforParsing function');
  var gameInfo = cheerio.load(gameInfoHTML.toString());
  console.log('loaded HTML into gameInfo object');

  return gameInfo;
}

function searchForScoreRows(gameInfoCheerioObj) {
  // the scores are all within a table element with class "nbaGIPbPMidScore"
  // example: <td class="nbaGIPbPMidScore">11:24 <br>[SAC 2-0]</td>
  //
  console.log('in searchForScoreRows function');
  var scoreElements = [];
  var margins = [];
  var homeFlow = [];
  var awayFlow = [];
  var timestampRE = /\d+:\d+[.]?\d?/;
  var team_textRE = /[A-Z]{3}/;
  var score_textRE = /\d+-\d+/;
  var curMin = 12;
  var qtr = 1;

  gameInfoCheerioObj('td.nbaGIPbPMidScore').each(function(idx, elem) {
    var full_score_text = gameInfoCheerioObj(elem).text();
    var away_team_text = gameInfoCheerioObj(elem).prev().text();
    var home_team_text = gameInfoCheerioObj(elem).next().text();
    //console.log('awayTeamText: ' + away_team_text + '(length: ' + away_team_text.length + ') homeTeamText: ' + home_team_text + '(length: ' + home_team_text.length + ')');

    var timestamp = timestampRE.exec(full_score_text)[0];
    var team_text = team_textRE.exec(full_score_text)[0];
    var score_text = score_textRE.exec(full_score_text)[0];

    var scoreVals = score_text.match(/\d+/g);

    var timeVals = timestamp.match(/[\d.]+/g);
    var minutes = parseFloat(timeVals[0]);
    var seconds = parseFloat(timeVals[1]);
    qtr = (minutes > curMin) ? (qtr + 1) : qtr;
    curMin = minutes;

    if(away_team_text.length > 1) {
      away_score = scoreVals[0];
      home_score = scoreVals[1];
    } else {
      away_score = scoreVals[1];
      home_score = scoreVals[0];
    }
    var margin = home_score - away_score;

    var score_element = {
      full_score_text: full_score_text,
      away_team_text: away_team_text,
      home_team_text: home_team_text,
      team_text: team_text,
      qtr: qtr,
      timestamp: timestamp,
      minutes: minutes,
      seconds: seconds,
      score_text: score_text,
      away_score: away_score,
      home_score: home_score,
      margin: margin
    };

    scoreElements.push(score_element); //gameInfoCheerioObj(elem).text();
    margins.push(margin);
    homeFlow.push(home_score);
    awayFlow.push(away_score);
  });
  console.log('scoreinfo.length = ' + scoreElements.length);

  var scoreInfo = {
    scoreElements: scoreElements,
    margins: margins,
    awayFlow: awayFlow,
    homeFlow: homeFlow
  };

  return scoreInfo;
}

module.exports = app;