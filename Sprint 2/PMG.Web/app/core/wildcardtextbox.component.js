(function() {
    'use strict';

    angular
        .module('app.core')
        .component('wildcardtextbox', {
            templateUrl: 'app/core/wildcardtextbox.component.html',
            controller: WildcardTextboxController,
            bindings: {
                model: '=',
                disabled: '=',
                readonly: '='
            }
        });

    WildcardTextboxController.inject = ['$filter'];

    function WildcardTextboxController($filter) {
        var vm = this;

        vm.replaceNonWildcard = replaceNonWildcard;

        function replaceNonWildcard() {
            // Check if value is null or empty string.
            if (!vm.model) {
                return;
            }

            vm.model = $filter('wildcard')(vm.model);
        };
    }
})();