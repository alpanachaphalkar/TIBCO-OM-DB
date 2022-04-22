(function(){

    var util = configurator.util;

    util.createController("configurator.controller.tools.migration", [ "$scope", "$rootScope", "FrameDialog" , "Constant", "UXWizard", "UXI18N", "ConfiguratorService", "$log"], function($scope, $rootScope, FrameDialog, Constant, UXWizard, UXI18N, ConfiguratorService, $log) {

        var localNS = "tools.migration";
        $scope.local = {
            title : UXI18N.getString(localNS, "title"),
            preTitle1 : UXI18N.getString(localNS, "formPanel.preTitle1"),
            preTitle2 : UXI18N.getString(localNS, "formPanel.preTitle2"),
            preTitle3 : UXI18N.getString(localNS, "formPanel.preTitle3"),
            preTitle4 : UXI18N.getString(localNS, "formPanel.preTitle4")
        };

        $scope.wizardData = {
            title : $scope.local.title,
            forms : [ {
                name : "SpecifyUpdate",
                title : $scope.local.preTitle1,
                templateUrl : "module/tibco.mdm.configurator/tools/migration/view/formPanel_1.html"
            }, {
                name : "IdentifyLocation",
                title : $scope.local.preTitle2,
                templateUrl : "module/tibco.mdm.configurator/tools/migration/view/formPanel_2.html"
            }, {
                name : "SelectMigration",
                title : $scope.local.preTitle3,
                templateUrl : "module/tibco.mdm.configurator/tools/migration/view/formPanel_3.html"
            } , {
                name : "defineDatabseMigration",
                title : $scope.local.preTitle4,
                templateUrl : "module/tibco.mdm.configurator/tools/migration/view/formPanel_4.html"
            } ]
        };

        
    });
    
    //Specify Update Details
    util.createController("configurator.controller.tools.migration.formPanel1", [ "$scope", "UXWizard", "MDMCfgDialog", "Constant", "UXI18N", "ConfiguratorService", "$log" ], function($scope, UXWizard, MDMCfgDialog, Constant, UXI18N, ConfiguratorService, $log) {
        var localNSPublic = "public";
        var localNS = "tools.migration";
        var localNSTip = "tools.migration.tip";
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            dialogTitle : UXI18N.getString(localNS, "formPanel1.dialogTitle"),
            dialogSubTitle : UXI18N.getString(localNS, "formPanel1.dialogSubTitle"),
            newInstallation : UXI18N.getString(localNS, "formPanel1.newInstallation"),
            title : UXI18N.getString(localNS, "formPanel1.title"),
            location : UXI18N.getString(localNS, "formPanel1.location"),
            version : UXI18N.getString(localNS, "formPanel1.version"),
            versions2 : UXI18N.getString(localNS, "formPanel1.versions2"),
            GDSNEnabled : UXI18N.getString(localNS, "formPanel1.GDSNEnabled"),
            GDSNEnabledCheckboxYes : UXI18N.getString(localNS, "formPanel1.GDSNEnabledCheckboxYes"),
            GDSNEnabledCheckboxNo : UXI18N.getString(localNS, "formPanel1.GDSNEnabledCheckboxNo"),
            preVersion : UXI18N.getString(localNS, "formPanel1.preVersion"),
            browse : UXI18N.getString(localNS, "formPanel1.preVersion.button.browse"),
            doBrowseTitle : UXI18N.getString(localNS, "formPanel1.doBrowseTitle"),
            errorMassage : UXI18N.getString(localNS, "formPanel1.errorMassage")
        };
        $scope.tipInfo = {
            location : UXI18N.getString(localNSTip, "SpecifyUpdateDetails.location"),
            version : UXI18N.getString(localNSTip, "SpecifyUpdateDetails.version"),
            GDSNEnabled : UXI18N.getString(localNSTip, "SpecifyUpdateDetails.GDSNEnabled", ["No", "Yes"], "bold"),
            preLocation : UXI18N.getString(localNSTip, "SpecifyUpdateDetails.preLocation", ["Browse"], "bold"),
            preVersion: UXI18N.getString(localNSTip, "SpecifyUpdateDetails.preVersion"),
            preGDSNEnable : UXI18N.getString(localNSTip, "SpecifyUpdateDetails.preGDSNEnable", ["Yes"], "bold")
        };
        
        $scope.doBrowse = function(){
            MDMCfgDialog.showDialog({
                title: $scope.local.doBrowseTitle,
                templateUrl: "module/tibco.mdm.configurator/tools/migration/view/BrowsePathDialog.html",
                width: 650,
                height: 350,
                buttons:false
            });
        }
        $scope.migrationDetails = UXWizard.getData("migrationDetails");
        if(!$scope.migrationDetails){
            var migrationDetails = {
                "migrationWizard": {
                    "previousVersion":{
                        "configValue":"",
                        "GDSN":"true",
                        "version":{"value":[]},
                        "commonDir":"",
                        "installedPath":""
                    },
                    "migrationSetup":{
                        "dependentMigration":false,
                        "gdsnMigration":false,
                        "databaseMigration":false,
                        "configMigration":false,
                        "rulesMigration":false
                    },
                    "newVersion":{
                        "configValue":"",
                        "GDSN":"false",
                        "version":{"value":[]},
                        "commonDir":"",
                        "installedPath":""
                    },
                    "ignoreFiles":{
                        "component":[]
                    },
                    "database":{
                        "sqlInstance":"",
                        "databaseType":{
                            "value":[]
                        },
                        "databaseName":"",
                        "tablespace":"",
                        "userName":"",
                        "dbHome":"",
                        "password":""
                    }
                }
            }
            
            ConfiguratorService.MigrationService({
                action: "getMigrationDetail"
            }, false).then(function(data){
                var mDetails = {};
                jQuery.extend(true, mDetails, migrationDetails, data);
                $scope.migrationDetails = mDetails;
                $scope.migrationDetails.migrationWizard.newVersion.GDSN = $scope.migrationDetails.migrationWizard.newVersion.GDSN? "true":"false";
                $scope.migrationDetails.migrationWizard.previousVersion.GDSN = $scope.migrationDetails.migrationWizard.previousVersion.GDSN? "true":"false";
            },function(error){
                $log.info(error);
            });
        };
        
        $scope.nextButtonClick = function() {
            if(!$scope.specForm.$valid){
                return;
            }
            if($scope.migrationDetails.migrationWizard.newVersion.GDSN === "false"){
                if($scope.migrationDetails.migrationWizard.previousVersion.GDSN === "true"){
                    //"GDSN migration is not supported"
                    UXWizard.showInfoBar("error", $scope.local.errorMassage);
                    return;
                }
            }
            UXWizard.switchForm("IdentifyLocation");
            UXWizard.setData("migrationDetails", $scope.migrationDetails);
        };

        $scope.closeButtonClick = function() {
            UXWizard.close();
            UXWizard.setData("migrationDetails", null);
            UXWizard.setData("migrationType", null);
        };

        $scope.$on("browseAndSelectedFolderPath", function(event, params){
            /*var paths = [];
            paths.push(params);
            $scope.previousVersioninstalledPaths = paths;*/
            $scope.migrationDetails.migrationWizard.previousVersion.installedPath = params;
        })
        
    });

    //Browse Path
    util.createController("configurator.controller.tools.migration.browsePath", [ "$scope", "$rootScope", "UXWizard", "MDMCfgDialog", "Constant", "UXI18N", "ConfiguratorService", "$log" ], function($scope, $rootScope, UXWizard, MDMCfgDialog, Constant, UXI18N, ConfiguratorService, $log) {
        var loadFolder = function(){
            ConfiguratorService.FileService({
                action: "listDrives"
            }).then(function(data){
                $scope.paths = data.paths;
            },function(errorMsg){
                $log.info(errorMsg);
            })
        };

        var localNSPublic = "public";
        var localNS = "tools.migration";
        $scope.local = {
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            choose : UXI18N.getString(localNSPublic, "button.chooseUppercase"),
            file : UXI18N.getString(localNS, "browsePath.thead.file"),
            size : UXI18N.getString(localNS, "browsePath.thead.size"),
            modified : UXI18N.getString(localNS, "browsePath.thead.modified"),
            type : UXI18N.getString(localNS, "browsePath.thead.type")
        };

        loadFolder();
        $scope.currentFolder = "";
        $scope.getSubFolder = function(folderName){
            ConfiguratorService.FileService({
                action: "getSubFolder",
                folderName: folderName,
            }).then(function(data){
                $scope.paths = data.paths;
                $scope.currentFolder = folderName;
                cleanSelected();
            },function(errorMsg){
                $log.info(errorMsg);
            })
        };
        $scope.getParentFolder = function(){
            ConfiguratorService.FileService({
                action: "getParentFolder",
                folderName: $scope.currentFolder
            }).then(function(data){
                $scope.paths = data.paths;
                $scope.currentFolder = reConcatPath($scope.currentFolder);
                cleanSelected()
            },function(errorMsg){
                $log.info(errorMsg);
            })
        };

        var reConcatPath = function(prePath){
            var paths = prePath.split("\\");
            var lastPath = paths.pop();
            var path = "";
            if(lastPath != ""){
                path = paths.join("\\");
                if(paths.length == 1){
                    path += "\\";
                }
            }
            return path;
        }

        var cleanSelected = function(){
            $scope.selectedIdx = -1;
            $scope.selectedFolder = "";
        }

        $scope.selecteFolder = function(pathName, index){
            $scope.selectedIdx = index;
            $scope.selectedFolder = pathName;
        };


        $scope.reloadFolder = function(){
            loadFolder();
        };

        $scope.doCancel = function(){
            MDMCfgDialog.closeDialog();
        }

        $scope.doChoose = function(){
            var selectedFolderPath = $scope.selectedFolder == "" ? $scope.currentFolder : $scope.selectedFolder;
            $rootScope.$broadcast("browseAndSelectedFolderPath", selectedFolderPath);
            MDMCfgDialog.closeDialog();
        }
    });
    
    //Identify Location
    util.createController("configurator.controller.tools.migration.formPanel2", [ "$scope", "UXWizard", "Constant", "UXI18N", "ConfiguratorService", "$log", "MDMValidation" , "MDMCfgDialog"], function($scope, UXWizard, Constant, UXI18N, ConfiguratorService, $log, MDMValidation, MDMCfgDialog) {
        var localNSPublic = "public";
        var localNS = "tools.migration";
        var localNSTip = "tools.migration.tip";
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            dialogTitle : UXI18N.getString(localNS, "formPanel2.dialogTitle"),
            dialogSubTitle : UXI18N.getString(localNS, "formPanel2.dialogSubTitle"),
            newPath : UXI18N.getString(localNS, "formPanel2.newPath"),
            newPathOption1 : UXI18N.getString(localNS, "formPanel2.newPath.option1"),
            newPathOption2 : UXI18N.getString(localNS, "formPanel2.newPath.option2"),
            existingPath : UXI18N.getString(localNS, "formPanel2.existingPath"),
            existingPathOption1 : UXI18N.getString(localNS, "formPanel2.existingPath.option1"),
            existingPathOption2 : UXI18N.getString(localNS, "formPanel2.existingPath.option2"),
            alertTitle : UXI18N.getString(localNS, "formPanel2.alertTitle"),
            continueButton : UXI18N.getString(localNS, "formPanel2.continueButton")
        };
        $scope.tipInfo = {
            newDirPath : UXI18N.getString(localNSTip, "IdentifyLocation.newDirPath"),
            newXmlPath : UXI18N.getString(localNSTip, "IdentifyLocation.newXmlPath"),
            ExistingDirPath : UXI18N.getString(localNSTip, "IdentifyLocation.ExistingDirPath"),
            ExistingXmlPath : UXI18N.getString(localNSTip, "IdentifyLocation.ExistingXmlPath")
        };

        $scope.migrationDetails = UXWizard.getData("migrationDetails");

        $scope.migrationDetails.migrationWizard.newVersion["commonDir"] = $scope.migrationDetails.migrationWizard.newVersion.installedPath + "/common";
        $scope.migrationDetails.migrationWizard.newVersion["configValue"] = $scope.migrationDetails.migrationWizard.newVersion.installedPath + "/config/ConfigValues.xml";

        //$scope.migrationDetails.migrationWizard.previousVersion["commonDir"] = $scope.migrationDetails.migrationWizard.previousVersion.installedPath + "/common";    ;
        $scope.migrationDetails.migrationWizard.previousVersion["configValue"] = $scope.migrationDetails.migrationWizard.previousVersion.installedPath + "/config/ConfigValues.xml";    
        $scope.previousButtonClick = function() {
            UXWizard.switchForm("SpecifyUpdate");
            UXWizard.setData("migrationDetails", $scope.migrationDetails);
        };

        $scope.nextButtonClick = function() {

            MDMValidation.doValidate([{
                keys : [{
                    key : "commonDir",
                    value : $scope.local.newPathOption1
                }, {
                    key : "configValue",
                    value : $scope.local.newPathOption2
                }],
                object: $scope.migrationDetails.migrationWizard.newVersion,
                required: true
            }, {
                keys : [{
                    key : "commonDir",
                    value : $scope.local.existingPathOption1
                }, {
                    key : "configValue",
                    value : $scope.local.existingPathOption2
                }],
                object: $scope.migrationDetails.migrationWizard.previousVersion,
                required: true
            }], function(){
                ConfiguratorService.MigrationService({
                    action: "checkforGdsn",
                    configFile : $scope.migrationDetails.migrationWizard.previousVersion.configValue,
                    mqHome: $scope.migrationDetails.migrationWizard.previousVersion.installedPath
                }).then(function(data){
                    UXWizard.switchForm("SelectMigration");
                    UXWizard.setData("migrationDetails", $scope.migrationDetails);
                },function(error){
                    MDMCfgDialog.closeInfoBar();
                    MDMCfgDialog.showMessage($scope.local.alertTitle, error, {
                        button3: {
                            text: $scope.local.continueButton,
                            show: true,
                            method: function() {
                                MDMCfgDialog.closeDialog();
                                UXWizard.switchForm("SelectMigration");
                            }
                        },
                        button4: {
                            text: $scope.local.cancel,
                            show: true,
                            method: function() {
                                MDMCfgDialog.closeDialog();
                            }
                        }
                    });
                }); 
            });
        };

        $scope.closeButtonClick = function() {
            UXWizard.close();
            UXWizard.setData("migrationDetails", null);
            UXWizard.setData("migrationType", null);
        };
    });
    
    //Select Migration
    util.createController("configurator.controller.tools.migration.formPanel3", [ "$scope", "$rootScope", "ConfiguratorService", "MDMCfgDialog", "UXWizard", "Constant", "UXI18N", "$route" ], function($scope, $rootScope, ConfiguratorService, MDMCfgDialog, UXWizard, Constant, UXI18N, $route) {
        var localNSPublic = "public";
        var localNS = "tools.migration";
        $scope.subFormPanel = "defineDatabseMigration";
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            finish : UXI18N.getString(localNSPublic, "button.finish"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            close : UXI18N.getString(localNSPublic, "button.close"),
            open : UXI18N.getString(localNSPublic, "button.open"),
            dialogTitle : UXI18N.getString(localNS, "formPanel3.dialogTitle"),
            dialogSubTitle : UXI18N.getString(localNS, "formPanel3.dialogSubTitle"),
            complete : UXI18N.getString(localNS, "formPanel3.complete"),
            custom : UXI18N.getString(localNS, "formPanel3.custom"),
            customDatabase : UXI18N.getString(localNS, "formPanel3.customDatabase"),
            customDatabaseInfo : UXI18N.getString(localNS, "formPanel3.customDatabaseInfo"),
            customConfigValues : UXI18N.getString(localNS, "formPanel3.customConfigValues"),
            customConfigValuesInfo : UXI18N.getString(localNS, "formPanel3.customConfigValuesInfo"),
            customDepandentFiles : UXI18N.getString(localNS, "formPanel3.customDepandentFiles"),
            customDepandentFilesInfo : UXI18N.getString(localNS, "formPanel3.customDepandentFilesInfo"),
            customGDSNAddonFiles : UXI18N.getString(localNS, "formPanel3.customGDSNAddonFiles"),
            customGDSNAddonFilesInfo : UXI18N.getString(localNS, "formPanel3.customGDSNAddonFilesInfo"),
            rules : UXI18N.getString(localNS, "formPanel3.rules"),
            rulesInfo : UXI18N.getString(localNS, "formPanel3.rulesInfo"),
            summaryTitle : UXI18N.getString(localNS, "formPanel3.summaryTitle"),
            summaryInfo : UXI18N.getString(localNS, "formPanel3.summaryInfo"),
            migrationReport : UXI18N.getString(localNS, "formPanel3.migrationReport"),
            outputLogs : UXI18N.getString(localNS, "formPanel3.outputLogs"),
            databaseMigration : UXI18N.getString(localNS, "formPanel3.databaseMigration"),
            configValuesMigration : UXI18N.getString(localNS, "formPanel3.configValuesMigration"),
            DependentFilesMigration : UXI18N.getString(localNS, "formPanel3.DependentFilesMigration"),
            GDSNAddonFiles : UXI18N.getString(localNS, "formPanel3.GDSNAddonFiles"),
            rulesMigration : UXI18N.getString(localNS, "formPanel3.rulesMigration"),
            jumpToIgnoreErrorTitle : UXI18N.getString(localNS, "formPanel3.jumpToIgnoreErrorTitle"),
            abortButton : UXI18N.getString(localNS, "ignoreError.abortButton"),
            ignoreButton : UXI18N.getString(localNS, "ignoreError.ignoreButton"),
            doErrorInformation : UXI18N.getString(localNS, "doErrorInformation"),
            migrationInProgress : UXI18N.getString(localNS, "formPanel3.migrationInProgress"),
            progressInformation : UXI18N.getString(localNS, "formPanel3.progressInformation")
        };

        $scope.migrationDetails = UXWizard.getData("migrationDetails");

        $scope.progressing = false;

        $scope.wizardChangeFlag = $scope.wizardChangeFlag || false;

        $scope.migrationType = UXWizard.getData("migrationType") ? UXWizard.getData("migrationType") : "completeMigration";

        if($scope.migrationType === "customMigration") {
            $scope.checkCustomScope = {
                migrationSetup : {
                    checkboxCustomDatabase : $scope.migrationDetails.migrationWizard.migrationSetup.databaseMigration,
                    checkboxCustomConfig : $scope.migrationDetails.migrationWizard.migrationSetup.configMigration,
                    checkboxCustomDependent : $scope.migrationDetails.migrationWizard.migrationSetup.dependentMigration
                },
                newVersion : {
                    checkboxCustomGDSNAddonFiles : $scope.migrationDetails.migrationWizard.newVersion.GDSN
                }
            };
        } else {
            $scope.checkCustomScope = {
                migrationSetup : {
                    checkboxCustomDatabase : false,
                    checkboxCustomConfig : false,
                    checkboxCustomDependent : false
                },
                newVersion : {
                    checkboxCustomGDSNAddonFiles : false
                }
            };
        }


        $scope.switchFlag = UXWizard.getData("newQueueForm1");

        $scope.nextButtonClick = function() {
            UXWizard.switchForm("defineDatabseMigration");
            UXWizard.setData("migrationDetails", $scope.migrationDetails);
            UXWizard.setData("migrationType", $scope.migrationType);
        };

        $scope.finishButtonClick = function(){
            $scope.progressing = true;
            UXWizard.setData("migrationType", null);
            UXWizard.setData("migrationDetails", null);

            var migrationValues = angular.copy($scope.migrationDetails);
            
            if($scope.migrationType === "customMigration") {
                if(migrationValues.migrationWizard.migrationSetup.databaseMigration == false) {
                    delete migrationValues.migrationWizard.database;
                }
                
            }else {
                if($scope.migrationType === "rulesMigration") {
                    migrationValues.migrationWizard.migrationSetup.rulesMigration = true;
                }

                migrationValues.migrationWizard.migrationSetup.databaseMigration = false;
                migrationValues.migrationWizard.migrationSetup.configMigration = false;
                migrationValues.migrationWizard.migrationSetup.dependentMigration = false;
                migrationValues.migrationWizard.newVersion.GDSN = false;
            }
            
            ConfiguratorService.MigrationService({
                action: "startMigration",
                migrationValues : angular.toJson(migrationValues)
            }).then(function(data){
                $scope.progressing = false;
                $scope.subFormPanel = "MigrationSummary";
                $scope.summaryInfo = data;
                MDMCfgDialog.closeDialog();
                if(data.results.database == ""){
                    $scope.databaseStatus = "Migration not invoked";
                }else if(data.results.database == "false"){
                    $scope.databaseStatus = "Upgraded With Errors";
                }else{
                    $scope.databaseStatus = "Successfully Upgraded";
                }

                if(data.results.configValues == ""){
                    $scope.configvalueStatus = "Migration not invoked";
                }else if(data.results.configValues == "false"){
                    $scope.configvalueStatus = "Upgraded With Errors";
                }else{
                    $scope.configvalueStatus = "Successfully Upgraded";
                }

                if(data.results.gdsnAddon == ""){
                    $scope.gdsnAddonStatus = "Migration not invoked";
                }else if(data.results.gdsnAddon == "false"){
                    $scope.gdsnAddonStatus = "Upgraded With Errors";
                }else{
                    $scope.gdsnAddonStatus = "Successfully Upgraded";
                }

                if(data.results.rulesMigration == ""){
                    $scope.rulesStatus = "Migration not invoked";
                }else if(data.results.rulesMigration == "false"){
                    $scope.rulesStatus = "Upgraded With Errors";
                }else{
                    $scope.rulesStatus = "Successfully Upgraded";
                }

                if(data.results.component == ""){
                    $scope.componentStatus = "Migration not invoked";
                }else if(data.results.component == "false"){
                    $scope.componentStatus = "Upgraded With Errors";
                }else{
                    $scope.componentStatus = "Successfully Upgraded";
                }
            },function(error){
                console.info("migration failed");
                $scope.progressing = false;
                MDMCfgDialog.data["ignoreErrorMessage"] = error.fatalMessage;
                MDMCfgDialog.showDialog({
                    title: $scope.local.jumpToIgnoreErrorTitle,
                    templateUrl: "module/tibco.mdm.configurator/tools/migration/view/ignoreError.html",
                    width: 500,
                    height: 300,
                    buttons:{
                        button3: {
                            text : $scope.local.abortButton,
                            show : true,
                            method: function(){
                                MDMCfgDialog.closeDialog();
                            }
                        },
                        button4: {
                            text: $scope.local.ignoreButton,
                            show: true,
                            method: function(){
                                $scope.migrationDetails.migrationWizard.ignoreFiles.component = error.fatalMessage.component;
                                ConfiguratorService.MigrationService({
                                    action:"completeMigration",
                                    migrationValues : angular.toJson($scope.migrationDetails)
                                }).then(function(data){
                                    $scope.subFormPanel = "MigrationSummary";
                                    $scope.summaryInfo = data;
                                    MDMCfgDialog.closeDialog();
                                    if(data.results.database == ""){
                                        $scope.databaseStatus = "Migration not invoked";
                                    }else if(data.results.database == "false"){
                                        $scope.databaseStatus = "Upgraded With Errors"
                                    }else{
                                        $scope.databaseStatus = "Successfully Upgraded";
                                    }

                                    if(data.results.configValues == ""){
                                        $scope.configvalueStatus = "Migration not invoked";
                                    }else if(data.results.configValues == "false"){
                                        $scope.configvalueStatus = "Upgraded With Errors"
                                    }else{
                                        $scope.configvalueStatus = "Successfully Upgraded";
                                    }

                                    if(data.results.gdsnAddon == ""){
                                        $scope.gdsnAddonStatus = "Migration not invoked";
                                    }else if(data.results.gdsnAddon == "false"){
                                        $scope.gdsnAddonStatus = "Upgraded With Errors"
                                    }else{
                                        $scope.gdsnAddonStatus = "Successfully Upgraded";
                                    }

                                    if(data.results.rulesMigration == ""){
                                        $scope.rulesStatus = "Migration not invoked";
                                    }else if(data.results.rulesMigration == "false"){
                                        $scope.rulesStatus = "Upgraded With Errors"
                                    }else{
                                        $scope.rulesStatus = "Successfully Upgraded";
                                    }

                                    if(data.results.component == ""){
                                        $scope.componentStatus = "Migration not invoked";
                                    }else if(data.results.component == "false"){
                                        $scope.componentStatus = "Upgraded With Errors"
                                    }else{
                                        $scope.componentStatus = "Successfully Upgraded";
                                    }
                                },function(error){
                                    MDMCfgDialog.data["ignoreErrorMessage"] = error.fatalMessage;
                                })
                            }
                        }
                    }
                })
            });
        };

        $scope.closeButtonClick = function() {
            UXWizard.close();
            UXWizard.setData("migrationDetails", null);
            UXWizard.setData("migrationType", null);
            $route.reload();
        };

        $scope.previousButtonClick = function() {
            UXWizard.switchForm("IdentifyLocation");
            UXWizard.setData("migrationDetails", $scope.migrationDetails);
            UXWizard.setData("migrationType", $scope.migrationType);
        };

        $scope.checkCustom = function() {
            var checkCustomScope = $scope.migrationDetails.migrationWizard;
            if ($scope.migrationType === "customMigration") {
                $scope.checkCustomScope.migrationSetup.checkboxCustomDatabase = checkCustomScope.migrationSetup.databaseMigration;
                $scope.checkCustomScope.migrationSetup.checkboxCustomConfig = checkCustomScope.migrationSetup.configMigration;
                $scope.checkCustomScope.migrationSetup.checkboxCustomDependent = checkCustomScope.migrationSetup.dependentMigration;
                $scope.checkCustomScope.newVersion.checkboxCustomGDSNAddonFiles = checkCustomScope.newVersion.GDSN;
            } else {
                $scope.checkCustomScope.migrationSetup.checkboxCustomDatabase = false;
                $scope.checkCustomScope.migrationSetup.checkboxCustomConfig = false;
                $scope.checkCustomScope.migrationSetup.checkboxCustomDependent = false;
                $scope.checkCustomScope.newVersion.checkboxCustomGDSNAddonFiles = false;
            }
        };

        $scope.changeType = function(){
            if($scope.wizardChangeFlag){
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 3,
                    newItem : {
                        name : "defineDatabseMigration",
                        title : "Define Databse Migration",
                        templateUrl : "module/tibco.mdm.configurator/tools/migration/view/formPanel_4.html"
                    }
                });
                $scope.wizardChangeFlag = false;
            }
        };

        $scope.doWarining = function(){
            UXWizard.showInfoBar("error", $scope.local.doErrorInformation);
            $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                removeItem : "defineDatabseMigration"
            });

            $scope.wizardChangeFlag = true;
        };
    });
    
    //Define Database Migration
    util.createController("configurator.controller.tools.migration.formPanel4", [ "$scope", "UXWizard", "MDMCfgDialog", "Constant", "UXI18N", "ConfiguratorService", "$log", "MDMValidation", "$route"], function($scope, UXWizard, MDMCfgDialog, Constant, UXI18N, ConfiguratorService, $log, MDMValidation, $route) {
        var localNSPublic = "public";
        var localNS = "tools.migration";
        var localNSTip = "tools.migration.tip";
        $scope.subFormPanel = "defineDatabseMigration";
        $scope.local = {
            finish : UXI18N.getString(localNSPublic, "button.finish"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            close : UXI18N.getString(localNSPublic, "button.close"),
            open : UXI18N.getString(localNSPublic, "button.open"),
            dialogTitle : UXI18N.getString(localNS, "formPanel4.dialogTitle"),
            dialogSubTitle : UXI18N.getString(localNS, "formPanel4.dialogSubTitle"),
            title : UXI18N.getString(localNS, "formPanel4.title"),
            DBHost : UXI18N.getString(localNS, "formPanel4.DBHost"),
            DBPort : UXI18N.getString(localNS, "formPanel4.DBPort"),
            DBName : UXI18N.getString(localNS, "formPanel4.DBName"),
            userName : UXI18N.getString(localNS, "formPanel4.userName"),
            password : UXI18N.getString(localNS, "formPanel4.password"),
            DBHome : UXI18N.getString(localNS, "formPanel4.DBHome"),
            tabSpace : UXI18N.getString(localNS, "formPanel4.tabSpace"),
            serverName : UXI18N.getString(localNS, "formPanel4.serverName"),
            serverNameExample : UXI18N.getString(localNS, "formPanel4.serverNameExample"),
            summaryTitle : UXI18N.getString(localNS, "formPanel4.summaryTitle"),
            summaryInfo : UXI18N.getString(localNS, "formPanel4.summaryInfo"),
            migrationReport : UXI18N.getString(localNS, "formPanel4.migrationReport"),
            outputLogs : UXI18N.getString(localNS, "formPanel4.outputLogs"),
            databaseMigration : UXI18N.getString(localNS, "formPanel4.databaseMigration"),
            configValuesMigration : UXI18N.getString(localNS, "formPanel4.configValuesMigration"),
            DependentFilesMigration : UXI18N.getString(localNS, "formPanel4.DependentFilesMigration"),
            GDSNAddonFiles : UXI18N.getString(localNS, "formPanel4.GDSNAddonFiles"),
            rulesMigration : UXI18N.getString(localNS, "formPanel4.rulesMigration"),
            showErrorDialog : UXI18N.getString(localNS, "formPanel4.showErrorDialog"),
            numberFormat : UXI18N.getString(localNS, "formPanel4.NumberFormat"),
            abortButton : UXI18N.getString(localNS, "ignoreError.abortButton"),
            ignoreButton : UXI18N.getString(localNS, "ignoreError.ignoreButton"),
            migrationInProgress : UXI18N.getString(localNS, "formPanel3.migrationInProgress"),
            progressInformation : UXI18N.getString(localNS, "formPanel3.progressInformation")
        };
        $scope.tipInfo = {
            DBHost : UXI18N.getString(localNSTip, "DefineDBMigration.DBHost"),
            DBPort : UXI18N.getString(localNSTip, "DefineDBMigration.DBPort"),
            DBName : UXI18N.getString(localNSTip, "DefineDBMigration.DBName"),
            userName : UXI18N.getString(localNSTip, "DefineDBMigration.userName"),
            password : UXI18N.getString(localNSTip, "DefineDBMigration.password"),
            tabSpace : UXI18N.getString(localNSTip, "DefineDBMigration.tabSpace"),
            serverName : UXI18N.getString(localNSTip, "DefineDBMigration.serverName")
        };

        $scope.switchFlag = UXWizard.getData("newQueueForm1");
        $scope.migrationDetails = UXWizard.getData("migrationDetails");
        $scope.progressing = false;
        $scope.migrationDetails.migrationWizard.database.tablespace = "VELODBDATA1";
        var staticSettingData = tibco.ux.service.staticInfo.Setting;

        if(!staticSettingData.databaseMode){
            for(var i = 0, len = staticSettingData.deploymentTargets.length;i<len;i++){
                if(staticSettingData.deploymentTargets[i].name === "Database"){
                    staticSettingData.databaseMode = staticSettingData.deploymentTargets[i].value;
                    break;
                }
            }
        }

        $scope.migrationDetails.migrationWizard.database.databaseType.value = staticSettingData.databaseMode;

        switch(staticSettingData.databaseMode){
            case "SQLSERVER":
                $scope.migrationDetails.migrationWizard.database.port = "1433";
                break;
            case "ORACLE":
                $scope.migrationDetails.migrationWizard.database.port = "1521";
                break;
            case "POSTGRES":
                $scope.migrationDetails.migrationWizard.database.port = "5432";
                break;
        }

        var basicKey, SQLServerName, MDMTablespace;
        basicKey = [{
            key : "host",
            value : $scope.local.DBHost
        }, {
            key : "port",
            value : $scope.local.DBPort
        }, {
            key : "databaseName",
            value : $scope.local.DBName
        }, {
            key : "userName",
            value : $scope.local.userName
        }, {
            key : "password",
            value : $scope.local.password
        }];
        SQLServerName = [{
            key : "sqlInstance",
            value : $scope.local.serverName
        }];
        MDMTablespace = [{
            key : "tablespace",
            value : $scope.local.tabSpace
        }];

        function doValidation(arr, callback){
            MDMValidation.doValidate([{
                keys : arr,
                object: $scope.migrationDetails.migrationWizard.database,
                required: true
            }], function(){
                callback();
            }); 
        }

        $scope.checkNumber = function(e){
            if(e.keyCode === 8 || e.keyCode === 9 || e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 46)
                return;
            if(!((e.keyCode>=48 && e.keyCode<=57) || (e.keyCode>=96&&e.keyCode<=105))){
                e.preventDefault();
                UXWizard.showInfoBar("error",$scope.local.numberFormat);
            }
        };

        $scope.nextButtonClick = function() {
            doValidation(basicKey.concat(MDMTablespace), function(){
                $scope.progressing = true;
                var migrationType =  UXWizard.getData("migrationType");
                if(migrationType == "completeMigration"){
                    $scope.migrationDetails.migrationWizard.migrationSetup.databaseMigration = true;
                    $scope.migrationDetails.migrationWizard.migrationSetup.dependentMigration = true;
                    $scope.migrationDetails.migrationWizard.migrationSetup.configMigration = true;
                    $scope.migrationDetails.migrationWizard.migrationSetup.gdsnMigration = true;
                }

                function showSummary(data){
                    $scope.subFormPanel = "MigrationSummary";
                    $scope.summaryInfo = data;
                    MDMCfgDialog.closeDialog();
                    if(data.results.database == ""){
                        $scope.databaseStatus = "Migration not invoked";
                    }else if(data.results.database == "false"){
                        $scope.databaseStatus = "Upgraded With Errors"
                    }else{
                        $scope.databaseStatus = "Successfully Upgraded";
                    }

                    if(data.results.configValues == ""){
                        $scope.configvalueStatus = "Migration not invoked";
                    }else if(data.results.configValues == "false"){
                        $scope.configvalueStatus = "Upgraded With Errors"
                    }else{
                        $scope.configvalueStatus = "Successfully Upgraded";
                    }

                    if(data.results.gdsnAddon == ""){
                        $scope.gdsnAddonStatus = "Migration not invoked";
                    }else if(data.results.gdsnAddon == "false"){
                        $scope.gdsnAddonStatus = "Upgraded With Errors"
                    }else{
                        $scope.gdsnAddonStatus = "Successfully Upgraded";
                    }

                    if(data.results.rulesMigration == ""){
                        $scope.rulesStatus = "Migration not invoked";
                    }else if(data.results.rulesMigration == "false"){
                        $scope.rulesStatus = "Upgraded With Errors"
                    }else{
                        $scope.rulesStatus = "Successfully Upgraded";
                    }

                    if(data.results.component == ""){
                        $scope.componentStatus = "Migration not invoked";
                    }else if(data.results.component == "false"){
                        $scope.componentStatus = "Upgraded With Errors"
                    }else{
                        $scope.componentStatus = "Successfully Upgraded";
                    }
                }

                function migrationErrorAction(error){
                    MDMCfgDialog.data["ignoreErrorMessage"] = error.fatalMessage;
                    MDMCfgDialog.showDialog({
                        title: $scope.local.showErrorDialog,
                        templateUrl: "module/tibco.mdm.configurator/tools/migration/view/ignoreError.html",
                        width: 500,
                        height: 300,
                        buttons:{
                            button3: {
                                text : $scope.local.abortButton,
                                show : true,
                                method: function(){
                                    MDMCfgDialog.closeDialog();
                                }
                            },
                            button4: {
                                text: $scope.local.ignoreButton,
                                show: true,
                                method: function(){
                                    $scope.migrationDetails.migrationWizard.ignoreFiles.component = error.fatalMessage.component.concat(error.fatalMessage.previousComponent.component);
                                    ConfiguratorService.MigrationService({
                                        action:"completeMigration",
                                        migrationValues : angular.toJson($scope.migrationDetails)
                                    }).then(function(data){
                                        showSummary(data);
                                    },function(error){
                                        MDMCfgDialog.data["ignoreErrorMessage"] = error.fatalMessage;
                                        $scope.migrationDetails.migrationWizard.ignoreFiles.component = [];
                                        migrationErrorAction(error);
                                    })
                                }
                            }
                        } 
                    });
                }

                ConfiguratorService.MigrationService({
                    action: "startMigration",
                    migrationValues : angular.toJson($scope.migrationDetails)
                }).then(function(data){
                    $scope.progressing = false;
                    showSummary(data);
                },function(error){
                    $scope.progressing = false;
                    migrationErrorAction(error);
                });
            });
        };

        $scope.closeButtonClick = function() {
            UXWizard.close();
            UXWizard.setData("migrationDetails", null);
            $route.reload();
        };

        $scope.previousButtonClick = function() {
            UXWizard.switchForm(Constant.formSwitch.PREVIOUS_FORM);
            UXWizard.setData("migrationDetails", $scope.migrationDetails);
        };
    });
    
    //Ignore Error
    util.createController("configurator.controller.tools.migration.ignoreError", [ "$scope", "UXWizard", "MDMCfgDialog", "Constant", "UXI18N", "ConfiguratorService", "$log"], function($scope, UXWizard, MDMCfgDialog, Constant, UXI18N, ConfiguratorService, $log) {
        var localNS = "tools.migration";
        var localNSPublic = "public";
        $scope.local = {
            open : UXI18N.getString(localNSPublic, "button.open"),
            errorInformation : UXI18N.getString(localNS, "ignoreError.errorInformation"),
            logFileName : UXI18N.getString(localNS, "ignoreError.logFileName")
        };

        $scope.$watch(function(){
            return MDMCfgDialog.data.ignoreErrorMessage;
        }, function(){
            $scope.ignoreErrorMsg = MDMCfgDialog.data.ignoreErrorMessage;
        }, true);
    });
})();