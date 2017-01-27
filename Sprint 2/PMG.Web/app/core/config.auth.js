
(function () {
    'use strict';

    var core = angular.module('app.core');

    //core.config(configureHttpInterceptor);
    configureHttpInterceptor.$inject = ['$httpProvider'];
    function configureHttpInterceptor($httpProvider)
    {
        $httpProvider.interceptors.push('authservice');
    }

    //core.run(setJwtToken);
    setJwtToken.$inject = ['authservice', 'logger'];

    function setJwtToken(authservice, logger) {
        authservice.getAuthTokens().then(function () {
            logger.success('Successfully fetched tokens');
        }, function (error) {
            logger.error('Error in fetching tokens: ' + error);
        }
        );
    }
})();
