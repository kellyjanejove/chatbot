/* jshint -W117 */
(function () {
    'use strict';

    angular
        .module('app.layout')
        .controller('ShellController', ShellController);

    ShellController.$inject =
        ['$rootScope', '$state', '$timeout', 'config', 'logger', 'routerHelper'];
    /* @ngInject */
    function ShellController($rootScope, $state, $timeout, config, logger, routerHelper) {
        var vm = this;
        var states = routerHelper.getStates();

        /*--------------Variable Definitions--------------*/
        vm.busyMessage = 'Please wait ...';
        vm.isBusy = true;

        /*--------------Function Definitions--------------*/
        vm.isCurrent = isCurrent;
        vm.leftMenu = leftMenu;

        function leftMenu(e)
        {
            $rootScope.$broadcast('menuToggle', e);
        }
        
        function getNavRoutes() {
            vm.navRoutes = states.filter(function (r) {
                return r.settings && r.settings.nav;
            });
        }

        function isCurrent(route) {
            if (!route.title || !$state.current || !$state.current.title) {
                return '';
            }
            var menuName = route.title;
            return $state.current.title.substr(0, menuName.length) === menuName ? 'active' : '';
        }

        function footer() {
            //For footer
            setTimeout(function () {
                if ($(document).height() <= $(window).height()) {
                    $('footer').slideDown('slow');
                }
                else {
                    $('footer').slideUp('slow');
                }
            }, 500);

            $(window).scroll(function () {
                if ($(window).scrollTop() + $(window).height() >= $(document).height() - 0) {
                    $('footer').slideDown('slow');
                }
                else {
                    $('footer').slideUp('slow');
                }
            });
        }

        /*--------------Activate Controller--------------*/
        activate();

        function activate() {            
            getNavRoutes();
            footer();
            logger.success(config.appTitle + ' loaded!', null);
        }
    }
})();
