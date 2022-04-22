/*! 2017-03-31 */

/* --------------------- Source: module/tibco.ux.directive/pre-defined.js-------------------- */
var util = configurator.util;
var UXDirective = angular.module('tibco.ux.directive', ['tibco.ux.service']);

/* --------------------- Source: module/tibco.ux.directive/applyTree/js/directive.js-------------------- */
var treeScrollBars = [];

	UXDirective.directive('applyTree', [ "$log", '$timeout', function($log, $timeout) {
        return {
            restrict : "A",
            templateUrl : "module/tibco.ux.directive/applyTree/view/accordionTree.html",
            replace : false,
            scope : {
                treeTitle : "@treeTitle",
                treeData : "=applyTree", // data of the tree
                treeCallback : "=nodeAction", // the callback function when click on the tree node
                editAction : "=editAction", // callback function of edit, clone and delete
                visibility : "=visibility",
                serverName : "=serverName"
            },
            controller : function($scope, $element) {
                $timeout(function() {
                    var contentElm = $element.find(".treeContainer");
                    treeScrollBars[$scope.treeTitle] = kl.ScrollBars.makeScrollable(contentElm, {
                      bFlipXY: false,
                      bHorizontal: true,
                      bScrollableByArrowKeys: false,
                      bVertical: true,
                      bVerticalBarVisible: true,
                      bVerticalScrollable: true,
                      numWrapperHeight: ($scope.treeTitle === "Configuration")? 150 : 70,
                      numWrapperWidth: contentElm.width() + 10,
                      bAutoHide : false,
                      numHowToMove: kl.ScrollBars.MOVE_BY_POSITION
                    });
                }, 200);

                $scope.$watch("treeData", function(n, o){
                    if(n.length > 0){
                        $timeout(function() {
                            var height = $scope.treeTitle == "Cluster" ? parseInt($element.css("height"), 10) - 80 : parseInt($element.parent().css("height"), 10) - 142 - parseInt(angular.element("#clusterpanel").css("height"), 10) - 35;                           
                            treeScrollBars[$scope.treeTitle].setWrapperHeight(height);
                        }, 200);
                    };
                },true);
                

                /* collapse sub items and expend sub items */
                $scope.toggleSub = function($event) {
                    var ele = $event.target, // get the toggled arrow
                    sub = $(ele).parent().siblings(".sub-items"); // get toggled subitem
                    if ($(ele).hasClass("collapsed")) { // expend
                        $(sub).show();
                        $(ele).removeClass("collapsed").addClass("expended");
                    } else if ($(ele).hasClass("expended")) { // collapse
                        $(sub).hide();
                        $(ele).removeClass("expended").addClass("collapsed");
                    }
                    treeScrollBars[$scope.treeTitle].refresh();
                };
                $scope.selectedDOM = null;
                
                /* called when select one item */
                $scope.selectItem = function(e, index, item) {
                    if($scope.focused){
                        return;
                    }else{
                        if ($scope.treeCallback) {
                            $scope.treeCallback(item);
                        }
                        if($scope.selectedDOM){
                            $($scope.selectedDOM).removeClass("highlight");
                        }else{
                            $element.find(".highlight").removeClass('highlight');
                        }
                        $(e.currentTarget).addClass("highlight");
                        $scope.selectedDOM = e.currentTarget;
                    }
                    
                };

                $scope.showIcon = function(e){
                    $(e.currentTarget).find("i.icon-list").show();
                };

                $scope.hideIcon = function(e){
                    $(e.currentTarget).find("i.icon-list").hide();
                    $scope.focused = false;
                };

                $scope.visiableFlt = function(e){
                    if(e.visibility){
                        return e.visibility == $scope.visibility['default'];
                    }else{
                        return true;
                    }
                };

                $scope.vfltBasic = function(e){
                    if(e.visibility){
                        return e.visibility == "Basic" ||e.visibility == "All";
                    }else{
                        return true;
                    }
                };

                $scope.vfltAdvanced = function(e){
                    if(e.visibility){
                        return e.visibility == "Advanced" || e.visibility == "All";
                    }else{
                        return true;
                    }
                };
                

                $scope.showDropdown = false;
                $scope.currentDom = null;
                $scope.focused = false;
                /* Function to show edit dropdown */
                $scope.showDropdownFunc = function(event) {
                    if(event){
                        $scope.currentDom = $(event.currentTarget);
                    }
                    if ($scope.showDropdown) {
                        $scope.showDropdown = false;
                    } else {
                        $scope.showDropdown = true;
                    }
                };

                $scope.hoverIcon = function(event) { // change editable list icon style when mouse enter and mouse leave
                    $(event.currentTarget).toggleClass('icon-white');
                };

                $scope.hoverLi = function(event){
                    $(event.currentTarget).parent().children().not($(event.currentTarget)).children("a").removeClass('focused').children("i").removeClass('icon-white');
                    $(event.currentTarget).children("a").addClass('focused').children("i").addClass('icon-white');

                    $(event.currentTarget).parent().children().not($(event.currentTarget)).removeClass('focused');
                    $(event.currentTarget).addClass('focused');
                };


                $scope.$watch('focused', function() { // The dropdown removed when mouse pointer leave the node
                    if (!$scope.focused) {
                        $scope.showDropdown = false;
                    }
                });


                $scope.$watch('showDropdown', function() { // when showDropdown is true then add drop down, otherwise remove the drop down
                    if($scope.currentDom){
                        var ielement = $scope.currentDom.parent();
                        if ($scope.showDropdown) {
                            ielement.find("ul").removeClass("hide").bind("mouseleave",function(){
                                $scope.focused = false;
                            });
                            $scope.focused = true;
                        } else {
                            ielement.find("ul").addClass("hide");
                            ielement.find("ul > li").removeClass('focused').children("a").removeClass('focused').children("i").removeClass('icon-white');
                        }
                    }
                    
                });


                

                
            }
        };
    } ]);

// })();

