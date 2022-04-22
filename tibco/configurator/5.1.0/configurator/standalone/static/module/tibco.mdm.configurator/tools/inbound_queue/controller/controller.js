(function(){

    var util = configurator.util;

    util.createController("configurator.controller.tools.inboundQueue", [ "$scope", "$rootScope", "FrameDialog" , "Constant", "UXWizard", "UXI18N"], function($scope, $rootScope, FrameDialog, Constant, UXWizard, UXI18N) {
        var localNS = "tools.defineNewQueue.inbound";
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
                templateUrl : "module/tibco.mdm.configurator/tools/inbound_queue/view/QueueDefinition.html"
            }, {
                name : "CommunicationContext",
                title : $scope.local.leftPanelTitle2,
                templateUrl : "module/tibco.mdm.configurator/tools/inbound_queue/view/CommunicationContext.html"
            },  {
                name : "ReceiverManager",
                title : $scope.local.leftPanelTitle3,
                templateUrl : "module/tibco.mdm.configurator/tools/inbound_queue/view/ReceiverManager.html"
            } , {
                name : "Unmarshalers",
                title : $scope.local.leftPanelTitle4,
                templateUrl : "module/tibco.mdm.configurator/tools/inbound_queue/view/Unmarshalers.html"
            }, {
                name : "SenderManager",
                title : $scope.local.leftPanelTitle5,
                templateUrl : "module/tibco.mdm.configurator/tools/inbound_queue/view/SenderManager.html"
            }, {
                name : "XPathDefinitionFile",
                title : $scope.local.leftPanelTitle6,
                templateUrl : "module/tibco.mdm.configurator/tools/inbound_queue/view/XPathDefinitionFile.html"
            } ]        
        };

    });

    util.createController("configurator.controller.tools.inboundQueue.QueueDefinition", [ "$scope", "UXWizard", "Constant", "UXI18N", "$http", "MDMValidation", "ConfiguratorService" ], function($scope, UXWizard, Constant, UXI18N, $http, MDMValidation, ConfiguratorService) {
        var localNSPublic = "public";
        var localNS = "tools.defineNewQueue.inbound";
        var localNSTip = "tools.defineNewQueue.inbound.tip";
        var staticInfoURL = "module/tibco.mdm.configurator/tools/inbound_queue/basicInfo.json";

        $scope.local = {
            next : UXI18N.getString(localNSPublic, "button.next"),
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            title: UXI18N.getString(localNS, "QueueDefinition.title"),
            information: UXI18N.getString(localNS, "QueueDefinition.information"),
            logicalQueueName :UXI18N.getString(localNS, "QueueDefinition.logicalQueueName"),
            physicalQueueName :UXI18N.getString(localNS, "QueueDefinition.physicalQueueName"),
            addFile :UXI18N.getString(localNS, "QueueDefinition.addFile"),
            WebsphereInfo: UXI18N.getString(localNS, "QueueDefinition.websphere.info"),
            name: UXI18N.getString(localNS, "QueueDefinition.websphere.thead.name"),
            value: UXI18N.getString(localNS, "QueueDefinition.websphere.thead.value"),
            targetClient: UXI18N.getString(localNS, "QueueDefinition.websphere.tbody.targetClient"),
            codeSetSID: UXI18N.getString(localNS, "QueueDefinition.websphere.tbody.codeSetSID")
        };

        $scope.tipInfo = {
            "LogicalName" : UXI18N.getString(localNSTip, "QueueDefinition.LogicalName"),
            "PhysicalName" : UXI18N.getString(localNSTip, "QueueDefinition.PhysicalName"),
            "WebsphereInfo" : UXI18N.getString(localNSTip, "QueueDefinition.WebsphereInfo")
        };

        function queueAction(){

            var jsonURLs = {
                marshalling : "module/tibco.mdm.configurator/tools/inbound_queue/marshalling.json",
                unmarshalling : "module/tibco.mdm.configurator/tools/inbound_queue/unmarshalling.json"
            };

             angular.forEach(jsonURLs, function(value, key){
                if(!tibco.ux.service.staticInfo.inboundQueue[key]){
                    $http({method: 'GET', url: value}).success(function(data) {
                        var namespace = "tibco.ux.service.staticInfo.inboundQueue." + key;
                        util.createNamespace(namespace, data);
                    }).error(function(data) {

                    });
                }
            });

            if(!tibco.ux.service.staticInfo || !tibco.ux.service.staticInfo.inboundQueue){
                angular.forEach(jsonURLs, function(value, key){
                    $http({method: 'GET', url: value}).success(function(data) {
                        var namespace = "tibco.ux.service.staticInfo.inboundQueue." + key;
                        util.createNamespace(namespace, data);
                    }).error(function(data) {

                    });
                });

            }
            

            var staticInfo = tibco.ux.service.staticInfo.inboundQueue;
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

            $scope.data.baseDetails.direction = "Inbound";
            $scope.data.baseDetails.vendorName = tibco.ux.service.staticInfo.Setting.queueVendor.value;
            $scope.data.baseDetails.addToJNDI = $scope.data.baseDetails.addToJNDI || false;

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
                        UXWizard.switchForm("CommunicationContext");
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

        
        if(tibco.ux.service.staticInfo && tibco.ux.service.staticInfo.inboundQueue){
            queueAction();
        }else{
            $http({method: 'GET', url: staticInfoURL}).
            success(function(data) {
                util.createNamespace("tibco.ux.service.staticInfo.inboundQueue", data);
                queueAction();
            }).
            error(function(data) {

            });
        }
        
    });
    
    util.createController("configurator.controller.tools.inboundQueue.CommunicationContext", [ "$scope", "UXWizard", "Constant", "UXI18N", "ConfiguratorService", "MDMValidation", "MDMCfgMsgBar"], function($scope, UXWizard, Constant, UXI18N, ConfiguratorService, MDMValidation, MDMCfgMsgBar) {
        var localNSPublic = "public";
        var localNS = "tools.defineNewQueue.inbound";
        var localNSTip = "tools.defineNewQueue.inbound.tip";
        $scope.local = {
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            next : UXI18N.getString(localNSPublic, "button.next"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "CommunicationContext.title"),
            information : UXI18N.getString(localNS, "CommunicationContext.information"),
            name : UXI18N.getString(localNS, "CommunicationContext.name"),
            property : UXI18N.getString(localNS, "CommunicationContext.property"),
            propertyName : UXI18N.getString(localNS, "CommunicationContext.thead.propertyName"),
            overrideProperty : UXI18N.getString(localNS, "CommunicationContext.thead.overrideProperty"),
            defaultValue : UXI18N.getString(localNS, "CommunicationContext.thead.defaulyValue"),
            newValue : UXI18N.getString(localNS, "CommunicationContext.thead.newValue"),
            numberCheck : UXI18N.getString(localNS, "CommunicationContext.numberCheck")
        };

        $scope.tipInfo = {
            "CommunicationContextName" : UXI18N.getString(localNSTip, "CommunicationContext.name"),
            "CommunicationContextProperty" : UXI18N.getString(localNSTip, "CommunicationContext.property")
        };
        
        $scope.data = UXWizard.getData("dataOfDefineNewQueue") || {};

        $scope.direction = $scope.data.baseDetails.direction.toLowerCase();

        $scope.data.commContextJSON.commContext = "JMS" + $scope.data.baseDetails.logicalQName;

        // handle the static data
        $scope.staticData = {};
        

        var storageStaticData = UXWizard.getData("staticDataForNewQueue");
        var propNameOfStaticData = "inboundCommContext";
        if(storageStaticData && storageStaticData[propNameOfStaticData]){
            $scope.staticData = storageStaticData;
        }else{
            var staticInfo = angular.copy(tibco.ux.service.staticInfo.inboundQueue);
            ConfiguratorService.MainService({
                action: "getCommContextProperty",             
                contextJson : angular.toJson(staticInfo.inboundCommContext) 
            }).then(function(data){
                $scope.staticData[propNameOfStaticData] = data;
            },function(error){
                UXWizard.showInfoBar("error",error);
            });
            
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
            UXWizard.switchForm("QueueDefinition");
        };

        $scope.nextButtonClick = function() {
            beforeGoNext();

            MDMValidation.doValidate([{
                keys : [{
                    key : "commContext",
                    value : $scope.local.name
                }],
                object: $scope.data.commContextJSON,
                required: true
            }], function(){

                UXWizard.setData("dataOfDefineNewQueue",angular.extend($scope.data , UXWizard.getData("dataOfDefineNewQueue")));
                UXWizard.setData("staticDataForNewQueue", angular.extend($scope.staticData,UXWizard.getData("staticDataForNewQueue")));
                UXWizard.switchForm("ReceiverManager");
            });
        };


        $scope.closeButtonClick = function() {
            UXWizard.close();
            UXWizard.setData("dataOfDefineNewQueue", null);
            UXWizard.setData("staticDataForNewQueue", null);
        };
        
        
    });

    util.createController("configurator.controller.tools.inboundQueue.ReceiverManager", [ "$scope", "UXWizard", "Constant", "UXI18N" ], function($scope, UXWizard, Constant, UXI18N) {
        var localNSPublic = "public";
        var localNS = "tools.defineNewQueue.inbound";
        var localNSTip = "tools.defineNewQueue.inbound.tip";
        $scope.local = {
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            next : UXI18N.getString(localNSPublic, "button.next"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "ReceiverManager.title"),
            information : UXI18N.getString(localNS, "ReceiverManager.information"),
            name : UXI18N.getString(localNS, "ReceiverManager.name"),
            classTitle : UXI18N.getString(localNS, "ReceiverManager.class"),
            poolSize : UXI18N.getString(localNS, "ReceiverManager.poolSize"),
            messageAckMode : UXI18N.getString(localNS, "ReceiverManager.messageAckMode"),
            IOProcessTemplate : UXI18N.getString(localNS, "ReceiverManager.IOProcessTemplate")
        };

        $scope.tipInfo = {
            "ReceiverManagerName" : UXI18N.getString(localNSTip, "ReceiverManager.name"),
            "ReceiverManagerClass" : UXI18N.getString(localNSTip, "ReceiverManager.class"),
            "ReceiverPoolSize" : UXI18N.getString(localNSTip, "ReceiverManager.poolSize", ["8"], "bold"),
            "ReciverManagerMode" : UXI18N.getString(localNSTip, "ReceiverManager.mode", ["autoAck", "clientAck", "dupsOKAck"], "bold"),
            "ioTemplate" : UXI18N.getString(localNSTip, "ReceiverManager.ioTemplate", ["StandardInboundIntgrMsgByteStreamMsgIOProcess", "StandardInboundIntgrMsgStringMsgIOProcess", "InboundIntgrMsgIOProcess", "StandardInboundIntgrMsgUTFStringMsgIOProcess", "StandardIntgrEventByteStreamMsgIOProcess", "StandardIntgrEventStringMsgIOProcess", "StandardIntgrEventUTFStringMsgIOProcess"], "bold")
        };

        $scope.data = UXWizard.getData("dataOfDefineNewQueue") || {};
        $scope.data.receiverMngrJSON.name = $scope.data.receiverMngrJSON.name || $scope.data.baseDetails.logicalQName + $scope.data.baseDetails.direction + "QueueReceiverManager";


        // handle the static data
        $scope.staticData = {};
        var staticInfo = angular.copy(tibco.ux.service.staticInfo.inboundQueue);
        $scope.direction = $scope.data.baseDetails.direction.toLowerCase();
        var propNameOfStaticData =["receiverMgClass","inboundIOProcessTemp"];
        angular.forEach(propNameOfStaticData, function(value, key){
            $scope.staticData[value] = staticInfo[value];
        });
        $scope.data.receiverMngrJSON.className = $scope.staticData.receiverMgClass[0];


        $scope.nextButtonClick = function() {
            UXWizard.setData("dataOfDefineNewQueue",angular.extend($scope.data , UXWizard.getData("dataOfDefineNewQueue")));
            UXWizard.switchForm("Unmarshalers");
        };

        $scope.closeButtonClick = function() {
            UXWizard.close();
            UXWizard.setData("dataOfDefineNewQueue",null);
            UXWizard.setData("staticDataForNewQueue", null);
        };

        $scope.previousButtonClick = function() {
            UXWizard.setData("dataOfDefineNewQueue",angular.extend($scope.data , UXWizard.getData("dataOfDefineNewQueue")));
            UXWizard.switchForm("CommunicationContext");
        };

    });

    util.createController("configurator.controller.tools.inboundQueue.Unmarshalers", [ "$scope", "$rootScope", "UXWizard", "Constant", "UXI18N", "MDMCfgDialog" ], function($scope, $rootScope, UXWizard, Constant, UXI18N, MDMCfgDialog) {
        var localNSPublic = "public";
        var localNS = "tools.defineNewQueue.inbound";
        var localNSTip = "tools.defineNewQueue.inbound.tip";
        $scope.local = {
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            save : UXI18N.getString(localNSPublic, "button.save1"),
            next : UXI18N.getString(localNSPublic, "button.next"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            action : UXI18N.getString(localNSPublic, "item.action"),
            edit : UXI18N.getString(localNSPublic, "button.editUppercase"),
            title : UXI18N.getString(localNS, "Unmarshalers.title"),
            information : UXI18N.getString(localNS, "Unmarshalers.information"),
            messageProcessors : UXI18N.getString(localNS, "Unmarshalers.messageProcessors"),
            messageContentExtractor : UXI18N.getString(localNS, "Unmarshalers.messageContentExtractor"),
            messageContentPeocessor : UXI18N.getString(localNS, "Unmarshalers.messageContentPeocessor"),
            select : UXI18N.getString(localNS, "Unmarshalers.thead.select"),
            processorName : UXI18N.getString(localNS, "Unmarshalers.thead.processorName"),
            jumpPageTitle : UXI18N.getString(localNS, "Unmarshalers.jumpPageTitle")
        };

        $scope.tipInfo = {
            "UnmarshalersMessageProcessor" : UXI18N.getString(localNSTip, "Unmarshalers.messageProcessor"),
            "messageContentExtractor" : UXI18N.getString(localNSTip, "Unmarshalers.messageContentExtractor", ["Edit"], "bold"),
            "messageContentPeocessor" : UXI18N.getString(localNSTip, "Unmarshalers.messageContentPeocessor", ["Edit"], "bold")
        };

        $scope.data = UXWizard.getData("dataOfDefineNewQueue") || {};

        function handleStaticData(){

            $scope.data.unmarshalerJSON = {
                messageContentExtractor : null,
                messageContentUnmarshaler : [],
                messageUnmarshaler : []
            };

            $scope.staticData = {};
        
            var staticInfo = angular.copy(tibco.ux.service.staticInfo.inboundQueue);
            $scope.staticData.unMarshallingDetails = staticInfo.unmarshalling;
            $scope.staticData.unMarshallingDetails.selectIOProcess = $scope.data.receiverMngrJSON.destName;
            
            var selectedMessageItems = staticInfo.selectedInboundUnMarshallers[$scope.staticData.unMarshallingDetails.selectIOProcess];
            
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
                    if(editedItem.ioProcess[i].name === $scope.data.receiverMngrJSON.destName){
                        return false;
                    }
                }
            }
            return true;
        };

        $scope.editProperties = function(objname, index, obj) {

            var editedItem;
            if(objname === "messageContentExtractor"){
                editedItem = $scope.data.unmarshalerJSON.messageContentExtractor;
            }else{
                editedItem = $scope.staticData.unMarshallingDetails[objname][index];
            }

            if(editedItem && editedItem.ioProcess){
                for(var i = 0; i<editedItem.ioProcess.length; i++){
                    if(editedItem.ioProcess[i].name === $scope.data.receiverMngrJSON.destName){
                        var copyItem = angular.copy(editedItem.ioProcess[i]);
                        MDMCfgDialog.data.editProperties = editedItem.ioProcess[i];
                        MDMCfgDialog.showDialog({
                            title: $scope.local.jumpPageTitle,
                            templateUrl: "module/tibco.mdm.configurator/dialog/view/EditProperties.html",
                            width: 700,
                            height: 450,
                            buttons:{
                                button3: {
                                    text : $scope.local.save,
                                    show : true,
                                    method: function(){
                                        angular.forEach(editedItem.ioProcess[i].selectedData, function(v, k){
                                            editedItem.ioProcess[i].subItem[k].selected = [];
                                            for(var j = 0,len = v.length;j<len;j++){
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
                            if(value.ioProcess[j].name === $scope.data.receiverMngrJSON.destName){
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
            UXWizard.switchForm("SenderManager");
        };

        $scope.closeButtonClick = function() {
            UXWizard.setData("dataOfDefineNewQueue",null);
            UXWizard.setData("staticDataForNewQueue", null);
            UXWizard.close();
        };

        $scope.previousButtonClick = function() {
            dataHandle();
            UXWizard.switchForm("ReceiverManager");
        };

    });

    util.createController("configurator.controller.tools.inboundQueue.SenderManager", [ "$scope", "$rootScope", "UXWizard", "Constant", "UXI18N" ], function($scope, $rootScope ,UXWizard, Constant, UXI18N) {
        var localNSPublic = "public";
        var localNS = "tools.defineNewQueue.inbound";
        var localNSTip = "tools.defineNewQueue.inbound.tip";
        $scope.local = {
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            next : UXI18N.getString(localNSPublic, "button.next"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "SenderManager.title"),
            information : UXI18N.getString(localNS, "SenderManager.information"),
            name : UXI18N.getString(localNS, "SenderManager.name"),
            SenderManagerClass : UXI18N.getString(localNS, "SenderManager.class"),
            poolSize : UXI18N.getString(localNS, "SenderManager.poolSize"),
            messagePersistence : UXI18N.getString(localNS, "SenderManager.messagePersistence"),
            chooseInformation : UXI18N.getString(localNS, "SenderManager.chooseInformation"),
            yes : UXI18N.getString(localNS, "SenderManager.yes"),
            chooseTitle : UXI18N.getString(localNS, "SenderManager.choose.title")
        };

        $scope.tipInfo = {
            "senderManagerName" : UXI18N.getString(localNSTip, "SenderManager.name"),
            "senderManagerClass" :  UXI18N.getString(localNSTip, "SenderManager.class"),
            "senderPoolSize" :  UXI18N.getString(localNSTip, "SenderManager.poolSize", ["8"], "bold")
        };

        $scope.data = UXWizard.getData("dataOfDefineNewQueue") || {};

        $scope.staticData = {};
        var staticInfo = angular.copy(tibco.ux.service.staticInfo.inboundQueue);
        $scope.staticData["senderMgClass"] = staticInfo["senderMgClass"];

        // init data
        $scope.data.senderMngrJSON.name = $scope.data.senderMngrJSON.name || $scope.data.baseDetails.logicalQName + $scope.data.baseDetails.direction + "QueueSenderManager" ;
        $scope.data.senderMngrJSON.className = $scope.data.senderMngrJSON.className || $scope.staticData.senderMgClass[0];
        $scope.data.senderMngrJSON.poolSize = $scope.data.senderMngrJSON.poolSize || 8;
        $scope.data.senderMngrJSON.msgPersistent = $scope.data.senderMngrJSON.msgPersistent || true;

        $scope.chooseMarshal = function(){
            var paramObj = {};
            if($scope.data.baseDetails.marshal === true){
                paramObj = {
                    position : 5,
                    newItem : {
                        name : "Marshalers",
                        title : $scope.local.chooseTitle,
                        templateUrl : "module/tibco.mdm.configurator/tools/inbound_queue/view/Marshalers.html"
                    }
                };
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", paramObj);
            }

            if($scope.data.baseDetails.marshal === false){
                paramObj = {
                    position : 5,
                    removeItem : "Marshalers"
                };
                $rootScope.$broadcast("CHANGE_WIZARD_DATA", paramObj);
            }
        }

        $scope.nextButtonClick = function() {
            var nextformName = $scope.data.baseDetails.marshal? "Marshalers" : "XPathDefinitionFile";
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
            UXWizard.switchForm("Unmarshalers");
        };

    });

    util.createController("configurator.controller.tools.inboundQueue.Marshalers", [ "$scope", "UXWizard", "Constant", "UXI18N", "MDMCfgDialog" ], function($scope, UXWizard, Constant, UXI18N, MDMCfgDialog) {
        var localNSPublic = "public";
        var localNS = "tools.defineNewQueue.inbound";
        var localNSTip = "tools.defineNewQueue.inbound.tip";
        $scope.local = {
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            save : UXI18N.getString(localNSPublic, "button.save1"),
            next : UXI18N.getString(localNSPublic, "button.next"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            action : UXI18N.getString(localNSPublic, "item.action"),
            edit : UXI18N.getString(localNSPublic, "button.editUppercase"),
            title : UXI18N.getString(localNS, "Marshalers.title"),
            information : UXI18N.getString(localNS, "Marshalers.information"),
            messageProcessor : UXI18N.getString(localNS, "Marshalers.messageProcessor"),
            messageCreator : UXI18N.getString(localNS, "Marshalers.messageCreator"),
            messageFormatters : UXI18N.getString(localNS, "Marshalers.messageFormatters"),
            select : UXI18N.getString(localNS, "Marshalers.thead.select"),
            processorName : UXI18N.getString(localNS, "Marshalers.thead.processorName"),
            jumpPageTitle : UXI18N.getString(localNS, "Marshalers.jumpPageTitle")
        };

        $scope.tipInfo = {
            "MarshalersMessageProcessor" : UXI18N.getString(localNSTip, "Marshalers.messageProcessor"),
            "messageCreator" : UXI18N.getString(localNSTip, "Marshalers.messageCreator"),
            "messageFormatter" : UXI18N.getString(localNSTip, "Marshalers.messageFormatter")
        };

        $scope.data = UXWizard.getData("dataOfDefineNewQueue") || {};

        //handle static data
        function handleStaticData(){
            $scope.data.marshalerJSON = {
                messageCreator : null,
                messageContentMarshaler : [],
                messageMarshaler : []
            };

            $scope.staticData = {};
        
            var staticInfo = angular.copy(tibco.ux.service.staticInfo.inboundQueue);
            $scope.staticData.marshallingDetails = staticInfo.marshalling;
            $scope.staticData.marshallingDetails.selectIOProcess = $scope.data.receiverMngrJSON.destName;
            var selectedMessageItems = staticInfo.selectedInboundMarshallers[$scope.staticData.marshallingDetails.selectIOProcess];
            
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
                    if(editedItem.ioProcess[i].name === $scope.data.receiverMngrJSON.destName) {
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
                    if(editedItem.ioProcess[i].name === $scope.data.receiverMngrJSON.destName){
                        var copyItem = angular.copy(editedItem.ioProcess[i]);
                        MDMCfgDialog.data.editProperties = editedItem.ioProcess[i];
                        MDMCfgDialog.showDialog({
                            title: $scope.local.jumpPageTitle,
                            templateUrl: "module/tibco.mdm.configurator/dialog/view/EditProperties.html",
                            width: 700,
                            height: 450,
                            buttons:{
                                button3: {
                                    text : $scope.local.save,
                                    show : true,
                                    method: function(){
                                        angular.forEach(editedItem.ioProcess[i].selectedData, function(v, k){
                                            editedItem.ioProcess[i].subItem[k].selected = [];
                                            for(var j = 0,len = v.length;j<len;j++){
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
            var arr = $scope.staticData.MarshallingDetails[propStr];
            var temp = arr[index - 1];
            arr[index - 1] = arr[index];
            arr[index] = temp;

        }

        $scope.downAction = function(propStr, index){
            var arr = $scope.staticData.MarshallingDetails[propStr];
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
                            if(value.ioProcess[j].name === $scope.data.receiverMngrJSON.destName){
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
            UXWizard.switchForm("XPathDefinitionFile");
        };

        $scope.closeButtonClick = function() {
            UXWizard.close();
            UXWizard.setData("dataOfDefineNewQueue",null);
            UXWizard.setData("staticDataForNewQueue", null);
        };

        $scope.previousButtonClick = function() {
            dataHandle();
            UXWizard.switchForm("SenderManager");
        };

    });

    util.createController("configurator.controller.tools.inboundQueue.XPathDefinitionFile", [ "$scope", "$rootScope", "$location", "UXWizard", "Constant", "UXI18N", "ConfiguratorService", "MDMCfgMsgBar" ], function($scope, $rootScope, $location, UXWizard, Constant, UXI18N, ConfiguratorService, MDMCfgMsgBar) {
        var localNSPublic = "public";
        var localNS = "tools.defineNewQueue.inbound";
        $scope.local = {
            cancel : UXI18N.getString(localNSPublic, "button.cancel"),
            finish : UXI18N.getString(localNSPublic, "button.finish"),
            previous : UXI18N.getString(localNSPublic, "button.previous"),
            title : UXI18N.getString(localNS, "XPathDefinitionFile.title"),
            information : UXI18N.getString(localNS, "XPathDefinitionFile.information"),
            definitionFile : UXI18N.getString(localNS, "XPathDefinitionFile.definitionFile"),
            defineNewQueue : UXI18N.getString(localNS, "XPathDefinitionFile.defineNewQueue"),
            showInformation : UXI18N.getString(localNS, "XPathDefinitionFile.showInformation")
        };

        $scope.data = UXWizard.getData("dataOfDefineNewQueue") || {};
        $scope.data.baseDetails.xpath = "config/xpath.props";
        $scope.progressing = false;

        var nextformName = $scope.data.baseDetails.marshal? "Marshalers" : "SenderManager";

        function sendData(callback){
            if(!$scope.data.baseDetails.pkgScheme){
                var i;
                var isFound = false;
                var commProp = $scope.data.commContextJSON.subItem;
                for(i = 0;i<commProp.length;i++){
                    if(commProp[i].key === "payloadPackagingScheme"){
                        $scope.data.baseDetails.pkgScheme = commProp[i].value;
                        isFound = true;
                        break;
                    }
                }

                if(!isFound){
                    $scope.data.baseDetails.pkgScheme = "STANDARD_INTEGRATION";
                }
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

        $scope.finishButtonClick = function() {
            //code for storage
            $scope.local.successfullyInformation = UXI18N.getString(localNS, "XPathDefinitionFile.successfullyInformation", [$scope.data.baseDetails.logicalQName]);
            $scope.progressing = true;
            sendData(function(){
                UXWizard.close();
                UXWizard.setData("dataOfDefineNewQueue",null);
                UXWizard.setData("staticDataForNewQueue", null);
                if($location.path() === "/configuration"){
                    MDMCfgMsgBar.showConfirmMsg($scope.local.successfullyInformation, "homepage");
                }else{
                    MDMCfgMsgBar.showConfirmMsg($scope.local.successfullyInformation);
                }
                $rootScope.$broadcast("RELOAD_ALL_THREE_PANEL");
                $rootScope.$broadcast("edittable_enableActions",["save"]);
            });
            
        };

        $scope.closeButtonClick = function() {
            UXWizard.close();
            UXWizard.setData("dataOfDefineNewQueue",null);
            UXWizard.setData("staticDataForNewQueue", null);
        };

        $scope.previousButtonClick = function() {
            UXWizard.setData("dataOfDefineNewQueue",angular.extend($scope.data , UXWizard.getData("dataOfDefineNewQueue")));
            UXWizard.switchForm(nextformName);
        };
        
    });

    
})();
