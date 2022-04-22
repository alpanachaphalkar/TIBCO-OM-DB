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
