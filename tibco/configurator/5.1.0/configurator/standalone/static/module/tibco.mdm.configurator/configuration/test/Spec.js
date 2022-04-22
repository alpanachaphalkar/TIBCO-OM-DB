describe("cfg.configurationOutline.controller", function() {
	var $injector = angular.injector(['ng', 'configurator']),
		$controller = $injector.get('$controller'),
		$log = $injector.get('$log'),
		scope = $injector.get('$rootScope').$new();
		
	configurationCtrl = $controller('cfg.configurationOutline.controller', 
		{
			$rootScope : $injector.get('$rootScope'),
			$scope : scope, 
			$log : $log, 
			$timeout : $injector.get('$timeout'),
			$http : $injector.get('$http'),
			MDMCfgDialog : $injector.get('MDMCfgDialog'),			
			ConfiguratorService : $injector.get('ConfiguratorService'),
			MDMValidation : $injector.get('MDMValidation')
		}
	);
   
	it('value of accordionTreeList should be defined', function() {
		expect(scope.clusterData).toBeDefined();
	});
	
});