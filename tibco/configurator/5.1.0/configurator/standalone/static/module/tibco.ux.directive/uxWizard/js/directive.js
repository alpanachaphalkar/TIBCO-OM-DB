
////////////////////////////////////////////////////////////////////////////////////////
// ux-wizard directive
// //////////////////////////////////////////////////////////////////////////////////////////
UXDirective.directive('uxWizard', ["Constant",
    function(Constant) {

        var directiveDefinitionObject = {
            priority: 0,
            templateUrl: "module/tibco.ux.directive/uxWizard/view/template.html",
            replace: true,
            transclude: false,
            scope: {
                wizardData: '=',
                titlePanelWidth: '@'
            },
            controller: function($scope, $element, $attrs, $transclude, $timeout) {

                // uxwizard dialog drag & drop
                var dialog = $('#cfg_frame_dialog');
                var dialog_title = $element.find('.dialog_title_panel');

                var offset_left = 0;
                var offset_right = 0;

                var flag = false;
                var infobarTimeout = null;

                mouse_left = 0;
                mouse_top = 0;

                function inforbarFadeoutTimer(node, time) {
                    infobarTimeout = $timeout(function(){
                        node.fadeOut(1500);
                    }, time);
                }

                $scope.$on("UXWizard_showInfoBar",function(event,paramObj){
                    if(paramObj.type == "error"){
                        $scope.messageType = "alertMsgBar";
                        $scope.messageText = paramObj.message;
                        infobarAnimation();
                    }else if(paramObj.type == "info"){
                        $scope.messageType = "confirmMsgBar";
                        $scope.messageText = paramObj.message;
                        infobarAnimation();
                    }
                });

                $scope.$on("UXWizard_closeInfoBar",function(event,paramObj){
                    $scope.closeInfoBar();
                });

                function infobarAnimation() {
                    var infobar = dialog.find(".infobar");

                    infobar.css("width", infobar.parent().css("width"));
                    jQuery(infobar).fadeIn("fast");
                    jQuery(infobar).mouseenter(function(event) {
                        $timeout.cancel(infobarTimeout);
                        jQuery(infobar).stop(true,true).fadeIn("fast");
                    });
                    jQuery(infobar).mouseleave(function(event) {
                        inforbarFadeoutTimer(jQuery(infobar), 3000);
                    });

                    inforbarFadeoutTimer(jQuery(infobar), 3000);

                }

                $scope.closeInfoBar = function(){
                    $timeout.cancel(infobarTimeout);
                    var infobar = dialog.find(".infobar");
                    infobar.fadeOut();
                };

                angular.element(angular.element('.wizard').find('.dialog_title_panel')[0]).mousedown(function(event) {
                    flag = true;

                    mouse_left = event.clientX;
                    mouse_top = event.clientY;

                    offset_left = angular.element(angular.element('#cfg_frame_dialog')[0]).offset().left;
                    offset_right = angular.element(angular.element('#cfg_frame_dialog')[0]).offset().top;
                });

                angular.element(document).bind('mousemove', function(event) {
                    if (flag) {
                        dialog.css('margin', 'initial');
                        dialog.css('left', offset_left - (mouse_left - event.clientX ));
                        dialog.css('top', offset_right - (mouse_top - event.clientY));
                    }
                    
                });

                angular.element(document).bind('mouseup', function(event) {
                    flag = false;
                });
            },

            compile: function compile(tElement, tAttrs, transclude) {
                return {
                    pre: function preLink(scope, iElement, iAttrs, controller) {},
                    post: function postLink($scope, iElement, iAttrs, controller) {
                        var wizardData = $scope.wizardData;
                        var formDataMap = {};
                        var titlePanelWidth = $scope.titlePanelWidth;

                        $scope.currentFormIndex = 0;

                        // switch to next form
                        var switchToNextForm = function() {
                            if ($scope.currentFormIndex < wizardData.forms.length - 1) {
                                $scope.currentFormIndex++;
                                $scope.templateUrl = wizardData.forms[$scope.currentFormIndex].templateUrl;
                            }
                        };

                        // switch to previous form
                        var switchToPreviousForm = function() {
                            if ($scope.currentFormIndex > 0) {
                                $scope.currentFormIndex--;
                                $scope.templateUrl = wizardData.forms[$scope.currentFormIndex].templateUrl;
                            }
                        };

                        // switch to form by form name
                        var switchToForm = function(formName) {
                            if (formDataMap[formName] == null) {
                                throw new Error("can not found form data for this form name");
                            }
                            $scope.templateUrl = formDataMap[formName].templateUrl;
                            $scope.currentFormIndex = formDataMap[formName].index;
                        };

                        // save form data to formDataMap
                        var createformDataMap = function(){
                            jQuery.each(wizardData.forms, function(index, data) {
                                if (formDataMap[data.name] != null) {
                                    throw new Error("wizard form data: form name duplicate!");   
                                }
                                formDataMap[data.name] = data;
                                formDataMap[data.name].index = index;
                            });
                        };
                        
                        createformDataMap();

                        // show first form template
                        $scope.templateUrl = wizardData.forms[0].templateUrl;
                        $scope.wizardData = wizardData;

                        // set title panel width
                        if (titlePanelWidth != null && jQuery.trim(titlePanelWidth) != "") {
                            // check title-panel-width attribute value, must be number
                            if (isNaN(parseInt(titlePanelWidth), 10)) {
                                throw new Error("ux-wizard directive attribute title-panel-width value must be number");
                            }
                            iElement.find(".wizard_content_panel>.title_list:first").css("width", titlePanelWidth + "px");
                            iElement.find(".wizard_content_panel>.form_content:first").css("left", titlePanelWidth + "px");
                        }

                        // bind event
                        $scope.$on("CHANGE_WIZARD_DATA", function(event, paramObj) {
                            var positions;
                            var removeNum = 0;
                            if(paramObj.removeItem){
                                
                                if(!formDataMap[paramObj.removeItem]){
                                    throw new Error("wizard form data: the remove form dosn't exist!");
                                }else{
                                    position = formDataMap[paramObj.removeItem].index;
                                    removeNum = 1;
                                }
                            }

                            if(paramObj.newItem){
                                wizardData.forms.splice(paramObj.position, removeNum, paramObj.newItem);
                            }else{
                                wizardData.forms.splice(position, removeNum);
                            }
                            formDataMap = {};
                            createformDataMap();
                        });

                        $scope.$on(Constant.eventName.WIZARD_FORM_SWITCH, function(event, formName) {
                            if (formName === Constant.formSwitch.NEXT_FORM) {
                                switchToNextForm();

                            } else if (formName === Constant.formSwitch.PREVIOUS_FORM) {
                                switchToPreviousForm();
                            } else {
                                switchToForm(formName);
                            }
                        });

                        $scope.$on(Constant.eventName.FRAME_DIALOG_CLOSE, function() {
                            
                        });

                    }
                };
            }
        };
        return directiveDefinitionObject;

    }
]);
