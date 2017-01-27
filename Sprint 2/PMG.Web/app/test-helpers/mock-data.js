/* jshint -W079 */
var mockData = (function() {
    return {
        getMockData: getMockData,
        getMockStates: getMockStates
    };

    function getMockStates() {
        return [
            {
                state: 'dashboard',
                config: {
                    url: '/',
                    templateUrl: 'app/dashboard/dashboard.html',
                    title: 'dashboard',
                    settings: {
                        nav: 1,
                        content: '<i class="fa fa-dashboard"></i> Dashboard'
                    }
                }
            }
        ];
    }

    function getMockData() {
        return [
                {Field1: 'Foo', Field2: 'Bar'},
                {Field1: 'Foo', Field2: 'Bar'},
                {Field1: 'Foo', Field2: 'Bar'}
        ];
    }
})();
