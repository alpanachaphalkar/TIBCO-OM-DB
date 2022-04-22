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