/* --------------------- Source: module/tibco.ux.directive/editTable/js/directive.js-------------------- */
    UXDirective.directive('editTable', function() {
        return {
            restrict : "A",
            templateUrl : "module/tibco.ux.directive/editTable/view/template.html",
            replace : true,
            scope : {
                tableData : "=tableData", // transfer table data
                serverName : "=serverName",
                configName : "=configName",
                selectedindex : "=selectedIndex"
            },
            controller : function($scope, $element, $attrs, $transclude, $window ,$rootScope , MDMCfgDialog, MDMCfgMsgBar, UXI18N) {
                var localNSPublic = "public";
                var localNS = "editTable";
                $scope.local = {
                    saveButton : UXI18N.getString(localNSPublic, "button.save1"),
                    cancelButton : UXI18N.getString(localNSPublic, "button.cancel"),
                    cloneButton : UXI18N.getString(localNSPublic, "button.cloneUppercase"),
                    deleteButton : UXI18N.getString(localNSPublic, "button.deleteUppercase"),
                    configurationInformation : UXI18N.getString(localNS, "configurationInformation"),
                    readonlyInformation : UXI18N.getString(localNS, "readonlyInformation"),
                    buttonAddNewProperty : UXI18N.getString(localNS, "buttonAddNewProperty"),
                    filterHint : UXI18N.getString(localNS, "filterHint"),
                    theadProperty : UXI18N.getString(localNS, "theadProperty"),
                    theadValue : UXI18N.getString(localNS, "theadValue"),
                    theadDescription : UXI18N.getString(localNS, "theadDescription"),
                    theadHotDeployable : UXI18N.getString(localNS, "theadHotDeployable"),
                    theadVersion : UXI18N.getString(localNS, "theadVersion"),
                    columnPickerTitle : UXI18N.getString(localNS, "columnPickerTitle"),
                    errorMessage : UXI18N.getString(localNS, "errorMessage")
                };

                var tableContainer = $element.find(".ediTable-container");
                var tableInner = $element.find(".ediTable-container .ediTable-table");

                $scope.inFilter = false;
                $scope.selectedindex = -1;

                $scope.transcludeDesc = function(str) {
                    return str.replace(/\<br\/\>/g, "\n");
                };

                $scope.getConfigNames = function() {
                    return $scope.configName.join(" - ");
                };

                $scope.inFilterAction = function() {
                    $scope.inFilter = true;
                    var isInputSupported = 'placeholder' in document.createElement('input');
                    var IntervalTime = 0;
                    if(isInputSupported){
                        IntervalTime = 500;
                    }else{
                        IntervalTime = 1500;
                    }

                    setTimeout(function() {
                        jQuery("input.ediTable-action-filter-input").eq(0).focus();
                    }, IntervalTime);
                    
                };

                $scope.blurAction = function() {
                    if(!$scope.filterKey){
                        $scope.inFilter = false;
                    }
                };

                $scope.$watch(function(){
                    return $window.screen.height;
                },function(){
                    
                });

                $scope.$watch("selectedindex",function(){
                    if($scope.selectedindex === -1){
                        $scope.disableActions(["clone","todelete"]);
                    }
                })
                
                $scope.disable = {
                    clone : true,
                    save : true,
                    deploy : true,
                    todelete : true,
                    editCancel : true
                    // editLockTimer : true
                };

                $scope.enableActions = function(buttons) {
                    var i,len;
                    for (i = 0, len = buttons.length; i < len; i++) {
                        $scope.disable[buttons[i]] = false;
                    }
                };

                $scope.disableActions = function(buttons){
                    var i,len;
                    for (i = 0, len = buttons.length; i < len; i++) {
                        $scope.disable[buttons[i]] = true;
                    }
                    $scope.selectedindex = -1;
                };

                if(util.cookie.getCookie("columnPicker_value")){
                    $scope.selected = angular.fromJson(util.cookie.getCookie("columnPicker_value"));
                }else{
                    $scope.selected = {
                        isHotDeployable : false,
                        name : true,
                        value : true,
                        description : true,
                        sinceVersion : false
                    };
                    util.cookie.setCookie("columnPicker_value", angular.toJson($scope.selected));
                }

                $scope.columnPicker = function(){
                  MDMCfgDialog.showDialog({
                    title : $scope.local.columnPickerTitle,
                    templateUrl : "columnPicker",
                    width : 400,
                    height : 440,
                    buttons : {
                        button4 : {
                            show : true,
                            text : $scope.local.cancelButton,
                            disabled : false,
                            method : function() {
                              MDMCfgDialog.closeDialog();
                            }
                        },
                        button3 : {
                            show : true,
                            text : $scope.local.saveButton,
                            disabled : false,
                            method : function() {
                                $scope.selected = MDMCfgDialog.data.columnPicker;
                                MDMCfgDialog.closeDialog();
                                util.cookie.setCookie("columnPicker_value", angular.toJson($scope.selected));
                                $(".freecolumn").width(0);
                                $rootScope.$broadcast("UPDATE_FREE_COLUMN");
                            }
                        }
                      }
                  });
                  MDMCfgDialog.data["columnPicker"] = angular.copy($scope.selected);
                };

                $scope.selectRow = function(index, rowData) {

                    var editTableDom = angular.element('.cfg_editTable .ediTable-container');
                    editTableDom.find('.selected').removeClass('selected');

                    $scope.selectItemData = rowData;
                    $scope.selectedindex = index;
                    $scope.enableActions([ 'clone', 'todelete' ]);

                    // selectItemsMarker.updataSelectItems('propertyName', rowData.name);
                    $rootScope.$broadcast("SCROLLREFRESH_propertyTable");
                };

                $scope.$on("SELECT_PROPERTY_TABLE_ITEM", function(event, index) {
                    var rowData = $scope.tableData[index];
                    $scope.selectRow(index, rowData);

                });

                $scope.closeListTable = function($event) {
                    $($event.target).parents("div.listTable").hide();

                    $rootScope.$broadcast("LISTTABLE_CLOSE");

                };

    
                $scope.isEnabled = function(){
                    return $rootScope.statusOfedit;   
                };

                $scope.onRender = function($event, rowData) { // switch to edit mode
                    if(rowData.readonly === "true"){
                        MDMCfgMsgBar.showErrorMsg($scope.local.readonlyInformation, "homepage");
                        return;
                    }

                    if(rowData.dataType === "list") {

                        var oldvalue = angular.copy(rowData.value);
                        var listTable = jQuery($event.target).parent().find(".listTable");
                        
                        listTable.show("fast");

                        $scope.$on("LISTTABLE_CLOSE", function() {
                            if(!angular.equals(oldvalue,rowData.value)){
                                $rootScope.$broadcast("saveChangesOfEditableTable", rowData);
                            }
                        });

                    }else{
                        rowData.inEditing = true; // inEditing's value indicate if the cell is in editing mode currently
                    }
                };

                $scope.onRenderQuitForList = function($event,rowData){
                    rowData.inEditing = false;
                };

                $scope.onRenderQuit = function($event, rowData) { // switch out from edit mode
                    var newValue = $($event.target).val(); // got modification

                    if(rowData.dataType === "number"){
                        if(!/^[0-9]*$/.test(newValue)){
                            MDMCfgMsgBar.showErrorMsg($scope.local.errorMessage, "homepage");
                            return;
                        }
                    }


                    if (newValue !== rowData.value) { // if the value changed
                        rowData.value = newValue;
                        $rootScope.$broadcast("saveChangesOfEditableTable", rowData);
                    }
                    rowData.inEditing = false;
                };

                $scope.sortMe = function() { // get the key's field to sort by
                    return function(row) {
                        var sortkey = "";
                        if ($scope.predicate) {
                            sortkey = row[$scope.predicate];
                            sortkey = angular.isArray(sortkey) ? sortkey[0] : sortkey ;
                            if (angular.isObject(sortkey)) {
                                for (var i in sortkey) {
                                    sortkey = sortkey[i];
                                    break;
                                }
                            }
                        }
                        return sortkey;
                    };
                };

                $scope.sortBy = function(sortKey) { // setting the parameter of orderBy filter
                    if ($scope.predicate === sortKey) { // if sort in another order by the same column
                        $scope.reverse = !$scope.reverse;
                    } else {
                        $scope.predicate = sortKey;
                        $scope.reverse = false;
                    }
                };

                //buttons function
                $scope.buttons = {
                    addproperty : function(){
                        $rootScope.$broadcast("edittable_addproperty");
                    },
                    clone : function(){
                        $rootScope.$broadcast("edittable_clone",$scope.selectItemData);
                    },
                    todelete : function(){
                        $rootScope.$broadcast("edittable_todelete",$scope.selectItemData);
                    }

                };

                //enable save button
                if(MDMCfgDialog.data.statusOfRevision === true){
                    $scope.enableActions(["save"]);
                }

                // $scope.columnWidth = {
                //     name : 200,
                //     value : 260,
                //     description : 0 
                // };

                // $scope.$on("UDATE_COLUMN_WIDTH", function(event, data) {
                //     $scope.columnWidth.name = $("th.propertyRow").width();
                //     $scope.columnWidth.value = $("th.valueRow").width();
                //     $scope.columnWidth.description = $("th.descriptionRow").width();

                //     $(".ediTable-table-cell input").width($scope.columnWidth.value - 50);
                //     $(".ediTable-table-cell select").width($scope.columnWidth.value - 50);
                // });

            },
            link : function(scope, element, attrs) {

            }
        };
    });

// })();

