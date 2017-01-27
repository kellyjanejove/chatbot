(function () {
    'use strict';

    angular
        .module('app.report')
        .controller('ReportController', ReportController);

    ReportController.$inject = ['$q', 'dataservice', 'logger'];
    /* @ngInject */
    function ReportController($q, dataservice, logger) {
        var vm = this;
        vm.notification = {
            title: 'GlobalTransferFinance',
            description: 'Notification Card'
        };
        vm.message = 'TODO: Implement your features ';
        vm.messageCount = 0;
        vm.title = 'Report';

        activate();

        function activate() {
            var promises = [getPeopleData()];
            return $q.all(promises).then(function() {
                logger.info('Activated Report View');
            }, function () {
                logger.error('Failed to activate Report View');
            });
        }

        function getPeopleData() {
            return dataservice.getPeopleData().then(function (data) {
                vm.people = data;
                return vm.people;
            });
        }
    }
})();
