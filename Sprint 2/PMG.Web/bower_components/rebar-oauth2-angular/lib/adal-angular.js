﻿//----------------------------------------------------------------------
// AdalJS v1.0.4
// @preserve Copyright (c) Microsoft Open Technologies, Inc.
// All Rights Reserved
// Apache License 2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
// http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//----------------------------------------------------------------------
'use strict';

if (typeof module !== 'undefined' && module.exports) {
    module.exports.inject = function (conf) {
        return new AuthenticationContext(conf);
    };
}

(function () {
    // ============= Angular modules- Start =============
    if (angular) {

        var AdalModule = angular.module('AdalAngular', []);

        AdalModule.provider('adalAuthenticationService', function () {
            var _adal = null;
            var _oauthData = { isAuthenticated: false, userName: '', loginError: '', profile: '' };

            var updateDataFromCache = function (resource) {
                // only cache lookup here to not interrupt with events
                var token = _adal.getCachedToken(resource);
                _oauthData.isAuthenticated = token !== null && token.length > 0;
                var user = _adal.getCachedUser() || { userName: '' };
                _oauthData.userName = user.userName;
                _oauthData.profile = user.profile;
                _oauthData.loginError = _adal.getLoginError();
            };

            this.init = function (configOptions, httpProvider) {
                if (configOptions) {
                    // redirect and logout_redirect are set to current location by default
                    var existingHash = window.location.hash;
                    var pathDefault = window.location.href;
                    if (existingHash) {
                        pathDefault = pathDefault.replace(existingHash, '');
                    }
                    configOptions.redirectUri = configOptions.redirectUri || pathDefault;
                    configOptions.postLogoutRedirectUri = configOptions.postLogoutRedirectUri || pathDefault;

                    if (httpProvider && httpProvider.interceptors) {
                        httpProvider.interceptors.push('ProtectedResourceInterceptor');
                    }

                    // create instance with given config
                    _adal = new AuthenticationContext(configOptions);
                } else {
                    throw new Error('You must set configOptions, when calling init');
                }

                // loginresource is used to set authenticated status
                updateDataFromCache(_adal.config.loginResource);
            };

            // special function that exposes methods in Angular controller
            // $rootScope, $window, $q, $location, $timeout are injected by Angular
            this.$get = ['$rootScope', '$window', '$q', '$location', '$timeout','$injector', function ($rootScope, $window, $q, $location, $timeout,$injector) {

                var locationChangeHandler = function () {
                    var hash = $window.location.hash;
                    
                    if (_adal.isCallback(hash)) {
                        // callback can come from login or iframe request

                        var requestInfo = _adal.getRequestInfo(hash);

                        _adal.saveTokenFromHash(requestInfo);
						if ($location.$$html5) {
							$window.location = $window.location.origin + $window.location.pathname;
						} else {
							$window.location.hash = '';
						}

						
                        if (requestInfo.requestType !== _adal.REQUEST_TYPE.LOGIN) {
                            _adal.callback = $window.parent.AuthenticationContext().callback;
                            if (requestInfo.requestType === _adal.REQUEST_TYPE.RENEW_TOKEN) {
                                _adal.callback = $window.parent.callBackMappedToRenewStates[requestInfo.stateResponse];
                            }
                        }
                        
                        // Return to callback if it is send from iframe
                        if (requestInfo.stateMatch) {
                            console.log(_adal._getItem(_adal.CONSTANTS.STORAGE.START_PAGE));
                            if (typeof _adal.callback === 'function') {
                                // Call within the same context without full page redirect keeps the callback
                                if (requestInfo.requestType === _adal.REQUEST_TYPE.RENEW_TOKEN) {
                                    // Idtoken or Accestoken can be renewed
                                    if (requestInfo.parameters['access_token']) {
                                        _adal.callback(_adal._getItem(_adal.CONSTANTS.STORAGE.ERROR_DESCRIPTION), requestInfo.parameters['access_token']);
                                        return;
                                    } else if (requestInfo.parameters['id_token']) {
                                        _adal.callback(_adal._getItem(_adal.CONSTANTS.STORAGE.ERROR_DESCRIPTION), requestInfo.parameters['id_token']);
                                        return;
                                    } else {
                                        _adal.callback("Error fetching tokens", null);
                                        return;									
									}
                                }  
                            }
                            else {
                                // normal full login redirect happened on the page
                                updateDataFromCache(_adal.config.loginResource);
                                if (_oauthData.userName) {
                                    //IDtoken is added as token for the app
                                    $timeout(function () {
                                        updateDataFromCache(_adal.config.loginResource);
                                        $rootScope.userInfo = _oauthData;
                                        // redirect to login requested page
										var oauthRedirectRoute = _adal._getItem(_adal.CONSTANTS.STORAGE.OAUTH_REDIRECT_URL);
										if (oauthRedirectRoute && oauthRedirectRoute != "null") {
											$window.sessionStorage.setItem(_adal.CONSTANTS.STORAGE.OAUTH_REDIRECT_URL, null);
											$location.path(oauthRedirectRoute);
										}
										else
										{
											var loginStartPage = _adal._getItem(_adal.CONSTANTS.STORAGE.START_PAGE);
											if (loginStartPage) {
												$location.path(loginStartPage);
											}
										}
                                    }, 1);
                                    $rootScope.$broadcast('adal:loginSuccess');
                                } else {
                                    $rootScope.$broadcast('adal:loginFailure', _adal._getItem(_adal.CONSTANTS.STORAGE.ERROR_DESCRIPTION));
                                }
                            }
                        }
						
                        var oauthRedirectRoute = $window.sessionStorage.getItem('adal.oauth.redirect.url');
                        if (oauthRedirectRoute && oauthRedirectRoute != "null") {
                            $window.sessionStorage.setItem('adal.oauth.redirect.url', null);
                            $window.location= oauthRedirectRoute;
                        }
						//$rootScope.$broadcast('adal:refreshoauth1Token');
						// var serviceIdentiferMap = _adal.config.oauth1ServicesAndIdentifierMap;
						// var oauth2Token =_adal.getCachedToken(_adal.config.loginResource);
						// authservice1.refreshOAuth1Tokens(serviceIdentiferMap,oauth2Token);
						
                    }
                    else {
                        // No callback. App resumes after closing or moving to new page.
                        // Check token and username             
                        updateDataFromCache(_adal.config.loginResource);
                        if (!_adal._renewActive && !_oauthData.isAuthenticated && _oauthData.userName) {
                            if (!_adal._getItem(_adal.CONSTANTS.STORAGE.FAILED_RENEW)) {
                                // Idtoken is expired or not present
                                _adal.acquireToken(_adal.config.loginResource, function (error, tokenOut) {
                                    if (error) {
                                        $rootScope.$broadcast('adal:loginFailure', 'auto renew failure');
                                    } else {
                                        if (tokenOut) {
                                            _oauthData.isAuthenticated = true;
                                        }
                                    }
                                });
                            }
                        }
                    }

                    $timeout(function () {
                        updateDataFromCache(_adal.config.loginResource);
                        $rootScope.userInfo = _oauthData;
                    }, 1);
                };

                var loginHandler = function () {
                    _adal._logstatus('Login event for:' + $location.$$path);
                    if (_adal.config && _adal.config.localLoginUrl) {
                        $location.path(_adal.config.localLoginUrl);
                    } else {
                        // directly start login flow
                        _adal._saveItem(_adal.CONSTANTS.STORAGE.START_PAGE, $location.$$path);
                        _adal._logstatus('Start login at:' + window.location.href);
                        $rootScope.$broadcast('adal:loginRedirect');
                        _adal.login();
                    }
                };

                function isADLoginRequired(route, global) {
                    return global.requireADLogin ? route.requireADLogin !== false : !!route.requireADLogin;
                }

                var routeChangeHandler = function (e, nextRoute) {
                    if (nextRoute && nextRoute.$$route && isADLoginRequired(nextRoute.$$route, _adal.config)) {
                        if (!_oauthData.isAuthenticated) {
                            _adal._logstatus('Route change event for:' + $location.$$path);
							_adal._saveItem(_adal.CONSTANTS.STORAGE.OAUTH_REDIRECT_URL, nextRoute.url);
                            loginHandler();
                        }
                    }
                };

                var stateChangeHandler = function (e, nextRoute) {
                    if (nextRoute && isADLoginRequired(nextRoute, _adal.config)) {
                        if (!_oauthData.isAuthenticated) {
                            _adal._logstatus('State change event for:' + $location.$$path);
							_adal._saveItem(_adal.CONSTANTS.STORAGE.OAUTH_REDIRECT_URL, nextRoute.url);
							_adal._saveItem(_adal.CONSTANTS.STORAGE.START_PAGE, $location.$$path);
                            loginHandler();
                        }
                    }
                };

                // Route change event tracking to receive fragment and also auto renew tokens
                $rootScope.$on('$routeChangeStart', routeChangeHandler);
                
                $rootScope.$on('$stateChangeStart', stateChangeHandler);

                $rootScope.$on('$locationChangeStart', locationChangeHandler);				

                updateDataFromCache(_adal.config.loginResource);
                $rootScope.userInfo = _oauthData;

                return {
                    // public methods will be here that are accessible from Controller
                    config: _adal.config,
                    login: function () {
                        _adal.login();
                    },
                    loginInProgress: function () {
                        return _adal.loginInProgress();
                    },
					IsOAuth1Url: function(requestUrl) {
						return _adal._IsOAuth1Request(requestUrl);
					},
					fetchOauth1Token: function (identifier, ouath2Token) {
						var deferred = $q.defer();

						var tokens = {};
							$injector.get('$http')({
								method: 'POST',
								headers: {
									"Content-Type": 'application/x-www-form-urlencoded'
								},
								transformRequest: function (obj) {
									var str = [];
									for (var p in obj)
										str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
									return str.join("&");
								},
								url: this.config.oauth1Endpoint,
								ignoreInterceptor: true,
								data: {
									'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
									'assertion': ouath2Token,
									'scope': identifier
								}
							}).success(function (data) {
								deferred.resolve({
									url: identifier,
									Token: data.access_token
								});                        
							}).error(function (e) {
								console.log('Failed to obtain user info: ');
								deferred.reject('Failed to obtain user info.');
							});
						return deferred.promise;
            },
					cacheOAuth1Token: function(identifier, token) {
						return _adal._cacheOAuth1Token(identifier, token);
					},		
					getOAuth1Token: function(identifier) {
						return _adal._getOAuth1Token(identifier);
					},							
                    logOut: function () {
                        _adal.logOut();
                        //call signout related method
                    },
                    getCachedToken: function (resource) {
                        return _adal.getCachedToken(resource);
                    },
                    getItem: function (key) {
                        return _adal._getItem(key);
                    },
                    saveItem: function (key,value) {
                        return _adal._saveItem(key,value);
                    },					
                    startPage: _adal.getStartPage(),
                    userInfo: _oauthData,
                    acquireToken: function (resource) {
                        // automated token request call
                        var deferred = $q.defer();
                        _adal.acquireToken(resource, function (error, tokenOut) {
                            if (error) {
                                _adal._logstatus('err :' + error);
                                deferred.reject(error);
                            } else {
                                deferred.resolve(tokenOut);
                            }
                        });

                        return deferred.promise;
                    },
                    getUser: function () {
                        var deferred = $q.defer();
                        _adal.getUser(function (error, user) {
                            if (error) {
                                _adal._logstatus('err :' + error);
                                deferred.reject(error);
                            } else {
                                deferred.resolve(user);
                            }
                        });

                        return deferred.promise;
                    },
                    getResourceForEndpoint: function (endpoint) {
                        return _adal.getResourceForEndpoint(endpoint);
                    },
                    clearCache: function () {
                        _adal.clearCache();
                    },
                    clearCacheForResource: function (resource) {
                        _adal.clearCacheForResource(resource);
                    }
                };
            }];
        });

        // Interceptor for http if needed
        AdalModule.factory('ProtectedResourceInterceptor', ['adalAuthenticationService', '$q', '$rootScope', function (authService, $q, $rootScope) {

            return {
                request: function (config) {
                    if (config) {
                        // This interceptor needs to load service, but dependeny definition causes circular reference error.
                        // Loading with injector is suggested at github. https://github.com/angular/angular.js/issues/2367
                        config.headers = config.headers || {};
                        var resource = authService.getResourceForEndpoint(config.url);
                        var tokenStored = authService.getCachedToken(resource);
                        var isEndpoint = false;
                        if (tokenStored) {
						
							var oauth1Identifier = authService.IsOAuth1Url(config.url);
							if(oauth1Identifier!= null)
							{
							//OAuth1 flow
							//starts
								//get oauth1 token from cache
							    var oauth1StoredToken = authService.getOAuth1Token(oauth1Identifier);
								if(oauth1StoredToken)
								{
									// check endpoint mapping if provided
									config.headers.Authorization = 'Bearer ' + oauth1StoredToken;
									return config;								
								}
								else
								{
										var deferred = $q.defer();
										authService.fetchOauth1Token(oauth1Identifier,tokenStored).then(function (data) {
										    authService.cacheOAuth1Token(oauth1Identifier, data.Token);
													config.headers.Authorization = 'Bearer ' + data.Token;
													deferred.resolve(config); 
											}, function (error) {
												deferred.reject('Failed to obtain user info.');
											});
									return deferred.promise;								
								}
							//OAuth1 flow
							//ends							  
							}
							else
							{
                            // check endpoint mapping if provided
                            config.headers.Authorization = 'Bearer ' + tokenStored;
                            return config;
							}
                        } else {
						
								// Cancel request if login is starting
								if (authService.loginInProgress()) {
									return $q.reject();
								}
						
								//Start token renewal only if the user is already authenticated
								if(!authService.userInfo.isAuthenticated)
									return config								
						
                                // delayed request to return after iframe completes
                                var delayedRequest = $q.defer();
                                authService.acquireToken(resource).then(function (token) {
								
								var oauth1Identifier = authService.IsOAuth1Url(config.url);
								if(oauth1Identifier!= null)
								{
								//OAuth1 flow
								//starts
											authService.fetchOauth1Token(oauth1Identifier,token).then(function (data) {
												authService.cacheOAuth1Token(oauth1Identifier, data.Token);
														config.headers.Authorization = 'Bearer ' + data.Token;
														delayedRequest.resolve(config); 
												}, function (error) {
													delayedRequest.reject('Failed to obtain oauth1 access token');
												});								
								//OAuth1 flow
								//ends							  
								}
								else
								{
									config.headers.Authorization = 'Bearer ' + token;
									delayedRequest.resolve(config);
								}
								
								}, function (err) {
									delayedRequest.reject(err);
								});
                                    
                                return delayedRequest.promise;						
                                /*
                            if (authService.config) {
                                for (var endpointUrl in authService.config.endpoints) {
                                    if (config.url.indexOf(endpointUrl) > -1) {
                                        isEndpoint = true;
                                    }
                                }
                            }
                                
                            // Cancel request if login is starting
                            if (authService.loginInProgress()) {
                                return $q.reject();
                            } else if (authService.config && isEndpoint) {
                                // external endpoints
                                // delayed request to return after iframe completes
                                var delayedRequest = $q.defer();
                                authService.acquireToken(resource).then(function (token) {
                                config.headers.Authorization = 'Bearer ' + token;
                                delayedRequest.resolve(config);
                            }, function (err) {
                                delayedRequest.reject(err);
                            });
                                    
                                return delayedRequest.promise;
                            }
							*/
                        }
                            
                        return config;
                    }
                },
                responseError: function (rejection) {
                    if (rejection && rejection.status === 401) {
                        var resource = authService.getResourceForEndpoint(rejection.config.url);
                        authService.clearCacheForResource(resource);
                        $rootScope.$broadcast('adal:notAuthorized', rejection, resource);
                    }

                    return $q.reject(rejection);
                }
            };
        }]);
    } else {
        console.error('Angular.JS is not included');
    }
}());
