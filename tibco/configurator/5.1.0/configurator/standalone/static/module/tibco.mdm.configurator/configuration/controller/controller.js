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
            loadDefaultsInformation : UXI18N.getString(localNS, "loadDefaultsInformation")
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