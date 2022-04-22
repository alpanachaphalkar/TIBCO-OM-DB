/**
 * Services
 * 
 * @author mark
 */

(function() {
    var util = configurator.util;
    var service = angular.module('tibco.ux.service', [ 'ui.bootstrap' ]);

    // //////////////////////////////
    // I18N service
    // /////////////////////////////
    /**
     * this service use to retrieve localization string check all localization string by following code: console.dir(tibco.ux.service.UXI18N.globalStringPool)
     */
    service.factory('UXI18N', [ '$rootScope', function($rootScope) {
        var serviceName = "UXI18N";
        var globalStringPool = tibco.ux.service.UXI18N.globalStringPool;
        var i18n = {};

        /**
         * get string by key
         * 
         * @method getString
         * @param key
         *        {string} string key
         * @param params
         *        {array} string parameter array
         * @param type
         *        {string} string value
         * @return {string} localized string
         */
        i18n.getString = function(namespace, key, params, type) {
            var resultText = null;
            // check parameter
            if (typeof namespace != "string" || typeof key != "string") {
                util.log(serviceName + ".getString(namespace, key, params) method: parameter 'namespace' and 'key' must be a string");
                resultText = namespace + " - " + key;
            }

            if (globalStringPool[namespace]) {
                resultText = globalStringPool[namespace][key];
            }

            if (resultText == null) {
                util.log("not found localization string for key '" + key + "' in namespace '" + namespace + "'");
                resultText = key;
            }

            if (params == null) {
                return resultText;

                // when with string parameter
            } else {
                // check parameter
                if (!angular.isArray(params)) {
                    util.log(serviceName + ".getString(namespace, key, params) method: parameter 'params' must be an Array");
                    return resultText;
                } else {
                    // replace string parameters

                    var i,len;
                    for (i = 0, len = params.length; i < len; i++) {
                        if(type === "bold"){
                            params[i] = params[i].replace("\<b\>", "").bold();
                        }
                        resultText = resultText.replace(resultText.match("{.[^{}]*}"), params[i]);
                    }
                    return resultText;
                }
            }
        };

        i18n.addNewString = function(localStringObj) {
            angular.extend(globalStringPool, localStringObj);
        };

        return i18n;
    } ]);

    // //////////////////////////////
    // FrameDialog service
    // /////////////////////////////
    service.factory('FrameDialog', [ "$rootScope", "Constant", function($rootScope, Constant) {

        var dialogService = {
            open : function(configObj) {
                $rootScope.$broadcast(Constant.eventName.FRAME_DIALOG_OPEN, configObj);
            },
            close : function(configObj) {
                $rootScope.$broadcast(Constant.eventName.FRAME_DIALOG_CLOSE, configObj);
            }
        };
        return dialogService;
    } ]);

    // //////////////////////////////
    // UXWizard service
    // /////////////////////////////
    service.factory('UXWizard', [ "$rootScope", "Constant", function($rootScope, Constant) {

        var wizardData = {};
        
        var service = {
            close : function(configObj) {
                $rootScope.$broadcast(Constant.eventName.FRAME_DIALOG_CLOSE, configObj);
            },
            switchForm : function(formName) {
                $rootScope.$broadcast(Constant.eventName.WIZARD_FORM_SWITCH, formName);
            },
            setData: function(key, data) {
                wizardData[key] = data;
            },
            getData: function(key) {
                return wizardData[key];
            },
            showInfoBar: function(type,message){
                var infoJson = {
                    type:type,
                    message: message
                }
                $rootScope.$broadcast("UXWizard_showInfoBar", infoJson);
            },
            closeInfoBar : function(){
                $rootScope.$broadcast("UXWizard_closeInfoBar");
            }
            
        };
        return service;
    } ]);

    // //////////////////////////////
    // Constant service
    // /////////////////////////////
    service.factory('Constant', [ "$rootScope", function($rootScope) {

        var service = {
            formSwitch : {
                NEXT_FORM : "$NEXT_FORM$",
                PREVIOUS_FORM : "$PREVIOUS_FORM$"
            },
            eventName : {
                WIZARD_FORM_SWITCH : "$WIZARD_FORM_SWITCH$",
                FRAME_DIALOG_OPEN : "$FRAME_DIALOG_OPEN$",
                FRAME_DIALOG_CLOSE : "$FRAME_DIALOG_CLOSE$"
            }
        };
        return service;
    } ]);

    /*
    *** common dialog service
    usage:
      example:
        MDMCfgDialog.showDialog({
            title: "Logout",
            templateUrl: "dialog1",
            width: 400,
            height: 300,
            //buttons: false // if false, no button bar
            //buttons: {} // if null, default button
            buttons:{
                button3: {
                    text : "Ok",
                    show : true,
                    method: function(){
                        MDMCfgDialog.buttonEnable("4");
                    }
                },
                button4: {
                    text: "Close",
                    show: true,
                    disabled: true,
                    method: function(){
                        MDMCfgDialog.closeDialog();
                    }
                }
            }
        });

        MDMCfgDialog.showMessage("Help","Do you need any help", {
            button3: {
                text: "Help",
                show: true,
                method: function(){
                    MDMCfgDialog.closeDialog();
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
    */
    service.factory('MDMCfgDialog', [ '$rootScope', "UXI18N", function($rootScope, UXI18N) {
        $rootScope.dialogBtnConfig = {};
        var mdmCfgDialog = {
            cfgDialogDefaultConfig : {
                title : UXI18N.getString("MDMCfgDialogNS", "titleDialog"),
                dataType: '',
                isActive: '',
                templateUrl : "dialog1",
                message : "",
                width : 200,
                height : 160,
                buttons : {
                    button1 : {
                        show : false,
                        text : UXI18N.getString("MDMCfgDialogNS", "buttonButton1"),
                        disabled : false,
                        method : function() {
                            
                        }
                    },
                    button2 : {
                        show : false,
                        text : UXI18N.getString("MDMCfgDialogNS", "buttonButton2"),
                        disabled : false,
                        method : function() {

                        }
                    },
                    button3 : {
                        show : true,
                        text : UXI18N.getString("MDMCfgDialogNS", "buttonSave"),
                        disabled : false,
                        method : function() {

                        }
                    },
                    button4 : {
                        show : true,
                        text : UXI18N.getString("MDMCfgDialogNS", "buttonClose"),
                        disabled : false,
                        method : function() {
                            mdmCfgDialog.closeDialog();
                        }
                    }
                }
            },
            buttonDisable : function(index) {
                $rootScope.$broadcast("cfg_common_dialog_disableBtn", index);
            },
            buttonEnable : function(index) {
                $rootScope.$broadcast("cfg_common_dialog_enableBtn", index);
            },
            showDialog : function(cfgDialogConfig) {
                var tempDialogConfig = {};
                angular.extend(tempDialogConfig, mdmCfgDialog.cfgDialogDefaultConfig, cfgDialogConfig);
                // angular.extend(tempDialogConfig.buttons, mdmCfgDialog.cfgDialogDefaultConfig.buttons, cfgDialogConfig.buttons);
                $rootScope.$broadcast("cfg_common_dialog_showDialog", tempDialogConfig);
                mdmCfgDialog.buttons = tempDialogConfig.buttons;
            },
            changeButtons: function(buttonsdata){
                $rootScope.$broadcast("cfg_common_dialog_changeButtons", buttonsdata );
            },
            showMessage : function(title, message, buttons) {
                var buttonconfig = {};
                angular.extend(buttonconfig, mdmCfgDialog.cfgDialogDefaultConfig);
                buttonconfig.title = title;
                buttonconfig.message = message;
                buttonconfig.width = 400;
                buttonconfig.height = 200;
                buttonconfig.templateUrl = "messageDlgTemplate";
                angular.extend(buttonconfig.buttons, buttons);
                $rootScope.$broadcast("cfg_common_dialog_showDialog", buttonconfig);
            },
            showInfoBar: function(type,message){
                var infoJson = {
                    type:type,
                    message: message
                }
                $rootScope.$broadcast("cfg_common_dialog_showInfoBar", infoJson);
            },
            closeInfoBar : function(){
                $rootScope.$broadcast("cfg_common_dialog_closeInfoBar");
            },
            closeDialog : function() {
                $rootScope.$broadcast("cfg_common_dialog_closeDialog");
            },
            data: {}
        };
        return mdmCfgDialog;
    } ]);

    service.factory('MDMCfgMsgBar',['$rootScope',function($rootScope){
        var MessageBar = {
            showErrorMsg : function(msg, type) {
                if(type === "homepage"){
                    $rootScope.$broadcast("cfgErrorMessageForHomepage", msg);
                }else{
                    $rootScope.$broadcast("cfgErrorMessage", msg);
                }
            },
            showConfirmMsg: function(msg, type) {
                if(type === "homepage"){
                    $rootScope.$broadcast("cfgConfirmMessageForHomepage", msg);
                }else{
                    $rootScope.$broadcast("cfgConfirmMessage", msg);
                }
                
            },
            closeMsgBar : function(type) {
                if(type === "homepage"){
                    $rootScope.$broadcast("closecfgMessageForHomepage");
                }else{
                    $rootScope.$broadcast("closecfgMessage");
                }
                  
            }
        }
        return MessageBar;
    }]);

    
    service.factory("ConfiguratorService", ["$http", "$q", "$log", "$window", "$rootScope", "UXI18N", "MDMCfgMsgBar", "MDMCfgDialog", function($http, $q, $log, $window, $rootScope, UXI18N, MDMCfgMsgBar, MDMCfgDialog){
        var serviceInstance = {};

        serviceInstance.LoginService = function(logindata){
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http({
                url:"ConfiguratorManager.do",
                method:"POST",
                cache: false,
                data:logindata
            }).success(function(response){
                var obj = jQuery.parseJSON(response.json.data);
                if(obj.success) {
                    deferred.resolve(obj.message);
                }
                else{               
                    deferred.reject(obj.message);
                }
            });
            
            return promise;
        };

        serviceInstance.MainService = function(actionObj){
            var deferred = $q.defer();
            var promise = deferred.promise;
            var baseURL = "ConfiguratorManager.do";
            
            $http({
                url: baseURL,
                method: "POST",
                data : actionObj
            }).success(function(responseString, status){
                var message;
                var responseObj = angular.fromJson(responseString.json.data);
                if(responseObj.success){
                    message = angular.fromJson(responseObj.message);            
                    
                    if(actionObj.action == "save" || actionObj.action == "saveRedeploy" ){
                        serviceInstance.MainService({
                            action: "cluster"
                        }).then(function(data){
                            var clusterData = data.group.items;
                            serviceInstance.MainService({
                                action: "getCategory",
                                serverName: clusterData[0].id
                            }).then(function(data){
                                serviceInstance.MainService({
                                    action: "getConfigValue",
                                    categoryName: data.categoryList[0].id,
                                    serverName : clusterData[0].id
                                }).then(function(data){
                                    
                                },function(errorMsg){
                                    $log.info(errorMsg);
                                });
                            },function(errorMsg){
                                $log.info(errorMsg);
                            });
                        },function(error){
                            $log.info(error);
                        });

                    }
                    deferred.resolve(message);
                    
                }else{
                    message = responseObj.message;
                    deferred.reject(message);
                    if(message === "Session Expired"){
                        MDMCfgDialog.showMessage(UXI18N.getString("ConfiguratorServiceNS", "sessionExpiredTitle"), UXI18N.getString("ConfiguratorServiceNS", "sessionExpiredInformation"), {
                            button3: {
                                show: false
                            },
                            button4: {
                                text: UXI18N.getString("ConfiguratorServiceNS", "sessionExpiredButtonOK"),
                                show: true,
                                method: function(){
                                    $window.location = "#/login";
                                    MDMCfgDialog.closeDialog();
                                }
                            }
                        });
                    }
                    
                }
            }).error(function(data, status){
                $log.info(data);
            });

            return promise;
        };

        serviceInstance.MigrationService = function(actionObj, isAsync){
            var deferred = $q.defer();
            var promise = deferred.promise;
            var baseURL = "MigrationWizard.do";

            $http({
                url: baseURL,
                method: "POST",
                async : isAsync,
                data : actionObj
            }).success(function(responseString, status){
                var message;
                var responseObj = angular.fromJson(responseString.json.data);
                if(responseObj.success){
                    message = angular.fromJson(responseObj.message);
                    deferred.resolve(message);
                }else{
                    message = responseObj.message;
                    deferred.reject(message);
                    if(message === "Session Expired"){
                        MDMCfgDialog.showMessage(UXI18N.getString("ConfiguratorServiceNS", "sessionExpiredTitle"), UXI18N.getString("ConfiguratorServiceNS", "sessionExpiredInformation"), {
                            button3: {
                                show: false
                            },
                            button4: {
                                text: UXI18N.getString("ConfiguratorServiceNS", "sessionExpiredButtonOK"),
                                show: true,
                                method: function(){
                                    $window.location = "#/login";
                                    MDMCfgDialog.closeDialog();
                                }
                            }
                        });
                    }
                }
            }).error(function(data, status){
                $log.info(data);
            });
            return promise;
        };

        serviceInstance.SetupDatabaseService = function(actionObj, baseURL){
            var deferred = $q.defer();
            var promise = deferred.promise;
            var baseURL = "" + baseURL;

            $http({
                url: baseURL,
                method: "POST",
                data : actionObj
            }).success(function(responseString, status){
                var message;
                var responseObj = angular.fromJson(responseString.json.data);
                if(responseObj.success){
                    message = angular.fromJson(responseObj.message);
                    deferred.resolve(message);
                }else{
                    message = responseObj.message;
                    deferred.reject(message);
                }
            }).error(function(data, status){
                $log.info(data);
            });
            return promise;
        };

        serviceInstance.FileService = function(actionObj){
            var deferred = $q.defer();
            var promise = deferred.promise;
            var baseURL = "FileOpen.do";

            $http({
                url: baseURL,
                method: "POST",
                data : actionObj
            }).success(function(responseString, status){
                var message;
                var responseObj = angular.fromJson(responseString.json.data);
                if(responseObj.success){
                    message = angular.fromJson(responseObj.message);
                    deferred.resolve(message);
                }else{
                    message = responseObj.message;
                    deferred.reject(message);
                }
            }).error(function(data, status){
                $log.info(data);
            });
            return promise;
        };
        
        serviceInstance.AddonPluginInstallerService = function(actionObj) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var baseURL = "AddonPluginInstaller.do";

            $http({
                url: baseURL,
                method: "POST",
                data : actionObj
            }).success(function(responseString, status){
                var message;
                var responseObj = angular.fromJson(responseString.json.data);
                if(responseObj.success){
                    message = angular.fromJson(responseObj.message);
                    deferred.resolve(message);
                }else{
                    message = responseObj.message;
                    deferred.reject(message);
                }
            }).error(function(data, status){
                $log.info(data);
            });
            return promise;
        };
        
        serviceInstance.PluginsHandler = function(actionObj) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http({
                url:"PluginsHandler.do",
                method:"POST",
                cache: false,
                data:actionObj
            }).success(function(response){
                var obj = jQuery.parseJSON(response.json.data);
                if(obj.success) {
                    deferred.resolve(obj.message);
                }
                else{               
                    deferred.reject(obj.message);
                }
            });
            
            return promise;
        };

        return serviceInstance;
    }]);


    service.factory('globalSearchData', ['$rootScope', '$location','$timeout', function($rootScope, $location, $timeout) {
        var service = {
            selectData: {},
            updataSelectData: function(data) {
                if($location.path() !== "/configuration"){
                    $location.path("/configuration");
                    service.selectData = data;
                    $timeout(function() {
                        $rootScope.$broadcast('globalSearchDataUpdate');
                    }, 1500);
                }else{
                    service.selectData = data;
                    $rootScope.$broadcast('globalSearchDataUpdate');
                }  
            }
        };
        return service;
    }]);

    service.factory('selectItemsMarker', ['$rootScope', function($rootScope) {
        var service = {
            selectItems: {
                'clusterName': '',
                'configurationName': '',
                'properyName': ''
            },
            updataSelectItems: function(type, data) {
                service.selectItems[type] = data;
                $rootScope.$broadcast('selectItemsMarkerUpdate');
            }
        };
        return service;
    }]);

    service.factory('scrollbar', ['$rootScope', function($rootScope) {
        var service = {
            flag: 0,
            scrollbarMap: {},
            scrollbarRegister: function(itemName, itemValue) {
                if (service.flag < 3) {
                    service.scrollbarMap[itemName] = itemValue;
                    service.flag++;
                }
                
            }
        };
        return service;
    }]);
    
    // //////////////////////////////
    // MDM Validation service
    // /////////////////////////////
    service.factory('MDMValidation',["MDMCfgDialog","UXWizard", "UXI18N", function(MDMCfgDialog, UXWizard, UXI18N) {
        var backupData = {}, // for back up
            validationData = {}, // data for validation, changed according to user changes  
            message = "";
    
        var service = { 
            errorMessage : null,    
            doValidate : function(userData, callback) {
                validationData = userData; // data will change
                var error_arr = [];
                for(var i=0; i<validationData.length; i++) {
                    var field = validationData[i];
                    for(var j = 0;j<field.keys.length; j++){
                        var data = field.object[field.keys[j].key];
                        if(field.required) {
                            if(!data) {
                                error_arr.push(field.keys[j].value);
                            }                               
                        }
                        
                    }                     
                } 

                if(error_arr.length !== 0){
                    service.errorMessage = UXI18N.getString("MDMValidationNS", "errorMessage", [error_arr]);
                    //show message
                    MDMCfgDialog.showInfoBar("error",service.errorMessage);
                    UXWizard.showInfoBar("error",service.errorMessage);
                    return false;
                }else{
                    // excute callback function
                    callback();
                }   
            },
            checkNumberType : function(value, errorCallback ,callback) {
                var valueArr = [];
                if(typeof value === "string"){
                    valueArr.push(value);
                }else if(value instanceof Array){
                    valueArr = value;
                }

                for(var i = 0, len = valueArr.length; i < len; i++){
                    if(valueArr[i] && !/^[0-9]*$/.test(valueArr[i])){
                        break;
                    }
                }

                if(i === len){
                    callback();
                }else{
                    service.errorMessage = "Please check that the value is number type and try again";
                    MDMCfgDialog.showInfoBar("error",service.errorMessage);
                    errorCallback();
                }
                
            },
            checkPassword : function(valueArr, errorCallback, callback) {

                for(var i = 0, len = valueArr.length; i < len; i++){
                    if(!angular.equals(valueArr[i].pwd, valueArr[i].repwd)){
                        break;
                    }
                }

                if(i === len){
                    callback();
                }else{
                    service.errorMessage = "Please check that your passwords match and try again";
                    MDMCfgDialog.showInfoBar("error",service.errorMessage);
                    UXWizard.showInfoBar("error",service.errorMessage);
                    errorCallback();
                }
                
            },
            checkSpecialChar : function(valuestr, errorCallback, callback) {
                if(valuestr.test(/\"|\$|\%|\@/g)){
                    service.errorMessage = "Special character cannot be used";
                    MDMCfgDialog.showInfoBar("error",service.errorMessage);
                    UXWizard.showInfoBar("error",service.errorMessage);
                    errorCallback();
                }else{
                    callback();
                }
            }
        };
        return service;
    }]);

    service.factory('serverDeployInfo', ["$rootScope", function($rootScope) {
        var service = {
            serviceFlags : {},
            hotDeployFlag : false,
            initFlags : function(serverObj) {
                angular.forEach(serverObj, function(v, k) {
                    service.serviceFlags[v.name] = false;
                });
            },
            getInitialConfigFlag : function() {
                if(!service.hotDeployFlag) {
                    return false;
                }else{
                    if(service.getDeployNodeNum() == 0) {
                        return false;
                    }
                    return true;
                }
            },
            getServerFlag : function(serverName) {
                return service.serviceFlags[serverName];
            },
            getDeployNodeNum : function() {
                var count = 0;
                angular.forEach(service.serviceFlags, function(v, k) {
                    if(v) {
                        count++;
                    }
                });
                return count;
            },
            setAllFlagValue : function(value) {
                angular.forEach(service.serviceFlags, function(v, k) {
                    service.serviceFlags[k] = value;
                });
                service.hotDeployFlag = value;
            },
            setOneFlagFalse : function(serverName) {
                service.serviceFlags[serverName] = false;
            },
            renameFlag : function(oldName, newName) {
                service.serviceFlags[newName] = service.serviceFlags[oldName];
                delete service.serviceFlags[oldName];
            },
            addFlag : function(serverName) {
                service.serviceFlags[serverName] = service.hotDeployFlag;
            },
            deleteFlag : function(serverName) {
                delete service.serviceFlags[serverName];
            }

        };
        return service;
    }]);

})();

