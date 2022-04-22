UXDirective.directive('ngScrollbar',function($timeout) {
    return {
        restrict : "A",
        scope: false,
        transclude: false,
        controller : function($scope, $element, $attrs) {

            var scrollbarName = $attrs.ngScrollbar;
            var scrollbarCreateFlag = {};
            scrollbarCreateFlag[scrollbarName] = false;

            //create scollbar
            $scope.$on("ngRepeatFinished_" + scrollbarName, function(event) {   

                if(scrollbarName === "configBasic" || scrollbarName === "configAdvanced"){
                    $($element).height($($attrs.scrollWrapper).height() - 150);
                }

                if(scrollbarName === "cluster") {
                    $($element).height($($attrs.scrollWrapper).height() - 50);
                }

                if(scrollbarName === "propertyTable") {
                    $($element).height($($attrs.scrollWrapper).height() - 160);
                }

                if(scrollbarName === "globalSearch") {
                    $($element).height($($attrs.scrollWrapper).height() - 50);
                }

                $($element).perfectScrollbar({
                    minScrollbarLength: 20,
                    suppressScrollX : true
                });

                scrollbarCreateFlag[scrollbarName] = true;
            });

            $scope.$watch(function() {
                return $($element).html();
            }, function() {
                if(scrollbarCreateFlag[scrollbarName]) {
                    $($element).perfectScrollbar("update");
                }
            });

            //point position for search result
            $scope.$on("SCROLLTOP_" + scrollbarName, function(event, dom) {
                if(!dom || !dom.position()){
                    $($element).scrollTop(0);
                }else{
                    
                    var topPosition = 0;
                    if(scrollbarName === "propertyTable"){
                        var index = dom.index();
                        topPosition = index * 71;
                    }else{
                        topPosition = $($element).scrollTop();
                        if(scrollbarName === "configAdvanced" || scrollbarName === "cluster"){
                            var domClass = dom.attr("class");
                            if(/level1/g.test(domClass)) {
                                var parentdom = dom.parents("li").eq(0);
                                topPosition += parentdom.position().top + 36;
                            }else if(/level2/g.test(domClass)) {
                                var parentdomL1 = dom.parents("li").eq(0);
                                var parentdomL2 = parentdomL1.parents("li").eq(0);
                                topPosition += parentdomL1.position().top;
                                topPosition += parentdomL2.position().top + 72;
                            }
                        }

                        topPosition += dom.position().top;
                    }
                    
                    $($element).scrollTop(topPosition);
                    $($element).perfectScrollbar("update");

                }
            });

            $scope.$on("SCROLLREFRESH_" + scrollbarName, function(event) {
                $($element).perfectScrollbar("update");
            });

            $scope.$on("CHANGE_SCROLL_HEIGHT_" + scrollbarName, function(event) {

                if(scrollbarName === "configBasic" || scrollbarName === "configAdvanced"){
                    $($element).height($($attrs.scrollWrapper).height() - 150);
                }

                if(scrollbarName === "cluster"){
                    $($element).height($($attrs.scrollWrapper).height() - 50);
                }

                if(scrollbarName === "propertyTable"){
                    $($element).height($($attrs.scrollWrapper).height() - 160);
                }

                if(scrollbarName === "globalSearch"){
                    $($element).height($($attrs.scrollWrapper).height() - 50);
                }
                
                $($element).perfectScrollbar("update");
                
            });
            
        }
    };
});

UXDirective.directive('ngRepeatFinished',function($timeout) {
    return {
        restrict : "A",
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished_' + attr.ngRepeatFinished);
                });
            }
        }
    };
});

