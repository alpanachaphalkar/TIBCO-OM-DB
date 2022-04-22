// test tree list
// Home page
// 	> Navigation bar
// 	> Left panel - Cluster tree
// 		> Slider bar
// 	> Left panel - Configuration tree
// 		> Edit menu
//			> Edit
//			> Clone
//			> Delete
// 	> Right panel
// 		> Add new property
// 		> Mouse hover & click


describe('Home page >>', function() {
	// predefine utils and ptor
	var utils = require('../utils.js').utils;
	var ptor;

	beforeEach(function() {
		ptor = protractor.getInstance();
	});

	describe('', function() {
		beforeEach(function() {

		});
	});


	describe('Navigation bar >> ', function() {

	});



	describe('Left panel - Cluster tree >> ', function() {

		describe('Slider bar', function() {

			var sliderBar;
			var height_before;
			var height_after;

			beforeEach(function() {
				sliderBar = element(by.css('.splitLine'));

				// get clusterpanel container height before drop action
				ptor.findElement(by.css('#clusterpanel')).getSize().then(function(size) {
					height_before = size.height;
				});

				// implement drag and drop action
				browser.actions().
				dragAndDrop(sliderBar.find(), {
					x: 0,
					y: 350
				}).dragAndDrop(sliderBar.find(), {
					x: 0,
					y: -300
				}).
				perform();

				// get clusterpanel container height after drop action
				ptor.findElement(by.css('#clusterpanel')).getSize().then(function(size) {
					height_after = size.height;
				});
			});

			it('after drag and drop slider, the container height above the slider should be changed', function() {
				expect(height_after - height_before).toEqual(50);
			});


		});

	});

	describe('Left panel - Configuration tree >> ', function() {

		describe('Switch button', function() {
			var button_basic;
			var button_advanced;
			var editTableTitle;
			var markItemName;

			beforeEach(function() {
				button_basic = ptor.findElement(by.css('#configurationpanel .switchButton .tbutt:first-child'));
				button_advanced = ptor.findElement(by.css('#configurationpanel .switchButton .tbutt:last-child'));
				editTableTitle = ptor.findElement(by.css('.ediTable-title-configuration'));
			});

			it('the edit table title should be switched', function() {
				button_advanced.click();

				ptor.findElements(by.css('#Configurationtree .treeContainer .item.Advanced .level1 span')).then(function(elements) {

					expect(elements[2].getText()).toEqual(editTableTitle.getText());
				});

				button_basic.click();

				ptor.findElements(by.css('#Configurationtree .treeContainer .item.Basic .level1 span')).then(function(elements) {

					expect(elements[2].getText()).toEqual(editTableTitle.getText());
				});
			});

		});

		describe('Edit menu >>', function() {
			var editButton;
			var item_database;
			var editPanel;

			var timestamp = 0;

			beforeEach(function() {
				// item_database = ptor.findElement(by.repeater('item in treeData').row(0));
				item_database = ptor.findElement(by.css('#Configurationtree .treeContainer .item'));
				editButton = ptor.findElement(by.css('#Configurationtree .treeContainer .item .icon-list'));

				timestamp = (new Date()).valueOf();

			});

			afterEach(function() {
				timestamp = 0;
			});


			describe('Edit menu >> Edit >>', function() {

				it('should changed the name', function() {
					browser.actions().
					mouseMove(item_database).
					perform();

					browser.actions().
					mouseMove(editButton).
					perform();

					editButton.click();

					ptor.findElements(by.css('#Configurationtree .treeContainer .item .level1 .editaBtn ul li')).then(function(elements) {
						elements[0].click();
					});

					utils.waitElementsByCss('#cfg_common_dialog');

					ptor.findElement(by.model('categoryData.name')).clear();
					ptor.findElement(by.model('categoryData.name')).sendKeys('name-' + timestamp);
					ptor.findElement(by.model('categoryData.description')).clear();
					ptor.findElement(by.model('categoryData.description')).sendKeys('test decription-' + timestamp);
					ptor.findElement(by.css('#cfg_common_dialog .cfgDialogConfigRightBtn button:first-child')).click();
					// ptor.sleep(1000);

					utils.waitSuccessful('.rightPanel .infobar');

					ptor.findElements(by.css('#Configurationtree .treeContainer .item .level1 span')).then(function(elements) {
						expect(elements[2].getText()).toEqual('name-' + timestamp);
					});
				});

			});

			describe('Edit menu >> Clone >>', function() {
				it('should changed the name', function() {

					ptor.sleep(500);

					browser.actions().
					mouseMove(item_database).
					perform();

					browser.actions().
					mouseMove(editButton).
					perform();

					editButton.click();

					ptor.findElements(by.css('#Configurationtree .treeContainer .item .level1 .editaBtn ul li')).then(function(elements) {
						elements[1].click();
					});

					utils.waitElementsByCss('#cfg_common_dialog');

					ptor.findElement(by.model('newname')).sendKeys('name-' + timestamp);
					ptor.findElement(by.css('#cfg_common_dialog .cfgDialogConfigRightBtn button:first-child')).click();
					// ptor.sleep(1000);

					utils.waitSuccessful('.rightPanel .infobar');

					// ptor.findElements(by.css('#Configurationtree .treeContainer .Basic:lastChild .level1 span')).then(function(elements) {
					// 	expect(elements[3].getText()).toEqual('name-' + timestamp);
					// });

					ptor.findElements(by.css('#Configurationtree .treeContainer .Basic')).then(function(elements) {

						elements[elements.length-1].findElements(by.css('.level1 span')).then(function(elements) {
							expect(elements[2].getText()).toEqual('name-' + timestamp);
						});;
					});

				});
			});
		});
	});

	describe('Right panel >> ', function() {
		var timestamp = 0;

		beforeEach(function() {
			timestamp = (new Date()).valueOf();
		});

		afterEach(function() {
			timestamp = 0;
		});

		describe('Property list >> mouse hover and click', function() {
			var tr;

			beforeEach(function() {
				tr = ptor.findElement(by.css('.ediTable-container .ediTable-table tr'));
			});


			it('after mouse move on the list, the background-color should be changed', function() {

				browser.actions().
				mouseMove(tr).
				perform();

				// ptor.sleep(300);

				expect(tr.getCssValue('background-color')).toEqual('rgba(213, 241, 255, 1)');

			}, 5000);

			it('after click on the list, the background-color should be changed', function() {

				tr.click();

				// ptor.sleep(300);

				expect(tr.getCssValue('background-color')).toEqual('rgba(137, 216, 255, 1)');

			}, 5000);

		});

		describe('Menu bar >> Add new property', function() {
			var propertyLength;

			beforeEach(function() {

				propertyLength = element(by.css('.ediTable-container tr')).length;
				ptor.findElement(by.css('#Configurationtree .treeContainer .item')).then(function(element) {
					element.click();
				});
			});

			it('there should be add a new property in the list', function() {
				var button_addNewProperty = element(by.css('.ediTable-action-bar button:first-child'));

				button_addNewProperty.click();
				utils.waitElementsByCss('#cfg_common_dialog');

				ptor.findElement(by.model('newconfigData.name')).sendKeys('value name-' + timestamp);
				ptor.findElement(by.model('newconfigData.propname')).sendKeys('internal name-' + timestamp);
				ptor.findElement(by.model('newconfigData.sinceVersion')).click();

				// expect(element(by.css('option[value="830"]')).isPresent()).toBe(true);

				ptor.findElement(by.css('option[value="1"]')).click();

				ptor.findElement(by.model('newconfigData.description')).sendKeys('description-' + timestamp);
				ptor.findElement(by.model('newconfigData.valueType')).click();
				ptor.findElement(by.css('option[value="string"]')).click();
				ptor.findElements(by.model('newconfigData.value')).then(function(elements) {
					elements[0].sendKeys('test current value');
				});
				ptor.findElements(by.model('newconfigData.default')).then(function(elements) {
					elements[0].sendKeys('test default value');
				});
				ptor.findElement(by.css('#cfg_common_dialog .cfgDialogConfigRightBtn button:first-child')).click();

				utils.waitSuccessful('.rightPanel .infobar');

				expect(ptor.findElement(by.css('.ediTable-container tr:last-child .editName')).getText()).toEqual('value name-' + timestamp);

			});
		});

		describe('Menu bar >> clone property', function() {
			var firstPropertyItem;
			var button_clone;

			beforeEach(function() {
				firstPropertyItem = ptor.findElement(by.css('.ediTable-container .ediTable-table tr'));

				ptor.findElement(by.css('#Configurationtree .treeContainer .item')).then(function(element) {
					element.click();
				});
				// button_clone = ptor.findElements(by.css('.ediTable-action-bar button'))[1];
			});

			it('clone an exist property and insert to the property list', function() {
				// ptor.sleep(500);

				firstPropertyItem.click();


				ptor.findElements(by.css('.ediTable-action-bar button')).then(function(element) {
					element[1].click();
				});

				// button_clone.click();

				utils.waitElementsByCss('#cfg_common_dialog');

				ptor.findElement(by.model('newname')).sendKeys('name-' + timestamp);
				ptor.findElement(by.model('internalName')).sendKeys('internal name-' + timestamp);

				ptor.findElement(by.css('#cfg_common_dialog .cfgDialogConfigRightBtn button:first-child')).click();

				utils.waitSuccessful('.rightPanel .infobar');

				expect(ptor.findElement(by.css('.ediTable-container tr:last-child .editName')).getText()).toEqual('name-' + timestamp);

			});
		});

		describe('Menu bar >> delete property', function() {
			var button_delete;
			var toBeDeleteItem;
			var length;

			beforeEach(function() {
				ptor.findElements(by.css('.ediTable-container .ediTable-table tr')).then(function(elements) {
					length = elements.length;
					toBeDeleteItem = elements[0];
				});
			});

			it('delete first item in property list', function() {
				toBeDeleteItem.click();
				ptor.findElements(by.css('.ediTable-action-bar button')).then(function(element) {
					element[4].click()
				});

				utils.waitElementsByCss('#cfg_common_dialog');
				ptor.findElement(by.css('#cfg_common_dialog .cfgDialogConfigRightBtn button:first-child')).click();

				utils.waitSuccessful('.rightPanel .infobar');

				ptor.findElements(by.css('.ediTable-container .ediTable-table tr')).then(function(elements) {
					expect(elements.length).toEqual(length - 1);
				});
			});
		});

		

		

	});

});