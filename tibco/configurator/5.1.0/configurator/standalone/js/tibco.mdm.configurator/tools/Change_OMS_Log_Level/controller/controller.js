(function() {
    var util = configurator.util;

    util.createController("configurator.controller.tools.Change_OMS_Log_Level", [ "$scope", "$rootScope", "FrameDialog" ], function($scope, $rootScope, FrameDialog) {
		
        $scope.wizardData = {
            title : "Change OMS Log Level",
            forms : [ {
                name : "Change OMS Log Level",
                title : "Change OMS Log Level",
                templateUrl : "module/externaljs/tibco.mdm.configurator/tools/Change_OMS_Log_Level/view/ChangeOmsLogLevel.html"
            }]
        };
    }); 
	
	
	util.createController("configurator.controller.tools.Change_OMS_Log_Level.ChangeOmsLogLevel", [ "$scope", "$rootScope", "UXWizard", "Constant", "UXI18N" ,"ConfiguratorService","MDMValidation" ,"MDMCfgDialog"], function($scope, $rootScope, UXWizard, Constant, UXI18N,ConfiguratorService,MDMValidation,MDMCfgDialog ) {
	
	    var localNS = "tools.changeOmsLogLevel";
        var localNSPublic = "public";        
        $scope.local = {         
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
			ok : UXI18N.getString(localNSPublic, "button.ok"),
            title : UXI18N.getString(localNS, "ChangeOmsLogLevel.title"),
            Package : UXI18N.getString(localNS, "ChangeOmsLogLevel.Package"),
			Level : UXI18N.getString(localNS, "ChangeOmsLogLevel.Level"),
            JMX_Host : UXI18N.getString(localNS, "ChangeOmsLogLevel.JMX_Host"),
            Username : UXI18N.getString(localNS, "ChangeOmsLogLevel.Username"),
            Password : UXI18N.getString(localNS, "ChangeOmsLogLevel.Password"),
            JMX_Port : UXI18N.getString(localNS, "ChangeOmsLogLevel.JMX_Port")
        };
	
		$scope.data = UXWizard.getData("dataOfChange_OMS_Log_Level") || {
           values : {}
        };		
		$scope.options = ["DEBUG","INFO","WARN","ERROR","OFF"];
		$scope.data.values.Level = $scope.options[1];
        $scope.changeLogLevel = function() {
				UXWizard.close();
                MDMCfgDialog.showDialog({
                    title: "Change Log Level",
                    templateUrl: "module/externaljs/tibco.mdm.configurator/tools/Change_OMS_Log_Level/view/changeLogSummary.html",
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
                    values : $scope.data.values
                };

                MDMCfgDialog.data.dataOfChangeLogLevel = data;
                UXWizard.setData("dataOfChange_OMS_Log_Level",null);    
        };
		
		$scope.cancelButtonClick = function() {
            UXWizard.close();
        };
        
    });
	
	util.createController("configurator.controller.tools.Change_OMS_Log_Level.changeLogSummary", [ "$scope","UXWizard", "Constant", "UXI18N", "$http", "ConfiguratorService", "MDMCfgDialog","MDMValidation" ], function($scope, UXWizard, Constant, UXI18N, $http, ConfiguratorService, MDMCfgDialog,MDMValidation) {
         
		 
		var localNS = "tools.changeOmsLogLevel";
        var localNSPublic = "public";        
        $scope.local = {         
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
			ok : UXI18N.getString(localNSPublic, "button.ok"),
            title : UXI18N.getString(localNS, "ChangeOmsLogLevel.title"),
            Package : UXI18N.getString(localNS, "ChangeOmsLogLevel.Package"),
			Level : UXI18N.getString(localNS, "ChangeOmsLogLevel.Level"),
            JMX_Host : UXI18N.getString(localNS, "ChangeOmsLogLevel.JMX_Host"),
            Username : UXI18N.getString(localNS, "ChangeOmsLogLevel.Username"),
            Password : UXI18N.getString(localNS, "ChangeOmsLogLevel.Password"),
            JMX_Port : UXI18N.getString(localNS, "ChangeOmsLogLevel.JMX_Port"),
			summaryTitle : UXI18N.getString(localNS,"changeLogSummary.title"),
			report : UXI18N.getString(localNS,"changeLogSummary.report"), 
			status : UXI18N.getString(localNS,"changeLogSummary.status"), 
			inProgess : UXI18N.getString(localNS,"changeLogSummary.inProgress"),
			wait : UXI18N.getString(localNS,"changeLogSummary.wait") 
        }; 
		 
		 
        $scope.showSummary = false;
		function doValidation(callback){
            MDMValidation.doValidate([{
                keys : [{
                    key : "Package",
                    value : $scope.local.Package
                },{
                    key : "Level",
                    value : $scope.local.Level
                },{
                    key : "JMX_Host",
                    value : $scope.local.JMX_Host
                },{
                    key : "JMX_Port",
                    value : $scope.local.JMX_Port
                },{
                    key : "Username",
                    value : $scope.local.Username
                },{
                    key : "Password",
                    value : $scope.local.Password
                }],
                object: MDMCfgDialog.data.dataOfChangeLogLevel.values,
                required: true
            }], function(){
                callback();
            }); 
        }    

		doValidation(function(){
                ConfiguratorService.SetupDatabaseService({
                    action: "changeLogLevel",
                    values : angular.toJson(MDMCfgDialog.data.dataOfChangeLogLevel.values),
                    dbaUser: false
                }, "DatabaseSetup.do").then(function(data){
					$scope.showSummary = true;
					$scope.data = data;
					
                },function(error){
                   $scope.showSummary = true;
				   $scope.data = error;
				  
                });
            });

        
    });

}());