(function(){

    var util = configurator.util;

    util.createController("configurator.controller.tools.outboundQueue", [ "$scope", "$rootScope", "FrameDialog" , "Constant", "UXWizard", "UXI18N"], function($scope, $rootScope, FrameDialog, Constant, UXWizard, UXI18N) {
        var localNS = "tools.defineNewQueue.outbound";
        $scope.local = {
            title : UXI18N.getString(localNS, "title"),
            leftPanelTitle1 : UXI18N.getString(localNS, "leftPanelTitle1"),
            leftPanelTitle2 : UXI18N.getString(localNS, "leftPanelTitle2"),
            leftPanelTitle3 : UXI18N.getString(localNS, "leftPanelTitle3"),
            leftPanelTitle4 : UXI18N.getString(localNS, "leftPanelTitle4"),
            leftPanelTitle5 : UXI18N.getString(localNS, "leftPanelTitle5"),
            leftPanelTitle6 : UXI18N.getString(localNS, "leftPanelTitle6")
        };

        $scope.wizardData = {
            title : $scope.local.title,
            forms : [ {
                name : "QueueDefinition",
                title : $scope.local.leftPanelTitle1,
                templateUrl : "module/tibco.mdm.configurator/tools/outbound_queue/view/QueueDefinition.html"
            }, {
                name : "AdditionalProperties",
                title : $scope.local.leftPanelTitle2,
                templateUrl : "module/tibco.mdm.configurator/tools/outbound_queue/view/AdditionalProperties.html"
            }, {
                name : "SenderManager",
                title : $scope.local.leftPanelTitle3,
                templateUrl : "module/tibco.mdm.configurator/tools/outbound_queue/view/SenderManager.html"
            }, {
                name : "Unmarshalers",
                title : $scope.local.leftPanelTitle4,
                templateUrl : "module/tibco.mdm.configurator/tools/outbound_queue/view/Unmarshalers.html"
            }, {
                name : "Marshalers",
                title : $scope.local.leftPanelTitle5,
                templateUrl : "module/tibco.mdm.configurator/tools/outbound_queue/view/Marshalers.html"
            }, {
                name : "CommunicationContext",
                title : $scope.local.leftPanelTitle6,
                templateUrl : "module/tibco.mdm.configurator/tools/outbound_queue/view/CommunicationContext.html"
            } ]

            
        };

    });

    util.createController("configurator.controller.tools.outboundQueue.QueueDefinition", [ "$scope", "UXWizard", "Constant", "UXI18N", "$http", "MDMValidation", "ConfiguratorService" ], function($scope, UXWizard, Constant, UXI18N, $http, MDMValidation, ConfiguratorService) {
        var localNSPublic = "public";
        var localNS = "tools.defineNewQueue.outbound";
        var localNSTip = "tools.defineNewQueue.outbound.tip";
        var staticInfoURL = "module/tibco.mdm.configurator/tools/outbound_queue/staticInfo.json";

        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            title: UXI18N.getString(localNS, "QueueDefinition.title"),
            information: UXI18N.getString(localNS, "QueueDefinition.information"),
            logicalQueueName: UXI18N.getString(localNS, "QueueDefinition.logicalQueueName"),
            physicalQueueName: UXI18N.getString(localNS, "QueueDefinition.physicalQueueName"),
            addFile: UXI18N.getString(localNS, "QueueDefinition.addFile"),
            websphereInfo: UXI18N.getString(localNS, "QueueDefinition.websphere.info"),
            websphereName: UXI18N.getString(localNS, "QueueDefinition.websphere.thead.name"),
            websphereValue: UXI18N.getString(localNS, "QueueDefinition.websphere.thead.value"),
            websphereTargetClient: UXI18N.getString(localNS, "QueueDefinition.websphere.tbody.targetClient"),
            websphereCodeSetSID: UXI18N.getString(localNS, "QueueDefinition.websphere.tbody.codeSetSID")
        };

        $scope.tipInfo = {
            "LogicalName" : UXI18N.getString(localNSTip, "QueueDefinition.LogicalName"),
            "PhysicalName" : UXI18N.getString(localNSTip, "QueueDefinition.PhysicalName"),
            "WebsphereInfo" : UXI18N.getString(localNSTip, "QueueDefinition.WebsphereInfo")
        };

        function queueAction(){

            var jsonURLs = {
                marshalling : "module/tibco.mdm.configurator/tools/outbound_queue/marshalling.json",
                unmarshalling : "module/tibco.mdm.configurator/tools/outbound_queue/unmarshalling.json"
            };
            
            angular.forEach(jsonURLs, function(value, key){
                if(!tibco.ux.service.staticInfo.outboundQueue[key]){
                    $http({method: 'GET', url: value}).success(function(data) {
                        var namespace = "tibco.ux.service.staticInfo.outboundQueue." + key;
                        util.createNamespace(namespace, data);
                    }).error(function(data) {

                    });
                }
            });


            var staticInfo = tibco.ux.service.staticInfo.outboundQueue;
            $scope.staticData = {
                targetClient : staticInfo['targetClient']
            };

            $scope.data = UXWizard.getData("dataOfDefineNewQueue") || {
                baseDetails : {},
                commContextJSON : {},
                receiverMngrJSON : {},
                unmarshalerJSON : {},
                marshalerJSON : {},
                senderMngrJSON : {}
            };

            $scope.data.baseDetails.addToJNDI = $scope.data.baseDetails.addToJNDI || false;
            $scope.data.baseDetails.direction = "Outbound";
            $scope.data.baseDetails.vendorName = tibco.ux.service.staticInfo.Setting.queueVendor.value;

            $scope.nextButtonClick = function() {

                MDMValidation.doValidate([{
                    keys : [{
                        key : "logicalQName",
                        value : $scope.local.logicalQueueName 
                    }, {
                        key : "physicalName",
                        value : $scope.local.physicalQueueName
                    }],
                    object: $scope.data.baseDetails,
                    required: true
                }], function(){
                    ConfiguratorService.MainService({
                        action: "checkDuplicateQueueName",
                        logicalQName: $scope.data.baseDetails.logicalQName
                    }).then(function(data) {
                        $scope.data.baseDetails.vendorWebsphereData = $scope.data.baseDetails.vendorName === "TIBCO" ? null : $scope.data.baseDetails.vendorWebsphereData;
                        $scope.data.baseDetails["destType"] = "Queue";
                        $scope.data.baseDetails["destName"] = $scope.data.baseDetails.logicalQName;
                        UXWizard.setData("dataOfDefineNewQueue",angular.extend($scope.data , UXWizard.getData("dataOfDefineNewQueue")));
                        UXWizard.switchForm("AdditionalProperties");
                    }, function(error) {
                        UXWizard.showInfoBar("error", error);
                    });
                    
                });
            };

            $scope.closeButtonClick = function() {
                UXWizard.close();
                UXWizard.setData("dataOfDefineNewQueue",null);
                UXWizard.setData("staticDataForNewQueue", null);
            };
        }

        
        if(tibco.ux.service.staticInfo && tibco.ux.service.staticInfo.outboundQueue){
            queueAction();
        }else{
            $http({method: 'GET', url: staticInfoURL}).
            success(function(data) {
                util.createNamespace("tibco.ux.service.staticInfo.outboundQueue", data);
                queueAction();
            }).
            error(function(data) {

            });
        }
        
    });


    util.createController("configurator.controller.tools.outboundQueue.AdditionalProperties", [ "$scope", "$rootScope", "UXWizard", "Constant", "UXI18N" ], function($scope, $rootScope, UXWizard, Constant, UXI18N) {
        var localNSPublic = "public";
        var localNS = "tools.defineNewQueue.outbound";
        var localNSTip = "tools.defineNewQueue.outbound.tip";
        $scope.local = {
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            next : UXI18N.getString(localNSPublic, "button.next"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "AdditionalProperties.title"),
            information : UXI18N.getString(localNS, "AdditionalProperties.information"),
            scheme : UXI18N.getString(localNS, "AdditionalProperties.scheme"),
            schemeName : UXI18N.getString(localNS, "AdditionalProperties.schemeName"),
            managerProperty : UXI18N.getString(localNS, "AdditionalProperties.managerProperty"),
            IOProcessTemplate : UXI18N.getString(localNS, "AdditionalProperties.IOProcessTemplate"),
            useInternalTransport : UXI18N.getString(localNS, "AdditionalProperties.useInternalTransport"),
            checkboxYes : UXI18N.getString(localNS, "AdditionalProperties.checkboxYes"),
            jumpToSenderManager : UXI18N.getString(localNS, "AdditionalProperties.jumpToSenderManager"),
            jumpToMarshalers : UXI18N.getString(localNS, "AdditionalProperties.jumpToMarshalers"),
            jumpToUnmarshalers : UXI18N.getString(localNS, "AdditionalProperties.jumpToUnmarshalers")
        };

        $scope.tipInfo = {
            "schemeName" : UXI18N.getString(localNSTip, "AdditionalProperties.schemeName", ["Note", "Override Payload Packing Schema"], "bold"),
            "IOProcessTemplate" : UXI18N.getString(localNSTip, "AdditionalProperties.IOProcessTemplate", ["SimpleOutboundIntgrMsgStringMsgIOProcess", "StandardOutboundIntgrMsgByteStreamMsgIOProcess", "StandardOutboundIntgrMsgStringMsgIOProcess", "OutboundIntgrMsgIOProcess", "StandardOutboundIntgrMsgUTFStringMsgIOProcess", "StandardIntgrEventByteStreamMsgIOProcess", "StandardIntgrEventStringMsgIOProcess", "StandardIntgrEventUTFStringMsgIOProcess"], "bold")
        };

        $scope.data = UXWizard.getData("dataOfDefineNewQueue") || {};

        $scope.staticData = {};
        var staticInfo = angular.copy(tibco.ux.service.staticInfo.outboundQueue);
        var prop = "outboundIOProcessTemp";
        $scope.staticData[prop] = staticInfo[prop];

        $scope.overrideAction = function(){
            if($scope.hasCommName === false){
                $scope.data.baseDetails.pkgScheme = null;
            }
        };

        $scope.chooseInheritSender = function(){
            if($scope.data.baseDetails.inheritSender === true){
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "SenderManager"
                });
            }

            if($scope.data.baseDetails.inheritSender === false){
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : 2,
                    newItem : {
                        name : "SenderManager",
                        title : $scope.local.jumpToSenderManager,
                        templateUrl : "module/tibco.mdm.configurator/tools/outbound_queue/view/SenderManager.html"
                    }
                });
            }
        };

        $scope.chooseBypassComm = function(){
            if($scope.data.baseDetails.bypassComm === true){
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "Unmarshalers"
                });
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    removeItem : "Marshalers"
                });
            }

            if($scope.data.baseDetails.bypassComm === false){
                var position;
                if($scope.data.baseDetails.inheritSender === true){
                    position = 2;
                }else{
                    position = 3;
                }

                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : position,
                    newItem : {
                        name : "Marshalers",
                        title : $scope.local.jumpToMarshalers,
                        templateUrl : "module/tibco.mdm.configurator/tools/outbound_queue/view/Marshalers.html"
                    }
                });

                $rootScope.$broadcast("CHANGE_WIZARD_DATA", {
                    position : position,
                    newItem : {
                        name : "Unmarshalers",
                        title : $scope.local.jumpToUnmarshalers,
                        templateUrl : "module/tibco.mdm.configurator/tools/outbound_queue/view/Unmarshalers.html"
                    }
                });
            }
        };

        $scope.nextButtonClick = function() {
            UXWizard.setData("dataOfDefineNewQueue",angular.extend($scope.data , UXWizard.getData("dataOfDefineNewQueue")));
            
            var nextformName = "SenderManager";
            if($scope.data.baseDetails.inheritSender && $scope.data.baseDetails.bypassComm){
                nextformName = "CommunicationContext";
            }else if($scope.data.baseDetails.inheritSender){
                nextformName = "Unmarshalers";
            }

            UXWizard.switchForm(nextformName);
        };

        $scope.closeButtonClick = function() {
            UXWizard.close();
            UXWizard.setData("dataOfDefineNewQueue",null);
            UXWizard.setData("staticDataForNewQueue", null);
        };

        $scope.previousButtonClick = function() {
            UXWizard.setData("dataOfDefineNewQueue",angular.extend($scope.data , UXWizard.getData("dataOfDefineNewQueue")));
            UXWizard.switchForm("QueueDefinition");
        };

    });


    util.createController("configurator.controller.tools.outboundQueue.SenderManager", [ "$scope", "UXWizard", "Constant", "UXI18N" ], function($scope, UXWizard, Constant, UXI18N) {
        var localNSPublic = "public";
        var localNS = "tools.defineNewQueue.outbound";
        var localNSTip = "tools.defineNewQueue.outbound.tip";
        $scope.local = {
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            next : UXI18N.getString(localNSPublic, "button.next"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "SenderManager.title"),
            information : UXI18N.getString(localNS, "SenderManager.information"),
            senderManagerName : UXI18N.getString(localNS, "SenderManager.senderManagerName"),
            senderManagerClass : UXI18N.getString(localNS, "SenderManager.senderManagerClass"),
            poolSize : UXI18N.getString(localNS, "SenderManager.poolSize"),
            messagePersistence : UXI18N.getString(localNS, "SenderManager.messagePersistence"),
            checkboxYes : UXI18N.getString(localNS, "SenderManager.checkboxYes")
        };

        $scope.tipInfo = {
            "SenderManagerName" : UXI18N.getString(localNSTip, "SenderManager.name"),
            "SenderManagerClass" : UXI18N.getString(localNSTip, "SenderManager.class"),
            "PoolSize" : UXI18N.getString(localNSTip, "SenderManager.poolSize", ["8"], "bold")
        };

        $scope.data = UXWizard.getData("dataOfDefineNewQueue") || {};
        var nextformName = $scope.data.baseDetails.bypassComm ? "CommunicationContext" : "Unmarshalers";

        $scope.staticData = {};
        var staticInfo = angular.copy(tibco.ux.service.staticInfo.outboundQueue);
        $scope.staticData["senderMgClass"] = staticInfo["senderMgClass"];

        // init data
        $scope.data.senderMngrJSON.name = $scope.data.senderMngrJSON.name || $scope.data.baseDetails.logicalQName + $scope.data.baseDetails.direction + "QueueSenderManager" ;
        $scope.data.senderMngrJSON.className = $scope.data.senderMngrJSON.className || $scope.staticData.senderMgClass[0];
        $scope.data.senderMngrJSON.poolSize = $scope.data.senderMngrJSON.poolSize || 8;
        $scope.data.senderMngrJSON.msgPersistent = $scope.data.senderMngrJSON.msgPersistent || true;

        $scope.nextButtonClick = function() {
            nextformName = $scope.data.baseDetails.marshal ? "Marshalers" : nextformName;
            UXWizard.setData("dataOfDefineNewQueue",angular.extend($scope.data , UXWizard.getData("dataOfDefineNewQueue")));
            UXWizard.switchForm(nextformName);
        };

        $scope.closeButtonClick = function() {
            UXWizard.close();
            UXWizard.setData("dataOfDefineNewQueue",null);
            UXWizard.setData("staticDataForNewQueue", null);
        };

        $scope.previousButtonClick = function() {
            UXWizard.setData("dataOfDefineNewQueue",angular.extend($scope.data , UXWizard.getData("dataOfDefineNewQueue")));
            UXWizard.switchForm("AdditionalProperties");
        };

    });

    util.createController("configurator.controller.tools.outboundQueue.Unmarshalers", [ "$scope", "UXWizard", "Constant", "UXI18N", "MDMCfgDialog" ], function($scope, UXWizard, Constant, UXI18N, MDMCfgDialog) {
        var localNSPublic = "public";
        var localNS = "tools.defineNewQueue.outbound";
        var localNSTip = "tools.defineNewQueue.outbound.tip";
        $scope.local = {
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            save : UXI18N.getString(localNSPublic, "button.save1"),
            next : UXI18N.getString(localNSPublic, "button.next"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            action : UXI18N.getString(localNSPublic, "item.action"),
            edit : UXI18N.getString(localNS, "Unmarshalers.edit"),
            title : UXI18N.getString(localNS, "Unmarshalers.title"),
            information : UXI18N.getString(localNS, "Unmarshalers.information"),
            messageProcessors : UXI18N.getString(localNS, "Unmarshalers.messageProcessors"),
            select : UXI18N.getString(localNS, "Unmarshalers.thead.select"),
            processorName : UXI18N.getString(localNS, "Unmarshalers.thead.processorName"),
            editProperty : UXI18N.getString(localNS, "Unmarshalers.editProperty"),
            messageContentExtractor : UXI18N.getString(localNS, "Unmarshalers.messageContentExtractor"),
            MessageContentProcessors : UXI18N.getString(localNS, "Unmarshalers.MessageContentProcessors")
        };

        $scope.tipInfo = {
            "MessageProcessors" : UXI18N.getString(localNSTip, "Unmarshalers.messageProcessor"),
            "MessageContentExtractor" : UXI18N.getString(localNSTip, "Unmarshalers.messageContentExtractor", ["Edit"], "bold"),
            "MessageContentProcessors" : UXI18N.getString(localNSTip, "Unmarshalers.messageContentPeocessor")
        };

        $scope.data = UXWizard.getData("dataOfDefineNewQueue") || {};
        var previousFormName = $scope.data.baseDetails.inheritSender ? "AdditionalProperties" : "SenderManager";

        //handle static data
        function handleStaticData(){

            $scope.data.unmarshalerJSON = {
                messageContentExtractor : null,
                messageContentUnmarshaler : [],
                messageUnmarshaler : []
            };

            $scope.staticData = {};
        
            var staticInfo = angular.copy(tibco.ux.service.staticInfo.outboundQueue);
            $scope.staticData.unMarshallingDetails = staticInfo.unmarshalling;
            $scope.staticData.unMarshallingDetails.selectIOProcess = $scope.data.senderMngrJSON.destName;
            
            var selectedMessageItems = staticInfo.selectedOutboundUnMarshallers[$scope.staticData.unMarshallingDetails.selectIOProcess];
            
            if(selectedMessageItems){

                angular.forEach($scope.staticData.unMarshallingDetails, function(value, key){

                    if(key === "messageProcessor" || key === "messageContentProcessors"){
                        for(var i = selectedMessageItems[key].length-1 ; i >= 0; i--){
                            for(var j = 0; j < value.length; j++){
                                if(value[j].name === selectedMessageItems[key][i]){
                                    var tempItem = value[j];
                                    tempItem.isSele = true;
                                    value.splice(j, 1);
                                    value.unshift(tempItem);
                                    break;
                                }
                            }
                        }
                    }

                    if(key === "messageContentExtractor"){
                        if(selectedMessageItems[key].length > 0){
                            for(var i = 0; i < value.length;i ++){
                                if(value[i].name === selectedMessageItems[key][0]){
                                    $scope.data.unmarshalerJSON.messageContentExtractor = value[i];
                                    break;
                                }
                            }
                        }
                    }
                });
                
            }

        }

        var storageStaticData = UXWizard.getData("staticDataForNewQueue");
        var propNameOfStaticData =["unMarshallingDetails"];
        if(storageStaticData && storageStaticData["unMarshallingDetails"]){
            $scope.staticData = storageStaticData;
        }else{
            handleStaticData();
        }

        $scope.searchIoProcess = function(objname, index) {
            var editedItem;
            editedItem = $scope.staticData.unMarshallingDetails[objname][index];
            if(!editedItem.ioProcess) {
                return true;
            }

            if(editedItem.ioProcess.length === 0) {
                return true;
            }

            if(editedItem && editedItem.ioProcess) {
                for(var i = 0; i<editedItem.ioProcess.length; i++) {
                    if(editedItem.ioProcess[i].name === $scope.data.senderMngrJSON.destName){
                        return false;
                    }
                }
            }
            return true;
        };


        $scope.editProperties = function(objname, index, obj){
            var editedItem;
            if(objname === "messageContentExtractor"){
                editedItem = $scope.data.marshalerJSON.messageContentExtractor;
            }else{
                editedItem = $scope.staticData.unMarshallingDetails[objname][index];
            }

            if(editedItem && editedItem.ioProcess){
                for(var i = 0; i<editedItem.ioProcess.length; i++){
                    if(editedItem.ioProcess[i].name === $scope.data.senderMngrJSON.destName){
                        var copyItem = angular.copy(editedItem.ioProcess[i]);
                        MDMCfgDialog.data.editProperties = editedItem.ioProcess[i];
                        MDMCfgDialog.showDialog({
                            title: $scope.local.editProperty,
                            templateUrl: "module/tibco.mdm.configurator/dialog/view/EditProperties.html",
                            width: 700,
                            height: 450,
                            buttons:{
                                button3: {
                                    text : $scope.local.save,
                                    show : true,
                                    method: function(){
                                        angular.forEach(editedItem.ioProcess[i].selectedData, function(v, k){
                                            for(var j = 0,len = v.length;j<len;j++){
                                                editedItem.ioProcess[i].subItem[k].selected = [];
                                                if(v[j].selected === true){
                                                    editedItem.ioProcess[i].subItem[k].selected.push(v[j].value);
                                                }
                                                if(v[j].paramValue) {
                                                    editedItem.ioProcess[i].subItem[k].paramValue[j] = v[j].paramValue;
                                                }
                                            }
                                        });

                                        MDMCfgDialog.closeDialog();
                                    }
                                },
                                button4: {
                                    text: $scope.local.cancel,
                                    show: true,
                                    method: function(){
                                        MDMCfgDialog.data.editProperties = copyItem;
                                        MDMCfgDialog.closeDialog();
                                    }
                                }
                            }
                        });

                        break;
                    }
                }
            }
            
        }

        $scope.upAction = function(propStr, index){
            var arr = $scope.staticData.unMarshallingDetails[propStr];
            var temp = arr[index - 1];
            arr[index - 1] = arr[index];
            arr[index] = temp;

        }

        $scope.downAction = function(propStr, index){
            var arr = $scope.staticData.unMarshallingDetails[propStr];
            var temp = arr[index + 1];
            arr[index + 1] = arr[index];
            arr[index] = temp;
        }

        function dataHandle(){
            var props = [{
                    staticName : "messageProcessor",
                    JsonName : "messageUnmarshaler"
                },{
                    staticName : "messageContentProcessors",
                    JsonName : "messageContentUnmarshaler"
                }];
            var i;

            for(var i = 0;i<props.length; i++){
                angular.forEach($scope.staticData.unMarshallingDetails[props[i].staticName], function(value, key){
                    var obj = {
                        processorName : value.name
                    }

                    if(value.ioProcess && value.ioProcess.length > 0){
                        for(var j = 0, len = value.ioProcess.length;j<len;j++){
                            if(value.ioProcess[j].name === $scope.data.senderMngrJSON.destName){
                                obj.subItem = value.ioProcess[j].subItem;
                            }
                        }
                    }

                    if(value.isSele === true){
                        $scope.data.unmarshalerJSON[props[i].JsonName].push(obj);
                    }
                });
            }

            UXWizard.setData("dataOfDefineNewQueue",angular.extend($scope.data , UXWizard.getData("dataOfDefineNewQueue")));
            UXWizard.setData("staticDataForNewQueue", angular.extend($scope.staticData, UXWizard.getData("staticDataForNewQueue")));
        }



        $scope.nextButtonClick = function() {
            dataHandle();
            UXWizard.switchForm("Marshalers");
        };

        $scope.closeButtonClick = function() {
            UXWizard.setData("dataOfDefineNewQueue",null);
            UXWizard.setData("staticDataForNewQueue", null);
            UXWizard.close();
        };

        $scope.previousButtonClick = function() {
            dataHandle();
            UXWizard.switchForm(previousFormName);
        };

    });

    util.createController("configurator.controller.tools.outboundQueue.Marshalers", [ "$scope", "UXWizard", "Constant", "UXI18N", "MDMCfgDialog" ], function($scope, UXWizard, Constant, UXI18N, MDMCfgDialog) {
        var localNSPublic = "public";
        var localNS = "tools.defineNewQueue.outbound";
        var localNSTip = "tools.defineNewQueue.outbound.tip";
        $scope.local = {
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            save : UXI18N.getString(localNSPublic, "button.save1"),
            next : UXI18N.getString(localNSPublic, "button.next"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            action : UXI18N.getString(localNSPublic, "item.action"),
            edit : UXI18N.getString(localNS, "Marshalers.edit"),
            title : UXI18N.getString(localNS, "Marshalers.title"),
            information : UXI18N.getString(localNS, "Marshalers.information"),
            MessageContentProcessors : UXI18N.getString(localNS, "Marshalers.MessageContentProcessors"),
            messageCreator : UXI18N.getString(localNS, "Marshalers.MessageCreator"),
            messageFormatters : UXI18N.getString(localNS, "Marshalers.messageFormatters"),
            select : UXI18N.getString(localNS, "Marshalers.thead.select"),
            processorName : UXI18N.getString(localNS, "Marshalers.thead.processorName"),
            editProperty : UXI18N.getString(localNS, "Marshalers.editProperty")
        };

        $scope.tipInfo = {
            "MessageContentProcessors" : UXI18N.getString(localNSTip, "Marshalers.messageProcessor"),
            "MessageCreator" : UXI18N.getString(localNSTip, "Marshalers.messageCreator"),
            "MessageFormatters" : UXI18N.getString(localNSTip, "Marshalers.messageFormatter")
        };

        $scope.data = UXWizard.getData("dataOfDefineNewQueue") || {};
        var nextformName = "CommunicationContext";
        var previousFormName = "Unmarshalers";

        //handle static data
        function handleStaticData() {

            $scope.data.marshalerJSON = {
                messageCreator : null,
                messageContentMarshaler : [],
                messageMarshaler : []
            };

            $scope.staticData = {};
        
            var staticInfo = angular.copy(tibco.ux.service.staticInfo.outboundQueue);
            $scope.staticData.marshallingDetails = staticInfo.marshalling;
            $scope.staticData.marshallingDetails.selectIOProcess = $scope.data.senderMngrJSON.destName;
            var selectedMessageItems = staticInfo.selectedOutboundMarshallers[$scope.staticData.marshallingDetails.selectIOProcess];
            
            if(selectedMessageItems){
                angular.forEach($scope.staticData.marshallingDetails, function(value, key){

                    if(key === "messageFormatters" || key === "messageContentProcessors"){
                        for(var i = selectedMessageItems[key].length-1 ; i >= 0; i--){
                            for(var j = 0; j < value.length; j++){
                                if(value[j].name === selectedMessageItems[key][i]){
                                    var tempItem = value[j];
                                    tempItem.isSele = true;
                                    value.splice(j, 1);
                                    value.unshift(tempItem);
                                    break;
                                }
                            }
                        }
                    }

                    if(key === "messageCreator"){
                        if(selectedMessageItems[key].length > 0){
                            for(var i = 0; i < value.length;i ++){
                                if(value[i].name === selectedMessageItems[key][0]){
                                    $scope.data.marshalerJSON.messageCreator = value[i];
                                    break;
                                }
                            }
                        }
                    }
                });
            }

        }


        var storageStaticData = UXWizard.getData("staticDataForNewQueue");
        var propNameOfStaticData = ["marshallingDetails"];
        if(storageStaticData && storageStaticData["marshallingDetails"]){
            $scope.staticData = storageStaticData;
        }else{
            handleStaticData();
        }

        $scope.searchIoProcess = function(objname, index) {
            var editedItem;
            editedItem = $scope.staticData.marshallingDetails[objname][index];
            if(!editedItem.ioProcess) {
                return true;
            }

            if(editedItem.ioProcess.length === 0) {
                return true;
            }

            if(editedItem && editedItem.ioProcess) {
                for(var i = 0; i<editedItem.ioProcess.length; i++) {
                    if(editedItem.ioProcess[i].name === $scope.data.senderMngrJSON.destName){
                        return false;
                    }
                }
            }
            return true;
        };
        
        $scope.editProperties = function(objname, index, obj){
            var editedItem;
            if(objname === "messageCreator"){
                editedItem = $scope.data.marshalerJSON.messageCreator;
            }else{
                editedItem = $scope.staticData.marshallingDetails[objname][index];
            }

            if(editedItem && editedItem.ioProcess){
                for(var i = 0; i<editedItem.ioProcess.length; i++){
                    if(editedItem.ioProcess[i].name === $scope.data.senderMngrJSON.destName){
                        var copyItem = angular.copy(editedItem.ioProcess[i]);
                        MDMCfgDialog.data.editProperties = editedItem.ioProcess[i];
                        MDMCfgDialog.showDialog({
                            title: $scope.local.editProperty,
                            templateUrl: "module/tibco.mdm.configurator/dialog/view/EditProperties.html",
                            width: 700,
                            height: 450,
                            buttons:{
                                button3: {
                                    text : $scope.local.save,
                                    show : true,
                                    method: function(){
                                        angular.forEach(editedItem.ioProcess[i].selectedData, function(v, k){
                                            for(var j = 0,len = v.length;j<len;j++){
                                                editedItem.ioProcess[i].subItem[k].selected = [];
                                                if(v[j].selected === true){
                                                    editedItem.ioProcess[i].subItem[k].selected.push(v[j].value);
                                                }
                                                if(v[j].paramValue) {
                                                    editedItem.ioProcess[i].subItem[k].paramValue[j] = v[j].paramValue;
                                                }
                                            }
                                        });

                                        MDMCfgDialog.closeDialog();
                                    }
                                },
                                button4: {
                                    text: $scope.local.cancel,
                                    show: true,
                                    method: function(){
                                        MDMCfgDialog.data.editProperties = copyItem;
                                        MDMCfgDialog.closeDialog();
                                    }
                                }
                            }
                        });

                        break;
                    }
                }
            }     
        }

        $scope.upAction = function(propStr, index){
            var arr = $scope.staticData.marshallingDetails[propStr];
            var temp = arr[index - 1];
            arr[index - 1] = arr[index];
            arr[index] = temp;

        }

        $scope.downAction = function(propStr, index){
            var arr = $scope.staticData.marshallingDetails[propStr];
            var temp = arr[index + 1];
            arr[index + 1] = arr[index];
            arr[index] = temp;
        }

        function dataHandle(){
            var props = [{
                    staticName : "messageFormatters",
                    JsonName : "messageMarshaler"
                },{
                    staticName : "messageContentProcessors",
                    JsonName : "messageContentMarshaler"
                }];
            var i;

            for(i = 0, ilen = props.length;i<ilen; i++){
                angular.forEach($scope.staticData.marshallingDetails[props[i].staticName], function(value, key){

                    var obj = {
                        processorName : value.name
                    }

                    if(value.ioProcess && value.ioProcess.length > 0){
                        for(var j = 0, len = value.ioProcess.length;j<len;j++){
                            if(value.ioProcess[j].name === $scope.data.senderMngrJSON.destName){
                                obj.subItem = value.ioProcess[j].subItem;
                            }
                        }
                    }

                    if(value.isSele === true){
                        $scope.data.marshalerJSON[props[i].JsonName].push(obj);
                    }
                });
            }

            UXWizard.setData("dataOfDefineNewQueue",angular.extend($scope.data , UXWizard.getData("dataOfDefineNewQueue")));
            UXWizard.setData("staticDataForNewQueue", angular.extend($scope.staticData, UXWizard.getData("staticDataForNewQueue")));
        }

        $scope.nextButtonClick = function() {
            dataHandle();
            UXWizard.switchForm(nextformName);
        };

        $scope.closeButtonClick = function() {
            UXWizard.close();
            UXWizard.setData("dataOfDefineNewQueue",null);
            UXWizard.setData("staticDataForNewQueue", null);
        };

        $scope.previousButtonClick = function() {
            dataHandle();
            UXWizard.switchForm(previousFormName);
        };

    });

    util.createController("configurator.controller.tools.outboundQueue.CommunicationContext", [ "$scope", "$rootScope", "$location", "UXWizard", "Constant", "UXI18N", "ConfiguratorService", "MDMValidation", "MDMCfgMsgBar"], function($scope, $rootScope, $location, UXWizard, Constant, UXI18N, ConfiguratorService, MDMValidation, MDMCfgMsgBar) {
        var localNSPublic = "public";
        var localNS = "tools.defineNewQueue.outbound";
        var localNSTip = "tools.defineNewQueue.outbound.tip";
        $scope.local = {
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            next : UXI18N.getString(localNSPublic, "button.next"),
            finish : UXI18N.getString(localNSPublic, "button.finish"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "CommunicationContext.title"),
            information : UXI18N.getString(localNS, "CommunicationContext.information"),
            name : UXI18N.getString(localNS, "CommunicationContext.name"),
            property : UXI18N.getString(localNS, "CommunicationContext.property"),
            theadName : UXI18N.getString(localNS, "CommunicationContext.thead.propertyName"),
            theadProperty : UXI18N.getString(localNS, "CommunicationContext.thead.overrideProperty"),
            theadDefaultValue : UXI18N.getString(localNS, "CommunicationContext.thead.defaultValue"),
            theadNewValue : UXI18N.getString(localNS, "CommunicationContext.thead.newValue"),
            definedNewQueueInformation : UXI18N.getString(localNS, "CommunicationContext.definedNewQueueInformation"),
            waitingInformation : UXI18N.getString(localNS, "CommunicationContext.waitingInformation"),
            numberCheck : UXI18N.getString(localNS, "CommunicationContext.numberCheck")
        };

        $scope.progressing = false;

        $scope.tipInfo = {
            "CommunicationContextName" : UXI18N.getString(localNSTip, "CommunicationContext.name"),
            "CommunicationContextProperty" : UXI18N.getString(localNSTip, "CommunicationContext.property")
        };
        
        $scope.data = UXWizard.getData("dataOfDefineNewQueue") || {};
        var previousFormName = $scope.data.baseDetails.direction === "Inbound" ? "QueueDefinition" : "Marshalers";
        if($scope.data.baseDetails.inheritSender && $scope.data.baseDetails.bypassComm){
            previousFormName = "AdditionalProperties";
        }else if($scope.data.baseDetails.bypassComm){
            previousFormName = "SenderManager";
        }

        $scope.direction = $scope.data.baseDetails.direction.toLowerCase();

        $scope.data.commContextJSON.commContext = "JMS";

        // handle the static data
        $scope.staticData = {};
        var staticInfo = angular.copy(tibco.ux.service.staticInfo.outboundQueue);
        var storageStaticData = UXWizard.getData("staticDataForNewQueue");
        var propNameOfStaticData = $scope.direction + 'CommContext';
        if(storageStaticData && storageStaticData[propNameOfStaticData]){
            $scope.staticData = storageStaticData;
        }else{
            $scope.staticData[propNameOfStaticData] = staticInfo[propNameOfStaticData];
        }

        $scope.overrideAction = function(e, prop){
            if(prop.override === true){
                prop.showEdit = true;
            }else{
                prop.value = null;
            }
        }
        
        $scope.hideEdit = function(prop){
            prop.showEdit = false;
        }

        $scope.checkNumber = function(e){
            if(e.keyCode === 8 || e.keyCode === 9 || e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 46)
                return;
            if(!((e.keyCode>=48 && e.keyCode<=57) || (e.keyCode>=96&&e.keyCode<=105))){
                e.preventDefault();
                UXWizard.showInfoBar("error", $scope.local.numberCheck);
            }
        };


        function sendData(callback){

            //some handle for special data
            if(!$scope.data.baseDetails.pkgScheme){
                $scope.data.baseDetails.pkgScheme = "STANDARD_INTEGRATION";
            }

            var sendObj = {
                action : "saveQueueConfig"
            };
            angular.forEach($scope.data, function(value,key){
                sendObj[key] = "[" + angular.toJson(value) + "]";
            });

            ConfiguratorService.MainService(sendObj).then(function(data){
                $scope.progressing = false;
                callback();
            },function(error){
                $scope.progressing = false;
                UXWizard.showInfoBar("error", error);
            });
        }

        function beforeGoNext(){
            $scope.data.commContextJSON.subItem = [];
            var items = $scope.staticData[$scope.direction + 'CommContext'];
            var i;
            for(i = 0;i<items.length;i++){
                if(items[i].value){
                    $scope.data.commContextJSON.subItem.push(items[i]);
                }
            }
        }

        $scope.previousButtonClick = function() {
            UXWizard.setData("dataOfDefineNewQueue",angular.extend($scope.data , UXWizard.getData("dataOfDefineNewQueue")));
            UXWizard.setData("staticDataForNewQueue", angular.extend($scope.staticData,UXWizard.getData("staticDataForNewQueue")));
            UXWizard.switchForm(previousFormName);
        };


        $scope.finishButtonClick = function() {
            // code for storage
            $scope.local.definedQueueSuccessfully = UXI18N.getString(localNS, "CommunicationContext.definedQueueSuccessfully", [$scope.data.baseDetails.logicalQName]);
            $scope.progressing = true;
            sendData(function(){
                UXWizard.close();
                UXWizard.setData("dataOfDefineNewQueue", null);
                UXWizard.setData("staticDataForNewQueue", null);

                if($location.path() === "/configuration"){
                    MDMCfgMsgBar.showConfirmMsg($scope.local.definedQueueSuccessfully, "homepage");
                }else{
                    MDMCfgMsgBar.showConfirmMsg($scope.local.definedQueueSuccessfully);
                }
                
                $rootScope.$broadcast("RELOAD_ALL_THREE_PANEL");
                $rootScope.$broadcast("edittable_enableActions",["save"]);
            });
        };

        $scope.closeButtonClick = function() {
            UXWizard.close();
            UXWizard.setData("dataOfDefineNewQueue", null);
            UXWizard.setData("staticDataForNewQueue", null);
        };
    });
})();