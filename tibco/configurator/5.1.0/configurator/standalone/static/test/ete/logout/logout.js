describe('MDM configurator ETE test: ', function() {

  // predefine utils and ptor
  var utils = require('../utils.js').utils;
  var ptor = protractor.getInstance();

  // test login action
  describe('configurator logout action', function() {

    it('should be logout', function() {



      ptor.actions().
      mouseMove(ptor.findElement(protractor.By.css('.menu .menuItem-last'))).
      perform();


      // var logout_menu = ptor.findElement(protractor.By.css('.menu .menuItem-last .cfg_dropdownMenu li'));
      var logout_menu = element(by.css('.menu .menuItem-last .cfg_dropdownMenu li:last-child'));

      logout_menu.click();

      var logout_dialog = ptor.findElement(protractor.By.css('.cfgDialogConfigRightBtn button:first-child'));

      logout_dialog.click();

      expect(ptor.driver.getCurrentUrl()).toEqual('http://localhost:6080/config/#/login');

    }, 5000);

  });
});