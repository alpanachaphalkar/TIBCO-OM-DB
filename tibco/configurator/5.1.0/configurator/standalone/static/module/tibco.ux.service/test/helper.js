(function() {

    // config requirejs
    require.config({
        paths : {
            text : "lib/requirejs/text"
        }
    });

    var configFileUrl = "module/tibco.ux.service/test/config.xml";
    var util = configurator.util;
    var resourceStore = {
        templates : {},
        configDoc : null
    };
    var language = null;
    var defLanguage = "en"; //default language is English

    util.createNamespace("configurator.resourceStore", resourceStore);

    var loader = {

        loadConfigResource : function() {
            var loadResource = function(configDoc) {
                resourceStore.configDoc = configDoc = util.xml.parse(configDoc);
                util.createNamespace("configurator.systemConfig", configDoc);
                defLanguage = util.xml.selectNodes(configDoc, "/config/system-admin/property[@name='defaultLanguage']")[0].getAttribute("value");
                // should request language setting from server firstly, if the response is not available then use the default language
                // language = [request from server];
                if(!language) {
                    language = defLanguage;
                }
                var textPrefix = "text!";
                var i18nResourceURL = textPrefix + util.xml.selectNodes(configDoc, "/config/system-admin/property[@name='" + language + "']")[0].getAttribute("value");
                var templateResourceList = util.xml.selectNodes(configDoc, "/config/resource-load-list/resource[@type='template']");
                var templateResourceURLs = [];
                var jsResourceList = util.xml.selectNodes(configDoc, "/config/resource-load-list/resource[@type='script']");
                var jsResourceURLs = [];
                var j,k,len;
                for (j = 0, len = templateResourceList.length; j < len; j++) {
                    templateResourceURLs.push(textPrefix + templateResourceList[j].getAttribute("url"));
                }

                for (k = 0, len = jsResourceList.length; k < len; k++) {
                    jsResourceURLs.push(jsResourceList[k].getAttribute("url"));
                }

                // load localization string resources
                require([i18nResourceURL], function(source) {
                    util.createNamespace("tibco.ux.service.UXI18N.globalStringPool", JSON.parse(source)); 
                    var injector = angular.bootstrap(document, [ "configurator" ]);
                });

            };

            jQuery.ajax({
                url : configFileUrl,
                dataType : "text",
                success : loadResource,
                error : function(error) {
                    throw new Error("load configuration file: '" + configFileUrl + "' fail! \n" + error);
                }
            });
        }
    };

    loader.loadConfigResource();

})();