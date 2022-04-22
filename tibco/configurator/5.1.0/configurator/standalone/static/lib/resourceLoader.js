(function() {

    // config requirejs
    require.config({
        paths : {
            text : "./requirejs/text",
            services : "../module/tibco.ux.service/services",
            filters : "../module/tibco.ux.filter/filter",
            directives : "../module/tibco.ux.directive/directive",
            controllers : "../module/tibco.ux.controller/controller"

        }
    });

    require([ "tibco/configurator/5.1.0/configurator/standalone/static/lib/text" ], function(cart, inventory) {

        var configFileUrl = "config.xml";
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

                    for ( var j = 0; j < templateResourceList.length; j++) {
                        templateResourceURLs.push(textPrefix + templateResourceList[j].getAttribute("url"));
                    }

                    for ( var k = 0; k < jsResourceList.length; k++) {
                        jsResourceURLs.push(jsResourceList[k].getAttribute("url"));
                    }

                    // load localization string resources
                    require([i18nResourceURL], function(source) {
                        util.createNamespace("tibco.ux.service.UXI18N.globalStringPool", JSON.parse(source));

                        require(["services", "directives", "filters", "controllers"], function() {

                            var injector = angular.bootstrap(document, [ "configurator" ]);
                            jQuery("#mainframeLoadingBackgroud").addClass("hide");
                            
                        });

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
    });

})();