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

app.get('/:requested_game', function(req, res) {
  getBoxScoreFromAPI(req.params.requested_game).then(function(boxScoreResp) {
    //console.log('got a boxScoreResp');
    return getGameInfoHTML(boxScoreResp.gamecode);
  }).then(function(gameInfoHTMLresp) {
    console.log('got a gameinfo html resp');
    //var gameInfoCheerioObj = loadHTMLforParsing(gameInfoHTMLresp);
    return loadHTMLforParsing(gameInfoHTMLresp);
  }).then(function(gameInfoCheerioObj) {
    //console.log('got a gameInfoCheerioObj: ' + gameInfoCheerioObj);
    var scoreElements = searchForScoreRows(gameInfoCheerioObj);
    console.log('score elements grabbed, length of ' + scoreElements.length);
    res.json({
      game_id: 'testy', //boxScoreResp.game_id,
      gamecode: 'testytest', //boxScoreResp.gamecode,
      score_elements: scoreElements
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

  return bluebird.promisifyAll(gameInfo);
}

function searchForScoreRows(gameInfoCheerioObj) {
  // the scores are all within a table element with class "nbaGIPbPMidScore"
  // example: <td class="nbaGIPbPMidScore">11:24 <br>[SAC 2-0]</td>
  //
  console.log('in searchForScoreRows function');
  var scoreInfo = [];
  gameInfoCheerioObj('td.nbaGIPbPMidScore').each(function(idx, elem) {
    var score_element = {
      score: gameInfoCheerioObj(elem).text(),
      away_team: gameInfoCheerioObj(elem).prev().text(),
      home_team: gameInfoCheerioObj(elem).next().text()
    };
    scoreInfo.push(score_element); //gameInfoCheerioObj(elem).text();
  });
  console.log('scoreinfo.length = ' + scoreInfo.length);

  return scoreInfo;
}

module.exports = app;