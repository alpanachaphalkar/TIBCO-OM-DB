// An example configuration file.
exports.config = {
  // The address of a running selenium server.
  seleniumAddress: 'http://localhost:4444/wd/hub',
  // seleniumAddress: 'http://localhost:5555',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'firefox'
    // 'browserName': 'IE'
  },

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  specs: [
    // 'login/login.js',
    'home/home-specs.js',
    'logout/logout.js'

  ],

  onPrepare: function() {
    // The require statement must be down here, since jasmine-reporters
    // needs jasmine to be in the global and protractor does not guarantee
    // this until inside the onPrepare function.
    require('jasmine-reporters');
    jasmine.getEnv().addReporter(new jasmine.JUnitXmlReporter('test/reports/', true, true));


    // login action module
    var ptor = protractor.getInstance();
    ptor.get('http://localhost:6080/config/#/login');
    browser.driver.wait(function() {
      return browser.driver.getCurrentUrl().then(function(url) {
        return /http:\/\/localhost:6080\/config\/#\/login/.test(url);
      })
    });
    var button = ptor.findElement(protractor.By.className('login-submit'));
    element(by.model('data.userName')).sendKeys('admin');
    element(by.model('data.password')).sendKeys('admin');
    button.click();
    browser.driver.wait(function() {
      return browser.driver.getCurrentUrl().then(function(url) {
        return /http:\/\/localhost:6080\/config\/#\/configuration/.test(url);
      })
    });

  },

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};