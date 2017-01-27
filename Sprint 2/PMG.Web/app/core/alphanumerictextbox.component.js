(function() {
    'use strict';

    angular
        .module('app.core')
        .component('alphanumerictextbox', {
            templateUrl: 'app/core/alphanumerictextbox.component.html',
            controller: AlphaNumericTextboxController,
            bindings: {
                model: '=',
                disabled: '=',
                readonly: '='
            }
        });

    AlphaNumericTextboxController.inject = ['$filter'];

    function AlphaNumericTextboxController($filter) {
        var vm = this;

        vm.replaceNonAlphaNumeric = replaceNonAlphaNumeric;

        function replaceNonAlphaNumeric() {
            // Check if value is null or empty string.
            if (!vm.model) {
                return;
            }

            vm.model = $filter('alphaNumeric')(vm.model);
        };
    }
})();