/* --------------------- Source: module/tibco.ux.directive/ngEditTable/js/directive.js-------------------- */
    UXDirective.directive('ngEditTable', function() {
        return {
            restrict : "A",
            templateUrl : "module/tibco.ux.directive/ngEditTable/view/template.html",
            replace : true,
            scope : {
                tableData : "=tableData", // transfer table data
                serverName : "=serverName",
                configName : "=configName",
                selectedindex : "=selectedIndex"
            },
            controller : function($scope, $element, $attrs, $transclude, $window ,$rootScope , MDMCfgDialog, MDMCfgMsgBar, UXI18N) {
                var localNSPublic = "public";
                var localNS = "editTable";
                $scope.local = {
                    saveButton : UXI18N.getString(localNSPublic, "button.save1"),
                    cancelButton : UXI18N.getString(localNSPublic, "button.cancel"),
                    cloneButton : UXI18N.getString(localNSPublic, "button.cloneUppercase"),
                    deleteButton : UXI18N.getString(localNSPublic, "button.deleteUppercase"),
                    configurationInformation : UXI18N.getString(localNS, "configurationInformation"),
                    readonlyInformation : UXI18N.getString(localNS, "readonlyInformation"),
                    buttonAddNewProperty : UXI18N.getString(localNS, "buttonAddNewProperty"),
                    filterHint : UXI18N.getString(localNS, "filterHint"),
                    theadProperty : UXI18N.getString(localNS, "theadProperty"),
                    theadValue : UXI18N.getString(localNS, "theadValue"),
                    theadDescription : UXI18N.getString(localNS, "theadDescription"),
                    theadHotDeployable : UXI18N.getString(localNS, "theadHotDeployable"),
                    theadVersion : UXI18N.getString(localNS, "theadVersion"),
                    columnPickerTitle : UXI18N.getString(localNS, "columnPickerTitle"),
                    errorMessage : UXI18N.getString(localNS, "errorMessage"),
                    editListProperty : UXI18N.getString(localNS, "editListProperty"),
                    listTableValue : UXI18N.getString(localNS, "listTableValue"),
                    listTableDelete : UXI18N.getString(localNS, "listTableDelete")
                };
                $scope.selectedIndex = -1;

                $scope.$on("CHANGE_TABLE_STYLE", function(event, tableStyle) {
                    $scope.$apply(function() {
                        $scope.style.description = tableStyle.description;
                    });
                });

                $scope.filter = function() {
                    $rootScope.$broadcast("SCROLLTOP_propertyTable");
                };

                $scope.inFilter = false;
                // $scope.selectedindex = -1;

                $scope.transcludeDesc = function(str) {
                    return str.replace(/\<br\/\>/g, "\n");
                };

                $scope.getConfigNames = function() {
                    return $scope.configName.join(" - ");
                };

                $scope.inFilterAction = function() {
                    $scope.inFilter = true;
                    var isInputSupported = 'placeholder' in document.createElement('input');
                    var IntervalTime = 0;
                    if(isInputSupported){
                        IntervalTime = 500;
                    }else{
                        IntervalTime = 1500;
                    }

                    setTimeout(function() {
                        jQuery("input.ediTable-action-filter-input").eq(0).focus();
                    }, IntervalTime);
                    
                };

                $scope.blurAction = function() {
                    if(!$scope.filterKey){
                        $scope.inFilter = false;
                    }
                };

                $scope.$watch("selectedindex",function(){
                    if($scope.selectedindex === -1){
                        $scope.disableActions(["clone","todelete"]);
                    }
                })
                
                $scope.disable = {
                    clone : true,
                    save : true,
                    deploy : true,
                    todelete : true,
                    editCancel : true
                    // editLockTimer : true
                };

                $scope.enableActions = function(buttons) {
                    var i,len;
                    for (i = 0, len = buttons.length; i < len; i++) {
                        $scope.disable[buttons[i]] = false;
                    }
                };

                $scope.disableActions = function(buttons){
                    var i,len;
                    for (i = 0, len = buttons.length; i < len; i++) {
                        $scope.disable[buttons[i]] = true;
                    }
                    $scope.selectedindex = -1;
                };

                var defaultStyle = {
                    isHotDeployable: {
                        "width" : "60px"
                    },
                    name : {
                        "width" : "200px"
                    },
                    value : {
                        "width" : "260px"
                    },
                    description : {
                        "margin-left" : "0px",
                        "margin-right" : "0px"
                    },
                    sinceVersion : {
                        "width" : "80px"
                    }
                };

                $scope.nonDescFlag = false;

                $scope.resizeColumn = function(selectedObj, isInit) {
                    var mgleft = 0;
                    var mgRight = 0;
                    var checkArr = [ "isHotDeployable", "value", "name" ];
                    var checkArr2 = ["value", "name", "sinceVersion", "isHotDeployable"];

                    $scope.style = angular.copy(defaultStyle);

                    if(selectedObj.description) {
                        if(isInit || $scope.nonDescFlag){
                            for(var i = 0, len = checkArr.length; i<len; i++){
                                if(selectedObj[checkArr[i]]) {
                                    mgleft += parseInt(defaultStyle[checkArr[i]].width, 10) + 30;
                                }
                            }

                            if($scope.nonDescFlag){
                                $scope.nonDescFlag = false;
                            }

                        }else{
                            for(var i = 0, len = checkArr.length; i<len; i++){
                                if(selectedObj[checkArr[i]] ) {
                                    if( checkArr[i] === "isHotDeployable" ){
                                        mgleft += parseInt(defaultStyle[checkArr[i]].width, 10) + 30;
                                    }else{
                                        var currentWidth = $("." + checkArr[i]).width();
                                        mgleft += currentWidth + 30;
                                    } 
                                }
                            }
                        }

                        if(selectedObj.sinceVersion) {
                            mgRight = 110;
                        }

                        $scope.style.description["margin-left"] = mgleft + "px";
                        $scope.style.description["margin-right"] = mgRight + "px";

                    }else{
                        $scope.nonDescFlag = true;
                        for(var i = 0, len = checkArr2.length; i<len; i++) {
                            if(selectedObj[checkArr2[i]]){
                                var tableWidth = $(".edit-table").width();
                                var otherItemWidth = 0;
                                angular.forEach(selectedObj, function(value, key) {
                                    if(value && key !== checkArr2[i]) {
                                        otherItemWidth += parseInt($scope.style[key].width, 10) + 30;
                                    }
                                });

                                $scope.style[checkArr2[i]].width = tableWidth - otherItemWidth - 40;

                                break;
                            }
                        }
                    }
                    
                };

                if(util.cookie.getCookie("columnPicker_value")){
                    $scope.selected = angular.fromJson(util.cookie.getCookie("columnPicker_value"));
                }else{
                    $scope.selected = {
                        isHotDeployable : false,
                        name : true,
                        value : true,
                        description : true,
                        sinceVersion : false
                    };
                    util.cookie.setCookie("columnPicker_value", angular.toJson($scope.selected));
                }

                $scope.resizeColumn($scope.selected,true);

                $scope.columnPicker = function(){
                    MDMCfgDialog.showDialog({
                    title : $scope.local.columnPickerTitle,
                    templateUrl : "columnPicker",
                    width : 400,
                    height : 440,
                    buttons : {
                        button4 : {
                            show : true,
                            text : $scope.local.cancelButton,
                            disabled : false,
                            method : function() {
                              MDMCfgDialog.closeDialog();
                            }
                        },
                        button3 : {
                            show : true,
                            text : $scope.local.saveButton,
                            disabled : false,
                            method : function() {
                                $scope.selected = MDMCfgDialog.data.columnPicker;
                                MDMCfgDialog.closeDialog();
                                util.cookie.setCookie("columnPicker_value", angular.toJson($scope.selected));
                                $scope.resizeColumn($scope.selected, false);
                                // $(".freecolumn").width(0);
                                $rootScope.$broadcast("UPDATE_FREE_COLUMN");
                            }
                        }
                      }
                    });
                    MDMCfgDialog.data["columnPicker"] = angular.copy($scope.selected);
                };

                $scope.selectRow = function(index, rowData) {

                    $scope.selectItemData = rowData;
                    $scope.selectedIndex = index;
                    $scope.enableActions([ 'clone', 'todelete' ]);
                    $rootScope.$broadcast("SCROLLREFRESH_propertyTable");
                };

                $scope.$on("TABLE_SELECTED_CHANGE", function(event, index) {
                    $scope.selectedIndex = index;
                });

                $scope.showDialog = function($event, rowData){
                    var target = angular.element($event.currentTarget);
                    if(target.hasClass("column-3")){
                        var context = rowData.description;
                        if(context !== ""){
                            target.find(".showInfor").removeClass("hide").addClass("showing");
                            target.find(".showInfor").show();
                        }
                    }else{
                        target.find(".showInfor").removeClass("hide").addClass("showing");
                        target.find(".showInfor").show();
                    }
                };

                $scope.hideDialog = function($event){
                    $($event.currentTarget).find(".showInfor").removeClass("showing").addClass("hide");
                    $($event.currentTarget).find(".showInfor").hide();
                    $scope.focused = false;
                };

                $scope.dialogFixingPosition = function($event){
                    var target = angular.element($event.currentTarget);
                    var screenHeight = $(document).height();
                    var screenWidth = $(document).width();
                    var offset_x = $event.pageX;
                    var offset_y = $event.pageY;
                    var showInforHeightColume1 = $(".body .column-1 .showing").outerHeight(true);
                    var showInforHeightColume3 = $(".body .column-3 .showing").outerHeight(true);
                    var showInforWideColume1 = $(".body .column-1 .showing").outerWidth(true);
                    var showInforWideColume3 = $(".body .column-3 .showing").outerWidth(true);

                    var leftPosition = offset_x;
                    var topPosition = offset_y;
                    if(target.hasClass("column-1")){
                        if(showInforHeightColume1 < (screenHeight - (offset_y + 40 + showInforHeightColume1))){
                            topPosition = topPosition + 20 + "px";
                            $(target).find(".showing").css({"top": topPosition, "left": leftPosition});
                        }else{
                            topPosition = topPosition - showInforHeightColume1 - 25 + "px";
                            $(target).find(".showing").css({"top": topPosition, "left": leftPosition});
                        }
                    }else if(target.hasClass("column-3")){
                        if(showInforWideColume3 > (screenWidth - offset_x)){
                            leftPosition = screenWidth - showInforWideColume3 - 25 + "px";
                        }
                        if(showInforHeightColume3 < (screenHeight - (offset_y + 10 + showInforHeightColume3))){
                            topPosition = topPosition + 45 + "px";
                            $(target).find(".showing").css({"top": topPosition, "left": leftPosition});
                        }else{
                            var topPosition = topPosition - showInforHeightColume3 - 35 +"px";
                            $(target).find(".showing").css({"top": topPosition, "left": leftPosition});
                        }
                    }
                };

                $scope.$on("SELECT_PROPERTY_TABLE_ITEM", function(event, index) {
                    var rowData = $scope.tableData[index];
                    $scope.selectRow(index, rowData);

                });

                var oldListValue;

                $scope.closeListTable = function($event, rowData) {
                    $($event.target).parents("div.listTable").hide();

                    $rootScope.$broadcast("LISTTABLE_CLOSE");

                    if(!angular.equals(oldListValue,rowData.value)){
                        $rootScope.$broadcast("saveChangesOfEditableTable", rowData);
                    }
                };

                $scope.isEnabled = function(){
                    return $rootScope.statusOfedit;   
                };

                $scope.onRender = function($event, rowData) { // switch to edit mode
                    if(rowData.readonly === "true"){
                        MDMCfgMsgBar.showErrorMsg($scope.local.readonlyInformation, "homepage");
                        return;
                    }

                    if(rowData.dataType === "list") {

                        var listTable = jQuery($event.target).parent().find(".listTable");

                        if(listTable.is(":hidden")) {
                            oldListValue = angular.copy(rowData.value);
                        }
                        
                        listTable.show("fast", function() {
                            $rootScope.$broadcast("LISTTABLE_OPEN");
                        });

                    }else{
                        rowData.inEditing = true; // inEditing's value indicate if the cell is in editing mode currently
                    }
                };

                $scope.onRenderQuitForList = function($event,rowData){
                    rowData.inEditing = false;
                };

                $scope.onRenderQuit = function($event, rowData) { // switch out from edit mode

                    var newValue = angular.element($event.target).val(); // got modification
                    if(rowData.dataType === 'enum'){
                        newValue = rowData.valueOpts[newValue];
                    }

                    if(rowData.dataType === "number"){
                        if(!/^[0-9]*$/.test(newValue)){
                            MDMCfgMsgBar.showErrorMsg($scope.local.errorMessage, "homepage");
                            return;
                        }
                    }

                    if (newValue !== rowData.value) { // if the value changed
                        rowData.value = newValue;
                        $rootScope.$broadcast("saveChangesOfEditableTable", rowData);
                    }
                    rowData.inEditing = false;
                };

                $scope.sortMe = function() { // get the key's field to sort by
                    return function(row) {
                        var sortkey = "";
                        if ($scope.predicate) {
                            sortkey = row[$scope.predicate];
                            sortkey = angular.isArray(sortkey) ? sortkey[0] : sortkey ;
                            if (angular.isObject(sortkey)) {
                                for (var i in sortkey) {
                                    sortkey = sortkey[i];
                                    break;
                                }
                            }
                        }
                        return sortkey;
                    };
                };

                $scope.sortBy = function(sortKey) { // setting the parameter of orderBy filter
                    if ($scope.predicate === sortKey) { // if sort in another order by the same column
                        $scope.reverse = !$scope.reverse;
                    } else {
                        $scope.predicate = sortKey;
                        $scope.reverse = false;
                    }
                };

                //buttons function
                $scope.buttons = {
                    addproperty : function(){
                        $rootScope.$broadcast("edittable_addproperty");
                    },
                    clone : function(){
                        $rootScope.$broadcast("edittable_clone",$scope.selectItemData);
                    },
                    todelete : function(){
                        $rootScope.$broadcast("edittable_todelete",$scope.selectItemData);
                    }

                };

                //enable save button
                if(MDMCfgDialog.data.statusOfRevision === true){
                    $scope.enableActions(["save"]);
                }

            },
            link : function(scope, element, attrs) {

            }
        };
    });

