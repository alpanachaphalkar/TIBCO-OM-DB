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
