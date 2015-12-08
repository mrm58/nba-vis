(function() {

  angular.module('bewd.nba-vis', ['bewd.nba-vis.date-controller', 'ngRoute'])
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
        $routeProvider.when('/game', {
          //
        }); //end $routeProvider.when('/game')
        $routeProvider.when('/login', {
          templateUrl: '/partials/login',
          controller: 'LoginController',
          controllerAs: 'vm',
          bindToController: true
        }); //end $routeProvider.when('/login')
      } //end function($locationProvider, $routeProvider)
    ); //end config()
    //end angular.module('bewd.nba-vis')

})();  //end top level (function())