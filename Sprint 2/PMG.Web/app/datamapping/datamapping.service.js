(function() {
  'use strict';

  angular
    .module('app.datamapping')
    .service('DataMappingService', DataMappingService);

  DataMappingService.$inject = ['$http'];
  /* @ngInject */
  function DataMappingService($http) {
    var vm = this;
    var baseUrl = 'http://localhost:3000';
    var dmapJsonUrl = 'app/data/dmap.json';
    var resultColumnNameJsonUrl = 'app/data/resultcolumnname.json';
    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    vm.getDataMappingListFromJson = getDataMappingListFromJson;
    vm.getResultColmnNameListFromJson = getResultColmnNameListFromJson;

    vm.getDataMappingSearchResults = getDataMappingSearchResults;

    vm.getCountryNameList = getCountryNameList;
    vm.getCompanyCodeList = getCompanyCodeList;
    vm.getCompanyNameList = getCompanyNameList;
    vm.getAssigneePersonnelNumber = getAssigneePersonnelNumber;
    vm.getAssigneeNameList = getAssigneeNameList;
    vm.getAccountList = getAccountList;
    vm.getTransactionTypeList = getTransactionTypeList;
    vm.getTaxYearList = getTaxYearList;
    vm.getClientNameList = getClientNameList;
    vm.getSendingCompanyCodeList = getSendingCompanyCodeList;
    vm.getMappingStatusList = getMappingStatusList;
    vm.getAssignmentProfileIndicatorList = getAssignmentProfileIndicatorList;
    vm.getHostCountryTaxList = getHostCountryTaxList;
    vm.getHomeCompensatoryList = getHomeCompensatoryList;
    vm.getProjectNameList = getProjectNameList;
    vm.getProjectOrganizationList = getProjectOrganizationList;
    vm.getHostCountryList = getHostCountryList;
    vm.getDocumentTypeList = getDocumentTypeList;
    vm.getReferenceList = getReferenceList;
    vm.getEidOfParkedByList = getEidOfParkedByList;
    vm.getEidOfEnteredByList = getEidOfEnteredByList;
    vm.getFunctionalAreaList = getFunctionalAreaList;
    vm.getGeographicalUnitList = getGeographicalUnitList;
    vm.getClientFilteredResults = getClientFilteredResults;
    vm.getTransactionTypeFilteredResults = getTransactionTypeFilteredResults;

    vm.createDataMapping = createDataMapping;
    vm.updateDataMapping = updateDataMapping;

    /************************************** GET METHODS ***************************************/

    function getDataMappingListFromJson() {
        return $http.get(dmapJsonUrl);
    }

    function getResultColmnNameListFromJson() {
        return $http.get(resultColumnNameJsonUrl);
    }

    function getDataMappingSearchResults(skip, top, orderBy, orderByDirection, searchParam) {
        var url = baseUrl + '/searchDataMapping';

        return $http.get(url, {
            data: '',
            headers: headers,
            cache: false,
            params: {
                // skip: skip,
                // top: top,
                // orderBy: orderBy,
                // orderByDirection: orderByDirection,
                searchParam: searchParam
            }
        });
    }

    function getClientFilteredResults(value) {
        var url = baseUrl + '/clientData';

        return $http.get(url, {
            data: '',
            headers: headers,
            params: {
                personnelNumber: value
            }
        });
    }

    function getTransactionTypeFilteredResults(value) {
        var url = baseUrl + '/transactionTypeData';

        return $http.get(url, {
            data: '',
            headers: headers,
            params: {
                accountNumber: value
            }
        });
    }


    function getAssigneePersonnelNumber(value) {
        var url = baseUrl + '/assigneePersonnelNumbers';

        return $http.get(url, {
            data: '',
            headers: headers,
            params: {
                value: value
            }
        });
    }

    function getCompanyCodeList() {
        var url = baseUrl + '/companyCodes';

        return $http.get(url, {
           data: '',
           headers: headers
        });
    }

    function getCompanyNameList() {
        var url = baseUrl + '/companyNames';

        return $http.get(url, {
           data: '',
           headers: headers
        });
    }

    function getCountryNameList() {
        var url = baseUrl + '/countries';

        return $http.get(url, {
           data: '',
           headers: headers
        });
    }

    function getAssigneeNameList(value) {
        var url = baseUrl + '/assigneeNames';
        
        return $http.get(url, {
            data: '',
            headers: headers,
            params: {
                value: value
            }
        });
    }

    function getAccountList() {
        var url = baseUrl + '/accounts';

        return $http.get(url, {
           data: '',
           headers: headers
        });
    }

    function getTransactionTypeList() {
        var url = baseUrl + '/transactionTypes';

        return $http.get(url, {
           data: '',
           headers: headers
        });
    }

    function getTaxYearList() {
        var url = baseUrl + '/taxYears';

        return $http.get(url, {
           data: '',
           headers: headers
        });
    }

    function getClientNameList(value) {
        var url = baseUrl + '/clientNames';

        return $http.get(url, {
            data: '',
            headers: headers,
            params: {
                value: value
            }
        });
    }


    function getSendingCompanyCodeList() {
        var url = baseUrl + '/sendingCompanyCodes';

        return $http.get(url, {
           data: '',
           headers: headers
        });
    }

    function getMappingStatusList() {
        var url = baseUrl + '/mappingStatus';

        return $http.get(url, {
           data: '',
           headers: headers
        });
    }

    function getAssignmentProfileIndicatorList(value) {
        var url = baseUrl + '/assignmentProfileIndicators';

        return $http.get(url, {
            data: '',
            headers: headers,
            params: {
                value: value
            }
        });
    }

    function getHostCountryTaxList() {
        var url = baseUrl + '/hostCountryTaxes';

        return $http.get(url, {
           data: '',
           headers: headers
        });
    }

    function getHomeCompensatoryList() {
        var url = baseUrl + '/homeCompensatories';

        return $http.get(url, {
           data: '',
           headers: headers
        });
    }

    function getProjectNameList(value) {
        var url = baseUrl + '/projectNames';

        return $http.get(url, {
            data: '',
            headers: headers,
            params: {
                value: value
            }
        });
    }

    function getProjectOrganizationList(value) {
        var url = baseUrl + '/projectOrganizations';

        return $http.get(url, {
            data: '',
            headers: headers,
            params: {
                value: value
            }
        });
    }
       
    function getHostCountryList(value) {
        var url = baseUrl + '/hostCountries';

        return $http.get(url, {
            data: '',
            headers: headers,
            params: {
                value: value
            }
        });
    }

    function getDocumentTypeList() {
        var url = baseUrl + '/documentTypes';

        return $http.get(url, {
           data: '',
           headers: headers
        });
    }

    function getReferenceList(value) {
        var url = baseUrl + '/references';

        return $http.get(url, {
            data: '',
            headers: headers,
            params: {
                value: value
            }
        });
    }

    function getEidOfParkedByList(value) {
        var url = baseUrl + '/eidsOfParkedBy';

        return $http.get(url, {
            data: '',
            headers: headers,
            params: {
                value: value
            }
        });
    }

    function getEidOfEnteredByList(value) {
        var url = baseUrl + '/eidsOfEnteredBy';

        return $http.get(url, {
            data: '',
            headers: headers,
            params: {
                value: value
            }
        });
    }

    function getFunctionalAreaList() {
        var url = baseUrl + '/functionalAreas';

        return $http.get(url, {
           data: '',
           headers: headers
        });
    }

    function getGeographicalUnitList() {
        var url = baseUrl + '/geographicUnits';

        return $http.get(url, {
           data: '',
           headers: headers
        });
    }

    /************************************** POST METHODS ***************************************/

    function createDataMapping(data) {
        var url = baseUrl + '';

        return $http.post(url,
            data, {
            headers: headers
        });
    }

    /************************************** PUT METHODS ***************************************/

    function updateDataMapping(data) {
        var url = baseUrl + '/journalTransactionDetails';

        return $http.put(url,
            data, {
            headers: headers,
            params: {
                updateParam: data
            }
        });
    }
  }
})();