// })();

/* --------------------- Source: module/tibco.ux.directive/editTableCell/js/directive.js-------------------- */
UXDirective.directive('editableCell', [ '$parse', function($parse) {
    return {
        link : function(scope, element, attrs) {
            var input = angular.element(element.children()[1]); // get the input element which used for editing

            scope.$watch(attrs.editableCell, function(newValue) { // listen inEditing value
                if (newValue === true) { // do sth if the cell was switched to edit mode
                    if (input.attr("type") === 'text' || input.attr("type") === 'password') {
                        input[0].select();
                    }
                    input[0].focus();
                }
            });
        }
    };
} ]);


/* --------------------- Source: module/tibco.ux.directive/list/js/directive.js-------------------- */
UXDirective.directive('list',function(){
    return {
        restrict : "E",
        templateUrl:"module/tibco.ux.directive/list/view/template.html",
        replace:true,
        scope:{
            tableData : "="
        },
        controller:function($scope, $element, $attrs){
            $scope.value = $attrs.value;
            $scope['delete'] = $attrs['delete'];
            
            function createData(){
                $scope.data = [];

                angular.forEach($scope.tableData,function(k,v){
                    $scope.data.push({
                        value : k
                    });
                });

                $scope.data.push({
                    value : null
                });
            }
            
            createData();

            var loadDefaultFlag = false;

            $scope.$watch("tableData", function() {
                if(loadDefaultFlag && $attrs.listName === "propertyTable") {
                    createData();
                    loadDefaultFlag = false;
                }
            }, true);

            $scope.$on("LIST_DATA_LOAD_DEFAULT", function() {
                loadDefaultFlag = true;
            });

            if($attrs.listName === "defaultValue") {
                $scope.$on("addNewProperty_setDefaultValue", function(event, message) {
                    $scope.tableData = message;
                    createData();
                });
            }

            function copyData() {
                var obj = [];
                angular.forEach($scope.data,function(v,k){
                    if(v.value && v.value !== ""){
                        obj.push(v.value);
                    }
                });
                $scope.tableData = obj;
            }

            $scope.listAddNew = function(item, $index){
                var len = $scope.data.length;
                if(item.value && $index === len -1){
                    $scope.data.push({
                        value : null
                    });
                }
                copyData();
            };

            $scope.listDel = function(i){
                if($scope.data.length === 1){
                    return;
                }
                $scope.data.splice(i,1);
                copyData();
            };
        }
    };
});


