/**
 * @namespace configurator.util
 * @author Mark
 */

(function() {

    var utilNamespace = "configurator.util";

    var util = {

        /**
         * create namespace for object
         */
        createNamespace : function(namespace, obj, overwrite) {
            var temp = window;
            var nameArr = namespace.split(".");

            for ( var i = 0; i < nameArr.length; i++) {
                if (i === nameArr.length - 1) {
                    if (temp[nameArr[i]] == null || overwrite === true) {
                        temp[nameArr[i]] = obj;
                        break;
                        // if namespace already exsited, throw error
                    } else {
                        //throw new Error("namespace '" + namespace + "' already exsited !");
                    }
                }

                if (temp[nameArr[i]] == null) {
                    temp[nameArr[i]] = {};
                }
                temp = temp[nameArr[i]];
            }
        },

        log : function(message) {
            // return;
            message = "::Log[" + (new Date()) + "]::" + message;
            if (typeof console == "object") {
                 console.log(message);
            } else if (typeof opera == "object") {
                opera.postError(message);
            } else if (typeof java == "object" && typeof java.lang == "object") {
                java.lang.System.out.println(message);
            }
        },

        /**
         * create controller with namespace and dependences
         * 
         * @method createController
         * @param namespace
         *        {string} the namespace of controller
         * @param dependencesArr
         *        {array} the dependences array of the controller
         * @param controllerFun
         *        {function} the controller function
         */
        createController : function(namespace, dependencesArr, controllerFun, overwrite) {
            // check parameters
            if (typeof namespace !== "string" || !angular.isArray(dependencesArr) || !angular.isFunction(controllerFun)) {
                throw new Error(utilNamespace + ".createController(namespace:string, dependencesArr:Array, controllerFun:function), parameter is not correct!");
            }

            //this.log("create controller: " + namespace);
            this.createNamespace(namespace, controllerFun, overwrite);
            controllerFun.$inject = dependencesArr;
            return controllerFun;
        },

        xml : {

            /**
             * parse XML string to XML Document object
             */
            createIEDocument : function() {
                if (typeof arguments.callee.activeXString != "string") {
                    var versions = [ "MSXML2.DOMDocument.6.0", "MSXML2.DOMDocument.3.0", "MSXML2.DOMDocument" ];
                    var i, len;
                    for (i = 0, len = versions.length; i < len; i++) {
                        try {
                            new ActiveXObject(versions[i]);
                            arguments.callee.activeXString = versions[i];
                            break;
                        } catch (ex) {
                            // skip
                        }
                    }
                }
                return new ActiveXObject(arguments.callee.activeXString);
            },

            parse : function(xml) {
                var xmldom = null;
				try {
					// for IE
					if (ActiveXObject !== "undefined") {
						xmldom = this.createIEDocument();
						xmldom.loadXML(xml);
						if (xmldom.parseError != 0) {
							throw new Error("XML parsing error: " + xmldom.parseError.reason);
						}
					}
				} catch(e) {
					// for Firefox, Opera, Chrome, and Safari
					if (typeof DOMParser != "undefined") {
						xmldom = (new DOMParser()).parseFromString(xml, "text/xml");
						var errors = xmldom.getElementsByTagName("parsererror");
						if (errors.length) {
							throw new Error("XML parsing error:" + errors[0].textContent);
						}
	
					} else {
						throw new Error("No XML parser available.");
					}
				}
                return xmldom;
            },

            /**
             * serialize XML Document object to XML string
             */
            serialize : function(xmldom) {
                // for IE
                if (typeof xmldom.xml != "undefined") {
                    return xmldom.xml;
                    // for Firefox, Opera, Chrome, and Safari
                } else if (typeof XMLSerializer != "undefined") {
                    return (new XMLSerializer()).serializeToString(xmldom);
                } else {
                    throw new Error("Could not serialize XML DOM.");
                }
            },

            /**
             * select single node for XPath
             */
            selectSingleNode : function(context, expression, namespaces) {
                // check parameter
                if (context == null || expression == null) {
                    throw new Error("parameter 'context' and 'expression' can not be null");
                }

                var doc = (context.nodeType != 9 ? context.ownerDocument : context);
                if (typeof doc.evaluate != "undefined") {
                    var nsresolver = null;
                    if (namespaces instanceof Object) {
                        nsresolver = function(prefix) {
                            return namespaces[prefix];
                        };
                    }
                    var result = doc.evaluate(expression, context, nsresolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                    return (result !== null ? result.singleNodeValue : null);
                } else if (typeof context.selectSingleNode != "undefined") {
                    // create namespace string
                    if (namespaces instanceof Object) {
                        var ns = "";
                        for ( var prefix in namespaces) {
                            if (namespaces.hasOwnProperty(prefix)) {
                                ns += "xmlns:" + prefix + "='" + namespaces[prefix] + "'";
                            }
                        }
                        doc.setProperty("SelectionNamespaces", ns);
                    }
                    return context.selectSingleNode(expression);
                } else {
                    throw new Error("No XPath engine found.");
                }
            },

            /**
             * select nodes for XPath
             */
            selectNodes : function(context, expression, namespaces) {
                var doc = (context.nodeType != 9 ? context.ownerDocument : context);
                if (typeof doc.evaluate != "undefined") {
                    var nsresolver = null;
                    if (namespaces instanceof Object) {
                        nsresolver = function(prefix) {
                            return namespaces[prefix];
                        };
                    }
                    var result = doc.evaluate(expression, context, nsresolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    var nodes = new Array();
                    if (result !== null) {
                        for ( var i = 0, len = result.snapshotLength; i < len; i++) {
                            nodes.push(result.snapshotItem(i));
                        }
                    }
                    return nodes;
                } else if (typeof context.selectNodes != "undefined") {
                    // create namespace string
                    if (namespaces instanceof Object) {
                        var ns = "";
                        for ( var prefix in namespaces) {
                            if (namespaces.hasOwnProperty(prefix)) {
                                ns += "xmlns:" + prefix + "='" + namespaces[prefix] + "' ";
                            }
                        }
                        doc.setProperty("SelectionNamespaces", ns);
                    }
                    var result = context.selectNodes(expression);
                    var nodes = new Array();
                    for ( var i = 0, len = result.length; i < len; i++) {
                        nodes.push(result[i]);
                    }
                    return nodes;
                } else {
                    throw new Error("No XPath engine found.");
                }
            },

            /**
             * XSLT transform
             * 
             * @param context
             * @param xslt
             * @returns
             */
            transform : function(context, xslt) {
                // for firefox, Chrome
                if (typeof XSLTProcessor != "undefined") {
                    var processor = new XSLTProcessor();
                    processor.importStylesheet(xslt);
                    var result = processor.transformToDocument(context);
                    return (new XMLSerializer()).serializeToString(result);

                    // for IE
                } else if (typeof context.transformNode != "undefined") {
                    return context.transformNode(xslt);

                } else {
                    throw new Error("No XSLT processor available.");
                }
            }
        },

        array : {
            forEach : function(array, fun) {
                var arrLength = array.length;
                for ( var i = 0; i < arrLength; i++) {
                    fun.call(array[i], i);
                }
            },

            indexOf : function(array, item) {

                if (util.isArray(array) !== true) {
                    throw new Error("parameter array must be an Array!");
                }

                if (typeof array.indexOf === 'function') {
                    return array.indexOf(item);
                } else {
                    // for ie8 and earlier version, ie8 and earlier ie don't have indexOf method in Array
                    for ( var i = 0; i < array.length; i++) {
                        if (array[i] === item) {
                            return i;
                        }
                    }
                    return -1;
                }
            }
        },

        string : {
            emptyOrNull : function(text) {
                if (text == null || jQuery.trim(text) === "") {
                    return true;
                } else {
                    return false;
                }
            },

            notEmptyOrNull : function(text) {
                return !this.emptyOrNull(text);
            },

            /**
             * split string, use javascript string.split() function, but remove empty string and null element in the result array
             * 
             * @param text
             * @param seperator
             * @returns {Array}
             */
            splitAndRemoveEmptyOrNull : function(text, seperator) {
                var partArr = text.split(seperator);
                var result = [];
                var element = null;
                var arrLength = partArr.length;
                for ( var i = 0; i < arrLength; i++) {
                    element = partArr[i];
                    if (this.notEmptyOrNull(element)) {
                        result.push(element);
                    }
                }
                return result;
            }
        }, 

        loadCSS : function(files){
            for(var i = 0, len = files.length; i < len; i++){
                var head = document.getElementsByTagName('head').item(0);
                var css = document.createElement('link');
                var file = files[i];
                css.href = file;
                css.rel = "stylesheet";
                css.type = "text/css";
                head.appendChild(css);
            }  
        },

        cookie : {
            setCookie : function(name, value, days) {
                days = days || 30;
                var exp  = new Date(); 
                exp.setTime(exp.getTime() + days*24*60*60*1000);
                document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
            },
            getCookie : function(name) {
                var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
                if(arr != null){
                    return unescape(arr[2]);
                }  
                return null;
            },
            delCookie : function(name) {
                var exp = new Date();
                exp.setTime(exp.getTime() - 1);
                var cval = util.cookie.getCookie(name);
                if(cval != null){
                    document.cookie = name + "="+cval+";expires="+exp.toGMTString();
                }
            }
        }
    };

    util.createNamespace(utilNamespace, util);

})();