(function() {
    'use strict';

    angular
        .module('app.core')
        .filter('alphaNumeric', AlphaNumeric);

    AlphaNumeric.$inject = [];

    function AlphaNumeric() {
        return function(input) {
            return input.replace(/[^A-Za-z0-9 ]|\s+$/g, '');
        };
    }
})();