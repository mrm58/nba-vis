// ./js/nba-vis/flow-controller.js

angular.module('bewd.nba-vis.flow-controller', []);
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

    vm.logoUrl = 'http://i.cdn.turner.com/nba/nba/.element/img/2.0/sect/gameinfo/teamlogos/small';

    function loadScoreFlow(requestedDate) {
      flowControllerService.getScoreFlow(requestedDate)
        .then(function(scoreFlowData) {
          $log.debug("getScoreFlow response is ", scoreFlowData);

          if (!scoreFlowData.error) {
            vm.score_elements = scoreFlowData.score_elements;
            vm.game_id = scoreFlowData.game_id;
            vm.gamecode = scoreFlowData.gamecode;
          } else {
            vm.error = scoreFlowData.error;
          }
        });  //end function(scoreFlowData), end .then()
    }  //end loadScoreFlow(requestedDate)

    loadScoreFlow(startValues.game_id);

  }