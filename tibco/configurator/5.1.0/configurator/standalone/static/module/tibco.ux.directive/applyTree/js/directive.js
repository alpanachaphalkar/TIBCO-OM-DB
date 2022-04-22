var treeScrollBars = [];

	UXDirective.directive('applyTree', [ "$log", '$timeout', function($log, $timeout) {
        return {
            restrict : "A",
            templateUrl : "module/tibco.ux.directive/applyTree/view/accordionTree.html",
            replace : false,
            scope : {
                treeTitle : "@treeTitle",
                treeData : "=applyTree", // data of the tree
                treeCallback : "=nodeAction", // the callback function when click on the tree node
                editAction : "=editAction", // callback function of edit, clone and delete
                visibility : "=visibility",
                serverName : "=serverName"
            },
            controller : function($scope, $element) {
                $timeout(function() {
                    var contentElm = $element.find(".treeContainer");
                    treeScrollBars[$scope.treeTitle] = kl.ScrollBars.makeScrollable(contentElm, {
                      bFlipXY: false,
                      bHorizontal: true,
                      bScrollableByArrowKeys: false,
                      bVertical: true,
                      bVerticalBarVisible: true,
                      bVerticalScrollable: true,
                      numWrapperHeight: ($scope.treeTitle === "Configuration")? 150 : 70,
                      numWrapperWidth: contentElm.width() + 10,
                      bAutoHide : false,
                      numHowToMove: kl.ScrollBars.MOVE_BY_POSITION
                    });
                }, 200);

                $scope.$watch("treeData", function(n, o){
                    if(n.length > 0){
                        $timeout(function() {
                            var height = $scope.treeTitle == "Cluster" ? parseInt($element.css("height"), 10) - 80 : parseInt($element.parent().css("height"), 10) - 142 - parseInt(angular.element("#clusterpanel").css("height"), 10) - 35;                           
                            treeScrollBars[$scope.treeTitle].setWrapperHeight(height);
                        }, 200);
                    };
                },true);
                

                /* collapse sub items and expend sub items */
                $scope.toggleSub = function($event) {
                    var ele = $event.target, // get the toggled arrow
                    sub = $(ele).parent().siblings(".sub-items"); // get toggled subitem
                    if ($(ele).hasClass("collapsed")) { // expend
                        $(sub).show();
                        $(ele).removeClass("collapsed").addClass("expended");
                    } else if ($(ele).hasClass("expended")) { // collapse
                        $(sub).hide();
                        $(ele).removeClass("expended").addClass("collapsed");
                    }
                    treeScrollBars[$scope.treeTitle].refresh();
                };
                $scope.selectedDOM = null;
                
                /* called when select one item */
                $scope.selectItem = function(e, index, item) {
                    if($scope.focused){
                        return;
                    }else{
                        if ($scope.treeCallback) {
                            $scope.treeCallback(item);
                        }
                        if($scope.selectedDOM){
                            $($scope.selectedDOM).removeClass("highlight");
                        }else{
                            $element.find(".highlight").removeClass('highlight');
                        }
                        $(e.currentTarget).addClass("highlight");
                        $scope.selectedDOM = e.currentTarget;
                    }
                    
                };

                $scope.showIcon = function(e){
                    $(e.currentTarget).find("i.icon-list").show();
                };

                $scope.hideIcon = function(e){
                    $(e.currentTarget).find("i.icon-list").hide();
                    $scope.focused = false;
                };

                $scope.visiableFlt = function(e){
                    if(e.visibility){
                        return e.visibility == $scope.visibility['default'];
                    }else{
                        return true;
                    }
                };

                $scope.vfltBasic = function(e){
                    if(e.visibility){
                        return e.visibility == "Basic" ||e.visibility == "All";
                    }else{
                        return true;
                    }
                };

                $scope.vfltAdvanced = function(e){
                    if(e.visibility){
                        return e.visibility == "Advanced" || e.visibility == "All";
                    }else{
                        return true;
                    }
                };
                

                $scope.showDropdown = false;
                $scope.currentDom = null;
                $scope.focused = false;
                /* Function to show edit dropdown */
                $scope.showDropdownFunc = function(event) {
                    if(event){
                        $scope.currentDom = $(event.currentTarget);
                    }
                    if ($scope.showDropdown) {
                        $scope.showDropdown = false;
                    } else {
                        $scope.showDropdown = true;
                    }
                };

                $scope.hoverIcon = function(event) { // change editable list icon style when mouse enter and mouse leave
                    $(event.currentTarget).toggleClass('icon-white');
                };

                $scope.hoverLi = function(event){
                    $(event.currentTarget).parent().children().not($(event.currentTarget)).children("a").removeClass('focused').children("i").removeClass('icon-white');
                    $(event.currentTarget).children("a").addClass('focused').children("i").addClass('icon-white');

                    $(event.currentTarget).parent().children().not($(event.currentTarget)).removeClass('focused');
                    $(event.currentTarget).addClass('focused');
                };


                $scope.$watch('focused', function() { // The dropdown removed when mouse pointer leave the node
                    if (!$scope.focused) {
                        $scope.showDropdown = false;
                    }
                });


                $scope.$watch('showDropdown', function() { // when showDropdown is true then add drop down, otherwise remove the drop down
                    if($scope.currentDom){
                        var ielement = $scope.currentDom.parent();
                        if ($scope.showDropdown) {
                            ielement.find("ul").removeClass("hide").bind("mouseleave",function(){
                                $scope.focused = false;
                            });
                            $scope.focused = true;
                        } else {
                            ielement.find("ul").addClass("hide");
                            ielement.find("ul > li").removeClass('focused').children("a").removeClass('focused').children("i").removeClass('icon-white');
                        }
                    }
                    
                });


                

                
            }
        };
    } ]);

// })();