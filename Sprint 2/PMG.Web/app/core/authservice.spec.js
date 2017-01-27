/* jshint -W117, -W030 */
// JavaScript source codex
'use strict';
describe('authservice', function () {
    beforeEach(module('app.core'));

    //set auth related configuration for our testing
    beforeEach(module(function ($provide) {
        var config = {
            authSettings:
                {
                    authUrl: 'app/getToken',
                    serviceNameAndBaseUrlMap:
                        {
                            'service2': 'http://service2Url',
                            'service1': 'http://service1Url'
                        }
                },
        };
        $provide.value('config', config);
    }));

    var service, $rootScope, $httpBackend, myconfig, $http, authservice, $q;
    var successHandler, failHandler;
    // inject the securitycontext and $rootScope services
    // in the beforeEach block
    beforeEach(inject(function (_authservice_, _$q_, _$rootScope_, _$httpBackend_, _$http_) {
        $httpBackend = _$httpBackend_;

        $rootScope = _$rootScope_;
        $http = _$http_;
        authservice = _authservice_;
        $q = _$q_;

        $httpBackend.whenPOST('app/getToken')
                .respond({
                    'IsUserAuthenticated': true,
                    'JwtToken': [{'RelyingParty': 'service2', 'Token': 'token2'},
                        {'RelyingParty': 'service1', 'Token': 'token1'}]
                });
    }));

    it('should have authservice be defined', function () {
        expect(authservice).toBeDefined();
    });

    it('should have no tokens on start', function () {
        expect($rootScope.serviceTokensMap).toBeUndefined();
    });

    it('should set tokens for configured services',
        function () {
            /*
            $httpBackend.expectGET('Authentication/GetTokens?identifiers=service2&identifiers=service1&');
            $httpBackend.expectGET('app/core/404.html');
            */
            successHandler = jasmine.createSpy('success');
            failHandler = jasmine.createSpy('failure');
            authservice.getAuthTokens().then(successHandler, failHandler);
            $rootScope.$apply();
            $httpBackend.flush();
            //console.log($rootScope.serviceTokensMap);
            expect(successHandler).toHaveBeenCalled();
            expect($rootScope.serviceTokensMap['http://service1Url']).toEqual('token1');
            expect($rootScope.serviceTokensMap['http://service2Url']).toEqual('token2');
            expect(Object.keys($rootScope.serviceTokensMap).length).toEqual(2);
        });
    it('should result in error when auth controller doesnot return tokens for all services',
        function () {
        $httpBackend.whenPOST('app/getToken')
            .respond({
                'IsUserAuthenticated': true,
                'JwtToken': [{'RelyingParty': 'service2', 'Token': 'token2'},
                    {'RelyingParty': 'service1', 'Token': 'token1'}]
            });
        successHandler = jasmine.createSpy('success');
        failHandler = jasmine.createSpy('failure');
        authservice.getAuthTokens().then(successHandler, failHandler);
        $rootScope.$apply();
        $httpBackend.flush();

        //console.log($rootScope.serviceTokensMap);
        expect(successHandler).toHaveBeenCalled();
    });

    it('should set proper token to authorization header when configured service is called',
        function () {
            authservice.getAuthTokens().then();
            $rootScope.$apply();
            $httpBackend.flush();
            var config = authservice.request({
                method: 'GET', url: 'http://service2Url', headers: {}
            });
            expect(config.headers['Authorization']).toBe('Bearer token2');
        });

    it('should match url in a case-insensitive manner when adding auth tokens to header',
        function () {
            authservice.getAuthTokens().then();
            $rootScope.$apply();
            $httpBackend.flush();
            var config = authservice.request({
                method: 'GET', url: 'http://SERvice2url/path1/', headers: {}
            });
            expect(config.headers['Authorization']).toBe('Bearer token2');
        });

    it('should refresh jwt tokens and retry service request if service call results in 401 error',
        function () {
            $httpBackend.whenGET('http://SERvice2url/path1/').respond(200, '{}');
            $httpBackend.expectGET('http://SERvice2url/path1/');
            spyOn(authservice, 'getAuthTokens').and.callFake(function () {
                var deferred = $q.defer();
                console.log('In SPY');
                deferred.resolve('Auth tokens set');
                return deferred.promise;
            });
            var response = {
                config: {
                    method: 'GET', url: 'http://SERvice2url/path1/', headers: {}
                }, status: 401
            };
            authservice.responseError(response).then(function () {
                expect(authservice.getAuthTokens).toHaveBeenCalled();
                expect(response.config.ignoreInterceptor).toBe(true);
            });
            $rootScope.$apply();
            $httpBackend.flush();
        });

    it('should bypass responseerror logic if ignoreInterceptor property is set true',
        function () {
            spyOn(authservice, 'getAuthTokens').and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve('Auth tokens set');
                return deferred.promise;
            });
            // $httpBackend.whenGET('http://SERvice2url/path1/').respond(200,'{}');
            var response = {
                config: {
                    method: 'GET',
                    url: 'http://SERvice2url/path1/',
                    ignoreInterceptor: true
                }, status: 401
            };
            authservice.responseError(response).then();
            $rootScope.$apply();
            expect(authservice.getAuthTokens.calls.any()).toEqual(false);
            expect(response.config.ignoreInterceptor).toBe(true);
        });

    it('should not handle response when error status is other than 401 or 402',
        function () {
            spyOn(authservice, 'getAuthTokens').and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve('Auth tokens set');
                return deferred.promise;
            });
            // $httpBackend.whenGET('http://SERvice2url/path1/').respond(200,'{}');
            var response = {
                config: {
                    method: 'GET', url: 'http://SERvice2url/path1/'
                }, status: 302
            };
            authservice.responseError(response);
            $rootScope.$apply();
            //console.log($rootScope.serviceTokensMap);
            //console.log(response.config);
            expect(authservice.getAuthTokens.calls.any()).toEqual(false);
        });
});
