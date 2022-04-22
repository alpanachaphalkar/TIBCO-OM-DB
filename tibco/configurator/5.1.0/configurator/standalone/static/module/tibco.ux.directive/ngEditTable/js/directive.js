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