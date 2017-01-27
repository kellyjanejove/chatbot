(function() {
    'use strict';

    angular
        .module('app.datamapping')
        .component('trdrdialogmodal', {
            templateUrl: 'app/datamapping/trdrdialogmodal.component.html',
            controller: TrdrDialogModalController
        });

    TrdrDialogModalController.inject = ['$scope', '$uibModal', '$filter', 'Constants'];

    function TrdrDialogModalController($scope, $uibModal, $filter, Constants) {
        activate();

        function activate() {
            showModal();
        }

        function showModal() {
            // Receive the arguments passed from the controller and open the modal form.
            $scope.$on(Constants.OPEN_MODAL, function(event, data) {
                var modalInstance  = $uibModal.open({
                    templateUrl: 'trdrdialog.modal.html',
                    controllerAs: 'modalInstanceCtrl',
                    controller: ModalInstanceController,
                    backdrop: 'static',
                    keyboard: false
                });

                ModalInstanceController.inject = ['$uibModalInstance'];

                function ModalInstanceController($uibModalInstance) {
                    var modal = this;

                    modal.title = 'Select All';
                    modal.dataMappingList = data.body;
                    modal.firstColumnData = [];
                    modal.secondColumnData = [];
                    modal.isSelectAll = false;

                    modal.confirm = confirm;
                    modal.selectAll = selectAll;
                    modal.checkIfSelectAll = checkIfSelectAll;

                    activate();

                    function activate() {
                        modal.firstColumnData = getFirstColumnData(data.body);
                        modal.secondColumnData = getSecondColumnData(data.body);
                        modal.checkIfSelectAll();
                    }

                    function confirm() {
                        setSelectedColumns();

                        // Trigger update function back in the main controller.
                        $scope.$emit(Constants.CLOSE_MODAL, Constants.CONFIRM);

                        $uibModalInstance.close(Constants.CONFIRM);
                    }

                    function selectAll() {
                        selectColumnData(modal.firstColumnData);
                        selectColumnData(modal.secondColumnData);
                    }

                    function selectColumnData(columnData) {
                        var selectableDataMappingList = $filter('filter')(columnData, {Default:false});

                        angular.forEach(selectableDataMappingList, function(item) {
                            item.isSelected = modal.isSelectAll;
                        });
                    }

                    function setSelectedColumns() {
                        var combinedColumns = modal.firstColumnData.concat(modal.secondColumnData);

                        angular.forEach(modal.dataMappingList, function(item) {
                            var column = $filter('filter')(combinedColumns, {Name:item.Name}, true)[0];

                            if (angular.isDefined(column)) {
                                // Check if select status is changed.
                                if (item.isSelected !== column.isSelected) {
                                    // Clear Operator and Values
                                    clear(item);
                                }
                                item.isSelected = column.isSelected;
                            }
                        });
                    }

                    function clear(item) {
                        item.Operator = '';
                        item.Values = [];
                    }

                    function checkIfSelectAll() {
                        var combinedColumns = modal.firstColumnData.concat(modal.secondColumnData);
                        var selectedList = $filter('filter')(combinedColumns, {isSelected:true});

                        if (selectedList.length === combinedColumns.length) {
                            modal.isSelectAll = true;
                        } else {
                            modal.isSelectAll = false;
                        }
                    }

                    function getFirstColumnData(dataMappingList) {
                        var temp = $filter('limitTo')(dataMappingList, Math.floor(dataMappingList.length/2));
                        
                        return getColumnData(temp);
                    }

                    function getSecondColumnData(dataMappingList) {
                        var limit = Math.floor(dataMappingList.length/2); 
                        var temp = $filter('limitTo')(dataMappingList, limit, limit);
                        
                        return getColumnData(temp);
                    }

                    function getColumnData(dataMappingList) {
                        var columnData = [];

                        angular.forEach(dataMappingList, function(item) {
                            var dataMapping = {};

                            dataMapping.Name = item.Name;
                            dataMapping.Default = item.Default;
                            dataMapping.isSelected = item.isSelected;

                            columnData.push(dataMapping);
                        });

                        return columnData;
                    }
                }
            });
        }
    }
})();