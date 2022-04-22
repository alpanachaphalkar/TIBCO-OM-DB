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
