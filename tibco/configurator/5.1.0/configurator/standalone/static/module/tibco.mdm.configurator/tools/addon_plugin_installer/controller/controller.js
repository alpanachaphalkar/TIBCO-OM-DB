(function(){

    var util = configurator.util;

    util.createController("configurator.controller.tools.addPlugin", [ "$scope", "$rootScope", "FrameDialog" , "Constant", "UXWizard", "UXI18N", "ConfiguratorService"], function($scope, $rootScope, FrameDialog, Constant, UXWizard, UXI18N, ConfiguratorService) {
        var localNS = "tools.addPlugin";
        $scope.local = {
            title : UXI18N.getString(localNS, "title"),
            title1 : UXI18N.getString(localNS, "step1.title"),
            title2 : UXI18N.getString(localNS, "step2.title"),
            title3 : UXI18N.getString(localNS, "step3.title"),
            title4 : UXI18N.getString(localNS, "step4.title")
        };

        $scope.wizardData = {
            title : $scope.local.title,
            forms : [ {
                name : "form1",
                title : $scope.local.title1,
                templateUrl : "module/tibco.mdm.configurator/tools/addon_plugin_installer/view/pluginDetails.html"
            }, {
                name : "form2",
                title : $scope.local.title2,
                templateUrl : "module/tibco.mdm.configurator/tools/addon_plugin_installer/view/installType.html"
            }, {
                name : "form3",
                title : $scope.local.title3,
                templateUrl : "module/tibco.mdm.configurator/tools/addon_plugin_installer/view/installDetails.html"
            } , {
                name : "form4",
                title : $scope.local.title4,
                templateUrl : "module/tibco.mdm.configurator/tools/addon_plugin_installer/view/databaseDetails.html"
            } ],
            installationType : "",
            installData : {
                addonPluginInstaller : {
                    migration : "No",
                    databaseInstallation : true,
                    configValues : true,
                    addonComponents : true,
                    toVersion : "",
                    fromVersion : "",
                    commonDir : "",
                    pluginName : "",
                    database : {
                        "dbHome":"",
                        "instanceName":"",
                        "tablespace":"",
                        "databaseType":{},
                        "databaseName":"",
                        "userName":"",
                        "password":""
                    }
                }
            }
        };

        ConfiguratorService.AddonPluginInstallerService({
            action: "getPlugins"
        }).then(function(data){
                $scope.wizardData.plugins = data.plugins;
            },function(errorMsg){
                $log.info(errorMsg);
            });


    });

    util.createController("configurator.controller.tools.addPlugin.pluginDetails", [ "$scope", "UXWizard", "Constant", "UXI18N", "ConfiguratorService", "MDMValidation" ], function($scope, UXWizard, Constant, UXI18N, ConfiguratorService, MDMValidation) {
        var localNSPublic = "public";
        var localNS = "tools.addPlugin";
        $scope.installData = $scope.wizardData.installData.addonPluginInstaller;
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            formPanel1Title : UXI18N.getString(localNS, "pluginDetails.title"),
            info : UXI18N.getString(localNS, "pluginDetails.info"),
            detected : UXI18N.getString(localNS, "pluginDetails.detect"),
            type : UXI18N.getString(localNS, "pluginDetails.type"),
            selectOption : UXI18N.getString(localNS, "pluginDetails.selectOption.title"),
            installationMode : UXI18N.getString(localNS, "pluginDetails.installationMode"),
            installNewVersion : UXI18N.getString(localNS, "pluginDetails.installNewVersion"),
            migration : UXI18N.getString(localNS, "pluginDetails.migration"),
            toVersion : UXI18N.getString(localNS, "pluginDetails.toVersion"),
            fromVersion : UXI18N.getString(localNS, "pluginDetails.fromVersion")
        };

        var toNext = function() {
            ConfiguratorService.AddonPluginInstallerService({
                action: "getPluginDefaults",
                pluginName: $scope.wizardData.thisSelectedPlugin.plugin.name
            }).then(function(data){
                    $scope.wizardData.selectedPlugin = data.addOnPluginInstaller;
                },function(errorMsg){
                    //$log.info(errorMsg);
                });

            UXWizard.switchForm(Constant.formSwitch.NEXT_FORM);
        };

        $scope.nextButtonClick = function() {

            MDMValidation.doValidate([{
                keys : [{
                    key : "thisSelectedPlugin",
                    value : $scope.local.type
                }],
                object: $scope.wizardData,
                required: true
            }], function(){
                if($scope.installData.migration === 'Yes') {
                    MDMValidation.doValidate([{
                        keys : [{
                            key : "toVersion",
                            value : $scope.local.toVersion
                        }, {
                            key : "fromVersion",
                            value : $scope.local.fromVersion
                        }],
                        object: $scope.installData,
                        required: true
                    }], function(){
                        toNext();
                    });
                } else {
                    toNext();
                }
            });

        };

        $scope.closeButtonClick = function() {
            UXWizard.close();
        };



    });

    util.createController("configurator.controller.tools.addPlugin.installType", [ "$scope", "UXWizard", "Constant", "UXI18N" ], function($scope, UXWizard, Constant, UXI18N) {
        var localNSPublic = "public";
        var localNS = "tools.addPlugin";
        $scope.installData = $scope.wizardData.installData.addonPluginInstaller;
        $scope.installTypeopt = {
            databaseInstallation : false,
            configValues : false,
            addonComponents : false
        };
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            formPanel2Title : UXI18N.getString(localNS, "installType.title"),
            formPanel2Info : UXI18N.getString(localNS, "installType.info"),
            installTypical : UXI18N.getString(localNS, "installType.typical"),
            installCustom : UXI18N.getString(localNS, "installType.custom"),
            installDefInfo : UXI18N.getString(localNS, "installDefault.info"),
            databaseLable : UXI18N.getString(localNS, "installLabel.database"),
            databaseInfo : UXI18N.getString(localNS, "installInfo.database"),
            configLable : UXI18N.getString(localNS, "installLabel.configValues"),
            configInfo : UXI18N.getString(localNS, "installInfo.configValues"),
            addonLable : UXI18N.getString(localNS, "installLabel.addon"),
            addonInfo : UXI18N.getString(localNS, "installInfo.addon")
        };


        $scope.nextButtonClick = function() {
            if($scope.wizardData.installationType === "custom") {
                $scope.installData.databaseInstallation = $scope.installTypeopt.databaseInstallation;
                $scope.installData.configValues = $scope.installTypeopt.configValues;
                $scope.installData.addonComponents = $scope.installTypeopt.addonComponents;
            } else {
                $scope.installData.databaseInstallation = true;
                $scope.installData.configValues = true;
                $scope.installData.addonComponents = true;
            }

            UXWizard.switchForm(Constant.formSwitch.NEXT_FORM);

        };

        $scope.closeButtonClick = function() {
            UXWizard.close();
        };

        $scope.previousButtonClick = function() {
            UXWizard.switchForm(Constant.formSwitch.PREVIOUS_FORM);
        };
    });

    util.createController("configurator.controller.tools.addPlugin.installDetails", [ "$scope", "UXWizard", "Constant", "UXI18N", "ConfiguratorService", "MDMValidation", "MDMCfgDialog" ], function($scope, UXWizard, Constant, UXI18N, ConfiguratorService, MDMValidation, MDMCfgDialog) {
        var localNSPublic = "public";
        var localNS = "tools.addPlugin";
        $scope.installData = $scope.wizardData.installData.addonPluginInstaller;
        $scope.local = {
			title : UXI18N.getString(localNS, "title"),
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            finish : UXI18N.getString(localNSPublic, "button.finish"),
			close : UXI18N.getString(localNSPublic, "button.close"),
            formPanel3Title : UXI18N.getString(localNS, "installDetails.title"),
            formPanel3Info : UXI18N.getString(localNS, "installDetails.info"),
            MQCommonLabel : UXI18N.getString(localNS, "MQCommonLabel")
        };

        $scope.installData.commonDir = $scope.wizardData.selectedPlugin.commonDir;
        $scope.installData.custom = $scope.wizardData.selectedPlugin.custom;

        $scope.nextButtonClick = function() {
            MDMValidation.doValidate([{
                keys : [{
                    key : "commonDir",
                    value : $scope.local.MQCommonLabel
                }],
                object: $scope.installData,
                required: true
            }], function(){
                UXWizard.switchForm(Constant.formSwitch.NEXT_FORM);
            });
        };

        $scope.closeButtonClick = function() {
            UXWizard.close();
        };

        $scope.previousButtonClick = function() {
            UXWizard.switchForm(Constant.formSwitch.PREVIOUS_FORM);
        };

        $scope.finishButtonClick = function() {
            MDMValidation.doValidate([{
                keys : [{
                    key : "commonDir",
                    value : $scope.local.MQCommonLabel
                }],
                object: $scope.installData,
                required: true
            }], function(){
                UXWizard.close();

				MDMCfgDialog.showDialog({
					title: $scope.local.title,
					templateUrl: "module/tibco.mdm.configurator/tools/addon_plugin_installer/view/summary.html",
					width: 950,
					height: 500,
					buttons:{
						button3: {
							text : "",
							show : false
						},
						button4: {
							text: $scope.local.close,
							show: true,
							disabled: false,
							method: function(){
								MDMCfgDialog.closeDialog();
							}
						}
					}
				});
				
				MDMCfgDialog.data.dataOfAddonPlugin = $scope.wizardData;
            });
        };
    });

    util.createController("configurator.controller.tools.addPlugin.databaseDetails", [ "$scope", "UXWizard", "Constant", "UXI18N", "MDMValidation", "MDMCfgDialog" ], function($scope, UXWizard, Constant, UXI18N, MDMValidation, MDMCfgDialog) {
        var localNSPublic = "public";
        var localNS = "tools.addPlugin";
        $scope.installData = $scope.wizardData.installData.addonPluginInstaller;
        $scope.local = {
		    title : UXI18N.getString(localNS, "title"),
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            finish : UXI18N.getString(localNSPublic, "button.finish"),
			close : UXI18N.getString(localNSPublic, "button.close"),
            formPanel4Title : UXI18N.getString(localNS, "databaseDetails.title"),
            formPanel4Info : UXI18N.getString(localNS, "databaseDetails.info"),
            selectOption : UXI18N.getString(localNS, "pluginDetails.selectOption.title"),
            dbType : UXI18N.getString(localNS, "dbType"),
            dbName : UXI18N.getString(localNS, "dbName"),
            dbUser : UXI18N.getString(localNS, "dbUser"),
            dbPwd : UXI18N.getString(localNS, "dbPwd"),
            dbHome : UXI18N.getString(localNS, "dbHome"),
            dbTblSpace : UXI18N.getString(localNS, "dbTblSpace"),
            dbServer : UXI18N.getString(localNS, "dbServer")
        };

        $scope.installData.database = $scope.wizardData.selectedPlugin.database;
        $scope.installData.database.instanceName = "-----";
        $scope.installData.database.tablespace = "VELODBDATA1";
        delete $scope.installData.database.databaseType.valueOpt;
        if($scope.installData.database.databaseType.value === "DB2") {
            $scope.installData.database.tablespace = "VELODATA";
        }

        $scope.closeButtonClick = function() {
            UXWizard.close();
        };

        $scope.previousButtonClick = function() {
            UXWizard.switchForm(Constant.formSwitch.PREVIOUS_FORM);
        };

        $scope.finishButtonClick = function() {
            MDMValidation.doValidate([{
                keys : [{
                    key : "databaseName",
                    value : $scope.local.dbName
                }, {
                    key : "userName",
                    value : $scope.local.dbUser
                }, {
                    key : "password",
                    value : $scope.local.dbPwd
                }, {
                    key : "dbHome",
                    value : $scope.local.dbHome
                }],
                object: $scope.installData.database,
                required: true
            }], function(){
                if($scope.installData.database.databaseType.value === 'SQLSERVER') {
                    MDMValidation.doValidate([{
                        keys : [{
                            key : "instanceName",
                            value : $scope.local.dbServer
                        }],
                        object: $scope.installData.database,
                        required: true
                    }], function(){
                        UXWizard.switchForm("form5");
                    });
                } else {
                    MDMValidation.doValidate([{
                        keys : [{
                            key : "tablespace",
                            value : $scope.local.dbTblSpace
                        }],
                        object: $scope.installData.database,
                        required: true
                    }], function(){
                        UXWizard.close();

						MDMCfgDialog.showDialog({
							title: $scope.local.title,
							templateUrl: "module/tibco.mdm.configurator/tools/addon_plugin_installer/view/summary.html",
							width: 950,
							height: 500,
							buttons:{
								button3: {
									text : "",
									show : false
								},
								button4: {
									text: $scope.local.close,
									show: true,
									disabled: false,
									method: function(){
										MDMCfgDialog.closeDialog();
									}
								}
							}
						});
						
						MDMCfgDialog.data.dataOfAddonPlugin = $scope.wizardData;
                    });
                }
            });

        };
    });

    util.createController("configurator.controller.tools.addPlugin.summary", [ "$scope", "UXWizard", "Constant", "UXI18N", "ConfiguratorService", "MDMCfgDialog" ], function($scope, UXWizard, Constant, UXI18N, ConfiguratorService, MDMCfgDialog) {
        var localNSPublic = "public";
        var localNS = "tools.addPlugin";

        $scope.local = {
            summaryTitle : UXI18N.getString(localNS, "summaryTitle"),
            summaryInfo : UXI18N.getString(localNS, "summaryInfo"),
            installStatusNotInvoked : UXI18N.getString(localNS, "installStatusNotInvoked"),
            installStatusFaild : UXI18N.getString(localNS, "installStatusFaild"),
            installStatusSuccess : UXI18N.getString(localNS, "installStatusSuccess"),
            openFile : UXI18N.getString(localNS, "openFile"),
            reportTitle : UXI18N.getString(localNS, "reportTitle"),
            logTitle : UXI18N.getString(localNS, "logTitle"),
            databaseLable : UXI18N.getString(localNS, "installLabel.database"),
            configLable : UXI18N.getString(localNS, "installLabel.configValues"),
            addonLable : UXI18N.getString(localNS, "installLabel.addon"),
			wait : UXI18N.getString(localNS, "wait"),
			progress : UXI18N.getString(localNS, "progress")
        };
		$scope.showSummary = false;
		$scope.wizardData = MDMCfgDialog.data.dataOfAddonPlugin;
        $scope.wizardData.installData.addonPluginInstaller.pluginName = $scope.wizardData.selectedPlugin.pluginName;
        ConfiguratorService.AddonPluginInstallerService({
            action: "startInstallation",
            values: JSON.stringify($scope.wizardData.installData)
        }).then(function(data){
                $scope.wizardData.installationResults = data.installationResults;
                $scope.installResults = $scope.wizardData.installationResults.results;
                $scope.logFiles = $scope.wizardData.installationResults.logfiles;
                $scope.showSummary = true;

            },function(errorMsg){
                $log.info(errorMsg);
            });

    });


}());