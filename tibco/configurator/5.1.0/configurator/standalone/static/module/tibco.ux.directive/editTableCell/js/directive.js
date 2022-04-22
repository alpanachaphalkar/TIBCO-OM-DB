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
