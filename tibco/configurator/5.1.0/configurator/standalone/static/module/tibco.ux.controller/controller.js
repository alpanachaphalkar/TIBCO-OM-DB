/*! 2017-03-31 */

/* --------------------- Source: module/tibco.mdm.configurator/mainframe/controller/controller.js-------------------- */

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
            menuitem_home : UXI18N.getString(localNS, "menuitem.home"),
            menuitem_editOn : UXI18N.getString(localNS, "menuitem.editOn"),
            menuitem_editOff : UXI18N.getString(localNS, "menuitem.editOff"),
            // menuitem_editLockTimer : UXI18N.getString(localNS, "menuitem.editLockTimer", [$rootScope.time]),
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
            timeoutAutoCancelLock =  $timeout( function(){
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
            var editLockLastMinutTimeout =  $timeout( function(){
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
                                    // $rootScope.$broadcast("cancelBtn_disableActions", ["editCancel"]);
                                    // $rootScope.$broadcast("disable_editingValues", ["edit"]);
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
                // $rootScope.$broadcast("navigation_menu_doSearch_getResults", data);

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


/* --------------------- Source: module/tibco.mdm.configurator/configuration/controller/controller.js-------------------- */
(function() {
    var util = configurator.util;

    util.createController("configurator.configuration.controller", ["$rootScope", "$scope", "$log", "ConfiguratorService", "globalSearchData", "$timeout"], function mainController($rootScope, $scope, $log, ConfiguratorService, globalSearchData, $timeout) {

        //get some useful static data
        if(!(tibco.ux.service.staticInfo && tibco.ux.service.staticInfo.Setting)) {
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

        $scope.changeConfiguration = function(selectedObj){
            ConfiguratorService.MainService({
                action: "loadSessionConfigDoc",
                path: selectedObj.path
            }).then(function(data) {
                $scope.$broadcast("RELOAD_ALL_THREE_PANEL");
            }, function(error) {
                
            });     
        };

        $scope.initAction = function(){
            $rootScope.initialInfo = $scope.initialInfo = {
                'clusterName': {
                    'value': '',
                    'type': ''
                },
                'configurationName': {
                    'value': '',
                    'type': ''
                },
                'propertyName': {
                    'value': '',
                    'type': 'Basic'
                },
                'clusterData': {},
                'configData': {
                    'Basic': [],
                    'Advanced': []
                },
                'InitialConfigName' : '',
                'CategoryNameArr' : [],
                'parentCategory' : '',
                'configuration_visibility': 'Basic'
            };

            $scope.highlight = {
                'cluster' : '',
                'configuration' : ''
            };

            $scope.extend = {
                'cluster' : {
                    'level0' : ''
                },
                'configuration' : {
                    'level0' : '',
                    'level1' : ''
                }
            };

            $scope.basicList = [];

            angular.element('.bodyDiv>.headerDiv').removeClass('hide');
            angular.element('.buildGround').children('.footerDiv').removeClass('hide');
        };

        $scope.initAction();
    });

    util.createController("cfg.configurationOutline.controller", ["$rootScope", "$scope", "$log", "$element", "$timeout", "$http", "MDMCfgDialog", "ConfiguratorService", "MDMValidation", "MDMCfgMsgBar", "globalSearchData", "UXI18N", "scrollbar", "serverDeployInfo"], function mainController($rootScope, $scope, $log, $element, $timeout, 
        $http, MDMCfgDialog, ConfiguratorService, MDMValidation, MDMCfgMsgBar, globalSearchData, UXI18N, scrollbar, serverDeployInfo) {
        var localNSPublic = "public";
        var localNS = "configuration";
        $scope.local = {
            editUppercase : UXI18N.getString(localNSPublic, "button.editUppercase"),
            cloneUppercase : UXI18N.getString(localNSPublic, "button.cloneUppercase"),
            deleteUppercase : UXI18N.getString(localNSPublic, "button.deleteUppercase"),
            save : UXI18N.getString(localNSPublic, "button.save1"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            outlineCluster : UXI18N.getString(localNS, "outline.cluster"),
            outlineConfiguration : UXI18N.getString(localNS, "outline.configuration"),
            buttonBasic : UXI18N.getString(localNS, "button.basic"),
            buttonAdvanced : UXI18N.getString(localNS, "button.advanced"),
            editClusterDetail : UXI18N.getString(localNS, "editClusterDetail"),
            editServerDetail : UXI18N.getString(localNS, "editServerDetail"),
            editConfigurationDetail : UXI18N.getString(localNS, "editConfigurationDetail"),
            cloneMember : UXI18N.getString(localNS, "cloneMember"),
            cloneCategory : UXI18N.getString(localNS, "cloneCategory"),
            deleteItem : UXI18N.getString(localNS, "delete"),
            confirmDelete : UXI18N.getString(localNS, "confirmDelete"),
            deleteMessageAtOutline : UXI18N.getString(localNS, "deleteMessageAtOutline"),
            deleteMessageAtOutlineMember : UXI18N.getString(localNS, "deleteMessageAtOutlineMember"),
            deleteMessageAtOutlineCategory : UXI18N.getString(localNS, "deleteMessageAtOutlineCategory"),
            renameInformation : UXI18N.getString(localNS, "renameInformation"),
            editInformation : UXI18N.getString(localNS, "editInformation"),
            errorInformation : UXI18N.getString(localNS, "errorInformation"),
            cloneMemberInformation : UXI18N.getString(localNS, "cloneMemberInformation"),
            cloneCatrgoryInformation : UXI18N.getString(localNS, "cloneCatrgoryInformation"),
            deleteMemberInformation : UXI18N.getString(localNS, "deleteMemberInformation"),
            deleteCatrgoryInformation : UXI18N.getString(localNS, "deleteCatrgoryInformation"),
            Name : UXI18N.getString(localNS, "doValidateName")
        };

        $scope.widthSize = {
            leftPanel : null,
            rightPanel : null,
            level0 : null,
            level1 : null,
            level2 : null
        };

        $scope.init = function() {

            ConfiguratorService.MainService({
                action: 'cluster'
            }).then(function(data) {
                var items = data.group.items;
                $scope.initialInfo.clusterData = items;
                $scope.initialInfo.clusterName.value = items[0].id;
                $scope.initialInfo.InitialConfigName = items[0].id;
                $scope.highlight.cluster = items[0].id;

                if($scope.initialInfo.clusterData.length > 0) {
                    serverDeployInfo.initFlags($scope.initialInfo.clusterData[0].subItem);
                }

                ConfiguratorService.MainService({
                    action: 'getCategory',
                    serverName: items[0].id,
                    visibility: 'Basic'
                }).then(function(data) {
                    $scope.initialInfo.configData.Basic = data.categoryList;
                    $scope.initialInfo.configurationName.value = $scope.initialInfo.configData.Basic[0].id;
                    $scope.initialInfo.propertyName.value = $scope.initialInfo.configData.Basic[0].id;
                    $scope.initialInfo.CategoryNameArr = [$scope.initialInfo.configData.Basic[0].id];
                    $scope.initialInfo.parentCategory =  $scope.initialInfo.CategoryNameArr.length > 1 ? $scope.initialInfo.CategoryNameArr[$scope.initialInfo.CategoryNameArr.length - 2] : '';
                    
                    $scope.highlight.configuration = $scope.initialInfo.configData.Basic[0].id;
                    for(var i = 0; i < data.categoryList.length; i++) {
                        $scope.basicList.push(data.categoryList[i].id);
                    }

                    ConfiguratorService.MainService({
                        action: 'getCategory',
                        serverName: items[0].id,    
                        visibility: 'Advanced'
                    }).then(function(data) {
                        $scope.initialInfo.configData.Advanced = data.categoryList;
                    }, function(errorMsg) {
                        $log.info(errorMsg);
                    });

                }, function(errorMsg) {
                    $log.info(errorMsg);
                });

            }, function(error) {
                $log.info(error);
            });

        };

        $scope.leftPanelButtenClick = function(type) {

            var checking = function(element, callback) {
                var waiting = setInterval(function() {

                    if (!element.hasClass('hide')) {
                        callback();
                        clearInterval(waiting);
                    }
                }, 100);
            };

            var selectedItemClick = function(element) {

                var highlightItem = element.find('.highlight');
                $rootScope.$broadcast("SCROLLTOP_config" + $scope.initialInfo.propertyName.type, highlightItem);
                
            };

            var element;

            if (type === 'basic') {

                var flag = false;
                for(var i = 0; i<$scope.basicList.length; i++) {
                    if($scope.highlight.configuration === $scope.basicList[i]){
                        flag = true;
                        break;
                    }
                }

                if(!flag) {
                    $scope.highlight.configuration = $scope.basicList[0];
                    $scope.initialInfo.propertyName.value = $scope.basicList[0];
                    $scope.initialInfo.CategoryNameArr = [$scope.basicList[0]];
                    $scope.initialInfo.parentCategory =  $scope.initialInfo.CategoryNameArr.length > 1 ? $scope.initialInfo.CategoryNameArr[$scope.initialInfo.CategoryNameArr.length - 2] : '';
                    $scope.extend.configuration.level0 = '';
                    $scope.extend.configuration.level1 = '';
                }

                $scope.initialInfo.configuration_visibility = 'Basic';
                $scope.initialInfo.propertyName.type = $scope.initialInfo.configuration_visibility;
                element = angular.element("#configurationpanel").find(".configurationCategoryContainer").children('.basic');

                checking(element, function() {
                    selectedItemClick(element);
                });
            } else {
                $scope.initialInfo.configuration_visibility = 'Advanced';
                $scope.initialInfo.propertyName.type = $scope.initialInfo.configuration_visibility;
                element = angular.element("#configurationpanel").find(".configurationCategoryContainer").children('.advanced');
                checking(element, function() {
                    selectedItemClick(element);
                    // var width = angular.element(".leftPanel").width();
                });
            }
        };

        $scope.configurationItemClicked = function($event, $index, level, type) {
            $event.preventDefault();
            $event.stopPropagation();

            var currentElement = angular.element($event.currentTarget);
            var string = currentElement.children().children('.itemTitle').html();
            var visibilityType = $scope.initialInfo.configuration_visibility;
            var visibilityTypeReversd = visibilityType == 'Basic' ? 'Advanced' : 'Basic';
            

            if (type === 'cluster') {

                if(!($scope.highlight.cluster == string)) {

                    $scope.highlight.cluster = string;
                    $scope.initialInfo.clusterName.value = string;

                    $rootScope.$broadcast("SCROLLTOP_configBasic");
                    $rootScope.$broadcast("SCROLLTOP_configAdvanced");

                    ConfiguratorService.MainService({
                        action: 'getCategory',
                        serverName: string,
                        visibility: visibilityType
                    }).then(function(data) {
                        $scope.initialInfo.configData[visibilityType] = data.categoryList;
                        if($scope.initialInfo.configData[visibilityType].length) {
                            $scope.initialInfo.configurationName.value = $scope.initialInfo.configData[visibilityType][0].id;
                            $scope.initialInfo.propertyName.value = $scope.initialInfo.configData[visibilityType][0].id;
                            $scope.initialInfo.CategoryNameArr = [$scope.initialInfo.configData[visibilityType][0].id];
                            $scope.initialInfo.parentCategory =  $scope.initialInfo.CategoryNameArr.length > 1 ? $scope.initialInfo.CategoryNameArr[$scope.initialInfo.CategoryNameArr.length - 2] : '';

                            $scope.highlight.configuration = $scope.initialInfo.configData[visibilityType][0].id;
                            $scope.extend.configuration.level0 = '';
                            $scope.extend.configuration.level1 = '';

                            if(visibilityType === 'Basic') {
                                $scope.basicList = [];
                                for(var i = 0; i < data.categoryList.length; i++) {
                                    $scope.basicList.push(data.categoryList[i].id);
                                }
                            }
                        }

                        $timeout(function() {
                            var itemTitle = angular.element(".leftPanel .itemTitle.level0");
                            var itemTitlelevel1 = angular.element(".leftPanel .itemTitle.level1");
                            var itemTitlelevel2 = angular.element(".leftPanel .itemTitle.level2");
                            itemTitle.css("width", $scope.widthSize.width_level0);
                            itemTitlelevel1.css("width", $scope.widthSize.width_level1);
                            itemTitlelevel2.css("width", $scope.widthSize.width_level2);
                        }, 1000);

                        ConfiguratorService.MainService({
                            action: 'getCategory',
                            serverName: string,    
                            visibility: visibilityTypeReversd
                        }).then(function(data) {
                            $scope.initialInfo.configData[visibilityTypeReversd]= data.categoryList;
                            if(visibilityTypeReversd === 'Basic') {
                                $scope.basicList = [];
                                for(var i = 0; i < data.categoryList.length; i++) {
                                    $scope.basicList.push(data.categoryList[i].id);
                                }
                            }
                            
                            $timeout(function() {
                                var itemTitle = angular.element(".leftPanel .itemTitle.level0");
                                var itemTitlelevel1 = angular.element(".leftPanel .itemTitle.level1");
                                var itemTitlelevel2 = angular.element(".leftPanel .itemTitle.level2");
                                itemTitle.css("width", $scope.widthSize.width_level0);
                                itemTitlelevel1.css("width", $scope.widthSize.width_level1);
                                itemTitlelevel2.css("width", $scope.widthSize.width_level2);
                            }, 1000);
                        }, function(errorMsg) {
                            $log.info(errorMsg);
                        });
                    }, function(errorMsg) {
                        $log.info(errorMsg);
                    });
                }

                if(level == "level0") {
                    if(serverDeployInfo.getInitialConfigFlag()) {
                        $rootScope.$broadcast("edittable_enableActions", ["deploy"]);
                    }else{
                        $rootScope.$broadcast("edittable_disableActions", ["deploy"]);
                    }
                }else {
                    if(serverDeployInfo.getServerFlag(string)) {
                        $rootScope.$broadcast("edittable_enableActions", ["deploy"]);
                    }else{
                        $rootScope.$broadcast("edittable_disableActions", ["deploy"]);
                    }
                }

            } else {

                $scope.highlight.configuration = string;
                $scope.initialInfo.propertyName.value = string;

                var parentLi = $($event.target).parents("li");
                if(parentLi.length === 0) {
                    parentLi = $($event.target);
                }

                var nameArr = [];
                parentLi.each(function(index, element) {
                    nameArr.push($(element).find("span:eq(0)").attr("marker"));
                });

                $scope.initialInfo.CategoryNameArr = nameArr.reverse();
                $scope.initialInfo.parentCategory =  $scope.initialInfo.CategoryNameArr.length > 1 ? $scope.initialInfo.CategoryNameArr[$scope.initialInfo.CategoryNameArr.length - 2] : '';
            }
        };


        $scope.configurationItemArrowClicked = function($event, level, type) {

            var currentElement = angular.element($event.currentTarget);
            var string = $(currentElement).next('span').html();

            if(string === $scope.extend[type][level]){
                $scope.extend[type][level] = '';
            }else{
                $scope.extend[type][level] = string;
            }
        };

        $scope.configurationMenuIconClicked = function($event, scrollContainer) {

            var target = angular.element($event.currentTarget);

            var count = 0;
            for (var i = 0, len = target.children().children('li').length; i < len; i++) {
                if (target.children().children('li').eq(i).hasClass('hide')) {
                    count++;
                }
            }
            angular.element('.positionChange-0').removeClass('positionChange-0');
            angular.element('.positionChange-1').removeClass('positionChange-1');
            angular.element('.positionChange-2').removeClass('positionChange-2');
            var pageY = $event.pageY;
            var screenHeight = $(document).height();
            var menuHeight = 111;
            var moveValue = 0;
            if ((screenHeight - pageY) <= menuHeight) {

                switch (count) {
                    case 0:
                        target.children('.menu').addClass('positionChange-0');
                        moveValue = -95;
                        break;
                    case 1:
                        target.children('.menu').addClass('positionChange-1');
                        moveValue = -62;
                        break;
                    case 2:
                        target.children('.menu').addClass('positionChange-2');
                        moveValue = -29;
                        break;
                }

            }
            var icon = target;
            icon.children().toggleClass('hide');

            var position = $(scrollContainer).scrollTop();
            if(position != 0) {
                var ulMenu = $(target).find("ul");
                var marginTopValue = moveValue - position;
                ulMenu.css({"marginTop": marginTopValue + "px"});
            }
        };

        $scope.configurationMenuPanelClicked = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
        };

        $scope.configurationMenuItemClicked = function($event, action, level, group) {
            $event.preventDefault();
            $event.stopPropagation();

            var currentElement = angular.element($event.currentTarget);
            var groupName = group;

            var string = currentElement.closest('.menu-icon').siblings('.itemTitle').html();
            var subLevel = currentElement.closest('.menu-icon').parent().attr('class');
            var category = angular.element('.configurationCategoryContainer').children('.basic').hasClass('hide') ? 'Advanced' : 'Basic';
            var closestLevel = currentElement.closest('.menu-icon').siblings();
            var fatherString = currentElement.closest('ul.'+level).siblings('.list').children('.itemTitle').html();

            var className = 'level' + (parseInt(/\d+/.exec(level), 10) - 1);
            var grundFatherString = currentElement.closest('ul.'+ className).siblings('.list').children('.itemTitle').html();

            var dataType = currentElement.parent().parent().parent().siblings('span').attr('datatype');
            var isActive = currentElement.parent().parent().parent().siblings('span').attr('isactive');

            var relateData = groupName === 'Cluster'? $scope.initialInfo.clusterData : $scope.initialInfo.configData[category];

            var result = {};
            if (level === 'level0') {
                for (var i = 0, len = relateData.length; i < len; i++) {
                    if (relateData[i].name === string) {
                        result = relateData[i];
                        break;
                    }
                }
            } else if (level === 'level1') {
                for (var j = 0, len = relateData.length; j < len; j++) {
                    if (relateData[j].name === fatherString) {
                        result = relateData[j].subItem;
                        break;
                    }
                }

                for (var m = 0, len = result.length; m < len; m++) {
                    if (result[m].name === string) {
                        result = result[m];
                        break;
                    }
                }
            } else {
                for (var k = 0, len = relateData.length; k < len; k++) {
                    if (relateData[k].name === grundFatherString) {
                        result = relateData[k].subItem;
                        break;
                    }
                }

                for (var n = 0, len = result.length; n < len; n++) {
                    if (result[n].name === fatherString) {
                        result = result[n].subItem;
                        break;
                    }
                }

                for (var p = 0, len = result.length; p < len; p++) {
                    if (result[p].name === string) {
                        result = result[p];
                        break;
                    }
                }
            }

            $scope.menuItemClickedHandler(action, groupName, result, category, dataType, isActive);

        };


        // function not completed, need to do
        $scope.mouseEnter = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            angular.element('.leftPanel .menu-icon').addClass('hide');
            angular.element('.leftPanel .menu').addClass('hide');

            angular.element($event.currentTarget).children('.menu-icon').removeClass('hide');
        };

        $scope.mouseLeave = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            angular.element($event.currentTarget).children('.menu-icon').addClass('hide');
            angular.element($event.currentTarget).children('.menu-icon').children('ul').addClass('hide');
        };

        // actions if edit menu
        $scope.menuItemClickedHandler = function(editType, groupName, item, category, dataType, isActive, index, searchPool) {

            MDMCfgDialog.data.editTree = angular.copy(item);
            switch (editType) {
                case "edit":
                    if (groupName === "Cluster") {
                        var titleStr= $scope.local.editClusterDetail;
                        if(item && item.level && item.level > 1){
                            titleStr= $scope.local.editServerDetail;
                        }

                        if(item.name === $scope.initialInfo.InitialConfigName){
                            MDMCfgDialog.data.editTree.isServer = false;
                        }else{
                            MDMCfgDialog.data.editTree.isServer = true;
                        }

                        MDMCfgDialog.showDialog({
                            title:titleStr,
                            isActive: isActive ? 'isActive' : '',
                            templateUrl: "module/tibco.mdm.configurator/dialog/view/edit_server.html",
                            width: 700,
                            height:345,
                            buttons: {
                                button3: {
                                    text: $scope.local.save,
                                    show: true,
                                    method: function() {
                                        MDMValidation.doValidate([{
                                            keys: [{
                                                key: "name",
                                                value: $scope.local.Name
                                            }],
                                            object: MDMCfgDialog.data.editTree,
                                            required: true
                                        }], function() {
                                            var serverjson = [{
                                                name: MDMCfgDialog.data.editTree.name,
                                                description: MDMCfgDialog.data.editTree.description
                                            }];
                                            
                                            ConfiguratorService.MainService({
                                                action: "editServer",
                                                serverName: item.name,
                                                serverJson: angular.toJson(serverjson),
                                                visibility: $scope.initialInfo.propertyName.type
                                            }).then(function(data) {
                                                if(item.name === $scope.initialInfo.InitialConfigName) {
                                                    $scope.initialInfo.InitialConfigName = MDMCfgDialog.data.editTree.name;
                                                }else{
                                                    serverDeployInfo.renameFlag(item.name, serverjson[0].name);
                                                }

                                                if (data) {
                                                    $scope.initialInfo.clusterData = data.group.items;
                                                    $scope.highlight.cluster = serverjson[0].name;
                                                    $scope.initialInfo.clusterName.value =  serverjson[0].name;
                                                }
                                                
                                                $rootScope.$broadcast("edittable_enableActions", ["save"]);
                                                MDMCfgMsgBar.showConfirmMsg($scope.local.renameInformation, "homepage");
                                                MDMCfgDialog.closeDialog();

                                            }, function(error) {
                                                MDMCfgDialog.showInfoBar("error", error);
                                            });

                                        });
                                    }
                                },
                                button4: {
                                    text:  $scope.local.cancel,
                                    show: true,
                                    method: function() {
                                        MDMCfgDialog.closeDialog();
                                    }
                                }
                            }
                        });
                    } else if (groupName === "Configuration") {
                        MDMCfgDialog.showDialog({
                            title: $scope.local.editConfigurationDetail,
                            dataType: dataType,
                            isActive: isActive == 'true' ? 'isActive' : '',
                            templateUrl: "module/tibco.mdm.configurator/dialog/view/edit_configuration.html",
                            width: 700,
                            height: 420,
                            buttons: {
                                button3: {
                                    text: $scope.local.save,
                                    show: true,
                                    method: function() {
                                        MDMValidation.doValidate([{
                                            keys: [{
                                                key: "name",
                                                value: $scope.local.Name
                                            }],
                                            object: MDMCfgDialog.data.editTree,
                                            required: true
                                        }], function() {
                                            var categoryJson = [];
                                            categoryJson.push(MDMCfgDialog.data.editTree);

                                            ConfiguratorService.MainService({
                                                action: "editCategory",
                                                serverName: $scope.initialInfo.clusterName.value,
                                                parentCategory : $scope.initialInfo.parentCategory,
                                                categoryName: item.name,
                                                categoryJson: angular.toJson(categoryJson),
                                                visibility: $scope.initialInfo.propertyName.type
                                            }).then(function(data) {

                                                if (data) {
                                                    $scope.initialInfo.configData[$scope.initialInfo.propertyName.type] = data.categoryList;

                                                    if($scope.initialInfo.propertyName.type === 'Basic') {
                                                        $scope.basicList = [];
                                                        for(var i = 0; i < data.categoryList.length; i++) {
                                                            $scope.basicList.push(data.categoryList[i].id);
                                                        }
                                                        
                                                    }

                                                }

                                                var inverseVisibility = $scope.initialInfo.propertyName.type === "Basic" ? "Advanced" : "Basic";

                                                ConfiguratorService.MainService({
                                                    action: 'getCategory',
                                                    serverName: $scope.initialInfo.clusterName.value,    
                                                    visibility: inverseVisibility
                                                }).then(function(data) {
                                                    $scope.initialInfo.configData[inverseVisibility] = data.categoryList;

                                                }, function(errorMsg) {
                                                    $log.info(errorMsg);
                                                });

                                                $rootScope.$broadcast("edittable_enableActions", ["save"]); 
                                                MDMCfgDialog.closeDialog();
                                                MDMCfgMsgBar.showConfirmMsg($scope.local.editInformation, "homepage");
                                            }, function(error) {
                                                MDMCfgDialog.showInfoBar("error", error);
                                            });

                                        });
                                    }
                                },
                                button4: {
                                    text: $scope.local.cancel,
                                    show: true,
                                    method: function() {
                                        MDMCfgDialog.closeDialog();
                                    }
                                }
                            }
                        });
                    }

                    break;
                case "clone":
                    MDMCfgDialog.data['groupName'] = groupName;
                    MDMCfgDialog.showDialog({
                        title: groupName === "Cluster" ? $scope.local.cloneMember : $scope.local.cloneCategory,
                        templateUrl: "module/tibco.mdm.configurator/dialog/view/applyTree_clone.html",
                        width: 700,
                        height: 300,
                        buttons: {
                            button3: {
                                text: $scope.local.save,
                                show: true,
                                method: function() {
                                    var sendData = {
                                        "name": MDMCfgDialog.data.cloneApplyTree
                                    };
                                    MDMValidation.doValidate([{
                                        keys: [{
                                            key: "name",
                                            value: $scope.local.Name
                                        }],
                                        object: sendData,
                                        required: true
                                    }], function() {
                                        if (groupName === "Cluster") {
                                            ConfiguratorService.MainService({
                                                action: "cloneServer",
                                                serverName: MDMCfgDialog.data.cloneApplyTree,
                                                clonedServerName: item.name,
                                                visibility: $scope.initialInfo.propertyName.type
                                            }).then(function(data) {
                                                serverDeployInfo.addFlag(MDMCfgDialog.data.cloneApplyTree);
                                                $scope.initialInfo.clusterData = data.group.items;
                                                $rootScope.$broadcast("edittable_enableActions", ["save"]);
                                                MDMCfgDialog.closeDialog();
                                                MDMCfgMsgBar.showConfirmMsg($scope.local.cloneMemberInformation, "homepage");

                                                $timeout(function() {
                                                    var dom = $("#clusterpanel ul.level1>li:last");
                                                    $rootScope.$broadcast("SCROLLTOP_cluster", dom);
                                                }, 300);

                                            }, function(error) {
                                                MDMCfgDialog.showInfoBar("error", error);
                                            });

                                        } else if (groupName === "Configuration") {
                                            ConfiguratorService.MainService({
                                                action: "cloneCategory",
                                                serverName: $scope.initialInfo.clusterName.value,
                                                parentCategory : $scope.initialInfo.parentCategory,
                                                categoryName: MDMCfgDialog.data.cloneApplyTree,
                                                clonedCategoryName: item.name,
                                                visibility: $scope.initialInfo.propertyName.type
                                            }).then(function(data) {
                                                $scope.initialInfo.configData[$scope.initialInfo.propertyName.type] = data.categoryList;
                                                
                                                $rootScope.$broadcast("edittable_enableActions", ["save"]); 
                                                if($scope.initialInfo.propertyName.type === 'Basic') {
                                                    $scope.basicList = [];
                                                    for(var i = 0; i < data.categoryList.length; i++) {
                                                        $scope.basicList.push(data.categoryList[i].id);
                                                    }
                                                }

                                                MDMCfgDialog.closeDialog();
                                                MDMCfgMsgBar.showConfirmMsg($scope.local.cloneCatrgoryInformation, "homepage");

                                                // $scope.init();
                                            }, function(error) {
                                                MDMCfgDialog.showInfoBar("error", error);
                                            });
                                        }
                                    });
                                }
                            },
                            button4: {
                                text: $scope.local.cancel,
                                show: true,
                                method: function() {
                                    MDMCfgDialog.closeDialog();
                                }
                            }
                        }
                    });
                    break;
                case "delete":
                    var deleteMessageShowing = (groupName === "Cluster") ? $scope.local.deleteMessageAtOutlineMember : $scope.local.deleteMessageAtOutlineCategory;
                    MDMCfgDialog.showMessage($scope.local.confirmDelete, deleteMessageShowing, {
                        button3: {
                            text: $scope.local.deleteItem,
                            show: true,
                            method: function() {
                                if (groupName === "Cluster") {
                                    ConfiguratorService.MainService({
                                        action: "deleteServer",
                                        serverName: item.name,
                                        visibility: $scope.initialInfo.propertyName.type
                                    }).then(function(data) {
                                        serverDeployInfo.deleteFlag(item.name);
                                        $scope.initialInfo.clusterData = data.group.items;
                                        $rootScope.$broadcast("edittable_enableActions", ["save"]);
                                        $rootScope.$broadcast("edittable_disableActions", ["deploy"]);
                                        MDMCfgDialog.closeDialog();
                                        MDMCfgMsgBar.showConfirmMsg($scope.local.deleteMemberInformation, "homepage");
                                    }, function(error) {
                                        MDMCfgDialog.closeDialog();
                                        MDMCfgMsgBar.showErrorMsg(error, "homepage");
                                    });
                                } else if (groupName === "Configuration") {
                                    ConfiguratorService.MainService({
                                        action: "deleteCategory",
                                        serverName: $scope.initialInfo.clusterName.value,
                                        parentCategory : $scope.initialInfo.parentCategory,
                                        categoryName: item.name,
                                        visibility: $scope.initialInfo.propertyName.type
                                    }).then(function(data) {
                                        $scope.initialInfo.configData[$scope.initialInfo.propertyName.type] = data.categoryList;
                                        $rootScope.$broadcast("edittable_enableActions", ["save"]); 
                                        MDMCfgDialog.closeDialog();
                                        MDMCfgMsgBar.showConfirmMsg($scope.local.deleteCatrgoryInformation, "homepage");

                                        // $scope.init();
                                    }, function(error) {
                                        MDMCfgDialog.closeDialog();
                                        MDMCfgMsgBar.showErrorMsg(error, "homepage");
                                    });
                                }

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
                    break;
                default:
                    break;
            }
        };


        // watch keyboard actions
        $scope.keyArrowHandler = function(elem) {

            var flag = false;
            var element = null;


            $(document).on('mouseenter', elem, function(e) {
                var $this = $(this);
                element = $(this);

                flag = true;
            });

            $(document).on('mouseleave', elem, function(e) {
                var $this = $(this);
                element = $(this);

                flag = false;
            });

            $(document).on('keydown', function(e) {

                if (!flag) return;

                if (elem === '.editaBtn') {
                    if (element.children('ul').hasClass('hide')) return;

                    e.preventDefault();
                    e.stopPropagation();

                    if (e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 27 || e.keyCode === 13) {

                        var currentSelectIndex = element.find('ul').children('li').index(element.find('ul').children('li.focused'));

                        if (e.keyCode === 27) {
                            element.find('ul').toggleClass('hide');
                            return;
                        }

                        if (e.keyCode === 13 && currentSelectIndex >= 0) {
                            element.find('ul li a.focused').click();
                            return;
                        }


                        if (currentSelectIndex === -1) {
                            currentSelectIndex = 0;
                            element.find('ul').children('li').removeClass('focused').children("a").removeClass('focused').children("i").removeClass('icon-white');
                            element.find('ul').children('li').eq(currentSelectIndex).addClass('focused').children("a").addClass('focused').children("i").addClass('icon-white');

                            return;
                        }

                        if (e.keyCode === 38 && currentSelectIndex > 0) {
                            currentSelectIndex = currentSelectIndex - 1;
                        } else if (e.keyCode === 40 && currentSelectIndex < element.find('ul>li').length - 1) {
                            currentSelectIndex = currentSelectIndex + 1;
                        } else {
                            return;
                        }

                        element.find('ul').children('li').removeClass('focused').children("a").removeClass('focused').children("i").removeClass('icon-white');
                        element.find('ul').children('li').eq(currentSelectIndex).addClass('focused').children("a").addClass('focused').children("i").addClass('icon-white');

                    }
                }



            });
        };

        $scope.globalSearchMarker = function(data) {
            var location = data['location'];
            var property = data['property'];
            var value = data['value'];

            var clusterPanel = angular.element('#clusterpanel');
            var configurationPanel = angular.element('#configurationpanel .basic');
            var cfgEditTable = angular.element('.edit-table .body');

            // marker cluster category
            var clusterCategory = clusterPanel.find('span[marker = "' + location[0] + '"]').eq(0);

            clusterPanel.find('.level0-0').addClass('extend');

            $timeout(function() {
                clusterCategory.parent().parent().click();
                var dom = clusterCategory.parents("li");
                $rootScope.$broadcast("SCROLLTOP_cluster", dom);
            });

            if($scope.initialInfo.clusterName.value === location[0]){
                pointConfiguration();
            }else {
                $scope.$on("ngRepeatFinished_configAdvanced", function(event) {
                    pointConfiguration();
                });
            }

            function pointConfiguration() {

                var CategoryNameArr = angular.copy(location);
                CategoryNameArr.splice(0,1);

                $scope.initialInfo.CategoryNameArr = CategoryNameArr;
                $scope.initialInfo.propertyName.value = location[location.length - 1];
                $scope.initialInfo.parentCategory = location.length > 2 ? location[location.length - 2] : "";

                var configurationCategoryLevel1 = configurationPanel.find('span[marker = "' + location[1] + '"]').eq(0);
                $scope.initialInfo.configuration_visibility = 'Advanced';
                $scope.initialInfo.propertyName.type = $scope.initialInfo.configuration_visibility;
                $scope.leftPanelButtenClick('advanced');

                if (location.length === 2) {
                    configurationCategoryLevel1 = configurationPanel.find('span[marker = "' + location[1] + '"]').eq(0);

                    configurationPanel.find('.highlight').removeClass('highlight');
                    configurationPanel.find('.extend').children('ul').children('li').addClass('hide');
                    configurationPanel.find('.extend').removeClass('extend');
                    configurationCategoryLevel1.parent().parent().addClass('highlight');
                    

                } else if (location.length === 3) {
                    configurationCategoryLevel1 = configurationPanel.find('span[marker = "' + location[1] + '"]').eq(0);

                    configurationPanel.find('.highlight').removeClass('highlight');
                    configurationPanel.find('.extend').children('ul').children('li').addClass('hide');
                    configurationPanel.find('.extend').removeClass('extend');

                    configurationCategoryLevel1.parent().parent().addClass('extend');
                    configurationCategoryLevel1.parent().siblings('ul').children('li').removeClass('hide');

                    var configurationCategoryLevel2 = configurationCategoryLevel1.parent().siblings('ul').find('span[marker = "' + location[2] + '"]');
                    configurationCategoryLevel2.parent().parent().addClass('highlight');
                    

                } else if (location.length === 4) {

                    configurationCategoryLevel1 = configurationPanel.find('span[marker = "' + location[1] + '"]').eq(0);
                    configurationCategoryLevel2 = configurationCategoryLevel1.parent().siblings('ul').find('span[marker = "' + location[2] + '"]').eq(0);
                    configurationCategoryLevel3 = configurationCategoryLevel2.parent().siblings('ul').find('span[marker = "' + location[3] + '"]').eq(0);

                    configurationPanel.find('.highlight').removeClass('highlight');
                    configurationPanel.find('.extend').children('ul').children('li').addClass('hide');
                    configurationPanel.find('.extend').removeClass('extend');

                    configurationCategoryLevel1.parent().parent().addClass('extend');
                    configurationCategoryLevel1.parent().siblings('ul').children('li').removeClass('hide');

                    configurationCategoryLevel2.parent().parent().addClass('extend');
                    configurationCategoryLevel2.parent().siblings('ul').children('li').removeClass('hide');

                    configurationCategoryLevel3.parent().parent().addClass('highlight');
                }
            }

            // marker property category
            cfgEditTable.find('.selected').removeClass('selected');
            var liInterval = setInterval(function() {
                if (cfgEditTable.find('.row').hasClass('last')) {
                    var itemsInterval = setInterval(function() {
                        if (cfgEditTable.find('div[marker = "' + property + '"]').length > 0) {
                            var cfgEditTr = cfgEditTable.find('div[marker = "' + property + '"]');

                            $rootScope.$broadcast("TABLE_SELECTED_CHANGE", cfgEditTr.closest('.row').index());

                            cfgEditTr.closest('.row').addClass('selected');
                            var dom = jQuery(cfgEditTr.closest('.row'));
                            $rootScope.$broadcast("SCROLLTOP_propertyTable", dom);
                            clearInterval(itemsInterval);
                        }
                    }, 100);
                    clearInterval(liInterval);
                }
            }, 200);
        }

        $rootScope.$on('globalSearchDataUpdate', function(event) {
            $scope.globalSearchMarker(globalSearchData.selectData);
        });

        $scope.keyArrowHandler('.editaBtn');

        $scope.init();

        $scope.$on("RELOAD_ALL_THREE_PANEL", function(event) {
            $scope.initAction();
            $scope.init();
        });

    });

    util.createController("cfg.configurationLayout.controller", ["$scope", "$rootScope", "$log", "$timeout", "$http", "ConfiguratorService", "MDMCfgDialog", "MDMValidation", "MDMCfgMsgBar", "UXI18N", "scrollbar", "serverDeployInfo"], function mainController($scope, $rootScope, $log, $timeout, $http, ConfiguratorService, MDMCfgDialog, MDMValidation, MDMCfgMsgBar, UXI18N, scrollbar, serverDeployInfo) {
        var localNSPublic = "public";
        var localNS = "configuration";
        $scope.local = {
            save : UXI18N.getString(localNSPublic, "button.save1"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            finish : UXI18N.getString(localNSPublic, "button.finish"),
            clone : UXI18N.getString(localNS, "clone"),
            deleteItem : UXI18N.getString(localNS, "delete"),
            confirmDelete : UXI18N.getString(localNS, "confirmDelete"),
            deleteMessage : UXI18N.getString(localNS, "deleteMessage"),
            addNewProperty : UXI18N.getString(localNS, "addNewProperty"),
            addpropertyInformation : UXI18N.getString(localNS, "addpropertyInformation"),
            propertyCloneInformation : UXI18N.getString(localNS, "propertyCloneInformation"),
            propertyEditInformation : UXI18N.getString(localNS, "propertyEditInformation"),
            Name : UXI18N.getString(localNS, "doValidateName"),
            InternalName : UXI18N.getString(localNS, "doValidateInternalName"),
            ConfigurationValueName : UXI18N.getString(localNS, "doValidateConfigurationValueName"),
            Version : UXI18N.getString(localNS, "doValidateVersion"),
            loadDefaultsTitle : UXI18N.getString(localNS, "loadDefaultsTitle"),
            loadDefaultsMessage : UXI18N.getString(localNS, "loadDefaultsMessage"),
            loadDefaultsInformation : UXI18N.getString(localNS, "loadDefaultsInformation"),
            loadDefaultsEditLockInformation : UXI18N.getString(localNS, "loadDefaultsEditLockInformation"),
            loadNonAdminUserRestrictionInfo : UXI18N.getString(localNS, "loadNonAdminUserRestrictionInfo"),
            loadDefaultsEditLockInformation : UXI18N.getString(localNS, "loadDefaultsEditLockInformation")  
        };

        $scope.messageShow = false;
        $scope.closeMsgBar = function() {
            $scope.messageShow = false;
        }


        // message alert 
        $scope.$on("cfgErrorMessageForHomepage", function(event, message) {
            $scope.messageType = "alertMsgBar";
            $scope.messageShow = true;
            $scope.messageText = message;
            jQuery(".rightPanel .infobar").fadeIn("fast");
            infobarTimeout = $timeout(function() {
                jQuery(".rightPanel .infobar").fadeOut(1000);
            }, 3000);
        });

        $scope.$on("cfgConfirmMessageForHomepage", function(event, message) {
            $scope.messageType = "confirmMsgBar";
            $scope.messageShow = true;
            $scope.messageText = message;
            jQuery(".rightPanel .infobar").fadeIn("fast");
            infobarTimeout = $timeout(function() {
                jQuery(".rightPanel .infobar").fadeOut(1000);
            }, 3000);
        });
        
        $scope.$on("closecfgMessageForHomepage", function(event) {
            $scope.closeMsgBar();
        });



        // Load default actions in main navigation bar
        $rootScope.$on("navigation_menu_item_click", function(event, menuData) {
            if (menuData.name === "load_defaults") { 
                MDMCfgDialog.showMessage($scope.local.loadDefaultsTitle, $scope.local.loadDefaultsMessage, {
                    button3: {
                        text: "Yes",
                        show: true,
                        method: function(){
                            MDMCfgDialog.closeDialog();

                            var dataChangeFlag = false;
                            angular.forEach($scope.tableData, function(v, k) {
                                if (v.value !== v["default"]) {
                                    v.value = v["default"];
                                    if(dataChangeFlag === false){
                                        dataChangeFlag = true;
                                    }

                                    if(v.dataType === "list") {
                                        $rootScope.$broadcast("LIST_DATA_LOAD_DEFAULT");
                                    }
                                }
                            });

                            ConfiguratorService.MainService({
                                action: "saveDefaultConfigValues",
                                parentCategory : $scope.initialInfo.parentCategory,
                                serverName: $scope.initialInfo.clusterName.value,
                                categoryName: $scope.initialInfo.propertyName.value,
                                visibility: $scope.initialInfo.propertyName.type,
                                configJson: angular.toJson($scope.tableData)
                            }).then(function(data) {
                                if(dataChangeFlag){
                                    $rootScope.$broadcast("edittable_enableActions",["save"]);
                                    MDMCfgMsgBar.showConfirmMsg($scope.local.loadDefaultsInformation, "homepage");
                                }
                            }, function(errorMsg) {
                                MDMCfgDialog.showInfoBar("error", errorMsg);
                            });
                        }
                    },
                    button4: {
                        text: "Cancel",
                        show: true,
                        method: function(){
                            MDMCfgDialog.closeDialog();
                        }
                    }
                });
            }
        });

        // watch which item of configuration tree is highlight, then request related property

        $scope.$watch("initialInfo.clusterName.value", function() {
            $scope.serverName = $scope.initialInfo.clusterName.value;
            ConfiguratorService.MainService({
                action: "getConfigValue",
                parentCategory: $scope.initialInfo.parentCategory,
                categoryName: $scope.initialInfo.propertyName.value,
                serverName: $scope.serverName,
                visibility: $scope.initialInfo.propertyName.type
            }).then(function(data) {
                $scope.tableData = data.ConfValues;
                $scope.selectedindex = -1;
                $rootScope.$broadcast("SCROLLTOP_propertyTable");
            }, function(errorMsg) {
                $log.info(errorMsg);
            });
        });

        $scope.$watch("initialInfo.propertyName.value", function() {
            $scope.serverName = $scope.initialInfo.clusterName.value;
            ConfiguratorService.MainService({
                action: "getConfigValue",
                parentCategory : $scope.initialInfo.parentCategory,
                categoryName: $scope.initialInfo.propertyName.value,
                serverName: $scope.serverName,
                visibility: $scope.initialInfo.propertyName.type
            }).then(function(data) {
                $scope.tableData = data.ConfValues;
                $scope.selectedindex = -1;
                $rootScope.$broadcast("SCROLLTOP_propertyTable");
            }, function(errorMsg) {
                $log.info(errorMsg);
            });
        });

        $scope.$watch("initialInfo.propertyName.type", function() {
            $scope.serverName = $scope.initialInfo.clusterName.value;
            ConfiguratorService.MainService({
                action: "getConfigValue",
                parentCategory : $scope.initialInfo.parentCategory,
                categoryName: $scope.initialInfo.propertyName.value,
                serverName: $scope.serverName,
                visibility: $scope.initialInfo.propertyName.type
            }).then(function(data) {
                $scope.tableData = data.ConfValues;
                $scope.selectedindex = -1;
                $rootScope.$broadcast("SCROLLTOP_propertyTable");
            }, function(errorMsg) {
                $log.info(errorMsg);
            });
        });

        $scope.$watch("tableData", function() {
            $rootScope.$broadcast("SCROLLREFRESH_propertyTable");
        });

        $scope.$on("cfg_common_dialog_save_data", function(event, paramObj) {
            var data;
            if (!$scope.tableData) {
                $scope.tableData = [];
            }

            if (paramObj["addnewproperty"]) {
                data = paramObj.addnewproperty;
                ConfiguratorService.MainService({
                    action: "addConfigValue",
                    parentCategory : $scope.initialInfo.parentCategory,
                    serverName: $scope.serverName,
                    categoryName: $scope.initialInfo.propertyName.value,
                    configJson: "[" + angular.toJson(data) + "]",
                    visibility: $scope.initialInfo.propertyName.type
                }).then(function(data) {
                    $scope.tableData = data.ConfValues;
                    $rootScope.$broadcast("edittable_enableActions", ["save"]);
                    MDMCfgDialog.closeDialog();
                    MDMCfgMsgBar.showConfirmMsg($scope.local.addpropertyInformation, "homepage");
                }, function(error) {
                    MDMCfgDialog.showInfoBar("error", error);
                });

            }
        });

        $scope.$on("edittable_todelete", function(event, rowData) {
            $scope.local.propertyItemDelete = UXI18N.getString(localNS, "propertyItemDelete", [rowData.name]);
            MDMCfgDialog.showMessage($scope.local.confirmDelete, $scope.local.deleteMessage, {
                button3: {
                    text: $scope.local.deleteItem,
                    show: true,
                    method: function() {
                        ConfiguratorService.MainService({
                            action: "deleteConfigValue",
                            parentCategory : $scope.initialInfo.parentCategory,
                            serverName: $scope.initialInfo.clusterName.value,
                            categoryName: $scope.initialInfo.propertyName.value,
                            visibility: $scope.initialInfo.propertyName.type,
                            deletedConfigValueName: rowData.name
                        }).then(function(data) {
                            $scope.tableData = data.ConfValues;
                            MDMCfgDialog.closeDialog();
                            $rootScope.$broadcast("edittable_disableActions", ["clone", "todelete"]);
                            
                            $rootScope.$broadcast("edittable_enableActions", ["save"]);
                            MDMCfgMsgBar.showConfirmMsg($scope.local.propertyItemDelete, "homepage");
                        }, function(error) {
                            MDMCfgMsgBar.showErrorMsg(error, "homepage");
                        })


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

        $scope.$on("edittable_clone", function(event, rowData) {
            MDMCfgDialog.showDialog({
                title: $scope.local.clone,
                templateUrl: "module/tibco.mdm.configurator/dialog/view/edittable_clone.html",
                width: 700,
                height: 370,
                buttons: {
                    button3: {
                        text: $scope.local.save,
                        show: true,
                        method: function() {
                            MDMValidation.doValidate([{
                                keys: [{
                                    key: "name",
                                    value: $scope.local.Name
                                }, {
                                    key: "internalName",
                                    value: $scope.local.InternalName
                                }],
                                object: MDMCfgDialog.data.cloneEditTable,
                                required: true
                            }], function() {
                                ConfiguratorService.MainService({
                                    action: "cloneConfigValue",
                                    parentCategory : $scope.initialInfo.parentCategory,
                                    serverName: $scope.initialInfo.clusterName.value,
                                    categoryName: $scope.initialInfo.propertyName.value,
                                    visibility: $scope.initialInfo.propertyName.type,
                                    clonedConfigValueName: rowData.name,
                                    configValueName: MDMCfgDialog.data.cloneEditTable.name,
                                    propname: MDMCfgDialog.data.cloneEditTable.internalName
                                }).then(function(data) {
                                    $scope.tableData = data.ConfValues;
                                    MDMCfgDialog.closeDialog();

                                    if(rowData.isHotDeployable == "true"){
                                        serverDeployInfo.setAllFlagValue(true);
                                        $rootScope.$broadcast("edittable_enableActions", ["deploy"]);
                                    }
                                    $rootScope.$broadcast("edittable_enableActions", ["save"]);

                                    MDMCfgMsgBar.showConfirmMsg($scope.local.propertyCloneInformation, "homepage");
                                }, function(error) {
                                    MDMCfgDialog.showInfoBar("error", error);
                                });

                            });
                        }
                    },
                    button4: {
                        text: $scope.local.cancel,
                        show: true,
                        method: function() {
                            MDMCfgDialog.closeDialog();
                        }
                    }
                }
            });
        });

        $scope.$on("edittable_addproperty", function() {
            MDMCfgDialog.showDialog({
                title: $scope.local.addNewProperty,
                templateUrl: "module/tibco.mdm.configurator/dialog/view/addnewproperty.html",
                width: 800,
                height: 500,
                buttons: {
                    button3: {
                        text: $scope.local.finish,
                        show: true,
                        method: function() {
                            var validateFlag = true;
                            if(MDMCfgDialog.data.addnewproperty.valueType === "number"){

                                MDMValidation.checkNumberType([MDMCfgDialog.data.addnewproperty.defaultValue, MDMCfgDialog.data.addnewproperty.value], function errorCallback(){
                                    validateFlag = false;
                                }, function callback(){});
                            }

                            if(MDMCfgDialog.data.addnewproperty.valueType === "password"){
                                MDMValidation.checkPassword([{
                                    pwd : MDMCfgDialog.data.addnewproperty.value,
                                    repwd : MDMCfgDialog.data.addnewproperty.recurrentPassword
                                }, {
                                    pwd : MDMCfgDialog.data.addnewproperty.defaultValue,
                                    repwd : MDMCfgDialog.data.addnewproperty.reDefaultPassword
                                }], function errorCallback(){
                                    validateFlag = false;;
                                }, function callback(){});
                            }

                            if(validateFlag){
                                MDMValidation.doValidate([{
                                    keys: [{
                                        key: "name",
                                        value: $scope.local.ConfigurationValueName
                                    }, {
                                        key: "propname",
                                        value: $scope.local.InternalName
                                    }, {
                                        key: "sinceVersion",
                                        value: $scope.local.Version
                                    }],
                                    object: MDMCfgDialog.data.addnewproperty,
                                    required: true
                                }], function() {
                                    var data = MDMCfgDialog.data.addnewproperty;
                                    $rootScope.$broadcast("cfg_common_dialog_save_data", {
                                        "addnewproperty": data
                                    });
                                }); 
                            }
                        }
                    },
                    button4: {
                        text: $scope.local.cancel,
                        show: true,
                        method: function() {
                            MDMCfgDialog.closeDialog();
                        }
                    }
                }
            });
        });

        $scope.$on("saveChangesOfEditableTable", function(event, rowData) {
            ConfiguratorService.MainService({
                action: "editConfigValue",
                parentCategory : $scope.initialInfo.parentCategory,
                serverName: $scope.initialInfo.clusterName.value,
                categoryName: $scope.initialInfo.propertyName.value,
                configJson: "[" + angular.toJson(rowData) + "]",
                visibility: $scope.initialInfo.propertyName.type
            }).then(function(data) {
                if(rowData.isHotDeployable == "true"){
                    serverDeployInfo.setAllFlagValue(true);
                    $rootScope.$broadcast("edittable_enableActions", ["deploy"]);
                }
                $rootScope.$broadcast("edittable_enableActions", ["save"]);
                MDMCfgMsgBar.showConfirmMsg($scope.local.propertyEditInformation, "homepage");
            }, function(error) {
                $log.info(error);
            });
        });


    });

})();

/* --------------------- Source: module/tibco.mdm.configurator/dialog/controller/controller.js-------------------- */
(function() {
    var util = configurator.util;

    util.createController("configurator.controller.editServer_dialog",["$scope","MDMCfgDialog", "UXI18N"],function mainController($scope,MDMCfgDialog, UXI18N) {
        var localNS = "dialog";
        $scope.local = {
            name : UXI18N.getString(localNS, "editConfig.name"),
            description : UXI18N.getString(localNS, "editConfig.description"),
            TITLE : UXI18N.getString(localNS, "editServer.title"),
            basic : UXI18N.getString(localNS, "editServer.basic"),
            advanced : UXI18N.getString(localNS, "editServer.advanced")
        };
        
        $scope.hiddenConfTooltip = {
            title : $scope.local.TITLE,
            placement : "right"
        };

        $scope.$watch(function() {
            return MDMCfgDialog.data.editTree;
        }, function() {
            $scope.categoryData = MDMCfgDialog.data.editTree;
        },true);

        $scope.button = {
            basic : {
                title : $scope.local.basic,
                callback : function(){
                    $scope.categoryData.visibility = "Basic";
                }
            },
            advanced : {
                title : $scope.local.advanced,
                callback : function(){
                    $scope.categoryData.visibility = "Advanced";
                }
            }
        };
    });


    util.createController("configurator.controller.editConfig_dialog",["$scope","MDMCfgDialog", "UXI18N"],function mainController($scope, MDMCfgDialog, UXI18N) {
        var localNS = "dialog";
        $scope.local = {
            name : UXI18N.getString(localNS, "editConfig.name"),
            description : UXI18N.getString(localNS, "editConfig.description"),
            visibility : UXI18N.getString(localNS, "editConfig.visibility"),
            set : UXI18N.getString(localNS, "editConfig.set"),
            information : UXI18N.getString(localNS, "editConfig.information", ["Note", "Display Hidden Configurations", "Admin", "Settings"], "bold"),
            basic : UXI18N.getString(localNS, "editConfig.basic"),
            advanced : UXI18N.getString(localNS, "editConfig.advanced")
        };

        $scope.isCloudMode = util.cookie.getCookie("isCloudMode");

        $scope.hiddenConfTooltip = {
            title : $scope.local.information,
            placement : "right"
        };
        $scope.categoryData = {};
        angular.extend($scope.categoryData, MDMCfgDialog.data.editTree);

        $scope.$watch("categoryData", function(n, o){
            var categoryJson = {
                name : $scope.categoryData.name,
                description: $scope.categoryData.description,
                visibility: $scope.categoryData.visibility,
                isHidden: $scope.categoryData.isHidden
            };
            MDMCfgDialog.data.editTree = categoryJson;
        }, true);

        $scope.$watch(function(){
            return MDMCfgDialog.data.editTree;
        },function(n, o){
        },true);

        if ($('#cfg_common_dialog').hasClass('Item')) {

            $scope.button = {
                basic : {
                    title : $scope.local.basic,
                    visibility: $scope.categoryData.visibility,
                    callback : function(){
                        return;
                    }
                },
                advanced : {
                    title : $scope.local.advanced,
                    visibility: $scope.categoryData.visibility,
                    callback : function(){
                        return;
                    }
                },
                disabled: true,
                visibility : $scope.categoryData.visibility === "Basic" ? "first" : "second"
            };

        } else {

            $scope.button = {
                basic : {
                    title : $scope.local.basic,
                    visibility: $scope.categoryData.visibility,
                    callback : function(){
                        $scope.categoryData.visibility = "Basic";
                    }
                },
                advanced : {
                    title : $scope.local.advanced,
                    visibility: $scope.categoryData.visibility,
                    callback : function(){
                        $scope.categoryData.visibility = "Advanced";
                    }
                },
                disabled: false,
                visibility : $scope.categoryData.visibility === "Basic" ? "first" : "second"
            };
        }
    });

    util.createController("configurator.controller.addnewproperty_dialog",["$scope", "$rootScope", "MDMCfgDialog", "MDMValidation", "UXI18N"],function mainController($scope, $rootScope, MDMCfgDialog, MDMValidation, UXI18N) {
        var localNSPublic = "public";
        var localNS = "dialog";
        $scope.local = {
            deleteUppercase : UXI18N.getString(localNSPublic, "button.deleteUppercase"),
            infor : UXI18N.getString(localNS, "addnewproperty.infor"),
            configName : UXI18N.getString(localNS, "addnewproperty.configName"),
            internalName : UXI18N.getString(localNS, "addnewproperty.internalName"),
            internalNameValue : UXI18N.getString(localNS, "addnewproperty.internalName.exampleValue"),
            version : UXI18N.getString(localNS, "addnewproperty.version"),
            visibility : UXI18N.getString(localNS, "addnewproperty.visibility"),
            checkboxRead : UXI18N.getString(localNS, "addnewproperty.checkbox.read"),
            checkboxSet : UXI18N.getString(localNS, "addnewproperty.checkbox.set"),
            description : UXI18N.getString(localNS, "addnewproperty.description"),
            valueType : UXI18N.getString(localNS, "addnewproperty.valueType"),
            currentValueSet : UXI18N.getString(localNS, "addnewproperty.currentValueSet"),
            currentValue : UXI18N.getString(localNS, "addnewproperty.currentValue"),
            defaultValue : UXI18N.getString(localNS, "addnewproperty.defaultValue"),
            currentSelection : UXI18N.getString(localNS, "addnewproperty.currentSelection"),
            defaultSelection : UXI18N.getString(localNS, "addnewproperty.defaultSelection"),
            value : UXI18N.getString(localNS, "addnewproperty.value"),
            currentPassword : UXI18N.getString(localNS, "addnewproperty.current.password"),
            reCurrentPassword : UXI18N.getString(localNS, "addnewproperty.retype.current.password"),
            defaultPassword : UXI18N.getString(localNS, "addnewproperty.default.password"),
            reDefaultPassword : UXI18N.getString(localNS, "addnewproperty.retype.default.password"),
            text : UXI18N.getString(localNS, "addnewproperty.text"),
            basic : UXI18N.getString(localNS, "addnewproperty.basic"),
            advanced : UXI18N.getString(localNS, "addnewproperty.advanced"),
            hiddenPropertyTooltip : UXI18N.getString(localNS, "addnewproperty.hiddenPropertyTooltip", ["Note", "Display Hidden Properties", "Admin", "Settings"], "bold")
        };

        $scope.isCloudMode = util.cookie.getCookie("isCloudMode");

        $scope.valueType = [
            {
                name : "String",
                value : "string"
            }, {
                name : "Numeric",
                value : "number"
            }, {
                name : "Boolean",
                value : "boolean"
            }, {
                name : "Enumeration",
                value : "enum"
            }, {
                name : "Password",
                value : "password"
            }, {
                name : "List",
                value : "list"
            }
        ];

        $scope.newconfigData = {
            name : "",
            propname :"",
            sinceVersion : "",
            visibility : "Basic",
            description : "",
            readonly : false,
            isHidden : false,
            valueType : "string",
            value : "",
            defaultValue : "",
            valueOpts : []
        };

        $scope.setDefaultValue = false;

        $scope.hiddenConfTooltip = {
            title : $scope.local.text,
            placement : "right"
        };
        
        $scope.button = {
            basic : {
                title : $scope.local.basic,
                callback : function(){
                    $scope.newconfigData.visibility = "Basic";
                }
            },
            advanced : {
                title : $scope.local.advanced,
                callback : function(){
                    $scope.newconfigData.visibility = "Advanced";
                }
            },
            visibility : "first"
        };


        $scope.enumData = [{
            value : ""
        }];

        $scope.enumerationAddNew = function(item, index){
            var l = $scope.enumData.length;
            if(item && index == l-1){
                $scope.enumData.push({
                    value : ""
                });

            }else if(!item && index === l-2){
               $scope.enumData.splice(l-1,1);
            }

        };
        $scope.enumerationDel=function(i){
            if($scope.enumData.length === 1){return;}
            $scope.enumData.splice(i,1);
        };

        $scope.initValueData = function(type){
            $scope.setDefaultValue = false;
            if(type === "boolean"){
                $scope.newconfigData.value = $scope.newconfigData.defaultValue = true;
            }else if(type === "enum"){
                $scope.newconfigData.valueOpts = [];
                $scope.newconfigData.value = $scope.newconfigData.defaultValue = null;
            }else{
                $scope.newconfigData.value = $scope.newconfigData.defaultValue = "";
                $scope.newconfigData.recurrentPassword = $scope.newconfigData.reDefaultPassword = "";
            }
        };

        $scope.checkPassword = function(event, pwd, repwd) {
            var obj = {
                pwd : pwd,
                repwd : repwd
            };

            MDMValidation.checkPassword([obj], function() {
                //error callback
            }, function() {
                
            });
        };

        $scope.checkNumber = function(event, valueStr) {
            MDMValidation.checkNumberType(valueStr, function() {
            }, function() {
                
            });
        };

        $scope.checkboxToggle = function() {
        if($scope.setDefaultValue === true){
                if($scope.newconfigData.valueType === "password") {
                    $scope.newconfigData.defaultValue = $scope.newconfigData.reDefaultPassword = $scope.newconfigData.value;
                }
                if($scope.newconfigData.valueType === "list") {
                    $rootScope.$broadcast("addNewProperty_setDefaultValue", $scope.newconfigData.value);
                }
                $scope.newconfigData.defaultValue = $scope.newconfigData.value;
            }
        };

        $scope.$watch("newconfigData",function() {

            MDMCfgDialog.data.addnewproperty = $scope.newconfigData;

        },true);

        $scope.$watch("enumData", function() {
            var i;
            for(i = 0; i<$scope.enumData.length;i++){
                $scope.newconfigData.valueOpts[i] = $scope.enumData[i].value;
            }

        },true);


    });

    util.createController("configurator.controller.edittable_clone_controller",["$scope", "$rootScope", "MDMCfgDialog", "UXI18N"],function mainController($scope, $rootScope, MDMCfgDialog, UXI18N) {
        var localNS = "dialog";
        $scope.local = {
            title : UXI18N.getString(localNS, "editTableClone.title"),
            name : UXI18N.getString(localNS, "editTableClone.name"),
            internalName : UXI18N.getString(localNS, "editTableClone.internalName")
        };

        MDMCfgDialog.data["cloneEditTable"] = {
            name : "",
            internalName : ""
        };

        $scope.$watch("newname",function(){
            MDMCfgDialog.data.cloneEditTable.name = $scope.newname || "";
        });

        $scope.$watch("internalName",function(){
            MDMCfgDialog.data.cloneEditTable.internalName = $scope.internalName || "";
        });


    });

    util.createController("configurator.controller.applyTree_clone_controller",["$scope", "$rootScope", "MDMCfgDialog", "UXI18N"],function mainController($scope, $rootScope, MDMCfgDialog, UXI18N) {
        var localNS = "dialog";
        $scope.local = {
            title : MDMCfgDialog.data.groupName === 'Cluster' ? UXI18N.getString(localNS, "applyTreeclone.cluster.title") : UXI18N.getString(localNS, "applyTreeclone.configuration.title"),
            name : UXI18N.getString(localNS, "applyTreeclone.name")
        };

        $scope.$watch("newname",function(){
            MDMCfgDialog.data.cloneApplyTree = $scope.newname;
        });


    });

    util.createController("configurator.controller.edittable_save_controller",["$scope", "$rootScope", "MDMCfgDialog", "UXI18N"],function mainController($scope, $rootScope, MDMCfgDialog, UXI18N) {
        var localNS = "dialog";
        $scope.local = {
            description : UXI18N.getString(localNS, "save.description")
        };
        
        $scope.$watch("description", function(){
            MDMCfgDialog.data.saveAllchange.description = $scope.description;
        });
    });

    util.createController("configurator.controller.edittable_saveDeploy",["$scope", "$rootScope", "MDMCfgDialog", "UXI18N"],function mainController($scope, $rootScope, MDMCfgDialog, UXI18N) {
        var localNS = "dialog";
        $scope.local = {
            title : UXI18N.getString(localNS, "saveDeploy.title"),
            infor : UXI18N.getString(localNS, "saveDeploy.infor"),
            hostName : UXI18N.getString(localNS, "saveDeploy.hostName"),
            portNumber : UXI18N.getString(localNS, "saveDeploy.portNumber"),
            description : UXI18N.getString(localNS, "saveDeploy.description"),
            numberFormat : UXI18N.getString(localNS, "saveDeploy.numberFormat")
        };

        $scope.deployData = {};

        $scope.$watch("deployData", function(){
            MDMCfgDialog.data.saveDeploy = {
                hostname : $scope.deployData.hostname || "",
                port : $scope.deployData.port || "",
                description : $scope.deployData.description || ""
            };
        },true);

        $scope.checkNumber = function(e){
            if(e.keyCode === 8 || e.keyCode === 9 || e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 46)
                return;
            if(!((e.keyCode>=48 && e.keyCode<=57) || (e.keyCode>=96&&e.keyCode<=105))){
                e.preventDefault();
                MDMCfgDialog.showInfoBar("error",$scope.local.numberFormat);
            }
        };
    });


    util.createController("configurator.controller.tools.defineNewQueue.EditProperties", [ "$scope", "UXWizard", "Constant", "UXI18N", "ConfiguratorService", "MDMCfgDialog" ], function($scope, UXWizard, Constant, UXI18N, ConfiguratorService, MDMCfgDialog) {
        var staticdata = angular.copy(MDMCfgDialog.data.editProperties);
        var localNS = "tools.defineNewQueue.inbound";
        $scope.local = {
            title : UXI18N.getString(localNS, "EditProperties.title"),
            information : UXI18N.getString(localNS, "EditProperties.information"),
            properties : UXI18N.getString(localNS, "EditProperties.properties"),
            selectMandatoryKey : UXI18N.getString(localNS, "EditProperties.selectMandatoryKey"),
            selectOptionalKey : UXI18N.getString(localNS, "EditProperties.selectOptionalKey"),
            defineMandatory : UXI18N.getString(localNS, "EditProperties.defineMandatory"),
            defineOptional : UXI18N.getString(localNS, "EditProperties.defineOptional")
        };

        $scope.data = MDMCfgDialog.data.editProperties;

        if(!$scope.data.selectedData){
            $scope.data.selectedData = {
                mandatoryKeys : [],
                optionalKeys : []
            };

            angular.forEach($scope.data.selectedData, function(v, k) {

                var tempSelectedObj = {};
                if($scope.data.subItem[k].selected) {
                    for(var j = 0;j<$scope.data.subItem[k].selected.length; j++) {
                        tempSelectedObj[$scope.data.subItem[k].selected[j]] = true;
                    }
                }                

                if($scope.data.subItem[k].value){
                    for(var i = 0, len = $scope.data.subItem[k].value.length; i<len; i++){
                        var item = {
                            value : $scope.data.subItem[k].value[i],
                            valueName : $scope.data.subItem[k].valueName[i],
                            selected : tempSelectedObj[$scope.data.subItem[k].value[i]] || false
                        };

                        if($scope.data.subItem[k].paramValue) {
                            item.paramValue = $scope.data.subItem[k].paramValue[i];
                        }

                        $scope.data.selectedData[k].push(item);
                    }
                }
            });
        }
        

        $scope.$watch($scope.data, function(newValue, oldValue){
            MDMCfgDialog.data.editProperties = $scope.data;
        }, true);

       
    });

})();

/* --------------------- Source: module/tibco.mdm.configurator/login/controller/controller.js-------------------- */
(function() {

    var util = configurator.util;
    util.createController("configurator.controller.login", [ "$scope", "$rootScope", "$http", "$location","ConfiguratorService", "UXI18N", "$timeout"], function ($scope, $rootScope, $http, $location, ConfiguratorService, UXI18N, $timeout) {

        angular.element('.bodyDiv>.headerDiv').addClass('hide');
        angular.element('.buildGround').children('.footerDiv').addClass('hide');

        var requestURL = "";
        var jqLoginPanel = jQuery("div.cfg_login");

        var localNS = "login";
        $scope.local = {
            titleUserloginText : UXI18N.getString(localNS, "title.userlogin.text"),
            buttonSigninText : UXI18N.getString(localNS, "button.signin.text"),
            placeholderEmailText : UXI18N.getString(localNS, "placeholder.username.text"),
            placeholderPasswordText : UXI18N.getString(localNS, "placeholder.password.text"),
            errorMessage1 : UXI18N.getString(localNS, "errormassage1"),
            errorMessage2 : UXI18N.getString(localNS, "errormassage2")
        };

        $scope.data = {
            action : "login"
        };

        $scope.errorMessage = {};

        // when page load or refresh, username field should be focus
        var isInputSupported = 'placeholder' in document.createElement('input');
        if(isInputSupported){
            jQuery('.login-input').find('input[type=text]').focus();
        }
       

        $scope.submit = function() {
            $scope.errorMessage = {};
            if(!$scope.data.userName || !$scope.data.password){
                var values = ["userName","password"];
                for(var i in values) {
                    if(!$scope.data[values[i]]){
                        $scope.errorMessage[values[i]] = true;
                        jQuery('.login-input input').eq(i).focus();
                        break;
                    }
                }
            }else {
                ConfiguratorService.LoginService({
                    action : "login",
                    userName : $scope.data.userName,
                    password : $scope.data.password
                }).then(function(data) {
                    util.cookie.setCookie("username", $scope.data.userName);
                    util.cookie.setCookie("isCloudMode", data.isCloudMode);
                    
                    $rootScope.$broadcast("CREATE_USERNAME", $scope.data.userName);
                    jQuery("body").unbind("keydown");
                    $location.path("/configuration");
                },function(errorMessage){
                    $scope.errorMessage.loginFailed = true;
                    $scope.loginFailedMessage = errorMessage;
                });
            }
        };

        jQuery("body").bind("keydown",function(event){
            if(event.keyCode === 13){
                jQuery(".login-submit").click();
            }
        });

        //jQuery('input, textarea').placeholder();
        
    });
})();

/* --------------------- Source: module/tibco.mdm.configurator/setting/controller/controller.js-------------------- */
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

/* --------------------- Source: module/tibco.ux.directive/editTable/controller/controller.js-------------------- */
(function() {
    var util = configurator.util;

    util.createController("configurator.controller.columnPickerCtrl",["$scope", "$rootScope", "MDMCfgDialog", "UXI18N"],function mainController($scope, $rootScope, MDMCfgDialog, UXI18N) {
        var localNS = "columnPicker";
        $scope.local ={
            showInformation : UXI18N.getString(localNS, "showInformation"),
            selectedInfor : UXI18N.getString(localNS, "selected"),
            columnPicHotDeploy : UXI18N.getString(localNS, "hotDeploy"),
            columnPicProperty : UXI18N.getString(localNS, "property"),
            columnPicValue : UXI18N.getString(localNS, "value"),
            columnPicDescription : UXI18N.getString(localNS, "description"),
            columnPicVersion : UXI18N.getString(localNS, "version")
        };

        $scope.selected = [{
            name : $scope.local.columnPicHotDeploy,
            type: "isHotDeployable",
            value : MDMCfgDialog.data.columnPicker.isHotDeployable
        },{
            name : $scope.local.columnPicProperty,
            type: "name",
            value : MDMCfgDialog.data.columnPicker.name
        },{
            name : $scope.local.columnPicValue,
            type: "value",
            value : MDMCfgDialog.data.columnPicker.value
        },{
            name : $scope.local.columnPicDescription,
            type: "description",
            value : MDMCfgDialog.data.columnPicker.description
        },{
            name : $scope.local.columnPicVersion,
            type: "sinceVersion",
            value : MDMCfgDialog.data.columnPicker.sinceVersion
        }];

        $scope.changeValue = function(option){
            MDMCfgDialog.data.columnPicker[option.type] = option.value;
        };

    });

}());

/* --------------------- Source: module/tibco.mdm.configurator/revision_history/controller/controller.js-------------------- */
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