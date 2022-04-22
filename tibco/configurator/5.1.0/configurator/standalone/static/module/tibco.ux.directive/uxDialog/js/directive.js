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
