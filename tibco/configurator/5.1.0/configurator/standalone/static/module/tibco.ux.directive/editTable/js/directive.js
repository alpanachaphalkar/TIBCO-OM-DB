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