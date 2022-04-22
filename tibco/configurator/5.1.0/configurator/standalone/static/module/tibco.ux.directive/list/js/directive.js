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
