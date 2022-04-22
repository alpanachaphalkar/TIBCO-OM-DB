module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                banner: '/*! <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                // separator: '',
                process: function(src, filepath) {
                    return '\n/* --------------------- Source: ' + filepath + '-------------------- */\n' + src;
                }
            },
            controllers: {
                src: ["module/tibco.mdm.configurator/mainframe/controller/controller.js",
                    "module/tibco.mdm.configurator/configuration/controller/controller.js",
                    "module/tibco.mdm.configurator/dialog/controller/controller.js",
                    "module/tibco.mdm.configurator/login/controller/controller.js",
                    "module/tibco.mdm.configurator/setting/controller/controller.js",
                    "module/tibco.ux.directive/editTable/controller/controller.js",
                    "module/tibco.mdm.configurator/revision_history/controller/controller.js"
                ],
                dest: "module/tibco.ux.controller/controller.js"
            },
            directives: {
                src: ["module/tibco.ux.directive/pre-defined.js",
                    "module/tibco.ux.directive/applyTree/js/directive.js",
                    "module/tibco.ux.directive/editTable/js/directive.js",
                    "module/tibco.ux.directive/ngEditTable/js/directive.js",
                    "module/tibco.ux.directive/editTableCell/js/directive.js",
                    "module/tibco.ux.directive/list/js/directive.js",
                    "module/tibco.ux.directive/MDMalert/js/directive.js",
                    "module/tibco.ux.directive/MDMpopover/js/directive.js",
                    "module/tibco.ux.directive/ngBlur/js/directive.js",
                    "module/tibco.ux.directive/ngColunmResize/js/directive.js",
                    "module/tibco.ux.directive/ngPlaceholder/js/directive.js",
                    "module/tibco.ux.directive/ngScrollbar/js/directive.js",
                    "module/tibco.ux.directive/showEdit/js/directive.js",
                    "module/tibco.ux.directive/showTooltip/js/directive.js",
                    "module/tibco.ux.directive/spliteLine/js/directive.js",
                    "module/tibco.ux.directive/switchButton/js/directive.js",
                    "module/tibco.ux.directive/uxDialog/js/directive.js",
                    "module/tibco.ux.directive/uxMenuBar/js/directive.js",
                    "module/tibco.ux.directive/uxWizard/js/directive.js"
                ],
                dest: "module/tibco.ux.directive/directive.js"
            }
        },
        jasmine: {
            controller: {
                src: "module/tibco.ux.controller/controller.js",
                options: {
                    specs: ["module/tibco.mdm.configurator/configuration/test/Spec.js"],
                    vendor: ["lib/jquery/jquery-3.5.0.js",
                        "lib/angular/angular.js",
                        "lib/angular/angular-route.js",
                        "lib/bootstrap/js/bootstrap.js",
                        "lib/angular-ui/ui-bootstrap-0.12.1.js"
                    ],
                    helpers: ["lib/jsutil.js",
                        "lib/scrollBar/KLScrollBars.js",
                        "config/module/tibco.mdm.configurator/mainframe/view/template.html",
                        "module/tibco.ux.service/services.js",
                        "module/tibco.ux.directive/directive.js"
                    ],
                    keepRunner: true
                }
            },
            directive: {
                src: "module/tibco.ux.directive/directive.js",
                options: {
                    specs: ["module/tibco.ux.directive/applyTree/test/Spec.js"],
                    vendor: ["lib/jquery/jquery-3.5.0.js",
                        "lib/angular/angular.js",
						'lib/angular/angular-mocks.js',
                        "lib/angular/angular-route.js",
                        "lib/bootstrap/js/bootstrap.js",
                        "lib/angular-ui/ui-bootstrap-0.12.1.js"
                    ],
                    helpers: ["lib/jsutil.js",
                        "lib/scrollBar/KLScrollBars.js",
                        "config/module/tibco.mdm.configurator/mainframe/view/template.html",
                        "module/tibco.ux.service/services.js",
                        "module/tibco.ux.controller/controller.js"
                    ],
                    keepRunner: true
                }
            },
            service: {
                src: ["module/tibco.ux.service/services.js"],
                options: {
                    specs: ["module/tibco.ux.service/test/Spec.js"],
                    vendor: ["lib/jquery/jquery-3.5.0.js",
                        "lib/angular/angular.js",
                        "lib/angular/angular-route.js",
                        "lib/bootstrap/js/bootstrap.js",
                        "lib/angular-ui/ui-bootstrap-0.12.1.js"
                    ],
                    helpers: ["lib/jsutil.js",
                        "lib/scrollBar/KLScrollBars.js",
                        "module/tibco.ux.service/test/helper.js",
                        "config/module/tibco.mdm.configurator/mainframe/view/template.html",
                        "module/tibco.ux.controller/controller.js",
                        "module/tibco.ux.directive/directive.js"
                    ],
                    keepRunner: true,
                    template: require("grunt-template-jasmine-requirejs"),
                    templateOptions: {
                        requireConfigFile: ["lib/requirejs/text.js"]
                    }
                }
            }
        },
        protractor: {
            options: {
                configFile: 'test/ete/entry.js',
                keepAlive: true,
                noColor: false,
                singleRun: false,
                args: {

                }
            },

            run_chrome: {
                options: {
                    args: {
                        browser: 'chrome'
                    }
                }
            },

            run_firefox: {
                options: {
                    args: {
                        browser: 'firefox'
                    }
                }
            }
        },
        watch: {
            files: ["module/tibco.mdm.configurator/mainframe/controller/controller.js",
                    "module/tibco.mdm.configurator/configuration/controller/controller.js",
                    "module/tibco.mdm.configurator/dialog/controller/controller.js",
                    "module/tibco.mdm.configurator/login/controller/controller.js",
                    "module/tibco.mdm.configurator/setting/controller/controller.js",
                    "module/tibco.ux.directive/editTable/controller/controller.js",
                    "module/tibco.mdm.configurator/revision_history/controller/controller.js",
                    "module/tibco.ux.directive/pre-defined.js",
                    "module/tibco.ux.directive/applyTree/js/directive.js",
                    "module/tibco.ux.directive/editTable/js/directive.js",
                    "module/tibco.ux.directive/ngEditTable/js/directive.js",
                    "module/tibco.ux.directive/editTableCell/js/directive.js",
                    "module/tibco.ux.directive/list/js/directive.js",
                    "module/tibco.ux.directive/MDMalert/js/directive.js",
                    "module/tibco.ux.directive/MDMpopover/js/directive.js",
                    "module/tibco.ux.directive/ngBlur/js/directive.js",
                    "module/tibco.ux.directive/ngColunmResize/js/directive.js",
                    "module/tibco.ux.directive/ngPlaceholder/js/directive.js",
                    "module/tibco.ux.directive/ngScrollbar/js/directive.js",
                    "module/tibco.ux.directive/showEdit/js/directive.js",
                    "module/tibco.ux.directive/showTooltip/js/directive.js",
                    "module/tibco.ux.directive/spliteLine/js/directive.js",
                    "module/tibco.ux.directive/switchButton/js/directive.js",
                    "module/tibco.ux.directive/uxDialog/js/directive.js",
                    "module/tibco.ux.directive/uxMenuBar/js/directive.js",
                    "module/tibco.ux.directive/uxWizard/js/directive.js"
                    ],
            tasks: ['concat']
        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            protractor_test: ['protractor-firefox']
        },
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('protractor-chrome', ['protractor:run_chrome']);
    grunt.registerTask('protractor-firefox', ['protractor:run_firefox']);


    grunt.registerTask('default', ['concat']);

};