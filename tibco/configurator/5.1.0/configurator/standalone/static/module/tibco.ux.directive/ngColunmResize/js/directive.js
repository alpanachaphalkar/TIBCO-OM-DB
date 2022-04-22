UXDirective.directive('ngColunmResize',function(){
    return {
      restrict: "A",
      controller : function($scope, $element, $attrs) {

        var resizeFlag = false;
        var index = -1;
        var resizebarPosition;
        var offset;
        var prevEleCell;
        var prevEleWidth;
        var nextEleWidth;

        var freeColumnChangeFlag = false;

        var tableContainer = $($attrs.ngColunmResize);
        tableContainer.disableSelection();

        var freeColumn = $($attrs.freeColumn);
        var freeColumnWidth,freeColumnMarginLeft;

        var columnName = $attrs.columnName;
        var maxSize = $attrs.maxSize;

        $element.bind("mousedown", function(event) {
          resizeFlag = true;
          resizebarPosition = event.clientX;
          index = $($element).parent().index();
          prevEleCell = tableContainer.find(".cell.column-" + index);

          prevEleWidth = prevEleCell.width();
          nextEleWidth = prevEleCell.next().width();
          freeColumnWidth = freeColumn.width();
          freeColumnMarginLeft = parseInt($scope.style.description["margin-left"], 10);
          prevEleCell.addClass("colunm-active");
          
        });

        angular.element(document).bind("mousemove", function(event) {

          if(resizeFlag){
            var xCoordinate = event.clientX;
            offset = xCoordinate - resizebarPosition;

            if(columnName === "name" && $(".column-3").is(":hidden")){

              if(nextEleWidth - offset <= 70 || prevEleWidth + offset <= 70){
                return;
              }

              $scope.style[columnName].width = (prevEleWidth + offset) + "px";
              $scope.style.value.width = (nextEleWidth - offset) + "px";

            }else{
              if(freeColumnMarginLeft + offset >= 998){
                return;
              }
              $scope.style[columnName].width = (prevEleWidth + offset) + "px";
              $scope.style.description["margin-left"] = (freeColumnMarginLeft + offset) + "px";
            }
            

            $scope.$emit("CHANGE_TABLE_STYLE", $scope.style);
          }

        });

        angular.element(document).bind("mouseup", function(event) {
          if(!prevEleCell){
            return;
          }

          resizeFlag = false;
          prevEleCell.removeClass("colunm-active");
        });

      }
    };
});
