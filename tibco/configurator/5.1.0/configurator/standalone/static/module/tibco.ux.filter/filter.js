(function() {

	var util = configurator.util;
	var filters = angular.module("tibco.ux.filters", []);

	filters.filter("propertyTableFlt", function() {
		return function(items, keyword) {
			var filterArr = [];
			var letterMatch = new RegExp(keyword, 'i');
			if(items) {
				for(var i = 0, len = items.length; i<len; i++) {
					var checkStr = "";
					if(items[i].valueType === "list" || items[i].valueType === "enum" || items[i].valueType === "boolean") {
						if(items[i].value){
							checkStr += items[i].value.toString() + " ";
						}
					}else if(items[i].valueType !== "password") {
						checkStr += items[i].value + " ";
					}
					
					checkStr += items[i].name + " ";
					checkStr += items[i].description + " ";
					checkStr += items[i].sinceVersion;

					if(letterMatch.test(checkStr)){
						filterArr.push(items[i]);
					}
				}

				
			}

			
			
			return filterArr;
		}
	});

})();