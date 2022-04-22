(function() {
    var util = configurator.util;

    util.createController("configurator.controller.columnPickerCtrl",["$scope", "$rootScope", "MDMCfgDialog", "UXI18N"],function mainController($scope, $rootScope, MDMCfgDialog, UXI18N) {
        var localNS = "columnPicker";
        $scope.local ={
            showInformation : UXI18N.getString(localNS, "showInformation"),
            selectedInfor : UXI18N.getString(localNS, "selected"),
            columnPicHotDeploy : UXI18N.getString(localNS, "hotDeploy"),
            columnPicProperty : UXI18N.getString(localNS, "property"),
            columnPicValue : UXI18N.getString(localNS, "value"),
            columnPicDescription : UXI18N.getString(localNS, "description"),
            columnPicVersion : UXI18N.getString(localNS, "version")
        };

        $scope.selected = [{
            name : $scope.local.columnPicHotDeploy,
            type: "isHotDeployable",
            value : MDMCfgDialog.data.columnPicker.isHotDeployable
        },{
            name : $scope.local.columnPicProperty,
            type: "name",
            value : MDMCfgDialog.data.columnPicker.name
        },{
            name : $scope.local.columnPicValue,
            type: "value",
            value : MDMCfgDialog.data.columnPicker.value
        },{
            name : $scope.local.columnPicDescription,
            type: "description",
            value : MDMCfgDialog.data.columnPicker.description
        },{
            name : $scope.local.columnPicVersion,
            type: "sinceVersion",
            value : MDMCfgDialog.data.columnPicker.sinceVersion
        }];

        $scope.changeValue = function(option){
            MDMCfgDialog.data.columnPicker[option.type] = option.value;
        };

    });

}());