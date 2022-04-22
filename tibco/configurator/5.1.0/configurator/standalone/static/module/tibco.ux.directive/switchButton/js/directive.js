UXDirective.directive('switchButton',function(){
    return {
        restrict : "C",
        scope : {
            firstbutton : "=",
            secondbutton : "=",
            buttonsdisabled : "=",
            visibility : "="
        },
        template : '<button class="tbutt" ng-click="firstbutton.callback()">{{firstbutton.title}}</button><button class="tbutt" ng-click="secondbutton.callback()">{{secondbutton.title}}</button>',
        link : function($scope, $element, $attr) {

            var buttons = $element.find("button");
            
            if ($scope.visibility === 'first') {
                $element.find('button:firstChild').addClass('on');
            } else {
                $element.find('button:lastChild').addClass('on');
            }

            if ($scope.buttonsdisabled) {
                $element.find('button').css({'cursor': 'not-allowed'});
                $element.find('button').bind("click",function(event){
                    return;
                });
            } else {
                buttons.bind("click",function(event){
                    angular.forEach(buttons,function(button){
                        angular.element(button).removeClass("on");
                    });
                    angular.element(event.target).addClass("on");
                });
            }
        }
    };
});
