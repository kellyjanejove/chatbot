/* jshint -W117, -W030 */
describe('ReportController', function () {
    var controller, log, httpBackend;

    beforeEach(module('app.report'));

    beforeEach(inject(function ($rootScope, logger, $controller, $httpBackend) {
        $scope = $rootScope.$new();
        log = logger;
        controller = $controller('ReportController',
            { '$rootScope': $rootScope, 'logger': logger, '$scope': $scope });
        httpBackend = $httpBackend;
        $httpBackend.whenGET('/api/People')
            .respond({});
        $httpBackend.expectGET('/api/People');
        $rootScope.$apply();
        
    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
        
    });

    describe('Report controller', function () {
        it('should be created successfully', function () {
            expect(controller).toBeDefined;
            httpBackend.flush();
        });

        describe('after activate', function () {
            it('should have title of Report', function () {
                expect(controller.title).toEqual('Report');
                httpBackend.flush();
            });
        });
    });
});
