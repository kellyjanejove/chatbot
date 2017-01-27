/* jshint -W117, -W030 */
describe('core', function() {
    describe('state', function() {
        var views = {
            four0four: 'app/core/404.html'
        };

        var controller, $state, templateCache, $rootScope, $location;
        var view = 'app/admin/admin.html';

        beforeEach(module('app.core'));

        beforeEach(inject(function (_$rootScope_, _$location_, _$state_,
            $templateCache, $httpBackend) {
            $state = _$state_;
            httpBackend = $httpBackend;
            templateCache = $templateCache;
            $rootScope = _$rootScope_;
            $location = _$location_;
        }));

        beforeEach(function () {
            templateCache.put(views.core, '');
        });

        afterEach(function () {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

        it('should map /404 route to 404 View template', function() {
            expect($state.get('404').templateUrl).toEqual(views.four0four);
        });

        it('of dashboard should work with $state.go', function() {
            $state.go('404');
            $rootScope.$apply();
            expect($state.is('404'));
        });

        it('should route /invalid to the otherwise (404) route', function() {
            $location.path('/invalid');
            $rootScope.$apply();
            expect($state.current.templateUrl).toEqual(views.four0four);
        });
    });
});
