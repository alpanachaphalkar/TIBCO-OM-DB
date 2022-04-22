var utils = {

  writeScreenshot: function(data, name) {

    var fs = require("fs");
    var screenOutPath = 'output/';
    fs.writeFileSync(screenOutPath + name, data, "base64");

  },

  startWith: function(str1, str2) {
    return str1.indexOf(str2) == 0;
  },
  contains: function(str1, str2) {
    return str1.indexOf(str2) >= 0;
  },

  switchView: function(order, viewStr) {

    utils.waitElements(by.repeater('swButton in switchBarData')).then(function(swBtn) {
      swBtn[order].click().then(function() {
        browser.getCurrentUrl().then(function(url) {
          expect(utils.regSwitchView(viewStr, url)).toEqual(true);
        });
      })
    })
  },
  waitLoading: function() {
    utils.waitQuery("block");
    utils.waitQuery("none");
  },
  waitSuccessful: function() {
    utils.waitQuery("block");
    utils.waitQuery("none");
  },
  waitQuery: function(val) {
    return browser.wait(function() {
      var maskLoading = browser.driver.findElement(by.css(".rightPanel .infobar"));
      return maskLoading.getCssValue("display").then(function(str) {
        return str === val;
      })
    }, 200000);
  },

  regSwitchView: function(params, str) {
    var reg = new RegExp("\/" + params + "\?");
    return reg.test(str);
  },

  regFilterStr: function(params, str) {
    var reg = new RegExp(params);
    return reg.test(str);
  },

  filterTableData: function(sendKey, itemName) {

    it('Filter the ' + itemName + ' test', function() {
      browser.sleep(100);
      var searchInput = element(by.model("globalSearch"));
      var count = 0;
      searchInput.sendKeys(sendKey);

      utils.waitQuery("block");
      utils.waitQuery("none");

      browser.findElements(by.repeater("row in gridRow")).then(function(rows) {
        runs(function() {
          for (var i = 0, item, len = rows.length; i < len; i++) {
            item = rows[i].findElement(by.repeater("column in gridHeader").row(0));
            item.getText().then(function(str) {
              if (utils.regFilterStr(sendKey, str)) {
                count++;
              }
            });
          }
        });

        waitsFor(function() {
          return count === rows.length;
        }, "The count number didn't match for the filter number.", 750)

        runs(function() {
          expect(count).toEqual(rows.length);
          browser.driver.takeScreenshot().then(function(data) {
            utils.writeScreenshot(data, itemName + '.png');
          });
        })
      });
    }, 200000);
  },

  waitUrl: function(urlReg) {
    return browser.driver.wait(function() {
      return browser.driver.getCurrentUrl().then(function(url) {
        return urlReg.test(url);
      })
    })
  },

  waitElements: function(locator) {
    return browser.wait(function() {
      return browser.findElements(locator).then(function(arr) {
        return arr.length;
      })
    }).then(function() {
      return browser.findElements(locator);
    })
  },

  waitElementsByCss: function(className) {
    return browser.wait(function() {
      return browser.findElements(by.css(className)).then(function(arr) {
        return arr.length;
      })
    }).then(function() {
      return browser.findElements(by.css(className));
    })
  },

  vdFilterFunc: function(sendKey, insName, empFlag) {
    var searchInput = element(by.model("globalSearch"));
    var count = 0;
    var emptyFilterText = "0 result was found.",
      emptyTitle = 'No matching Applications. Try again.'
    searchInput.clear();
    searchInput.sendKeys(sendKey).then(function() {
      return utils.waitQuery("block");
    }).then(function() {
      return utils.waitQuery("none");
    });

    if (empFlag) {
      utils.waitElements(by.repeater("row in gridRow")).then(function(rows) {
        runs(function() {
          for (var i = 0, item, len = rows.length; i < len; i++) {
            item = rows[i].elment(by.repeater("column in gridHeader").row(0));
            item.getText().then(function(str) {
              if (utils.regFilterStr(sendKey, str)) {
                count++;
              }
            });
          }
        });

        waitsFor(function() {
          return count === rows.length;
        }, "The count number didn't match for the filter number.", 750)

        runs(function() {
          expect(count).toEqual(rows.length);
          browser.driver.takeScreenshot().then(function(data) {
            utils.writeScreenshot(data, insName + '.png');
          });
        })
      });
    } else {
      utils.waitElementsByCss(".app_header_nav .empty_filter_style p").then(function(pText) {
        expect(pText[0].getCssValue("display")).toEqual("inline-block");
        pText[0].getText().then(function(str) {
          expect(str).toEqual(emptyFilterText);
        })
      });
    }
  },

  matchIconGroup: function(iconArr) {
    utils.waitElementsByCss('[class^="icon-nav-t-"]').then(function(iconGrp) {
      var RegExpIcon = /icon-nav-t-/g;
      var specialArr = [];
      runs(function() {
        for (var i = 0, item, len = iconGrp.length; i < len; i++) {
          item = iconGrp[i];
          item.getAttribute('class').then(function(cls) {
            specialArr.push(cls.replace(RegExpIcon, ''));
          })
        };
      });

      waitsFor(function() {
        return specialArr.length === iconArr.length;
      }, "Maybe the iconGroup is not match with the wireframe, please check it", 50000);

      runs(function() {
        expect(specialArr).toEqual(iconArr);
      })
    });
  }
}

exports.utils = utils;