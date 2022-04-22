/**
 * @author Huan Li
 */

if(typeof Function.prototype.bind !== 'function') {
  Function.prototype.bind = function() {
    var me = this, args = arguments, fct = function() {
      return me.apply(args[0], Array.prototype.concat.apply(Array.prototype.slice.call(args, 1), arguments));
    };
    fct.prototype = this.prototype;
    return fct;
  };
}

(function(w) {
  w.kl = {};
  /**
   * Check all the packages that are in the qualified package name. If anyone of them is missing it will be created
   * automatically. The package which is denoted by the qualified package name will be returned.
   *
   * @author Huan Li
   * @param {String}
   *          strQPkgName The qualified package name.
   * @returns {Object} The package, which is just an object, denoted by the qualified package name.
   */
  w.kl.definePackages = function(strQPkgName) {
    var arrPkgNames, i, objScope = w;
    if (strQPkgName) {
      arrPkgNames = strQPkgName.split(/\./);
      for ( i = 0; i < arrPkgNames.length; i += 1) {
        if ( typeof objScope[arrPkgNames[i]] === 'undefined') {
          objScope[arrPkgNames[i]] = {};
        }
        objScope = objScope[arrPkgNames[i]];
      }
    }
    return objScope;
  };
  /**
   * Define a class with the arguments provided in the objSpec object. If the qName is provided in the objSpec object the
   * constructor function of this class will be assigned to that qName. If no qName has been provided the constructor
   * function will be directly returned instead.
   *
   * @author Huan Li
   * @param {Object} objSpec Optional. Provide the arguments for defining the class. The structure is like the following:
   *
   * <pre>
   * {
   *   qName: {String}, // Optional. The qualified name of the class to be created. If this parameter is not provided the
   *       constructor will be returned.
   *
   *   Super: {Function}, // Optional. The super class from which the class that is to be created inherits. It can be a
   *       constructor function of a class or it can just be a simple object produced by object literals. If this
   *       parameter is not provided the class will be inheriting from the Object class.
   *
   *   equipper: {Function}, // Optional. The function which is for specifying static and dynamic members of this class.
   *       This function is called with the constructor function and the prototype of the constructor function as the
   *       first two arguments. Static properties can be attached to the constructor and dynamic properties can be
   *       attached to the prototype of the constructor. If this parameter is not provided no members will be available
   *       for a just-created instance of the class.
   *
   *   initializer: {Function} // Optional. The initializing function that will be called on the instance of the class
   *       with the arguments passed into the constructor function. This function is called right after an instance of
   *       this class is just created to do some initialization work before the instance is used.
   * }
   * </pre>
   *
   * @returns {Function} The constructor function when the qName is not provided. Otherwise, nothing will be returned.
   */
  w.kl.defineClass = function(objSpec) {
    /**
     * If the objSpec is not provided make it an empty object
     */
    objSpec = objSpec || {};
    var STATIC = w.kl,
    /**
     * A reference to the constructor function
     */
    fctConstructor,
    /**
     * The qualified name of this class
     */
    _strQName = objSpec.qName,
    /**
     * The super class of this class
     */
    _Super = objSpec.Super || {},
    /**
     * The function that is for specifying static and dynamic members of the class
     */
    // @formatter:off
    _fctEquipper = objSpec.equipper || function() {},
    // @formatter:on
    /**
     * The initializing function for the class
     */
    // @formatter:off
    _fctInitializer = objSpec.initializer || function() {},
    // @formatter:on
    /**
     * The name of the this class, may be the same as the qualified name or be the last part of the qualified name
     */
    _strClassName,
    /**
     * The scope object to which this class will be attached
     */
    _objScope;
    /**
     * If the super class is provided as a string of the qualified name it must be resolved to a constructor function
     * first
     */
    if ( typeof _Super === 'string') {
      try {
        _Super = eval(_Super) || {};
      } catch (e) {
        throw '"' + _Super + '" cannot be resolved to a class or an object.';
      }
    }
    /**
     * The super class is not a constructor function but a simple object
     */
    _Super = _Super.prototype || _Super;
    fctConstructor = function() {
      _fctInitializer.apply(this, arguments);
    };
    /**
     * Inherit from _Super.
     */
	function getSuperFunc () { 
		function F() {};
		F.prototype = _Super; 		
		var f = new F(); 
		return f; 	
	}   
    fctConstructor.prototype = getSuperFunc();
    //fctConstructor.prototype = Object.create(_Super);
    /**
     * Correct the constructor function of the class. If not do so the constructor would be the Object function.
     */
    fctConstructor.prototype.constructor = fctConstructor;
    /**
     * Populate the class with static and dynamic member properties
     */
    _fctEquipper.call(null, fctConstructor, fctConstructor.prototype);
    /**
     * Get a property with the name "strPropName" of the super class.
     *
     * @author Huan Li
     * @param {String} strPropName The name of the property of the super class.
     * @returns {*} The value of the property of the super class.
     */
    fctConstructor.prototype.getSuper = function(strPropName) {
      return _Super[strPropName];
    };
    /**
     * Call a method with the name "strMethodName" of the super class on this class' instance.
     *
     * @author Huan Li
     * @param {String} strMethodName The name of the method of the super class.
     * @returns {*} The return value of the method of the super class.
     */
    fctConstructor.prototype.callSuper = function(strMethodName) {
      var superMethod = this.getSuper(strMethodName);
      if ( typeof superMethod === 'function') {
        return superMethod.apply(this, Array.prototype.slice.call(arguments, 1));
      }
    };
    /**
     * When the name of this class is not provided just return the constructor function
     */
    if ( typeof _strQName !== 'undefined') {
      _strClassName = _strQName.substring(_strQName.lastIndexOf('.') + 1);
      _objScope = STATIC.definePackages(_strQName.substring(0, _strQName.lastIndexOf('.')));
      _objScope[_strClassName] = fctConstructor;
    } else {
      return fctConstructor;
    }
  };

  /**
   * The ScrollBars must work with jQuery library! Version 1.8.2 or higher is recommended.
   */
  if ( typeof jQuery !== 'undefined') {
    /**
     * ScrollBars class. It can be used to show custom scroll bars in an element.
     *
     * @author Huan Li
     * @class
     */
    w.kl.defineClass({
      qName: 'kl.ScrollBars',
      equipper: function(STATIC, proto) {
        STATIC.CODE_LEFT_ARROW_KEY = 37;
        STATIC.CODE_UP_ARROW_KEY = 38;
        STATIC.CODE_RIGHT_ARROW_KEY = 39;
        STATIC.CODE_DOWN_ARROW_KEY = 40;
        STATIC.BEZIER_CURVE_BOUNCE = 'cubic-bezier(0, 0, 0.1, 1.4)';
        STATIC.BEZIER_CURVE_NO_BOUNCE = 'cubic-bezier(0, 0, 0.46, 1)';
        STATIC.DEFAULT_ACCELERATION = 0.0015; // The unit is "px/ms^2"
        STATIC.DEFAULT_TRANSITION_DURATION = 200;
        STATIC.END_DRAG_TIMEOUT = 50;
        STATIC.EVENT_MOUSE_DOWN = 'mousedown';
        STATIC.EVENT_MOUSE_MOVE = 'mousemove';
        STATIC.EVENT_MOUSE_OVER = 'mouseover';
        STATIC.EVENT_MOUSE_UP = 'mouseup';
        STATIC.EVENT_TOUCH_CANCEL = 'touchcancel';
        STATIC.EVENT_TOUCH_END = 'touchend';
        STATIC.EVENT_TOUCH_MOVE = 'touchmove';
        STATIC.EVENT_TOUCH_START = 'touchstart';
        STATIC.EVENT_TYPE_CANCEL = 'cancel';
        STATIC.EVENT_TYPE_END = 'end';
        STATIC.EVENT_TYPE_MOVE = 'move';
        STATIC.EVENT_TYPE_START = 'start';
        STATIC.EVENT_SCROLLED = 'scrolled';
        STATIC.EVENT_END_REACHED = 'endReached';
        STATIC.EVENT_BOTTOM_END_REACHED = 'bottomEndReached';
        STATIC.EVENT_LEFT_END_REACHED = 'leftEndReached';
        STATIC.EVENT_RIGHT_END_REACHED = 'rightEndReached';
        STATIC.EVENT_TOP_END_REACHED = 'topEndReached';
        STATIC.INSTANCE_COUNTER = 0;
        STATIC.MINIMUM_TRANSITION_TIME = 800;
        STATIC.MOVE_BY_POSITION = 1;
        STATIC.MOVE_BY_TRANSFORM = 2;
        STATIC.MOVEMENT_TRIGGER_ACTION_ARROW_KEY_DOWN = 'arrow_key_down';
        STATIC.MOVEMENT_TRIGGER_ACTION_ARROW_KEY_LEFT = 'arrow_key_left';
        STATIC.MOVEMENT_TRIGGER_ACTION_ARROW_KEY_RIGHT = 'arrow_key_right';
        STATIC.MOVEMENT_TRIGGER_ACTION_ARROW_KEY_UP = 'arrow_key_up';
        STATIC.MOVEMENT_TRIGGER_ACTION_DRAG = 'drag';
        STATIC.MOVEMENT_TRIGGER_ACTION_GLIDE = 'glide';
        STATIC.MOVEMENT_TRIGGER_ACTION_MOUSE_WHEEL = 'mouse_wheel';
        STATIC.MOVEMENT_TRIGGER_ACTION_PROGRAM = 'program';
        STATIC.SCROLL_ONCE_TRANSITION_DURATION = 500;
        STATIC.SHIFTING_BY_ARROW_KEYS = 30;
        STATIC.SHIFTING_BY_SCROLL = 10;
        STATIC.TIMEOUT_SCROLL_BARS_VISIBILITY = 1000;
        STATIC.WRAPPER_MAX_HEIGHT = Number.POSITIVE_INFINITY;
        STATIC.WRAPPER_MAX_WIDTH = Number.POSITIVE_INFINITY;
        STATIC.WRAPPER_MIN_HEIGHT = 100;
        STATIC.WRAPPER_MIN_WIDTH = 100;

        /**
         * A factory method to avoid the situation where the "new" operator is missing by accident. The missing "new"
         * will cause some problems.
         *
         * @author Huan Li
         * @param {String|jQuery|HTMLElement} objWrappee The wrapped element. If it's a string, it will be treated as the
         *          id of the element which is to be wrapped.
         * @param {Object} objSpec This parameter is the same as the one passed into the constructor function of this
         *          class.
         * @returns {kl.ScrollBars} The newly created instance of this class.
         */
        STATIC.makeScrollable = function(objWrappee, objSpec) {
          objSpec = objSpec || {};
          objSpec.wrappee = objWrappee;
          return new kl.ScrollBars(objSpec);
        };
      },
      /**
       * Initialize the scroll bars with the parameters provided in the objConfig.
       *
       * @author Huan Li
       * @param {Object} objConfig A key-value pair object containing arguments to initialize scroll bars. The details of
       *          this parameter is like the following:
       *
       * <pre>
       * {
       *   wrappee: {String|Object}, // Required. The wrapped element. If the &quot;wrappee&quot; property in
       *       the &quot;objConfig&quot; argument is a string, it will be treated as the id of the element which is to be
       *       wrapped.
       *
       *   numHowToMove: {Number}, // Optional. The number indicating different CSS properties that are changed when moving
       *       elements. Either kl.ScrollBars.MOVE_BY_POSITION which means by using the &quot;left&quot; and
       *       &quot;top&quot; properties or kl.ScrollBars.MOVE_BY_TRANSFORM which means by using the
       *       &quot;transform&quot; property. The default value is the latter.
       *
       *   numMaxHeight,: {Number}, // Optional. The maximum height to which the wrapper element can be resized if
       *       specified. Otherwise, a default maximum height is used instead.
       *
       *   numMaxWidth: {Number}, // Optional. The maximum width to which the wrapper element can be resized if specified.
       *       Otherwise, a default maximum width is used instead.
       *
       *   numMinHeight: {Number}, // Optional. The minimum height to which the wrapper element can be resized if
       *       specified. Otherwise, a default minimum height is used instead.
       *
       *   numMinWidth: {Number}, // Optional. The minimum width to which the wrapper element can be resized if specified.
       *       Otherwise, a default minimum width is used instead.
       *
       *   numWrapperHeight: {Number}, // Optional. The height of the wrapper element if specified. Otherwise, the height of the
       *       wrapper element will be the same as the height of the wrapped element before it's wrapped.
       *
       *   numWrapperWidth: {Number}, // Optional. The width of the wrapper element if specified. Otherwise, the width of the
       *       wrapper element will be the same as the width of the wrapped element before it's wrapped.
       *
       *   bAutoHide: {Boolean}, // Optional. True if the scroll bars are shown when the mouse cursor moves into the
       *       wrapper element and hidden when the mouse cursor moves out of the wrapper element. False if the scroll bars
       *       are shown constantly. The default value is true.
       *
       *   bDraggable: {Boolean}, // Optional. True if the wrapped element can be dragged. False otherwise. The default
       *       value is false.
       *
       *   bFlipXY: {Boolean}, // Optional. True if the directions of the scrolling action of the mouse wheel flips which
       *       means that when you roll the wheel down the wrapped element will scroll to the right and when you roll the
       *       wheel up the wrapped element will scroll down. False otherwise. False otherwise. The default value is false.
       *
       *   bGlideable: {Boolean}, // Optional. True if the wrapped element will glide for a mount of distance after a
       *       drag-and-release action. False otherwise. The default value is true.
       *
       *   bHorizontalBarVisible: {Boolean}, // Optional. True if the horizontal scroll bar will be shown when needed.
       *       False if the horizontal scroll bar will never be shown. The default value is true.
       *
       *   bHorizontalScrollable: {Boolean}, // Optional. True if the horizontal scroll is enabled. False otherwise. The
       *       default value is true.
       *
       *   bPageMode: {Boolean}, // Optional. True if the scrolling would be carried out page by page. False if the
       *       scrolling is continuous. The default value is false.
       *
       *   bResizeable: {Boolean}, // Optional. True if the wrapper element can be resized. False otherwise. The default
       *       value is false. The default value is false.
       *
       *   bResizeKnobVisisble: {Boolean}, // Optional. True if the resize knob is visible. False otherwise. The default
       *       value is false.
       *
       *   bScrollableByArrowKeys: {Boolean}, // Optional. True if the arrow keys can control the scroll of the wrapped
       *       element. False otherwise. The default value is true.
       *
       *   bScrollableByMouseWheel: {Boolean}, // Optional. True if the user can scroll with the mouse wheel. False
       *       otherwise. The default value is true.
       *
       *   bSmooth// {Boolean}, // Optional. True if the &quot;transition&quot; property of CSS is used to make the
       *       scrolling smooth. False otherwise. The default value is false.
       *
       *   bVerticalBarVisible: {Boolean}, // Optional. True if the vertical scroll bar will be shown when needed. False if
       *       the vertical scroll bar will never be shown. The default value is true.
       *
       *   bVerticalScrollable: {Boolean}, // Optional. True if the vertical scroll is enabled. False otherwise. The
       *       default value is true.
       *
       *   strScrollBarColor: {String}, // Optional. The color of the scroll bars. If it's omitted the default color will
       *       be used.
       *
       *   objEventHandlers: {Object}, // Optional. A key-value pair object containing the event handler functions. The
       *       currently available events that can be subscribed include the following:
       *         1. "scrolled", fired when the wrapped element is just moved for an amount of distance.
       *         2. "endReached", fired when one of the four ends of the wrapped element is reached.
       *         3. "bottomEndReached", fired when the bottom end of the wrapped element is reached.
       *         4. "leftEndReached", fired when the left end of the wrapped element is reached.
       *         5. "rightEndReached", fired when the right end of the wrapped element is reached.
       *         6. "topEndReached", fired when the top end of the wrapped element is reached.
       *       The key in this object should be the subject of the events which are listed above and the value should be a
       *       function accepting an key-value pair object as the only argument.
       * }
       * </pre>
       */
      initializer: function(objConfig) {
        if ( typeof objConfig === 'undefined' || typeof objConfig.wrappee === 'undefined') {
          throw 'The "wrappee", which is the wrapped element, MUST be provided!';
        }
        var STATIC = this.constructor, _this = this,
        /**
         * The CSS classes used.
         */
        cssClasses = {
          cursorMove: 'cursor-move',
          cursorSeResize: 'cursor-se-resize',
          noUserSelect: 'no-user-select',
          transition: 'transition'
        },
        /**
         * The id of the horizontal bar.
         */
        strHBarIdPrefix = 'h_bar',
        /**
         * The id of the horizontal scroll bar.
         */
        strHScrollBarIdPrefix = 'h_scroll_bar',
        /**
         * The id of the resize knob.
         */
        strResizeKnobIdPrefix = 'resize_knob',
        /**
         * The id of the vertical bar.
         */
        strVBarIdPrefix = 'v_bar',
        /**
         * The id of the vertical scroll bar.
         */
        strVScrollBarIdPrefix = 'v_scroll_bar',
        /**
         * The prefix of the id of the wrapper.
         */
        strWrapperIdPrefix = 'wrapper',
        /**
         * The HTML string of the wrapper element.
         */
        strHtmlWrapper = '<div class="wrapper"></div>',
        /**
         * The HTML string of the bar element in the horizontal scroll bar element.
         */
        strHtmlHBar = '<div class="absolute-position bar h-bar round-corner-3px"' + ( typeof objConfig.strScrollBarColor === 'string' ? ' style="background-color: ' + objConfig.strScrollBarColor + '"' : '') + '></div>',
        /**
         * The HTML string of the horizontal scroll bar element.
         */
        strHtmlHScrollBar = '<div class="absolute-position scroll-bar h-scroll-bar round-corner-3px opaque-6" style="display: none;"></div>',
        /**
         * The HTML string of the knob element, which is actually a point and is used to drag to resize the wrapper if
         * resizing is enabled.
         */
        strHtmlResizeKnob = '<div class="absolute-position bar resize-knob round-corner-3px opaque-6" style="display: none;"></div>',
        /**
         * The HTML string of the bar element in the vertical scroll bar element.
         */
        strHtmlVBar = '<div class="absolute-position bar v-bar round-corner-3px"' + ( typeof objConfig.strScrollBarColor === 'string' ? ' style="background-color: ' + objConfig.strScrollBarColor + '"' : '') + '></div>',
        /**
         * The HTML string of the vertical scroll bar element.
         */
        strHtmlVScrollBar = '<div class="absolute-position scroll-bar v-scroll-bar round-corner-3px opaque-6" style="display: none;"></div>',
        /**
         * The bar element of the horizontal scroll bar element.
         */
        objHBar,
        /**
         * The horizontal scroll bar element.
         */
        objHScrollBar,
        /**
         * The knob element, which is actually a point and is used to drag to resize the wrapper if resizing is
         * enabled.
         */
        objResizeKnob,
        /**
         * The bar element of the vertical scroll bar element.
         */
        objVBar,
        /**
         * The vertical scroll bar element.
         */
        objVScrollBar,
        /**
         * The wrapped element. If the "wrappee" property in the "objConfig" argument is a string, it will be
         * treated as the id of the element which is to be wrapped.
         */
        objWrappee = typeof objConfig.wrappee === 'string' ? $('#' + objConfig.wrappee) : $(objConfig.wrappee),
        /**
         * The wrapper element.
         */
        objWrapper,
        /**
         * How will the wrapped element be moved, either by changing the "left" and "top" or by changing the
         * "transform".
         */
        _numHowToMove = typeof objConfig.numHowToMove === 'number' ? objConfig.numHowToMove : STATIC.MOVE_BY_TRANSFORM,
        /**
         * The maximum height to which the wrapper element can be resized.
         */
        _numMaxHeight = typeof objConfig.numMaxHeight === 'number' ? objConfig.numMaxHeight : STATIC.WRAPPER_MAX_HEIGHT,
        /**
         * The maximum width to which the wrapper element can be resized.
         */
        _numMaxWidth = typeof objConfig.numMaxWidth === 'number' ? objConfig.numMaxWidth : STATIC.WRAPPER_MAX_WIDTH,
        /**
         * The minimum height to which the wrapper element can be resized.
         */
        _numMinHeight = typeof objConfig.numMinHeight === 'number' ? objConfig.numMinHeight : STATIC.WRAPPER_MIN_HEIGHT,
        /**
         * The minimum width to which the wrapper element can be resized.
         */
        _numMinWidth = typeof objConfig.numMinWidth === 'number' ? objConfig.numMinWidth : STATIC.WRAPPER_MIN_WIDTH,
        /**
         * The height of the wrapper element if specified. If undefined, the height of the wrapper element will be the
         * same as the height of the wrapped element before it's wrapped.
         */
        _numWrapperHeight = objConfig.numWrapperHeight,
        /**
         * The width of the wrapper element if specified. If undefined, the width of the wrapper element will be the same as
         * the width of the wrapped element before it's wrapped.
         */
        _numWrapperWidth = objConfig.numWrapperWidth,
        /**
         * Whether the scroll bars are auto hidden after the mouse cursor moves out of the wrapper element.
         */
        _bAutoHide = typeof objConfig.bAutoHide !== 'undefined' ? !!objConfig.bAutoHide : true,
        /**
         * Whether the wrapped element can be dragged.
         */
        _bDraggable = typeof objConfig.bDraggable !== 'undefined' ? !!objConfig.bDraggable : false,
        /**
         * Whether the directions of the scrolling action of the mouse wheel is flipped.
         */
        _bFlipXY = typeof objConfig.bFlipXY !== 'undefined' ? !!objConfig.bFlipXY : false,
        /**
         * Whether the wrapped element will glide for a mount of distance after a drag-and-release action.
         */
        _bGlideable = typeof objConfig.bGlideable !== 'undefined' ? !!objConfig.bGlideable : true,
        /**
         * Whether the horizontal scroll bar is shown when needed.
         */
        _bHorizontalBarVisible = typeof objConfig.bHorizontalBarVisible !== 'undefined' ? !!objConfig.bHorizontalBarVisible : true,
        /**
         * Whether the horizontal scroll is enabled.
         */
        _bHorizontalScrollable = typeof objConfig.bHorizontalScrollable !== 'undefined' ? !!objConfig.bHorizontalScrollable : true,
        /**
         * Whether the scrolling is page by page or continuous.
         */
        _bPageMode = typeof objConfig.bPageMode !== 'undefined' ? !!objConfig.bPageMode : false,
        /**
         * Whether the wrapper element can be resized.
         */
        _bResizeable = typeof objConfig.bResizeable !== 'undefined' ? !!objConfig.bResizeable : false,
        /**
         * Whether the resize knob is visible.
         */
        _bResizeKnobVisisble = typeof objConfig.bResizeKnobVisisble !== 'undefined' ? !!objConfig.bResizeKnobVisisble : false,
        /**
         * Whether the arrow keys can control the scroll of the wrapped element.
         */
        _bScrollableByArrowKeys = typeof objConfig.bScrollableByArrowKeys !== 'undefined' ? !!objConfig.bScrollableByArrowKeys : true,
        /**
         * Whether the user can scroll with the mouse wheel.
         */
        _bScrollableByMouseWheel = typeof objConfig.bScrollableByMouseWheel !== 'undefined' ? !!objConfig.bScrollableByMouseWheel : true,
        /**
         * Whether to use the "transition" property of CSS to make the scrolling smooth.
         */
        _bSmooth = typeof objConfig.bSmooth !== 'undefined' ? !!objConfig.bSmooth : false,
        /**
         * Whether the vertical scroll bar is shown when needed.
         */
        _bVerticalBarVisible = typeof objConfig.bVerticalBarVisible !== 'undefined' ? !!objConfig.bVerticalBarVisible : true,
        /**
         * Whether the horizontal scroll is enabled.
         */
        _bVerticalScrollable = typeof objConfig.bVerticalScrollable !== 'undefined' ? !!objConfig.bVerticalScrollable : true,
        /**
         * A key-value object containing the event handler functions.
         */
        _objEventHandlers = objConfig.objEventHandlers || {},
        /**
         * Whether the scroll bars are being dragged.
         */
        bDraggingScrollBar = false,
        /**
         * Whether the wrapped element is being dragged.
         */
        bDraggingWrappee = false,
        /**
         * Whether the mouse cursor is inside the wrapper element.
         */
        bMouseIn = false,
        /**
         * Whether the wrapper element is being resized.
         */
        bResizing = false,
        /**
         * Whether the bottom end of the wrapped element is reached.
         */
        bBottomEndReached = false,
        /**
         * Whether the left end of the wrapped element is reached.
         */
        bLeftEndReached = false,
        /**
         * Whether the right end of the wrapped element is reached.
         */
        bRightEndReached = false,
        /**
         * Whether the top end of the wrapped element is reached.
         */
        bTopEndReached = false,
        /**
         * The total number of instances of the the class "kl.ScrollBars".
         */
        numInstanceCount,
        /**
         * The id of the queue of functions that affect the horizontal bar.
         */
        strHBarQId = 'h_bar_queue',
        /**
         * The id of the queue of functions that affect the vertical bar.
         */
        strVBarQId = 'v_bar_queue',
        /**
         * The id of the queue of functions that affect the wrapped element.
         */
        strWrappeeQId = 'wrappee_queue',
        /**
         * The key of the window.Timeout invocation which is used to provide a delay before the scroll bars fade out.
         */
        timeoutVisibility,
        /**
         * The height and the width including paddings of the wrapped element before it's wrapped into the wrapper element.
         */
        wrappeeOldSizes = {
          height: objWrappee.innerHeight(),
          width: objWrappee.innerWidth()
        },
        /**
         * Add the CSS "transition" property for the ordinary scrolling functionality.
         *
         * @author Huan Li
         * @param {Boolean} bScrollOnce True if the transition runs only once. False if the transition runs for multiple
         *          times.
         */
        addTransition4Scroll = function(bScrollOnce) {
          $([objWrappee, objHBar, objVBar]).each(function(index, elem) {
            $(elem).css({
              transitionProperty: noTransform() ? 'left, top' : getBrowserSpecificPrefix() + 'transform',
              transitionDuration: ( bScrollOnce ? STATIC.SCROLL_ONCE_TRANSITION_DURATION : STATIC.DEFAULT_TRANSITION_DURATION) + 'ms',
              transitionTimingFunction: 'ease-out'
            });
          });
        },
        /**
         * Add the CSS "transition" property for the gliding effect.
         *
         * @author Huan Li
         * @param {Object} objT A key-value pair object containing the transition durations for both the X and the Y axes.
         * @param {Object} objOutOfRange A key-value pair object containing whether the glide is going beyond the
         *          boundaries of the wrapped element for both the X and the Y axes.
         */
        addTransition4Glide = function(objT, objOutOfRange) {
          var objTransition = {};
          if (noTransform()) {
            objTransition.transitionProperty = 'left, top';
            objTransition.transitionTimingFunction = getBezierCurve(objOutOfRange.x) + ', ' + getBezierCurve(objOutOfRange.y);
          } else {
            objTransition.transitionProperty = getBrowserSpecificPrefix() + 'transform';
            objTransition.transitionTimingFunction = getBezierCurve(objOutOfRange.x || objOutOfRange.y);
          }
          objTransition.transitionDuration = Math.min(objT.x, objT.y) + 'ms';
          $([objWrappee, objHBar, objVBar]).each(function(index, elem) {
            $(elem).css(objTransition);
          });
        },
        /**
         * Add the CSS "transition" property for the scrolling by pages functionality.
         *
         * @author Huan Li
         */
        addTransition4PageScroll = function() {
          $([objWrappee, objHBar, objVBar]).each(function(index, elem) {
            $(elem).css({
              transitionProperty: noTransform() ? 'left, top' : getBrowserSpecificPrefix() + 'transform',
              transitionDuration: STATIC.SCROLL_ONCE_TRANSITION_DURATION + 'ms',
              transitionTimingFunction: 'ease-out'
            });
          });
        },
        /**
         * Append a suffix, which is the total number of the instances of the class "kl.ScrollBars", to the
         * prefix of an id to form a unique id.
         *
         * @author Huan Li
         * @param {String} idPrefix A prefix of an id.
         * @returns {String} The unique id by combining the prefix of the id and the total number of instances.
         */
        appendIdSuffix = function(idPrefix) {
          return idPrefix + '_' + numInstanceCount;
        },
        /**
         * Bars move first and then drive the wrapped element to move accordingly.
         *
         * @author Huan Li
         * @param {Object} objMovement A key-value pair object containing the movement along the X and the Y axes.
         * @param {Boolean} isVBar True if the driving bar is the vertical bar. False if it's the horizontal bar.
         */
        barsDriveWrappee = function(objMovement, isVBar) {
            if (isVBar) {
                vBarDrivesWrappee(objMovement.y);
            } else {
                hBarDrivesWrappee(objMovement.x);
            }
        },
        /**
         * Check on the movement that the objBar is about to make in order to keep it inside the track of scroll bar.
         * Calculation will be performed if necessary.
         *
         * @author Huan Li
         * @param {jQuery} objBar The bar that's about to move.
         * @param {Object} objCoordinate The current position of the objBar and is expressed with the properties "x"
         * and "y" which stand for the coordinates on the X and the Y axes, respectively.
         * @param {Object} objMovement The movement that the objBar is about to make and is expressed with the
         * properties "x" and "y" which stand for how much it moves along the X and the Y axes,
         * respectively.
         * @returns {Object} How much the objBar can move which is expressed with the properties "x" and "y" which
         *          stand for how much it moves along the X and the Y axes, respectively. The maximum movements are
         *          the ones specified by the objMovement argument and if those movements can make the objBar out of
         *          its track of the scroll bar then the return value would be the distance to the farthest position
         *          it can move along the track.
         */
        calcBarBound = function(objBar, objCoordinate, objMovement) {
            var ret = {};
            if (objBar.is(objHBar)) {
                if (objCoordinate.x + objMovement.x < 0) {
                    ret.x = -objCoordinate.x;
                } else if (objCoordinate.x + objMovement.x > objBar.parent().width() - objBar.outerWidth(true)) {
                    ret.x = objBar.parent().width() - (objCoordinate.x + objBar.outerWidth(true));
                } else {
                    ret.x = objMovement.x;
                }
            } else {
                ret.x = 0;
            }
            if (objBar.is(objVBar)) {
                if (objCoordinate.y + objMovement.y < 0) {
                    ret.y = -objCoordinate.y;
                } else if (objCoordinate.y + objMovement.y > objBar.parent().height() - objBar.outerHeight(true)) {
                    ret.y = objBar.parent().height() - (objCoordinate.y + objBar.outerHeight(true));
                } else {
                    ret.y = objMovement.y;
                }
            } else {
                ret.y = 0;
            }
            return ret;
        },
        /**
         * Calculate the shifting of the wrapped element after a dragging action is finished. Because the wrapped element
         * can't go beyond the visible area of the wrapper element so the shifting need to be calculated.
         *
         * @author Huan Li
         * @param {Object} objV0 A key-value pair object containing the initial values of velocity for both the X and the Y
         *          axes.
         * @param {Object} objS A key-value pair object containing the values of shifting calculated from the initial
         *          velocity and the acceleration for both the X and the Y axes.
         * @returns {Object} A key-value pair object containing the values of shifting that are within the boundaries of
         *          the wrapped element for both the X and the Y axes.
         */
        calcGlideShifting = function(objV0, objS) {
          var currentPosition, objNewS = {
            x: objS.x,
            y: objS.y
          };
          if (noTransform()) {
            currentPosition = {
              x: objWrappee.position().left,
              y: objWrappee.position().top
            };
          } else {
            currentPosition = parseTransform(objWrappee.css('transform'));
          }
          if (_bHorizontalScrollable) {
            if (currentPosition.x + objS.x > 0 || currentPosition.x + objS.x < objWrapper.innerWidth() - objWrappee.outerWidth(true)) {
              if (objV0.x > 0) {
                objNewS.x = -currentPosition.x;
              } else {
                objNewS.x = objWrapper.innerWidth() - objWrappee.outerWidth(true) - currentPosition.x;
              }
            }
          }
          if (_bVerticalScrollable) {
            if (currentPosition.y + objS.y > 0 || currentPosition.y + objS.y < objWrapper.innerHeight() - objWrappee.outerHeight(true)) {
              if (objV0.y > 0) {
                objNewS.y = -currentPosition.y;
              } else {
                objNewS.y = objWrapper.innerHeight() - objWrappee.outerHeight(true) - currentPosition.y;
              }
            }
          }
          return objNewS;
        },
        /**
         * Calculate the position of the horizontal bar, i.e. where it should be put in the horizontal scroll bar.
         *
         * @author Huan Li
         * @returns {Number} The position of the horizontal bar in pixels.
         */
        calcHBarPosition = function() {
          var ret, numHRatio = getHorizontalMovementRatio();
          if (isWrappeeOutOfBoundsHorizontally()) {
            ret = objHScrollBar.width() - objHBar.outerWidth(true);
          } else {
            if (noTransform()) {
              ret = -objWrappee.position().left / numHRatio;
            } else {
              ret = -parseTransform(objWrappee.css('transform')).x / numHRatio;
            }
          }
          return ret;
        },
        /**
         * Calculate the width of the horizontal bar. The maximum value is equal to the width of the track of the
         * horizontal scroll bar.
         *
         * @author Huan Li
         * @returns {Number} The width of the horizontal bar.
         */
        calcHBarWidth = function() {
          var ret = objWrapper.width() / objWrappee.outerWidth(true) * objHScrollBar.width();
          if (ret > objHScrollBar.width()) {
            ret = objHScrollBar.width();
          }
          return ret;
        },
        /**
         * Calculate the inertia related data, which are the initial velocity, the time for reducing the velocity to zero
         * and the shifting the wrapped element will make during this time. The acceleration is fixed.
         *
         * @author Huan Li
         * @param {Object} objStartPoint A key-value pair object containing the coordinates and a timestamp of the point
         *          where the wrapped element started moving.
         * @param {Object} objEndPoint A key-value pair object containing the coordinates and a timestamp of the point
         *          where the wrapped element ended moving.
         * @returns {Object} A key-value pair object containing the values of initial velocity, time span of the shifting
         *          and the shifting itself for both the X and the Y axes.
         */
        calcInertia = function(objStartPoint, objEndPoint) {
          var ret, objT, objV0, objS;
          if (objStartPoint && objEndPoint) {
            objV0 = {
              x: (objEndPoint.x - objStartPoint.x) / (objEndPoint.time - objStartPoint.time),
              y: (objEndPoint.y - objStartPoint.y) / (objEndPoint.time - objStartPoint.time)
            };
            objT = {
              x: Math.abs(objV0.x / STATIC.DEFAULT_ACCELERATION),
              y: Math.abs(objV0.y / STATIC.DEFAULT_ACCELERATION)
            };
            objS = {
              x: objV0.x / (2 * STATIC.DEFAULT_ACCELERATION),
              y: objV0.y / (2 * STATIC.DEFAULT_ACCELERATION)
            };
            ret = {
              v0: objV0,
              t: objT,
              s: objS
            };
          }
          return ret;
        },
        /**
         * Calculate the current page numbers.
         *
         * @author Huan Li
         * @returns {Object} A key-value pair object containing the current page numbers both horizontally and vertically.
         */
        calcPageNumber = function() {
          var objCoordinates = noTransform() ? {
            x: objWrappee.position().left,
            y: objWrappee.position().top
          } : parseTransform(objWrappee.css('transform')), objPageSize = {
            x: objWrapper.width(),
            y: objWrapper.height()
          };
          return {
            x: Math.ceil(Math.abs(objCoordinates.x) / objPageSize.x),
            y: Math.ceil(Math.abs(objCoordinates.y) / objPageSize.y)
          };
        },
        /**
         * Calculate the total number of pages.
         *
         * @author Huan Li
         * @returns {Object} A key-value pair object containing the total number of pages both horizontally and vertically.
         */
        calcTotalPageCount = function() {
          var objPageSize = {
            x: objWrapper.width(),
            y: objWrapper.height()
          };
          return {
            x: Math.ceil(objWrappee.outerWidth(true) / objPageSize.x),
            y: Math.ceil(objWrappee.outerHeight(true) / objPageSize.y)
          };
        },
        /**
         * Calculate the width of the vertical bar. The maximum value is equal to the height of the track of the vertical
         * scroll bar.
         *
         * @author Huan Li
         * @returns {Number} The height of the vertical bar.
         */
        calcVBarHeight = function() {
          var ret = objWrapper.height() / objWrappee.outerHeight(true) * objVScrollBar.height();
          if (ret > objVScrollBar.height()) {
            ret = objVScrollBar.height();
          }
          return ret;
        },
        /**
         * Calculate the position of the vertical bar, i.e. where it should be put in the vertical scroll bar.
         *
         * @author Huan Li
         * @returns {Number} The position of the vertical bar in pixels.
         */
        calcVBarPosition = function() {
          var ret, numVRatio = getVerticalMovementRatio();
          if (isWrappeeOutOfBoundsVertically()) {
            ret = objVScrollBar.height() - objVBar.outerHeight(true);
          } else {
            if (noTransform()) {
              ret = -objWrappee.position().top / numVRatio;
            } else {
              ret = -parseTransform(objWrappee.css('transform')).y / numVRatio;
            }
          }
          return ret;
        },
        /**
         * Check on the movement that the wrapped element is about to make in order to keep it inside the range of the
         * wrapper element. Calculation will be performed if necessary.
         *
         * @author Huan Li
         * @param {Object} objCoordinate The current position of the wrapped element and is expressed with the
         *          properties "x" and "y" which stand for the coordinates on the X and the Y axes, respectively.
         * @param {Object} objMovement The movement that the wrapped element is about to make and is expressed with
         *          the properties "x" and "y" which stand for how much it moves along the X and the Y axes,
         *          respectively.
         * @returns {Object} How much the wrapped element can move which is expressed with the properties "x" and "y"
         *          which stand for how much it moves along the X and the Y axes, respectively. The maximum movements
         *          are the ones specified by the objMovement argument and if those movements will make the wrapped
         *          element out of the range of the wrapper element then the return value would be the distance to the
         *          farthest position it can move along the axis.
         */
        calcWrappeeBound = function(objCoordinate, objMovement) {
          var ret = {};
          if (objWrappee.outerWidth(true) > objWrapper.width()) {
            if (objCoordinate.x + objMovement.x > 0) {
              ret.x = -objCoordinate.x;
              bLeftEndReached = true;
            } else if (objCoordinate.x + objMovement.x < objWrapper.width() - objWrappee.outerWidth(true)) {
              ret.x = Math.abs(objCoordinate.x) + objWrapper.width() - objWrappee.outerWidth(true);
              bRightEndReached = true;
            } else {
              ret.x = objMovement.x;
            }
          } else {
            ret.x = 0;
          }
          if (objWrappee.outerHeight(true) > objWrapper.height()) {
            if (objCoordinate.y + objMovement.y > 0) {
              ret.y = -objCoordinate.y;
              bTopEndReached = true;
            } else if (objCoordinate.y + objMovement.y < objWrapper.height() - objWrappee.outerHeight(true)) {
              ret.y = Math.abs(objCoordinate.y) + objWrapper.height() - objWrappee.outerHeight(true);
              bBottomEndReached = true;
            } else {
              ret.y = objMovement.y;
            }
          } else {
            ret.y = 0;
          }
          return ret;
        },
        /**
         * Capitalize the first letter in the string passed in as an argument.
         *
         * @author Huan Li
         * @param {String} strSrc The string whose first letter is to be capitalized.
         * @returns {String} The string value of the argument with the first letter is capitalized.
         */
        capitalizeInitial = function(strSrc) {
          if ( typeof strSrc === 'string') {
            return strSrc.charAt(0).toUpperCase() + strSrc.slice(1);
          }
        },
        /**
         * One of the bars is dragged to move along the track of the scroll bar so that the wrapped element will be
         * scrolled.
         *
         * @author Huan Li
         * @param {jQuery} objBar The bar that's dragged.
         * @param {Object} objMovement The movement that the bar which is dragged will make and is expressed with the
         * properties "x" and "y" which stand for how much it moves along the X and the Y axes, respectively.
         */
        dragScrollBar = function(objBar, objMovement) {
            barsDriveWrappee(objMovement, objBar.is(objVBar));
        },
        /**
         * The wrapped element is dragged to move within the range of the wrapper element and the scroll bars will move
         * accordingly.
         *
         * @author Huan Li
         * @param {Object} objMovement The movement that the bar which is dragged will make and is expressed with the
         *          properties "x" and "y" which stand for how much it moves along the X and the Y axes, respectively.
         */
        dragWrappee = function(objMovement) {
          wrappeeDrivesBars(objMovement, STATIC.MOVEMENT_TRIGGER_ACTION_DRAG);
        },
        /**
         * Invoke the event handler function for handling the event "endReached" which means one of the four ends of
         * the wrapped element has been reached after scrolling.
         *
         * @author Huan Li
         * @param {Object} objShift A key-value pair object containing the values of shifting along both the X and the Y
         *          axes.
         */
        fireEndReached = function(objShift) {
          if ( typeof _this.onEndReached === 'function') {
            _this.onEndReached(STATIC.EVENT_END_REACHED, {
              objWrappee: objWrappee,
              objWrapper: objWrapper,
              objShift: objShift,
              objCoordinates: noTransform() ? {
                x: objWrappee.position().left,
                y: objWrappee.position().top
              } : parseTransform(objWrappee.css('transform')),
              objWhichEndReached: {
                bottom: bBottomEndReached,
                left: bLeftEndReached,
                right: bRightEndReached,
                top: bTopEndReached
              }
            });
          }
        },
        /**
         * Invoke the event handler function for handling the event "bottomEndReached" which means the bottom end of the
         * wrapped element has been reached after scrolling.
         *
         * @author Huan Li
         * @param {Object} objShift A key-value pair object containing the values of shifting along both the X and the Y
         *          axes.
         */
        fireBottomEndReached = function(objShift) {
          if ( typeof _this.onBottomEndReached === 'function') {
            _this.onBottomEndReached(STATIC.EVENT_BOTTOM_END_REACHED, {
              objWrappee: objWrappee,
              objWrapper: objWrapper,
              objShift: objShift,
              objCoordinates: noTransform() ? {
                x: objWrappee.position().left,
                y: objWrappee.position().top
              } : parseTransform(objWrappee.css('transform'))
            });
          }
        },
        /**
         * Invoke the event handler function for handling the event "leftEndReached" which means the left end of the
         * wrapped element has been reached after scrolling.
         *
         * @author Huan Li
         * @param {Object} objShift A key-value pair object containing the values of shifting along both the X and the Y
         *          axes.
         */
        fireLeftEndReached = function(objShift) {
          if ( typeof _this.onLeftEndReached === 'function') {
            _this.onLeftEndReached(STATIC.EVENT_LEFT_END_REACHED, {
              objWrappee: objWrappee,
              objWrapper: objWrapper,
              objShift: objShift,
              objCoordinates: noTransform() ? {
                x: objWrappee.position().left,
                y: objWrappee.position().top
              } : parseTransform(objWrappee.css('transform'))
            });
          }
        },
        /**
         * Invoke the event handler function for handling the event "rightEndReached" which means the right end of the
         * wrapped element has been reached after scrolling.
         *
         * @author Huan Li
         * @param {Object} objShift A key-value pair object containing the values of shifting along both the X and the Y
         *          axes.
         */
        fireRightEndReached = function(objShift) {
          if ( typeof _this.onRightEndReached === 'function') {
            _this.onRightEndReached(STATIC.EVENT_RIGHT_END_REACHED, {
              objWrappee: objWrappee,
              objWrapper: objWrapper,
              objShift: objShift,
              objCoordinates: noTransform() ? {
                x: objWrappee.position().left,
                y: objWrappee.position().top
              } : parseTransform(objWrappee.css('transform'))
            });
          }
        },
        /**
         * Invoke the event handler function for handling the event "topEndReached" which means the top end of the wrapped
         * element has been reached after scrolling.
         *
         * @author Huan Li
         * @param {Object} objShift A key-value pair object containing the values of shifting along both the X and the Y
         *          axes.
         */
        fireTopEndReached = function(objShift) {
          if ( typeof _this.onTopEndReached === 'function') {
            _this.onTopEndReached(STATIC.EVENT_TOP_END_REACHED, {
              objWrappee: objWrappee,
              objWrapper: objWrapper,
              objShift: objShift,
              objCoordinates: noTransform() ? {
                x: objWrappee.position().left,
                y: objWrappee.position().top
              } : parseTransform(objWrappee.css('transform'))
            });
          }
        },
        /**
         * Invoke the event handler function for handling the event "scrolled" which means the wrapped element has just
         * been scrolled once.
         *
         * @author Huan Li
         * @param {Object} objShift A key-value pair object containing the values of shifting along both the X and the Y
         *          axes.
         * @param {String} strTriggerAction A string describing the trigger action of the scrolling that was just done.
         */
        fireScrolled = function(objShift, strTriggerAction) {
          if ( typeof _this.onScrolled === 'function') {
            _this.onScrolled(STATIC.EVENT_SCROLLED, {
              objWrappee: objWrappee,
              objWrapper: objWrapper,
              objShift: objShift,
              objCoordinates: noTransform() ? {
                x: objWrappee.position().left,
                y: objWrappee.position().top
              } : parseTransform(objWrappee.css('transform')),
              strTriggerAction: strTriggerAction
            });
          }
        },
        /**
         * Get the corresponding Bezier Curve based on whether there will be a bouncing back effect.
         *
         * @author Huan Li
         * @param {Boolean} bBounce True if the bouncing effect is required. False otherwise.
         * @returns {String} The value of the CSS "transition-timing-function" property.
         */
        getBezierCurve = function(bBounce) {
          var ret = STATIC.BEZIER_CURVE_NO_BOUNCE;
          if (bBounce) {
            ret = STATIC.BEZIER_CURVE_BOUNCE;
          }
          return ret;
        },
        /**
         * Get the browser specific prefix for CSS properties by using browser sniffing.
         *
         * @author Huan Li
         * @returns {String} The browser specific prefix for CSS properties.
         */
        getBrowserSpecificPrefix = function() {
          var ret = '', userAgent = navigator.userAgent.toLowerCase(), match = /(webkit)[ \/]([\w.]+)/.exec(userAgent) || /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(userAgent) || /(msie) ([\w.]+)/.exec(userAgent) || !/compatible/.test(userAgent) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(userAgent) || [], browserName = match[1];
          if (browserName === 'mozilla') {
            ret = '-moz-';
          } else if (browserName === 'webkit') {
            ret = '-webkit-';
          } else if (browserName === 'msie') {
            ret = '-ms-';
          } else if (browserName === 'opera') {
            ret = '-o-';
          }
          return ret;
        },
        /**
         * Get the appropriate event subject for the device on which the browser is running.
         *
         * @author Huan Li
         * @param {String} strEventType The type of the event. It can be anyone of STATIC.EVENT_TYPE_START,
         *          STATIC.EVENT_TYPE_MOVE, STATIC.EVENT_TYPE_END or STATIC.EVENT_TYPE_CANCEL
         * @returns {String} The event subject of the corresponding event type.
         */
        getEventSubject = function(strEventType) {
          switch(strEventType) {
            case STATIC.EVENT_TYPE_START:
              return isTouchable() ? STATIC.EVENT_TOUCH_START : STATIC.EVENT_MOUSE_DOWN;
            case STATIC.EVENT_TYPE_MOVE:
              return isTouchable() ? STATIC.EVENT_TOUCH_MOVE : STATIC.EVENT_MOUSE_MOVE;
            case STATIC.EVENT_TYPE_END:
              return isTouchable() ? STATIC.EVENT_TOUCH_END : STATIC.EVENT_MOUSE_UP;
            case STATIC.EVENT_TYPE_CANCEL:
              return isTouchable() ? STATIC.EVENT_TOUCH_CANCEL : STATIC.EVENT_MOUSE_UP;
            default:
              return strEventType;
          }
        },
        /**
         * Get the ratio of the distance that the wrapped element can be moved horizontally to the distance that
         * the horizontal bar can be moved.
         * <b>Please beware that this ratio is the one of the wrapped element to the horizontal bar.</b>
         *
         * @author Huan Li
         * @returns {Number} The ratio of the distance that the wrapped element can be moved horizontally to the
         *          distance that the horizontal bar can be moved.
         */
        getHorizontalMovementRatio = function() {
          return (objWrappee.outerWidth(true) - objWrapper.width()) / (objHScrollBar.width() - objHBar.outerWidth(true));
        },
        /**
         * Get the height of the horizontal scroll bar. If it's hidden the result will be 0.
         *
         * @author Huan Li
         * @returns {Number} The height of the horizontal scroll bar. 0 will be returned if it's hidden.
         */
        getHScrollBarHeight = function() {
          return shouldShowHorizontalScrollBar() || _bResizeable ? objHScrollBar.outerHeight(true) : 0;
        },
        /**
         * Get the position of an element relative to the wrapped element.
         *
         * @author Huan Li
         * @param {String|HTMLElement|jQuery} element An element of which the position that's relative to the wrapped
         *          element is to be retrieved.
         * @returns {Object} The key-value pair object containing the x and y coordinates of the element.
         */
        getPositionToWrappee = function(element) {
          var ret = {
            x: 0,
            y: 0
          }, objPosition, objParentsPosition;
          if (element) {
            element = $(element);
            if (!$(element).is(objWrappee)) {
              objParentsPosition = getPositionToWrappee($(element).offsetParent());
              objPosition = $(element).position();
              ret = {
                x: objParentsPosition.x + objPosition.left,
                y: objParentsPosition.y + objPosition.top
              };
            }
          }
          return ret;
        },
        /**
         * Get the ratio of the distance that the wrapped element can be moved vertically to the distance that
         * the vertical bar can be moved.
         * <b>Please beware that this ratio is the one of the wrapped element to the horizontal bar.</b>
         *
         * @author Huan Li
         * @returns {Number} The ratio of the distance that the wrapped element can be moved vertically to the
         *          distance that the vertical bar can be moved.
         */
        getVerticalMovementRatio = function() {
          return (objWrappee.outerHeight(true) - objWrapper.height()) / (objVScrollBar.height() - objVBar.outerHeight(true));
        },
        /**
         * Get the height of the vertical scroll bar. If it's hidden the result will be 0.
         *
         * @author Huan Li
         * @returns {Number} The height of the vertical scroll bar. 0 will be returned if it's hidden.
         */
        getVScrollBarWidth = function() {
          return shouldShowVerticalScrollBar() || _bResizeable ? objVScrollBar.outerWidth(true) : 0;
        },
        /**
         * Get the value of the id attribute of the wrapper element.
         *
         * @author Huan Li
         * @returns {String} The value of the "id" attribute of the wrapper element.
         */
        getWrapperId = function() {
          return objWrapper.attr('id');
        },
        /**
         * Get the X coordinate of the mouse cursor or the touch depending on the device used.
         *
         * @author Huan Li
         * @param {Event} evt The mouse event or the touch event depending on the device used.
         * @returns {Number} The X coordinate of the mouse cursor or the touch depending on the device used.
         */
        getXCoordinate = function(evt) {
          var ret;
          if (isTouchable()) {
            ret = evt.originalEvent.changedTouches.item(0).clientX;
          } else {
            ret = evt.pageX;
          }
          return ret;
        },
        /**
         * Get the Y coordinate of the mouse cursor or the touch depending on the device used.
         *
         * @author Huan Li
         * @param {Event} evt The mouse event or the touch event depending on the device used.
         * @returns {Number} The Y coordinate of the mouse cursor or the touch depending on the device used.
         */
        getYCoordinate = function(evt) {
          var ret;
          if (isTouchable()) {
            ret = evt.originalEvent.changedTouches.item(0).clientY;
          } else {
            ret = evt.pageY;
          }
          return ret;
        },
        /**
         * Continue to move the wrapped element for a mount of distance after the mouse button is released after a
         * dragging action.
         *
         * @author Huan Li
         * @param {Object} objStartPoint A key-value pair object containing the coordinates and a timestamp of the
         *          point where the wrapped element started moving.
         * @param {Object} objEndPoint A key-value pair object containing the coordinates and a timestamp of the
         *          point where the wrapped element ended moving.
         */
        glide = function(objStartPoint, objEndPoint) {
          //@formatter:off
          var objInertia = calcInertia(objStartPoint, objEndPoint),
          objV0 = objInertia.v0,
          objS = objInertia.s,
          objT = objInertia.t,
          objNewS = calcGlideShifting(objV0, objS),
          objOutOfRange = {
            x: objS.x !== objNewS.x,
            y: objS.y !== objNewS.y
          },
          objNewT = {
            x: Math.max(objOutOfRange.x ? 2 * objNewS.x / objV0.x : objT.x, STATIC.MINIMUM_TRANSITION_TIME),
            y: Math.max(objOutOfRange.y ? 2 * objNewS.y / objV0.y : objT.y, STATIC.MINIMUM_TRANSITION_TIME)
          };
          //@formatter:on
          addTransition4Glide(objNewT, objOutOfRange);
          wrappeeDrivesBars(objNewS, STATIC.MOVEMENT_TRIGGER_ACTION_GLIDE);
        },
        /**
         * Handle the event fired when arrow keys are held down. The wrapped element will be scrolled when an arrow key is
         * held down.
         *
         * @author Huan Li
         * @param {Event} evt The event fired when arrow keys are held down.
         */
        handleArrowKeysDown = function(evt) {
          if (bMouseIn) {
            switch(evt.keyCode) {
              case STATIC.CODE_DOWN_ARROW_KEY:
                wrappeeDrivesBars({
                  x: 0,
                  y: -1 * STATIC.SHIFTING_BY_ARROW_KEYS
                }, STATIC.MOVEMENT_TRIGGER_ACTION_ARROW_KEY_DOWN);
                break;
              case STATIC.CODE_LEFT_ARROW_KEY:
                wrappeeDrivesBars({
                  x: STATIC.SHIFTING_BY_ARROW_KEYS,
                  y: 0
                }, STATIC.MOVEMENT_TRIGGER_ACTION_ARROW_KEY_LEFT);
                break;
              case STATIC.CODE_RIGHT_ARROW_KEY:
                wrappeeDrivesBars({
                  x: -1 * STATIC.SHIFTING_BY_ARROW_KEYS,
                  y: 0
                }, STATIC.MOVEMENT_TRIGGER_ACTION_ARROW_KEY_RIGHT);
                break;
              case STATIC.CODE_UP_ARROW_KEY:
                wrappeeDrivesBars({
                  x: 0,
                  y: STATIC.SHIFTING_BY_ARROW_KEYS
                }, STATIC.MOVEMENT_TRIGGER_ACTION_ARROW_KEY_UP);
                break;
            }
          }
        },
        /**
         * Handle the event fired when the mouse is up after dragging the scroll bars to stop the wrapped element
         * moving as the mouse cursor moves.
         *
         * @author Huan Li
         * @param {Event} event The event fired when the mouse is up after dragging the scroll bars.
         */
        handleEndDragScrollBars = function(event) {
            $(document).off('mousemove', handleMoveDragScrollBars);
            $(document).off('mouseup', handleEndDragScrollBars);
        },
        /**
         * Handle the event fired when the left button of the mouse is released after dragging the horizontal bar so
         * as to
         * stop the horizontal bar moving as the mouse cursor moves.
         *
         * @author Huan Li
         * @param {Event} evt The event fired when the left button of the mouse is released after dragging the
         * horizontal
         *          bar.
         */
        handleEndDragHBar = function(evt) {
            if (bDraggingScrollBar) {
                bDraggingScrollBar = false;
                $(document).off('mousemove', handleMoveDragHBar);
                if (_bAutoHide) {
                    observeScrollBarsVisibility();
                    if (!bMouseIn) {
                        hideScrollBars();
                    }
                }
                if (_bSmooth) {
                    resumeTransition(objHBar, objWrappee);
                }
                $(document).off('mouseup', handleEndDragHBar);
            }
        },
        /**
         * Handle the event fired when the left button of the mouse is released after dragging the vertical bar so as
         * to
         * stop the vertical bar moving as the mouse cursor moves.
         *
         * @author Huan Li
         * @param {Event} evt The event fired when the left button of the mouse is released after dragging the
         * vertical
         *          bar.
         */
        handleEndDragVBar = function(evt) {
            if (bDraggingScrollBar) {
                bDraggingScrollBar = false;
                $(document).off('mousemove', handleMoveDragVBar);
                if (_bAutoHide) {
                    observeScrollBarsVisibility();
                    if (!bMouseIn) {
                        hideScrollBars();
                    }
                }
                if (_bSmooth) {
                    resumeTransition(objVBar, objWrappee);
                }
                $(document).off('mouseup', handleEndDragVBar);
            }
        },
        /**
         * Handle the event fired when the left button of the mouse is released after resizing the wrapper element so as to
         * stop the wrapper element resizing as the mouse cursor moves.
         *
         * @author Huan Li
         * @param {Event} evt The event fired when the left button of the mouse is released after resizing the wrapper
         *          element.
         */
        handleEndDragToResize = function(evt) {
          if (bResizing) {
            bResizing = false;
            $(document).off(getEventSubject(STATIC.EVENT_TYPE_MOVE), handleMoveDragToResize);
            $(document).off(getEventSubject(STATIC.EVENT_TYPE_END), handleEndDragToResize);
          }
        },
        /**
         * Handle the event fired when the left button of the mouse is released after dragging the wrapped element so as to
         * stop the wrapped element moving as the mouse cursor moves.
         *
         * @author Huan Li
         * @param {Event} evt The event fired when the left button of the mouse is released after dragging the wrapped
         *          element.
         */
        handleEndDragWrappee,
        /**
         * Handle the event fired when the mouse cursor enters the wrapper element so as to show the scroll bars.
         *
         * @author Huan Li
         * @param {Event} evt The event fired when the mouse cursor enters the wrapper element.
         */
        handleMouseEnterScrollBarsVisibility = function(evt) {
          showScrollBars();
        },
        /**
         * Handle the event fired when the mouse cursor leaves the wrapper element so as to hide the scroll bars.
         *
         * @author Huan Li
         * @param {Event} evt The event fired when the mouse cursor leaves the wrapper element.
         */
        handleMouseLeaveScrollBarsVisibility = function(evt) {
          hideScrollBars();
        },
        /**
         * Handle the event fired when the mouse moves while the mouse is dragging the scroll bars.
         *
         * The implementation of this function is inside the "handleStartDragScrollBars" function because it needs
         * the x and y coordinates which can only be obtained inside the "handleStartDragScrollBars" function.
         */
        handleMoveDragScrollBars,
        /**
         * Handle the event fired when the mouse moves while the left button is held down on the horizontal bar so
         * that
         * the horizontal bar can move as the mouse moves.
         *
         * The implementation of this function is inside the horizontal bar's mousedown event's handler because it
         * needs
         * the x and y coordinates which can only be obtained inside the horizontal bar's mousedown event's handler.
         */
        handleMoveDragHBar,
        /**
         * Handle the event fired when the mouse moves while the left button is held down on the vertical bar so that
         * the
         * vertical bar can move as the mouse moves.
         *
         * The implementation of this function is inside the vertical bar's mousedown event's handler because it
         * needs
         * the x and y coordinates which can only be obtained inside the vertical bar's mousedown event's handler.
         */
        handleMoveDragVBar,
        /**
         * Handle the event fired when the mouse moves while the left button is held down on the resize knob so that the
         * wrapper element is resized as the mouse moves.
         *
         * The implementation of this function is inside the "handleStartDragToResize" function because it needs the x
         * and y coordinates which can only be obtained inside the "handleStartDragToResize" function.
         */
        handleMoveDragToResize,
        /**
         * Handle the event fired when the mouse moves while the left button is held down on the wrapped element so that
         * the wrapped element can move as the mouse moves.
         *
         * The implementation of this function is inside the "handleStartDragWrappee" function because it needs the x
         * and y coordinates which can only be obtained inside the "handleStartDragWrappee" function.
         */
        handleMoveDragWrappee,
        /**
         * Handle the event fired when the mouse cursor hovers on the wrapped element. Change the mouse cursor to a hand
         * which indicates draggable when the wrapped element is set to be draggable.
         *
         * @author Huan Li
         * @param {Event} evt The event fired when the mouse cursor hovers on the wrapped element.
         */
        handleMouseOverDragWrappee = function(evt) {
          if (_bDraggable) {
            objWrappee.addClass(cssClasses.cursorMove);
          }
        },
        /**
         * Handle the vent fired when the scroll bars are dragged back and forth so the wrapped element will move as
         * the scroll bars are dragged around.
         *
         * @author Huan Li
         * @param {Event} event The event fired when the mouse is down when the cursor hovers on the scroll bars.
         */
        handleStartDragScrollBars = function(event) {
            var oldX = getXCoordinate(event), oldY = getYCoordinate(event);
            event.preventDefault();
            /**
             * Handle the event fired when the mouse moves while the mouse is dragging the scroll bars.
             *
             * @author Huan Li
             * @param {Event} evt
             */
            handleMoveDragScrollBars = function(evt) {

            };
            $(document).mousemove(handleMoveDragScrollBars);
            $(document).mouseup(handleEndDragScrollBars);
        },
        /**
         * Handle the event fired when the left button of the mouse is held down on the resize knob. Also register an
         * event handler to handle the move of the mouse when the left button is held down on the resize knob so that the
         * wrapper element is resized as the mouse cursor moves. Finally unregister the event handler when the left button
         * of the mouse is released.
         *
         * @author Huan Li
         * @param {Event} evt The event fired when the left button of the mouse is held down on the resize knob.
         */
        handleStartDragToResize = function(evt) {
          var oldX = getXCoordinate(evt), oldY = getYCoordinate(evt);
          evt.preventDefault();
          bResizing = true;
          /**
           * Handle the event fired when the mouse moves while the left button is held down on the resize knob so that the
           * wrapper element is resized as the mouse moves.
           *
           * This function was declared outside the "handleStartDragToResize" function because it needs to be called by
           * other functions which are at the same level as the "handleStartDragToResize" function is, and is
           * implemented here because it needs the x and y coordinates which can only be obtained inside the
           * "handleStartDragToResize" function.
           *
           * @author Huan Li
           * @param {Object} objPosition The x and y coordinates of the mouse cursor when the left button of the mouse is
           *          held down on the resize knob.
           * @param {Event} event The event fired when the mouse moves while the left button has been keeping held down on
           *          the resize knob.
           */
          handleMoveDragToResize = function(event) {
            event.preventDefault();
            resizeWrapper({
              x: getXCoordinate(event) - oldX,
              y: getYCoordinate(event) - oldY
            });
            oldX = getXCoordinate(event);
            oldY = getYCoordinate(event);
          };
          $(document).mousemove(handleMoveDragToResize);
          $(document).mouseup(handleEndDragToResize);
        },
        /**
         * Handle the event fired when the left button of the mouse is held down on the wrapped element. Also register an
         * event handler to handle the move of the mouse when the left button is held down on the wrapped element so that
         * the wrapped element can move as the mouse moves. Finally unregister the event handler when the left button of
         * the mouse is released.
         *
         * @author Huan Li
         * @param {Event} evt The event fired when the left button of the mouse is held down on the wrapped element.
         */
        handleStartDragWrappee = function(evt) {
          var timer;
          evt.preventDefault();
          bDraggingWrappee = true;
          if (noTransform()) {
            objWrappee.css({
              left: objWrappee.position().left,
              top: objWrappee.position().top
            });
          } else {
            objWrappee.css('transform', toTransformString(parseTransform(objWrappee.css('transform'))));
          }
          removeTransition();
          objDragWrappeeStart = {
            left: getXCoordinate(evt),
            top: getYCoordinate(evt),
            time: new Date().getTime()
          };
          if (_bAutoHide) {
            unobserveScrollBarsVisibility();
          }
          /**
           * Handle the event fired when the mouse moves while the left button is held down on the wrapped element so that
           * the wrapped element can move as the mouse moves.
           *
           * This function was declared outside the "handleStartDragWrappee" function because it needs to be called by
           * other functions which are at the same level as the "handleStartDragWrappee" function is, and is
           * implemented here because it needs the x and y coordinates which can only be obtained inside the
           * "handleStartDragWrappee" function.
           *
           * @author Huan Li
           * @param {Object} objPosition The x and y coordinates of the mouse cursor when the left button of the mouse is
           *          held down on the wrapped element.
           * @param {Event} event The event fired when the mouse moves while the left button has been keeping held down on
           *          the wrapped element.
           */
          handleMoveDragWrappee = (function(objPosition, event) {
            timer = new Date().getTime();
            event.preventDefault();
            dragWrappee({
              x: getXCoordinate(event) - objPosition.x,
              y: getYCoordinate(event) - objPosition.y
            });
            objPosition.x = getXCoordinate(event);
            objPosition.y = getYCoordinate(event);
          }).bind(null, {
            x: getXCoordinate(evt),
            y: getYCoordinate(evt)
          });
          /**
           * Handle the event fired when the left button of the mouse is released after dragging the wrapped element so as
           * to stop the wrapped element moving as the mouse cursor moves.
           *
           * @author Huan Li
           * @param {Object} objStartPoint
           * @param {Event} event The event fired when the left button of the mouse is released after dragging the wrapped
           *          element.
           */
          handleEndDragWrappee = (function(objStartPoint, event) {
            if (bDraggingWrappee) {
              var objEndPoint = {
                x: getXCoordinate(event),
                y: getYCoordinate(event),
                time: (new Date()).getTime()
              };
              bDraggingWrappee = false;
              $(document).off(getEventSubject(STATIC.EVENT_TYPE_MOVE), handleMoveDragWrappee);
              $(document).off(getEventSubject(STATIC.EVENT_TYPE_END), handleEndDragWrappee);
              if (_bAutoHide) {
                observeScrollBarsVisibility();
                if (!bMouseIn) {
                  hideScrollBars();
                }
              }
              if (_bPageMode) {
                if (new Date().getTime() - timer > STATIC.END_DRAG_TIMEOUT) {
                  scrollByPage();
                } else {
                  scrollOnePage({
                    left: objStartPoint.x === objEndPoint.x ? 0 : (objStartPoint.x > objEndPoint.x),
                    up: objStartPoint.y === objEndPoint.y ? 0 : (objStartPoint.y > objEndPoint.y)
                  });
                }
              } else {
                if (new Date().getTime() - timer > STATIC.END_DRAG_TIMEOUT) {
                  if (_bSmooth) {
                    resumeTransition4Scroll(objWrappee, objHBar, objVBar);
                  } else {
                    removeTransition();
                  }
                } else {
                  if (_bGlideable) {
                    glide(objStartPoint, objEndPoint);
                  }
                }
              }
            }
          }).bind(null, {
            x: getXCoordinate(evt),
            y: getYCoordinate(evt),
            time: new Date().getTime()
          });
          $(document).on(getEventSubject(STATIC.EVENT_TYPE_MOVE), handleMoveDragWrappee);
          $(document).on(getEventSubject(STATIC.EVENT_TYPE_END), handleEndDragWrappee);
        },
        /**
         * Handle the event fired when a CSS transition ends.
         *
         * @author Huan Li
         */
        handleTransitionEnd = function(event) {
          if (_bSmooth) {
            resumeTransition4Scroll();
          } else {
            removeTransition();
          }
        },
        /**
         * Move the horizontal bar to a distance as long as numXMovement because of user triggered events, either
         * dragging the scroll bar or scrolling the mouse wheel. Then move the wrapped element accordingly based on
         * how much the scroll bar has moved.
         *
         * @author Huan Li
         * @param {Number} numXMovement How much the horizontal scroll bar has moved.
         */
        hBarDrivesWrappee = function(numXMovement) {
            var numHRatio = getHorizontalMovementRatio();
            moveHBar(numXMovement);
            moveWrappee(keepWrappeeInBound({
                x: -numXMovement * numHRatio,
                y: 0
            }));
        },
        /**
         * Hide the scroll bars based on the configurations.
         *
         * @author Huan Li
         */
        hideScrollBars = function() {
          timeoutVisibility = window.setTimeout(function() {
            if (shouldShowHorizontalScrollBar()) {
              objHScrollBar.fadeOut('fast');
            }
            if (shouldShowVerticalScrollBar()) {
              objVScrollBar.fadeOut('fast');
            }
            if ((shouldShowHorizontalScrollBar() && shouldShowVerticalScrollBar()) || _bResizeable) {
              objResizeKnob.fadeOut('fast');
            }
            timeoutVisibility = null;
          }, STATIC.TIMEOUT_SCROLL_BARS_VISIBILITY);
        },
        /**
         * Initialize the scroll bars on the web page.
         *
         * @author Huan Li
         */
        initialize = function() {
          setInstanceCount();
          wrap();
          observeMouseHoversWrapper();
          observeDragScrollBars();
          if (_bAutoHide) {
            observeScrollBarsVisibility();
          } else {
            showScrollBars();
          }
          if (_bScrollableByMouseWheel) {
            observeMouseWheel();
          }
          if (_bDraggable) {
            observeDragWrappee();
          }
          if (_bScrollableByArrowKeys) {
            observeArrowKeys();
          }
          if (_bResizeable) {
            observeDragToResize();
          }
          if (_bSmooth) {
            addTransition4Scroll();
          }
          observeTransitionEnd();
          prepareCustomEventHandlers();
        },
        /**
         * Tell if the browser that's displaying the web page is on a touchable device.
         *
         * @author Huan Li
         * @returns {Boolean} True if the device is touchable. False otherwise.
         */
        isTouchable = function() {
          return typeof window.ontouchstart !== 'undefined';
        },
        /**
         * Tell if the wrapped element's left or right border is moved into the visible part of the wrapper element.
         * Because the visible part of the wrapper element, which is the part inside the rectangle of the wrapper
         * element, is supposed to show only the content of the wrapped element. So either the left or the right
         * border of the wrapped element must not be moved inside the visible part of the wrapper element.
         *
         * @author Huan Li
         * @returns {Boolean} True if the wrapped element is out of bounds horizontally. False otherwise.
         */
        isWrappeeOutOfBoundsHorizontally = function() {
          var ret = false;
          if (noTransform()) {
            if (Math.abs(objWrappee.left) + objWrapper.width() > objWrappee.outerWidth(true)) {
              ret = true;
            }
          } else {
            if (Math.abs(parseTransform(objWrappee.css('transform')).x) + objWrapper.width() > objWrappee.outerWidth(true)) {
              ret = true;
            }
          }
          return ret;
        },
        /**
         * Tell if the wrapped element's top or bottom border is moved into the visible part of the wrapper element.
         * Because the visible part of the wrapper element, which is the part inside the rectangle of the wrapper
         * element, is supposed to show only the content of the wrapped element. So either the top or the bottom
         * border of the wrapped element must not be moved inside the visible part of the wrapper element.
         *
         * @author Huan Li
         * @returns {Boolean} True if the wrapped element is out of bounds vertically. False otherwise.
         */
        isWrappeeOutOfBoundsVertically = function() {
          var ret = false;
          if (noTransform()) {
            if (Math.abs(objWrappee.top) + objWrapper.height() > objWrappee.outerHeight(true)) {
              ret = true;
            }
          } else {
            if (Math.abs(parseTransform(objWrappee.css('transform')).y) + objWrapper.height() > objWrappee.outerHeight(true)) {
              ret = true;
            }
          }
          return ret;
        },
        /**
         * Keep one of the bars inside the visible part of its parent scroll bar track, which is the round-cornered
         * rectangle of the scroll bar.
         *
         * @author Huan Li
         * @param {jQuery} objBar The bar that's going to be moved.
         * @param {Object} objMovement A key-value pair object containing the movement, which is supposedly going to
         *          be made to one of the bars, along the X and the Y axes.
         * @returns {Object} A key-value pair object containing the movement, which is actually going to be made to
         *          one of the bars, along the X and the Y axes.
         */
        keepBarInBound = function(objBar, objMovement) {
            var ret, objTransform;
            if (_numHowToMove === STATIC.MOVE_BY_POSITION) {
                ret = calcBarBound(objBar, {
                    x: objBar.position().left,
                    y: objBar.position().top
                }, objMovement);
            } else {
                objTransform = parseTransform(objBar.css('transform'));
                ret = calcBarBound(objBar, objTransform, objMovement);
            }
            return ret;
        },
        /**
         * Keep the numbers of pages in the range of the total page numbers both horizontally and vertically. If the
         * number is out of bounds it'll be changed to the biggest page number. Otherwise it's left untouched.
         *
         * @author Huan Li
         * @param {Object} objPageCount A key-value pair object containing the numbers of pages which are going to be
         *          tested for out-of-bounds exceptions.
         * @returns {Object} A key-value pair object containing the numbers of pages which are tested to be in the range
         *          of the total page numbers.
         */
        keepPageCountInBound = function(objPageCount) {
          var ret = objPageCount, objCurrentPageNumber = calcPageNumber(), objTotalPageCount = calcTotalPageCount();
          ret.x = ret.x > 0 ? Math.min(ret.x, objTotalPageCount.x - objCurrentPageNumber.x) : Math.max(ret.x, -(objCurrentPageNumber.x));
          ret.y = ret.y > 0 ? Math.min(ret.y, objTotalPageCount.y - objCurrentPageNumber.y) : Math.max(ret.y, -(objCurrentPageNumber.y));
          return ret;
        },
        /**
         * Keep the wrapped element's content inside the visible part, which is the part inside the rectangle, of the
         * wrapper element.
         *
         * @author Huan Li
         * @param {Object} objMovement A key-value pair object containing the movement, which is supposedly going to
         *          be made to the wrapped element, along the X and the Y axes.
         * @returns {Object} A key-value pair object containing the movement, which is actually going to be made to
         *          the wrapped element, along the X and the Y axes.
         */
        keepWrappeeInBound = function(objMovement) {
          var ret, objTransform;
          if (noTransform()) {
            ret = calcWrappeeBound({
              x: objWrappee.position().left,
              y: objWrappee.position().top
            }, objMovement);
          } else {
            objTransform = parseTransform(objWrappee.css('transform'));
            ret = calcWrappeeBound(objTransform, objMovement);
          }
          return ret;
        },
        /**
         * Move a target element by changing its CSS position properties which are normally the "left" and the "top".
         *
         * @author Huan Li
         * @param {jQuery} objTarget The target element that's going to be moved.
         * @param {Object} objMovement A key-value pair object containing the movement along the X and the Y axes.
         */
        moveByPosition = function(objTarget, objMovement) {
          if (objMovement.x !== 0 || objMovement.y !== 0) {
            //@formatter:off
            var newLeft = objTarget.position().left + objMovement.x,
                newTop = objTarget.position().top + objMovement.y,
                objNewPosition = {
                  left: newLeft,
                  top: newTop
                };
            //@formatter:on
            objTarget.css(objNewPosition);
          }
        },
        /**
         * Move a target element by changing its CSS "transform" property, which is introduced in CSS3.
         *
         * @author Huan Li
         * @param {Object} objTarget The target element that's going to be moved.
         * @param {Object} objMovement A key-value pair object containing the movement along the X and the Y axes.
         */
        moveByTransform = function(objTarget, objMovement) {
          if (objMovement.x !== 0 || objMovement.y !== 0) {
            var objTransform = parseTransform(objTarget.css('transform'));
            objTransform.x += parseFloat(objMovement.x);
            objTransform.y += parseFloat(objMovement.y);
            objTarget.css('transform', toTransformString(objTransform));
          }
        },
        /**
         * Move the horizontal bar.
         *
         * @author Huan Li
         * @param {Number} numXMovement How much the horizontal bar is going to be moved along the X axis.
         */
        moveHBar = function(numXMovement) {
            var _objMovement = keepBarInBound(objHBar, {
                x: numXMovement,
                y: 0
            });
            if (_numHowToMove === STATIC.MOVE_BY_POSITION) {
                moveByPosition(objHBar, _objMovement);
            } else {
                moveByTransform(objHBar, _objMovement);
            }
        },
        /**
         * Move the vertical bar.
         *
         * @author Huan Li
         * @param {Number} numYMovement How much the vertical bar is going to be moved along the Y axis.
         */
        moveVBar = function(numYMovement) {
            var _objMovement = keepBarInBound(objVBar, {
                x: 0,
                y: numYMovement
            });
            if (_numHowToMove === STATIC.MOVE_BY_POSITION) {
                moveByPosition(objVBar, _objMovement);
            } else {
                moveByTransform(objVBar, _objMovement);
            }
        },
        /**
         * Move the wrapped element.
         *
         * @author Huan Li
         * @param {Object} objMovement A key-value pair object containing the movement, which is going to be made to
         *          the wrapped element, along the X and the Y axes.
         */
        moveWrappee = function(objMovement) {
          if (!_bHorizontalScrollable) {
            objMovement.x = 0;
          }
          if (!_bVerticalScrollable) {
            objMovement.y = 0;
          }
          if (noTransform()) {
            moveByPosition(objWrappee, objMovement);
          } else {
            moveByTransform(objWrappee, objMovement);
          }
        },
        /**
         * Tell if the CSS "transform" property is used to do the movement.
         *
         * @author Huan Li
         * @returns {Boolean} True if the CSS "transform" property is not used, which means the CSS properties "left"
         *          and "top" are used. False otherwise.
         */
        noTransform = function() {
          return _numHowToMove === STATIC.MOVE_BY_POSITION;
        },
        /**
         * Register an event handler to handle the pressing of arrow keys. The wrapped element will be scrolled when an
         * arrow key is pressed.
         *
         * @author Huan Li
         */
        observeArrowKeys = function() {
          $(document).on('keydown', handleArrowKeysDown);
        },
        /**
         * Register event handlers to handler the dragging action on the scroll bars. The wrapped element will be
         * scrolled as the scroll bars are dragged around.
         */
        observeDragScrollBars = function() {
            if (_bVerticalScrollable) {
                observeDragVBar();
            }
            if (_bHorizontalScrollable) {
                observeDragHBar();
            }
        },
        /**
         * Register event handlers to handle the dragging action on the horizontal bar so that it moves as the mouse
         * moves if the left button of the mouse is being held down on the horizontal bar. Finally unregister the
         * event
         * handlers which were just registered when the left button of the mouse is released.
         *
         * @author Huan Li
         */
        observeDragHBar = function() {
            objHBar.mousedown(function(evt) {
                evt.preventDefault();
                bDraggingScrollBar = true;
                if (_bSmooth) {
                    removeTransition();
                }
                if (_bAutoHide) {
                    unobserveScrollBarsVisibility();
                }
                /**
                 * Handle the event fired when the mouse moves while the left button is held down on the horizontal
                 * bar so that
                 * the horizontal bar can move as the mouse moves.
                 *
                 * This function was declared outside the horizontal bar's mousedown event's handler because it needs
                 * to be
                 * called by other functions which are at the same level as the "observeHScrollBarMove" function is,
                 * and is
                 * implemented here because it needs the x and y coordinates which can only be obtained inside the
                 * horizontal
                 * bar's mousedown event's handler.
                 *
                 * @author Huan Li
                 * @param {Object} objPosition The x and y coordinates of the mouse cursor when the left button of
                 * the mouse is
                 *          held down on the horizontal bar.
                 * @param {Event} event The event fired when the mouse moves while the left button has been keeping
                 * held down
                 *          on the horizontal bar.
                 */
                handleMoveDragHBar = (function(objPosition, event) {
                    event.preventDefault();
                    dragScrollBar(objHBar, {
                        x: event.pageX - objPosition.x,
                        y: 0
                    });
                    objPosition.x = event.pageX;
                }).bind(null, {
                    x: evt.pageX
                });
                $(document).mousemove(handleMoveDragHBar);
                $(document).mouseup(handleEndDragHBar);
            });
        },
        /**
         * Register an event handler to handle the dragging action on the vertical bar so that it moves as the mouse
         * cursor moves if the left button of the mouse is being held down on the vertical bar. And unregister the
         * event handlers which were just registered when the left button of the mouse is released.
         *
         * @author Huan Li
         */
        observeDragVBar = function() {
            objVBar.mousedown(function(evt) {
                evt.preventDefault();
                bDraggingScrollBar = true;
                if (_bSmooth) {
                    removeTransition();
                }
                if (_bAutoHide) {
                    unobserveScrollBarsVisibility();
                }
                /**
                 * Handle the event fired when the mouse moves while the left button is held down on the vertical bar
                 * so that the vertical bar can move as the mouse moves.
                 *
                 * This function was declared outside the vertical bar's mousedown event's handler because it needs
                 * to be
                 * called by other functions which are at the same level as the "observeHScrollBarMove" function is,
                 * and is
                 * implemented here because it needs the x and y coordinates which can only be obtained inside the
                 * vertical
                 * bar's mousedown event's handler.
                 *
                 * @author Huan Li
                 * @param {Object} objPosition The x and y coordinates of the mouse cursor when the left button of
                 * the mouse is
                 *          held down on the vertical bar.
                 * @param {Event} event The event fired when the mouse moves while the left button has been keeping
                 * held down
                 *          on the vertical bar.
                 */
                handleMoveDragVBar = (function(objPosition, event) {
                    event.preventDefault();
                    dragScrollBar(objVBar, {
                        x: 0,
                        y: event.pageY - objPosition.y
                    });
                    objPosition.y = event.pageY;
                }).bind(null, {
                    y: evt.pageY
                });
                $(document).mousemove(handleMoveDragVBar);
                $(document).mouseup(handleEndDragVBar);
            });
        },
        /**
         * Register event handlers to handle the dragging action on the resize knob so that the wrapper element is
         * resized as the mouse cursor moves if the left button of the mouse is being held down on the resize knob.
         *
         * @author Huan Li
         */
        observeDragToResize = function() {
          objResizeKnob.addClass(cssClasses.cursorSeResize).mousedown(handleStartDragToResize);
        },
        /**
         * Register event handlers to handle the dragging action on the wrapped element so that it moves as the mouse
         * cursor moves if the left button of the mouse is being held down on the wrapped element. And unregister the event
         * handlers which were just registered when the left button of the mouse is released.
         *
         * @author Huan Li
         */
        observeDragWrappee = function() {
          objWrappee.addClass(cssClasses.noUserSelect).on(STATIC.EVENT_MOUSE_OVER, handleMouseOverDragWrappee).on(getEventSubject(STATIC.EVENT_TYPE_START), handleStartDragWrappee);
        },
        /**
         * Register event handlers to handle the mouse cursor entering and leaving the wrapper element so that at any given
         * time whether the mouse cursor if inside the wrapper element or not is known.
         *
         * @author Huan Li
         */
        observeMouseHoversWrapper = function() {
          $(objWrapper).on({
            mouseenter: function(evt) {
              if (bMouseIn !== true) {
                bMouseIn = true;
              }
            },
            mouseleave: function(evt) {
              if (bMouseIn !== 'false') {
                bMouseIn = false;
              }
            }
          });
        },
        /**
         * Register event handlers to handle the rolling of the mouse wheel so that the wrapped element scrolls as the
         * mouse wheel rolls if it's inside the wrapper element's visible part which is the part inside the rectangle of
         * the wrapper element.
         *
         * @author Huan Li
         */
        observeMouseWheel = function() {
          /**
           * Some browsers fire "wheel" event and some fire "mousewheel" event so here I make it listen to both events.
           */
          objWrapper.on('wheel mousewheel', function(e) {
            //@formatter:off
            var originalEvent = e.originalEvent,
                deltaX = originalEvent.wheelDeltaX || -originalEvent.deltaX || 0,
                deltaY = originalEvent.wheelDeltaY || -originalEvent.deltaY || 0;
            //@formatter:on
            if (originalEvent.deltaMode === 1) {
              deltaX = deltaX * STATIC.SHIFTING_BY_SCROLL;
              deltaY = deltaY * STATIC.SHIFTING_BY_SCROLL;
            }
            scroll({
              x: deltaX || 0,
              y: deltaY || 0
            });
          });
        },
        /**
         * Register an event handler to show and hide the scroll bars according to the configurations as the mouse cursor
         * moves in and out of the wrapper element.
         *
         * @author Huan Li
         */
        observeScrollBarsVisibility = function() {
          objWrapper.on({
            mouseenter: handleMouseEnterScrollBarsVisibility,
            mouseleave: handleMouseLeaveScrollBarsVisibility
          });
        },
        /**
         * Register and event handler to do something when a CSS transition ends.
         *
         * @author Huan Li
         */
        observeTransitionEnd = function() {
          objWrapper.on('transitionend webkitTransitionEnd oTransitionEnd msTransitionEnd', handleTransitionEnd);
        },
        /**
         * Get the arguments of the matrix function of the CSS property "transform" and save them as key-value pairs
         * in an object. If any of the arguments could not be parsed successfully a default value will be used
         * instead. The default values for all arguments are {a: 1, b: 0, c: 0, d: 1, x: 0, y: 0}.
         *
         * @author Huan Li
         * @param {String} strTransform The original string value of the CSS property "transform" obtained from by the
         *          native window.getComputedStyle() function or the jQuery's $.css() function.
         * @returns {Object} A key-value pair object containing the the arguments of the transform's matrix function.
         */
        parseTransform = function(strTransform) {
          var objTransform = {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            x: 0,
            y: 0
          }, arrResults;
          if ( typeof strTransform === 'string') {
            arrResults = strTransform.split(/\(|\)/);
            if (arrResults.length > 1) {
              arrResults = arrResults[1].split(/\s*,\s*/);
              if (arrResults.length === 6) {
                objTransform.a = parseFloat(arrResults[0], 10);
                objTransform.b = parseFloat(arrResults[1], 10);
                objTransform.c = parseFloat(arrResults[2], 10);
                objTransform.d = parseFloat(arrResults[3], 10);
                objTransform.x = parseFloat(arrResults[4], 10);
                objTransform.y = parseFloat(arrResults[5], 10);
              }
            }
          }
          return objTransform;
        },
        /**
         * Put the horizontal bar in a proper position inside its parent scroll bar. Its size and position are
         * recalculated.
         *
         * @author Huan Li
         */
        positionHBar = function() {
          objHBar.width(calcHBarWidth());
          var numPosition = calcHBarPosition(), objTransform = parseTransform(objHBar.css('transform'));
          if (noTransform()) {
            objHBar.css('left', numPosition);
          } else {
            objTransform.x = numPosition;
            objHBar.css('transform', toTransformString(objTransform));
          }
        },
        /**
         * Put the vertical bar in a proper position inside its parent scroll bar. Its size and position will be
         * recalculated.
         *
         * @author Huan Li
         */
        positionVBar = function() {
          objVBar.height(calcVBarHeight());
          var numPosition = calcVBarPosition(), objTransform = parseTransform(objVBar.css('transform'));
          if (noTransform()) {
            objVBar.css('top', numPosition);
          } else {
            objTransform.y = numPosition;
            objVBar.css('transform', toTransformString(objTransform));
          }
        },
        /**
         * Add the event handlers which are specified by the values in the configuration object.
         *
         * @author Huan Li
         */
        prepareCustomEventHandlers = function() {
          var eventSubject;
          for (eventSubject in _objEventHandlers) {
            if ( typeof _objEventHandlers[eventSubject] === 'function') {
              registerEventHandlers(eventSubject, _objEventHandlers[eventSubject]);
            }
          }
        },
        /**
         * Register a event handler for a custom event.
         *
         * @author Huan Li
         * @param {String} strEventType The event subject.
         * @param {Function} fctEventHandler The event handler function.
         */
        registerCustomEventHandler = function(strEventSubject, fctEventHandler) {
          _this['on' + capitalizeInitial(eventSubject)] = _objEventHandlers[eventSubject];
        },
        /**
         * Remove the CSS "transition" property from the wrapped element and the scroll bars.
         *
         * @author Huan Li
         */
        removeTransition = function() {
          $([objWrappee, objHBar, objVBar]).each(function(index, item) {
            $(item).css('transition', 'none');
          });
        },
        /**
         * Render both bars. Setting the dimension and position of the bars.
         *
         * @author Huan Li
         */
        renderBars = function() {
          positionHBar();
          positionVBar();
        },
        /**
         * Render both scroll bars by setting the styles to them and the bars inside them.
         *
         * @author Huan Li
         */
        renderScrollBars = function() {
          if (shouldShowHorizontalScrollBar()) {
            objHScrollBar.css({
              bottom: 0,
              display: 'block',
              left: 0,
              width: objWrapper.width() - getVScrollBarWidth()
            });
          } else {
            objHScrollBar.hide();
          }
          if (shouldShowVerticalScrollBar()) {
            objVScrollBar.css({
              display: 'block',
              height: objWrapper.height() - getHScrollBarHeight(),
              right: 0,
              top: 0
            });
          } else {
            objVScrollBar.hide();
          }
          renderBars();
        },
        /**
         * Resize the wrapper element.
         *
         * @author Huan Li
         * @param {Object} objMovement A key-value pair object containing the movement of the mouse cursor along the X and
         *          Y axes.
         */
        resizeWrapper = function(objMovement) {
          //@formatter:off
          var height = objWrapper.height() + objMovement.y,
          width = objWrapper.width() + objMovement.x,
          objCoordinates = {x: 0, y: 0};
          //@formatter:on
          if (height < _numMinHeight) {
            height = _numMinHeight;
          } else if (height > _numMaxHeight) {
            height = _numMaxHeight;
          }
          if (width < _numMinWidth) {
            width = _numMinWidth;
          } else if (width > _numMaxWidth) {
            width = _numMaxWidth;
          }
          objWrapper.css({
            height: height,
            width: width
          });

          /* Take care of the visibility of the scroll bars */
          if (!shouldShowHorizontalScrollBar()) {
            objHScrollBar.fadeOut('fast');
          } else {
            objHScrollBar.fadeIn('fast');
          }
          if (!shouldShowVerticalScrollBar()) {
            objVScrollBar.fadeOut('fast');
          } else {
            objVScrollBar.fadeIn('fast');
          }

          /* Start taking care of the positioning of the wrapped element */
          reviseWrappeePosition();
          /* End taking care of the positioning of the wrapped element */

          /* Resize and reposition the scroll bars */
          renderScrollBars();
        },
        /**
         * Re-grant the possession of the CSS "transition" property to the wrapped element and the scroll bars.
         *
         * @author Huan Li
         */
        resumeTransition4Scroll = function() {
          addTransition4Scroll();
        },
        /**
         * Check the position of the wrapped element. If it's out of the view of the wrapper element move it back into the view.
         *
         * @author Huan Li
         */
        reviseWrappeePosition = function() {
          var objWrappeeMovement = {x: 0, y: 0};
          if (noTransform()) {
            objCoordinates = {
              x: objWrappee.position().left,
              y: objWrappee.position().top
            };
          } else {
            objCoordinates = parseTransform(objWrappee.css('transform'));
          }
          // Recalculate the position of the wrapped element only when it's not in the initial position which is left 0 and
          // top 0 or no transform defined
          if (objCoordinates.x !== 0 || objCoordinates.y !== 0) {
            if(objCoordinates.x > 0) {
              objWrappeeMovement.x = 0 - objCoordinates.x;
            } else if(objCoordinates.x + objWrappee.outerWidth(true) - objWrapper.width() < 0) {
              if(objWrappee.outerWidth(true) <= objWrapper.width()) {
                objWrappeeMovement.x = 0 - objCoordinates.x;
              } else {
                objWrappeeMovement.x = objWrappee.outerWidth(true) - objWrapper.width();
              }
            }
            if(objCoordinates.y > 0) {
              objWrappeeMovement.y = 0 - objCoordinates.y;
            } else if(objCoordinates.y + objWrappee.outerHeight(true) - objWrapper.height() < 0) {
              if(objWrappee.outerHeight(true) <= objWrapper.height()) {
                objWrappeeMovement.y = 0 - objCoordinates.y;
              } else {
                objWrappeeMovement.y = objWrappee.outerHeight(true) - objWrapper.height();
              }
            }
            // if (objWrapper.height() > objWrappee.outerHeight(true) + objCoordinates.y && objWrapper.height() < objWrapper.outerHeight(true)) {
            //   objWrappeeMovement.y = objWrapper.height() - (objWrappee.outerHeight(true) + objCoordinates.y);
            // }
            // if (objWrapper.width() > objWrappee.outerWidth(true) + objCoordinates.x && objWrapper.width() < objWrapper.outerWidth(true)) {
            //   objWrappeeMovement.x = objWrapper.width() - (objWrappee.outerWidth(true) + objCoordinates.x);
            // }
            if (objWrappeeMovement.x !== 0 || objWrappeeMovement.y !== 0) {
              moveWrappee(objWrappeeMovement);
            }
          }
        },
        /**
         * Move the wrapped element based on how much the mouse wheel has been scrolled.
         *
         * @author Huan Li
         * @param {Object} objDelta A key-value pair object containing how much the mouse wheel has been scrolled
         *          along the X, the Y and the Z axes.
         */
        scroll = function(objDelta) {
          if (_bFlipXY) {
            var temp = objDelta.x;
            objDelta.x = objDelta.y;
            objDelta.y = temp;
          }
          wrappeeDrivesBars(objDelta, STATIC.MOVEMENT_TRIGGER_ACTION_MOUSE_WHEEL);
        },
        /**
         * Move the wrapped element by pages instead of random distance. This means that the distance every time
         * the wrapped element is moved is a multiple of the single page size.
         *
         * @author Huan Li
         */
        scrollByPage = function() {
          var objShiftInOnePage = shiftWithInOnePage(), objPageSize = {
            x: objWrapper.width(),
            y: objWrapper.height()
          }, objShiftMoreThanHalfPage = {
            x: objShiftInOnePage.x > objPageSize.x / 2,
            y: objShiftInOnePage.y > objPageSize.y / 2
          }, objMovement = {
            x: 0,
            y: 0
          };
          if (objShiftMoreThanHalfPage.x) {
            objMovement.x = -(objPageSize.x - objShiftInOnePage.x);
          } else {
            objMovement.x = objShiftInOnePage.x;
          }
          if (objShiftMoreThanHalfPage.y) {
            objMovement.y = -(objPageSize.y - objShiftInOnePage.y);
          } else {
            objMovement.y = objShiftInOnePage.y;
          }
          addTransition4PageScroll();
          scrollOnce(objMovement);
        },
        /**
         * Scroll down the wrapped element for a amount of distance which is specified by "numMovement".
         *
         * @author Huan Li
         * @param {Number} numMovement The amount of distance the wrapped element is supposed to be moved.
         */
        scrollDown = function(numMovement) {
          scrollOnce({
            x: 0,
            y: -1 * (parseFloat(numMovement, 10) || 0)
          });
        },
        /**
         * Scroll the wrapped element to the left for a amount of distance which is specified by "numMovement".
         *
         * @author Huan Li
         * @param {Number} numMovement The amount of distance the wrapped element is supposed to be moved.
         */
        scrollLeft = function(numMovement) {
          scrollOnce({
            x: parseFloat(numMovement) || 0,
            y: 0
          });
        },
        /**
         * Scroll a specified amount distance at one time.
         *
         * @author Huan Li
         * @param {Object} objMovement A key-value pair object containing the movement, which is going to be made to
         *          the wrapped element, along the X and the Y axes.
         */
        scrollOnce = function(objMovement) {
          showScrollBars();
          addTransition4Scroll(true);
          wrappeeDrivesBars(objMovement, STATIC.MOVEMENT_TRIGGER_ACTION_PROGRAM);
          if (!bMouseIn) {
            hideScrollBars();
          }
        },
        /**
         * Scroll the wrapped element by one page.
         *
         * @author Huan Li
         * @param {String} objScrollDirection A key-value pair object containing the boolean values which indicate the
         *          directions of the scroll both horizontally and vertically.
         */
        scrollOnePage = function(objScrollDirection) {
          scrollPages({
            x: objScrollDirection.left === 0 ? 0 : (objScrollDirection.left ? -1 : 1),
            y: objScrollDirection.up === 0 ? 0 : (objScrollDirection.y ? -1 : 1)
          });
        },
        /**
         * Scroll the wrapped element by the number of pages which is specified by the parameter. If the parameter is
         * omitted nothing will be done.
         *
         * @author Huan Li
         * @param {Number} objPageCount A key-value pair object containing the numbers of pages to scroll both
         *          horizontally and vertically.
         */
        scrollPages = function(objPageCount) {
          if (objPageCount && (( typeof objPageCount.x === 'number' && objPageCount.x !== 0) || ( typeof objPageCount.y === 'number' && objPageCount.y !== 0))) {
            var objMovement = {
              x: 0,
              y: 0
            }, objPageSize = {
              x: objWrapper.width(),
              y: objWrapper.height()
            }, objCoordinates = noTransform() ? {
              x: objWrappee.position().left,
              y: objWrappee.position().top
            } : parseTransform(objWrappee.css('transform')), objshiftWithInOnePage = shiftWithInOnePage(), objNewPageCount = keepPageCountInBound(objPageCount);
            if (objPageCount.x > 0) {
              objMovement.x = (objNewPageCount.x - 1) * objPageSize.x + objshiftWithInOnePage.x;
            } else if (objPageCount.x < 0) {
              objMovement.x = (objNewPageCount.x + 1) * objPageSize.x + (objshiftWithInOnePage.x - objPageSize.x);
            }
            if (objPageCount.y > 0) {
              objMovement.y = (objNewPageCount.y - 1) * objPageSize.y + objshiftWithInOnePage.y;
            } else if (objPageCount.y < 0) {
              objMovement.y = (objNewPageCount.y + 1) * objPageSize.y + (objshiftWithInOnePage.y - objPageSize.y);
            }
            scrollOnce(objMovement);
          }
        },
        /**
         * Scroll the wrapped element to the right for a amount of distance which is specified by "numMovement".
         *
         * @author Huan Li
         * @param {Number} numMovement The amount of distance the wrapped element is supposed to be moved.
         */
        scrollRight = function(numMovement) {
          scrollOnce({
            x: -1 * parseFloat(numMovement) || 0,
            y: 0
          });
        },
        /**
         * Scroll the wrapped element to reveal one of its descendants.
         *
         * @author Huan Li
         * @param {String|HTMLElement|jQuery} element The element, which is a descendant of the wrapped element, to reveal.
         */
        scrollToElement = function(element) {
          if (element) {
            element = $(element);
            if ($.contains(objWrappee[0], element[0])) {
              var objElementPosition, objWrappeeCoordinates, objMovement;
              objElementPosition = getPositionToWrappee(element);
              if (noTransform()) {
                objWrappeeCoordinates = objWrappee.position();
                objMovement = {
                  x: -(objElementPosition.x + objWrappeeCoordinates.left),
                  y: -(objElementPosition.y + objWrappeeCoordinates.top)
                };
              } else {
                objWrappeeCoordinates = parseTransform(objWrappee.css('transform'));
                objMovement = {
                  x: -(objElementPosition.x + objWrappeeCoordinates.x),
                  y: -(objElementPosition.y + objWrappeeCoordinates.y)
                };
              }
              scrollOnce(objMovement);
            }
          }
        },
        /**
         * Scroll the wrapped element up for a amount of distance which is specified by "numMovement".
         *
         * @author Huan Li
         * @param {Number} numMovement The amount of distance the wrapped element is supposed to be moved.
         */
        scrollUp = function(numMovement) {
          scrollOnce({
            x: 0,
            y: parseFloat(numMovement, 10) || 0
          });
        },
        /**
         * Set the position of the scroll bars according to the position of the wrapped element.
         *
         * @author Huan Li
         * @param {Object} objWrappeePosition A key-value pair object containing the coordinates of the wrapped element.
         * @param {Object} objWrappeeMovement A key-value pair object containing the values of how much the wrapped element
         *          has just moved.
         */
        setBarsPosition = function(objWrappeePosition, objWrappeeMovement) {
          //@formatter:off
          var numHRatio = getHorizontalMovementRatio(),
              numVRatio = getVerticalMovementRatio(),
              objBarsNewPosition = {
                x: -(objWrappeePosition.x + objWrappeeMovement.x) / numHRatio,
                y: -(objWrappeePosition.y + objWrappeeMovement.y) / numVRatio
              };
          //@formatter:on
          if (noTransform()) {
            if (_bHorizontalScrollable) {
              objHBar.css('left', objBarsNewPosition.x);
            }
            if (_bVerticalScrollable) {
              objVBar.css('top', objBarsNewPosition.y);
            }
          } else {
            if (_bHorizontalScrollable) {
              objHBar.css('transform', toTransformString({
                x: objBarsNewPosition.x
              }));
            }
            if (_bVerticalScrollable) {
              objVBar.css('transform', toTransformString({
                y: objBarsNewPosition.y
              }));
            }
          }
        },
        /**
         * Set the total number of instances of the the class "kl.ScrollBars".
         *
         * @author Huan Li
         */
        setInstanceCount = function() {
          numInstanceCount = STATIC.INSTANCE_COUNTER++;
        },
        /**
         * Calculate the values of shifting with respect to the size of one page.
         *
         * @author Huan Li
         * @returns {Object} A key-value pair object containing the values of shifting with respect to the size of one page
         *          for both the X and the Y axes.
         */
        shiftWithInOnePage = function() {
          var ret = {
            x: 0,
            y: 0
          }, objWrappeePosition, objPageSize = {
            x: objWrapper.width(),
            y: objWrapper.height()
          };
          if (_numHowToMove === STATIC.MOVE_BY_POSITION) {
            objWrappeePosition = {
              x: objWrappee.position().left,
              y: objWrappee.position().top
            };
          } else {
            objWrappeePosition = parseTransform(objWrappee.css('transform'));
          }
          ret.x = Math.abs(objWrappeePosition.x) - Math.floor(Math.abs(objWrappeePosition.x) / objPageSize.x) * objPageSize.x;
          ret.y = Math.abs(objWrappeePosition.y) - Math.floor(Math.abs(objWrappeePosition.y) / objPageSize.y) * objPageSize.y;
          return ret;
        },
        /**
         * Determine whether the horizontal scroll bar should be displayed based on the configurations.
         *
         * @author Huan Li
         * @returns {Boolean} True if it should be displayed based on the configurations. False otherwise.
         */
        shouldShowHorizontalScrollBar = function() {
          return _bHorizontalBarVisible && objWrappee.outerWidth(true) > objWrapper.width();
        },
        /**
         * Determine whether the vertical scroll bar should be displayed based on the configurations.
         
         * @author Huan Li
         * @returns {Boolean} True if it should be displayed based on the configurations. False otherwise.
         */
        shouldShowVerticalScrollBar = function() {
          return _bVerticalBarVisible && objWrappee.outerHeight(true) > objWrapper.height();
        },
        /**
         * Show the scroll bars based on the configurations.
         *
         * @author Huan Li
         */
        showScrollBars = function() {
          if (timeoutVisibility) {
            window.clearTimeout(timeoutVisibility);
            timeoutVisibility = null;
          }
          if (shouldShowHorizontalScrollBar()) {
            objHScrollBar.fadeIn('fast');
          }
          if (shouldShowVerticalScrollBar()) {
            objVScrollBar.fadeIn('fast');
          }
          if (_bResizeKnobVisisble && ((shouldShowHorizontalScrollBar() && shouldShowVerticalScrollBar()) || _bResizeable)) {
            objResizeKnob.fadeIn('fast');
          }
        },
        /**
         * Set necessary styles to the wrapped element.
         *
         * @author Huan Li
         */
        styleWrappee = function() {
          objWrappee.css({
            overflow: 'visible',
            position: 'absolute'
          }).addClass('wrappee');
        },
        /**
         * Set necessary styles to the wrapper element.
         *
         * @author Huan Li
         */
        styleWrapper = function() {
          objWrapper.css({
            border: objWrappee.css('border'),
            display: objWrappee.css('display') !== 'block' ? 'inline-block' : 'block',
            height: typeof _numWrapperHeight !== 'undefined' ? _numWrapperHeight : wrappeeOldSizes.height,
            overflow: 'hidden',
            padding: 0,
            position: objWrappee.css('position') === 'absolute' ? 'absolute' : 'relative',
            width: typeof _numWrapperWidth !== 'undefined' ? _numWrapperWidth : wrappeeOldSizes.width
          });
        },
        /**
         * Convert the arguments of the matrix function of the CSS property "transform" which are saved as key-value
         * pairs in an object to a string. If any of the arguments could not be converted a default value will be used
         * instead. The default values for all arguments are (1, 0, 0, 1, 0, 0).
         *
         * @author Huan Li
         * @param {Object} objTransform An object containing the the arguments of the matrix function as key-value
         *          pairs.
         * @returns {String} A string of the matrix function of the CSS property "transform".
         */
        toTransformString = function(objTransform) {
          var strTransform = 'matrix(';
          if ( typeof objTransform.a !== 'undefined') {
            strTransform += (objTransform.a + ', ');
          } else {
            strTransform += '1, ';
          }
          if ( typeof objTransform.b !== 'undefined') {
            strTransform += (objTransform.b + ', ');
          } else {
            strTransform += '0, ';
          }
          if ( typeof objTransform.c !== 'undefined') {
            strTransform += (objTransform.c + ', ');
          } else {
            strTransform += '0, ';
          }
          if ( typeof objTransform.d !== 'undefined') {
            strTransform += (objTransform.d + ', ');
          } else {
            strTransform += '1, ';
          }
          if ( typeof objTransform.x !== 'undefined') {
            strTransform += (objTransform.x + ', ');
          } else {
            strTransform += '0, ';
          }
          if ( typeof objTransform.y !== 'undefined') {
            strTransform += (objTransform.y + ')');
          } else {
            strTransform += '0)';
          }
          return strTransform;
        },
        /**
         * Unregister the event handler which handles the pressing of arrow keys.
         *
         * @author Huan Li
         */
        unobserveArrowKeys = function() {
          $(document).off('keydown', handleArrowKeysDown);
        },
        /**
         * Unregister the event handler which handles the dragging action on the resize knob in order to disable
         * resizing the wrapper element.
         *
         * @author Huan Li
         */
        unobserveDragToResize = function() {
          objResizeKnob.off(getEventSubject(STATIC.EVENT_TYPE_START), handleStartDragToResize).removeClass(cssClasses.cursorSeResize);
        },
        /**
         * Unregister the event handler which handles the dragging action on the wrapped element in order to disable
         * dragging to move the wrapped element.
         *
         * @author Huan Li
         */
        unobserveDragWrappee = function() {
          objWrappee.off(STATIC.EVENT_MOUSE_OVER, handleMouseOverDragWrappee).off(getEventSubject(STATIC.EVENT_TYPE_START), handleStartDragWrappee);
          objWrappee.removeClass(cssClasses.cursorMove);
          objWrappee.removeClass(cssClasses.noUserSelect);
        },
        /**
         * Unregister the event handler which shows and hides the scroll bars according to the configurations as the
         * mouse cursor moves in and out of the wrapper element. This will cause the scroll bars to be shown
         * constantly.
         *
         * @author Huan Li
         */
        unobserveScrollBarsVisibility = function() {
          objWrapper.off({
            mouseenter: handleMouseEnterScrollBarsVisibility,
            mouseleave: handleMouseLeaveScrollBarsVisibility
          });
          showScrollBars();
        },
        /**
         * Unregister the event handler for a custom event.
         *
         * @author Huan Li
         * @param {String} strEventSubject The event subject.
         */
        unregisterCustomEventHandler = function(strEventSubject) {
          var key = 'on' + capitalizeInitial(strEventSubject);
          if ( typeof _this[key] !== 'undefined') {
            delete _this[key];
          }
        },
        /**
         * Move the vertical bar to a distance as long as numYMovement because of user triggered events, either
         * dragging the scroll bar or scrolling the mouse wheel. Then move the wrapped element accordingly based on
         * how much the scroll bar has moved.
         *
         * @author Huan Li
         * @param {Number} numYMovement How much the vertical scroll bar has moved.
         */
        vBarDrivesWrappee = function(numYMovement) {
            var numVRatio = getVerticalMovementRatio();
            moveVBar(numYMovement);
            moveWrappee(keepWrappeeInBound({
                x: 0,
                y: -numYMovement * numVRatio
            }));
        },
        /**
         * Wrap the target element with the wrapper element and scroll bars.
         *
         * @author Huan Li
         */
        wrap = function() {
          //@formatter:off
          var strHScrollBarId = appendIdSuffix(strHScrollBarIdPrefix),
              strVScrollBarId = appendIdSuffix(strVScrollBarIdPrefix),
              strResizeKnobId = appendIdSuffix(strResizeKnobIdPrefix),
              strHBarId = appendIdSuffix(strHBarIdPrefix),
              strVBarId = appendIdSuffix(strVBarIdPrefix);
          //@formatter:on
          objWrapper = objWrappee.wrap($(strHtmlWrapper).attr('id', appendIdSuffix(strWrapperIdPrefix))).parent();
          objWrapper.append($(strHtmlHScrollBar).attr('id', strHScrollBarId), $(strHtmlVScrollBar).attr('id', strVScrollBarId), $(strHtmlResizeKnob).attr('id', strResizeKnobId));
          styleWrapper();
          styleWrappee();
          objHScrollBar = objWrapper.find('#' + strHScrollBarId);
          objVScrollBar = objWrapper.find('#' + strVScrollBarId);
          objResizeKnob = objWrapper.find('#' + strResizeKnobId);
          objHBar = objHScrollBar.append($(strHtmlHBar).attr('id', strHBarId)).find('#' + strHBarId);
          objVBar = objVScrollBar.append($(strHtmlVBar).attr('id', strVBarId)).find('#' + strVBarId);
          renderScrollBars();
          if (!_bResizeKnobVisisble) {
            objResizeKnob.hide();
          }
        },
        /**
         * Move the wrapped element to a distance as long as the values contained in the objMovement along the X and
         * the Y axes. Then move the bars accordingly based on how much the wrapped element has been moved. Call event
         * handlers accordingly.
         *
         * @author Huan Li
         * @param {Object} objMovement A key-value pair object containing the movement along the X and the Y axes.
         * @param {String} strTriggerAction A string describing the action which has triggered the scroll.
         */
        wrappeeDrivesBars = function(objMovement, strTriggerAction) {
          //@formatter:off
          var objWrappeePosition = noTransform() ? {
            x: objWrappee.position().left,
            y: objWrappee.position().top
          } : parseTransform(objWrappee.css('transform')),
          objNewMovement;
          //@formatter:on
          objNewMovement = keepWrappeeInBound(objMovement);
          moveWrappee(objNewMovement, strTriggerAction);
          setBarsPosition(objWrappeePosition, objNewMovement);
          /* In order to let the rendering finish first these event handler invocations are put into a setTimeout. */
          window.setTimeout(function() {
            if (objNewMovement.x !== 0 || objNewMovement.y !== 0) {
              fireScrolled(objNewMovement, strTriggerAction);
            }
            if (bTopEndReached) {
              fireTopEndReached(objNewMovement);
            }
            if (bRightEndReached) {
              fireRightEndReached(objNewMovement);
            }
            if (bBottomEndReached) {
              fireBottomEndReached(objNewMovement);
            }
            if (bLeftEndReached) {
              fireLeftEndReached(objNewMovement);
            }
            if (bTopEndReached || bRightEndReached || bBottomEndReached || bLeftEndReached) {
              fireEndReached(objNewMovement);
              bTopEndReached = bRightEndReached = bBottomEndReached = bLeftEndReached = false;
            }
          });
        };
        /**
         * Get how the elements in the web page are moved.
         *
         * @author Huan Li
         * @returns {Number} The number indicating different CSS properties that are changed when moving elements.
         *          Either kl.ScrollBars.MOVE_BY_POSITION or kl.ScrollBars.MOVE_BY_TRANSFORM.
         */
        this.getHowToMove = function() {
          return _numHowToMove;
        };
        /**
         * Tell if the scroll bars are automatically hidden.
         *
         * @author Huan Li
         * @returns {Boolean} True if the scroll bars are shown when the mouse cursor moves into the wrapper element
         *          and hidden when the mouse cursor moves out of the wrapper element. False if the scroll bars are
         *          shown constantly.
         */
        this.isAutoHide = function() {
          return _bAutoHide;
        };
        /**
         * Tell if the wrapped element can be dragged around.
         *
         * @author Huan Li
         * @returns {Boolean} True if the wrapped element can be dragged around. False otherwise.
         */
        this.isDraggable = function() {
          return _bDraggable;
        };
        /**
         * Tell if the wrapped element will glide for an amount of distance after a dragging action.
         *
         * @author Huan Li
         * @returns {Boolean} True if the wrapped element will glide for an amount of distance after a dragging action.
         *          False otherwise.
         */
        this.isGlideable = function() {
          return _bGlideable;
        };
        /**
         * Tell if the horizontal scroll bar will be shown.
         *
         * @author Huan Li
         * @returns {Boolean} True if the horizontal scroll bar will be shown when needed. False if the horizontal
         *          scroll bar will never be shown.
         */
        this.isHorizontalBarVisible = function() {
          return _bHorizontalBarVisible;
        };
        /**
         * Tell if the wrapped element can be scrolled horizontally.
         *
         * @author Huan Li
         * @returns {Boolean} True if the wrapped element can be scrolled horizontally. False otherwise.
         */
        this.isHorizontalScrollable = function() {
          return _bHorizontalScrollable;
        };
        /**
         * Tell if the wrapped element is scrolled by pages.
         *
         * @author Huan Li
         * @returns {Boolean} True if the wrapped element is scrolled by pages. False otherwise.
         */
        this.isPageMode = function() {
          return _bPageMode;
        };
        /**
         * Tell if the wrapper element can be resized.
         *
         * @author Huan Li
         * @returns {Boolean} True if the wrapper element can be resized. False otherwise.
         */
        this.isResizeable = function() {
          return _bResizeable;
        };
        /**
         * Tell if the resize knob is visible.
         *
         * @author Huan Li
         * @returns {Boolean} True if the the resize knob is visible. False otherwise.
         */
        this.isResizeKnobVisible = function() {
          return _bResizeKnobVisisble;
        };
        /**
         * Tell if the arrow keys can control the scroll of the wrapped element.
         *
         * @author Huan Li
         * @returns {Boolean} True if the arrow keys can control the scroll of the wrapped element. False otherwise.
         */
        this.isScrollableByArrowKeys = function() {
          return _bScrollableByArrowKeys;
        };
        /**
         * Tell if the mouse wheel can scroll the wrapped element.
         *
         * @author Huan Li
         * @returns {Boolean} True if the mouse wheel can scroll the wrapped element. False otherwise.
         */
        this.isScrollableByMouseWheel = function() {
          return _bScrollableByMouseWheel;
        };
        /**
         * Tell if the scrolling will be smooth.
         *
         * @author Huan Li
         * @returns {Boolean} True if the scrolling will be smooth. False otherwise.
         */
        this.isSmooth = function() {
          return _bSmooth;
        };
        /**
         * Tell if the vertical scroll bar will be shown.
         *
         * @author Huan Li
         * @returns {Boolean} True if the vertical scroll bar will be shown when needed. False if the vertical scroll
         *          bar will never be shown.
         */
        this.isVerticalBarVisible = function() {
          return _bVerticalBarVisible;
        };
        /**
         * Tell if the wrapped element can be scrolled vertically.
         *
         * @author Huan Li
         * @returns {Boolean} True if the wrapped element can be scrolled vertically. False otherwise.
         */
        this.isVerticalScrollable = function() {
          return _bVerticalScrollable;
        };
        /**
         * Revise the position of the wrapped element and redraw both scroll bars including their dimension and position.
         * This must be explicitly called when the size of the wrapper or the wrapped element has changed not by dragging
         * the resize knob.
         *
         * @author Huan Li
         */
        this.refresh = function() {
          reviseWrappeePosition();
          renderScrollBars();
        },
        /**
         * Resize the wrapper element.
         *
         * @author Huan Li
         * @param {Object} objMovement A key-value pair object containing the movement of the mouse cursor along the X and
         *          Y axes.
         */
        this.resize = resizeWrapper;
        /**
         * Scroll down the wrapped element for a amount of distance which is specified by "numMovement".
         *
         * @author Huan Li
         * @param {Number} numMovement The amount of distance the wrapped element is supposed to be moved.
         */
        this.scrollDown = scrollDown;
        /**
         * Scroll the wrapped element to the left for a amount of distance which is specified by "numMovement".
         *
         * @author Huan Li
         * @param {Number} numMovement The amount of distance the wrapped element is supposed to be moved.
         */
        this.scrollLeft = scrollLeft;
        /**
         * Scroll the wrapped element to the right for a amount of distance which is specified by "numMovement".
         *
         * @author Huan Li
         * @param {Number} numMovement The amount of distance the wrapped element is supposed to be moved.
         */
        this.scrollRight = scrollRight;
        /**
         * Scroll the wrapped element to reveal one of its descendants.
         *
         * @author Huan Li
         * @param {String|HTMLElement|jQuery} element The element, which is a descendant of the wrapped element, to reveal.
         */
        this.scrollToElement = scrollToElement;
        /**
         * Scroll up the wrapped element for a amount of distance which is specified by "numMovement".
         *
         * @author Huan Li
         * @param {Number} numMovement The amount of distance the wrapped element is supposed to be moved.
         */
        this.scrollUp = scrollUp;
        /**
         * Set if the scroll bars are automatically shown and hidden when the mouse cursor enters and leaves the
         * wrapper element.
         *
         * @author Huan Li
         * @param {Boolean} bAutoHide True if the scroll bars are automatically shown and hidden. False otherwise.
         */
        this.setAutoHide = function(bAutoHide) {
          if ( typeof bAutoHide === 'boolean' && _bAutoHide !== bAutoHide) {
            if (bAutoHide) {
              observeScrollBarsVisibility();
              _bAutoHide = true;
            } else {
              unobserveScrollBarsVisibility();
              showScrollBars();
              _bAutoHide = false;
            }
          }
        };
        /**
         * Set if the wrapped element is supposed to be draggable.
         *
         * @author Huan Li
         * @param {Boolean} bDraggable True if the wrapped element is supposed to be able to be dragged. False
         *          otherwise.
         */
        this.setDraggable = function(bDraggable) {
          if ( typeof bDraggable === 'boolean' && _bDraggable !== bDraggable) {
            if (bDraggable) {
              _bDraggable = true;
              observeDragWrappee();
            } else {
              _bDraggable = false;
              unobserveDragWrappee();
            }
          }
        };
        /**
         * Set if the wrapped element will glide for an amount of distance after a dragging action.
         *
         * @author Huan Li
         * @param {Boolean} bGlideable True if the wrapped element will glide for an amount of distance after a dragging
         *          action. False otherwise.
         */
        this.setGlideable = function(bGlideable) {
          if ( typeof bGlideable === 'boolean' && _bGlideable !== bGlideable) {
            _bGlideable = bGlideable;
          }
        };
        /**
         * Set if the horizontal scroll bar is supposed to be shown when needed.
         *
         * @author Huan Li
         * @param {Boolean} bHorizontalBarVisible True if the horizontal scroll bar is supposed to be shown when needed.
         *          False if it's supposed to be never shown. If the value of this argument is not of type Boolean nothing
         *          will be done.
         */
        this.setHorizontalBarVisible = function(bHorizontalBarVisible) {
          if ( typeof bHorizontalBarVisible === 'boolean' && _bHorizontalBarVisible !== bHorizontalBarVisible) {
            _bHorizontalBarVisible = bHorizontalBarVisible;
            refreshScrollBars();
          }
        };
        /**
         * Set if the wrapped element can be scrolled horizontally.
         *
         * @author Huan Li
         * @param {Boolean} bHorizontalScrollable True if the wrapped element can be scrolled horizontally. False
         *          otherwise.
         */
        this.setHorizontalScrollable = function(bHorizontalScrollable) {
          if ( typeof bHorizontalScrollable === 'boolean' && _bHorizontalScrollable !== bHorizontalScrollable) {
            _bHorizontalScrollable = bHorizontalScrollable;
          }
        };
        /**
         * Set the way how elements are moved in the web page.
         *
         * @author Huan Li
         * @param {Number} numHowToMove A number indicating different CSS properties that are changed when moving elements.
         *          Either kl.ScrollBars.MOVE_BY_POSITION or kl.ScrollBars.MOVE_BY_TRANSFORM. If the value
         *          of this argument is neither one of what're just mentioned the default value, which is
         *          kl.ScrollBars.MOVE_BY_TRANSFORM will be used.
         */
        this.setHowToMove = function(numHowToMove) {
          if (numHowToMove === STATIC.MOVE_BY_POSITION) {
            _numHowToMove = STATIC.MOVE_BY_POSITION;
          } else {
            _numHowToMove = STATIC.MOVE_BY_TRANSFORM;
          }
        };
        /**
         * Set if the wrapped element is scrolled by pages.
         *
         * @author Huan Li
         * @param {Boolean} bPageMode True if the wrapped element is scrolled by pages. False otherwise.
         */
        this.setPageMode = function(bPageMode) {
          if ( typeof bPageMode !== 'undefined' && _bPageMode !== bPageMode) {
            _bPageMode = bPageMode;
          }
        };
        /**
         * Set if the wrapper element is supposed to be resizeable.
         *
         * @author Huan Li
         * @param {Boolean} bResizeable True if the wrapper element is supposed to be able to be resized by dragging
         *          the resize knob. False otherwise.
         */
        this.setResizeable = function(bResizeable) {
          if (_bResizeable !== bResizeable && typeof bResizeable === 'boolean') {
            if (bResizeable) {
              _bResizeable = true;
              observeDragToResize();
            } else {
              _bResizeable = false;
              unobserveDragToResize();
            }
          }
        };
        /**
         * Set if the resize knob is visible.
         *
         * @author Huan Li
         * @param {Boolean} bResizeKnobVisisble True if the the resize knob is visible. False otherwise.
         */
        this.setResizeKnobVisible = function(bResizeKnobVisisble) {
          if (_bResizeKnobVisisble !== bResizeKnobVisisble && typeof bResizeKnobVisisble === 'boolean') {
            if (bResizeKnobVisisble) {
              _bResizeKnobVisisble = true;
              if (_bResizeKnobVisisble && ((shouldShowHorizontalScrollBar() && shouldShowVerticalScrollBar()) || _bResizeable)) {
                objResizeKnob.fadeIn('fast');
              }
            } else {
              _bResizeKnobVisisble = false;
              objResizeKnob.fadeOut('fase');
            }
          }
        };
        /**
         * Set if the arrow keys can control the scroll of the wrapped element.
         *
         * @author Huan Li
         * @param {Boolean} bScrollableByArrowKeys True if the arrow keys can control the scroll of the wrapped element.
         *          False otherwise.
         */
        this.setScrollableByArrowKeys = function(bScrollableByArrowKeys) {
          if ( typeof bScrollableByArrowKeys === 'boolean' && _bScrollableByArrowKeys !== bScrollableByArrowKeys) {
            if (bScrollableByArrowKeys) {
              _bScrollableByArrowKeys = true;
              observeArrowKeys();
            } else {
              _bScrollableByArrowKeys = false;
              unobserveArrowKeys();
            }
          }
        };
        /**
         * Set if the mouse wheel can scroll the wrapped element.
         *
         * @author Huan Li
         * @param {Boolean} bScrollableByMouseWheel True if the mouse wheel can scroll the wrapped element. False
         *          otherwise.
         */
        this.setScrollableByMouseWheel = function(bScrollableByMouseWheel) {
          if ( typeof bScrollableByMouseWheel === 'boolean' && _bScrollableByMouseWheel !== bVertical) {
            _bScrollableByMouseWheel = bScrollableByMouseWheel;
            if (bScrollableByMouseWheel) {
              observeMouseWheel();
            } else {
              unobserveMouseWheel();
            }
          }
        };
        /**
         * Set if the scrolling will be smooth.
         *
         * @author Huan Li
         * @param {Boolean} bSmooth True if the scrolling will be smooth. False otherwise.
         */
        this.setSmooth = function(bSmooth) {
          if ( typeof bSmooth === 'boolean' && _bSmooth !== bSmooth) {
            if (bSmooth) {
              _bSmooth = true;
              addTransition4Scroll();
            } else {
              _bSmooth = false;
              removeTransition();
            }
          }
        };
        /**
         * Set if the vertical scroll bar is supposed to be shown when needed.
         *
         * @author Huan Li
         * @param {Boolean} bVerticalBarVisible True if the vertical scroll bar is supposed to be shown when needed. False
         *          if it's supposed to be never shown. If the value of this argument is not of type Boolean nothing will
         *          be done.
         */
        this.setVerticalBarVisible = function(bVerticalBarVisible) {
          if ( typeof bVerticalBarVisible === 'boolean' && _bVerticalBarVisible !== bVerticalBarVisible) {
            _bVerticalBarVisible = bVerticalBarVisible;
            refreshScrollBars();
          }
        };
        /**
         * Set if the wrapped element can be scrolled vertically.
         *
         * @author Huan Li
         * @param {Boolean} bHorizontalScrollable True if the wrapped element can be scrolled vertically. False otherwise.
         */
        this.setVerticalScrollable = function(bVerticalScrollable) {
          if ( typeof bVerticalScrollable === 'boolean' && _bVerticalScrollable !== bVerticalScrollable) {
            _bVerticalScrollable = bVerticalScrollable;
          }
        };
        /**
         * Set the height of the wrapper element to the size specified by the parameter only if the parameter is a number.
         *
         * @author Huan Li
         * @param {Number} The size to which the height of the wrapper element is to be set. This parameter must be a number.
         */
        this.setWrapperHeight = function(numWrapperHeight) {
          if(typeof numWrapperHeight === 'number') {
            _numWrapperHeight = numWrapperHeight;
            objWrapper.height(_numWrapperHeight);
            this.refresh();
          }
        };
        /**
         * Set the width of the wrapper element to the size specified by the parameter only if the parameter is a number.
         *
         * @author Huan Li
         * @param {Number} The size to which the width of the wrapper element is to be set. This parameter must be a number.
         */
        this.setWrapperWidth = function(numWrapperWidth) {
          if(typeof numWrapperWidth === 'number') {
            _numWrapperWidth = numWrapperWidth;
            objWrapper.width(_numWrapperWidth);
            this.refresh();
          }
        };
        /**
         * ********************************************
         * Do initialization.
         * ********************************************
         */
        initialize();
      }
    });
  } else {
    console.warn('jQuery, which com.huanli.ui.KScroll relies on, is not loaded. com.huanli.ui.KScroll will not be able to work. Besides, com.huanli.ui.KScroll only works with jQuery 1.8.2 or higher.');
  }
})(window);
