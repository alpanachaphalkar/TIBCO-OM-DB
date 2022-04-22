(function() {
    var util = configurator.util;

    util.createController("configurator.controller.revision_history", [ "$scope", "$rootScope", "$log", "MDMCfgDialog", "UXI18N", "MDMCfgMsgBar", "ConfiguratorService"], function mainController($scope, $rootScope, $log, MDMCfgDialog, UXI18N, MDMCfgMsgBar, ConfiguratorService) {

        angular.element('.bodyDiv>.headerDiv').removeClass('hide')
        angular.element('.buildGround').children('.footerDiv').removeClass('hide');

        var localNSPublic = "public";
        var localNS = "revision_history";
        $scope.local = {
            buttonEdit : UXI18N.getString(localNSPublic, "button.editUppercase"),
            buttonDelete : UXI18N.getString(localNSPublic, "button.deleteUppercase"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            save : UXI18N.getString(localNSPublic, "button.save1"),
            title : UXI18N.getString(localNS, "title"),
            buttonRevert : UXI18N.getString(localNS, "button.revert"),
            placeholderText : UXI18N.getString(localNS, "placeholder.text"),
            headerRevisionNo : UXI18N.getString(localNS, "header.revisionNo"),
            headerTimestamp : UXI18N.getString(localNS, "header.timestamp"),
            headerDescription : UXI18N.getString(localNS, "header.description"),
            inforToWarning : UXI18N.getString(localNS, "inforToWarning"),
            confirmRevert : UXI18N.getString(localNS, "confirmRevert"),
            revertInformation : UXI18N.getString(localNS, "revertInformation"),
            revertButton : UXI18N.getString(localNS, "revertButton"),
            revertSuccessfully : UXI18N.getString(localNS, "revertSuccessfully"),
            editRevision : UXI18N.getString(localNS, "editRevision"),
            editSuccessfully : UXI18N.getString(localNS, "editSuccessfully"),
            confirmDelete : UXI18N.getString(localNS, "confirmDelete"),
            deleteInformation : UXI18N.getString(localNS, "deleteInformation"),
            deleteSuccessfully : UXI18N.getString(localNS, "deleteSuccessfully"),
            filterHint : UXI18N.getString(localNS, "filterHint")
        };

        $scope.$on("REFRESH_RESTOREPAGE", function(event){

            getRestoreFileList();


        });

        function getRestoreFileList(){
            ConfiguratorService.MainService({
                action: "getRestoreFileList"
            }).then(function(data){
                $scope.tableData = data.BackupList.File;
                if($scope.tableData && !angular.isArray($scope.tableData)){
                    $scope.tableData = [$scope.tableData];
                }
            },function(error){
                $log.info(error);
            });
        }
        
        getRestoreFileList();

        $scope.selectedIdx = -1;

        $scope.recordSelect = function(index, row){
            $scope.selectedIdx = index;
            $scope.selectedRow = row;
        };

        $scope.revertToSelect = function (){
            MDMCfgDialog.showMessage($scope.local.confirmRevert, $scope.local.revertInformation, {
                button3: {
                    text: $scope.local.revertButton,
                    show: true,
                    method: function(){
                        ConfiguratorService.MainService({
                            action: "restore",             
                            fileName: MDMCfgDialog.data.revisionHistory.fileName
                        }).then(function(data){
                            MDMCfgDialog.data.statusOfRevision = true;
                            MDMCfgDialog.closeDialog();
                            MDMCfgMsgBar.showConfirmMsg($scope.local.revertSuccessfully);
                            $rootScope.$broadcast("edittable_enableActions",["save"]);
                        },function(error){
                            $log.info(error);
                        });
                    }
                },
                button4: {
                    text: $scope.local.cancel,
                    show: true,
                    method: function(){
                        MDMCfgDialog.closeDialog();
                    }
                }
            });

            MDMCfgDialog.data.revisionHistory = angular.copy($scope.selectedRow);
        };

        $scope.recordEdit = function(){
            var self = $scope;
            MDMCfgDialog.showDialog({
                title: $scope.local.editRevision,
                templateUrl: "module/tibco.mdm.configurator/revision_history/view/editDialog_template.html",
                width: 700,
                height: 340,
                buttons:{
                    button3: {
                        text : $scope.local.save,
                        show : true,
                        method: function(){
                            ConfiguratorService.MainService({
                                action: "updateBackupFileDescription",
                                fileName:  MDMCfgDialog.data.revisionHistory.fileName,
                                description :  MDMCfgDialog.data.revisionHistory.description
                            }).then(function(data){
                                MDMCfgDialog.closeDialog();
                                MDMCfgMsgBar.showConfirmMsg($scope.local.editSuccessfully);
                                $scope.tableData = data.BackupList.File;
                                if($scope.tableData && !angular.isArray($scope.tableData)){
                                    $scope.tableData = [$scope.tableData];
                                }
                                $scope.selectedRow = $scope.tableData[$scope.selectedIdx];
                            },function(error){
                                MDMCfgDialog.showInfoBar("error",error);
                            });
                            
                        }
                    },
                    button4: {
                        text: $scope.local.cancel,
                        show: true,
                        method: function(){
                            MDMCfgDialog.closeDialog();
                        }
                    }
                }
            });
            //$scope.bufferRow = angular.copy($scope.selectedRow);
            MDMCfgDialog.data.revisionHistory = angular.copy($scope.selectedRow);
        };

        $scope.recordDelete = function(){
            MDMCfgDialog.showMessage($scope.local.confirmDelete, $scope.local.deleteInformation, {
                button3: {
                    text: $scope.local.buttonDelete,
                    show: true,
                    method: function(){
                        ConfiguratorService.MainService({
                            action: "deleteBackupConfiguration",             
                            fileName: MDMCfgDialog.data.revisionHistory.fileName
                        }).then(function(data){
                            MDMCfgDialog.closeDialog();
                            MDMCfgMsgBar.showConfirmMsg($scope.local.deleteSuccessfully);

                            $scope.tableData = data.BackupList.File;
                            if($scope.tableData && !angular.isArray($scope.tableData)){
                                $scope.tableData = [$scope.tableData];
                            }

                            $scope.selectedIdx = -1;
                        },function(error){
                            $log.info(error);
                        });
                    }
                },
                button4: {
                    text: $scope.local.cancel,
                    show: true,
                    method: function(){
                        MDMCfgDialog.closeDialog();
                    }
                }
            });

            MDMCfgDialog.data.revisionHistory = angular.copy($scope.selectedRow);
            
        };

        $scope.showFilter = function(){
            $scope.inFilter = true;
            var isInputSupported = 'placeholder' in document.createElement('input');
            var IntervalTime = 0;
            if(isInputSupported){
                IntervalTime = 500;
            }else{
                IntervalTime = 1500;
            }

            setTimeout(function() {
                jQuery("#recision_action_filter").focus();
            }, IntervalTime);

        };
        
    });
    util.createController("configurator.controller.revision_history.editRevisionCtrl", [ "$scope", "$log", "MDMCfgDialog", "UXI18N"], function mainController($scope, $log, MDMCfgDialog, UXI18N) {
        var localNS = "revision_history";
        $scope.local = {
            information : UXI18N.getString(localNS, "editRevision.information"),
            description : UXI18N.getString(localNS, "editRevision.description")
        };

        $scope.$watch(function(){
            return MDMCfgDialog.data.revisionHistory;
        },function(nv, ov){
            $scope.editRevision = MDMCfgDialog.data.revisionHistory;
        },true);
    });
}());