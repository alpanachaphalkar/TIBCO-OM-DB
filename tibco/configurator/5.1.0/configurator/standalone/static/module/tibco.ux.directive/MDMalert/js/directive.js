	/*
	 * Name: alert component
	 * Author: Noah
	 * Description: display notice message
	 * How to use:
	 *    - Template:
	 *       <div class="MDMalert alert" iconstatus="" message="" iconremove="" visible="true"></div>
	 *    - Attribue Parameter:
	 *       @iconstatus(optional): defined status icon style. e.g. icon-ok-sign, icon-warning-sign.
	 *       @message(request): defined notice message content. e.g. Save successful.
	 *       @iconremove(optional): defined remove icon. Defalut is icon-remove-sign.
	 *    - Usage:
	 *       put template in proper place, fill in related attribute value. e.g.
	 *       <div class="show-panel">
	 *           <div class="MDMalert alert alert-success" iconstatus="icon-ok-sign"
	 *            message="This is just a test case. I am a success alert." iconremove="icon-remove-sign" visible="true"></div>
	 *       </div>
	 */
	UXDirective.directive('MDMalert', function factory() {
        return {
            name : 'MDMalertCtrl',
            template : '<span class="left"><i class="{{iconStatus}}"></i></span>' + '<span class="message">{{message}}</span>' + '<a class="right" href="javascript: void(0)"><i class="{{iconRemove}}"></i></a>',
            transclude : true,
            scope : {
                message : '@message',
                iconStatus : '@iconstatus',
                iconRemove : '@iconremove'
            },
            restrict : 'C',
            replace : false,
            link : function(scope, element, attrs) {
                var removeBtn = angular.element(element.children()[2]);
                if (attrs && attrs.visible === 'false') {
                    element.css({
                        'display' : 'none'
                    });
                }
                removeBtn.bind('click', function() {
                    element.fadeOut();
                });
            }
        };
    });