/* --------------------- Source: module/tibco.ux.directive/MDMalert/js/directive.js-------------------- */
	/*
	 * Name: alert component
	 * Author: Noah
	 * Description: display notice message
	 * How to use:
	 *    - Template:
	 *       <div class="MDMalert alert" iconstatus="" message="" iconremove="" visible="true"></div>
	 *    - Attribue Parameter:
	 *       @iconstatus(optional): defined status icon style. e.g. icon-ok-sign, icon-warning-sign.
	 *       @message(request): defined notice message content. e.g. Save successful.
	 *       @iconremove(optional): defined remove icon. Defalut is icon-remove-sign.
	 *    - Usage:
	 *       put template in proper place, fill in related attribute value. e.g.
	 *       <div class="show-panel">
	 *           <div class="MDMalert alert alert-success" iconstatus="icon-ok-sign"
	 *            message="This is just a test case. I am a success alert." iconremove="icon-remove-sign" visible="true"></div>
	 *       </div>
	 */
	UXDirective.directive('MDMalert', function factory() {
        return {
            name : 'MDMalertCtrl',
            template : '<span class="left"><i class="{{iconStatus}}"></i></span>' + '<span class="message">{{message}}</span>' + '<a class="right" href="javascript: void(0)"><i class="{{iconRemove}}"></i></a>',
            transclude : true,
            scope : {
                message : '@message',
                iconStatus : '@iconstatus',
                iconRemove : '@iconremove'
            },
            restrict : 'C',
            replace : false,
            link : function(scope, element, attrs) {
                var removeBtn = angular.element(element.children()[2]);
                if (attrs && attrs.visible === 'false') {
                    element.css({
                        'display' : 'none'
                    });
                }
                removeBtn.bind('click', function() {
                    element.fadeOut();
                });
            }
        };
    });


/* --------------------- Source: module/tibco.ux.directive/MDMpopover/js/directive.js-------------------- */
	UXDirective.directive('MDMpopover', function() {
        return {
            scope : true,
            restrict : "C",
            template : '<i class="{{p.placement}}"></i><span>{{p.message}}</span>',
            replace : false,
            link : function($scope,$element,$attr){
                $scope.$watch([$attr.left,$attr.top, $attr.bottom, $attr.right],function(){
                    $element.css({
                        "left" : $attr.left + "px",
                        "top" : $attr.top + "px",
                        "bottom" : $attr.bottom + "px",
                        "right" : $attr.right + "px"
                    });
                });
            }
        };
    });


/* --------------------- Source: module/tibco.ux.directive/ngBlur/js/directive.js-------------------- */
UXDirective.directive('ngBlur', [ '$parse', function($parse) { // add ngBlur directive
    return function(scope, element, attr) {
        var fn = $parse(attr.ngBlur);
        $(element).blur(function(event) {
            scope.$apply(function() {
                fn(scope, {
                    $event : event
                });
            });
        });
    };
} ]);


/* --------------------- Source: module/tibco.ux.directive/ngColunmResize/js/directive.js-------------------- */
UXDirective.directive('ngColunmResize',function(){
    return {
      restrict: "A",
      controller : function($scope, $element, $attrs) {

        var resizeFlag = false;
        var index = -1;
        var resizebarPosition;
        var offset;
        var prevEleCell;
        var prevEleWidth;
        var nextEleWidth;

        var freeColumnChangeFlag = false;

        var tableContainer = $($attrs.ngColunmResize);
        tableContainer.disableSelection();

        var freeColumn = $($attrs.freeColumn);
        var freeColumnWidth,freeColumnMarginLeft;

        var columnName = $attrs.columnName;
        var maxSize = $attrs.maxSize;

        $element.bind("mousedown", function(event) {
          resizeFlag = true;
          resizebarPosition = event.clientX;
          index = $($element).parent().index();
          prevEleCell = tableContainer.find(".cell.column-" + index);

          prevEleWidth = prevEleCell.width();
          nextEleWidth = prevEleCell.next().width();
          freeColumnWidth = freeColumn.width();
          freeColumnMarginLeft = parseInt($scope.style.description["margin-left"], 10);
          prevEleCell.addClass("colunm-active");
          
        });

        angular.element(document).bind("mousemove", function(event) {

          if(resizeFlag){
            var xCoordinate = event.clientX;
            offset = xCoordinate - resizebarPosition;

            if(columnName === "name" && $(".column-3").is(":hidden")){

              if(nextEleWidth - offset <= 70 || prevEleWidth + offset <= 70){
                return;
              }

              $scope.style[columnName].width = (prevEleWidth + offset) + "px";
              $scope.style.value.width = (nextEleWidth - offset) + "px";

            }else{
              if(freeColumnMarginLeft + offset >= 998){
                return;
              }
              $scope.style[columnName].width = (prevEleWidth + offset) + "px";
              $scope.style.description["margin-left"] = (freeColumnMarginLeft + offset) + "px";
            }
            

            $scope.$emit("CHANGE_TABLE_STYLE", $scope.style);
          }

        });

        angular.element(document).bind("mouseup", function(event) {
          if(!prevEleCell){
            return;
          }

          resizeFlag = false;
          prevEleCell.removeClass("colunm-active");
        });

      }
    };
});


/* --------------------- Source: module/tibco.ux.directive/ngPlaceholder/js/directive.js-------------------- */
UXDirective.directive('ngPlaceholder',function(){
    var obj = {
        restrict : "A",
        scope: false,
        transclude: false,
        compile : function(tElement, tAttrs, transclude) {
            return {
              pre : function preLink() {},
              post : function postLink($scope, $element, $attrs) {
                var waitForCompile = function() {
                    setTimeout(function() {
                        var placeholder = $($element).attr("placeholder");
                        if(!/^\{\{(\S+)\}\}$/.test(placeholder)) {
                            $($element).placeholder();
                        }else{
                            waitForCompile();
                        }
                    }, 200); 
                }
                waitForCompile();
                
                }
            }
        }
    };
    return obj;
});


