
(function(defineController) {
    var util = configurator.util;
    util.log("configurator.mainframe - loaded");

    var mainModule = angular.module('configurator', [ 'tibco.ux.service', 'tibco.ux.directive', 'tibco.ux.filters', 'ng', 'ngRoute' ], [ "$routeProvider", "$locationProvider", "$httpProvider", function($routeProvider, $locationProvider, $httpProvider) {

        $routeProvider.when('/:sectionName', {
            templateUrl : function(parameter) {
                var templateURL = "module/tibco.mdm.configurator/" + parameter.sectionName + "/view/template.html";
                return templateURL;
            }

        }).when('/:sectionName/:subSectionName', {
            templateUrl : function(parameter) {
                var templateURL = "module/tibco.mdm.configurator/" + parameter.sectionName;
                if (parameter.subSectionName != null && jQuery.trim(parameter.subSectionName !== "")) {
                    templateURL += "/" + parameter.subSectionName;
                }
                templateURL = templateURL + "/view/template.html";
                return templateURL;
            }
        })
        .otherwise({ // by default, show configuration panel
            redirectTo : '/login'
        });

        $httpProvider.defaults.transformRequest = function(data) {
            // We are using jQuery’s param method to convert our JSON data into the string form
            if (data == null) {
                return null;
            }
            return jQuery.param(data);
        };
        // override the default post request header
        $httpProvider.defaults.headers.post = {
            'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
        };

    } ]);
    defineController();
   
})(function() {

    // ///////////////////////////////////////////////
    // define controller
    // ///////////////////////////////////////////////
    var util = configurator.util;
    /**
     * main controller
     */
    util.createController("configurator.controller.mainframe", [ "$scope", "$rootScope", "UXI18N", "$log", "$route", "$location", "MDMCfgDialog", "MDMCfgMsgBar", "ConfiguratorService", "globalSearchData", "MDMValidation", "$window", "$document", "scrollbar", "serverDeployInfo", "$timeout"], function mainController($scope, $rootScope, UXI18N, $log, $route, $location, MDMCfgDialog, MDMCfgMsgBar, ConfiguratorService, globalSearchData, MDMValidation, $window, $document, scrollbar, serverDeployInfo, $timeout) {

        var defualtWizardJS = [
            "module/tibco.mdm.configurator/revision_history/controller/controller.js", 
            "module/tibco.mdm.configurator/tools/inbound_queue/controller/controller.js", 
            "module/tibco.mdm.configurator/tools/outbound_queue/controller/controller.js", 
            "module/tibco.mdm.configurator/tools/setup_database/controller/controller.js", 
            "module/tibco.mdm.configurator/tools/migration/controller/controller.js", 
            "module/tibco.mdm.configurator/tools/addon_plugin_installer/controller/controller.js"
        ];
        
        if(!(tibco.ux.service.staticInfo && tibco.ux.service.staticInfo.configuration)){
            ConfiguratorService.PluginsHandler({
                action: "getSelectedPluginDetails"
            }).then(function(data) {
                util.createNamespace("tibco.ux.service.staticInfo.configuration", data);
                var configFileList = data.configFileList;
                for(var i = 0, len = configFileList.length;i < len;i++){
                    if(configFileList[i].isSelected === true) {
                        tibco.ux.service.staticInfo.configuration.selected = configFileList[i];
                        break;
                    }
                }

                $scope.selectConfiguration = tibco.ux.service.staticInfo.configuration;


                if($scope.selectConfiguration.uiPluginJSON.language) {
                    var localInfo = $scope.selectConfiguration.uiPluginJSON.language;
                    var localJSONPath = "";

                    for(var i = 0, len = localInfo.props.length; i<len; i++) {
                        if(localInfo.props[i].name === localInfo.default) {
                            localJSONPath = "text!" + localInfo.props[i].path;
                        }
                    }

                    if(localJSONPath !== "") {
                        require([localJSONPath], function(source) {
                            UXI18N.addNewString(JSON.parse(source));
                        });
                    }

                }

                if($scope.selectConfiguration.uiPluginJSON.wizard){
                    var wizardJS = [];
                    var wizardCSS = [];
                    var wizardInfo = $scope.selectConfiguration.uiPluginJSON.wizard;
                    if(wizardInfo){
                        var basePath = "module/";
                        for(var j = 0, len = wizardInfo.length; j < len; j++) {
                            if(wizardInfo[j].controller || wizardInfo[j].controller !== ""){
                                wizardJS.push(basePath + wizardInfo[j].controller);
                            }

                            if(wizardInfo[j].css || wizardInfo[j].css !== ""){
                                wizardCSS.push(basePath + wizardInfo[j].css);
                            }
                        }
                    }else{
                        wizardJS = defualtWizardJS;
                    }
                    
                    require(wizardJS, function() {
                        util.loadCSS(wizardCSS);
                        $rootScope.$broadcast("SHOW_MENU_BAR", $scope.selectConfiguration);
                    });

                }else{
                    require(defualtWizardJS, function() {
                        $rootScope.$broadcast("SHOW_MENU_BAR", $scope.selectConfiguration);
                    });   
                }

               
            },function(error){
                $log.info(error);
            });
        }else{
            $scope.selectConfiguration = tibco.ux.service.staticInfo.configuration;
        }

        $(document).ready(function(){
            (function($){
                $.fn.disableSelection = function() {
                    return this
                        .attr('unselectable', 'on')
                        .css('user-select', 'none')
                        .on('selectstart', false);
                };
            })(jQuery);
            $(".leftPanel").disableSelection();

            if($location.path() !== "/login" && $location.path() !== ""){
                ConfiguratorService.MainService({
                    action: "loadSessionConfigDoc"
                }).then(function(data) {}, function(error) {});

                //get some useful static data
                if(!(tibco.ux.service.staticInfo && tibco.ux.service.staticInfo.Setting)){
                    ConfiguratorService.MainService({
                        action: "getConfiguratorSettings"
                    }).then(function(data) {
                        util.createNamespace("tibco.ux.service.staticInfo.Setting", data);
                        if(!tibco.ux.service.staticInfo.Setting.databaseMode){
                            for(var i = 0, len = tibco.ux.service.staticInfo.Setting.deploymentTargets.length;i<len;i++){
                                if(tibco.ux.service.staticInfo.Setting.deploymentTargets[i].name === "Database"){
                                    tibco.ux.service.staticInfo.Setting.databaseMode = tibco.ux.service.staticInfo.Setting.deploymentTargets[i].value;
                                    $timeout(function(){
                                        $rootScope.$broadcast("databaseMode_change",tibco.ux.service.staticInfo.Setting.databaseMode);
                                    }, 800);
                                    
                                    break;
                                }
                            }
                        }
                    },function(error) {
                        $log.info(error);
                    });
                }
            }
            
        });

        angular.element(window).resize(function() {
            if (scrollbar.scrollbarMap.editTable && scrollbar.scrollbarMap.configuration) {
                var contentElm = angular.element(".rightPanel").find(".ediTable-container");
                var table = contentElm.children('table');
                var height = table.height() > $('.rightPanel .ediTable-wrapper').height() ? $('.rightPanel .ediTable-wrapper').height() : table.height();
                scrollbar.scrollbarMap.editTable.setWrapperHeight(height + 2);
                scrollbar.scrollbarMap.editTable.setWrapperWidth($('.rightPanel .ediTable-wrapper').width());

                // for configuration scrollbar
                scrollbar.scrollbarMap.configuration.setWrapperHeight($('#configurationpanel').height() - 160);
            }
        });

        var localNS = "mainframe";
        var publicLocalNS = "public";
        mainFrameScope = $scope;

        var username = util.cookie.getCookie("username") || "";

        // set local string
        $scope.local = {
            menuitem_save : UXI18N.getString(localNS, "menuitem.save"),
            menuitem_deploy : UXI18N.getString(localNS, "menuitem.deploy"),
            menuitem_editOn : UXI18N.getString(localNS, "menuitem.editOn"),
            menuitem_editOff : UXI18N.getString(localNS, "menuitem.editOff"),
//			menuitem_editLockTimer : UXI18N.getString(localNS, "menuitem.editLockTimer", [$rootScope.time]),
            menuitem_home : UXI18N.getString(localNS, "menuitem.home"),
            menuitem_restore : UXI18N.getString(localNS, "menuitem.restore"),
            menuitem_tools : UXI18N.getString(localNS, "menuitem.tools"),
            menuitem_loadDefaults : UXI18N.getString(localNS, "menuitem.loadDefaults"),
            menuitem_greeting : UXI18N.getString(localNS, "menuitem.greeting", [username]),
            menuitem_sub_oracle : UXI18N.getString(localNS, "menuitem.sub.setup"),
            menuitem_sub_migration : UXI18N.getString(localNS, "menuitem.sub.migration"),
            menuitem_sub_installer : UXI18N.getString(localNS, "menuitem.sub.installer"),
            menuitem_sub_logout : UXI18N.getString(localNS, "menuitem.sub.logout"),
            menuitem_sub_setting : UXI18N.getString(localNS, "menuitem.sub.setting"),
            menuitem_sub_help : UXI18N.getString(localNS, "menuitem.sub.help"),
            menuitem_sub_inbound_queue : UXI18N.getString(localNS, "menuitem.sub.inboundQueue"),
            menuitem_sub_outbound_queue : UXI18N.getString(localNS, "menuitem.sub.outboundQueue"),
            MDMConfiguratorUI : UXI18N.getString(localNS, "MDMConfiguratorUI"),
            logoutTitle : UXI18N.getString(localNS, "logout.title"),
            logoutInformation : UXI18N.getString(localNS, "logout.information"),
            logoutButton : UXI18N.getString(localNS, "logout.button"),
            logoutCancel : UXI18N.getString(localNS, "logout.cancel"),
            editLockAlertTitle : UXI18N.getString(localNS, "editLockAlert.title"),
            editLockAlertInformation : UXI18N.getString(localNS, "editLockAlert.information"),
            editLockAlertButton : UXI18N.getString(localNS, "editLockAlert.button"),
            editLockAlertCancel : UXI18N.getString(localNS, "editLockAlert.cancel"),
            editTableSave_save : UXI18N.getString(localNS, "editTableSave.save"),
            editTableSave_cancel : UXI18N.getString(localNS, "editTableSave.cancel"),
            editTableSave_information : UXI18N.getString(localNS, "editTableSave.information"),
            editTableSaveDeploy_title : UXI18N.getString(localNS, "editTableSaveDeploy.title"),
            editTableSaveDeploy_save : UXI18N.getString(localNS, "editTableSaveDeploy.save"),
            editTableSaveDeploy_cancel : UXI18N.getString(localNS, "editTableSaveDeploy.cancel"),
            editTableSaveDeploy_information : UXI18N.getString(localNS, "editTableSaveDeploy.information"),
            footer_copyRightText : UXI18N.getString(localNS, "footer.copyRightText"),
            hostName : UXI18N.getString(localNS, "doValidateHostName"),
            buttonYes : UXI18N.getString(publicLocalNS, "button.yes"),
            buttonNo : UXI18N.getString(publicLocalNS, "button.no"),
            alertMsgForInitial : UXI18N.getString(localNS, "alertMsgForInitial"),
            alertMsgAfterDeploy : UXI18N.getString(localNS, "alertMsgAfterDeploy"),
            alertMsgForReload : UXI18N.getString(localNS, "alertMsgForReload"),
            loadDefaultsEditLockInformation : UXI18N.getString(localNS, "loadDefaultsEditLockInformation"),
            loadDefaultsEditChangesNotSaved : UXI18N.getString(localNS, "loadDefaultsEditChangesNotSaved"),
            loadNonAdminUserRestrictionInfo : UXI18N.getString(localNS, "loadNonAdminUserRestrictionInfo")
        };

        $scope.$on("CREATE_USERNAME", function(event, name) {
            $scope.local.menuitem_greeting = UXI18N.getString(localNS, "menuitem.greeting", [name]);
            $("#menuitem_greeting").html($scope.local.menuitem_greeting);
        });

        

        $scope.statusOfsave = false;

        $scope.$on("ENABLE_SAVE_BUTTON", function(event, obj) {
            angular.forEach(obj, function(value, key) {
                $scope["statusOf" + value] = true;
            });

        });

	$rootScope.statusOfedit = false;

        //will get param as "edit"
        $scope.$on("ENABLE_EDITING_VALUSE", function(event, obj) {
            angular.forEach(obj, function(value, key) {
                $rootScope["statusOf" + value] = true;
            });

        });

         //will call if edit value is false.
            $scope.$on("EditButtonStatusFalse", function(event, obj) { 
                $rootScope.editButtonStatus = false;
                MDMCfgMsgBar.showConfirmMsg($scope.local.loadDefaultsEditLockInformation, "homepage");
            });

             //will call if non admin user.
            $scope.$on("EditButtonNonAdminRole", function(event, obj) { 
                $rootScope.editButtonStatus = false;
                MDMCfgMsgBar.showConfirmMsg($scope.local.loadNonAdminUserRestrictionInfo, "homepage");
            });

            var timeoutAutoCancelLock = null ;

			//will call if edit value is true.
	         $scope.$on("EditButtonStatusTrue", function(event, obj) {
            $rootScope.editButtonStatus = true;
            $rootScope.$broadcast("enable_editingValues", ["edit"]);
            $rootScope.$broadcast("cancelBtn_enableActions", ["editCancel"]);
            editLockLastMinutAlert();
            $timeout.cancel(timeoutAutoCancelLock);
		    timeoutAutoCancelLock =	$timeout( function(){
                if(!$rootScope.editButtonStatus){
                    return;
                }
                MDMCfgMsgBar.showConfirmMsg($scope.local.loadDefaultsEditChangesNotSaved, "homepage");
                $rootScope.$broadcast("edittable_disableActions", ["save"]);
                $rootScope.$emit("Remove_EditLock_FromDB");
                $rootScope.$broadcast("cancelBtn_disableActions", ["editCancel"]);
                $rootScope.$broadcast("disable_editingValues", ["edit"]);
                MDMCfgDialog.closeDialog();
            }, 600000);
        });
	
		var editLockLastMinutAlert = function(){
            $timeout.cancel(editLockLastMinutTimeout); 
            var editLockLastMinutTimeout = $timeout( function(){
                if(!$rootScope.editButtonStatus){
                    return;
                }
                MDMCfgDialog.showMessage($scope.local.editLockAlertTitle,$scope.local.editLockAlertInformation, {
                    button3: {
                        text: $scope.local.editLockAlertButton,
                        show: true,
                        method: function(){
                            $rootScope.$emit("check_EditStatus_FromDB");
                            MDMCfgDialog.closeDialog();
                        }
                    },
                    button4: {
                        text: $scope.local.editLockAlertCancel,
                        show: true,
                        method: function(){
                            MDMCfgDialog.closeDialog();
                        }
                    }
                });
            }, 540000);
        }
        // var timerForEditLock = function() {
        //       if( $scope.y <= 60 ) {
        //           if($scope.y == 0){
        //               $scope.x -= 1;
        //               $scope.y = 60;
        //                if($scope.x == 0){
        //                   return ;
        //                }
        //           }
        //           $scope.y -= 1;
        //           $timeout(timerForEditLock, 1000);
        //       }
        //   }

         //will get param as "edit"
         $scope.$on("DISABLE_EDITING_VALUSE", function(event, obj) {
            angular.forEach(obj, function(value, key) {
                $rootScope["statusOf" + value] = false;
            });

        });

        $rootScope.statusOfeditCancel = false; 

         // will get param as "editCancel"
        $scope.$on("ENABLE_CANCEL_BUTTON", function(event, obj) {
            angular.forEach(obj, function(value, key) {
                $rootScope["statusOf" + value] = true;
            });

        });

        // will get param as "editCancel" 
        $scope.$on("DISABLE_CANCEL_BUTTON", function(event, obj) {
            angular.forEach(obj, function(value, key) {
                $rootScope["statusOf" + value] = false;
            });

        });


        $(window).bind("beforeunload", function() {
            var returnMsg = null;
            if($scope.statusOfsave){
                return $scope.local.alertMsgForReload;
            }
            if($scope.editButtonStatus){
                $rootScope.$emit("Remove_EditLock_FromDB");
            } 
        });


        
        $rootScope.$on("navigation_menu_item_click",function(event,menu_obj){
            
            if(menu_obj.name === "logout"){
                MDMCfgDialog.showMessage($scope.local.logoutTitle,$scope.local.logoutInformation, {
                    button3: {
                        text: $scope.local.logoutButton,
                        show: true,
                        method: function(){
								$rootScope.$emit("Remove_EditLock_FromDB");
				                $rootScope.$broadcast("cancelBtn_disableActions", ["editCancel"]);
				                $rootScope.$broadcast("disable_editingValues", ["edit"]);
                            ConfiguratorService.MainService({
                                action: "logout"
                            }).then(function(data){
                                MDMCfgDialog.closeDialog();
                                util.cookie.delCookie("username");
                                util.cookie.delCookie("isCloudMode");
                                $location.path("/login");
                                jQuery("body").unbind("keydown");
                            },function(error){
                                $log.info(error);
                            });
                        }
                    },
                    button4: {
                        text: $scope.local.logoutCancel,
                        show: true,
                        method: function(){
                            MDMCfgDialog.closeDialog();
                        }
                    }
                }); 

                jQuery("body").bind("keydown",function(event){
                    if(event.keyCode === 13){
                        jQuery("#cfgDialogConfigRightBtn1").click();
                    }
                });
            }

            if(menu_obj.name === "save"){
                MDMCfgDialog.data.saveAllchange = {};
                MDMCfgDialog.showDialog({
                    title: $scope.local.editTableSave_save,
                    templateUrl: "module/tibco.mdm.configurator/dialog/view/edittable_save.html",
                    width: 700,
                    height: 280,
                    buttons: {
                        button3: {
                            text: $scope.local.editTableSave_save,
                            show: true,
                            method: function() {
                                ConfiguratorService.MainService({
                                    action: "save",
                                    description: MDMCfgDialog.data.saveAllchange.description
                                }).then(function(data) {
                                    MDMCfgDialog.closeDialog();
                                    $rootScope.$broadcast("edittable_disableActions", ["save"]);
									$rootScope.$emit("Remove_EditLock_FromDB");
					                $rootScope.$broadcast("cancelBtn_disableActions", ["editCancel"]);
					                $rootScope.$broadcast("disable_editingValues", ["edit"]);
                                    $scope.statusOfsave = false;
                                    MDMCfgMsgBar.showConfirmMsg($scope.local.editTableSave_information, "homepage");
                                    MDMCfgDialog.data.statusOfRevision = false;

                                    if($location.path() === "/revision_history"){
                                        $rootScope.$broadcast("REFRESH_RESTOREPAGE");
                                    }
                                }, function(error) {
                                    MDMCfgDialog.closeDialog();
                                    MDMCfgMsgBar.showErrorMsg(error, "homepage");
                                });

                            }
                        },
                        button4: {
                            text: $scope.local.editTableSave_cancel,
                            show: true,
                            method: function() {
                                MDMCfgDialog.closeDialog();
                            }
                        }
                    }
                });
            }

            if(menu_obj.name === "deploy"){

                if($rootScope.initialInfo.clusterName.value == $rootScope.initialInfo.InitialConfigName){
                    MDMCfgDialog.showMessage($scope.local.menuitem_deploy,$scope.local.alertMsgForInitial, {
                        button3: {
                            text: $scope.local.buttonYes,
                            show: true,
                            method: function(){
                                MDMCfgDialog.closeDialog();
                            }
                        },
                        button4: {
                            text: $scope.local.buttonNo,
                            show: true,
                            method: function(){
                                $rootScope.$broadcast("edittable_disableActions", ["deploy"]);
                                serverDeployInfo.setAllFlagValue(false);
                                MDMCfgDialog.closeDialog();
                            }
                        }
                    }); 
                }else{
                    MDMCfgDialog.showDialog({
                        title: $scope.local.editTableSaveDeploy_title,
                        templateUrl: "module/tibco.mdm.configurator/dialog/view/edittable_saveDeploy.html",
                        width: 700,
                        height: 400,
                        buttons: {
                            button3: {
                                text: $scope.local.editTableSaveDeploy_save,
                                show: true,
                                method: function() {
                                    MDMValidation.doValidate([{
                                        keys: [{
                                            key: "hostname",
                                            value: $scope.local.hostName
                                        }],
                                        object: MDMCfgDialog.data.saveDeploy,
                                        required: true
                                    }], function() {
                                        ConfiguratorService.MainService({
                                            action: "saveRedeploy",
                                            serverName: $rootScope.initialInfo.clusterName.value,
                                            hostName: MDMCfgDialog.data.saveDeploy.hostname,
                                            port : MDMCfgDialog.data.saveDeploy.port,
                                            description: MDMCfgDialog.data.saveDeploy.description,
                                            ConfigurationName: $rootScope.configurationName
                                        }).then(function(data) {
                                            MDMCfgDialog.closeDialog();
                                            MDMCfgMsgBar.showConfirmMsg($scope.local.editTableSaveDeploy_information, "homepage");

                                            $rootScope.$broadcast("edittable_disableActions", ["deploy"]);
                                            serverDeployInfo.setOneFlagFalse($rootScope.initialInfo.clusterName.value);
                                            if(serverDeployInfo.getDeployNodeNum() > 0) {
                                                MDMCfgDialog.showMessage($scope.local.menuitem_deploy,$scope.local.alertMsgAfterDeploy, {
                                                    button3: {
                                                        text: $scope.local.buttonYes,
                                                        show: true,
                                                        method: function(){
                                                            MDMCfgDialog.closeDialog();
                                                        }
                                                    },
                                                    button4: {
                                                        text: $scope.local.buttonNo,
                                                        show: true,
                                                        method: function(){
                                                            serverDeployInfo.setAllFlagValue(false);
                                                            MDMCfgDialog.closeDialog();
                                                        }
                                                    }
                                                }); 

                                            }else {
                                                MDMCfgMsgBar.showConfirmMsg($scope.local.editTableSaveDeploy_information, "homepage");
                                            }
                                                
                                        }, function(error) {
                                            MDMCfgDialog.closeDialog();
                                            MDMCfgMsgBar.showErrorMsg(error, "homepage");
                                            
                                        });
                                    });
                                }
                            },
                            button4: {
                                text: $scope.local.editTableSaveDeploy_cancel,
                                show: true,
                                method: function() {
                                    MDMCfgDialog.closeDialog();
                                }
                            }
                        }
                    });
                }

                
            }

              if(menu_obj.name === "edit") {
                $rootScope.$emit("check_EditStatus_FromDB");
            }

            if(menu_obj.name == "editCancel") {
 			 	$rootScope.$emit("Remove_EditLock_FromDB");
                $rootScope.$broadcast("cancelBtn_disableActions", ["editCancel"]);
                $rootScope.$broadcast("disable_editingValues", ["edit"]);

            }
	
            if(menu_obj.name === "Restore" || menu_obj.name === "setting" || menu_obj.name === "home") {
                $location.path(menu_obj.href);
            }
            
        });

    });

    /**
     * controller: configurator.controller.wizard_dialog
     */
    util.createController("configurator.controller.frame_dialog", [ "$scope", "$rootScope", "ConfiguratorService", "Constant", "globalSearchData"], function splitPanelController($scope, $rootScope, ConfiguratorService, Constant, globalSearchData) {
        var dialog = jQuery("#cfg_frame_dialog");
        var dialogModal = jQuery("#cfg_frame_dialog_modal");

        var closeDialog = function() {
            dialogModal.addClass("hide");
            dialog.addClass("hide");
            $scope.dialogTemplateUrl = null;
        };

        var openDialog = function(paramObj) {
            var width = 600, height = 500;

            if (paramObj.width != null) {
                width = paramObj.width;
            }

            if (paramObj.height != null) {
                height = paramObj.height;
            }

            $scope.dialogTemplateUrl = paramObj.templateUrl;

            dialogModal.removeClass("hide");
            dialog.width(width);
            dialog.height(height);
            dialog.removeClass("hide");

        };

        $scope.className = "cfg_wizard_dialog hide";
        $scope.dialogTemplateUrl = null;

        window.dialogScope = $scope;

        // binding navigation_menu_item_click event

        $rootScope.$on("navigation_menu_doSearch", function(event, ele){

            var searchTextValue = ele.val();
            var visibility = tibco.ux.service.staticInfo.Setting.visibility;
            ConfiguratorService.MainService({
                action: "searchConfigValues",
                searchText: searchTextValue,
                showHiddenCategory: visibility.showHiddenCategory,
                showHiddenProperty: visibility.showHiddenProperty
            }).then(function(data) {

                $rootScope.$broadcast("navigation_menu_doSearch_getResults", data);

            }, function(error) {
                
            });

            angular.element("#globalSearchResults").show();

            angular.element(document).click(function(event) {
                if(!angular.element(event.target).hasClass('globalSearch')){
                    if(!angular.element(event.target).closest('table').hasClass('globalSearch')){
                        if(angular.element(event.target).attr("id") != "v_scroll_bar_0" && angular.element(event.target).attr("id") != "v_bar_0" ){
                            angular.element("#globalSearchResults").hide();
                        }
                    }
                }
            });
        })
		
		 $rootScope.$on("check_EditStatus_FromDB", function(event) {
            
            ConfiguratorService.MainService({
                action: "editStatus"
            }).then(function(data) {
                $rootScope.$broadcast("EditButton_Status", data);
            }, function(error) {
                $log.info(error);
            });

        })

		$rootScope.$on("Remove_EditLock_FromDB", function(event) {
                    $rootScope.editButtonStatus = false;
		            ConfiguratorService.MainService({
		                action: "deleteLockEntery"
		            }).then(function(data) {
		                // $rootScope.$broadcast("EditButton_Status", data);
		                // $rootScope.$broadcast("navigation_menu_doSearch_getResults", data);

		            }, function(error) {
		                $log.info(error);
		            });

		        })

        $rootScope.$on("navigation_menu_item_click", function(event, menuData) {

            var showContentIn = jQuery.trim(menuData.showContentIn);
            if (showContentIn.indexOf("dialog") === 0) {

                var href = menuData.href;
                if (href.charAt(0) === "#") {
                    href = href.substr(1);
                }

                var templateURL = util.string.splitAndRemoveEmptyOrNull(href);
                templateURL += "/view/template.html";

                // if showContentIn="dialog", show dialog with default size
                if (showContentIn === "dialog") {
                    openDialog({
                        "templateUrl" : templateURL
                    });

                    // if showContentIn="dialog(width,height)", show dialog with specific width and height
                } else if (/dialog\([0-9]+,[0-9]+\)/.test(showContentIn)) {
                    var numArr = util.string.splitAndRemoveEmptyOrNull(showContentIn.substring("dialog(".length, showContentIn.length - 1), ",");
                    openDialog({
                        "templateUrl" : templateURL,
                        "width" : parseInt(numArr[0], 10),
                        "height" : parseInt(numArr[1], 10)
                    });
                } else {
                    throw new Error("please check config.xml. the 'showContentIn' attribute value must be 'dialog' or 'dialog({width}, {height})' ");
                }

                $scope.dialogTemplateUrl = templateURL;
            }

            // close frame dialog
            $rootScope.$on(Constant.eventName.FRAME_DIALOG_CLOSE, function(event, paramObj) {
                closeDialog();
            });

            // open frame dialog
            $scope.$on(Constant.eventName.FRAME_DIALOG_OPEN, function(event, paramObj) {
                openDialog(paramObj);
            });
        });

    });

    util.createController("configurator.controller.common_dialog", [ "$scope", "$rootScope", "$timeout", "globalSearchData"], function($scope, $rootScope, $timeout, globalSearchData) {
        $scope.className = "cfg_wizard_dialog hide";
        $scope.dialogTemplateUrl = null;

        window.dialogScope = $scope;
        function closeDialog() {
            $("body").find("#dialogOverlay").hide();
            angular.element("#cfg_common_dialog").hide();
            $scope.dialogTemplateUrl = null;

        }
        function showDialog() {
            if ($("body").find("#dialogOverlay").length < 1) {
                $("body").append("<div id='dialogOverlay'></div>");
            }
            $("#dialogOverlay").show();
            angular.element("#cfg_common_dialog").show();
        }

        // open wizard dialog
        $scope.$on("cfg_common_dialog_showDialog", function(event, paramObj) {
            $scope.cfgDialogConfig = paramObj;

            angular.element("#cfg_common_dialog").removeClass('Category').removeClass('Item');
            angular.element("#cfg_common_dialog").removeClass('isActive');
            angular.element("#cfg_common_dialog").addClass($scope.cfgDialogConfig.dataType);
            angular.element("#cfg_common_dialog").addClass($scope.cfgDialogConfig.isActive);

            if ($scope.cfgDialogConfig.width) {
                angular.element("#cfg_common_dialog").width($scope.cfgDialogConfig.width + "px");
            }
            if ($scope.cfgDialogConfig.buttons) {
                if ($scope.cfgDialogConfig.height > 120) {
                    angular.element("#cfg_common_dialog").height($scope.cfgDialogConfig.height + "px");
                    angular.element("#cfg_common_dialog").find(".dialogContent").height($scope.cfgDialogConfig.height - 120 + "px");
                } else {
                    angular.element("#cfg_common_dialog").height("160px");
                    angular.element("#cfg_common_dialog").find(".dialogContent").height("40px");
                }
            } else {
                if ($scope.cfgDialogConfig.height > 50) {
                    angular.element("#cfg_common_dialog").height($scope.cfgDialogConfig.height + "px");
                    angular.element("#cfg_common_dialog").find(".dialogContent").height($scope.cfgDialogConfig.height - 50 + "px");
                } else {
                    angular.element("#cfg_common_dialog").height("70px");
                    angular.element("#cfg_common_dialog").find(".dialogContent").height("20px");
                }
            }
            $scope.dialogTemplateUrl = $scope.cfgDialogConfig.templateUrl;
            showDialog();
        });

        // close wizard dialog
        $scope.$on("cfg_common_dialog_closeDialog", function(event, paramObj) {
            closeDialog();
        });

        $scope.$on("cfg_common_dialog_showBtn", function(event, parameter) {
            if ($scope.cfgDialogConfig) {
                $scope.cfgDialogConfig.buttons["button" + parameter].show = true;
            }
        });

        $scope.$on("cfg_common_dialog_disableBtn", function(event, parameter) {
            if ($scope.cfgDialogConfig) {
                $scope.cfgDialogConfig.buttons["button" + parameter].disabled = true;
            }
        });

        $scope.$on("cfg_common_dialog_enableBtn", function(event, parameter) {
            if ($scope.cfgDialogConfig) {
                $scope.cfgDialogConfig.buttons["button" + parameter].disabled = false;
            }
        });

        //change buttons
        $scope.$on("cfg_common_dialog_changeButtons",function(event,paramObj){
            if($scope.cfgDialogConfig){
                $scope.cfgDialogConfig.buttons = paramObj;
            }
        });

        $scope.$on("cfg_common_dialog_showInfoBar",function(event,paramObj){
            if(paramObj.type == "error"){
                $scope.messageType = "alertMsgBar";
                $scope.messageText = paramObj.message;
                infobarAnimation();
            }else if(paramObj.type == "info"){
                $scope.messageType = "confirmMsgBar";
                $scope.messageText = paramObj.message;
                angular.element("#cfg_common_dialog").find(".infobar").fadeIn();
            }
        });

        $scope.$on("cfg_common_dialog_closeInfoBar",function(event,paramObj){
            $scope.closeInfoBar();
        });

        var infobarTimeout = null;
        function infobarAnimation() {
            var infobar = angular.element("#cfg_common_dialog").find(".infobar");
            infobar.css("width", infobar.parent().css("width"));
            jQuery(infobar).fadeIn("fast");
            infobarTimeout = $timeout(function(){
                jQuery(infobar).fadeOut(1500);
            }, 3000);
        }

        $scope.closeInfoBar = function(){
            $timeout.cancel(infobarTimeout);
            var infobar = angular.element("#cfg_common_dialog").find(".infobar");
            infobar.fadeOut();
        };

        var dialog = $('#cfg_common_dialog');
        var dialog_title = dialog.find('.dialogTitle');

        var offset_left = 0;
        var offset_right = 0;

        mouse_left = 0;
        mouse_top = 0;

        var flag = false;
        
        angular.element(dialog_title).mousedown(function(event) {
            flag = true;

            mouse_left = event.clientX;
            mouse_top = event.clientY;

            offset_left = angular.element(dialog[0]).offset().left;
            offset_right = angular.element(dialog[0]).offset().top;
        });

        angular.element(document).bind('mousemove', function(event) {
            if (flag) {
                dialog.css('margin', 'initial');
                dialog.css('left', offset_left - (mouse_left - event.clientX ));
                dialog.css('top', offset_right - (mouse_top - event.clientY));
            }
            
        });

        angular.element(document).bind('mouseup', function(event) {
            flag = false;
        });
    });
    
    /** global search **/
    util.createController("configurator.controller.globalSearch", [ "$scope", "$rootScope", "globalSearchData", "UXI18N", "$timeout"], function($scope, $rootScope, globalSearchData, UXI18N, $timeout) {
        var localNS = "globalSearch";
        $scope.local = {
            property : UXI18N.getString(localNS, "globalSearch.property"),
            location : UXI18N.getString(localNS, "globalSearch.location"),
            value : UXI18N.getString(localNS, "globalSearch.value")
        };

        $scope.results = [];

        $scope.$on('navigation_menu_doSearch_getResults', function(event, data) {
            if (data.length === 0) {
                data[0] = {
                    'name': "no results",
                    'location': '',
                    'value': ''
                }
            } else {
                for (var i = 0, len = data.length; i < len; i ++) {
                    if (data[i].name instanceof Array) {
                        data[i].name = (data[i].name).join(', ');
                    }

                    if (data[i].location instanceof Array) {
                        data[i].location = (data[i].location).join(', ');
                    }

                    if (data[i].value instanceof Array) {
                        data[i].value = (data[i].value).join(', ');
                    }
                };

            }

            $scope.results = data;

            $rootScope.$broadcast("SCROLLTOP_globalSearch");
        });

        $scope.resultSelect = function($event, index){
            var currentElement = angular.element($event.currentTarget);
            var data = {
                'property': currentElement.find('td').eq(0).find('span').html(),
                'location': currentElement.find('td').eq(1).find('span').html().split('-&gt;'),
                'value': currentElement.find('td').eq(2).find('span').html()
            };

            globalSearchData.updataSelectData(data);

            $timeout(function() {
                angular.element("#globalSearchResults").fadeOut();
            }, 500);
        }
    });
    
    util.createController("configurator.controller.messageBarCtrl", [ "$scope", "$rootScope", "$timeout" ], function($scope, $rootScope, $timeout) {
        $scope.messageShow = false;
        $scope.closeMsgBar = function(){
            $scope.messageShow = false;
        }
        $scope.$on("cfgErrorMessage", function(event, message) {
            $scope.messageType = "alertMsgBar";
            $scope.messageShow = true;
            $scope.messageText = message;
            jQuery("#cfgMessageBar").fadeIn("fast");
            infobarTimeout = $timeout(function(){
                jQuery("#cfgMessageBar").fadeOut(1000);
            }, 3000);
        });
        $scope.$on("cfgConfirmMessage", function(event, message){
            $scope.messageType = "confirmMsgBar";
            $scope.messageShow = true;
            $scope.messageText = message;
            jQuery("#cfgMessageBar").fadeIn("fast");
            infobarTimeout = $timeout(function(){
                jQuery("#cfgMessageBar").fadeOut(1000);
            }, 3000);
        });
        $scope.$on("closecfgMessage", function(event){
            $scope.closeMsgBar();
        });
    });

    /** first-time wizzard controller **/
    util.createController("configurator.controller.firsttime_wizzard",["$scope", "$rootScope", "$element", "$http", "UXI18N", "$location", "$timeout"],function($scope, $rootScope, $element, $http, UXI18N, $location, $timeout){
        var localNS = "firsttimeWizzard";
        $scope.local = {
            message_infor1 : UXI18N.getString(localNS, "message_infor1"),
            message_infor2 : UXI18N.getString(localNS, "message_infor2"),
            message_infor3 : UXI18N.getString(localNS, "message_infor3"),
            message_infor4 : UXI18N.getString(localNS, "message_infor4"),
            message_infor5 : UXI18N.getString(localNS, "message_infor5"),
            message_infor6 : UXI18N.getString(localNS, "message_infor6"),
            message_infor7 : UXI18N.getString(localNS, "message_infor7"),
            message_infor8 : UXI18N.getString(localNS, "message_infor8"),
            settingHelp : UXI18N.getString(localNS, "settingHelp"),
            helpInformation : UXI18N.getString(localNS, "helpInformation")
        };

        var message_info = [
            [{
                message : $scope.local.message_infor1,
                placement : "top r",
                right_position : 470,
                top_position : 55
            },
            {
                message : $scope.local.message_infor2,
                placement : "top r",
                right_position : 30,
                top_position : 55
            },
            {
                message : $scope.local.message_infor3,
                placement : "left",
                left_position : 950,
                top_position : 270
            },
            {
                message : $scope.local.message_infor8,
                placement : "top l",
                left_position : 280,
                top_position : 180
            }],
            [{
                message : $scope.local.message_infor4,
                placement : "top",
                left_position : 70,
                top_position : 60
            },
            {
                message : $scope.local.message_infor5,
                placement : "left t",
                left_position : 570,
                top_position : 130
            },
            {
                message : $scope.local.message_infor6,
                placement : "left t",
                left_position : 650,
                top_position : 270
            },
            {
                message : $scope.local.message_infor7,
                placement : "left t",
                left_position : 220,
                top_position : 400
            }]
        ];


        $scope.popover_info = message_info[0];
        $scope.flag = 0;

        $scope.hide = function(){
            $scope.flag++;
        };

        $scope.$watch("flag",function(){
            if($scope.flag<message_info.length){
                $scope.popover_info = message_info[$scope.flag];
            }else{
                $element.addClass("hide");
            }
        });

        $rootScope.$on("navigation_menu_item_click",function(event,menu_obj){
            if(menu_obj.name == "help"){

                if($location.path() === "/configuration"){
                    $scope.flag = 0;
                    $element.removeClass("hide");
                }else{
                    $location.path("/configuration");
                    $timeout(function() {
                        $scope.flag = 0;
                        $element.removeClass("hide");
                    }, 200);
                    
                }
                
            }
        });


    });
    
});
