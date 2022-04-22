UXDirective.directive('ngPlaceholder',function(){
    var obj = {
        restrict : "A",
        scope: false,
        transclude: false,
        compile : function(tElement, tAttrs, transclude) {
            return {
              pre : function preLink() {},
              post : function postLink($scope, $element, $attrs) {
                var waitForCompile = function() {
                    setTimeout(function() {
                        var placeholder = $($element).attr("placeholder");
                        if(!/^\{\{(\S+)\}\}$/.test(placeholder)) {
                            $($element).placeholder();
                        }else{
                            waitForCompile();
                        }
                    }, 200); 
                }
                waitForCompile();
                
                }
            }
        }
    };
    return obj;
});
