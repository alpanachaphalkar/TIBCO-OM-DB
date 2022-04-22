(function() {

    var util = configurator.util;
    util.createController("configurator.controller.login", [ "$scope", "$rootScope", "$http", "$location","ConfiguratorService", "UXI18N", "$timeout"], function ($scope, $rootScope, $http, $location, ConfiguratorService, UXI18N, $timeout) {

        angular.element('.bodyDiv>.headerDiv').addClass('hide');
        angular.element('.buildGround').children('.footerDiv').addClass('hide');

        var requestURL = "";
        var jqLoginPanel = jQuery("div.cfg_login");

        var localNS = "login";
        $scope.local = {
            titleUserloginText : UXI18N.getString(localNS, "title.userlogin.text"),
            buttonSigninText : UXI18N.getString(localNS, "button.signin.text"),
            placeholderEmailText : UXI18N.getString(localNS, "placeholder.username.text"),
            placeholderPasswordText : UXI18N.getString(localNS, "placeholder.password.text"),
            errorMessage1 : UXI18N.getString(localNS, "errormassage1"),
            errorMessage2 : UXI18N.getString(localNS, "errormassage2")
        };

        $scope.data = {
            action : "login"
        };

        $scope.errorMessage = {};

        // when page load or refresh, username field should be focus
        var isInputSupported = 'placeholder' in document.createElement('input');
        if(isInputSupported){
            jQuery('.login-input').find('input[type=text]').focus();
        }
       

        $scope.submit = function() {
            $scope.errorMessage = {};
            if(!$scope.data.userName || !$scope.data.password){
                var values = ["userName","password"];
                for(var i in values) {
                    if(!$scope.data[values[i]]){
                        $scope.errorMessage[values[i]] = true;
                        jQuery('.login-input input').eq(i).focus();
                        break;
                    }
                }
            }else {
                ConfiguratorService.LoginService({
                    action : "login",
                    userName : $scope.data.userName,
                    password : $scope.data.password
                }).then(function(data) {
                    util.cookie.setCookie("username", $scope.data.userName);
                    util.cookie.setCookie("isCloudMode", data.isCloudMode);
                    
                    $rootScope.$broadcast("CREATE_USERNAME", $scope.data.userName);
                    jQuery("body").unbind("keydown");
                    $location.path("/configuration");
                },function(errorMessage){
                    $scope.errorMessage.loginFailed = true;
                    $scope.loginFailedMessage = errorMessage;
                });
            }
        };

        jQuery("body").bind("keydown",function(event){
            if(event.keyCode === 13){
                jQuery(".login-submit").click();
            }
        });

        //jQuery('input, textarea').placeholder();
        
    });
})();