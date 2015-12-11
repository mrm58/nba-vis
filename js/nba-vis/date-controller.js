// ./js/nba-vis/date-controller.js

angular.module('bewd.nba-vis.date-controller', []);
//second argument is for dependencies

angular.module('bewd.nba-vis.date-controller')
  .factory('dateControllerService', ['$http', function($http) {
    return {
      getTodaysGames: function() {
        // AJAX request
        return $http.get('/date')
          .then(function(response) {
            return response.data;
          });
      },  // end getTodaysGames function
      getDatesGames: function(requestedDate) {
        return $http.get('/date/' + requestedDate)
          .then(function(response) {
            return response.data;
          });
      }  //end getDatesGames function
    };  //end return
  }])  //end function($http), end factory
  .controller('DateController', DateController);

  DateController.$inject = ['dateControllerService', '$interval', '$log', '$scope', 'startValues'];
  function DateController(dateControllerService, $interval, $log, $scope, startValues) {
    var vm = this;

    vm.logoUrl = 'http://i.cdn.turner.com/nba/nba/.element/img/2.0/sect/gameinfo/teamlogos/small/';

    function loadGameList(requestedDate) {
      dateControllerService.getDatesGames(requestedDate)
        .then(function(datesGameList) {
          $log.debug("datesGameList response is ", datesGameList);
          vm.long_date = datesGameList.long_date;
          vm.season = datesGameList.season;
          vm.prevDate = datesGameList.prevDate;
          vm.nextDate = datesGameList.nextDate;
          vm.prev_long = datesGameList.prevDate_long;
          vm.next_long = datesGameList.nextDate_long;
          if (!datesGameList.error) {
            vm.gameList = datesGameList.games;
          } else {
            vm.error = datesGameList.error;
          }
        });  //end function(datesGameList), end .then()
    }  //end loadGameList(requestedDate)

    function getTodaysGamesList() {
      dateControllerService.getTodaysGames()
        .then(function(todaysGamesList) {
          $log.debug("todaysGamesList response is ", todaysGamesList);
          vm.long_date = todaysGamesList.long_date;
          vm.season = todaysGamesList.season;
          vm.prevDate = todaysGamesList.prevDate;
          vm.nextDate = todaysGamesList.nextDate;
          vm.prev_long = todaysGamesList.prevDate_long;
          vm.next_long = todaysGamesList.nextDate_long;
          if (!todaysGamesList.error) {
            vm.gameList = todaysGamesList.games;
          } else {
            vm.error = todaysGamesList.error;
          }
        });
    }

    // var todaysFullDate = new Date();
    // var yyyy = todaysFullDate.getFullYear().toString();
    // var mm = (todaysFullDate.getMonth() + 1).toString(); //month count starts at 0 (January = 0)
    // var dd = todaysFullDate.getDate().toString();
    // var todaysDate = yyyy + mm + dd;
    // loadGameList(todaysDate);
    var gameLoader;
    if(startValues.today) {
      console.log('requesting todays games');
      gameLoader = $interval(getTodaysGamesList, 10000);
      getTodaysGamesList();
    } else {
      console.log('requesting games for ' + startValues.dateToGet);
      $interval.cancel(gameLoader);
      loadGameList(startValues.dateToGet);
    }

    $scope.$on('$destroy', function() {
      $interval.cancel(gameLoader);
    });
  }