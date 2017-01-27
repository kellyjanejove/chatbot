(function () {
    'use strict';

    angular
        .module('app.core', [
            'ngAnimate', 'ngSanitize',
            'blocks.exception', 'blocks.logger', 'blocks.router',
            //'ui.router', 'ngplus', 'ngDialog', 'toastr', 'AdalAngular'
            'ui.router', 'ngplus', 'toastr', 'AdalAngular'
        ]);
})();
