/* jshint -W117, -W030 */
describe('dashboard routes', function () {
    describe('state', function () {
        var controller, $state, templateCachem, $rootScope;
        var view = 'app/report/report.html';

        beforeEach(module('app.report'));

        beforeEach(inject(function (_$rootScope_, _$state_,
            $templateCache, $httpBackend) {
            $state = _$state_;
            httpBackend = $httpBackend;
            templateCache = $templateCache;
            $rootScope = _$rootScope_;
        }));

        beforeEach(function () {
            templateCache.put(view, '');
        });

        afterEach(function () {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

        it('should map state dashboard to url /report ', function () {
            expect($state.href('report', {})).toEqual('/report');
        });

        it('should map /report route to dashboard View template', function () {
            expect($state.get('report').templateUrl).toEqual(view);
        });

        it('of report should work with $state.go', function () {
            $state.go('report');
            $rootScope.$apply();
            expect($state.is('report'));
        });
    });
});
