(function () {
    'use strict';

    angular
        .module('app.report')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'report',
                config: {
                    url: '/report',
                    templateUrl: 'app/report/report.html',
                    controller: 'ReportController',
                    controllerAs: 'vm',
                    title: 'report',
                    settings: {
                        nav: 2,
                        content: '<i class="acn-dashboard"></i> Report'
                    },
                    //This property is to protect your route with OpenID Connect Authentication
                    requireADLogin: false
                }
            }
        ];
    }
})();
