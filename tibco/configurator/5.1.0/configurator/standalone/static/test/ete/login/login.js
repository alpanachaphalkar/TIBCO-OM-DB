describe('MDM configurator ETE test: ', function() {

  // predefine utils and ptor
  var utils = require('../utils.js').utils;
  var ptor = protractor.getInstance();

  // test login action
  describe('configurator login action', function() {
    var targetUrl = 'http://localhost:6080/config/#/login';
    ptor.get(targetUrl);

    utils.waitUrl(new RegExp(targetUrl)).then(function() {
      console.log("it goto the " + targetUrl);
    });

    it('should be login', function() {
      var button = ptor.findElement(protractor.By.className('login-submit'));
      targetUrl = 'http://localhost:6080/config/#/configuration';

      element(by.model('data.userName')).sendKeys('admin');
      element(by.model('data.password')).sendKeys('admin');

      button.click();

      utils.waitUrl(new RegExp(targetUrl)).then(function() {
        console.log("it goto the " + targetUrl);
      });

      expect(ptor.driver.getCurrentUrl()).toEqual('http://localhost:6080/config/#/configuration');

    }, 5000);

  });
});