(function() {
    var util = configurator.util;

    util.createController("configurator.controller.setting", [ "$scope", "$rootScope", "$log", "UXI18N", "ConfiguratorService", "MDMCfgMsgBar" ], function mainController($scope, $rootScope, $log, UXI18N, ConfiguratorService, MDMCfgMsgBar) {

        angular.element('.bodyDiv>.headerDiv').removeClass('hide');
        angular.element('.buildGround').children('.footerDiv').removeClass('hide');

        var localNSPublic = "public";
        var localNS = "setting";
        $scope.local = {
            buttonEdit : UXI18N.getString(localNSPublic, "button.editUppercase"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            title : UXI18N.getString(localNS, "title"),
            deploymentTargetsForCluster : UXI18N.getString(localNS, "content.deploymentTargetsForCluster_InitialConfig"),
            visibilityOption : UXI18N.getString(localNS, "content.visibilityOption"),
            vendor : UXI18N.getString(localNS, "content.verdor"),
            saveChanges : UXI18N.getString(localNS, "saveChanges"),
            displayConfiguration : UXI18N.getString(localNS, "displayConfiguration"),
            hiddenConfiguration : UXI18N.getString(localNS, "hiddenConfiguration"),
            hiddenConfigurationNot : UXI18N.getString(localNS, "hiddenConfigurationNot"),
            displayProperty : UXI18N.getString(localNS, "displayProperty"),
            hiddenProperty : UXI18N.getString(localNS, "hiddenProperty"),
            hiddenPropertyNot : UXI18N.getString(localNS, "hiddenPropertyNot"),
            remindInformation : UXI18N.getString(localNS, "remindInformation"),
            warningInformation : UXI18N.getString(localNS, "warningInformation"),
            hiddenConfigurationsTooltip : UXI18N.getString(localNS, "hiddenConfigurationsTooltip", ["Edit", "Display Hidden Configurations"], "bold"),
            hiddenPropertyTooltip : UXI18N.getString(localNS, "hiddenPropertyTooltip", ["Edit", "Display Hidden Properties"], "bold")
        };

        $scope.isCloudMode = util.cookie.getCookie("isCloudMode");

        ConfiguratorService.MainService({
            action: "getConfiguratorSettings"
        }).then(function(data){
            if(!(tibco.ux.service.staticInfo && tibco.ux.service.staticInfo.Setting)){
                util.createNamespace("tibco.ux.service.staticInfo.Setting", data);
            }
            for(var key in data){
                switch(key){
                    case "deploymentTargets":
                        $scope.deploymentTargets = data[key];
                    break;
                    case "visibility" :
                        $scope.visibility = [{
                            name: $scope.local.displayConfiguration,
                            value: data[key].showHiddenCategory,
                            showString: $scope.local.hiddenConfiguration,
                            hiddenString: $scope.local.hiddenConfigurationNot,
                            tooltip : $scope.local.hiddenConfigurationsTooltip
                        },{
                            name: $scope.local.displayProperty,
                            value: data[key].showHiddenProperty,
                            showString: $scope.local.hiddenProperty,
                            hiddenString: $scope.local.hiddenPropertyNot,
                            tooltip : $scope.local.hiddenPropertyTooltip
                        }];
                    break;
                    case "queueVendor" :
                        $scope.queueVendor = data[key];
                        // $scope.queueVendor.name = "vendor";
                        $scope.queueVendor.name = $scope.local.vendor;
                    break;
                }
            };

            $scope.deploymentTargets.push($scope.queueVendor);
        },function(error) {
            $log.info(error);
        });
        
        $scope.bufferRow = null;
        $scope.linkMethod = function(configRow) {
            configRow.panelShow = false;
            configRow.value = $scope.bufferRow.value;
            $("#settingPanel").find("#"+ $scope.prevRow.name).find(".btnBar").find("td.firstClm").html("");
            $("#settingPanel").find("#"+ $scope.prevRow.name).find(".btnBar").removeClass("unSaved");
            $scope.prevRow = null;
        };

        $scope.doSave = function(type, configRow, sendData) {
            var sendObj = [];
            switch (type) {
                case "deploymentTargets":
                    sendObj.push({deploymentTargets:sendData});
                break;
                case "queueVendor":
                    var vendor = {
                        valueOpts:sendData.valueOpts,
                        value: sendData.value
                    }
                    sendObj.push({queueVendor:vendor});
                break;
                case "visibility":
                    var visibility = {
                        showHiddenCategory: sendData[0].value,
                        showHiddenProperty: sendData[1].value
                    }
                    sendObj.push({visibility:visibility});
                break;
                default:
                break;
            }

            ConfiguratorService.MainService({
                action: "saveConfiguratorSettings",
                settingsJson: angular.toJson(sendObj)
            }).then(function(data){
                tibco.ux.service.staticInfo.Setting = data;

                if(!tibco.ux.service.staticInfo.Setting.databaseMode){
                    for(var i = 0, len = tibco.ux.service.staticInfo.Setting.deploymentTargets.length;i<len;i++){
                        if(tibco.ux.service.staticInfo.Setting.deploymentTargets[i].name === "Database"){
                            tibco.ux.service.staticInfo.Setting.databaseMode = tibco.ux.service.staticInfo.Setting.deploymentTargets[i].value;
                            $rootScope.$broadcast("databaseMode_change",tibco.ux.service.staticInfo.Setting.databaseMode);
                            break;
                        }
                    }
                }

                $("#settingPanel").find("#"+ $scope.prevRow.name).find(".btnBar").find("td.firstClm").html("");
                $("#settingPanel").find("#"+ $scope.prevRow.name).find(".btnBar").removeClass("unSaved");
                configRow.panelShow = false;
                $scope.prevRow = null;
                MDMCfgMsgBar.showConfirmMsg($scope.local.remindInformation);
                $rootScope.$broadcast("edittable_enableActions",["save"]);
            },function(error){
                
            })
            

        };
        $scope.doEdit = function(configRow) {
            if($scope.prevRow){
                if($("#settingPanel").find("#"+ $scope.prevRow.name).find("button.btn").length > 0){
                    if(!angular.equals($scope.prevRow, $scope.bufferRow)){
                        $("#settingPanel").find("#"+ $scope.prevRow.name).find(".btnBar").find("td.firstClm").html("<img src='image/ic_alertimage.png'><span class='warningInfo'>" + $scope.local.warningInformation + "</span>");
                        $("#settingPanel").find("#"+ $scope.prevRow.name).find(".btnBar").addClass("unSaved");    
                        return;
                    }else{
                        $scope.prevRow.panelShow = false;
                        configRow.panelShow = true;
                    }
                }else{
                    $scope.prevRow.panelShow = false;
                    configRow.panelShow = true;
                }
            }else{
                configRow.panelShow = true;

            }
            $scope.prevRow = configRow;
            $scope.bufferRow = angular.copy(configRow);
        };

        $scope.doChange = function(){
            $scope.changed = true;
        }
    });
})();