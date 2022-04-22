(function(){

    var util = configurator.util;

    util.createController("configurator.controller.tools.setupDatabaseOracle", [ "$scope", "$rootScope", "FrameDialog" , "Constant", "UXWizard", "UXI18N"], function($scope, $rootScope, FrameDialog, Constant, UXWizard, UXI18N) {

        var staticSettingData = tibco.ux.service.staticInfo.Setting;
        if(!staticSettingData.databaseMode){
            for(var i = 0, len = staticSettingData.deploymentTargets.length;i<len;i++){
                if(staticSettingData.deploymentTargets[i].name === "Database"){
                    staticSettingData.databaseMode = staticSettingData.deploymentTargets[i].value;
                    break;
                }
            }
        }

        var databaseMode = tibco.ux.service.staticInfo.Setting.databaseMode;

        var localNS = "tools.setupDatabase";
        $scope.local = {
            title : UXI18N.getString(localNS, "title",[databaseMode]),
            title1 : UXI18N.getString(localNS, "DatabaseAccessMode.title"),
            leftPanelTitle1 : UXI18N.getString(localNS, "leftPanelTitle1"),
            leftPanelTitle2 : UXI18N.getString(localNS, "leftPanelTitle2"),
            leftPanelTitle3 : UXI18N.getString(localNS, "leftPanelTitle3"),
            leftPanelTitle4 : UXI18N.getString(localNS, "leftPanelTitle4"),
            leftPanelTitle5 : UXI18N.getString(localNS, "leftPanelTitle5"),
            leftPanelTitle6 : UXI18N.getString(localNS, "leftPanelTitle6"),
            leftPanelTitle7 : UXI18N.getString(localNS, "leftPanelTitle7")
        };

        $scope.wizardData = {
            title : $scope.local.title,
            forms : [ {
                name : "DatabaseAccessMode",
                title : $scope.local.leftPanelTitle1,
                templateUrl : "module/tibco.mdm.configurator/tools/setup_database/view/DatabaseAccessMode.html"
            }, {
                name : "DatabaseDetails",
                title : $scope.local.leftPanelTitle2,
                templateUrl : "module/tibco.mdm.configurator/tools/setup_database/view/DatabaseDetails.html"
            }, {
                name : "MDMInstanceDetails",
                title : $scope.local.leftPanelTitle4,
                templateUrl : "module/tibco.mdm.configurator/tools/setup_database/view/MDMInstanceDetails.html"
            } , {
                name : "StorageProfileDetails",
                title : $scope.local.leftPanelTitle5,
                templateUrl : "module/tibco.mdm.configurator/tools/setup_database/view/StorageProfileDetails.html"
            }, {
                name : "ConfirmStorageParameters",
                title : $scope.local.leftPanelTitle7,
                templateUrl : "module/tibco.mdm.configurator/tools/setup_database/view/ConfirmStorageParameters.html"
            } ]
        };
         

    });

    util.createController("configurator.controller.tools.setupDatabaseOracle.DatabaseAccessMode", [ "$scope", "$rootScope", "UXWizard", "Constant", "UXI18N" ], function($scope, $rootScope, UXWizard, Constant, UXI18N) {
        var localNS = "tools.setupDatabase";
        var localNSPublic = "public";
        var staticSettingData = tibco.ux.service.staticInfo.Setting;
        var databaseMode = tibco.ux.service.staticInfo.Setting.databaseMode;
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            leftDBDetails : UXI18N.getString(localNS, "leftPanelTitle2"),
            leftCreateNewMDMdatabaseUser : UXI18N.getString(localNS, "leftPanelTitle3"),
            title : UXI18N.getString(localNS, "DatabaseAccessMode.title"),
            info : UXI18N.getString(localNS, "DatabaseAccessMode.info", [databaseMode, databaseMode]),
            useExisting : UXI18N.getString(localNS, "DatabaseAccessMode.useExisting"),
            useExistingInfo1 : UXI18N.getString(localNS, "DatabaseAccessMode.useExistingInfo1"),
            useExistingInfo2 : UXI18N.getString(localNS, "DatabaseAccessMode.useExistingInfo2"),
            createNew : UXI18N.getString(localNS, "DatabaseAccessMode.createNew"),
            createNewInfo1 : UXI18N.getString(localNS, "DatabaseAccessMode.createNewInfo1"),
            createNewInfo2 : UXI18N.getString(localNS, "DatabaseAccessMode.createNewInfo2")
        };

        $scope.data = UXWizard.getData("dataOfSetupDatabaseOracle") || {
           values : {}
        };

        $scope.data.SkipUser = $scope.data.SkipUser || "true";

        $scope.data.values.DATABASETYPE = tibco.ux.service.staticInfo.Setting.databaseMode;

        $scope.changeMode = function(){
            if($scope.data.SkipUser === 'true'){
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "CreateNewMDMdatabaseUser"
                });
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 1,
                    newItem : {
                        name : "DatabaseDetails",
                        title : $scope.local.leftDBDetails,
                        templateUrl : "module/tibco.mdm.configurator/tools/setup_database/view/DatabaseDetails.html"
                    }
                });

            }else{
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "DatabaseDetails"
                });
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 1,
                    newItem : {
                        name : "CreateNewMDMdatabaseUser",
                        title : $scope.local.leftCreateNewMDMdatabaseUser,
                        templateUrl : "module/tibco.mdm.configurator/tools/setup_database/view/CreateNewMDMdatabaseUser.html"
                    } 
                });
            }
        };

        $scope.nextButtonClick = function() {
            $scope.data.values.SkipUser = $scope.data.SkipUser === "true" ? true : false;

            UXWizard.setData("dataOfSetupDatabaseOracle",angular.extend($scope.data,UXWizard.getData("dataOfSetupDatabaseOracle")));

            var nextFormName = $scope.data.SkipUser === "true" ? "DatabaseDetails" : "CreateNewMDMdatabaseUser";
            UXWizard.switchForm(nextFormName);
        };

        $scope.closeButtonClick = function() {
            UXWizard.setData("dataOfSetupDatabaseOracle",null);
            UXWizard.setData("staticDataForDatabaseOracle", null);
            UXWizard.close();
        };
        
    });

    util.createController("configurator.controller.tools.setupDatabaseOracle.DatabaseDetails", ["$http", "$scope", "UXWizard", "Constant", "UXI18N", "ConfiguratorService", "MDMValidation" ], function($http, $scope, UXWizard, Constant, UXI18N, ConfiguratorService, MDMValidation) {
        var databaseMode = tibco.ux.service.staticInfo.Setting.databaseMode;
        var localNS = "tools.setupDatabase";
        var localNSPublic = "public";
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "DatabaseDetails.title"),
            info : UXI18N.getString(localNS, "DatabaseDetails.info"),
            path : UXI18N.getString(localNS, "DatabaseDetails.path"),
            DBHost : UXI18N.getString(localNS, "DatabaseDetails.DBHost"),
            DBPort : UXI18N.getString(localNS, "DatabaseDetails.DBPort"),
            DBName :  UXI18N.getString(localNS, ((databaseMode === "ORACLE") ?"DatabaseDetails.DBNameForOracle" : "DatabaseDetails.DBName")),
            DBUserName : UXI18N.getString(localNS, "DatabaseDetails.DBUserName"),
            DBUserPassword : UXI18N.getString(localNS, "DatabaseDetails.DBUserPassword"),
            testButton : UXI18N.getString(localNS, "DatabaseDetails.testButton"),
            tableSpaceLocation : UXI18N.getString(localNS, "DatabaseDetails.tableSpaceLocation"),
            initialDatabase : UXI18N.getString(localNS, "DatabaseDetails.initialDatabase"),
            veloSchema : UXI18N.getString(localNS, "DatabaseDetails.veloSchema"),
            tableSpaceLocationVelodbData : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.tableSpaceLocationVelodbData"),
            tableSpaceLocationvelodbIndx : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.tableSpaceLocationvelodbIndx"),
            DBFileLocation : UXI18N.getString(localNS, "DatabaseDetails.DBFileLocation"),
            numberFormat : UXI18N.getString(localNS, "DatabaseDetails.NumberFormat"),
            connectionSuccessfully : UXI18N.getString(localNS, "connectionSuccessfully")
        };

        $scope.data = UXWizard.getData("dataOfSetupDatabaseOracle") || {};

        var staticInfoURL = "module/tibco.mdm.configurator/tools/setup_database/" + $scope.data.values.DATABASETYPE + ".json";

        function databaseAction(){
            var staticInfo = tibco.ux.service.staticInfo["SetupDatabaseFor" + $scope.data.values.DATABASETYPE];

            var basicKeys, newUserKeys;
            if(databaseMode === "SQLSERVER"){
                basicKeys = [{
                    key : "HOST",
                    value : $scope.local.DBHost
                },{
                    key : "PORT",
                    value : $scope.local.DBPort
                },{
                    key : "DATABASE",
                    value : $scope.local.DBName
                }, {
                    key : "USERNAME",
                    value : $scope.local.DBUserName
                }, {
                    key : "PASSWORD",
                    value : $scope.local.DBUserPassword
                }];

                newUserKeys = [{
                    key : "DATABASEFILELOC",
                    value : $scope.local.DBFileLocation
                }];
            } else {
                if(databaseMode === "ORACLE"){
                   basicKeys = [{
                           key : "HOST",
                           value : $scope.local.DBHost
                       },{
                           key : "PORT",
                           value : $scope.local.DBPort
                       },{
                           key : "DATABASE",
                           value : $scope.local.DBName
                       }, {
                           key : "USERNAME",
                           value : $scope.local.DBUserName
                       }, {
                           key : "PASSWORD",
                           value : $scope.local.DBUserPassword
                       }];
                       newUserKeys = [];
                } else {

                    basicKeys = [{
                        key : "HOST",
                        value : $scope.local.DBHost
                    },{
                        key : "PORT",
                        value : $scope.local.DBPort
                    },{
                        key : "DATABASE",
                        value : $scope.local.DBName
                    }, {
                        key : "USERNAME",
                        value : $scope.local.DBUserName
                    }, {
                        key : "PASSWORD",
                        value : $scope.local.DBUserPassword
                    }];

                    newUserKeys = [{
                          key : "VELOSCHEMA",
                          value : $scope.local.veloSchema
                       }, {
                           key : "TABLESPACELOCATIONvelodbData",
                           value : $scope.local.tableSpaceLocationVelodbData
                       }, {
                           key : "TABLESPACELOCATIONvelodbindx",
                           value : $scope.local.tableSpaceLocationvelodbIndx
                       }];
                }
            }

            function doValidation(arr, callback){
                MDMValidation.doValidate([{
                    keys : arr,
                    object: $scope.data.values,
                    required: true
                }], function(){
                    callback();
                }); 
            }

            $scope.testConnection = function(){
                doValidation(basicKeys, function(){
                    ConfiguratorService.SetupDatabaseService({
                        action: "testConnection",
                        values : angular.toJson($scope.data.values),
                        dbaUser: false
                    }, "DatabaseSetup.do").then(function(data){
                        UXWizard.showInfoBar("info", $scope.local.connectionSuccessfully);
                    },function(error){
                        UXWizard.showInfoBar("error",error);
                    });
                });
            };

            $scope.data.values.PORT = (databaseMode === "POSTGRES") ? "5432" : ((databaseMode === "ORACLE") ? "1521" : "1433");
            if(databaseMode === "SQLSERVER"){
                $scope.data.values.DATABASEFILELOC = staticInfo.tableSpaceValues[0].tableSpaceLocation;
            }

            $scope.checkNumber = function(e){
                if(e.keyCode === 8 || e.keyCode === 9 || e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 46)
                    return;
                if(!((e.keyCode>=48 && e.keyCode<=57) || (e.keyCode>=96&&e.keyCode<=105))){
                    e.preventDefault();
                    UXWizard.showInfoBar("error",$scope.local.numberFormat);
                }
            };

            $scope.previousButtonClick = function() {
                $scope.data.values = {};
                UXWizard.setData("dataOfSetupDatabaseOracle", angular.extend($scope.data, UXWizard.getData("dataOfSetupDatabaseOracle")));
                UXWizard.switchForm("DatabaseAccessMode");
            };

            $scope.nextButtonClick = function() {
                doValidation(basicKeys.concat(newUserKeys), function(){
                    UXWizard.setData("dataOfSetupDatabaseOracle",angular.extend($scope.data, UXWizard.getData("dataOfSetupDatabaseOracle")));
                    UXWizard.switchForm("MDMInstanceDetails");
                });
            };

            $scope.closeButtonClick = function() {

                UXWizard.setData("dataOfSetupDatabaseOracle",null);
                UXWizard.setData("staticDataForDatabaseOracle", null);
                UXWizard.close();
            };
        }

        if(tibco.ux.service.staticInfo && tibco.ux.service.staticInfo["SetupDatabaseFor"+$scope.data.values.DATABASETYPE]){
            databaseAction();
        }else{
            $http({method: 'GET', url: staticInfoURL}).
            success(function(data) {
                util.createNamespace("tibco.ux.service.staticInfo.SetupDatabaseFor" + $scope.data.values.DATABASETYPE, data);
                databaseAction();
            }).error(function(data) {

            });
        }
    });


    util.createController("configurator.controller.tools.setupDatabaseOracle.CreateNewMDMdatabaseUser", ["$http", "$scope", "UXWizard", "Constant", "UXI18N", "ConfiguratorService", "MDMValidation" ], function($http, $scope, UXWizard, Constant, UXI18N, ConfiguratorService,MDMValidation) {
        var databaseMode = tibco.ux.service.staticInfo.Setting.databaseMode;
        var localNS = "tools.setupDatabase";
        var localNSPublic = "public";
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.title"),
            info : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.info"),
            path : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.path"),
            DBHost : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.DBHost"),
            DBPort : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.DBPort"),
            DBName :  UXI18N.getString(localNS, ((databaseMode === "ORACLE") ? "CreateNewMDMdatabaseUser.DBNameForOracle" : "CreateNewMDMdatabaseUser.DBName")),
            DBAUserName : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.DBAUserName"),
            DBAUserPassword : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.DBAUserPassword"),
            newDBUserName : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.newDBUserName"),
            newDBUserPassword : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.newDBUserPassword"),
            newDBConfirmUserPassword : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.newDBConfirmUserPassword"),
            tableSpaceLocation : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.tableSpaceLocation"),
            initialDatabase : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.initialDatabase"),
            veloSchema : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.veloSchema"),
            tableSpaceLocationVelodbData : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.tableSpaceLocationVelodbData"),
            tableSpaceLocationvelodbIndx : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.tableSpaceLocationvelodbIndx"),
            newDBFileLocation : UXI18N.getString(localNS, "CreateNewMDMdatabaseUser.DBFileLocation"),
            testButton : UXI18N.getString(localNS, "DatabaseDetails.testButton"),
            numberFormat : UXI18N.getString(localNS, "DatabaseDetails.NumberFormat"),
            connectionSuccessfully : UXI18N.getString(localNS, "connectionSuccessfully")
        };

        $scope.data = UXWizard.getData("dataOfSetupDatabaseOracle");

        var staticInfoURL = "module/tibco.mdm.configurator/tools/setup_database/" + $scope.data.values.DATABASETYPE + ".json";

        function databaseAction(){
            var staticInfo = tibco.ux.service.staticInfo["SetupDatabaseFor" + $scope.data.values.DATABASETYPE];

            var basicKeys, newUserKeys;
            if(databaseMode === "ORACLE"){
                basicKeys =  [{
                    key : "HOST",
                    value : $scope.local.DBHost
                }, {
                    key : "PORT",
                    value : $scope.local.DBPort
                }, {
                    key : "DATABASE",
                    value : $scope.local.DBName
                }, {
                    key : "SYSUSERNAME",
                    value : $scope.local.DBAUserName
                }, {
                    key : "SYSPASSWORD",
                    value : $scope.local.DBAUserPassword
                }];

                newUserKeys = [{
                    key : "USERNAME",
                    value : $scope.local.newDBUserName
                }, {
                    key : "PASSWORD",
                    value : $scope.local.newDBUserPassword
                }];
            }else{
                basicKeys =  [{
                    key : "HOST",
                    value : $scope.local.DBHost
                }, {
                    key : "PORT",
                    value : $scope.local.DBPort
                }, {
                    key : "SYSUSERNAME",
                    value : $scope.local.DBAUserName
                }, {
                    key : "SYSPASSWORD",
                    value : $scope.local.DBAUserPassword
                }];

                if(databaseMode === "SQLSERVER"){
                    newUserKeys = [{
                        key : "DATABASE",
                        value : $scope.local.DBName
                    }, {
                        key : "USERNAME",
                        value : $scope.local.newDBUserName
                    }, {
                        key : "PASSWORD",
                        value : $scope.local.newDBUserPassword
                    } , {
                        key : "DATABASEFILELOC",
                        value : $scope.local.newDBFileLocation
                    }];
                } else{
                    newUserKeys = [{
                        key : "DATABASE",
                        value : $scope.local.DBName
                    }, {
                        key : "USERNAME",
                        value : $scope.local.newDBUserName
                    }, {
                        key : "PASSWORD",
                        value : $scope.local.newDBUserPassword
                    }, {
                        key : "INITIALDATABASE",
                        value : $scope.local.initialDatabase
                    }, {
                        key : "VELOSCHEMA",
                        value : $scope.local.veloSchema
                    }, {
                        key : "TABLESPACELOCATIONvelodbData",
                        value : $scope.local.tableSpaceLocationVelodbData
                    }, {
                        key : "TABLESPACELOCATIONvelodbindx",
                        value : $scope.local.tableSpaceLocationvelodbIndx
                    }];
                }    
            }

            function doValidation(arr, callback){
                MDMValidation.doValidate([{
                    keys : arr,
                    object: $scope.data.values,
                    required: true
                }], function(){
                    callback();
                }); 
            }

            $scope.data.values.PORT = (databaseMode === "POSTGRES") ? "5432" : ((databaseMode === "ORACLE") ? "1521" : "1433");
            if(databaseMode === "SQLSERVER"){
                $scope.data.values.DATABASEFILELOC = staticInfo.tableSpaceValues[0].tableSpaceLocation;
            }

            $scope.checkPassword = function(event, pwd, repwd){
                var obj = {
                    pwd : pwd,
                    repwd : repwd
                };

                MDMValidation.checkPassword([obj], function(){
                    //error callback
                }, function(){

                });
            };
            $scope.testConnection = function(){
                doValidation(basicKeys, function(){
                    ConfiguratorService.SetupDatabaseService({
                        action: "testConnection",
                        values : angular.toJson($scope.data.values),
                        dbaUser : true
                    }, "DatabaseSetup.do").then(function(data){
                        UXWizard.showInfoBar("info", $scope.local.connectionSuccessfully);
                    },function(error){
                        UXWizard.showInfoBar("error",error);
                    });
                });
            };

            $scope.checkNumber = function(e){
                if(e.keyCode === 8 || e.keyCode === 9 || e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 46)
                    return;
                if(!((e.keyCode>=48 && e.keyCode<=57) || (e.keyCode>=96&&e.keyCode<=105))){
                    e.preventDefault();
                    UXWizard.showInfoBar("error",$scope.local.numberFormat);
                }
            };

            $scope.nextButtonClick = function() {

                doValidation(basicKeys.concat(newUserKeys), function(){
                    UXWizard.setData("dataOfSetupDatabaseOracle",angular.extend($scope.data,UXWizard.getData("dataOfSetupDatabaseOracle")));
                    UXWizard.switchForm("MDMInstanceDetails");
                });

            };

            $scope.previousButtonClick = function() {
                $scope.data.values = {};
                UXWizard.setData("dataOfSetupDatabaseOracle",angular.extend($scope.data, UXWizard.getData("dataOfSetupDatabaseOracle")));
                UXWizard.switchForm("DatabaseAccessMode");
            };

            $scope.closeButtonClick = function() {
                // ConfiguratorService.SetupDatabaseService({
                //     action: "closeSetup"
                // }, "OracleSetup.do").then(function(data){});
                UXWizard.setData("dataOfSetupDatabaseOracle",null);
                UXWizard.setData("staticDataForDatabaseOracle", null);
                UXWizard.close();
            };
        }

        if(tibco.ux.service.staticInfo && tibco.ux.service.staticInfo["SetupDatabaseFor"+$scope.data.values.DATABASETYPE]){
            databaseAction();
        }else{
            $http({method: 'GET', url: staticInfoURL}).
            success(function(data) {
                util.createNamespace("tibco.ux.service.staticInfo.SetupDatabaseFor" + $scope.data.values.DATABASETYPE, data);
                databaseAction();
            }).error(function(data) {

            });
        }
    });


    util.createController("configurator.controller.tools.setupDatabaseOracle.MDMInstanceDetails", [ "$scope", "UXWizard", "Constant", "UXI18N", "ConfiguratorService", "MDMValidation", "MDMCfgDialog" ], function($scope, UXWizard, Constant, UXI18N, ConfiguratorService, MDMValidation, MDMCfgDialog) {
        var localNS = "tools.setupDatabase";
        var localNSPublic = "public";
        var databaseMode = tibco.ux.service.staticInfo.Setting.databaseMode;
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            install : UXI18N.getString(localNSPublic, "button.install"),
            title : UXI18N.getString(localNS, "MDMInstanceDetails.title"),
            info : UXI18N.getString(localNS, "MDMInstanceDetails.info"),
            name : UXI18N.getString(localNS, "MDMInstanceDetails.name"),
            description : UXI18N.getString(localNS, "MDMInstanceDetails.description"),
            finish : UXI18N.getString(localNSPublic, "button.finish"),
            finishTitle: UXI18N.getString(localNS, "title", [databaseMode])
        };

        $scope.data = UXWizard.getData("dataOfSetupDatabaseOracle");

        $scope.previousButtonClick = function() {
            UXWizard.setData("dataOfSetupDatabaseOracle",angular.extend($scope.data,UXWizard.getData("dataOfSetupDatabaseOracle")));
            var previousFormName = $scope.data.SkipUser === "true" ? "DatabaseDetails" : "CreateNewMDMdatabaseUser";
            UXWizard.switchForm(previousFormName);
        };

        $scope.nextButtonClick = function() {

            MDMValidation.doValidate([{
                keys : [{
                    key : "MDMINSTANCENAME",
                    value : $scope.local.name 
                }, {
                    key : "MDMINSTANCEDESC",
                    value : $scope.local.description
                }],
                object: $scope.data.values,
                required: true
            }], function(){
                UXWizard.setData("dataOfSetupDatabaseOracle",angular.extend($scope.data,UXWizard.getData("dataOfSetupDatabaseOracle")));
                UXWizard.switchForm("StorageProfileDetails");
            }); 
        };

        $scope.installButtonClick = function() {
                
            MDMValidation.doValidate([{
                keys : [{
                    key : "MDMINSTANCENAME",
                    value : $scope.local.name 
                }, {
                    key : "MDMINSTANCEDESC",
                    value : $scope.local.description
                }],
                object: $scope.data.values,
                required: true
            }], function(){ 
                UXWizard.close();

                MDMCfgDialog.showDialog({
                    title: $scope.local.finishTitle,
                    templateUrl: "module/tibco.mdm.configurator/tools/setup_database/view/MDMSeedDataSummary.html",
                    width: 950,
                    height: 500,
                    buttons:{
                        button3: {
                            text : "",
                            show : false
                        },
                        button4: {
                            text: $scope.local.finish,
                            show: true,
                            disabled: false,
                            method: function(){
                                MDMCfgDialog.closeDialog();
                            }
                        }
                    }
                });

                var data = {
                    values : $scope.data.values
                };

                MDMCfgDialog.data.dataOfSetupDBInstallForOracle = data;
                UXWizard.setData("dataOfSetupDatabaseOracle",null);
                UXWizard.setData("staticDataForDatabaseOracle", null);

            });

                
        }

        $scope.closeButtonClick = function() {
            UXWizard.setData("dataOfSetupDatabaseOracle",null);
            UXWizard.setData("staticDataForDatabaseOracle", null);
            UXWizard.close();
        };
        
    });


    util.createController("configurator.controller.tools.setupDatabaseOracle.StorageProfileDetails", [ "$scope", "$rootScope", "UXWizard", "Constant", "UXI18N", "ConfiguratorService" ], function($scope, $rootScope, UXWizard, Constant, UXI18N, ConfiguratorService) {
        var localNS = "tools.setupDatabase";
        var localNSPublic = "public";
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "StorageProfileDetails.title"),
            info : UXI18N.getString(localNS, "StorageProfileDetails.info"),
            typical : UXI18N.getString(localNS, "StorageProfileDetails.typical"),
            typicalInforText : UXI18N.getString(localNS, "StorageProfileDetails.typicalInforText"),
            custom : UXI18N.getString(localNS, "StorageProfileDetails.custom"),
            customInforText : UXI18N.getString(localNS, "StorageProfileDetails.customInforText")
        };

        $scope.data = UXWizard.getData("dataOfSetupDatabaseOracle");

        $scope.changeProfile = function() {
            if($scope.data.storageProfile === "typical"){
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "CustomProfileSetup"
                });
            }else{
               $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 4,
                    newItem : {
                        name : "CustomProfileSetup",
                        title : "Custom Profile Setup",
                        templateUrl : "module/tibco.mdm.configurator/tools/setup_database/view/CustomProfileSetup.html"
                    }
                }); 
            }
        };

        $scope.nextButtonClick = function() {
            UXWizard.setData("dataOfSetupDatabaseOracle",angular.extend($scope.data,UXWizard.getData("dataOfSetupDatabaseOracle")));
            var nextFormName = $scope.data.storageProfile === "typical" ? "ConfirmStorageParameters" : "CustomProfileSetup";
            UXWizard.switchForm(nextFormName);
        };

        $scope.previousButtonClick = function() {
            var previousFormName = "MDMInstanceDetails";
            UXWizard.setData("dataOfSetupDatabaseOracle",angular.extend($scope.data, UXWizard.getData("dataOfSetupDatabaseOracle")));
            UXWizard.switchForm(previousFormName);
        };

        $scope.closeButtonClick = function() {
            UXWizard.setData("dataOfSetupDatabaseOracle",null);
            UXWizard.setData("staticDataForDatabaseOracle", null);
            UXWizard.close();
        };

    });

    util.createController("configurator.controller.tools.setupDatabaseOracle.CustomProfileSetup", [ "$scope","UXWizard", "Constant", "UXI18N", "$http", "ConfiguratorService" ], function($scope, UXWizard, Constant, UXI18N, $http, ConfiguratorService) {
        var localNS = "tools.setupDatabase";
        var localNSPublic = "public";
        
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            numberFormat : UXI18N.getString(localNS, "DatabaseDetails.NumberFormat"),
            title : UXI18N.getString(localNS, "CustomProfileSetup.title"),
            info : UXI18N.getString(localNS, "CustomProfileSetup.info"),
            description : UXI18N.getString(localNS, "CustomProfileSetup.tableDescription"),
            name : UXI18N.getString(localNS, "CustomProfileSetup.tableName"),
            maxSize : UXI18N.getString(localNS, "CustomProfileSetup.tableMaxSize"),
            location : UXI18N.getString(localNS, "CustomProfileSetup.tableLocation"),
            file : UXI18N.getString(localNS, "CustomProfileSetup.tableFile")
        };

        $scope.data = UXWizard.getData("dataOfSetupDatabaseOracle");
        
        $scope.checkMaxSize = function(e){
            if(e.keyCode === 8 || e.keyCode === 9  || e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 46)
                return;
            if(!((e.keyCode>=48 && e.keyCode<=57) || (e.keyCode>=96&&e.keyCode<=105))){
                e.preventDefault();
                UXWizard.showInfoBar("error",$scope.local.numberFormat);
            }
        };

        var staticInfoURL = "module/tibco.mdm.configurator/tools/setup_database/" +$scope.data.values.DATABASETYPE+ ".json";

        function databaseAction() {
            var staticInfo = tibco.ux.service.staticInfo["SetupDatabaseFor" + $scope.data.values.DATABASETYPE];

            if($scope.data.values.DATABASETYPE === "POSTGRES") {
                if(!UXWizard.getData("staticDataForDatabaseOracle")) {
                    staticInfo.tableSpaceValues[0].tableSpaceLocation = $scope.data.values.TABLESPACELOCATIONvelodbData || staticInfo.tableSpaceValues[0].tableSpaceLocation;
                    staticInfo.tableSpaceValues[1].tableSpaceLocation = $scope.data.values.TABLESPACELOCATIONvelodbindx || staticInfo.tableSpaceValues[1].tableSpaceLocation;
                }else{
                    staticInfo.tableSpaceValues[0].tableSpaceLocation = UXWizard.getData("staticDataForDatabaseOracle").tableSpaceValues[0].tableSpaceLocation;
                    staticInfo.tableSpaceValues[1].tableSpaceLocation = UXWizard.getData("staticDataForDatabaseOracle").tableSpaceValues[1].tableSpaceLocation;
                } 
            }

            if($scope.data.values.DATABASETYPE === "SQLSERVER"){
                if(!UXWizard.getData("staticDataForDatabaseOracle")){
                    staticInfo.tableSpaceValues[0].tableSpaceLocation = $scope.data.values.DATABASEFILELOC;
                    staticInfo.tableSpaceValues[1].tableSpaceLocation = $scope.data.values.DATABASEFILELOC;
                }else{
                    staticInfo.tableSpaceValues[0].tableSpaceLocation = UXWizard.getData("staticDataForDatabaseOracle").tableSpaceValues[0].tableSpaceLocation;
                    staticInfo.tableSpaceValues[1].tableSpaceLocation = UXWizard.getData("staticDataForDatabaseOracle").tableSpaceValues[1].tableSpaceLocation;
                }
            }

            $scope.staticData = UXWizard.getData("staticDataForDatabaseOracle") || staticInfo;

            $scope.nextButtonClick = function() {
                $scope.data.tableSpaceValues = $scope.staticData;
                UXWizard.setData("staticDataForDatabaseOracle", angular.extend($scope.staticData, UXWizard.getData("staticDataForDatabaseOracle")));

                UXWizard.setData("dataOfSetupDatabaseOracle",angular.extend($scope.data,UXWizard.getData("dataOfSetupDatabaseOracle")));
                UXWizard.switchForm("ConfirmStorageParameters");
            };

            $scope.previousButtonClick = function() {
                UXWizard.setData("staticDataForDatabaseOracle", angular.extend($scope.staticData, UXWizard.getData("staticDataForDatabaseOracle")));
                UXWizard.setData("dataOfSetupDatabaseOracle",angular.extend($scope.data,UXWizard.getData("dataOfSetupDatabaseOracle")));
                UXWizard.switchForm("StorageProfileDetails");
            };

            $scope.closeButtonClick = function() {
                UXWizard.setData("dataOfSetupDatabaseOracle",null);
                UXWizard.setData("staticDataForDatabaseOracle",null);
                UXWizard.close();
            };

        }

        if(tibco.ux.service.staticInfo && tibco.ux.service.staticInfo["SetupDatabaseFor" + $scope.data.values.DATABASETYPE]){
            databaseAction();
        }else{
            $http({method: 'GET', url: staticInfoURL}).
            success(function(data) {
                util.createNamespace("tibco.ux.service.staticInfo.SetupDatabaseFor" + $scope.data.values.DATABASETYPE, data);
                databaseAction();
            }).
            error(function(data) {

            });
        }

    });

    util.createController("configurator.controller.tools.setupDatabaseOracle.ConfirmStorageParameters", [ "$scope", "$rootScope", "UXWizard", "Constant", "UXI18N", "ConfiguratorService", "$http","MDMCfgDialog" ], function($scope, $rootScope, UXWizard, Constant, UXI18N, ConfiguratorService, $http, MDMCfgDialog) {
        var localNS = "tools.setupDatabase";
        var localNSPublic = "public";
        var databaseMode = tibco.ux.service.staticInfo.Setting.databaseMode;
        $scope.local = {
            install : UXI18N.getString(localNSPublic, "button.install"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            finish : UXI18N.getString(localNSPublic, "button.finish"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "ConfirmStorageParameters.title"),
            info : UXI18N.getString(localNS, "ConfirmStorageParameters.info"),
            description : UXI18N.getString(localNS, "ConfirmStorageParameters.tableDescription"),
            name : UXI18N.getString(localNS, "ConfirmStorageParameters.tableName"),
            maxSize : UXI18N.getString(localNS, "ConfirmStorageParameters.tableMaxSize"),
            location : UXI18N.getString(localNS, "ConfirmStorageParameters.tableLocation"),
            file : UXI18N.getString(localNS, "ConfirmStorageParameters.tableFile"),
            finishTitle: UXI18N.getString(localNS, "title", [databaseMode])
        };
        
        $scope.data = UXWizard.getData("dataOfSetupDatabaseOracle");
        var staticInfoURL = "module/tibco.mdm.configurator/tools/setup_database/"+$scope.data.values.DATABASETYPE+".json";

        function databaseAction(){
            var staticInfo = tibco.ux.service.staticInfo["SetupDatabaseFor" + $scope.data.values.DATABASETYPE];

            if($scope.data.values.DATABASETYPE === "POSTGRES") {
                if(!UXWizard.getData("staticDataForDatabaseOracle")) {
                    staticInfo.tableSpaceValues[0].tableSpaceLocation = $scope.data.values.TABLESPACELOCATIONvelodbData || staticInfo.tableSpaceValues[0].tableSpaceLocation;
                    staticInfo.tableSpaceValues[1].tableSpaceLocation = $scope.data.values.TABLESPACELOCATIONvelodbindx || staticInfo.tableSpaceValues[1].tableSpaceLocation;
                }else{
                    staticInfo.tableSpaceValues[0].tableSpaceLocation = UXWizard.getData("staticDataForDatabaseOracle").tableSpaceValues[0].tableSpaceLocation;
                    staticInfo.tableSpaceValues[1].tableSpaceLocation = UXWizard.getData("staticDataForDatabaseOracle").tableSpaceValues[1].tableSpaceLocation;
                }  
            }

            if($scope.data.values.DATABASETYPE === "SQLSERVER"){
                if(!UXWizard.getData("staticDataForDatabaseOracle")){
                    staticInfo.tableSpaceValues[0].tableSpaceLocation = $scope.data.values.DATABASEFILELOC;
                    staticInfo.tableSpaceValues[1].tableSpaceLocation = $scope.data.values.DATABASEFILELOC;
                }else{
                    staticInfo.tableSpaceValues[0].tableSpaceLocation = UXWizard.getData("staticDataForDatabaseOracle").tableSpaceValues[0].tableSpaceLocation;
                    staticInfo.tableSpaceValues[1].tableSpaceLocation = UXWizard.getData("staticDataForDatabaseOracle").tableSpaceValues[1].tableSpaceLocation;
                }
            }

            $scope.staticData = UXWizard.getData("staticDataForDatabaseOracle") || staticInfo;

            $scope.installButtonClick = function() {
                if(!$scope.data.tableSpaceValues){
                    $scope.data.tableSpaceValues = $scope.staticData;
                }

                UXWizard.close();

                MDMCfgDialog.showDialog({
                    title: $scope.local.finishTitle,
                    templateUrl: "module/tibco.mdm.configurator/tools/setup_database/view/MDMSeedDataSummary.html",
                    width: 950,
                    height: 500,
                    buttons:{
                        button3: {
                            text : "",
                            show : false
                        },
                        button4: {
                            text: $scope.local.finish,
                            show: false,
                            disabled: false,
                            method: function(){
                                MDMCfgDialog.closeDialog();
                            }
                        }
                    }
                });

                var data = {
                    values : $scope.data.values,
                    tableSpaceValues : $scope.data.tableSpaceValues
                };

                MDMCfgDialog.data.dataOfSetupDBInstallForOracle = data;
                UXWizard.setData("dataOfSetupDatabaseOracle",null);
                UXWizard.setData("staticDataForDatabaseOracle", null);

                
            };

            $scope.previousButtonClick = function() {
                var previousFormName = $scope.data.storageProfile === "typical" ? "StorageProfileDetails" : "CustomProfileSetup";
                UXWizard.setData("dataOfSetupDatabaseOracle",angular.extend($scope.data, UXWizard.getData("dataOfSetupDatabaseOracle")));
                UXWizard.switchForm(previousFormName);
            };

            $scope.closeButtonClick = function() {
                // ConfiguratorService.SetupDatabaseService({
                //     action: "closeSetup"
                // }, "OracleSetup.do").then(function(data){});
                UXWizard.setData("dataOfSetupDatabaseOracle",null);
                UXWizard.setData("staticDataForDatabaseOracle",null);
                UXWizard.close();
            };
        }
        
        

        if(tibco.ux.service.staticInfo && tibco.ux.service.staticInfo["SetupDatabaseFor"+$scope.data.values.DATABASETYPE]){
            databaseAction();
        }else{
            $http({method: 'GET', url: staticInfoURL}).
            success(function(data) {
                util.createNamespace("tibco.ux.service.staticInfo.SetupDatabaseFor" + $scope.data.values.DATABASETYPE, data);
                databaseAction();
            }).error(function(data) {

            });
        }

    });

    
    util.createController("configurator.controller.tools.setupDatabaseOracle.MDMSeedDataSummary", ["$rootScope", "$scope","UXWizard", "Constant", "UXI18N", "$http", "ConfiguratorService", "MDMCfgDialog" ], function($rootScope, $scope, UXWizard, Constant, UXI18N, $http, ConfiguratorService, MDMCfgDialog) {
        var localNSPublic = "public";
        var localNS = "tools.setupDatabase";
        $scope.local = {
            open : UXI18N.getString(localNSPublic, "button.open"),
            showSummaryTitle : UXI18N.getString(localNS, "MDMSeedDataSummary.showSummary.title"),
            showSummaryReport : UXI18N.getString(localNS, "MDMSeedDataSummary.showSummary.report"),
            showSummarySeedDataCreation: UXI18N.getString(localNS, "MDMSeedDataSummary.showSummary.seedDataCreation"),
            tablespaceErrorCount : UXI18N.getString(localNS, "MDMSeedDataSummary.showSummary.tablespaceErrorCount"),
            tablespaceLogFile : UXI18N.getString(localNS, "MDMSeedDataSummary.showSummary.tablespaceLogFile"),
            seedDataErrorCount : UXI18N.getString(localNS, "MDMSeedDataSummary.showSummary.seedDataErrorCount"),
            seedDataLogFile : UXI18N.getString(localNS, "MDMSeedDataSummary.showSummary.seedDataLogFile"),
            hideShowSummaryTitle : UXI18N.getString(localNS, "MDMSeedDataSummary.hideShowSummary.title"),
            hideShowSummaryContent : UXI18N.getString(localNS, "MDMSeedDataSummary.hideShowSummary.content")
        };

        $scope.showSummary = false;

        $scope.databasetype = MDMCfgDialog.data.dataOfSetupDBInstallForOracle.values.DATABASETYPE;

        ConfiguratorService.SetupDatabaseService({
            action: "installSeedData",
            values : angular.toJson(MDMCfgDialog.data.dataOfSetupDBInstallForOracle.values),
            tableSpaceValues : angular.toJson(MDMCfgDialog.data.dataOfSetupDBInstallForOracle.tableSpaceValues)
        }, "DatabaseSetup.do").then(function(data){
            $rootScope.$broadcast("cfg_common_dialog_showBtn", 4);
            $scope.showSummary = true;
            $scope.data = data;
            $scope.data.seeddata = "Success";

        },function(error){
            $rootScope.$broadcast("cfg_common_dialog_showBtn", 4);
            $scope.showSummary = true;
            $scope.data = error;
            $scope.data.seeddata = "Failed";
        });

            {
				var staticInfoURL = "module/tibco.mdm.configurator/tools/setup_database/" +tibco.ux.service.staticInfo.Setting.databaseMode+ ".json";
                 $http({method: 'GET', url: staticInfoURL}).
                 success(function(data) {
                     util.createNamespace("tibco.ux.service.staticInfo.SetupDatabaseFor" + tibco.ux.service.staticInfo.Setting.databaseMode, data,true);
                 }).error(function(data) {

                 });
             }
    });

    

})();