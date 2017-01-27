
(function () {
    'use strict';

    var core = angular.module('app.core');

    core.factory('authservice', authservice);
    authservice.$inject = ['logger', 'config', '$rootScope', '$injector', '$q'];

    function authservice(logger, config, $rootScope, $injector, $q) {
        var service = {
            getAuthTokens: getAuthTokens,
            request: request,
            responseError: responseError
        };

        return service;

        function getAuthTokens () {
                var deferred = $q.defer();

                var tokens = {};
                var serviceIdentiferMap = config.authSettings.serviceNameAndBaseUrlMap;

                $injector.get('$http')({
                    method: 'POST',
                    url: config.authSettings.authUrl,
                    ignoreInterceptor:true,
                    data:
                        {
                            ForceTokenRefresh: false,
                            RelyingParties: Object.keys(serviceIdentiferMap)
                        }
                }).success(function (data) {
                    if (data.IsUserAuthenticated)
                    {
                        logger.log('refreshed jwt tokens: ' + data);
                        var serviceTokenMap = {};
                        angular.forEach(data.JwtToken, function (value, key) {
                            var serviceName = data.JwtToken[key].RelyingParty;

                            //Get root url for service name from the configured- serviceNameAndBaseUrlMap
                            var serviceRootUrl = serviceIdentiferMap[serviceName];

                            //Create a Service Token map which will store mapping of service-url:jwtToken...
                            //This map would be used by Interceptor to inject token for the corresponding service url
                            serviceTokenMap[serviceRootUrl] = data.JwtToken[key].Token;
                        });

                        $rootScope.serviceTokensMap = serviceTokenMap;
                        //log(serviceTokenMap);
                        deferred.resolve();
                    }
                    else
                    {
                        //Our session has expired, so alert the user and reload the page
                        //so that he is taken to login page
                        $injector.get('ngDialog').open({
                            template: 'Your session has expired. Please login again',
                            plain: true,
                            preCloseCallback: function () {
                                //reload to redirect user to login page
                                location.reload();
                            }
                        });
                    }

                }).error(function (e) {
                    logger.log('Failed to obtain user info: ');
                    deferred.reject('Failed to obtain user info.');
                });
                return deferred.promise;
            }

        //Request Interceptor to add auth bearer token to request header
        function request(config) {
            logger.log('In Request interceptor');
            for (var serviceRootUrl in $rootScope.serviceTokensMap) {
                if (config.url.toLowerCase().match(serviceRootUrl.toLowerCase())) {
                    config.headers.Authorization = 'Bearer ' +
                        $rootScope.serviceTokensMap[serviceRootUrl];
                    break;
                }
            }
            return config;
        }

        //Response Interceptor to manage token refreshal
        function responseError(response) {

            //Handles 401 response by renewing the token and retrying the service call again
            //ignoreInterceptor proeprty is set to bypass the response interceptor in scenario
            //when the service retry call is made
            //from within the interceptor

            var deferred = $q.defer(); // defer until we can re-request a new token

            if (!(response.config.hasOwnProperty('ignoreInterceptor') &&
                response.config.ignoreInterceptor)) {
                switch (response.status) {
                    case 401:
                        //Refresh jwt tokens
                        service.getAuthTokens().then(
                        function () {
                            response.config.ignoreInterceptor = true;
                            logger.log('Retrying service request with new Tokens');
                            $injector.get('$http')(response.config).then(function (response) {
                                logger.log('Retry was success');
                                // we have a successful response - resolve it using deferred
                                deferred.resolve(response);
                            },
                            function (error) {
                                logger.log('error on retrying service request: ' + error);
                                deferred.reject(error);
                                // something went wrong
                            });

                        }, function (response, status) {
                            //log('error on fetching jwt token.');
                            logger.log('failed to refresh jwt');
                            // not a recoverable error
                            deferred.reject('failed to refresh jwt, error: ' + response);

                        });
                        break;
                    case 403:
                        // not a recoverable error
                        deferred.reject('Access to service is forbidden: ' + response);
                        break;
                    default:
                        deferred.reject(response);// not a recoverable error

                }
            }
            else {
                logger.log('Ignored response interceptor');
                deferred.reject(response);
            }
            return deferred.promise;//// return the deferred promise
        }
    }
})();
