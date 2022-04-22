UXDirective.directive('uxMenuBar', function() {

    var directiveDefinitionObject = {
        priority: 0,
        template: function(tElement, tAttrs) {
            var template = '<div class="menuDiv"><ul class="menu"></ul></div>';
            return template;
        },
        replace: true,
        transclude: false,
        scope: true,
        controller: function($scope, $element, $attrs, $transclude, UXI18N) {
            var configDoc = configurator.resourceStore.configDoc;
            var menuListData = [];
            var xmlMenuList = util.xml.selectNodes(configDoc, 'config/menu-setting/menu');

            var setShowContentInAttributeValue = function(menu, value) {
                value = jQuery.trim(value);

                // default value for showContentIn attribute is 'main_panel'
                if (value == null || value === "") {
                    menu.showContentIn = "main_panel";

                } else {
                    if (value === "dialog" || value === "main_panel" || /dialog\([0-9]+,[0-9]+\)/.test(value)) {
                        menu.showContentIn = value;
                    } else {
                        throw new Error("please check config.xml, the showContentIn attribute value must be 'dialog', 'main_panel' or the format of 'dialog(width,height)', no empty strings !");
                    }

                }
            };

            var localNS = "uxMenuBar";
            $scope.local.placeholderText = UXI18N.getString(localNS, "placeholderText");

            var homeButton = {
                name : "home",
                display : "menuitem_home",
                href : "/configuration",
                showContentIn : "main_panel"
            };
            
            var editButton = {
                    name : "edit",
                    display : "menuitem_editOn",
                   // href : "/configuration",
                    showContentIn : "main_panel"
                };

            // var editLockTimer = {
            //     name : "editLockTimer",
            //     display : "menuitem_editLockTimer",
            //     // href : "/configuration",
            //     showContentIn : "main_panel"
            // };

            var staticMenuList = [
                {
                    name : "$global_search_text_box$",
                    showContentIn : "main_panel"
                }, {
                    display : "menuitem_greeting",
                    name : "user_name",
                    subMenu : [{
                        display : "menuitem_sub_setting",
                        name : "setting",
                        href : "/setting",
                        showContentIn : "main_panel"
                    }, {
                        display : "menuitem_sub_help",
                        name : "help",
                        href : "#/configuration",
                        showContentIn : "main_panel"
                    }, {
                        display : "menuitem_sub_logout",
                        name : "logout",
                        showContentIn : "main_panel"
                    }]
                }
            ];

            var dynamicMenuList = {
                "Save" : {
                    name : "save",
                    display : "menuitem_save",
                    showContentIn : "main_panel"
                }, 

                "editCancel" : {
                    name : "editCancel",
                    display : "menuitem_editOff",
                    showContentIn : "main_panel"
                },

                "Save&Redeploy" : {
                    name : "deploy",
                    display : "menuitem_deploy",
                    showContentIn : "main_panel"
                }, 
                "Tools" : {
                    name : "tools",
                    display : "menuitem_tools",
                    showContentIn : "main_panel"
                },
                "Load Defaults" : {
                    name : "load_defaults",
                    display : "menuitem_loadDefaults",
                    href : "#/configuration",
                    showContentIn : "main_panel"
                }
            };

            var toolMenuList = {
                "Restore" : {
                    name : "Restore",
                    display : "menuitem_restore",
                    href : "/revision_history",
                    showContentIn : "main_panel"
                }, 
                "Inbound Queue" : {
                    name : "inbound_queue",
                    display : "menuitem_sub_inbound_queue",
                    href : "module/tibco.mdm.configurator/tools/inbound_queue",
                    showContentIn : "dialog(950,500)"
                }, 
                "Outbound Queue" : {
                    name : "outbound_queue",
                    display : "menuitem_sub_outbound_queue",
                    href : "module/tibco.mdm.configurator/tools/outbound_queue",
                    showContentIn : "dialog(950,500)"
                }, 
                "Setup Database" : {
                    name : "setup_database",
                    display : "menuitem_sub_oracle",
                    href : "module/tibco.mdm.configurator/tools/setup_database",
                    showContentIn : "dialog(950,500)"
                }, 
                "Migration" : {
                    name : "migration",
                    display : "menuitem_sub_migration",
                    href : "module/tibco.mdm.configurator/tools/migration",
                    showContentIn : "dialog(950,500)"
                }, 
                "Add-on Plug-in Installer" : {
                    name : "addon_plugin_installer",
                    display : "menuitem_sub_installer",
                    href : "module/tibco.mdm.configurator/tools/addon_plugin_installer",
                    showContentIn : "dialog(950,500)"
                }
            };

            $scope.$on("SHOW_MENU_BAR", function(event, obj) {

                var topPanelItem, toolsItem;

                if(obj.pluginID === "default") {
                    topPanelItem = ["Save", "editCancel", "Save&Redeploy", "Tools", "Load Defaults"];
                    toolsItem = ["Restore", "Inbound Queue", "Outbound Queue", "Setup Database", "Migration", "Add-on Plug-in Installer"];
                }else {
                    topPanelItem = obj.topPanelItem;
                    toolsItem = obj.toolsItem;
                }

                var wizardInfo = obj.uiPluginJSON.wizard;

                var wizardObj = {};
                if(wizardInfo) {
                    for(var k = 0, klen = wizardInfo.length; k<klen; k++){
                        wizardObj[wizardInfo[k].name] = wizardInfo[k];
                    }
                }else {
                    wizardObj = toolMenuList;
                }

                var menuList = [];
                menuList.push(homeButton);
                menuList.push(editButton);
                // menuList.push(editLockTimer);
                
                for(var i = 0, ilen = topPanelItem.length; i<ilen; i++){
                    if(topPanelItem[i] === "Tools"){
                        var subMenu = [];
                        for(var j = 0, jlen = toolsItem.length; j<jlen; j++){
                            if(wizardObj[toolsItem[j]]) {
                                subMenu.push(wizardObj[toolsItem[j]]);
                            }
                        }
                        dynamicMenuList[topPanelItem[i]].subMenu = subMenu;
                    }
                    menuList.push(dynamicMenuList[topPanelItem[i]]);
                }
                menuList = menuList.concat(staticMenuList);



                drawMenuBar(menuList); 
            });
            

            function drawMenuBar(menuList){
                $scope.$apply(function() {
                    $scope.menuList = menuList;
                })
                
                // store menu data into menuDataMap
                var menuDataMap = {};
                var getMapData = function(list) {
                    var selfFun = arguments.callee;
                    jQuery.each(list, function(index, menu) {
                        if (menu.subMenu != null && angular.isArray(menu.subMenu)) {
                            selfFun(menu.subMenu);
                        }

                        if (menuDataMap[menu.name] != null) {
                            throw new Error("duplicate menu name");
                        } else {
                            menuDataMap[menu.name] = menu;
                        }
                    });
                };
                getMapData($scope.menuList);
                $scope.menuDataMap = menuDataMap;

                $scope.$on("databaseMode_change", function(event, param){
                    if(param === "POSTGRES") {
                        jQuery("[action-name=migration]").addClass("disable");
                        jQuery("[action-name=setup_database]").addClass("disable"); 
                    }else{
                        jQuery("[action-name=migration]").removeClass("disable");
                        jQuery("[action-name=setup_database]").removeClass("disable");
                    }
                });

                $scope.$on("edittable_enableActions",function(event,param){
                    $scope.$emit("ENABLE_SAVE_BUTTON", param);
                    angular.forEach(param, function(value, key) {
                        $scope["statusOf" + value] = true;
                        jQuery("[action-name='"+ value +"']").removeClass("disable");
                    });
                });

				// will get param as "edit" , """edit""" button clicked
                $scope.$on("enable_editingValues",function(event,param){
                    $scope.$emit("ENABLE_EDITING_VALUSE", param);
                    angular.forEach(param, function(value, key) {
                        $scope["statusOf" + value] = true;
                        jQuery("[action-name='"+ value +"']").addClass("disable");
                        // jQuery("[action-name = edit]").addClass("disable");
                    });
                });
                

               //value coming from db.
               $scope.$on("EditButton_Status",function(event,param){
                // $scope.$emit("ENABLE_EDITING_VALUSE", param);
                angular.forEach(param, function(value, key) {
                     if(key == "isRoleAdmin")
                         {   
                            $scope["isRoleAdmin"] = value;
                         }
                 });
                angular.forEach(param, function(value, key) {
                   if(key == "isEditEnabled")
                    {
                        $scope["statusOfeditEnable"] = value;
                        if(!$scope.statusOfeditEnable){
                            if(!$scope.isRoleAdmin){
                                $scope.$emit("EditButtonNonAdminRole", value);
                                }
                                else{
                                $scope.$emit("EditButtonStatusFalse", value);
                                }
                        }
                        else
                        {
                            $scope.$emit("EditButtonStatusTrue", value);
                        }
                    }
                });
            });

                // will get param as "editCancel" , """edit""" button clicked
                $scope.$on("cancelBtn_enableActions",function(event,param){
                    $scope.$emit("ENABLE_CANCEL_BUTTON", param);
                    angular.forEach(param, function(value, key) {
                        $scope["statusOf" + value] = true;
                        jQuery("[action-name='"+ value +"']").removeClass("disable");
                        //jQuery("[action-name = edit]").addClass("disable");
                    });
                });


                 // will get param as "edit", """cancel""" button clicked
                 $scope.$on("disable_editingValues",function(event,param){
                    $scope.$emit("DISABLE_EDITING_VALUSE", param);
                    angular.forEach(param, function(value, key) {
                        $scope["statusOf" + value] = false;
                        jQuery("[action-name='"+ value +"']").removeClass("disable");
                        // jQuery("[action-name = edit]").addClass("disable");
                    });
                });

                 // will get param as "editCancel" , """cancel""" button clicked
                $scope.$on("cancelBtn_disableActions",function(event,param){
                    $scope.$emit("DISABLE_CANCEL_BUTTON", param);
                    angular.forEach(param, function(value, key) {
                        $scope["statusOf" + value] = false;
                        jQuery("[action-name='"+ value +"']").removeClass("disable");
                        jQuery("[action-name = editCancel]").addClass("disable");
                        jQuery("[action-name = editCancel]").addClass("hide");
                    });
                });


                $scope.$on("edittable_disableActions",function(event,param){
                    angular.forEach(param, function(value, key) {
                        jQuery("[action-name='"+ value +"']").addClass("disable");
                    });
                });
            }   

        },

        compile: function compile(tElement, tAttrs, transclude) {
            return {
                pre: function preLink(scope, iElement, iAttrs, controller) {},
                post: function postLink($scope, iElement, iAttrs, controller) {

                    var menuTemplate = '<li class="{menuItemClass}"><a action-name="{action-name}" class="{className}">{menu.display}</a></li>';
                    var templateHasSub = '<li class="{menuItemClass} hasSubMenu"><a id="{menuItemId}">{menu.display}</a><div class="cfg_dropdown"><ul class="cfg_dropdownMenu" role="menu" aria-labelledby="dLabel">{subMenuItems}</ul></div></li>';
                    var subMenuTemplate = '<li><a tabindex="0" action-name="{action-name}">{menu.display}</a></li>';
                    var template = null;

                    
                    //get render href
                    var getRenderHref = function(menuData) {
                        var deadLink = "javascript:void(0);";
                        if (menuData.href == null || jQuery.trim(menuData.href) === "") {
                            return deadLink;

                        // if menuData.showContentIn start with "dialog", return deadLink
                        } else if (menuData.showContentIn.indexOf("dialog") === 0) {
                            return deadLink;
                        } else {
                            return menuData.href;
                        }
                    };

                    /* update navigation menu */
                    var updateUI = function(menuList) {
                        var html = "";
                        if (menuList != null && angular.isArray(menuList)) {
                            jQuery.each(menuList, function(index, menu) {
                                // render global search text box
                                if (menu.name === "$global_search_text_box$") {
                                    html += '<li class="menuItem"><div class="searchSpan"><input id="searchInput" class="searchInput" type="text" ng-model="searchText" placeholder="' + $scope.local.placeholderText + '"/><i class="searchIcon"></i></div><div class="searchResult"></div></li>';

                                    // render menu that have sub menus
                                } else if (menu.subMenu != null && angular.isArray(menu.subMenu)) {
                                    if (index === menuList.length - 1) {
                                        html += templateHasSub.replace('{menuItemClass}', 'menuItem-last').replace('{menu.display}', $scope.local[menu.display] || menu.display).replace('{menuItemId}', menu.display);
                                    } else {
                                        html += templateHasSub.replace('{menuItemClass}', 'menuItem').replace('{menu.display}', $scope.local[menu.display] || menu.display).replace('{menuItemId}', menu.display);
                                    }

                                    // render sub menu
                                    var subMenuHTML = "";
                                    jQuery.each(menu.subMenu, function(index, subMenu) {
                                        template = null;
                                        template = subMenuTemplate.replace('{menu.href}', getRenderHref(subMenu));
                                        template = template.replace('{menu.display}', $scope.local[subMenu.display] || subMenu.display);
                                        template = template.replace("{action-name}", subMenu.name);
                                        subMenuHTML += template;
                                    });

                                    html = html.replace('{subMenuItems}', subMenuHTML);

                                    // render menu
                                } else {

                                    template = "";
                                    if (index === menuList.length - 1) {
                                        template = menuTemplate.replace('{menuItemClass}', 'menuItem-last');
                                    } else {
                                        template = menuTemplate.replace('{menuItemClass}', 'menuItem');
                                    }

                                    template = template.replace('{menu.href}', getRenderHref(menu));
                                    template = template.replace('{menu.display}', $scope.local[menu.display] || menu.display);
                                    template = template.replace("{action-name}", menu.name);

                                    
                                    if(menu.name === "save" || menu.name === "deploy" || menu.name === "editCancel"){
                                        if(menu.name === "editCancel"){
                                            template = template.replace("{className}", "hide");
                                        }else{
                                            template = template.replace("{className}", "disable");
                                        }
                                    }else{
                                        template = template.replace("{className}", "");
                                    }
                                    
                                    html += template;

                                }
                            });
                            iElement.find("ul.menu")[0].innerHTML = html;
                            iElement.find('div.searchResult').hide();
                            iElement.find('#searchInput').keydown(function(event) {
                                if (event.keyCode == 13) {
                                    event.preventDefault();
                                    event.stopPropagation();

                                    var searchInput = iElement.find('#searchInput');
                                    $scope.$emit("navigation_menu_doSearch", searchInput);
                                }
                            });
                            $(iElement.find('#searchInput')).placeholder();
                            $(iElement.find('#searchInput')).focus(function(event) {
                                $(".searchSpan").addClass("searchfocus");
                            });
                            $(iElement.find('#searchInput')).blur(function(event) {
                                $(".searchSpan").removeClass("searchfocus");
                            });
                            // ====== bind event ======//
                            iElement.find("li.hasSubMenu").mouseenter(function(event) {
                                var target = jQuery(event.target);
                                if (target.hasClass("hasSubMenu")) {
                                    target.addClass("open");
                                } else {
                                    target.parents("li.hasSubMenu").addClass("open");
                                }

                            }).mouseleave(function(event) {
                                var target = jQuery(event.target);
                                if (target.hasClass("hasSubMenu")) {
                                    target.removeClass("open");
                                } else {
                                    target.parents("li.hasSubMenu").removeClass("open");
                                }
                            });

                            iElement.click(function(event) {

                                var target = jQuery(event.target);
                                if(target.hasClass("disable")){
                                    return;
                                }
                                $scope.$apply(function() {
                                    var actionName = target.attr("action-name");
                                    if (actionName != null) {
                                        $scope.$emit("navigation_menu_item_click", $scope.menuDataMap[actionName]);
                                    }
                                    target.parents("li.hasSubMenu").removeClass("open");target.parents("li.hasSubMenu").removeClass("open");
                                });
                            });
                            // $scope.$emit("check_EditStatus_FromDB");
                        }
                    };

                    $scope.$watch("menuList", function(newValue, oldValue){
                        
                        if(newValue){
                           updateUI($scope.menuList); 
                        }  
                        // $scope.$emit("check_EditStatus_FromDB");
                    });
                    
                }
            };
        }
    };
    return directiveDefinitionObject;
});