/* --------------------- Source: module/tibco.ux.directive/ngScrollbar/js/directive.js-------------------- */
UXDirective.directive('ngScrollbar',function($timeout) {
    return {
        restrict : "A",
        scope: false,
        transclude: false,
        controller : function($scope, $element, $attrs) {

            var scrollbarName = $attrs.ngScrollbar;
            var scrollbarCreateFlag = {};
            scrollbarCreateFlag[scrollbarName] = false;

            //create scollbar
            $scope.$on("ngRepeatFinished_" + scrollbarName, function(event) {   

                if(scrollbarName === "configBasic" || scrollbarName === "configAdvanced"){
                    $($element).height($($attrs.scrollWrapper).height() - 150);
                }

                if(scrollbarName === "cluster") {
                    $($element).height($($attrs.scrollWrapper).height() - 50);
                }

                if(scrollbarName === "propertyTable") {
                    $($element).height($($attrs.scrollWrapper).height() - 160);
                }

                if(scrollbarName === "globalSearch") {
                    $($element).height($($attrs.scrollWrapper).height() - 50);
                }

                $($element).perfectScrollbar({
                    minScrollbarLength: 20,
                    suppressScrollX : true
                });

                scrollbarCreateFlag[scrollbarName] = true;
            });

            $scope.$watch(function() {
                return $($element).html();
            }, function() {
                if(scrollbarCreateFlag[scrollbarName]) {
                    $($element).perfectScrollbar("update");
                }
            });

            //point position for search result
            $scope.$on("SCROLLTOP_" + scrollbarName, function(event, dom) {
                if(!dom || !dom.position()){
                    $($element).scrollTop(0);
                }else{
                    
                    var topPosition = 0;
                    if(scrollbarName === "propertyTable"){
                        var index = dom.index();
                        topPosition = index * 71;
                    }else{
                        topPosition = $($element).scrollTop();
                        if(scrollbarName === "configAdvanced" || scrollbarName === "cluster"){
                            var domClass = dom.attr("class");
                            if(/level1/g.test(domClass)) {
                                var parentdom = dom.parents("li").eq(0);
                                topPosition += parentdom.position().top + 36;
                            }else if(/level2/g.test(domClass)) {
                                var parentdomL1 = dom.parents("li").eq(0);
                                var parentdomL2 = parentdomL1.parents("li").eq(0);
                                topPosition += parentdomL1.position().top;
                                topPosition += parentdomL2.position().top + 72;
                            }
                        }

                        topPosition += dom.position().top;
                    }
                    
                    $($element).scrollTop(topPosition);
                    $($element).perfectScrollbar("update");

                }
            });

            $scope.$on("SCROLLREFRESH_" + scrollbarName, function(event) {
                $($element).perfectScrollbar("update");
            });

            $scope.$on("CHANGE_SCROLL_HEIGHT_" + scrollbarName, function(event) {

                if(scrollbarName === "configBasic" || scrollbarName === "configAdvanced"){
                    $($element).height($($attrs.scrollWrapper).height() - 150);
                }

                if(scrollbarName === "cluster"){
                    $($element).height($($attrs.scrollWrapper).height() - 50);
                }

                if(scrollbarName === "propertyTable"){
                    $($element).height($($attrs.scrollWrapper).height() - 160);
                }

                if(scrollbarName === "globalSearch"){
                    $($element).height($($attrs.scrollWrapper).height() - 50);
                }
                
                $($element).perfectScrollbar("update");
                
            });
            
        }
    };
});

UXDirective.directive('ngRepeatFinished',function($timeout) {
    return {
        restrict : "A",
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished_' + attr.ngRepeatFinished);
                });
            }
        }
    };
});



/* --------------------- Source: module/tibco.ux.directive/showEdit/js/directive.js-------------------- */
UXDirective.directive('showEdit', function($compile) {
    return {
        restrict : "A",
        transclude : true,
        template : '<i class="icon-list" style="display:none;" ng-click="showDropdownFunc();" ng-mouseenter="hoverIcon($event)" ng-mouseleave="hoverIcon($event)"></i>',
        scope : {
            item : "=showEdit", // current node data
            editCallback : "=editCallback", // callback function of edit, clone and delete
            groupName : "=", // group name / cluster name
            masterEdit : "=", // whether it's the first level node or not
            itemIndex : "@"
        },
        controller : function($scope, $element) {
            $scope.showDropdown = false;
            /* Function to show edit dropdown */
            $scope.showDropdownFunc = function() {
                if ($scope.showDropdown) {
                    $scope.showDropdown = false;
                } else {
                    $scope.showDropdown = true;
                }
            };

            $scope.hoverIcon = function(event) { // change editable list icon style when mouse enter and mouse leave
                $(event.currentTarget).toggleClass('icon-white');
            };
        },
        link : function(scope, element, attrs) {

            scope.focused = false;

            scope.$watch('focused', function() { // The dropdown removed when mouse pointer leave the node
                if (!scope.focused) {
                    scope.showDropdown = false;
                }
            });
            
            element.parent().bind("mouseleave",function(){
                scope.focused = false;
            });

            // set template 
            var template = '<ul ng-mouseleave="focused = false">' + '<li><a href="javascript:void(0);" ng-click="editCallback(\'edit\', groupName, item, itemIndex);showDropdownFunc();"><i class="icon-edit"></i>Edit</a></li>' + '<li ng-hide="masterEdit"><a href="javascript:void(0);" ng-click="editCallback(\'clone\', groupName, item,itemIndex);showDropdownFunc();"><i class="icon-edit"></i>Clone</a></li>' + '<li ng-hide="masterEdit"><a href="javascript:void(0);" ng-click="editCallback(\'delete\', groupName, item,itemIndex);showDropdownFunc();"><i class="icon-edit"></i>Delete</a></li>'
                    + '</ul>';

            scope.$watch('showDropdown', function() { 
                // when showDropdown is true then add drop down, otherwise remove the drop down
                if (scope.showDropdown) {
                    element.prepend(template);
                    element.html($compile(element.html())(scope));
                    element.find("li").bind('mouseenter mouseleave', function() {
                        $(this).children("a").toggleClass('focused').children("i").toggleClass('icon-white');
                    });
                    scope.focused = true;
                } else {
                    element.children("ul").remove();
                    if (element.children("i").hasClass('icon-white')) { 
                        // change icon to the style it should be
                        element.children("i").toggleClass('icon-white');
                    }
                }
            });

        }

    };

});


/* --------------------- Source: module/tibco.ux.directive/showTooltip/js/directive.js-------------------- */
UXDirective.directive('showTooltip', function() {
    return function(scope, element, attrs) {
        scope.$watch(attrs.showTooltip, function(value) {
            if (value) {
                $(element).tooltip({
                    html : true,
                    placement : attrs.placement || "right",
                    title : value.title || value
                });
            }
        });
    };
});

UXDirective.directive('ngTooltip',function($compile) {
    return {
        restrict : "A",
        template : '<div ng-hide="flag" class="tooltip fade in {{placement}}"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        scope : {
            html : "=ngTooltip",
            placement : "@"
        },
        replace : false,
        controller : function($scope, $element, $attrs) {
            $scope.flag = true;
        },
        link : function(scope, element, attrs) {
            
            var iconDom = $(element);
            var tooltipDom = $(element).children();
            var innerDom = element.find(".tooltip-inner");

            scope.$watch(attrs.ngTooltip, function() {
                if(!scope.html || scope.html == "") {
                    tooltipDom.addClass("hide");
                }else {
                    innerDom.html(scope.html);
                    $compile(innerDom.contents())(scope);
                }
                
            });
          
            element.bind("mouseenter", function() {
                scope.$apply(function() {
                    scope.flag = false;
                });
            
                switch(scope.placement) {
                    case "right" : 
                        tooltipDom.css({
                            top : -(tooltipDom.height()/2 - iconDom.height()/2) + "px"
                        });
                        break;
                    case "bottom" :
                        tooltipDom.css({
                            left : -(tooltipDom.width() - iconDom.width()*2) + "px"
                        });
                        tooltipDom.find(".tooltip-arrow").css({
                            left : "95%"
                        });
                        break;
                }  
            });
          
            element.bind("mouseleave", function() {
                scope.$apply(function() {
                    scope.flag = true;
                });
            });
        }
    }
});




/* --------------------- Source: module/tibco.ux.directive/spliteLine/js/directive.js-------------------- */

/*
 * Name: split line
 * Author: Noah
 * Descripe: this directive is use to split two or more part
 */
