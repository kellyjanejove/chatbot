OAuth2 Authentication Library for Angular JS 
====================================
[![Build Status]()]()

This is a customised version of [Microsoft ADAL Angular library] to support OAUTH2 Implicit flow with IdentitiyServer3. Additionally it also has the provision to support OAUTH1 audience based tokens 
which uses OAUTH2 token as bootstrap token to exchange it for OAUTH1 token. This library can be used with a Single Page Application built on Angular JS.
## The Library

You can install it via Bower or donwload js files directly from https://innersource.accenture.com/rebarrepo/rebar-oauth2-angular-library: 

    $ bower install rebar-oauth2-angular=https://innersource.accenture.com/rebarrepo/rebar-oauth2-angular-library.git --save

**Quick usage guide**

Below you can find a quick reference for the most common operations you need to perform to use adal js.

1- Include references to angular.js libraries, adal.js, adal-angular.js in your main app page.

2- include a reference to adal module
```js
var app = angular.module('demoApp', ['ngRoute', 'AdalAngular']);
```
3- ***When HTML5 mode is configured***, ensure the $locationProvider hashPrefix is set
```js
	// using '!' as the hashPrefix but can be a character of your choosing
	app.config(['$locationProvider', function($locationProvider) {
		$locationProvider.html5Mode(true).hashPrefix('!');
	}]);
```

Without the hashPrefix set, the OIDC login will loop indefinitely as the callback URL from IdentityServer (in the form of, {yourBaseUrl}/#{TokenAndState}) will be rewritten to remove the '#' causing the token parsing to fail and login sequence to occur again.

4- Initialize adal with the OAUTH2 identity server coordinates at app config time
```js
 
adalAuthenticationServiceProvider.init(
        {
            // Url of the IdentityServer3 OAUTH2 endpoint
            authorizationUrl: '<IndentityServer3 OAuth2 Auth. endpoint>', //Required
            clientId: "<clientId>", // Required
            response_type: "id_token token", //Required, configure to get both Id Token and access token
			redirect_uri: "<you site url registered in adfs>",//optional
			scope: "openid ",//Required, scopes to be included in the access token
            //Optional -- Only If you need to support OAUTH1 based services
            oauth1Endpoint: "http://localhost:44336/adfs",
            //Configure rootUrl of services which app will consume			
            oauth1ServicesAndIdentifierMap:
            {
                <Service-Identifier>: <Service Base Url>
            }
        },
        $httpProvider   // pass http provider to inject request interceptor to attach tokens
        );
```
5- Define which routes you want to secure via adal - by adding `requireADLogin: true` to their definition
```js
$routeProvider.
    when("/todoList", {
        controller: "todoListController",
        templateUrl: "/App/Views/todoList.html",
        requireADLogin: true
    });

```
6- Any service invocation code you might have will remain unchanged. Adal's interceptor will automatically add tokens for every outgoing call. 

7- If you so choose, in addition (or substitution) to route level protection you can add explicit login/logout UX elements. Furthermore, you can access properties of the currently signed in user directly form JavaScript (via userInfo and userInfo.profile):
```html
<!DOCTYPE html>
<html>
<head>
    <title>Angular Adal Sample</title>
</head>
<body ng-app="adalDemo" ng-controller="homeController" ng-init="hmCtl.init()">
    <a href="#">Home</a>
    <a href="#/todoList">ToDo List</a>
    <!--These links are added to manage login/logout-->
    <div data-ng-model="userInfo">
        <span data-ng-hide="!userInfo.isAuthenticated">Welcome {{userInfo.userName}} </span>
        <button data-ng-hide="!userInfo.isAuthenticated" data-ng-click="logout()">Logout</button>
        <button data-ng-hide="userInfo.isAuthenticated" data-ng-click="login()">Login</button>
        <div>
            {{userInfo.loginError}}
        </div>
        <div>
            {{testMessage}}
        </div>
    </div>
    <div ng-view>
        Your view will appear here.
    </div>
    <script src="/Scripts/angular.min.js"></script>
    <script src="/Scripts/angular-route.min.js"></script>
    <script src="/Scripts/adal.js"></script>
    <script src="/Scripts/adal-angular.js"></script>
    <script src="App/Scripts/app.js"></script>
    <script src="App/Scripts/homeController.js"></script>
    <script src="App/Scripts/todoDetailController.js"></script>
    <script src="App/Scripts/todoListController.js"></script>
    <script src="App/Scripts/todoService.js"></script>
</body>
</html>
```
7- You have full control on how to trigger sign in, sign out and how to deal with errors:

```js
'use strict';
app.controller('homeController', ['$scope', '$location', 'adalAuthenticationService', function ($scope, $location, adalAuthenticationService) {
    // this is referencing adal module to do login

    //userInfo is defined at the $rootscope with adalAngular module
    $scope.testMessage = "";
    $scope.init = function () {
        $scope.testMessage = "";
    };

    $scope.logout = function () {
        adalAuthenticationService.logOut();
    };

    $scope.login = function () {
        adalAuthenticationService.login();
    };

    // optional
    $scope.$on("adal:loginSuccess", function () {
        $scope.testMessage = "loginSuccess";
    });

    // optional
    $scope.$on("adal:loginFailure", function () {
        $scope.testMessage = "loginFailure";
        $location.path("/login");
    });

    // optional
    $scope.$on("adal:notAuthorized", function (event, rejection, forResource) {
        $scope.testMessage = "It is not Authorized for resource:" + forResource;
    });
  
}]);


```
### Cache Location
Default storage location is sessionStorage. You can specify localStorage in the config as well.

```js
adalAuthenticationServiceProvider.init(
        {
            // Config to specify endpoints and similar for your app
            clientId: 'cb68f72f...',
            cacheLocation: 'localStorage' // optional cache location default is sessionStorage
        },
        $httpProvider   // pass http provider to inject request interceptor to attach tokens
        );
```

### Security
Tokens are accessible from javascript since Adal.JS is using HTML5 storage. Default storage option is sessionStorage, which keeps the tokens per session. You should ask user to login again for important operations on your app.
You should protect your site for XSS. Please check the article here: https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet



### Trusted Site settings in IE
If you put your site in the trusted site list, cookies are not accessible for iFrame requests. You need to remove protected mode for Internet zone or add the authority url for the login to the trusted sites as well.

[Microsoft ADAL Angular library]: <https://github.com/AzureAD/azure-activedirectory-library-for-js>
