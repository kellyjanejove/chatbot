(function() {
  'use strict';

  angular
    .module('app.datamapping')
    .run(appRun);

  appRun.$inject = ['routerHelper'];
  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
       {
          state: 'index',
          config: {
              url: '/index.html',
              templateUrl: 'app/datamapping/datamapping.html',
              title: 'Data Mapping'
              //,requireADLogin: true
          }
      },
      {
        state: 'datamapping',
        config: {
          url: '/datamapping',
          templateUrl: 'app/datamapping/datamapping.html',
          controller: 'DataMappingController',
          controllerAs: 'dataMappingCtrl',
          title: 'Data Mapping',
          settings: {
            nav: 1,
            content: '<i class="fa fa-map-o"></i> Data Mapping'
          }
        }
      }
    ];
  }
})();
