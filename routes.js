// routes.js
var express = require('express');
var app = express.Router();

var rp = require('request-promise');
var moment = require('moment');
var baseUrl = 'http://data.nba.com/data/';

app.get('/', function(req, res) {
  res.render('index');
});

app.use('/date', require('./routes/date'));


app.get('/partials/:name', function(req, res) {
  console.log('render partials/' + req.params.name);
  res.render('partials/' + req.params.name);
});

app.get('/*', function(req, res) {
  res.render('index');
});

module.exports = app;

// app.use(function(req, res, next) {
//   req.isAuthenticated = function() {
//     return !!req.currentUser;
//   };
//   if (req.session.user_id) {
//     models.user.findById(req.session.user_id).then(function(user) {
//       if (user) {
//         console.log("User logged in as " + user.username);
//         req.currentUser = res.locals.currentUser = user;
//       }
//       next();
//     });
//   } else {
//     next();
//   }
// });

// var roles = require('./roles');
// app.use(roles.middleware({ userProperty: 'currentUser' }));