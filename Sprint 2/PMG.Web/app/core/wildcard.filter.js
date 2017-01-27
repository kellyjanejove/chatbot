(function() {
    'use strict';

    angular
        .module('app.core')
        .filter('wildcard', Wildcard);

    Wildcard.$inject = [];

    function Wildcard() {
        return function(input) {
            return input.replace(/[^A-Za-z0-9%_'",. ]|\s+$/g, '');
        };
    }
})();