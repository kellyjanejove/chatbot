(function() {
    'use strict';

    angular
        .module('app.core')
        .component('dialogboxmodal', {
            templateUrl: 'app/core/dialogboxmodal.component.html',
            controller: DialogBoxModalController
        });

    DialogBoxModalController.inject = ['$scope', '$uibModal', 'Constants'];

    function DialogBoxModalController($scope, $uibModal, Constants) {
        activate();

        function activate() {
            showModal();
        }

        function showModal() {
            // Receive the arguments passed from the controller and open the modal form.
            $scope.$on(Constants.OPEN_DIALOGBOX_MODAL, function(event, data) {
                var modalInstance  = $uibModal.open({
                    templateUrl: 'dialogbox.modal.html',
                    controllerAs: 'modalInstanceCtrl',
                    controller: ModalInstanceController,
                    backdrop: 'static',
                    keyboard: false,
                    size: 'sm'
                });

                ModalInstanceController.inject = ['$uibModalInstance'];

                function ModalInstanceController($uibModalInstance) {
                    var modal = this;

                    modal.title = data.title;
                    modal.body = data.body;

                    modal.confirm = confirm;
                    modal.cancel = cancel;

                    function confirm() {
                        // Trigger update function back in the main controller.
                        $scope.$emit(Constants.CLOSE_DIALOGBOX_MODAL, Constants.CONFIRM);

                        $uibModalInstance.close(Constants.CONFIRM);
                    }

                    function cancel() {
                        $uibModalInstance.close(Constants.CANCEL);
                    }
                }
            });
        }
    }
})();