UXDirective.directive('splitLine', function() {
    // Runs during compile
    return {
        restrict : 'A', 
        link : function postLink($scope, iElm, iAttrs, controller) {
            var flag = false;
			var flagAutoResize = false;
            var offset = 0;
            var parentElement = angular.element(iElm).parent();
            var prevElement = angular.element(iElm).prev();
            var nextElement = angular.element(iElm).next();
            var splitLinePosition = '';
            var prevElementPositon = '';
            var nextElementPostion = '';
            var arrangeType = iAttrs.splitLine;
            if (arrangeType !== 'vertical' && arrangeType !== 'horizontal' && arrangeType !== 'autoResizeHorizontal') {
                alert('Wrong arrange type for split line!');
            }
            var positionType = arrangeType === 'vertical' ? 'clientY' : 'clientX';
            var heightOrWidth = arrangeType === 'vertical' ? 'height' : 'width';
            $scope.prevElementPositon = '';
				
			if(arrangeType == 'vertical' || arrangeType == 'horizontal') {
				// split line mousedown fire event
				iElm.bind('mousedown', function(event) {
					flag = true;
					splitLinePosition = event[positionType];
					$scope.prevElementPositon = prevElementPositon = parseInt(prevElement.css(heightOrWidth), 10);
					nextElementPostion = parseInt(parentElement.css(heightOrWidth), 10) - prevElementPositon - 30;
				});

				// document mousemove fire event
				angular.element(document).bind('mousemove', function(event) {
					if (flag) {

						var yCoordinate = event[positionType];

						if(yCoordinate <= 250 || yCoordinate >= 600) {
							return;
						}

						offset = yCoordinate - splitLinePosition;
						if(nextElementPostion - offset > 0) {
							prevElement.css(heightOrWidth, prevElementPositon + offset);
							nextElement.css(heightOrWidth, nextElementPostion - offset);

							var offset = {
								'width': 0,
								'height': (nextElementPostion - offset) - 142
							};
							
						}
					}
				});
				
				// document mouseup fire event
				angular.element(document).bind('mouseup', function(event) {
					if($scope.prevElementPositon != parseInt(prevElement.css(heightOrWidth)), 10) {
						$scope.$emit("splitLineChanged", {
							prevHeight : parseInt(prevElement.css(heightOrWidth)),
							nextHeight : parseInt(nextElement.css(heightOrWidth))
						});
					}
					flag = false;

					$scope.$broadcast("CHANGE_SCROLL_HEIGHT_cluster");
					$scope.$broadcast("CHANGE_SCROLL_HEIGHT_configBasic");
					$scope.$broadcast("CHANGE_SCROLL_HEIGHT_configAdvanced");

				});
			} else {

				// split line mousedown fire event
				iElm.bind('mousedown', function(event) {

					flagAutoResize = true;
					splitLinePosition = event[positionType];
					$scope.prevElementPositon = prevElementPositon = parseInt(prevElement.css(heightOrWidth), 10);
					nextElementPostion = parseInt(parentElement.css(heightOrWidth), 10) - prevElementPositon - 30;
				});

				// document mousemove fire event
				angular.element(".splitHorizontal").bind('mousemove', function(event) {
					if (flagAutoResize) {
						var xCoordinate = event[positionType];

						if(xCoordinate <= 220 || xCoordinate >= 700) {
							return;
						}

						offset = xCoordinate - splitLinePosition;
						if(nextElementPostion - offset > 0) {
							prevElement.css(heightOrWidth, prevElementPositon + offset);
							nextElement.css("left", prevElementPositon + offset + 5);
							iElm.css("left", prevElementPositon + offset);
							if(iElm.attr("id") === "splitLineForHome") {
								var itemTitle = angular.element(".leftPanel .itemTitle.level0");
								var itemTitlelevel1 = angular.element(".leftPanel .itemTitle.level1");
								var itemTitlelevel2 = angular.element(".leftPanel .itemTitle.level2");
								itemTitle.css("width", xCoordinate - 90);
								itemTitlelevel1.css("width", xCoordinate - 110);
								itemTitlelevel2.css("width", xCoordinate - 130);
							}

							var offset = {
								'width_l': prevElementPositon + offset,
								'width_r' : nextElementPostion - offset - 16,
								'width_level0' : xCoordinate - 90,
								'width_level1' : xCoordinate - 110,
								'width_level2' : xCoordinate - 130,
								'height': 0
							};
							
						}
					}
				});
				
				// document mouseup fire event
				angular.element(".splitHorizontal").bind('mouseup', function(event) {
					flagAutoResize = false;
				});
			}
            
        }
    };
});


/* --------------------- Source: module/tibco.ux.directive/switchButton/js/directive.js-------------------- */
UXDirective.directive('switchButton',function(){
    return {
        restrict : "C",
        scope : {
            firstbutton : "=",
            secondbutton : "=",
            buttonsdisabled : "=",
            visibility : "="
        },
        template : '<button class="tbutt" ng-click="firstbutton.callback()">{{firstbutton.title}}</button><button class="tbutt" ng-click="secondbutton.callback()">{{secondbutton.title}}</button>',
        link : function($scope, $element, $attr) {

            var buttons = $element.find("button");
            
            if ($scope.visibility === 'first') {
                $element.find('button:firstChild').addClass('on');
            } else {
                $element.find('button:lastChild').addClass('on');
            }

            if ($scope.buttonsdisabled) {
                $element.find('button').css({'cursor': 'not-allowed'});
                $element.find('button').bind("click",function(event){
                    return;
                });
            } else {
                buttons.bind("click",function(event){
                    angular.forEach(buttons,function(button){
                        angular.element(button).removeClass("on");
                    });
                    angular.element(event.target).addClass("on");
                });
            }
        }
    };
});


/* --------------------- Source: module/tibco.ux.directive/uxDialog/js/directive.js-------------------- */
//////////////////////////////////////////////////////////////////////////////////////////
// ux-dialog directive
// //////////////////////////////////////////////////////////////////////////////////////////
UXDirective.directive('uxDialog', function() {
    var template = "";
    template += "<div class='uxDialog' ng-show='uxDialog.show'>";
    template += "<div class='uxDialogHeader'>";
    template += "<span ng-bind='uxDialog.title'></span>";
    template += "</div>";
    template += "<div class='uxDialogContent'>";
    template += "</div>";
    template += "<div class='uxDialogFooter'>";
    template += "<button type='button' ng-click='close()' class='btn btn-default' ng-bind='uxDialog.closeText'></button>";
    template += "<button type='button' ng-click='save()' class='btn btn-default' ng-bind='uxDialog.saveText'></button>";
    template += "</div>";
    template += "</div>";
    dobj = {
        template : template,
        replace : true,
        restrict : 'A',
        transclude : true,
        scope : true,
        controller : function($scope, $element, $attrs, $parse) {
            $scope.uxDialog = $scope[$attrs.uxDialog];

            // set width
            if ($scope.uxDialog.width) {
                $element.find(".uxDialogContent").width($scope.uxDialog.width + "px");
            }
            // set height
            if ($scope.uxDialog.height) {
                $element.find(".uxDialogContent").height($scope.uxDialog.height + "px");
            }

            if (!$scope.uxDialog.content) {
                $scope.uxDialog.content = $attrs.dialogContent;
            }
            if (!$scope.uxDialog.title) {
                $scope.uxDialog.title = $attrs.dialogTitle;
            }

            if (!$scope.uxDialog.closeText) {
                $scope.uxDialog.closeText = "Close";
            }
            if (!$scope.uxDialog.saveText) {
                $scope.uxDialog.saveText = "Save";
            }
            $scope.uxDialog.show = false;

            var close = function() {
                $scope.uxDialog.show = false;
            };

            var save = function() {
                $scope.uxDialog.show = false;
            };

            $scope.close = function() {
                if ($scope.uxDialog.close) {
                    $scope.uxDialog.close();
                } else {
                    close();
                }

            };

            $scope.save = function() {
                if ($scope.uxDialog.save) {
                    $scope.uxDialog.save();
                } else {
                    save();
                }
            };
            $scope.$watch("uxDialog.show", function(nv, ov) {
                if (nv) {
                    $("#dialogOverlay").show();
                } else {
                    $("#dialogOverlay").hide();
                }
            }, true);
        },
        compile : function(iElement, iAttrs) {
            iElement.find(".uxDialogContent").append("<div ng-include='uxDialog.content'></div>");
            if ($("#dialogOverlay").length == 0) {
                $("body").append("<div id='dialogOverlay'></div>");
            }
            return function postLink($scope, iElement, iAttrs) {
            };
        }
    };

    return dobj;
});


