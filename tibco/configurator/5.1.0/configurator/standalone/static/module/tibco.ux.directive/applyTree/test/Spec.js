describe("directive: applyTree", function() {
	var element,
		scope,
		directiveTemplate,
		directiveTemplate2,
		$injector = angular.injector(['ngMock', 'ng', 'configurator']),
		$compile = $injector.get('$compile'),
		$templateCache = $injector.get('$templateCache');

	it('first child should have class value "accordionTree"', function() {
		
		var req = new XMLHttpRequest();
		req.onload = function() {
			directiveTemplate = this.responseText;
		};
		req.open("get", "module/tibco.ux.directive/applyTree/view/accordionTree.html", false);
		req.send();
		$templateCache.put("module/tibco.ux.directive/applyTree/view/accordionTree.html", directiveTemplate);
		
		var req2 = new XMLHttpRequest();
		req2.onload = function() {
			directiveTemplate2 = this.responseText;
		};
		req2.open("get", "module/tibco.ux.directive/applyTree/view/branches.html", false);
		req2.send();
		$templateCache.put("module/tibco.ux.directive/applyTree/view/branches.html", directiveTemplate2);
	
		scope = $injector.get('$rootScope').$new();
		scope.appliedData = {"json":{"data":{'message':{'group':{'groupName':'Cluster','items':[{'id':'InitialConfig','editTitle':'Edit','deleteTitle':'Delete','subItem':[{'id':'Member1','editTitle':'Edit','deleteTitle':'Delete','name':'Member1','focused':'false','cloneTitle':'Clone','valueType':'string','editable':'true'}],'name':'InitialConfig','focused':'false','cloneTitle':'Clone','valueType':'string','editable':'true'}]}},'level':'info','type':'cluster','success':true}}};
		scope.callback = function() {
			//edit callback
		};
		scope.treeCallback = function() {
			//cluster tree callback
		};
		
		element = $compile('<div tree-title="TreeName" apply-tree="appliedData" node-action="treeCallback" edit-action="callback"></div>')(scope);	
		scope.$digest();

		expect(element.children().eq(0).hasClass("accordionTree")).toBe(true);
	});
});