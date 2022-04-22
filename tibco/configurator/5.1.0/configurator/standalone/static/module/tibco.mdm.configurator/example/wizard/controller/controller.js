(function() {
    var util = configurator.util;

    util.createController("configurator.controller.example.wizard", [ "$scope", "$rootScope", "FrameDialog" ], function($scope, $rootScope, FrameDialog) {
        $scope.wizardData = {
            title : "Example Wizard",
            forms : [ {
                name : "form1",
                title : "form 1 title",
                templateUrl : "module/tibco.mdm.configurator/example/wizard/view/form_1.html"
            }, {
                name : "form2",
                title : "form 2 title",
                templateUrl : "module/tibco.mdm.configurator/example/wizard/view/form_2.html"
            }, {
                name : "form3",
                title : "form 3 title",
                templateUrl : "module/tibco.mdm.configurator/example/wizard/view/form_3.html"
            } ]
        };
    });

    util.createController("configurator.controller.example.wizard.form_1", [ "$scope", "UXWizard", "Constant", "UXI18N" ], function($scope, UXWizard, Constant, UXI18N) {
        var localNS = "tools.migration";

        $scope.nextButtonClick = function() {
            UXWizard.switchForm(Constant.formSwitch.NEXT_FORM);
        };
    });

    util.createController("configurator.controller.example.wizard.form_2", [ "$scope", "UXWizard", "Constant", "UXI18N" ], function($scope, UXWizard, Constant, UXI18N) {

        $scope.nextButtonClick = function() {
            UXWizard.switchForm(Constant.formSwitch.NEXT_FORM);
        };

        $scope.previousButtonClick = function() {
            UXWizard.switchForm(Constant.formSwitch.PREVIOUS_FORM);
        };

        var data = UXWizard.getData("form1"); //{name: "Mark"}
    });

    util.createController("configurator.controller.example.wizard.form_3", [ "$scope", "UXWizard", "Constant", "UXI18N" ], function($scope, UXWizard, Constant, UXI18N) {

        $scope.closeButtonClick = function() {
            UXWizard.close();
        };

        $scope.previousButtonClick = function() {
            UXWizard.switchForm(Constant.formSwitch.PREVIOUS_FORM);
        };
    });

}());