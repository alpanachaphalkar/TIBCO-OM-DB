(function() {
    var util = configurator.util;

    util.createController("configurator.controller.tools.Setup_Wizard", [ "$scope", "$rootScope", "FrameDialog" ,"UXI18N"], function($scope, $rootScope,FrameDialog,UXI18N) {
		var localNS = "tools.setupWizard";
		$scope.oms="false";
		$scope.ocs="false";
		$scope.omsConfiguration="false";
        $scope.local = {
            title : UXI18N.getString(localNS, "title")            
        };
        $scope.wizardData = {
            title : $scope.local.title,
            forms : [ {
                name : "Setup Options",
                title : "Setup Options",
                templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/Setup_Options.html"
            },{
                name : "StorageProfileDetails",
                title : "StorageProfileDetails",
                templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/StorageProfileDetails.html"
            },{
                name : "DefaultTablespace",
                title : "DefaultTablespace",
                templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/defaultTablespace.html"
            },{			
                name : "Message Configuration",
                title : "Message Configuration",
                templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/mesgConfiguration.html"
                   
			}]
        };
    }); 
	
	
	util.createController("configurator.controller.tools.Setup_Wizard.Setup_Options", [ "$scope", "$rootScope", "UXWizard", "Constant", "UXI18N" ], function($scope, $rootScope, UXWizard, Constant, UXI18N) {
        var localNS = "tools.setupWizard";
		var localNSPublic = "public";             
        $scope.local = {    
			next : 	UXI18N.getString(localNSPublic, "button.next"),
			cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            title : UXI18N.getString(localNS, "SetupOptions.title"),
			info : UXI18N.getString(localNS, "SetupOptions.info"),
			dbConfig : UXI18N.getString(localNS, "SetupOptions.dbConfig"),
			dbConfigInfo1 : UXI18N.getString(localNS, "SetupOptions.dbConfigInfo1"),
			dbConfigInfo2 : UXI18N.getString(localNS, "SetupOptions.dbConfigInfo2"),
			msgConfig : UXI18N.getString(localNS, "SetupOptions.msgConfig"),
			msgConfigInfo1 : UXI18N.getString(localNS, "SetupOptions.msgConfigInfo1"),
			msgConfigInfo2 : UXI18N.getString(localNS, "SetupOptions.msgConfigInfo2")
        };

        $scope.data = UXWizard.getData("dataOfSetup_Wizard") || {
           values : {}
        };
        
        $scope.nextButtonClick = function() {
            $scope.data.values.dbConfig = $scope.data.dbConfig === "true" ? true : false;
            UXWizard.setData("dataOfSetup_Wizard",angular.extend($scope.data,UXWizard.getData("dataOfSetup_Wizard")));			
			if($scope.data.dbConfig === 'true' || $scope.data.msgConfig === 'true'){
             if($scope.data.dbConfig === 'true'){ 
				 if($scope.data.msgConfig === 'true')
						$rootScope.omsConfiguration = "true";
				 else 
						$rootScope.omsConfiguration = "false";
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 1,
                    newItem : {
                       name : "DBConfiguration",
					   title : "DBConfiguration",
                       templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/DBConfiguration.html"
                    } 
                });
             }else{ 
				$rootScope.omsConfiguration = "false";
				$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "StorageProfileDetails"
				});
				$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "DefaultTablespace"
				});               
             }	
			 $scope.data.values.msgConfiguration=$rootScope.omsConfiguration === "true" ? true:false;
             var nextFormName = $scope.data.dbConfig === "true" ? "DBConfiguration" : "Message Configuration";
             UXWizard.switchForm(nextFormName);
			}else
			  UXWizard.showInfoBar("info", "No Selection Done");
        };

        $scope.closeButtonClick = function() {
            UXWizard.setData("dataOfSetup_Wizard",null);
            UXWizard.setData("staticDataForDatabaseOracle", null);
            UXWizard.close();
        };
        
    });
	
	
	
	
	
	//////////////////////////////////////////////////////////////////////
	
	
	 util.createController("configurator.controller.tools.Setup_Wizard.mesgConfiguration", [ "$scope","$rootScope","UXWizard", "Constant", "UXI18N" ,"ConfiguratorService", "MDMValidation","MDMCfgDialog" ], function($scope, $rootScope,UXWizard, Constant, UXI18N, ConfiguratorService, MDMValidation,MDMCfgDialog) {
	 
	  var localNS = "tools.setupWizard";
	  var localNSPublic = "public";		
        
        $scope.local = {    
			next : 	UXI18N.getString(localNSPublic, "button.next"),
			cancel : UXI18N.getString(localNSPublic, "button.cancel"),
			install : UXI18N.getString(localNSPublic, "button.install"),
			previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "mesgConfig.title"),
			info : UXI18N.getString(localNS, "mesgConfig.info"),
			host : UXI18N.getString(localNS, "mesgConfig.EMS_HOST"),
			port : UXI18N.getString(localNS, "mesgConfig.EMS_PORT"),
			username : UXI18N.getString(localNS, "mesgConfig.EMS_USERNAME"),
			password : UXI18N.getString(localNS, "mesgConfig.EMS_PASSWORD")			
        };
		$scope.data = UXWizard.getData("dataOfSetup_Wizard") || {};
		
        function doValidation(callback){
			if($scope.data.msgvalues==null){
				$scope.data.msgvalues=new Object();
			}
            MDMValidation.doValidate([{
                keys : [{
                    key : "HOST",
                    value : $scope.local.host
                },{
                    key : "PORT",
                    value : $scope.local.port 
                }, {
                    key : "USERNAME",
                    value :$scope.local.username 
                }, {
                    key : "PASSWORD",
                    value : $scope.local.password 
                }],
                object: $scope.data.msgvalues,
                required: true
            }], function(){
                callback();
            }); 
        }
		
		$scope.installButtonClick = function() {	
			doValidation(function(){			
                UXWizard.close();
                MDMCfgDialog.showDialog({
                    title: "Message Setup",
                    templateUrl: "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/MessagingConfigSummary.html",
                    width: 950,
                    height: 500,
                    buttons:{
                        button3: {
                            text : "",
                            show : false
                        },
                        button4: {
                            text: "Finish",
                            show: true,
                            disabled: false,
                            method: function(){
                                MDMCfgDialog.closeDialog();
                            }
                        }
                    }
                });

                var data = {
                    values : $scope.data.msgvalues
                };

                MDMCfgDialog.data.dataOfSetupMessaging = data;
                UXWizard.setData("dataOfSetup_Wizard",null);
			}); 				
		};
		

        $scope.previousButtonClick = function() {    
				
			$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 1,
                    newItem : {
                        name : "StorageProfileDetails",
						title : "StorageProfileDetails",
						templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/StorageProfileDetails.html"
                    } 
            });
			$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 2,
                    newItem : {
						name : "DefaultTablespace",
						title : "DefaultTablespace",
						templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/defaultTablespace.html"
					}
            });				
			UXWizard.switchForm("Setup Options");
        };
		$scope.closeButtonClick = function() {
            UXWizard.close();
        };
        var data = UXWizard.getData("Setup_Options"); 
    });

	
	util.createController("configurator.controller.tools.Setup_Wizard.DBConfiguration", [ "$scope", "$rootScope", "UXWizard", "Constant", "UXI18N" ,"MDMValidation"], function($scope, $rootScope, UXWizard, Constant, UXI18N,MDMValidation) {
		
		var localNSPublic = "public";		
		$scope.local = {    
			next : 	UXI18N.getString(localNSPublic, "button.next"),
			cancel : UXI18N.getString(localNSPublic, "button.cancel"),
			previous : UXI18N.getString(localNSPublic, "button.previous"),
        };
		$scope.data = UXWizard.getData("dataOfSetup_Wizard") || {
           values : {}
        };	
		 $scope.data.SkipUser="true";
		 $scope.data.SkipUser1="true";
		 $scope.nextButtonClick = function() {
		     
			$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "Database Access Mode OMS"
			});
			$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "Database Details OMS"
			});
			$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "Create New Database User OMS"
			});
			$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "Database Access Mode OCS"
			});
			$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "Database Details OCS"
			});	
			$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "Database Configuration"
			});
			$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "Create New Database User OCS"
			});
					
			if($scope.data.oms === 'true' && $scope.data.ocs === 'true'){
				$rootScope.oms="true";
				$rootScope.ocs="true";
				$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 2,
                    newItem : {
                       name : "Database Access Mode OMS",
					   title : "Database Access Mode OMS",
                       templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/Database_Access_Mode.html"
                    } 
                });
				
				$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 3,
                    newItem : {
                       name : "Database Details OMS",
					   title : "Database Details OMS",
					   templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/Database_Details.html"
                    } 
                });
				  $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 4,
                    newItem : {
                       name : "Database Access Mode OCS",
					   title : "Database Access Mode OCS",
                       templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/Database_Access_Mode_OCS.html"
                    } 
                });
				
				$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 5,
                    newItem : {
                       name : "Database Details OCS",
					   title : "Database Details OCS",
					   templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/Database_Details_OCS.html"
                    } 
                });
				$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 6,
                    newItem : {
                       name : "Database Configuration",
					   title : "Database Configuration",
					   templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/Database_Configuration.html"
                    } 
                });
				 UXWizard.switchForm(Constant.formSwitch.NEXT_FORM);
			}
			else if($scope.data.oms === 'true'){				
				$rootScope.oms="true";
				$rootScope.ocs="false";			
				$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 2,
                    newItem : {
                       name : "Database Access Mode OMS",
					   title : "Database Access Mode OMS",
                       templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/Database_Access_Mode.html"
                    } 
                });
				
				$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 3,
                    newItem : {
                       name : "Database Details OMS",
					   title : "Database Details OMS",
					   templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/Database_Details.html"
                    } 
                });
				$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 4,
                    newItem : {
                       name : "Database Configuration",
					   title : "Database Configuration",
					   templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/Database_Configuration.html"
                    } 
                });
				 UXWizard.switchForm(Constant.formSwitch.NEXT_FORM);
			}else if($scope.data.ocs === 'true'){						
				$rootScope.oms="false";
				$rootScope.ocs="true";
			    $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 2,
                    newItem : {
                       name : "Database Access Mode OCS",
					   title : "Database Access Mode OCS",
                       templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/Database_Access_Mode_OCS.html"
                    } 
                });
				
				$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 3,
                    newItem : {
                       name : "Database Details OCS",
					   title : "Database Details OCS",
					   templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/Database_Details_OCS.html"
                    } 
                });
				$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 4,
                    newItem : {
                       name : "Database Configuration",
					   title : "Database Configuration",
					   templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/Database_Configuration.html"
                    } 
                });
				 UXWizard.switchForm(Constant.formSwitch.NEXT_FORM);
			}else{
					UXWizard.showInfoBar("info", "No Selection Done");
			}
			$scope.data.values.omsuser=$rootScope.oms === "true" ? true:false;
			$scope.data.values.ocsuser=$rootScope.ocs === "true" ? true:false;			
        };
		$scope.closeButtonClick = function() {
            UXWizard.setData("dataOfSetup_Wizard",null);           
            UXWizard.close();
        };
		$scope.previousButtonClick = function() {
			$rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "DBConfiguration"
            });					
			UXWizard.switchForm(Constant.formSwitch.PREVIOUS_FORM);
        };
	 });
   
   
   util.createController("configurator.controller.tools.Setup_Wizard.Database_Access_Mode", [ "$scope", "$rootScope", "UXWizard", "Constant", "UXI18N" ,"MDMValidation"], function($scope, $rootScope, UXWizard, Constant, UXI18N,MDMValidation) {
   
		var localNS = "tools.setupWizard";
        var localNSPublic = "public";        
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
			previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "DatabaseAccessMode.title"),
            info : UXI18N.getString(localNS, "DatabaseAccessMode.info"),
			profile : UXI18N.getString(localNS, "DatabaseAccessMode.profile"),
            useExisting : UXI18N.getString(localNS, "DatabaseAccessMode.useExisting"),
            useExistingInfo1 : UXI18N.getString(localNS, "DatabaseAccessMode.useExistingInfo1"),
            useExistingInfo2 : UXI18N.getString(localNS, "DatabaseAccessMode.useExistingInfo2"),
            createNew : UXI18N.getString(localNS, "DatabaseAccessMode.createNew"),
            createNewInfo1 : UXI18N.getString(localNS, "DatabaseAccessMode.createNewInfo1"),
            createNewInfo2 : UXI18N.getString(localNS, "DatabaseAccessMode.createNewInfo2"),
			createNewInfo3 : UXI18N.getString(localNS, "DatabaseAccessMode.createNewInfo3")
        };

		
		var staticSettingData = tibco.ux.service.staticInfo.Setting;
        var databaseMode = tibco.ux.service.staticInfo.Setting.databaseMode;
		$scope.data = UXWizard.getData("dataOfSetup_Wizard") || {
           values : {}
        };

        $scope.data.SkipUser = $scope.data.SkipUser || "true";
		

        $scope.data.values.DATABASETYPE = tibco.ux.service.staticInfo.Setting.databaseMode;

		function doValidation(callback){
            MDMValidation.doValidate([{
                keys : [{
                    key : "profileAlias",
                    value : $scope.local.profile
                }],
                object: $scope.data,
                required: true
            }], function(){
                callback();
            }); 
        }
        $scope.changeMode = function(){
            if($scope.data.SkipUser === 'true'){
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "Create New Database User OMS"
                });
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                   position : 3,
                    newItem : {
                       name : "Database Details OMS",
						title : "Database Details OMS",
						templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/Database_Details.html"
                   }
                });

            }else{
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "Database Details OMS"
                });
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 3,
                    newItem : {
                        name : "Create New Database User OMS",
                        title : "Create New Database User OMS",
                        templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/Create_New_Database_User.html"
                    } 
                });
            }
        };

        $scope.nextButtonClick = function() {
		
			doValidation(function(){
				$scope.data.values.SkipUser = $scope.data.SkipUser === "true" ? true : false;

				UXWizard.setData("dataOfSetup_Wizard",angular.extend($scope.data,UXWizard.getData("dataOfSetup_Wizard")));

				var nextFormName = $scope.data.SkipUser === "true" ? "Database Details OMS" : "Create New Database User OMS";
				UXWizard.switchForm(nextFormName);
            });
           
        };

        $scope.closeButtonClick = function() {
            UXWizard.setData("dataOfSetup_Wizard",null);
            UXWizard.setData("staticDataForDatabaseOracle", null);
            UXWizard.close();
        };
		
		$scope.previousButtonClick = function() {			
            UXWizard.switchForm(Constant.formSwitch.PREVIOUS_FORM);
        };
		

		
    });
	
	 util.createController("configurator.controller.tools.Setup_Wizard.Create_New_Database_User", [ "$scope","$rootScope", "UXWizard", "Constant", "UXI18N" , "ConfiguratorService", "MDMValidation"], function($scope,$rootScope, UXWizard, Constant, UXI18N, ConfiguratorService,MDMValidation) {       
		
		var localNS = "tools.setupWizard";
        var localNSPublic = "public";        
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
			previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "CreateNewUser.title"),
            info : UXI18N.getString(localNS, "CreateNewUser.info"),
			OraclePath : UXI18N.getString(localNS, "CreateNewUser.OraclePath"),
            DBAUsername : UXI18N.getString(localNS, "CreateNewUser.DBAUsername"),
            DBAPassword : UXI18N.getString(localNS, "CreateNewUser.DBAPassword"),
            DBName : UXI18N.getString(localNS, "CreateNewUser.DBName"),
            newDBUserName : UXI18N.getString(localNS, "CreateNewUser.newDBUserName"),
            newDBPassword : UXI18N.getString(localNS, "CreateNewUser.newDBPassword"),
            newDBRePassword : UXI18N.getString(localNS, "CreateNewUser.newDBRePassword")
        };
	 	
	    $scope.data = UXWizard.getData("dataOfSetup_Wizard");	
		$scope.data.values.DATABASETYPE = "ORACLE";		
		
		$scope.data.values.ENV_NAME="ORACLE_HOME";
		ConfiguratorService.SetupDatabaseService({
                    action: "getEnvVariable",
                    values : angular.toJson($scope.data.values),
                    dbaUser: false
            }, "DatabaseSetup.do").then(function(data){
                $scope.data.values.HOME=data.ORACLE_HOME;
            },function(error){
				$scope.data.values.HOME=data.ORACLE_HOME;
            }
		);	
			
        var basicKeys =  [{
                key : "HOME",
                value : $scope.local.OraclePath 
            },{
                key : "DATABASENAMEOMS",
                value : $scope.local.DBName 
            }, {
                key : "SYSUSERNAMEOMS",
                value : $scope.local.DBAUsername 
            }, {
                key : "SYSPASSWORDOMS",
                value : $scope.local.DBAPassword 
            }];

        var newUserKeys = [{
                key : "USERNAME",
                value : $scope.local.newDBUserName 
            }, {
                key : "PASSWORD",
                value : $scope.local.newDBPassword 
            }];

        function doValidation(arr, callback){
            MDMValidation.doValidate([{
                keys : arr,
                object: $scope.data.values,
                required: true
            }], function(){
                callback();
            }); 
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

        $scope.checkNumber = function(valueStr){
           if(!/^[0-9]*$/.test(valueStr)){
                UXWizard.showInfoBar("error",$scope.local.numberFormat);
            }
        };	 
	 
		$scope.nextButtonClick = function() {

				
			doValidation(basicKeys.concat(newUserKeys) , function(){
				UXWizard.showInfoBar("info", "user creation in progress");
				ConfiguratorService.SetupDatabaseService({
                    action: "createUser",
                    values : angular.toJson($scope.data.values),
                    dbaUser: false
                }, "DatabaseSetup.do").then(function(data){
                    UXWizard.showInfoBar("info", "user created successful");
					UXWizard.setData("dataOfSetup_Wizard",angular.extend($scope.data,UXWizard.getData("dataOfSetup_Wizard")));
					UXWizard.switchForm(Constant.formSwitch.NEXT_FORM);
                },function(error){
                    UXWizard.showInfoBar("error",error);
                });
                
            });

           // UXWizard.switchForm(Constant.formSwitch.NEXT_FORM);
        };
		
        $scope.previousButtonClick = function() {					
            UXWizard.switchForm("Database Access Mode OMS");
        };
		
		$scope.closeButtonClick = function() {
            UXWizard.close();
        };
		
		 var data = UXWizard.getData("Database_Access_Mode"); 
    });
	
	util.createController("configurator.controller.tools.Setup_Wizard.Database_Details", [ "$scope", "UXWizard", "Constant", "UXI18N", "ConfiguratorService","MDMValidation" ], function($scope, UXWizard, Constant, UXI18N, ConfiguratorService,MDMValidation) {

		var localNS = "tools.setupWizard";
        var localNSPublic = "public";        
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
			previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "DatabaseDetails.title"),
            info : UXI18N.getString(localNS, "DatabaseDetails.info"),
			OraclePath : UXI18N.getString(localNS, "DatabaseDetails.OraclePath"),
            DBName : UXI18N.getString(localNS, "DatabaseDetails.DBName"),
            Username : UXI18N.getString(localNS, "DatabaseDetails.Username"),
            Password : UXI18N.getString(localNS, "DatabaseDetails.Password"),
            testConnection : UXI18N.getString(localNS, "DatabaseDetails.testConnection")
        };
		$scope.data = UXWizard.getData("dataOfSetup_Wizard") || {};
		$scope.data.values.DATABASETYPE = "ORACLE";		
		
		
		$scope.data.values.ENV_NAME="ORACLE_HOME";
		ConfiguratorService.SetupDatabaseService({
                    action: "getEnvVariable",
                    values : angular.toJson($scope.data.values),
                    dbaUser: false
            }, "DatabaseSetup.do").then(function(data){
                $scope.data.values.HOME=data.ORACLE_HOME;
            },function(error){
				$scope.data.values.HOME=data.ORACLE_HOME;
            }
		);
		
        function doValidation(callback){
            MDMValidation.doValidate([{
                keys : [{
                    key : "HOME",
                    value : $scope.local.OraclePath
                },{
                    key : "DATABASENAMEOMS",
                    value : $scope.local.DBName
                }, {
                    key : "USERNAME",
                    value : $scope.local.Username
                }, {
                    key : "PASSWORD",
                    value : $scope.local.Password
                }],
                object: $scope.data.values,
                required: true
            }], function(){
                callback();
            }); 
        }

		$scope.testConnection = function(){

            doValidation(function(){
                ConfiguratorService.SetupDatabaseService({
                    action: "testConnectionFOM",
                    values : angular.toJson($scope.data.values),
                    dbaUser: false
                }, "DatabaseSetup.do").then(function(data){
                    UXWizard.showInfoBar("info", "connection successful");
                },function(error){
                    UXWizard.showInfoBar("error",error);
                });
            });
            
        };

        $scope.checkNumber = function(valueStr){
           if(!/^[0-9]*$/.test(valueStr)){
				UXWizard.showInfoBar("error",$scope.local.numberFormat);
			}
        };

		
		$scope.nextButtonClick = function() {           
			doValidation(function(){
                 UXWizard.switchForm(Constant.formSwitch.NEXT_FORM);
            });
        };
		
        $scope.previousButtonClick = function() {		   
            UXWizard.switchForm(Constant.formSwitch.PREVIOUS_FORM);
        };
		
		$scope.closeButtonClick = function() {
            UXWizard.close();
        };
		
		 var data = UXWizard.getData("Database_Access_Mode"); 
    });
	
	
	 util.createController("configurator.controller.tools.Setup_Wizard.Database_Access_Mode_OCS", [ "$scope", "$rootScope", "UXWizard", "Constant", "UXI18N" ,"MDMValidation"], function($scope, $rootScope, UXWizard, Constant, UXI18N,MDMValidation) {
   
		var localNS = "tools.setupWizard";
        var localNSPublic = "public";  
		var pos=0;
		if($rootScope.oms === 'true')
		   pos=5;
		else  pos=3;   
            		
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
			previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "DatabaseAccessModeOCS.title"),
            info : UXI18N.getString(localNS, "DatabaseAccessMode.info"),
			profile : UXI18N.getString(localNS, "DatabaseAccessMode.profile"),
            useExisting : UXI18N.getString(localNS, "DatabaseAccessMode.useExisting"),
            useExistingInfo1 : UXI18N.getString(localNS, "DatabaseAccessMode.useExistingInfo1"),
            useExistingInfo2 : UXI18N.getString(localNS, "DatabaseAccessMode.useExistingInfo2"),
            createNew : UXI18N.getString(localNS, "DatabaseAccessMode.createNew"),
            createNewInfo1 : UXI18N.getString(localNS, "DatabaseAccessMode.createNewInfo1"),
            createNewInfo2 : UXI18N.getString(localNS, "DatabaseAccessMode.createNewInfo2"),
			createNewInfo3 : UXI18N.getString(localNS, "DatabaseAccessMode.createNewInfo3")
        };

		
		var staticSettingData = tibco.ux.service.staticInfo.Setting;
        var databaseMode = tibco.ux.service.staticInfo.Setting.databaseMode;
		$scope.data = UXWizard.getData("dataOfSetup_Wizard") || {
           values : {}
        };

        $scope.data.SkipUser1 = $scope.data.SkipUser1 || "true";
		

        $scope.data.values.DATABASETYPE = tibco.ux.service.staticInfo.Setting.databaseMode;

		function doValidation(callback){
            MDMValidation.doValidate([{
                keys : [{
                    key : "profileAliasOCS",
                    value : $scope.local.profile
                }],
                object: $scope.data,
                required: true
            }], function(){
                callback();
            }); 
        }
        $scope.changeMode = function(){
            if($scope.data.SkipUser1 === 'true'){
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "Create New Database User OCS"
                });
               $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : pos,
                    newItem : {
                        name : "Database Details OCS",
						title : "Database Details OCS",
					    templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/Database_Details_OCS.html"
                    }
                });

            }else{
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "Database Details OCS"
                });
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : pos,
                    newItem : {
                        name : "Create New Database User OCS",
                        title : "Create New Database User OCS",
                        templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/Create_New_Database_User_OCS.html"
                    } 
                });
            }
        };

        $scope.nextButtonClick = function() {
		
			doValidation(function(){			    
				$scope.data.values.SkipUser1 = $scope.data.SkipUser1 === "true" ? true : false;

				UXWizard.setData("dataOfSetup_Wizard",angular.extend($scope.data,UXWizard.getData("dataOfSetup_Wizard")));

				var nextFormName = $scope.data.SkipUser1 === "true" ? "Database Details OCS" : "Create New Database User OCS";
				if($scope.data.profileAliasOCS === $scope.data.profileAlias ){
				   UXWizard.showInfoBar("error","profileAlias already exists");
				}else{
				   UXWizard.switchForm(nextFormName);
				}
            });
           
        };

        $scope.closeButtonClick = function() {
            UXWizard.setData("dataOfSetup_Wizard",null);
            UXWizard.setData("staticDataForDatabaseOracle", null);
            UXWizard.close();
        };
		
		$scope.previousButtonClick = function() {
						
			
            UXWizard.switchForm(Constant.formSwitch.PREVIOUS_FORM);
        };
		

		
    });
	
	 util.createController("configurator.controller.tools.Setup_Wizard.Create_New_Database_User_OCS", [ "$scope","$rootScope", "UXWizard", "Constant", "UXI18N" , "ConfiguratorService", "MDMValidation"], function($scope,$rootScope, UXWizard, Constant, UXI18N, ConfiguratorService,MDMValidation) {       
		
		var localNS = "tools.setupWizard";
        var localNSPublic = "public";    
		if($rootScope.oms === 'true')
		   pos=5;
		else  pos=3;  		
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
			previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "CreateNewUserOCS.title"),
            info : UXI18N.getString(localNS, "CreateNewUser.info"),
			OraclePath : UXI18N.getString(localNS, "CreateNewUser.OraclePath"),
            DBAUsername : UXI18N.getString(localNS, "CreateNewUser.DBAUsername"),
            DBAPassword : UXI18N.getString(localNS, "CreateNewUser.DBAPassword"),
            DBName : UXI18N.getString(localNS, "CreateNewUser.DBName"),
            newDBUserName : UXI18N.getString(localNS, "CreateNewUser.newDBUserName"),
            newDBPassword : UXI18N.getString(localNS, "CreateNewUser.newDBPassword"),
            newDBRePassword : UXI18N.getString(localNS, "CreateNewUser.newDBRePassword")
        };
	 	
	    $scope.data = UXWizard.getData("dataOfSetup_Wizard");	
		$scope.data.values.DATABASETYPE = "ORACLE";
		
		$scope.data.values.ENV_NAME="ORACLE_HOME";
		ConfiguratorService.SetupDatabaseService({
                    action: "getEnvVariable",
                    values : angular.toJson($scope.data.values),
                    dbaUser: false
            }, "DatabaseSetup.do").then(function(data){
                $scope.data.values.HOME=data.ORACLE_HOME;
            },function(error){
				$scope.data.values.HOME=data.ORACLE_HOME;
            }
		);
        var basicKeys =  [{
                key : "HOME",
                value : $scope.local.OraclePath 
            },{
                key : "DATABASENAMEOCS",
                value : $scope.local.DBName 
            }, {
                key : "SYSUSERNAMEOCS",
                value : $scope.local.DBAUsername 
            }, {
                key : "SYSPASSWORDOCS",
                value : $scope.local.DBAPassword 
            }];

        var newUserKeys = [{
                key : "USERNAMEOCS",
                value : $scope.local.newDBUserName 
            }, {
                key : "PASSWORDOCS",
                value : $scope.local.newDBPassword 
            }];

        function doValidation(arr, callback){
            MDMValidation.doValidate([{
                keys : arr,
                object: $scope.data.values,
                required: true
            }], function(){
                callback();
            }); 
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

        $scope.checkNumber = function(valueStr){
           if(!/^[0-9]*$/.test(valueStr)){
                UXWizard.showInfoBar("error",$scope.local.numberFormat);
            }
        };	 
	 
		$scope.nextButtonClick = function() {

				
			doValidation(basicKeys.concat(newUserKeys) , function(){
				UXWizard.showInfoBar("info", "user creation in progress");
				ConfiguratorService.SetupDatabaseService({
                    action: "createUser",
                    values : angular.toJson($scope.data.values),
                    dbaUser: false
                }, "DatabaseSetup.do").then(function(data){
                    UXWizard.showInfoBar("info", "user created successful");
					UXWizard.setData("dataOfSetup_Wizard",angular.extend($scope.data,UXWizard.getData("dataOfSetup_Wizard")));
					UXWizard.switchForm(Constant.formSwitch.NEXT_FORM);
                },function(error){
                    UXWizard.showInfoBar("error",error);
                });
                
            });

           // UXWizard.switchForm(Constant.formSwitch.NEXT_FORM);
        };
		
        $scope.previousButtonClick = function() {						
            UXWizard.switchForm("Database Access Mode OCS");
        };
		
		$scope.closeButtonClick = function() {
            UXWizard.close();
        };
		
		 var data = UXWizard.getData("Database_Access_Mode_OCS"); 
    });
	
	util.createController("configurator.controller.tools.Setup_Wizard.Database_Details_OCS", [ "$scope", "UXWizard", "Constant", "UXI18N", "ConfiguratorService","MDMValidation" ], function($scope, UXWizard, Constant, UXI18N, ConfiguratorService,MDMValidation) {

		var localNS = "tools.setupWizard";
        var localNSPublic = "public";        
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
			previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "DatabaseDetailsOCS.title"),
            info : UXI18N.getString(localNS, "DatabaseDetails.info"),
			OraclePath : UXI18N.getString(localNS, "DatabaseDetails.OraclePath"),
            DBName : UXI18N.getString(localNS, "DatabaseDetails.DBName"),
            Username : UXI18N.getString(localNS, "DatabaseDetails.Username"),
            Password : UXI18N.getString(localNS, "DatabaseDetails.Password"),
            testConnection : UXI18N.getString(localNS, "DatabaseDetails.testConnection")
        };
		$scope.data = UXWizard.getData("dataOfSetup_Wizard") || {};
		$scope.data.values.DATABASETYPE = "ORACLE";		
		
		$scope.data.values.ENV_NAME="ORACLE_HOME";
		ConfiguratorService.SetupDatabaseService({
                    action: "getEnvVariable",
                    values : angular.toJson($scope.data.values),
                    dbaUser: false
            }, "DatabaseSetup.do").then(function(data){
                $scope.data.values.HOME=data.ORACLE_HOME;
            },function(error){
				$scope.data.values.HOME=data.ORACLE_HOME;
            }
		);
        function doValidation(callback){
            MDMValidation.doValidate([{
                keys : [{
                    key : "HOME",
                    value : $scope.local.OraclePath
                },{
                    key : "DATABASENAMEOCS",
                    value : $scope.local.DBName
                }, {
                    key : "USERNAMEOCS",
                    value : $scope.local.Username
                }, {
                    key : "PASSWORDOCS",
                    value : $scope.local.Password
                }],
                object: $scope.data.values,
                required: true
            }], function(){
                callback();
            }); 
        }

		$scope.testConnection = function(){

            doValidation(function(){
                ConfiguratorService.SetupDatabaseService({
                    action: "testConnectionFOM",
                    values : angular.toJson($scope.data.values),
                    dbaUser: false
                }, "DatabaseSetup.do").then(function(data){
                    UXWizard.showInfoBar("info", "connection successful");
                },function(error){
                    UXWizard.showInfoBar("error",error);
                });
            });
            
        };

        $scope.checkNumber = function(valueStr){
           if(!/^[0-9]*$/.test(valueStr)){
				UXWizard.showInfoBar("error",$scope.local.numberFormat);
			}
        };

		
		$scope.nextButtonClick = function() {           
			doValidation(function(){
                 UXWizard.switchForm(Constant.formSwitch.NEXT_FORM);
            });
        };
		
        $scope.previousButtonClick = function() {
			
            UXWizard.switchForm(Constant.formSwitch.PREVIOUS_FORM);
        };
		
		$scope.closeButtonClick = function() {
            UXWizard.close();
        };
		
		 var data = UXWizard.getData("Database_Access_Mode_OCS"); 
    });
	
	
	util.createController("configurator.controller.tools.Setup_Wizard.Database_Configuration", [ "$scope","$rootScope","UXWizard", "Constant", "UXI18N" ], function($scope,$rootScope, UXWizard, Constant, UXI18N) {
	
		var localNS = "tools.setupWizard";
        var localNSPublic = "public";        
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
			previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "DatabaseConfiguration.title"),
            info : UXI18N.getString(localNS, "DatabaseConfiguration.info"),			
            OMS : UXI18N.getString(localNS, "DatabaseConfiguration.OMS")
        };

		$scope.data = UXWizard.getData("dataOfSetup_Wizard") || {
           values : {}
        };
		$scope.data.name1=$scope.data.profileAlias;
		$scope.data.name2=$scope.data.profileAliasOCS;
		
		$scope.nextButtonClick = function() {
            UXWizard.switchForm(Constant.formSwitch.NEXT_FORM);
        };
		
        $scope.previousButtonClick = function() {
            UXWizard.switchForm(Constant.formSwitch.PREVIOUS_FORM);
        };
		
		$scope.closeButtonClick = function() {
            UXWizard.close();
        };
		
		 var data = UXWizard.getData("Database_Details_OCS"); 
    });
	
	util.createController("configurator.controller.tools.Setup_Wizard.StorageProfileDetails", [ "$scope","$rootScope", "UXWizard", "Constant", "UXI18N" ], function($scope,$rootScope, UXWizard, Constant, UXI18N) {  
		
		var localNS = "tools.setupWizard";
        var localNSPublic = "public"; 
		if($rootScope.oms === 'true' && $rootScope.ocs==='true')
		   pos=8;
		else  pos=6;  		
        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
			previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "StorageProfileDetails.title"),
            info : UXI18N.getString(localNS, "StorageProfileDetails.info"),	
			defaultTablespace : UXI18N.getString(localNS, "StorageProfileDetails.defaultTablespace"),	
			defaultTablespaceInfo1 : UXI18N.getString(localNS, "StorageProfileDetails.defaultTablespaceInfo1"),	
			defaultTablespaceInfo2 : UXI18N.getString(localNS, "StorageProfileDetails.defaultTablespaceInfo2"),	
			customTablespace : UXI18N.getString(localNS, "StorageProfileDetails.customTablespace"),	
			customTablespaceInfo1 : UXI18N.getString(localNS, "StorageProfileDetails.customTablespaceInfo1"),	
			customTablespaceInfo2 : UXI18N.getString(localNS, "StorageProfileDetails.customTablespaceInfo2"),	
			customTablespaceInfo3 : UXI18N.getString(localNS, "StorageProfileDetails.customTablespaceInfo3")
        };
		
		$scope.data = UXWizard.getData("dataOfSetup_Wizard") || {
           values : {}
        };

        $scope.data.storageProfile = $scope.data.storageProfile || "true";

        $scope.changeProfile = function(){
            if($scope.data.storageProfile === 'true'){
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "customTablespace"
                });  
            }else{               
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : pos,
                    newItem : {
                        name : "customTablespace",
                        title : "customTablespace",
                        templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/customTablespace.html"
                    } 
                });
            }		
			
        };

        $scope.nextButtonClick = function() {
            $scope.data.values.storageProfile = $scope.data.storageProfile === "true" ? true : false;

            UXWizard.setData("dataOfSetup_Wizard",angular.extend($scope.data,UXWizard.getData("dataOfSetup_Wizard")));

            var nextFormName = $scope.data.storageProfile === "true" ? "DefaultTablespace" : "customTablespace";
            UXWizard.switchForm(nextFormName);
        };

        $scope.closeButtonClick = function() {
            UXWizard.setData("dataOfSetup_Wizard",null);
            UXWizard.setData("staticDataForDatabaseOracle", null);
            UXWizard.close();
        };
		
		$scope.previousButtonClick = function() {
				
        };
		
		 var data = UXWizard.getData("Database_Details"); 
    });
	
	util.createController("configurator.controller.tools.Setup_Wizard.defaultTablespace", [  "$scope", "$rootScope", "UXWizard", "Constant", "UXI18N", "ConfiguratorService", "$http","MDMCfgDialog" ], function($scope, $rootScope, UXWizard, Constant, UXI18N, ConfiguratorService, $http, MDMCfgDialog) {
		
		var localNS = "tools.setupWizard";
        var localNSPublic = "public";        
        $scope.local = {
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
			install : UXI18N.getString(localNSPublic, "button.install"),
            title : UXI18N.getString(localNS, "defaultTablespace.title"),
            info : UXI18N.getString(localNS, "defaultTablespace.info"),	
			Component : UXI18N.getString(localNS, "defaultTablespace.Component"),	
			tableSpaceName : UXI18N.getString(localNS, "defaultTablespace.tableSpaceName"),	
			MaxSize : UXI18N.getString(localNS, "defaultTablespace.MaxSize"),	
			MinSize : UXI18N.getString(localNS, "defaultTablespace.MinSize"),	
			Location : UXI18N.getString(localNS, "defaultTablespace.Location")
        };
	
		$scope.data = UXWizard.getData("dataOfSetup_Wizard") || {
           values : {}
        };
		$scope.data.values.DATABASETYPE="ORACLE";
         var staticInfoURL = "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/"+$scope.data.values.DATABASETYPE+".json";

        function databaseAction(){
            var staticInfo = tibco.ux.service.staticInfo["SetupDatabaseFor" + $scope.data.values.DATABASETYPE];
            $scope.staticData = staticInfo;
            

            $scope.installButtonClick = function() {
			
			   
                if(!$scope.data.tableSpaceValues){
                    $scope.data.tableSpaceValues = $scope.staticData;
                }
				

                MDMCfgDialog.showDialog({
                    title: "Oracle setup",
                    templateUrl: "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/view/MDMSeedDataSummary.html",
                    width: 950,
                    height: 500,
                    buttons:{
                        button3: {
                            text : "",
                            show : false
                        },
                        button4: {
                            text: "Finish",
                            show: true,
                            disabled: false,
                            method: function(){
                                MDMCfgDialog.closeDialog();
								if($rootScope.omsConfiguration === 'true'){
									UXWizard.setData("dataOfSetup_Wizard",$scope.data);
									UXWizard.switchForm(Constant.formSwitch.NEXT_FORM);
								}else
								UXWizard.close();
                            }
                        }
                    }
                });

                var data = {
                    values : $scope.data.values,
                    tableSpaceValues : $scope.data.tableSpaceValues
                };

                MDMCfgDialog.data.dataOfSetupDBInstallForOracle = data;
                UXWizard.setData("dataOfSetup_Wizard",null);
                UXWizard.setData("staticDataForDatabaseOracle", null);

            };

            $scope.previousButtonClick = function() {
                var previousFormName = $scope.data.storageProfile === "true" ? "StorageProfileDetails" : "customTablespace";
                UXWizard.setData("dataOfSetup_Wizard",angular.extend($scope.data, UXWizard.getData("dataOfSetup_Wizard")));
                UXWizard.switchForm(previousFormName);
            };

            $scope.closeButtonClick = function() {
                UXWizard.setData("dataOfSetup_Wizard",null);
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
		
		 var data = UXWizard.getData("Database_Details"); 
    });
	
	util.createController("configurator.controller.tools.Setup_Wizard.customTablespace", [ "$scope","$rootScope","UXWizard", "Constant", "UXI18N" ,"$http","ConfiguratorService","MDMValidation"], function($scope,$rootScope, UXWizard, Constant, UXI18N,$http,ConfiguratorService,MDMValidation) {	
		
		var localNS = "tools.setupWizard";
        var localNSPublic = "public";        
        $scope.local = {
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
			next : UXI18N.getString(localNSPublic, "button.next"),
            title : UXI18N.getString(localNS, "customTablespace.title"),
            info : UXI18N.getString(localNS, "customTablespace.info"),	
			Component : UXI18N.getString(localNS, "defaultTablespace.Component"),	
			tableSpaceName : UXI18N.getString(localNS, "defaultTablespace.tableSpaceName"),	
			MaxSize : UXI18N.getString(localNS, "defaultTablespace.MaxSize"),	
			MinSize : UXI18N.getString(localNS, "defaultTablespace.MinSize"),	
			Location : UXI18N.getString(localNS, "defaultTablespace.Location")
        };
		$scope.data = UXWizard.getData("dataOfSetup_Wizard") || {
           values : {}
        };
		$scope.data.values.DATABASETYPE="ORACLE";
		
         var staticInfoURL = "module/externaljs/tibco.mdm.configurator/tools/Setup_Wizard/"+$scope.data.values.DATABASETYPE+".json";

        function databaseAction(){
            var staticInfo = tibco.ux.service.staticInfo["SetupDatabaseFor" + $scope.data.values.DATABASETYPE];
            $scope.staticData = staticInfo;
            

            $scope.nextButtonClick = function() {
			    $scope.data.tableSpaceValues = $scope.staticData;
                UXWizard.setData("staticDataForDatabaseOracle", angular.extend($scope.staticData, UXWizard.getData("staticDataForDatabaseOracle")));
                UXWizard.setData("dataOfSetup_Wizard",angular.extend($scope.data,UXWizard.getData("dataOfSetup_Wizard")));
				
				ConfiguratorService.SetupDatabaseService({
                    action: "validateValues",
                    values : angular.toJson($scope.data.tableSpaceValues),
                    dbaUser: false
                }, "DatabaseSetup.do").then(function(data){
                    UXWizard.showInfoBar("info", "Validation successful");
					UXWizard.switchForm(Constant.formSwitch.NEXT_FORM);
                },function(error){
                    UXWizard.showInfoBar("error",error);
                });
				
                
            };

            $scope.previousButtonClick = function() {
             //   var previousFormName = $scope.data.storageProfile === "typical" ? "StorageProfileDetails" : "CustomProfileSetup";
               // UXWizard.setData("dataOfSetup_Wizard",angular.extend($scope.data, UXWizard.getData("dataOfSetup_Wizard")));
				
                UXWizard.switchForm("StorageProfileDetails");
            };

            $scope.closeButtonClick = function() {
                UXWizard.setData("dataOfSetup_Wizard",null);
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
		
		 var data = UXWizard.getData("Database_Details"); 
    });
	
	util.createController("configurator.controller.tools.Setup_Wizard.MDMSeedDataSummary", [ "$scope","UXWizard", "Constant", "UXI18N", "$http", "ConfiguratorService", "MDMCfgDialog" ], function($scope, UXWizard, Constant, UXI18N, $http, ConfiguratorService, MDMCfgDialog) {
        

		var localNS = "tools.setupWizard";        
        $scope.local = {			
			Successfull : UXI18N.getString(localNS, "SeedDataSummary.ShowSummary.Successfull"),
			Failed : UXI18N.getString(localNS, "SeedDataSummary.ShowSummary.Failed"),
			title : UXI18N.getString(localNS, "SeedDataSummary.showSummary.title"),
			report : UXI18N.getString(localNS, "SeedDataSummary.showSummary.report"),
			seedDataCreation : UXI18N.getString(localNS, "SeedDataSummary.showSummary.seedDataCreation"),
			logFile : UXI18N.getString(localNS, "SeedDataSummary.showSummary.logFile"),
			open : UXI18N.getString(localNS, "SeedDataSummary.showSummary.Open"),
			hideSummaryTitle : UXI18N.getString(localNS, "SeedDataSummary.hideShowSummary.title"),
			hideSummaryContent : UXI18N.getString(localNS, "SeedDataSummary.hideShowSummary.content")			
        };
		
        $scope.showSummary = false;

        $scope.databasetype = MDMCfgDialog.data.dataOfSetupDBInstallForOracle.values.DATABASETYPE;


        ConfiguratorService.SetupDatabaseService({
            action: "installSeedDataFOM",
            values : angular.toJson(MDMCfgDialog.data.dataOfSetupDBInstallForOracle.values),
            tableSpaceValues : angular.toJson(MDMCfgDialog.data.dataOfSetupDBInstallForOracle.tableSpaceValues)
        }, "DatabaseSetup.do").then(function(data){
            $scope.showSummary = true;
            $scope.data = data;
        },function(error){
            $scope.showSummary = true;
            $scope.data = data;	
        });

        
    });
	
	
	util.createController("configurator.controller.tools.Setup_Wizard.MessagingConfigSummary", [ "$scope","UXWizard", "Constant", "UXI18N", "$http", "ConfiguratorService", "MDMCfgDialog","MDMValidation" ], function($scope, UXWizard, Constant, UXI18N, $http, ConfiguratorService, MDMCfgDialog,MDMValidation) {
        
	  var localNS = "tools.setupWizard";        
        $scope.local = {			
			host : UXI18N.getString(localNS, "mesgConfig.EMS_HOST"),
			port : UXI18N.getString(localNS, "mesgConfig.EMS_PORT"),
			username : UXI18N.getString(localNS, "mesgConfig.EMS_USERNAME"),
			password : UXI18N.getString(localNS, "mesgConfig.EMS_PASSWORD"),
			Successfull : UXI18N.getString(localNS, "mesgConfigSummary.successfull"),
			Failed : UXI18N.getString(localNS, "mesgConfigSummary.failed"),
			ShowSummaryTitle : UXI18N.getString(localNS, "mesgConfigSummary.ShowSummaryTitle"),
			ShowSummaryReport : UXI18N.getString(localNS, "mesgConfigSummary.ShowSummaryReport"),
			ShowSummaryMsgConfig : UXI18N.getString(localNS, "mesgConfigSummary.ShowSummaryMsgConfig"),
			ShowSummaryLogFilePath : UXI18N.getString(localNS, "mesgConfigSummary.ShowSummaryLogFilePath"),
			ShowSummaryOpen : UXI18N.getString(localNS, "mesgConfigSummary.ShowSummaryOpen"),
			ShowSummaryProgress : UXI18N.getString(localNS, "mesgConfigSummary.ShowSummaryProgress"),
			ShowSummaryWaitInfo : UXI18N.getString(localNS, "mesgConfigSummary.ShowSummaryWaitInfo")			
        };
        $scope.showSummary = false;
		function doValidation(callback){
            MDMValidation.doValidate([{
                keys : [{
                    key : "HOST",
                    value : $scope.local.host
                },{
                    key : "PORT",
                    value : $scope.local.port 
                }, {
                    key : "USERNAME",
                    value :$scope.local.username 
                }, {
                    key : "PASSWORD",
                    value : $scope.local.password 
                }],
                object: MDMCfgDialog.data.dataOfSetupMessaging.values,
                required: true
            }], function(){
                callback();
            }); 
        }
        $scope.databasetype = MDMCfgDialog.data.dataOfSetupMessaging.values.DATABASETYPE;

			doValidation(function(){
                ConfiguratorService.SetupDatabaseService({
                    action: "mesgConfig",
                    values : angular.toJson(MDMCfgDialog.data.dataOfSetupMessaging.values),
                    dbaUser: false
                }, "DatabaseSetup.do").then(function(data){
					$scope.showSummary = true;
					$scope.data = data;
					$scope.data.msgConfig = $scope.local.Successfull ;
                },function(error){
                   $scope.showSummary = true;
				   $scope.data = error;
				   $scope.data.msgConfig =$scope.local.Failed ;
                });
            });

        
    });

}());