/* --------------------- Source: module/tibco.ux.directive/uxMenuBar/js/directive.js-------------------- */
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
                href : "/editLock",
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
                    topPanelItem = ["Save", "editCancel" ,"Save&Redeploy", "Tools", "Load Defaults"];
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
                
                // will get param as "editCancel" , """edit""" button clicked
                $scope.$on("cancelBtn_enableActions",function(event,param){
                    $scope.$emit("ENABLE_CANCEL_BUTTON", param);
                    angular.forEach(param, function(value, key) {
                        $scope["statusOf" + value] = true;
                        jQuery("[action-name='"+ value +"']").removeClass("disable");
                        jQuery("[action-name='"+ value +"']").removeClass("hide");
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
                                    target.parents("li.hasSubMenu").removeClass("open");
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


/* --------------------- Source: module/tibco.ux.directive/uxWizard/js/directive.js-------------------- */

////////////////////////////////////////////////////////////////////////////////////////
// ux-wizard directive
// //////////////////////////////////////////////////////////////////////////////////////////
UXDirective.directive('uxWizard', ["Constant",
    function(Constant) {

        var directiveDefinitionObject = {
            priority: 0,
            templateUrl: "module/tibco.ux.directive/uxWizard/view/template.html",
            replace: true,
            transclude: false,
            scope: {
                wizardData: '=',
                titlePanelWidth: '@'
            },
            controller: function($scope, $element, $attrs, $transclude, $timeout) {

                // uxwizard dialog drag & drop
                var dialog = $('#cfg_frame_dialog');
                var dialog_title = $element.find('.dialog_title_panel');

                var offset_left = 0;
                var offset_right = 0;

                var flag = false;
                var infobarTimeout = null;

                mouse_left = 0;
                mouse_top = 0;

                function inforbarFadeoutTimer(node, time) {
                    infobarTimeout = $timeout(function(){
                        node.fadeOut(1500);
                    }, time);
                }

                $scope.$on("UXWizard_showInfoBar",function(event,paramObj){
                    if(paramObj.type == "error"){
                        $scope.messageType = "alertMsgBar";
                        $scope.messageText = paramObj.message;
                        infobarAnimation();
                    }else if(paramObj.type == "info"){
                        $scope.messageType = "confirmMsgBar";
                        $scope.messageText = paramObj.message;
                        infobarAnimation();
                    }
                });

                $scope.$on("UXWizard_closeInfoBar",function(event,paramObj){
                    $scope.closeInfoBar();
                });

                function infobarAnimation() {
                    var infobar = dialog.find(".infobar");

                    infobar.css("width", infobar.parent().css("width"));
                    jQuery(infobar).fadeIn("fast");
                    jQuery(infobar).mouseenter(function(event) {
                        $timeout.cancel(infobarTimeout);
                        jQuery(infobar).stop(true,true).fadeIn("fast");
                    });
                    jQuery(infobar).mouseleave(function(event) {
                        inforbarFadeoutTimer(jQuery(infobar), 3000);
                    });

                    inforbarFadeoutTimer(jQuery(infobar), 3000);

                }

                $scope.closeInfoBar = function(){
                    $timeout.cancel(infobarTimeout);
                    var infobar = dialog.find(".infobar");
                    infobar.fadeOut();
                };

                angular.element(angular.element('.wizard').find('.dialog_title_panel')[0]).mousedown(function(event) {
                    flag = true;

                    mouse_left = event.clientX;
                    mouse_top = event.clientY;

                    offset_left = angular.element(angular.element('#cfg_frame_dialog')[0]).offset().left;
                    offset_right = angular.element(angular.element('#cfg_frame_dialog')[0]).offset().top;
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
            },

            compile: function compile(tElement, tAttrs, transclude) {
                return {
                    pre: function preLink(scope, iElement, iAttrs, controller) {},
                    post: function postLink($scope, iElement, iAttrs, controller) {
                        var wizardData = $scope.wizardData;
                        var formDataMap = {};
                        var titlePanelWidth = $scope.titlePanelWidth;

                        $scope.currentFormIndex = 0;

                        // switch to next form
                        var switchToNextForm = function() {
                            if ($scope.currentFormIndex < wizardData.forms.length - 1) {
                                $scope.currentFormIndex++;
                                $scope.templateUrl = wizardData.forms[$scope.currentFormIndex].templateUrl;
                            }
                        };

                        // switch to previous form
                        var switchToPreviousForm = function() {
                            if ($scope.currentFormIndex > 0) {
                                $scope.currentFormIndex--;
                                $scope.templateUrl = wizardData.forms[$scope.currentFormIndex].templateUrl;
                            }
                        };

                        // switch to form by form name
                        var switchToForm = function(formName) {
                            if (formDataMap[formName] == null) {
                                throw new Error("can not found form data for this form name");
                            }
                            $scope.templateUrl = formDataMap[formName].templateUrl;
                            $scope.currentFormIndex = formDataMap[formName].index;
                        };

                        // save form data to formDataMap
                        var createformDataMap = function(){
                            jQuery.each(wizardData.forms, function(index, data) {
                                if (formDataMap[data.name] != null) {
                                    throw new Error("wizard form data: form name duplicate!");   
                                }
                                formDataMap[data.name] = data;
                                formDataMap[data.name].index = index;
                            });
                        };
                        
                        createformDataMap();

                        // show first form template
                        $scope.templateUrl = wizardData.forms[0].templateUrl;
                        $scope.wizardData = wizardData;

                        // set title panel width
                        if (titlePanelWidth != null && jQuery.trim(titlePanelWidth) != "") {
                            // check title-panel-width attribute value, must be number
                            if (isNaN(parseInt(titlePanelWidth), 10)) {
                                throw new Error("ux-wizard directive attribute title-panel-width value must be number");
                            }
                            iElement.find(".wizard_content_panel>.title_list:first").css("width", titlePanelWidth + "px");
                            iElement.find(".wizard_content_panel>.form_content:first").css("left", titlePanelWidth + "px");
                        }

                        // bind event
                        $scope.$on("CHANGE_WIZARD_DATA", function(event, paramObj) {
                            var positions;
                            var removeNum = 0;
                            if(paramObj.removeItem){
                                
                                if(!formDataMap[paramObj.removeItem]){
                                    throw new Error("wizard form data: the remove form dosn't exist!");
                                }else{
                                    position = formDataMap[paramObj.removeItem].index;
                                    removeNum = 1;
                                }
                            }

                            if(paramObj.newItem){
                                wizardData.forms.splice(paramObj.position, removeNum, paramObj.newItem);
                            }else{
                                wizardData.forms.splice(position, removeNum);
                            }
                            formDataMap = {};
                            createformDataMap();
                        });

                        $scope.$on(Constant.eventName.WIZARD_FORM_SWITCH, function(event, formName) {
                            if (formName === Constant.formSwitch.NEXT_FORM) {
                                switchToNextForm();

                            } else if (formName === Constant.formSwitch.PREVIOUS_FORM) {
                                switchToPreviousForm();
                            } else {
                                switchToForm(formName);
                            }
                        });

                        $scope.$on(Constant.eventName.FRAME_DIALOG_CLOSE, function() {
                            
                        });

                    }
                };
            }
        };
        return directiveDefinitionObject;

    }
]);
