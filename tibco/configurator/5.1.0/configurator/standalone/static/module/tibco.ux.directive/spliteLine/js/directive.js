
/*
 * Name: split line
 * Author: Noah
 * Descripe: this directive is use to split two or more part
 */
UXDirective.directive('splitLine', function() {
    // Runs during compile
    return {
        restrict : 'A', 
        link : function postLink($scope, iElm, iAttrs, controller) {
            var flag = false;
			var flagAutoResize = false;
            var offset = 0;
            var parentElement = angular.element(iElm).parent();
            var prevElement = angular.element(iElm).prev();
            var nextElement = angular.element(iElm).next();
            var splitLinePosition = '';
            var prevElementPositon = '';
            var nextElementPostion = '';
            var arrangeType = iAttrs.splitLine;
            if (arrangeType !== 'vertical' && arrangeType !== 'horizontal' && arrangeType !== 'autoResizeHorizontal') {
                alert('Wrong arrange type for split line!');
            }
            var positionType = arrangeType === 'vertical' ? 'clientY' : 'clientX';
            var heightOrWidth = arrangeType === 'vertical' ? 'height' : 'width';
            $scope.prevElementPositon = '';
				
			if(arrangeType == 'vertical' || arrangeType == 'horizontal') {
				// split line mousedown fire event
				iElm.bind('mousedown', function(event) {
					flag = true;
					splitLinePosition = event[positionType];
					$scope.prevElementPositon = prevElementPositon = parseInt(prevElement.css(heightOrWidth), 10);
					nextElementPostion = parseInt(parentElement.css(heightOrWidth), 10) - prevElementPositon - 30;
				});

				// document mousemove fire event
				angular.element(document).bind('mousemove', function(event) {
					if (flag) {

						var yCoordinate = event[positionType];

						if(yCoordinate <= 250 || yCoordinate >= 600) {
							return;
						}

						offset = yCoordinate - splitLinePosition;
						if(nextElementPostion - offset > 0) {
							prevElement.css(heightOrWidth, prevElementPositon + offset);
							nextElement.css(heightOrWidth, nextElementPostion - offset);

							var offset = {
								'width': 0,
								'height': (nextElementPostion - offset) - 142
							};
							
						}
					}
				});
				
				// document mouseup fire event
				angular.element(document).bind('mouseup', function(event) {
					if($scope.prevElementPositon != parseInt(prevElement.css(heightOrWidth)), 10) {
						$scope.$emit("splitLineChanged", {
							prevHeight : parseInt(prevElement.css(heightOrWidth)),
							nextHeight : parseInt(nextElement.css(heightOrWidth))
						});
					}
					flag = false;

					$scope.$broadcast("CHANGE_SCROLL_HEIGHT_cluster");
					$scope.$broadcast("CHANGE_SCROLL_HEIGHT_configBasic");
					$scope.$broadcast("CHANGE_SCROLL_HEIGHT_configAdvanced");

				});
			} else {

				// split line mousedown fire event
				iElm.bind('mousedown', function(event) {

					flagAutoResize = true;
					splitLinePosition = event[positionType];
					$scope.prevElementPositon = prevElementPositon = parseInt(prevElement.css(heightOrWidth), 10);
					nextElementPostion = parseInt(parentElement.css(heightOrWidth), 10) - prevElementPositon - 30;
				});

				// document mousemove fire event
				angular.element(".splitHorizontal").bind('mousemove', function(event) {
					if (flagAutoResize) {
						var xCoordinate = event[positionType];

						if(xCoordinate <= 220 || xCoordinate >= 700) {
							return;
						}

						offset = xCoordinate - splitLinePosition;
						if(nextElementPostion - offset > 0) {
							prevElement.css(heightOrWidth, prevElementPositon + offset);
							nextElement.css("left", prevElementPositon + offset + 5);
							iElm.css("left", prevElementPositon + offset);
							if(iElm.attr("id") === "splitLineForHome") {
								var itemTitle = angular.element(".leftPanel .itemTitle.level0");
								var itemTitlelevel1 = angular.element(".leftPanel .itemTitle.level1");
								var itemTitlelevel2 = angular.element(".leftPanel .itemTitle.level2");
								itemTitle.css("width", xCoordinate - 90);
								itemTitlelevel1.css("width", xCoordinate - 110);
								itemTitlelevel2.css("width", xCoordinate - 130);
							}

							var offset = {
								'width_l': prevElementPositon + offset,
								'width_r' : nextElementPostion - offset - 16,
								'width_level0' : xCoordinate - 90,
								'width_level1' : xCoordinate - 110,
								'width_level2' : xCoordinate - 130,
								'height': 0
							};
							
						}
					}
				});
				
				// document mouseup fire event
				angular.element(".splitHorizontal").bind('mouseup', function(event) {
					flagAutoResize = false;
				});
			}
            
        }
    };
});
