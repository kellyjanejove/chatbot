(function() {
    'use strict';

    angular
        .module('app.datamapping')
        .component('datamappingdetailmodal', {
            templateUrl: 'app/datamapping/datamappingdetailmodal.component.html',
            controller: DataMappingDetailModalController
        });

    DataMappingDetailModalController.inject = ['DataMappingService', 'DataMappingFactory', '$scope', '$uibModal', '$filter', 'Constants'];

    function DataMappingDetailModalController(DataMappingService, DataMappingFactory, $scope, $uibModal, $filter, Constants) {
        activate();

        function activate() {
            showModal();
        }

        function showModal() {
            // Receive the arguments passed from the controller and open the modal form.
            $scope.$on(Constants.OPEN_SEARCH_DETAIL_MODAL, function(event, data) {
                var modalInstance  = $uibModal.open({
                    templateUrl: 'datamappingdetail.modal.html',
                    controllerAs: 'modalInstanceCtrl',
                    controller: ModalInstanceController,
                    backdrop: 'static',
                    keyboard: false
                });

                ModalInstanceController.inject = ['$uibModalInstance'];

                function ModalInstanceController($uibModalInstance) {
                    var modal = this;
                    var storedFieldFName = '';

                    modal.detail = {};             
                    modal.detail.searchName = data.detail.searchName;
                    modal.detail.selectedValue = '';
                    modal.detail.ValueList = [];

                    if (data.detail.Name !== null && data.detail.PersNumber !== null) {
                        modal.detail.Name = data.detail.Name + ' - ' + data.detail.PersNumber;
                    } else {
                        modal.detail.Name = null;
                    }
                    
                    modal.detail.PersNumber = data.detail.PersNumber;
                    modal.detail.TaxYear = data.detail.TaxYear;
                    modal.detail.TransactionType = data.detail.TransactionType;
                    
                    if (data.detail.ClientName !== null && data.detail.AssignmentProfileId !== null && data.detail.StartDate !== '' && data.detail.EndDate !== '' && data.detail.HostCountryName !== null) {
                        modal.detail.ClientName = data.detail.ClientName + ' : ' + data.detail.AssignmentProfileId  + ' (' + data.detail.StartDate + '/' + data.detail.EndDate + ')' + data.detail.HostCountryName;
                    } else if (data.detail.ClientName !== null && data.detail.AssignmentProfileId !== null && data.detail.StartDate === '' && data.detail.EndDate === '') { 
                        modal.detail.ClientName = data.detail.ClientName + ' : ' + data.detail.AssignmentProfileId;
                    } else if (data.detail.ClientName !== null && data.detail.AssignmentProfileId === null) {
                        modal.detail.ClientName = data.detail.ClientName;
                    } else {
                        modal.detail.ClientName = null;
                    }

                    modal.detail.Comments = data.detail.Comments;
                    modal.detail.AccountId = data.detail.AcctNum;
                    modal.dynamicPopover = { 
                        textTemplateUrl: 'popoverText.html',
                        selectLookUpTemplateUrl: 'modalPopover.lookup.html',
                        selectListTemplateUrl: 'modalPopover.list.html'
                    };

                    modal.openPopover = openPopover;
                    modal.closePopovers = closePopovers;
                    modal.populateValueList = populateValueList;
                    modal.addSearchName = addSearchName;
                    modal.setValues = setValues;
                    modal.confirm = confirm;
                    modal.cancel = cancel;
                    modal.getResultsCount = getResultsCount;
                    modal.getLookUpResultsCount = getLookUpResultsCount;
                    modal.replaceText = replaceText;
                    modal.clearField = clearField;

                    function openPopover(detail, fieldName) {
                        clearValueList(detail);
                        detail.searchName = '';
                        storedFieldFName = fieldName;
                        modal.closePopovers(detail);

                        switch (fieldName) {
                            case 'Name':
                                detail.isNamePopoverOpen = true;
                                break;
                            case 'Trans Type':
                                detail.isTransactionTypePopoverOpen = true;
                                break;
                            case 'Tax Year':
                                detail.isTaxYearPopoverOpen = true;
                                break;
                            case 'Client Name':
                                detail.isClientNamePopoverOpen = true;
                                break;
                            default:
                                break;
                        }
                    } 

                    function closePopovers(detail) {
                        detail.isNamePopoverOpen = false;
                        detail.isTaxYearPopoverOpen = false;
                        detail.isTransactionTypePopoverOpen = false;
                        detail.isClientNamePopoverOpen = false;
                        detail.isCommentsPopoverOpen = false;
                    }
                    
                    function populateValueList(detail, fieldName) {
                        switch (fieldName) {
                            case 'Name':
                                clearValueList(detail);
                                // getAssigneeNameList(detail);
                                // break;
                            case 'Trans Type':
                                getTransactionTypeFilteredResults(detail);
                                break;
                            case 'Tax Year':
                                getTaxYearList(detail);
                                break;
                            case 'Client Name':
                                getClientFilteredResults(detail);
                                break;
                            default:
                                break;
                        }
                    }

                    function clearValueList(detail) {
                        detail.ValueList = [];
                    }

                    function getAssigneeNameList(detail) {
                        DataMappingService.getAssigneeNameList(detail.searchName)
                            .then(function (response) {
                                getValue(detail, response.data);
                            });
                    }

                    function getTransactionTypeFilteredResults(detail) {
                        DataMappingService.getTransactionTypeFilteredResults(detail.AccountId)
                            .then(function (response) {
                                getValue(detail, response.data);
                            });
                    }

                    function getTaxYearList(detail) {
                        DataMappingService.getTaxYearList()
                            .then(function (response) {
                                getValue(detail, response.data);
                            });
                    }

                    function getClientFilteredResults(detail) {
                        DataMappingService.getClientFilteredResults(detail.PersNumber)
                            .then(function (response) {
                                getValue(detail, response.data);
                            });
                    }

                    function getValue(detail, dataMappingList) {
                        if (detail.ValueList.length === 0) {
                            angular.forEach(dataMappingList, function(item) {
                                angular.forEach(item, function(value, key) {
                                    detail.ValueList.push(value.trim());
                                });
                            });
                        }
                    }

                    function addSearchName(detail) {
                        detail.Values = detail.selectedValue;
                        if (storedFieldFName === 'Name') {
                            getAssigneeNameList(detail);
                            clearValueList(detail);
                        }
                    }

                    function getResultsCount() {
                        return $filter('startsWith')(modal.detail.ValueList, modal.detail.searchName).length;
                    }

                    function getLookUpResultsCount() {
                        return $filter('filter')(modal.detail.ValueList, modal.detail.searchName).length;
                    }

                    function setValues(detail) {
                        switch (storedFieldFName) {
                            case 'Comments':
                                detail.Comments = detail.searchName;
                                closePopovers(detail);
                                break;
                            case 'Name':
                                detail.Name = detail.selectedValue;
                                closePopovers(detail);
                                break;
                            case 'Tax Year':
                                detail.TaxYear = detail.selectedValue;
                                closePopovers(detail);
                                break;;
                            case 'Trans Type':
                                detail.TransactionType = detail.selectedValue;
                                closePopovers(detail);
                                break;
                            case 'Client Name':
                                detail.ClientName = detail.selectedValue;
                                closePopovers(detail);
                                break;
                                default:
                                break;
                        }
                    }

                    function confirmChanges() {

                        if (modal.detail.Name !== null) {
                            data.detail.Name = modal.detail.Name.split(' - ')[0]; 
                        } else {
                            data.detail.Name = null;
                        }

                        if (modal.detail.Name !== null) {
                            data.detail.PersNumber = modal.detail.Name.split(' - ')[1];
                        } else {
                            data.detail.PersNumber = null;
                        }
                        
                        data.detail.TaxYear = modal.detail.TaxYear;
                        data.detail.Comments = modal.detail.Comments;
                        
                        if (modal.detail.TransactionType !== null) {
                            data.detail.TransactionType = modal.detail.TransactionType.split(' : ')[0];
                        } else {
                            data.detail.TransactionType = modal.detail.TransactionType;
                        }
                        
                        if (modal.detail.ClientName !== null) {
                            data.detail.ClientName = modal.detail.ClientName.split(' : ')[0];
                        } else {
                            data.detail.ClientName = modal.detail.ClientName;
                        }
                        
                        if (modal.detail.ClientName !== null && modal.detail.StartDate !== '') {
                            data.detail.StartDate = modal.detail.ClientName.substring(modal.detail.ClientName.lastIndexOf('(')+1,modal.detail.ClientName.lastIndexOf('/'));
                        } else {
                            data.detail.StartDate = '';
                        }

                        if (modal.detail.ClientName !== null && modal.detail.EndDate !== '') {
                            data.detail.EndDate = modal.detail.ClientName.substring(modal.detail.ClientName.lastIndexOf('/')+1,modal.detail.ClientName.lastIndexOf(')'));
                        } else {
                            data.detail.EndDate = '';
                        }

                        if (modal.detail.ClientName !== null && modal.detail.HostCountryName !== null) {
                            data.detail.HostCountryName = modal.detail.ClientName.substring(modal.detail.ClientName.lastIndexOf(')')+1);
                        } else {
                            data.detail.HostCountryName = null;
                        }

                        if (modal.detail.ClientName !== null && modal.detail.AssignmentProfileId !== null) {
                            data.detail.AssignmentProfileId = modal.detail.ClientName.substring(modal.detail.ClientName.lastIndexOf(':')+1,modal.detail.ClientName.lastIndexOf('('));
                        } else {
                            data.detail.AssignmentProfileId = null;
                        }
                        
                    }

                    function changeMappingStatus() {
                        var transType = data.detail.TransactionType;

                        if ((transType === 'Account Reallocations' || transType === 'Miscellaneous') ||
                            (!isNullOrEmpty(data.detail.Name) && !isNullOrEmpty(data.detail.TaxYear) &&
                            !isNullOrEmpty(transType))) {
                
                            data.detail.Ind = true;
                        } else {
                            data.detail.Ind = false;
                        }
                    }

                    function isNullOrEmpty(item) {
                        return item === null || item === '';
                    }

                    function confirm() {
                        confirmChanges();
                        changeMappingStatus();
                        // Trigger update function back in the main controller.
                        $uibModalInstance.close(Constants.CONFIRM);
                    }

                    function cancel() {
                        $uibModalInstance.close(Constants.CANCEL);
                    }

                    function replaceText() {
                        modal.detail.Comments = $filter('wildcard')(modal.detail.Comments);
                    }

                    function clearField(field) {
                        modal.detail[field] = null;
                    }
                }
            });
        }
    }
})();
