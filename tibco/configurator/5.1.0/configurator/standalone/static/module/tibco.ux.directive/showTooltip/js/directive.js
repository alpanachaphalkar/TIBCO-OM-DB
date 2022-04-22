UXDirective.directive('showTooltip', function() {
    return function(scope, element, attrs) {
        scope.$watch(attrs.showTooltip, function(value) {
            if (value) {
                $(element).tooltip({
                    html : true,
                    placement : attrs.placement || "right",
                    title : value.title || value
                });
            }
        });
    };
});

UXDirective.directive('ngTooltip',function($compile) {
    return {
        restrict : "A",
        template : '<div ng-hide="flag" class="tooltip fade in {{placement}}"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        scope : {
            html : "=ngTooltip",
            placement : "@"
        },
        replace : false,
        controller : function($scope, $element, $attrs) {
            $scope.flag = true;
        },
        link : function(scope, element, attrs) {
            
            var iconDom = $(element);
            var tooltipDom = $(element).children();
            var innerDom = element.find(".tooltip-inner");

            scope.$watch(attrs.ngTooltip, function() {
                if(!scope.html || scope.html == "") {
                    tooltipDom.addClass("hide");
                }else {
                    innerDom.html(scope.html);
                    $compile(innerDom.contents())(scope);
                }
                
            });
          
            element.bind("mouseenter", function() {
                scope.$apply(function() {
                    scope.flag = false;
                });
            
                switch(scope.placement) {
                    case "right" : 
                        tooltipDom.css({
                            top : -(tooltipDom.height()/2 - iconDom.height()/2) + "px"
                        });
                        break;
                    case "bottom" :
                        tooltipDom.css({
                            left : -(tooltipDom.width() - iconDom.width()*2) + "px"
                        });
                        tooltipDom.find(".tooltip-arrow").css({
                            left : "95%"
                        });
                        break;
                }  
            });
          
            element.bind("mouseleave", function() {
                scope.$apply(function() {
                    scope.flag = true;
                });
            });
        }
    }
});


