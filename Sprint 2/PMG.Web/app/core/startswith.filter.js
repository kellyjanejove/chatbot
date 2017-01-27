(function() {
    'use strict';

    angular
        .module('app.core')
        .filter('startsWith', StartsWithFilter);

    StartsWithFilter.$inject = [];

    function StartsWithFilter() {
        return function(source, text) {
            return checkIfStartsWith();

            function checkIfStartsWith() {
                var output = [];

                angular.forEach(source, function(item) {
                    if ((angular.isString(item)) && (item.toLowerCase().indexOf(text.toLowerCase()) === 0)) {
                        output.push(item);
                    }
                });

                return output;
            }
        };
    }
})();