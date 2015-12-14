(function() {

  angular.module('bewd.nba-vis', ['bewd.nba-vis.date-controller', 'bewd.nba-vis.flow-controller', 'ngRoute'])
    .config(
      function($locationProvider, $routeProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.when('/gamedate', {
          templateUrl: '/partials/dateView',
          controller: 'DateController',
          controllerAs: 'vm',
          resolve: {
            startValues: function() {
              return {
                today: true
              };
            }
          },
          bindToController: true
        }); //end $routeProvider.when('/gamedate')
        $routeProvider.when('/gamedate/:requestedDate', {
          templateUrl: '/partials/dateView',
          controller: 'DateController',
          controllerAs: 'vm',
          resolve: {
            startValues: function($route) {
              return {
                dateToGet: $route.current.params.requestedDate
              };
            }
          },
          bindToController: true
        }); //end $routeProvider.when('/gamedate/:requestedDate')
        $routeProvider.when('/gameflow/', {
          templateUrl: '/partials/gameFlow',
          controller: 'FlowController',
          controllerAs: 'vm',
          resolve: {
            startValues: function($route) {
              return {
                game_id: ''
              };
            }
          },
          bindToController: true
        }); //end $routeProvider.when('/gameflow/')
        $routeProvider.when('/gameflow/:game_id', {
          templateUrl: '/partials/gameFlow',
          controller: 'FlowController',
          controllerAs: 'vm',
          resolve: {
            startValues: function($route) {
              return {
                game_id: $route.current.params.game_id
              };
            }
          },
          bindToController: true
        }); //end $routeProvider.when('/gameflow/:game_id')
        $routeProvider.when('/', {
          templateUrl: '/partials/dateView',
          controller: 'DateController',
          controllerAs: 'vm',
          resolve: {
            startValues: function() {
              return {
                today: true
              };
            }
          },
          bindToController: true
        }); //end $routeProvider.when('/')
      } //end function($locationProvider, $routeProvider)
    ); //end config()
    //end angular.module('bewd.nba-vis')

})();  //end top level (function())