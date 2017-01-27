(function () {
    'use strict';

    angular
        .module('app.datamapping')
        .controller('DataMappingController', DataMappingController);

    DataMappingController.$inject = ['DataMappingService', 'DataMappingFactory', 'Constants', 'logger',
        '$filter', '$scope'];
    /* @ngInject */
    function DataMappingController(DataMappingService, DataMappingFactory, Constants, logger, $filter, $scope) {
        var vm = this;
        var originalList = [];
        var errorMessage = Constants.ERROR_MSG_REQUIRED;

        vm.title = 'Data Mapping';
        vm.dataMappingList = [];
        vm.resultColumnNameList = [];
        vm.searchResultList = [];

        vm.confirmChanges = confirmChanges;

        vm.isStartDateOpened = false;
        vm.isEndDateOpened = false;
        vm.dateOptions = {
            formatYear: Constants.DATE_YEAR_FORMAT,
            startingDay: 1
        };
        vm.format = Constants.DATE_FORMAT;
        vm.dynamicPopover = {
            textTemplateUrl: 'popoverText.html',
            selectLookUpTemplateUrl: 'popoverSelect.lookup.html',
            selectListTemplateUrl: 'popoverSelect.list.html'
        };
        vm.isFormSubmitted = false;
        vm.activeTabIndex = 0;

        vm.clearRow = clearRow;
        vm.clearAll = clearAll;
        vm.showSelectAllColumnsModal = showSelectAllColumnsModal;
        vm.showResultsDetailModal = showResultsDetailModal;
        vm.openDatePicker = openDatePicker;
        vm.addDate = addDate;
        vm.validateFieldValue = validateFieldValue;
        vm.openPopover = openPopover;
        vm.closePopovers = closePopovers;
        vm.populateValueList = populateValueList;
        vm.setOperatorValue = setOperatorValue;
        // vm.addSearchName = addSearchName;

        vm.setValues = setValues;
        vm.search = search;
        vm.save = save;

        vm.getResultsCount = getResultsCount;
        vm.changeValueCountType = changeValueCountType;

        activate();

        function activate() {
            getDataMappingListFromJson();
            getResultColmnNameListFromJson();
        }

        function getDataMappingListFromJson() {
            DataMappingService.getDataMappingListFromJson()
                .then(function (response) {
                    vm.dataMappingList = DataMappingFactory.getDefaultDataMappingList(response.data.DataMapping.Field);
                });
        }

        function getResultColmnNameListFromJson() {
            DataMappingService.getResultColmnNameListFromJson()
                .then(function (response) {
                    vm.resultColumnNameList = response.data.Name;
                });
        }

        function clearRow(dataMapping) {
            dataMapping.Operator = '';
            dataMapping.Values = [];
            dataMapping.startDate = null;
            dataMapping.endDate = null;
            dataMapping.selectedValues = [];
            dataMapping.dateList = [];

            vm.closePopovers();
        }

        function clearAll() {
            angular.forEach(vm.dataMappingList, function (dataMapping) {
                vm.clearRow(dataMapping);
            });
        }

        function showSelectAllColumnsModal() {
            var unlistenEvent = $scope.$on(Constants.CLOSE_MODAL, function (event, data) {
                unlistenEvent();
            });

            $scope.$broadcast(Constants.OPEN_MODAL, {
                body: vm.dataMappingList
            });
        }

        function showResultsDetailModal(result) {
            var unlistenEvent = $scope.$on(Constants.CLOSE_SEARCH_DETAIL_MODAL, function (event, data) {
                unlistenEvent();
            });

            $scope.$broadcast(Constants.OPEN_SEARCH_DETAIL_MODAL, {
                detail: result
            });
        }

         function openDatePicker($event, item, index) {
            if ($event !== null) {
                $event.preventDefault();
                $event.stopPropagation();
            }

            closeOtherDatePickers();
            item.isDatePickerOpen = (index === item.index);
        }

        function closeOtherDatePickers() {
            var dateColumnList = $filter('filter')(vm.dataMappingList, { isSelected: true, Type: 'Date' });

            angular.forEach(dateColumnList, function(item) {
                angular.forEach(item.dateList, function(dateItem) {
                    dateItem.isDatePickerOpen = false;
                });
            });
        }

        function setDateValues() {
            var dateColumnsList = $filter('filter')(vm.dataMappingList, { Type: 'Date' }, true);
            angular.forEach(dateColumnsList, function (item) {
                item.Values.push(item.startDate);

                if (item.Operator.contains('BETWEEN')) {
                    item.Values.push(item.endDate);
                }
            });
        }

        function search() {
            var isValid = validateSearchCriteria();
            vm.isFormSubmitted = true;

            vm.closePopovers();

            if (isValid) {
                var hasSearchCriteria = checkIfHasSearchCriteria();
                if (!hasSearchCriteria) {
                    var unlistenEvent = $scope.$on(Constants.CLOSE_DIALOGBOX_MODAL, function (event, data) {
                        unlistenEvent();
                        getSearchResults();
                    });

                    $scope.$broadcast(Constants.OPEN_DIALOGBOX_MODAL, {
                        title: '',
                        body: Constants.MSG_NO_SEARCH_CRITERIA
                    });
                } else {
                    getSearchResults();
                }
            } else {
                logger.error(errorMessage);
            }
        }

        function getSearchResults() {
            // Clear search results first to update display if user changes tab to My Results.
            vm.searchResultList = [];
            var searchParam = DataMappingFactory.convertBackDataMappingSearchCriteria(vm.dataMappingList);
            DataMappingService.getDataMappingSearchResults(0, 0, '', Constants.ORDER_ASC, searchParam)
                .then(function (response) {
                    vm.searchResultList = DataMappingFactory.convertDataMappingResultList(response.data);
                    vm.activeTabIndex = 1;
                    vm.isFormSubmitted = false;
                    storeUpdatedResults();
                });
        }
          function confirmChanges() {
            if (updateSearchResults().length > 0) {
                var confirmation = confirm("Do you want to save changes?");
                if (confirmation === true) {
                    save();
                } else {
                   revertResults();
                }

                vm.activeTabIndex = 0;
            } else {
                 vm.activeTabIndex = 0;
            }
        }

        // function confirmChanges() {
        //     if ((vm.searchResultList.length > 0) && (updateSearchResults().length > 0)) {
        //         var confirmation = confirm("Do you want to save changes?");
        //         if (confirmation === true) {
        //             save();
        //         } else {
        //            revertResults();
        //         }

        //         vm.activeTabIndex = 0;
        //     } else {
        //          vm.activeTabIndex = 0;
        //     }
        // }

        function save() {
            if ((vm.searchResultList.length > 0) && (updateSearchResults().length > 0)) {
                var param1 = updateSearchResults();
                DataMappingService.updateDataMapping(param1)
                .then(function(response) {
                    storeUpdatedResults();
                    alert('Saving Complete'); 
                });  
            }
          }

        function storeUpdatedResults() {
            originalList = [];
            angular.forEach(vm.searchResultList, function(item) {
                var master = {};
                angular.copy(item, master);
                originalList.push(master);
            });
        }

        function revertResults() {
            angular.forEach(vm.searchResultList, function(item, i) {
                if ((item.Name !== originalList[i].Name) ||
                (item.TaxYear !== originalList[i].TaxYear) ||
                (item.TransactionType !== originalList[i].TransactionType) ||
                (item.ClientName !== originalList[i].ClientName)||
                (item.Comments !== originalList[i].Comments)) {
                    item.PersNumber = originalList[i].PersNumber;
                    item.Name = originalList[i].Name;
                    item.TaxYear = originalList[i].TaxYear;
                    item.TransactionType = originalList[i].TransactionType;
                    item.ClientName = originalList[i].ClientName;
                    item.StartDate = originalList[i].StartDate;
                    item.EndDate = originalList[i].EndDate;
                    item.HostCountryName = originalList[i].HostCountryName;
                    item.AssignmentProfileId = originalList[i].AssignmentProfileId;                
                    item.Comments = originalList[i].Comments;
                    item.MappingStatusInd = originalList[i].MappingStatusInd;
                }
            });
        }

        function updateSearchResults() {
            var updateParam = [];
            angular.forEach(originalList, function (originalItem, i) {
                angular.forEach(vm.searchResultList, function (searchItem, j) {
                    if ((i === j) && 
                    ((originalItem.PersNumber!== searchItem.PersNumber) ||
                    (originalItem.TaxYear !== searchItem.TaxYear) ||
                    (originalItem.TransactionType !== searchItem.TransactionType) ||
                    (originalItem.ClientName !== searchItem.ClientName) ||
                    (originalItem.Comments !== searchItem.Comments))) {
                        var updateItem = {};
                        if (searchItem.Ind === true) {
                            updateItem.MappingStatusInd = 1;
                        } else {
                            updateItem.MappingStatusInd = 0;
                        }
                        updateItem.UpdateUserId = searchItem.UpdatedBy;
                        updateItem.AssigneePersonnelNbr = searchItem.PersNumber;
                        updateItem.TaxYearNbr = searchItem.TaxYear;
                        updateItem.JournalTransactionTypeDesc = searchItem.TransactionType;
                        updateItem.ClientNm = searchItem.ClientName;
                        updateItem.AssignmentProfileIndicator = searchItem.AssignmentProfileId;
                        updateItem.CommentsTxt = searchItem.Comments;
                        updateItem.JournalTransactionDetailID = searchItem.JournalTransactionDetailId;
                        updateParam.push(updateItem);
                    }
                });
            });
            return updateParam;
        }

        function validateSearchCriteria() {
            errorMessage = Constants.ERROR_MSG_REQUIRED;
            var isValid = true;
            var displayedFields = $filter('filter')(vm.dataMappingList, { isSelected: true }, true);

            angular.forEach(displayedFields, function (dataMapping) {
                if (isValid) {
                    isValid = vm.validateFieldValue(dataMapping);
                } else {
                    vm.validateFieldValue(dataMapping);
                }
            });

            return isValid;
        }

        function validateFieldValue(dataMapping) {
            var isValid = true;

            switch (dataMapping.Operator) {
                case '':
                case 'IS NULL':
                case 'IS NOT NULL':
                    break;
                case 'BETWEEN':
                case 'NOT BETWEEN':
                    if (dataMapping.Type === 'Date') {
                        if (dataMapping.dateList.length !== 2 ||
                            dataMapping.dateList[0].value === null ||
                            dataMapping.dateList[1].value === null) {
                            
                            isValid = false;
                            errorMessage = Constants.ERROR_MSG_TWO_DATES;
                        }
                    } else if (angular.isArray(dataMapping.Values) && dataMapping.Values.length === 0) {
                        isValid = false;
                    } else if (angular.isString(dataMapping.Values)) {
                        var values = dataMapping.Values.split(';');
                        if (values.length !== 2 || values[0] === '' || values[1] === '') {
                            isValid = false;
                        }
                    }
                    break;
                default:
                    if (dataMapping.Type === 'Date') {
                        // Set first isValid to false and check if there is at least 1 valid value.
                        isValid = false;
                        angular.forEach(dataMapping.dateList, function(item) {
                            if (item.value !== null) {
                                isValid = true;
                            }
                        });
                    } else if (angular.isDefined(dataMapping.Values) && dataMapping.Values.length === 0) {
                        isValid = false;
                    }
                    break;
            }

            return isValid;
        }

        function checkIfHasSearchCriteria() {
            var hasCriteria = false;
            var displayedFields = $filter('filter')(vm.dataMappingList, { isSelected: true }, true);

            angular.forEach(displayedFields, function (item) {
                if (item.Operator !== '') {
                    hasCriteria = true;
                    return false;
                }
            });

            return hasCriteria;
        }

        function getResultsCount(dataMapping) {
            return $filter('startsWith')(dataMapping.ValueList, dataMapping.searchName).length;
        }

        // Sets the value on the Field Values in accordance to their field type.
        function setValues($event, dataMapping) {
            switch (dataMapping.Type) {
                case 'Text':
                    if ($event.keyCode === 13) {
                        switch (dataMapping.Operator) {
                            case 'IS NULL':
                            case 'IS NOT NULL':
                                dataMapping.Values = '';
                                dataMapping.searchName = '';
                                setOperatorValue(dataMapping);
                                break;
                            default:
                                if (dataMapping.Values.length === 0 && dataMapping.Operator === '') {
                                    dataMapping.Values = dataMapping.searchName;
                                    dataMapping.Operator = '=';
                                    setOperatorValue(dataMapping);
                                }

                                if (dataMapping.Operator === 'BETWEEN' || dataMapping.Operator === 'NOT BETWEEN') {
                                    if (dataMapping.Values.length === 0) {
                                        dataMapping.Values = dataMapping.searchName;
                                    }
                                    else if (dataMapping.Values.indexOf(";") > 0 && dataMapping.Values.indexOf(dataMapping.searchName) === -1) {
                                        dataMapping.Values = dataMapping.Values.substring(0, dataMapping.Values.indexOf(";")) + "; " + dataMapping.searchName;
                                    }
                                    else {
                                        dataMapping.Values = dataMapping.Values + "; " + dataMapping.searchName;
                                    }
                                }

                                else if (dataMapping.Values.indexOf(dataMapping.searchName) === -1) {
                                    var existingItem = $filter('filter')(dataMapping.Values, dataMapping.searchName, true)[0];
                                    if (angular.isUndefined(existingItem)) {
                                        if (dataMapping.Operator === '=') {
                                            dataMapping.Values = dataMapping.searchName;
                                        }
                                    }
                                }
                                setOperatorValue(dataMapping);
                                dataMapping.searchName = '';
                                break;
                        }
                    }
                    break;
                case 'List':
                    dataMapping.previousValues = dataMapping.selectedValues;
                    switch (dataMapping.Operator) {
                        case '':
                            dataMapping.Values = dataMapping.selectedValues;
                            dataMapping.Operator = '=';
                            break;
                        case '=':
                        case '>':
                        case '<':
                        case '>=':
                        case '<=':
                        case '<>':
                            dataMapping.Values = dataMapping.selectedValues;
                            setOperatorValue(dataMapping);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            // if (dataMapping.Values !== '' && dataMapping.searchName !== '') {
                            //      if (dataMapping.Values.lastindexOf(';') > -1 ) {
                            //         dataMapping.Values = dataMapping.Values + dataMapping.selectedValues;
                            //      } else if (dataMapping.Values.indexOf(';') === -1 ) {
                            //          dataMapping.Values = dataMapping.Values + '; ' + dataMapping.selectedValues;
                            // //      }
                            // // } else {
                            // //     dataMapping.Values = dataMapping.selectedValues.join('; ');
                            // // }


                            // if (dataMapping.Values !== '' || dataMapping.searchName !== '') { 
                            //     if ((dataMapping.Values.charAt(dataMapping.Values.length - 1) !== ';' )) {
                            //        dataMapping.Values = dataMapping.Values + '; ' + dataMapping.selectedValues;    
                            //     } 
                            //     else {dataMapping.Values = dataMapping.Values  + dataMapping.selectedValues;
                            //     }
                            // } else { 
                            //     dataMapping.Values = dataMapping.selectedValues.join('; ');
                            // }
                            if (dataMapping.Values !== '' & dataMapping.searchName !== '') {
                                dataMapping.Values = dataMapping.Values + dataMapping.selectedValues;
                            } else {
                                dataMapping.Values = dataMapping.selectedValues.join('; ');
                            }
                            setOperatorValue(dataMapping);
                            dataMapping.searchName = '';
                            break;
                        case 'BETWEEN':
                        case 'NOT BETWEEN':
                            dataMapping.Values = dataMapping.selectedValues.join('; ');
                            setOperatorValue(dataMapping);
                            break;
                        case 'LIKE':
                        case 'NOT LIKE':
                            if ($event.keyCode === 13) {
                                dataMapping.Values = dataMapping.selectedValues;
                                setOperatorValue(dataMapping);
                                dataMapping.searchName = '';
                                break;
                            }
                        default:
                            break;
                    }
                    break;
                case 'LookUp':
                    dataMapping.previousValues = dataMapping.selectedValues;
                    switch (dataMapping.Operator) {
                        case '':
                            dataMapping.Values = dataMapping.selectedValues;
                            dataMapping.Operator = '=';
                            break;
                        case '=':
                        case '>':
                        case '<':
                        case '>=':
                        case '<=':
                        case '<>':
                            dataMapping.Values = dataMapping.selectedValues;
                            setOperatorValue(dataMapping);
                            break;
                        case 'IN':
                        case 'NOT IN':
                            dataMapping.Values = dataMapping.selectedValues.join('; ');
                            setOperatorValue(dataMapping);
                            break;
                        case 'BETWEEN':
                        case 'NOT BETWEEN':
                            dataMapping.Values = dataMapping.selectedValues.join('; ');
                            setOperatorValue(dataMapping);
                            break;
                        case 'LIKE':
                        case 'NOT LIKE':
                            if ($event.keyCode === 13) {
                                dataMapping.Values = dataMapping.selectedValues;
                                setOperatorValue(dataMapping);
                                dataMapping.searchName = '';
                                break;
                            }
                        default:
                            break;
                    }
                    break;
                case 'Date':
                    switch (dataMapping.Operator) {
                        case '':
                            dataMapping.Operator = '=';
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }

        // Sets the value on the Field Values in accordance to their operator.
        function setOperatorValue(dataMapping) {
            switch (dataMapping.Operator) {
                case '':
                    dataMapping.Operator = '=';
                    dataMapping.Values = dataMapping.selectedValues;
                    break;
                case '=':
                case '>':
                case '<':
                case '>=':
                case '<=':
                case '<>':
                    if (dataMapping.Type === 'Text') {
                        if (dataMapping.Values.length === 0) {
                            dataMapping.Values = '';
                        } else {
                            dataMapping.Values = dataMapping.Values.split('; ')[0];
                        }
                    } else if (dataMapping.Type === 'List' || dataMapping.Type === 'LookUp') {
                        if (dataMapping.Values.length === 0) {
                            dataMapping.Values = dataMapping.Values;
                        }
                        else {
                            var selectedValues = [];
                            if (angular.isString(dataMapping.selectedValues)) {
                                selectedValues = dataMapping.selectedValues.split("; ", 1);
                                dataMapping.selectedValues = dataMapping.selectedValues.split("; ", 1);
                            } else if (angular.isArray(dataMapping.selectedValues)) {
                                dataMapping.selectedValues = dataMapping.selectedValues.shift();
                                dataMapping.Values = dataMapping.selectedValues;
                            }
                            else if (selectedValues.length > 0) {
                                dataMapping.selectedValues = selectedValues[0];
                            }
                        }
                    } else if (dataMapping.Type === 'Date') {
                        limitDateValue(dataMapping, 1);
                    }
                    break;
                case 'BETWEEN':
                case 'NOT BETWEEN':
                    if (dataMapping.Type === 'Text') {
                        // Check first Values is string.
                        if (angular.isString(dataMapping.Values)) {
                            var splitValues = dataMapping.Values.split('; ');
                            var splitValuesLengthMinusOne = splitValues.length - 1;

                            // If input is one value (from = ) or if input is two values (from BETWEEN or NOT BETWEEN).
                            if (splitValuesLengthMinusOne === 0 || splitValuesLengthMinusOne === 1) {
                                dataMapping.Values = dataMapping.Values;
                            } else if (splitValuesLengthMinusOne > 1) {
                                // If input is three or more (from IN or NOT IN).
                                dataMapping.Values = splitValues[0] + '; ' + splitValues[1];
                            }
                        }
                    } else if (dataMapping.Type === 'List' || dataMapping.Type === 'LookUp') {
                        var selectedValues = [];
                        if (angular.isString(dataMapping.selectedValues)) {
                            selectedValues = dataMapping.selectedValues.split("; ", 1);
                            dataMapping.selectedValues = dataMapping.selectedValues.split("; ", 1);
                        } else if (angular.isArray(dataMapping.selectedValues)) {
                            selectedValues = dataMapping.selectedValues;
                        }
                        if (selectedValues.length > 0) {
                            // For multiple values like BETWEEN and IN.
                            dataMapping.selectedValues = selectedValues.splice(0, 2);
                            dataMapping.Values = dataMapping.selectedValues.join('; ');
                        } else if (selectedValues.length < 0) {
                            dataMapping.Values = selectedValues[0];
                        }
                    } else if (dataMapping.Type === 'Date') {
                        limitDateValue(dataMapping, 2);
                    }
                    break;
                case 'NOT IN':
                case 'IN':
                    if (dataMapping.Type === 'Text') {
                        if (dataMapping.Values.length === 0) {
                            dataMapping.Values = dataMapping.searchName;
                        }
                        else if (dataMapping.searchName !== '' && dataMapping.Values.indexOf(dataMapping.searchName) === -1) {
                            dataMapping.Values = dataMapping.Values + '; ' + dataMapping.searchName;
                        }
                    } else if (dataMapping.Type === 'List' || dataMapping.Type === 'LookUp') {
                        if (angular.isString(dataMapping.selectedValues)) {
                            dataMapping.selectedValues = dataMapping.selectedValues.split("; ");
                        }
                    }
                    break;
                case 'IS NULL':
                case 'IS NOT NULL':
                    dataMapping.Values = '';
                    dataMapping.dateList = [];
                    dataMapping.selectedValues = [];
                    break;
                case 'LIKE':
                case 'NOT LIKE':
                    dataMapping.Values = dataMapping.searchName;
                    break;
                default:
                    break;
            }
        }

        function limitDateValue(dataMapping, limit) {
            var storageDateList = [];
            // Get the first date only if there are more than 1 value and the operator is for single value.
            if (dataMapping.dateList.length > 1) {
                angular.forEach(dataMapping.dateList, function(item) {
                    if (item.value !== null) {
                        var dateItem = {};
                        dateItem.index = 0;
                        dateItem.isDatePickerOpen = false;
                        dateItem.value = item.value;
                        storageDateList.push(dateItem);
                        return false;
                    }
                });
                dataMapping.dateList = [];
                dataMapping.selectedValues = [];
                if (storageDateList.length > 0) {
                    dataMapping.dateList.push(storageDateList[0]);
                    dataMapping.selectedValues.push(storageDateList[0].value);
                    if (limit === 2 && storageDateList.length > 1) {
                        dataMapping.dateList.push(storageDateList[1]);
                        dataMapping.selectedValues.push(storageDateList[0].value);
                    }
                }
            }
        }

        function addSearchName(dataMapping) {
            if (dataMapping.Values === '') {
                dataMapping.Values = dataMapping.Values
            } else {
                dataMapping.Values = dataMapping.Values + '; ' + dataMapping.searchName;
            }
        }
        
        
        function openPopover(dataMapping) {
            vm.closePopovers();
            dataMapping.isPopoverOpen = true;
            dataMapping.searchName = '';
            if (dataMapping.Type === 'LookUp') { 
                clearValueList(dataMapping);
            }
        }

        function closePopovers() {
            angular.forEach(vm.dataMappingList, function (item) {
                item.isPopoverOpen = false;
            });
        }

        /************************************** START SERVICE METHODS ***************************************/

        function getCountryNameList(dataMapping) {
            DataMappingService.getCountryNameList()
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getCompanyCodeList(dataMapping) {
            DataMappingService.getCompanyCodeList()
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getCompanyNameList(dataMapping) {
            DataMappingService.getCompanyNameList()
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getAssigneePersonnelNumber(dataMapping) {
            var defaultSearchName = dataMapping.searchName;
            if (dataMapping.searchName === '') {
                defaultSearchName = '0' ;
            } 
            DataMappingService.getAssigneePersonnelNumber(defaultSearchName)
                .then(function (response) {
                    getValue(dataMapping, response.data);
                }); 
        }

        function getAssigneeNameList(dataMapping) {
            if (dataMapping.searchName !== ''){
            DataMappingService.getAssigneeNameList(dataMapping.searchName)
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
            }
        }

        function getAccountNumberList(dataMapping) {
            DataMappingService.getAccountList()
                .then(function (response) {
                    angular.forEach(response.data, function (item) {
                       dataMapping.ValueList.push(item.Number);
                    });
                    dataMapping.ValueList = $filter('orderBy')(dataMapping.ValueList);
                });
        }

        function getAccountNameList(dataMapping) {
            DataMappingService.getAccountList()
                .then(function (response) {
                    angular.forEach(response.data, function (item) {
                       dataMapping.ValueList.push(item.Name);
                    });
                    dataMapping.ValueList = $filter('orderBy')(dataMapping.ValueList);
                });
        }

        function getTransactionTypeList(dataMapping) {
            DataMappingService.getTransactionTypeList()
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getTaxYearList(dataMapping) {
            DataMappingService.getTaxYearList()
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getClientNameList(dataMapping) {
            DataMappingService.getClientNameList(dataMapping.searchName)
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getSendingCompanyCodeList(dataMapping) {
            DataMappingService.getSendingCompanyCodeList()
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getMappingStatusList(dataMapping) {
            DataMappingService.getMappingStatusList()
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getAssignmentProfileIndicatorList(dataMapping) {
            DataMappingService.getAssignmentProfileIndicatorList(dataMapping.searchName)
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getHostCountryTaxList(dataMapping) {
            DataMappingService.getHostCountryTaxList()
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getHomeCompensatoryList(dataMapping) {
            DataMappingService.getHomeCompensatoryList()
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getProjectNameList(dataMapping) {
            DataMappingService.getProjectNameList(dataMapping.searchName)
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getProjectOrganizationList(dataMapping) {
            DataMappingService.getProjectOrganizationList(dataMapping.searchName)
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getHostCountryList(dataMapping) {
            DataMappingService.getHostCountryList(dataMapping.searchName)
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getDocumentTypeList(dataMapping) {
            DataMappingService.getDocumentTypeList()
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getReferenceList(dataMapping) {
            DataMappingService.getReferenceList(dataMapping.searchName)
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getEidOfParkedByList(dataMapping) {
            DataMappingService.getEidOfParkedByList(dataMapping.searchName)
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getEidOfEnteredByList(dataMapping) {
            DataMappingService.getEidOfEnteredByList(dataMapping.searchName)
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getFunctionalAreaList(dataMapping) {
            DataMappingService.getFunctionalAreaList()
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        function getGeographicalUnitList(dataMapping) {
            DataMappingService.getGeographicalUnitList()
                .then(function (response) {
                    getValue(dataMapping, response.data);
                });
        }

        /************************************** END SERVICE METHODS ***************************************/

        function getValue(dataMapping, fieldValueList) {
            if (dataMapping.ValueList.length === 0) {
                angular.forEach(fieldValueList, function (item) {
                    angular.forEach(item, function (value, key) {
                        dataMapping.ValueList.push(value.trim());
                    });
                });
            }
        }

        function populateValueList(dataMapping) {
                clearValueList(dataMapping);
            switch (dataMapping.Name) {
                case 'Country Name':
                    getCountryNameList(dataMapping);
                    break;
                case 'Company Code':
                    getCompanyCodeList(dataMapping);
                    break;
                case 'Company Name':
                    getCompanyNameList(dataMapping);
                    break;
                case 'Personnel Number':
                    getAssigneePersonnelNumber(dataMapping);
                    break;
                case 'Assignee Name':
                    getAssigneeNameList(dataMapping);
                    break;
                case 'Account Number':
                    getAccountNumberList(dataMapping);
                    break;
                case 'Account Name':
                    getAccountNameList(dataMapping);
                    break;
                case 'Transaction Type':
                    getTransactionTypeList(dataMapping);
                    break;
                case 'Tax Year':
                    getTaxYearList(dataMapping);
                    break;
                case 'Client Name':
                    getClientNameList(dataMapping)
                    break;
                case 'Sending Company Code':
                    getSendingCompanyCodeList(dataMapping);
                    break;
                case 'Mapping Status':
                    getMappingStatusList(dataMapping);
                    break;
                case 'Assignment Profile Indicator':
                    getAssignmentProfileIndicatorList(dataMapping);
                    break;
                case 'Taxable Status':
                    getHostCountryTaxList(dataMapping);
                    break;
                case 'Compensatory in Home':
                    getHomeCompensatoryList(dataMapping)
                    break;
                case 'Project Name':
                    getProjectNameList(dataMapping);
                    break;
                case 'Project Organization':
                    getProjectOrganizationList(dataMapping);
                    break;
                case 'Host Country Name':
                    getHostCountryList(dataMapping);
                    break;
                case 'Reference':
                    getReferenceList(dataMapping);
                    break;
                case 'Enterprise ID of Parked By':
                    getEidOfParkedByList(dataMapping);
                    break;
                case 'Enterprise ID of Posted By':
                    getEidOfEnteredByList(dataMapping);
                    break;
                case 'Functional Area':
                    getFunctionalAreaList(dataMapping);
                    break;
                case 'Geographic Unit':
                    getGeographicalUnitList(dataMapping);
                    break;
                default:
                    break;
            }
        } 

        function clearValueList(dataMapping) {
            dataMapping.ValueList = [];
        }

        function changeValueCountType(dataMapping) {
            switch (dataMapping.Operator) {
                case 'NULL':
                case 'NOT NULL':
                    dataMapping.ValueCountType = 'none';
                    break;
                case '=':
                case '>':
                case '<':
                case '>=':
                case '<=':
                case 'LIKE':
                case 'NOT LIKE':
                    dataMapping.ValueCountType = 'single';
                    break;
                case 'BETWEEN':
                case 'NOT BETWEEN':
                    dataMapping.ValueCountType = 'double';
                    break;
                case 'IN':
                case 'NOT IN':
                    dataMapping.ValueCountType = 'multiple';
                    break;
                default:
                    break;
            }
        }

        function addDate(dataMapping) {
            var canAddDate = checkIfCanAddDate(dataMapping);

            if (canAddDate) {
                var dateItem = {};
                dateItem.index = dataMapping.dateList.length;
                dateItem.isDatePickerOpen = true;
                dateItem.value = null;
                dataMapping.dateList.push(dateItem);

                vm.openDatePicker(null, dateItem, dateItem.index);
            }
        }

        function checkIfCanAddDate(dataMapping) {
            var canAddDate = false;

            switch (dataMapping.Operator) {
                case '':
                case 'IN':
                case 'NOT IN':
                    canAddDate = true;
                    break;
                case 'BETWEEN':
                case 'NOT BETWEEN':
                    if (dataMapping.dateList.length < 2) {
                        canAddDate = true;
                    }
                case 'IS NULL':
                case 'IS NOT NULL':
                    break;
                default:
                    if (dataMapping.dateList.length === 0) {
                        canAddDate = true;
                    }
                    break;
            }

            return canAddDate;
        }
    }
})();