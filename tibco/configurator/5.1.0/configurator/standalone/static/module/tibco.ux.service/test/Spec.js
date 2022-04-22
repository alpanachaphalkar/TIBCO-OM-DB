describe("Configurator service : UXI18N", function() {	
	var $injector = angular.injector(['ng', 'configurator']),
		UXI18N = $injector.get("UXI18N");
	
	it("Length of localized string shouldn't be 0", function() {
		var localizedStr = UXI18N.getString("mainframe", "footer.copyRightText");
		expect(localizedStr.length).toBeGreaterThan(0);
	});
});