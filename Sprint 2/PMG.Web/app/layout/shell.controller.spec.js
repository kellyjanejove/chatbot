/* jshint -W117, -W030 */
describe('ShellController', function() {
    var controller, log, httpBackend, $rootScope, $timeout;

    beforeEach(module('app.layout'));

    beforeEach(inject(function (_$rootScope_, logger,
        _$timeout_, dataservice, $q, $controller, $httpBackend) {
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        log = logger;
        controller = $controller('ShellController',
            {'$rootScope': _$rootScope_, 'logger': logger, '$timeout': _$timeout_});
        $rootScope.$apply();
        httpBackend = $httpBackend;
    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('Shell controller', function() {
        it('should be created successfully', function () {
            expect(controller).toBeDefined();
        });

        //it('should show splash screen', function () {
        //    expect($rootScope.showSplash).toEqual(true);
        //});

        //it('should hide splash screen after timeout', function (done) {
        //    $timeout(function() {
        //        expect($rootScope.showSplash).toEqual(false);
        //        done();
        //    }, 1000);
        //    $timeout.flush();
        //});
    });
});
