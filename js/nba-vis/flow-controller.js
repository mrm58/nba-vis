// ./js/nba-vis/flow-controller.js

angular.module('bewd.nba-vis.flow-controller', ['zingchart-angularjs']);
//second argument is for dependencies

angular.module('bewd.nba-vis.flow-controller')
  .factory('flowControllerService', ['$http', function($http) {
    return {
      getScoreFlow: function(requestedGame) {
        // AJAX request
        return $http.get('/scoreflow/' + requestedGame)
          .then(function(response) {
            return response.data;
          });
      }  // end getScoreFlow(requestedGame) function
    };  //end return
  }])  //end function($http), end factory
  .controller('FlowController', FlowController);


  FlowController.$inject = ['flowControllerService', '$interval', '$log', '$scope', 'startValues'];
  function FlowController(flowControllerService, $interval, $log, $scope, startValues) {
    var vm = this;

    vm.logoUrl = 'http://i.cdn.turner.com/nba/nba/.element/img/2.0/sect/gameinfo/teamlogos';

    function loadScoreFlow(requestedGameID) {
      flowControllerService.getScoreFlow(requestedGameID)
        .then(function(scoreFlowData) {
          $log.debug("getScoreFlow response is ", scoreFlowData);

          if (!scoreFlowData.error) {
            vm.score_elements = scoreFlowData.score_elements;
            vm.game_id = scoreFlowData.game_id;
            vm.away_team = scoreFlowData.away_team;
            vm.home_team = scoreFlowData.home_team;
            vm.gamecode = scoreFlowData.gamecode;
            vm.game_status = scoreFlowData.game_status;
            vm.game_status_id = scoreFlowData.game_status_id;
            $log.debug('game status: ', vm.game_status);
            if (vm.game_status_id == 3) {
              $log.debug('cancelling the flowLoader');
              $interval.cancel(flowLoader);
            } else if (vm.game_status_id == 1) {
              $log.debug('game hasn\'t started yet - cancelling loader and setting a new one for 10 minutes');
              $interval.cancel(flowLoader);
              flowLoader = $interval(reloadScoreFlow, 600000);
            } else if (gameStarted == 2) {
              $log.debug('game has started, but the loader is still set to 10 minutes');
              $interval.cancel(flowLoader);
              flowLoader = $interval(reloadScoreFlow, 10000);
            }



            vm.marginData = {
              "type": 'mixed',
              "plot": {
                'styles': scoreFlowData.margColor,
                'border-radius': '9px'
              },
              "series": [
                {
                  'type': 'bar',
                  'values': scoreFlowData.margins//,
                  //'offset-values': scoreFlowData.offsetFlow
                },
                {
                  'type': 'line',
                  'line-color': scoreFlowData.homeColor,
                  'marker': {
                    'background-color': scoreFlowData.homeColor
                  },
                  'values': scoreFlowData.homeFlow
                },
                {
                  'type': 'line',
                  'line-color': scoreFlowData.awayColor,
                  'marker': {
                    'background-color': scoreFlowData.awayColor
                  },
                  'values': scoreFlowData.awayFlow
                }
              ]
            };
            //{ values : [54,23,34,23,43] },
            //vm.scoreData.series[0].values = scoreFlowData.margins;
    
            //var myNewChart = new Chart(ctx).Bar(vm.score_elements.margin);

          } else {
            vm.error = scoreFlowData.error;
          }
        });  //end function(scoreFlowData), end .then()
    }  //end loadScoreFlow(requestedGameID)

    function reloadScoreFlow() {
      $log.debug('calling loadScoreFlow with game_id of ', game_id);
      loadScoreFlow(game_id);
    }

    var flowLoader;
    var gameStarted = 0;
    var game_id = startValues.game_id;
    loadScoreFlow(game_id);
    flowLoader = $interval(reloadScoreFlow, 10000);

    $scope.$on('$destroy', function() {
      $interval.cancel(flowLoader);
    });

  }