require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Modernizr = require('./lib/Modernizr'),
    ModernizrProto = require('./lib/ModernizrProto'),
    classes = require('./lib/classes'),
    testRunner = require('./lib/testRunner'),
    setClasses = require('./lib/setClasses');

// Run each test
testRunner();

// Remove the "no-js" class if it exists
setClasses(classes);

delete ModernizrProto.addTest;
delete ModernizrProto.addAsyncTest;

// Run the things that are supposed to run after the tests
for (var i = 0; i < Modernizr._q.length; i++) {
  Modernizr._q[i]();
}

module.exports = Modernizr;

},{"./lib/Modernizr":2,"./lib/ModernizrProto":3,"./lib/classes":4,"./lib/setClasses":20,"./lib/testRunner":26}],2:[function(require,module,exports){
var ModernizrProto = require('./ModernizrProto');


  // Fake some of Object.create
  // so we can force non test results
  // to be non "own" properties.
  var Modernizr = function(){};
  Modernizr.prototype = ModernizrProto;

  // Leak modernizr globally when you `require` it
  // rather than force it here.
  // Overwrite name so constructor name is nicer :D
  Modernizr = new Modernizr();

  

module.exports = Modernizr;
},{"./ModernizrProto":3}],3:[function(require,module,exports){
var tests = require('./tests');


  var ModernizrProto = {
    // The current version, dummy
    _version: 'v3.0.0pre',

    // Any settings that don't work as separate modules
    // can go in here as configuration.
    _config: {
      classPrefix : '',
      enableClasses : true
    },

    // Queue of tests
    _q: [],

    // Stub these for people who are listening
    on: function( test, cb ) {
      // I don't really think people should do this, but we can
      // safe guard it a bit.
      // -- NOTE:: this gets WAY overridden in src/addTest for
      // actual async tests. This is in case people listen to
      // synchronous tests. I would leave it out, but the code
      // to *disallow* sync tests in the real version of this
      // function is actually larger than this.
      setTimeout(function() {
        cb(this[test]);
      }, 0);
    },

    addTest: function( name, fn, options ) {
      tests.push({name : name, fn : fn, options : options });
    },

    addAsyncTest: function (fn) {
      tests.push({name : null, fn : fn});
    }
  };

  

module.exports = ModernizrProto;
},{"./tests":27}],4:[function(require,module,exports){

  var classes = [];
  
module.exports = classes;
},{}],5:[function(require,module,exports){

  /**
   * contains returns a boolean for if substr is found within str.
   */
  function contains( str, substr ) {
    return !!~('' + str).indexOf(substr);
  }

  
module.exports = contains;
},{}],6:[function(require,module,exports){

  var createElement = function() {
    return document.createElement.apply(document, arguments);
  };
  
module.exports = createElement;
},{}],7:[function(require,module,exports){
var ModernizrProto = require('./ModernizrProto');
var omPrefixes = require('./omPrefixes');


  var cssomPrefixes = omPrefixes.split(' ');
  ModernizrProto._cssomPrefixes = cssomPrefixes;
  

module.exports = cssomPrefixes;
},{"./ModernizrProto":3,"./omPrefixes":18}],8:[function(require,module,exports){

  var docElement = document.documentElement;
  
module.exports = docElement;
},{}],9:[function(require,module,exports){
var ModernizrProto = require('./ModernizrProto');
var omPrefixes = require('./omPrefixes');


  var domPrefixes = omPrefixes.toLowerCase().split(' ');
  ModernizrProto._domPrefixes = domPrefixes;
  

module.exports = domPrefixes;
},{"./ModernizrProto":3,"./omPrefixes":18}],10:[function(require,module,exports){

    // Helper function for e.g. boxSizing -> box-sizing
    function domToHyphenated( name ) {
        return name.replace(/([A-Z])/g, function(str, m1) {
            return '-' + m1.toLowerCase();
        }).replace(/^ms-/, '-ms-');
    }
    
module.exports = domToHyphenated;
},{}],11:[function(require,module,exports){
var slice = require('./slice');


  // Adapted from ES5-shim https://github.com/kriskowal/es5-shim/blob/master/es5-shim.js
  // es5.github.com/#x15.3.4.5

  if (!Function.prototype.bind) {
    Function.prototype.bind = function bind(that) {

      var target = this;

      if (typeof target != "function") {
        throw new TypeError();
      }

      var args = slice.call(arguments, 1);
      var bound = function() {

        if (this instanceof bound) {

          var F = function(){};
          F.prototype = target.prototype;
          var self = new F();

          var result = target.apply(
            self,
            args.concat(slice.call(arguments))
          );
          if (Object(result) === result) {
            return result;
          }
          return self;

        } else {

          return target.apply(
            that,
            args.concat(slice.call(arguments))
          );

        }

      };

      return bound;
    };
  }

  

module.exports = Function.prototype.bind;
},{"./slice":21}],12:[function(require,module,exports){
var createElement = require('./createElement');


  function getBody() {
    // After page load injecting a fake body doesn't work so check if body exists
    var body = document.body;

    if(!body) {
      // Can't use the real body create a fake one.
      body = createElement('body');
      body.fake = true;
    }

    return body;
  }

  

module.exports = getBody;
},{"./createElement":6}],13:[function(require,module,exports){
var ModernizrProto = require('./ModernizrProto');
var docElement = require('./docElement');
var createElement = require('./createElement');
var getBody = require('./getBody');


  // Inject element with style element and some CSS rules
  function injectElementWithStyles( rule, callback, nodes, testnames ) {
    var mod = 'modernizr';
    var style;
    var ret;
    var node;
    var docOverflow;
    var div = createElement('div');
    var body = getBody();

    if ( parseInt(nodes, 10) ) {
      // In order not to give false positives we create a node for each test
      // This also allows the method to scale for unspecified uses
      while ( nodes-- ) {
        node = createElement('div');
        node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
        div.appendChild(node);
      }
    }

    // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
    // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
    // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
    // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
    // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
    style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
    div.id = mod;
    // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
    // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
    (!body.fake ? div : body).innerHTML += style;
    body.appendChild(div);
    if ( body.fake ) {
      //avoid crashing IE8, if background image is used
      body.style.background = '';
      //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
      body.style.overflow = 'hidden';
      docOverflow = docElement.style.overflow;
      docElement.style.overflow = 'hidden';
      docElement.appendChild(body);
    }

    ret = callback(div, rule);
    // If this is done after page load we don't want to remove the body so check if body exists
    if ( body.fake ) {
      body.parentNode.removeChild(body);
      docElement.style.overflow = docOverflow;
      // Trigger layout so kinetic scrolling isn't disabled in iOS6+
      docElement.offsetHeight;
    } else {
      div.parentNode.removeChild(div);
    }

    return !!ret;

  }

  

module.exports = injectElementWithStyles;
},{"./ModernizrProto":3,"./createElement":6,"./docElement":8,"./getBody":12}],14:[function(require,module,exports){

  /**
   * is returns a boolean for if typeof obj is exactly type.
   */
  function is( obj, type ) {
    return typeof obj === type;
  }
  
module.exports = is;
},{}],15:[function(require,module,exports){
var Modernizr = require('./Modernizr');
var modElem = require('./modElem');


  var mStyle = {
    style : modElem.elem.style
  };

  // kill ref for gc, must happen before
  // mod.elem is removed, so we unshift on to
  // the front of the queue.
  Modernizr._q.unshift(function() {
    delete mStyle.style;
  });

  

module.exports = mStyle;
},{"./Modernizr":2,"./modElem":16}],16:[function(require,module,exports){
var Modernizr = require('./Modernizr');
var createElement = require('./createElement');


  /**
   * Create our "modernizr" element that we do most feature tests on.
   */
  var modElem = {
    elem : createElement('modernizr')
  };

  // Clean up this element
  Modernizr._q.push(function() {
    delete modElem.elem;
  });

  

module.exports = modElem;
},{"./Modernizr":2,"./createElement":6}],17:[function(require,module,exports){
var injectElementWithStyles = require('./injectElementWithStyles');
var domToHyphenated = require('./domToHyphenated');


    // Function to allow us to use native feature detection functionality if available.
    // Accepts a list of property names and a single value
    // Returns `undefined` if native detection not available
    function nativeTestProps ( props, value ) {
        var i = props.length;
        // Start with the JS API: http://www.w3.org/TR/css3-conditional/#the-css-interface
        if ('CSS' in window && 'supports' in window.CSS) {
            // Try every prefixed variant of the property
            while (i--) {
                if (window.CSS.supports(domToHyphenated(props[i]), value)) {
                    return true;
                }
            }
            return false;
        }
        // Otherwise fall back to at-rule (for FF 17 and Opera 12.x)
        else if ('CSSSupportsRule' in window) {
            // Build a condition string for every prefixed variant
            var conditionText = [];
            while (i--) {
                conditionText.push('(' + domToHyphenated(props[i]) + ':' + value + ')');
            }
            conditionText = conditionText.join(' or ');
            return injectElementWithStyles('@supports (' + conditionText + ') { #modernizr { position: absolute; } }', function( node ) {
                return (window.getComputedStyle ?
                        getComputedStyle(node, null) :
                        node.currentStyle)['position'] == 'absolute';
            });
        }
        return undefined;
    }
    

module.exports = nativeTestProps;
},{"./domToHyphenated":10,"./injectElementWithStyles":13}],18:[function(require,module,exports){

  // Following spec is to expose vendor-specific style properties as:
  //   elem.style.WebkitBorderRadius
  // and the following would be incorrect:
  //   elem.style.webkitBorderRadius

  // Webkit ghosts their properties in lowercase but Opera & Moz do not.
  // Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
  //   erik.eae.net/archives/2008/03/10/21.48.10/

  // More here: github.com/Modernizr/Modernizr/issues/issue/21
  var omPrefixes = 'Webkit Moz O ms';
  
module.exports = omPrefixes;
},{}],19:[function(require,module,exports){
var ModernizrProto = require('./ModernizrProto');


  // List of property values to set for css tests. See ticket #21
  var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');

  // expose these for the plugin API. Look in the source for how to join() them against your input
  ModernizrProto._prefixes = prefixes;

  

module.exports = prefixes;
},{"./ModernizrProto":3}],20:[function(require,module,exports){
var Modernizr = require('./Modernizr');
var docElement = require('./docElement');


  // Pass in an and array of class names, e.g.:
  //  ['no-webp', 'borderradius', ...]
  function setClasses( classes ) {
    var className = docElement.className;
    var regex;
    var classPrefix = Modernizr._config.classPrefix || '';

    // Change `no-js` to `js` (we do this regardles of the `enableClasses`
    // option)
    // Handle classPrefix on this too
    var reJS = new RegExp('(^|\\s)'+classPrefix+'no-js(\\s|$)');
    className = className.replace(reJS, '$1'+classPrefix+'js$2');

    if(Modernizr._config.enableClasses) {
      // Add the new classes
      className += ' ' + classPrefix + classes.join(' ' + classPrefix);
      docElement.className = className;
    }

  }

  

module.exports = setClasses;
},{"./Modernizr":2,"./docElement":8}],21:[function(require,module,exports){
var classes = require('./classes');


  var slice = classes.slice;
  

module.exports = slice;
},{"./classes":4}],22:[function(require,module,exports){
var ModernizrProto = require('./ModernizrProto');
var testPropsAll = require('./testPropsAll');


  /**
   * testAllProps determines whether a given CSS property, in some prefixed
   * form, is supported by the browser. It can optionally be given a value; in
   * which case testAllProps will only return true if the browser supports that
   * value for the named property; this latter case will use native detection
   * (via window.CSS.supports) if available. A boolean can be passed as a 3rd
   * parameter to skip the value check when native detection isn't available,
   * to improve performance when simply testing for support of a property.
   *
   * @param prop - String naming the property to test
   * @param value - [optional] String of the value to test
   * @param skipValueTest - [optional] Whether to skip testing that the value
   *                        is supported when using non-native detection
   *                        (default: false)
   */
    function testAllProps (prop, value, skipValueTest) {
        return testPropsAll(prop, undefined, undefined, value, skipValueTest);
    }
    ModernizrProto.testAllProps = testAllProps;
    

module.exports = testAllProps;
},{"./ModernizrProto":3,"./testPropsAll":25}],23:[function(require,module,exports){
var is = require('./is');
require('./fnBind');


  /**
   * testDOMProps is a generic DOM property test; if a browser supports
   *   a certain property, it won't return undefined for it.
   */
  function testDOMProps( props, obj, elem ) {
    var item;

    for ( var i in props ) {
      if ( props[i] in obj ) {

        // return the property name as a string
        if (elem === false) return props[i];

        item = obj[props[i]];

        // let's bind a function (and it has a bind method -- certain native objects that report that they are a
        // function don't [such as webkitAudioContext])
        if (is(item, 'function') && 'bind' in item){
          // default to autobind unless override
          return item.bind(elem || obj);
        }

        // return the unbound function or obj or value
        return item;
      }
    }
    return false;
  }

  

module.exports = testDOMProps;
},{"./fnBind":11,"./is":14}],24:[function(require,module,exports){
var contains = require('./contains');
var mStyle = require('./mStyle');
var createElement = require('./createElement');
var nativeTestProps = require('./nativeTestProps');
var is = require('./is');


  // testProps is a generic CSS / DOM property test.

  // In testing support for a given CSS property, it's legit to test:
  //    `elem.style[styleName] !== undefined`
  // If the property is supported it will return an empty string,
  // if unsupported it will return undefined.

  // We'll take advantage of this quick test and skip setting a style
  // on our modernizr element, but instead just testing undefined vs
  // empty string.

  // Because the testing of the CSS property names (with "-", as
  // opposed to the camelCase DOM properties) is non-portable and
  // non-standard but works in WebKit and IE (but not Gecko or Opera),
  // we explicitly reject properties with dashes so that authors
  // developing in WebKit or IE first don't end up with
  // browser-specific content by accident.

  function testProps( props, prefixed, value, skipValueTest ) {
    skipValueTest = is(skipValueTest, 'undefined') ? false : skipValueTest;

    // Try native detect first
    if (!is(value, 'undefined')) {
      var result = nativeTestProps(props, value);
      if(!is(result, 'undefined')) {
        return result;
      }
    }

    // Otherwise do it properly
    var afterInit, i, j, prop, before;

    // If we don't have a style element, that means
    // we're running async or after the core tests,
    // so we'll need to create our own elements to use
    if ( !mStyle.style ) {
      afterInit = true;
      mStyle.modElem = createElement('modernizr');
      mStyle.style = mStyle.modElem.style;
    }

    // Delete the objects if we
    // we created them.
    function cleanElems() {
      if (afterInit) {
        delete mStyle.style;
        delete mStyle.modElem;
      }
    }

    for ( i in props ) {
      prop = props[i];
      before = mStyle.style[prop];

      if ( !contains(prop, "-") && mStyle.style[prop] !== undefined ) {

        // If value to test has been passed in, do a set-and-check test.
        // 0 (integer) is a valid property value, so check that `value` isn't
        // undefined, rather than just checking it's truthy.
        if (!skipValueTest && !is(value, 'undefined')) {

          // Needs a try catch block because of old IE. This is slow, but will
          // be avoided in most cases because `skipValueTest` will be used.
          try {
            mStyle.style[prop] = value;
          } catch (e) {}

          // If the property value has changed, we assume the value used is
          // supported. If `value` is empty string, it'll fail here (because
          // it hasn't changed), which matches how browsers have implemented
          // CSS.supports()
          if (mStyle.style[prop] != before) {
            cleanElems();
            return prefixed == 'pfx' ? prop : true;
          }
        }
        // Otherwise just return true, or the property name if this is a
        // `prefixed()` call
        else {
          cleanElems();
          return prefixed == 'pfx' ? prop : true;
        }
      }
    }
    cleanElems();
    return false;
  }

  

module.exports = testProps;
},{"./contains":5,"./createElement":6,"./is":14,"./mStyle":15,"./nativeTestProps":17}],25:[function(require,module,exports){
var ModernizrProto = require('./ModernizrProto');
var cssomPrefixes = require('./cssomPrefixes');
var is = require('./is');
var testProps = require('./testProps');
var domPrefixes = require('./domPrefixes');
var testDOMProps = require('./testDOMProps');
var prefixes = require('./prefixes');


    /**
     * testPropsAll tests a list of DOM properties we want to check against.
     *     We specify literally ALL possible (known and/or likely) properties on
     *     the element including the non-vendor prefixed one, for forward-
     *     compatibility.
     */
    function testPropsAll( prop, prefixed, elem, value, skipValueTest ) {

        var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
            props = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        // did they call .prefixed('boxSizing') or are we just testing a prop?
        if(is(prefixed, "string") || is(prefixed, "undefined")) {
            return testProps(props, prefixed, value, skipValueTest);

            // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
        } else {
            props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
            return testDOMProps(props, prefixed, elem);
        }
    }

    // Modernizr.testAllProps() investigates whether a given style property,
    //     or any of its vendor-prefixed variants, is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testAllProps('boxSizing')
    ModernizrProto.testAllProps = testPropsAll;

    

module.exports = testPropsAll;
},{"./ModernizrProto":3,"./cssomPrefixes":7,"./domPrefixes":9,"./is":14,"./prefixes":19,"./testDOMProps":23,"./testProps":24}],26:[function(require,module,exports){
var tests = require('./tests');
var Modernizr = require('./Modernizr');
var classes = require('./classes');
var is = require('./is');


  // Run through all tests and detect their support in the current UA.
  function testRunner() {
    var featureNames;
    var feature;
    var aliasIdx;
    var result;
    var nameIdx;
    var featureName;
    var featureNameSplit;
    var modernizrProp;
    var mPropCount;

    for ( var featureIdx in tests ) {
      featureNames = [];
      feature = tests[featureIdx];
      // run the test, throw the return value into the Modernizr,
      //   then based on that boolean, define an appropriate className
      //   and push it into an array of classes we'll join later.
      //
      //   If there is no name, it's an 'async' test that is run,
      //   but not directly added to the object. That should
      //   be done with a post-run addTest call.
      if ( feature.name ) {
        featureNames.push(feature.name.toLowerCase());

        if (feature.options && feature.options.aliases && feature.options.aliases.length) {
          // Add all the aliases into the names list
          for (aliasIdx = 0; aliasIdx < feature.options.aliases.length; aliasIdx++) {
            featureNames.push(feature.options.aliases[aliasIdx].toLowerCase());
          }
        }
      }

      // Run the test, or use the raw value if it's not a function
      result = is(feature.fn, 'function') ? feature.fn() : feature.fn;


      // Set each of the names on the Modernizr object
      for (nameIdx = 0; nameIdx < featureNames.length; nameIdx++) {
        featureName = featureNames[nameIdx];
        // Support dot properties as sub tests. We don't do checking to make sure
        // that the implied parent tests have been added. You must call them in
        // order (either in the test, or make the parent test a dependency).
        //
        // Cap it to TWO to make the logic simple and because who needs that kind of subtesting
        // hashtag famous last words
        featureNameSplit = featureName.split('.');

        if (featureNameSplit.length === 1) {
          Modernizr[featureNameSplit[0]] = result;
        }
        else if (featureNameSplit.length === 2) {
          Modernizr[featureNameSplit[0]][featureNameSplit[1]] = result;
        }

        classes.push((result ? '' : 'no-') + featureNameSplit.join('-'));
      }
    }
  }

  

module.exports = testRunner;
},{"./Modernizr":2,"./classes":4,"./is":14,"./tests":27}],27:[function(require,module,exports){

  var tests = [];
  
module.exports = tests;
},{}],28:[function(require,module,exports){
var Modernizr = require('./../../lib/Modernizr');
var testAllProps = require('./../../lib/testAllProps');

/*!
{
  "name": "CSS Transitions",
  "property": "csstransitions",
  "caniuse": "css-transitions",
  "tags": ["css"]
}
!*/

  Modernizr.addTest('csstransitions', testAllProps('transition', 'all', true));


},{"./../../lib/Modernizr":2,"./../../lib/testAllProps":22}],29:[function(require,module,exports){
/**
 * jQuery plugin declaration.
 * A wrapper is created in order to ensure one instance per DOM element
 */

module.exports = {
    wrap: function(name, clazz, $) {
		if(!$) {
            throw Error("jQuery not found");
        }
        var dataKey = "plugin_" + name;

        $.fn[ name ] = function ( method ) {
            var plugin = this.data( dataKey );
            if (plugin && plugin[method]) {
                var value = plugin[method].apply(plugin, [].slice.call(arguments, 1));
				if(typeof value === 'undefined') { value = $(this); }
				return value;

            } else if (typeof method === 'object' || !method) {

                return this.each(function() {
                    if ( !$.data( this, dataKey ) ) {
                        $.data( this, dataKey, new clazz( this, method ) );
                    }
                });

            } else {
                $.error('Method ' + method + ' does not exist on ' + name);
            }
        };
    }
}




},{}],30:[function(require,module,exports){
/*! matchMedia() polyfill addListener/removeListener extension. Author & copyright (c) 2012: Scott Jehl. Dual MIT/BSD license */
(function(){
    // Bail out for browsers that have addListener support
    if (window.matchMedia && window.matchMedia('all').addListener) {
        return false;
    }

    var localMatchMedia = window.matchMedia,
        hasMediaQueries = localMatchMedia('only all').matches,
        isListening     = false,
        timeoutID       = 0,    // setTimeout for debouncing 'handleChange'
        queries         = [],   // Contains each 'mql' and associated 'listeners' if 'addListener' is used
        handleChange    = function() {
            // Debounce
            clearTimeout(timeoutID);

            timeoutID = setTimeout(function() {
                for (var i = 0, il = queries.length; i < il; i++) {
                    var mql         = queries[i].mql,
                        listeners   = queries[i].listeners || [],
                        matches     = localMatchMedia(mql.media).matches;

                    // Update mql.matches value and call listeners
                    // Fire listeners only if transitioning to or from matched state
                    if (matches !== mql.matches) {
                        mql.matches = matches;

                        for (var j = 0, jl = listeners.length; j < jl; j++) {
                            listeners[j].call(window, mql);
                        }
                    }
                }
            }, 30);
        };

    window.matchMedia = function(media) {
        var mql         = localMatchMedia(media),
            listeners   = [],
            index       = 0;

        mql.addListener = function(listener) {
            // Changes would not occur to css media type so return now (Affects IE <= 8)
            if (!hasMediaQueries) {
                return;
            }

            // Set up 'resize' listener for browsers that support CSS3 media queries (Not for IE <= 8)
            // There should only ever be 1 resize listener running for performance
            if (!isListening) {
                isListening = true;
                window.addEventListener('resize', handleChange, true);
            }

            // Push object only if it has not been pushed already
            if (index === 0) {
                index = queries.push({
                    mql         : mql,
                    listeners   : listeners
                });
            }

            listeners.push(listener);
        };

        mql.removeListener = function(listener) {
            for (var i = 0, il = listeners.length; i < il; i++){
                if (listeners[i] === listener){
                    listeners.splice(i, 1);
                }
            }
        };

        return mql;
    };
}());

},{}],31:[function(require,module,exports){
/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

window.matchMedia || (window.matchMedia = function() {
    "use strict";

    // For browsers that support matchMedium api such as IE 9 and webkit
    var styleMedia = (window.styleMedia || window.media);

    // For those that don't support matchMedium
    if (!styleMedia) {
        var style       = document.createElement('style'),
            script      = document.getElementsByTagName('script')[0],
            info        = null;

        style.type  = 'text/css';
        style.id    = 'matchmediajs-test';

        script.parentNode.insertBefore(style, script);

        // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
        info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

        styleMedia = {
            matchMedium: function(media) {
                var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

                // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
                if (style.styleSheet) {
                    style.styleSheet.cssText = text;
                } else {
                    style.textContent = text;
                }

                // Test if media query is true or false
                return info.width === '1px';
            }
        };
    }

    return function(media) {
        return {
            matches: styleMedia.matchMedium(media || 'all'),
            media: media || 'all'
        };
    };
}());

},{}],32:[function(require,module,exports){
var $ = require('jquery'), CSSRuleRegex = /^([^:]+):(.+)/;

//IE polyfill
require('./lib/matchMedia');
require('./lib/matchMedia.addListener');

/**
 * Uses the settings.errorLogger to find the errorLogger if it was defined.
 * The logger will be used to report errors on invalid items.
 * If no logger is found, errors wont be reported.
 */
function setErrorLogger() {
  if(!this.settings.errorLogger) { return; }

  var logger;

  if(Util.isString(this.settings.errorLogger)) {
    logger = Util.getDeepValue(this.settings.errorLogger);
  } else {
    logger = this.settings.errorLogger;
  }

  this._errorLogger = logger;

  console.info((this._errorLogger)?
      "Error logger is defined. It will be used to log invalid items.":
      "No error logger found. Errors wont be logged");
}

function obtainCSSValues(selector, CSS) {
  var pattern = new RegExp(selector.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "\\s*{(\\s*[^}]+)}");
  return CSS.match(pattern)[1];
}

//gets css rule object
//@param: String
//ie: {"width" : "100px"}
function getCSSRule(rule) {
  var CSSrule = {},
  data = CSSRuleRegex.exec(rule);
  CSSrule.property = data [1];
  CSSrule.value = data [2];
  return CSSrule;
}

//return all selector css values for a media query rule in a key/value format.
function obtainCSSValuesFromRule(cssRules) {
  var rules = {};
  $.each(cssRules, function(i, rule) {
    var values = obtainCSSValues(rule.selectorText, rule.cssText).split(';');
    rules[rule.selectorText] = [];
    $.each(values, function(i, value) {
      if (CSSRuleRegex.test(value) === true) {
        rules[rule.selectorText].push(getCSSRule(value));
      }
    });
  });
  return rules;
}

/**
 * Class constructor
 */
function MediaQueryWatcher () {
  this.mediaQueriesRules = {};
}

//return all selector css values for a media query rule in a key/value format.
function obtainCSS(rule) {
  var rules = {};
    var values = obtainCSSValues(rule.selectorText, rule.cssText).split(';');
    rules[rule.selectorText] = [];
    $.each(values, function(i, value) {
      if (CSSRuleRegex.test(value) === true) {
        rules[rule.selectorText].push(getCSSRule(value));
      }
    });
  return rules;
}

/**
 * Media Query Watcher Class contents
 */
MediaQueryWatcher.prototype = {

 addMediaQueriesListener : function (styleSheet, mediaChangeHandler) {
    var rules, actualAppliedRule = "noMediaRule", mql;
   if (styleSheet) {
    rules = styleSheet.cssRules;
    for (var j = 0; j < rules.length; j += 1) {
      if (rules[j].constructor === window.CSSMediaRule) {
          this.mediaQueriesRules[rules[j].media.mediaText] = this.mediaQueriesRules[rules[j].media.mediaText] || {};
          $.extend(this.mediaQueriesRules[rules[j].media.mediaText], obtainCSSValuesFromRule(rules[j].cssRules));
          mql = window.matchMedia(rules[j].media.mediaText);
          if (mql.matches === true) {
            actualAppliedRule = rules[j].media.mediaText; 
          }
          mql.addListener(mediaChangeHandler);
      } else {
          this.mediaQueriesRules["noMediaRule"] = this.mediaQueriesRules["noMediaRule"] || {};
          $.extend(this.mediaQueriesRules["noMediaRule"], obtainCSS(rules[j]));
      }
    }
  }
    return actualAppliedRule;
  },

  //gets the target CSS properties from a @mediaData for the indicated selectors in descending priority order.
  getMediaQueryProperties : function (mediaData, selectors, targetProperties) {
    var propertiesObject = {}, itemsRemoved = 0;

    $.each(selectors, function (index, selector) {
      var property, propertyPosition;
      if (typeof(mediaData[selector]) !== 'undefined') {
        $.each(mediaData[selector], function(i, val) {
          property = val.property.split(" ").join("");
          propertyPosition = targetProperties.indexOf(property);
          if (propertyPosition !== -1) {
            propertiesObject[property] = val.value.split(" ").join("");
            targetProperties.splice(propertyPosition - itemsRemoved, 1);
            itemsRemoved += 1;
          }
        });
      }
      if (targetProperties.length === 0) {
        return false;
      }
    });

    return propertiesObject;
  }

};

// Exports the class
module.exports = MediaQueryWatcher;
},{"./lib/matchMedia":31,"./lib/matchMedia.addListener":30,"jquery":"lrHQu6"}],"class":[function(require,module,exports){
module.exports=require('hHRmiF');
},{}],"hHRmiF":[function(require,module,exports){
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function() {
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();

module.exports = Class;
},{}],35:[function(require,module,exports){
//fgnass.github.com/spin.js#v1.3.2

/**
 * Copyright (c) 2011-2013 Felix Gnass
 * Licensed under the MIT license
 */
(function(root, factory) {

  /* CommonJS */
  if (typeof exports == 'object')  module.exports = factory()

  /* AMD module */
  else if (typeof define == 'function' && define.amd) define(factory)

  /* Browser global */
  else root.Spinner = factory()
}
(this, function() {
  "use strict";

  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for(n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins(parent /* child1, child2, ...*/) {
    for (var i=1, n=arguments.length; i<n; i++)
      parent.appendChild(arguments[i])

    return parent
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  var sheet = (function() {
    var el = createEl('style', {type : 'text/css'})
    ins(document.getElementsByTagName('head')[0], el)
    return el.sheet || el.styleSheet
  }())

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-')
      , start = 0.01 + i/lines * 100
      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      , pre = prefix && '-' + prefix + '-' || ''

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:' + z + '}' +
        start + '%{opacity:' + alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
        '100%{opacity:' + z + '}' +
        '}', sheet.cssRules.length)

      animations[name] = 1
    }

    return name
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor(el, prop) {
    var s = el.style
      , pp
      , i

    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    for(i=0; i<prefixes.length; i++) {
      pp = prefixes[i]+prop
      if(s[pp] !== undefined) return pp
    }
    if(s[prop] !== undefined) return prop
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop)
      el.style[vendor(el, n)||n] = prop[n]

    return el
  }

  /**
   * Fills in default values.
   */
  function merge(obj) {
    for (var i=1; i < arguments.length; i++) {
      var def = arguments[i]
      for (var n in def)
        if (obj[n] === undefined) obj[n] = def[n]
    }
    return obj
  }

  /**
   * Returns the absolute page-offset of the given element.
   */
  function pos(el) {
    var o = { x:el.offsetLeft, y:el.offsetTop }
    while((el = el.offsetParent))
      o.x+=el.offsetLeft, o.y+=el.offsetTop

    return o
  }

  /**
   * Returns the line color from the given string or array.
   */
  function getColor(color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length]
  }

  // Built-in defaults

  var defaults = {
    lines: 12,            // The number of lines to draw
    length: 7,            // The length of each line
    width: 5,             // The line thickness
    radius: 10,           // The radius of the inner circle
    rotate: 0,            // Rotation offset
    corners: 1,           // Roundness (0..1)
    color: '#000',        // #rgb or #rrggbb
    direction: 1,         // 1: clockwise, -1: counterclockwise
    speed: 1,             // Rounds per second
    trail: 100,           // Afterglow percentage
    opacity: 1/4,         // Opacity of the lines
    fps: 20,              // Frames per second when using setTimeout()
    zIndex: 2e9,          // Use a high z-index by default
    className: 'spinner', // CSS class to assign to the element
    top: 'auto',          // center vertically
    left: 'auto',         // center horizontally
    position: 'relative'  // element position
  }

  /** The constructor */
  function Spinner(o) {
    if (typeof this == 'undefined') return new Spinner(o)
    this.opts = merge(o || {}, Spinner.defaults, defaults)
  }

  // Global defaults that override the built-ins:
  Spinner.defaults = {}

  merge(Spinner.prototype, {

    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target b calling
     * stop() internally.
     */
    spin: function(target) {
      this.stop()

      var self = this
        , o = self.opts
        , el = self.el = css(createEl(0, {className: o.className}), {position: o.position, width: 0, zIndex: o.zIndex})
        , mid = o.radius+o.length+o.width
        , ep // element position
        , tp // target position

      if (target) {
        target.insertBefore(el, target.firstChild||null)
        tp = pos(target)
        ep = pos(el)
        css(el, {
          left: (o.left == 'auto' ? tp.x-ep.x + (target.offsetWidth >> 1) : parseInt(o.left, 10) + mid) + 'px',
          top: (o.top == 'auto' ? tp.y-ep.y + (target.offsetHeight >> 1) : parseInt(o.top, 10) + mid)  + 'px'
        })
      }

      el.setAttribute('role', 'progressbar')
      self.lines(el, self.opts)

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , alpha
          , fps = o.fps
          , f = fps/o.speed
          , ostep = (1-o.opacity) / (f*o.trail / 100)
          , astep = f/o.lines

        ;(function anim() {
          i++;
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

            self.opacity(el, j * o.direction + start, alpha, o)
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000/fps))
        })()
      }
      return self
    },

    /**
     * Stops and removes the Spinner.
     */
    stop: function() {
      var el = this.el
      if (el) {
        clearTimeout(this.timeout)
        if (el.parentNode) el.parentNode.removeChild(el)
        this.el = undefined
      }
      return this
    },

    /**
     * Internal method that draws the individual lines. Will be overwritten
     * in VML fallback mode below.
     */
    lines: function(el, o) {
      var i = 0
        , start = (o.lines - 1) * (1 - o.direction) / 2
        , seg

      function fill(color, shadow) {
        return css(createEl(), {
          position: 'absolute',
          width: (o.length+o.width) + 'px',
          height: o.width + 'px',
          background: color,
          boxShadow: shadow,
          transformOrigin: 'left',
          transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
          borderRadius: (o.corners * o.width>>1) + 'px'
        })
      }

      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute',
          top: 1+~(o.width/2) + 'px',
          transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
          opacity: o.opacity,
          animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1/o.speed + 's linear infinite'
        })

        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}))
        ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
      }
      return el
    },

    /**
     * Internal method that adjusts the opacity of a single line.
     * Will be overwritten in VML fallback mode below.
     */
    opacity: function(el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

  })


  function initVML() {

    /* Utility function to create a VML tag */
    function vml(tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
    }

    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

    Spinner.prototype.lines = function(el, o) {
      var r = o.length+o.width
        , s = 2*r

      function grp() {
        return css(
          vml('group', {
            coordsize: s + ' ' + s,
            coordorigin: -r + ' ' + -r
          }),
          { width: s, height: s }
        )
      }

      var margin = -(o.width+o.length)*2 + 'px'
        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
        , i

      function seg(i, dx, filter) {
        ins(g,
          ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
            ins(css(vml('roundrect', {arcsize: o.corners}), {
                width: r,
                height: o.width,
                left: o.radius,
                top: -o.width>>1,
                filter: filter
              }),
              vml('fill', {color: getColor(o.color, i), opacity: o.opacity}),
              vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        )
      }

      if (o.shadow)
        for (i = 1; i <= o.lines; i++)
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')

      for (i = 1; i <= o.lines; i++) seg(i)
      return ins(el, g)
    }

    Spinner.prototype.opacity = function(el, i, val, o) {
      var c = el.firstChild
      o = o.shadow && o.lines || 0
      if (c && i+o < c.childNodes.length) {
        c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild
        if (c) c.opacity = val
      }
    }
  }

  var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

  if (!vendor(probe, 'transform') && probe.adj) initVML()
  else useCssAnimations = vendor(probe, 'animation')

  return Spinner

}));

},{}],36:[function(require,module,exports){
var Class = require('class');
require('browsernizr/test/css/transitions');
var Modernizr = require('browsernizr');

module.exports = Class.extend({

	init: function (animationObject) {
		this.animationObject = animationObject;
		this.afterAnimationCallback = this.animationObject.afterAnimation;
		this.Modernizr = Modernizr;
	},

	animateToPage: function () {
		throw 'This method should be implemented by the subclass';
	},

	setItemVisible: function () {},

	initItem: function () {},

	calculateItemOffset: function() {},

	getPixels: function ($element, cssAttr) {
		var stringValue = $element[0].style[cssAttr];
		if (stringValue[stringValue.length - 1] === '%') {
			return parseInt(stringValue.slice(0, -1), 10);
		} else {
			return parseInt(stringValue.slice(0, -2), 10);
		}
	},

	supportsTouch: function() {}

});

},{"browsernizr":1,"browsernizr/test/css/transitions":28,"class":"hHRmiF"}],37:[function(require,module,exports){
var $ = require('jquery');
var Class = require('class');

var FadeStrategy = require('./fade-strategy');
var SliderStrategy = require('./slider-strategy');
var NoAnimationStrategy = require('./no-animation-strategy');

/** 
 *	Module to control the carousel animation.
 *  Supports multiple animation types such as: slider, fade and none.
 *
 * @module carousel/animation 
 */
module.exports = Class.extend({

	/**
	 * Initializes the animation module
	 *
	 * @param {Object} api Carousel API  
	 * @param {object} options to initialize the module	 
	 * @this {AnimationModule}
	 */
	init: function (api, options) {

		this.carouselApi = api;
		this.$overview = api.container;
		this.animationType = options.animationType;
		this.animationSpeed = options.animationSpeed;
		this.afterAnimationCallback = options.afterAnimationCallback;
		this.size = options.size;
		this.pageSize = options.pageSize;
		this.pagingAnimation = false;

		this.animationStrategy = this._getStrategy();
	},

	/**
	 * Animates page transitions from pageFrom to pageTo
	 *
	 * @param {number} pageFrom Starting page to animate
	 * @param {number} pageTo Ending page to animate	 
	 * @this {AnimationModule}
	 */
	animate: function (pageFrom, pageTo) {
		this._performPreanimationActions();
		var $currentItems = this.carouselApi.getItemsForPage(pageFrom);
		var $itemsToShow = this.carouselApi.getItemsForPage(pageTo);

		this.animationStrategy.animateToPage(this.$overview, $currentItems, $itemsToShow);
	},

	/**
	 * Animates page transitions to current page
	 *
	 * @this {AnimationModule}
	 */
	animateToCurrentPage: function () {
		this.animate(this.carouselApi.getCurrentPage(), this.carouselApi.getCurrentPage());
	},

	/**
	 * Callback to be executed after animations
	 *
	 * @this {AnimationModule}
	 */
	afterAnimation: function () {
		this._performPostanimationActions();

		var callback = this.afterAnimationCallback;
		var self = this;

		if (callback) {
			callback.call(self);
		}
	},

	/**
	 * Sets the specified item to visible
	 *
	 * @param {Object} $item Jquery item element to be shown	 
	 * @this {AnimationModule}
	 */
	setItemVisible: function ($item) {
		this.animationStrategy.setItemVisible($item);
	},

	/**
	 * Calculates the item offset (paddings, margins, etc.)
	 *
	 * @param {Object} $item Item which offset is requested
	 * @this {AnimationModule}
	 */
	calculateItemOffset: function($item) {
		return this.animationStrategy.calculateItemOffset($item);
	},

	/**
	 * Initializes the specified items with sizes and starting styles
	 *
	 * @param {Object} $item Item to be initialized
	 * @this {AnimationModule}
	 */
	initItem: function ($item) {
		var itemOffset = this.calculateItemOffset($item);
		this.animationStrategy.initItem($item);
		$item.css({'left': itemOffset + '%' });
	},

	/**
	 * Updates items after removing an item
	 *
	 * @param {Object} $items Items to be updated
	 * @this {AnimationModule}
	 */
	updateAfterRemoval: function($items) {
		var self = this;
		$items.each(function() {
			self.initItem($(this));
		});
	},

	/**
	 * Checks if the animation strategy supports touch interaction
	 *
	 * @this {AnimationModule}
	 * @returns {boolean}
	 */
	supportsTouch: function() {
		return this.animationStrategy.supportsTouch();
	},

	/**
	 * Gets the set animation strategy type
	 *
	 * @private
	 * @this {AnimationModule}
	 * @returns {AbstractStrategy}
	 */
	_getStrategy: function () {
		if (this.animationType === 'slide') {
			return new SliderStrategy(this);
		}
		if (this.animationType === 'fade') {
			return new FadeStrategy(this);
		}

		return new NoAnimationStrategy(this);
	},

	_performPreanimationActions: function () {
		this.pagingAnimation = true;
		this.$overview.trigger('animation:started');
	},

	_performPostanimationActions: function () {
		this.pagingAnimation = false;
		this.$overview.trigger('animation:finished');
		console.log('Post animation actions executed');
	}
});

},{"./fade-strategy":38,"./no-animation-strategy":39,"./slider-strategy":40,"class":"hHRmiF","jquery":"lrHQu6"}],38:[function(require,module,exports){
var AbstractStrategy = require('./abstract-strategy');

module.exports = AbstractStrategy.extend({

	animateToPage: function ($overview, $currentItem, $nextItem) {
		this._animateItem($currentItem, $nextItem);
	},

	setItemVisible: function ($item) {
		$item.show();
		$item.css('opacity', 1);
		$item.css('z-index', 1);
	},

	initItem: function ($item) {
		$item.css('opacity', 0);
		$item.css('z-index', 0);
	},

	calculateItemOffset: function($item) {
		var itemPositionWithinPage = $item.index() % this.animationObject.pageSize;
		return this.animationObject.size.itemWidthPct * itemPositionWithinPage;
	},

	_animateItem: function ($currentItem, $nextItem) {

		var callback = this.animationObject.afterAnimation;
		var self = this.animationObject;

		var transitionEndHandler = function () {

			$nextItem.off('transitionend', transitionEndHandler);
			$nextItem.off('webkitTransitionEnd', transitionEndHandler);

			$nextItem.css('transition', '');
			$nextItem.css('-webkit-transition', '');

			$currentItem.css('opacity', 0);
			callback.call(self);
		};

		$currentItem.css('z-index', 0);
		$nextItem.css('z-index', 1);

		if (this.Modernizr.csstransitions === true) {
			$nextItem.css('transition', 'opacity ' + this.animationObject.animationSpeed + 'ms ease-out');
			$nextItem.css('-webkit-transition', 'opacity ' + this.animationObject.animationSpeed + 'ms ease-out');

			$nextItem.on('transitionend', transitionEndHandler);
			$nextItem.on('webkitTransitionEnd', transitionEndHandler);
			$nextItem.css('opacity', 1);
		}
		else {
			$nextItem.animate({opacity: 1}, this.animationObject.animationSpeed, transitionEndHandler);
		}

	},

	supportsTouch: function() {
		return false;
	}
});

},{"./abstract-strategy":36}],39:[function(require,module,exports){
var SliderStrategy = require('./slider-strategy');

var NoAnimationStrategy = SliderStrategy.extend({
	_animate: function ($overview, position) {

		var callback = this.animationObject.afterAnimation;
		var self = this.animationObject;

		$overview.css('left', position + '%');

		callback.call(self);
	},

	supportsTouch: function () {
		return false;
	}
});

module.exports = NoAnimationStrategy;

},{"./slider-strategy":40}],40:[function(require,module,exports){
var AbstractStrategy = require('./abstract-strategy');

module.exports = AbstractStrategy.extend({

	animateToPage: function ($overview, $currentItem, $pageToShow) {
		var overviewPosition = this.getPixels($overview, 'left');
		var currentPosition = ($currentItem.length > 0)? this.getPixels($currentItem, 'left'): -1*overviewPosition;

		var offset = this.getPixels($pageToShow, 'left');
		var difference = currentPosition - offset;
		var position = overviewPosition;
		if (difference !== 0) {
			// (difference > 0) -> Move backwards
			// (difference < 0) -> Move forward
			position = currentPosition + (difference < 0) ? -offset : offset;
		} else {
			currentPosition = -currentPosition;
			// Check if there was a dragging movement
			if (overviewPosition !== currentPosition) {
				position = currentPosition;
			}
		}

		console.log('AnimateToPage, offset: ' + offset + ', difference: ' + difference + ', position: ' + position);

		this._animate($overview, position);
	},

	_animate: function ($overview, position) {

		var callback = this.animationObject.afterAnimation;
		var self = this.animationObject;

		var transitionEndHandler = function () {
			console.log('Transition End');
			$overview.off('transitionend', transitionEndHandler);
			$overview.off('webkitTransitionEnd', transitionEndHandler);

			$overview.css('transition', '');
			$overview.css('-webkit-transition', '');

			callback.call(self);
		};

		position = position + '%';

		if (this.Modernizr.csstransitions === true) {
			$overview.css('transition', 'left ' + this.animationObject.animationSpeed + 'ms ease-out');
			$overview.css('-webkit-transition', 'left ' + this.animationObject.animationSpeed + 'ms ease-out');

			$overview.on('transitionend', transitionEndHandler);
			$overview.on('webkitTransitionEnd', transitionEndHandler);
			$overview.css('left', position);
		} else {
			$overview.animate({left: position}, this.animationObject.animationSpeed, transitionEndHandler);
		}

	},

	calculateItemOffset: function($item) {
		return this.animationObject.size.itemWidthPct * $item.index();
	},

	supportsTouch: function() {
		return true;
	}

});

},{"./abstract-strategy":36}],41:[function(require,module,exports){
var $ = require('jquery');
var Class = require('class');
var util = require('./util');

var consoleShim = require ('./console-shim-module');

var responsiveModule = require('./responsive-module');

var DragSupport = require('./dragging-module');
var PaginationModule = require('./pagination/paging-module');
var Animation = require('./animation/animation-module');
var Loading = require('./loading/loading-module');


var leftIndicatorDefaultTemplate = '<div class="left-indicator"><div class="triangle-left"></div></div>';
var rightIndicatorDefaultTemplate = '<div class="right-indicator"><div class="triangle-right"></div></div>';

var containerTemplate = '<div class="overview"></div>';

var SELECTED_CLASS = "selected";

/**
 *  Generic carousel with several features such as animations, pagination, loading strategy.
 *	@module carousel
 */
module.exports = Class.extend({

	/**
	 * Initializes the carousel within the selector with the specified options
	 *
	 * @param {string} selector - Selector to contain the component
	 * @param {object} options - Object containig the options to initialize the carousel
	 * @this {Carousel}
	 */
	init: function (selector, options) {

		// Variable Definitions

		var defaults = {
			touchEnabled: false,
			pageSize: 1,
			animationType: 'none',
			loadingType: 'lazy',
			moveSpeed: 1000,
			pagingIndicators: false,
			pageInterval: 0,
			showNavigationArrows: 'auto',
			circularNavigation: false,
			responsive: true,
			itemTemplate: function () {
				return '<div></div>';
			}
		};

		this.$viewport = $(selector);
		this.settings = $.extend({}, defaults, options);

		consoleShim();

		this.size = {
			contentWidth: 0,
			overviewWidth: 0,
			itemWidthPct: 100 / this.settings.pageSize
		};

		this._initPaginationModule();
		this._initializeResponsiveModule(this.settings.responsive);

		this.leftIndicatorClickHandler = $.proxy(this.leftIndicatorClickHandler, this);
		this.rightIndicatorClickHandler = $.proxy(this.rightIndicatorClickHandler, this);

		this._trigger('carousel:initialized');
	},

	//*****************************Public API***************************************


	/**
	 * Enables the specified event with the handler
	 *
	 * @param {string} eventName - Event name to listen to
	 * @param {function} handler - Function associated with the event listening
	 * @this {Carousel}
	 */
	on: function (eventName, handler) {
		$(this).on(eventName, handler);
	},

	/**
	 * Disables the specified event with the handler
	 *
	 * @param {string} eventName - Event name to stop listening to
	 * @param {function} handler - Function associated with the event
	 * @this {Carousel}
	 */
	off: function (eventName, handler) {
		$(this).off(eventName, handler);
	},

	/**
	 * Sets the specified page as selected
	 *
	 * @param {number} pageNumber - Index to navigate to
	 * @this {Carousel}
	 */
	goToPage: function (pageNumber) {
		this._trigger('carousel:pageChangeStart', [this.pagingModule.getCurrentPage(), pageNumber]);
		this.pagingModule.goToPage(pageNumber);
		this.loadingModule.loadItem(this._getDOMItemsForCurrentPage());
		this.animationModule.animate(this.pagingModule.getPrevCurrentPage(), pageNumber);

		this._trigger('carousel:pageChanged', [pageNumber]);
	},

	/**
	 * Sets the next page as selected
	 *
	 * @this {Carousel}
	 */
	goNext: function () {
		this.goToPage(this.pagingModule.getNextPage());

	},

	/**
	 * Sets the previous page as selected
	 *
	 * @this {Carousel}
	 */
	goBack: function () {
		this.goToPage(this.pagingModule.getPrevPage());
	},

	/**
	 * Sets the last page as selected
	 *
	 * @this {Carousel}
	 */
	goToLastPage: function () {
		this.goToPage(this.pagingModule.getLastPage());
	},

	/**
	 * Sets the first page as selected
	 *
	 * @this {Carousel}
	 */
	goToFirstPage: function () {
		this.goToPage(0);
	},

	/**
	 * Retrieves the current page index
	 *
	 * @this {Carousel}
	 * @return {number} Current page index
	 */
	getCurrentPage: function () {
		return this.pagingModule.getCurrentPage();
	},

	/**
	 * Retrieves the number of items
	 *
	 * @this {Carousel}
	 * @return {number} Items count
	 */
	getItemCount: function () {
		return this.getItems().length;
	},

	/**
	 * Retrieves the number of pages
	 *
	 * @this {Carousel}
	 * @return {number} Pages count
	 */
	getPageCount: function () {
		return this.pagingModule.getPageCount();
	},

	/**
	 * Retrieves the carousel items
	 *
	 * @this {Carousel}
	 * @param {number} itemIndex - Index containing the carousel item
	 * @return {number} Item page index
	 */
	getPageIndex: function(itemIndex) {
		return this.pagingModule.getPageIndex(itemIndex);
	},

	/**
	 * Retrieves the carousel items
	 *
	 * @this {Carousel}
	 * @return {array} Array containing the carousel items
	 */
	getItems: function () {
		return this.$overview.children('.carousel-item');
	},

	/**
	 * Retrieves the last item index.
	 *
	 * @this {Carousel}
	 * @return {number} Last item index
	 */
	getLastItemIndex: function () {
		return this.getItemCount() - 1;
	},

	/**
	 * Retrieves all the index contained within the the specified page.
	 *
	 * @this {Carousel}
	 * @param {number} pageNumber - Page index
	 * @return {array} Array containing the indices
	 */
	getItemIndicesForPage: function (pageNumber) {
		return this.pagingModule.getIndicesForPage(pageNumber);
	},

	/**
	 * Retrieves all the index contained within the current page.
	 *
	 * @this {Carousel}
	 * @return {array}  Array containing the indices
	 */
	getItemIndicesForCurrentPage: function () {
		return this.pagingModule.getIndicesForPage(this.getCurrentPage());
	},

	/**
	 * Removes all the items from the carousel, resets the paging, clear the styles and navigators.
	 *
	 * @this {Carousel}
	 * @param {object} options - Set silent to avoid firing events.
	 * @fires carousel:itemsCleared Event to notify that the carousel has been cleared.
	 */
	clear: function (options) {
		this.$overview.empty();
		this.$overview.css('left', '0%');
		this.refreshContentWidth();
		this._updateNavigators();
		this.pagingModule.clear();

		if (!options || !options.silent) {
			this._trigger('carousel:itemsCleared');
		}

	},

	/**
	 * Check whether the index if a valid existing item or not
	 *
	 * @this {Carousel}
	 * @param {number} index - Item index to be removed.
	 * @return {boolean} true if the index is valid. false, if it the index is invalid.
	 */
	isValidItemIndex: function (index) {
		return (index >= 0 && index < this.getItemCount());
	},

	/**
	 * Removes a carousel item given the index
	 *
	 * @this {Carousel}
	 * @param {number} index - Index of the item to be removed.
	 * @fires carousel:pageRemoved - Event to notify that item removed has removed an existing page.
	 * @fires carousel:itemRemoved - Event to notify that item has been removed from the carousel.
	 */
	removeItem: function (index) {
		if (!this.isValidItemIndex(index)) { return; }

		var item = this.getItems()[index];
		if(!item) { return; }

		var oldPageCount = this.getPageCount();

		var $itemToBeRemoved = $(item);
		var $itemsToBeUpdated = $itemToBeRemoved.nextAll();

		$itemToBeRemoved.remove();

		if ($itemsToBeUpdated.length > 0) {

			this.animationModule.updateAfterRemoval($itemsToBeUpdated);

			this.animationModule.setItemVisible(this._getDOMItemsForCurrentPage());
			this.loadingModule.loadItem(this._getDOMItemsForCurrentPage());
		}

		// Check if the page count changed. That would mean a page was removed, the page module must be notified.
		var newPageCount = this.getPageCount();
		if (oldPageCount > newPageCount) {
			this.pagingModule.removePage();

			// If there are pages and the current one was removed, go to last page available
			if(newPageCount > 0 && this.getCurrentPage() >= newPageCount) {
				this.goToLastPage();
			}
			this._trigger('carousel:pageRemoved');
		}

		this.refreshContentWidth();
		this._updateNavigators();

		this._trigger('carousel:itemRemoved');
	},

	/**
	 * Refresh the carousel content width with the sum of every item including margings and padings.
	 *
	 * @this {Carousel}
	 */
	refreshContentWidth: function () {
		var itemList = this.getItems();
		var offset = 0;

		itemList.each(function() {
			offset += $(this).outerWidth(true);
		});

		this.size.contentWidth = offset;
	},

	/**
	 * Selects a carousel item
	 *
	 * @this {Carousel}
	 * @param {number} index - Index to be selected
	 * @param {object} options - Use silent to avoid triggering events.
	 * @fires carousel:selectionClear - Event to notify that the item has been selected.
	 */
	selectItem: function (index, options) {
		if (!this.isValidItemIndex(index)) {
			console.error("Cannot select item. Invalid index: %d", index);
			return;
		}

		this.clearSelection({silent: true});
		var itemList = this.getItems();
		$(itemList[index]).addClass(SELECTED_CLASS);

		if (!options || !options.silent) {
			this._trigger('carousel:itemSelected', index);
		}
	},

	/**
	 * Clears the item selection
	 *
	 * @this {Carousel}
	 * @param {object} options - Use silent to avoid triggering events.
	 * @fires carousel:selectionClear - Event to notify that the selection has been cleared.
	 */
	clearSelection: function (options) {
		this._getSelectedDOMItems().removeClass(SELECTED_CLASS);

		if (!options || !options.silent) {
			this._trigger('carousel:selectionClear');
		}
	},

	/**
	 * Returns the selected carousel item index
	 *
	 * @this {Carousel}
	 * @return {number} If found, returns the selected index. -1 if not item is selected.
	 */
	getSelectedIndex: function () {
		var item = this._getSelectedDOMItems();

		if (item) {
			return item.index();
		}

		return -1;
	},

	/**
	 * Appends a carousel item into the carousel
	 *
	 * @this {Carousel}
	 * @param {object} item - Item to be added
	 * @param {boolean} batchMode - If true, then no events are thrown and no UI refresh actions are performed
	 * @fires carousel:pageAdded - Event to notify that item added has created a new page.
	 * @fires carousel:itemAdded - Event to notify that item has been added.
	 */
	addItem: function (item, batchMode) {

		var pageCount = this.getPageCount();
		var carouselItemInnerHtml = this.settings.itemTemplate(item);

		var $carouselItem = $('<div class="carousel-item"></div>');

		this.loadingModule.preLoadItem($carouselItem, carouselItemInnerHtml);

		$carouselItem.click($.proxy(this.selectItemHandlerMouse, this));
		$carouselItem.on('itemTouched', $.proxy(this.selectItemHandlerTouch, this));

		if (!batchMode) {
			this.loadingModule.loadItem($carouselItem);
			this._processAddedItem($carouselItem);

			var pageIndex = this.pagingModule.getPageIndex($carouselItem.index());
			if (pageIndex === pageCount) {
				this.pagingModule.addPage();
				this._trigger('carousel:pageAdded', [pageIndex]);
			}

			if (pageIndex === this.getCurrentPage()) {
				// This is done for the case there were no pages and we added the first item. We want the indicator
				// to appear as selected
				this.pagingModule.updateUI();

				this.animationModule.setItemVisible($carouselItem);
			}

			this._updateNavigators();

			this._trigger('carousel:itemAdded', [item, $carouselItem]);
		}
	},

	/**
	 * Renders the carousel with their items
	 *
	 * @this {Carousel}
	 * @param {array} items - Items to be rendered.
	 * @fires carousel:rendered - Event to notify that the rendering is ready.
	 */
	render: function (items) {
		this._createContainer();
		this._initLoadingModule();

		this.clear({ silent: true });

		var self = this;

		$.each(items, function (i, e) {
			self.addItem(e, true);
		});

		this._initAnimationModule();


		if (this.animationModule.supportsTouch()) {
			if (this.settings.touchEnabled) {
				this._initDraggingModule();
				this._hideIndicators();
			}
		} else {
			if (this._isTouchDevice()) {
				this._showNavigationArrows();
			}
		}

		this._processAddedItems();

		if (this.settings.pagingIndicators) {
			this.pagingModule.renderIndicator();
		}

		this._makeFirstPageVisible();

		this.size.overviewWidth = this._getOverviewWidth();

		this.refreshContentWidth();
		this._updateNavigators();

		this._startAutomaticPaging();

		this._trigger('carousel:rendered');
	},

	//***************************Private Methods**********************************************

	_initPaginationModule: function () {

		var api = {
			container: this.$viewport,
			getItemCount: $.proxy(this.getItemCount, this),
			getItemsForPage: $.proxy(this._getDOMItemsForPage, this),
			getItemsForCurrentPage: $.proxy(this._getDOMItemsForCurrentPage, this)
		};

		this.pagingModule = new PaginationModule(api, {
			pageSize: this.settings.pageSize,
			circularNavigation: this.settings.circularNavigation,
			onPageSelected: $.proxy(function (pageIndex) {
				this._disableNavigators();
				this.goToPage(pageIndex);
			}, this)
		});
	},

	_initAnimationModule: function () {

		var api = {
			container: this.$overview,
			getCurrentPage: $.proxy(this.getCurrentPage, this),
			getItemsForPage: $.proxy(this._getDOMItemsForPage, this),
			getItemsForCurrentPage: $.proxy(this._getDOMItemsForCurrentPage, this)
		};

		var animationOptions = {
			animationType: this.settings.animationType,
			animationSpeed: this.settings.moveSpeed,
			pageSize: this.settings.pageSize,
			size: this.size,
			afterAnimationCallback: $.proxy(function () {
				this._updateNavigators();
				this._updatePagingIndicator();
			}, this)
		};

		this.animationModule = new Animation(api, animationOptions);

		var animationEndHandler = function () {
			this._trigger('carousel:pageChangeEnded', [this.pagingModule.getPrevCurrentPage(), this.pagingModule.getCurrentPage()]);
		};

		animationEndHandler = $.proxy(animationEndHandler, this);

		this.$overview.on('animation:finished', animationEndHandler);
	},

	_initDraggingModule: function () {

		var dragModuleOptions = {
			duringDragging: $.proxy(this.updatePageWhileDragging, this),
			afterDragging: $.proxy(this.updatePageAfterDragging, this)
		};

		this.dragModule = new DragSupport(this.$overview, dragModuleOptions);

		var animationStartHandler = function () {
			this.dragModule.disableDragging();
		};

		var animationEndHandler = function () {
			this.dragModule.enableDragging();
		};

		animationStartHandler = $.proxy(animationStartHandler, this);
		animationEndHandler = $.proxy(animationEndHandler, this);

		this.$overview.on('animation:started', animationStartHandler);
		this.$overview.on('animation:finished', animationEndHandler);

		this.$viewport[0].ontouchstart = function(event) { event.stopPropagation(); };
		this.$viewport[0].ontouchend = function(event) { event.stopPropagation(); };
	},

	_initializeResponsiveModule: function (responsive) {
		if (responsive !== false) {
			new responsiveModule({
				getSelectors : $.proxy(this._getCarouselSelectors, this),
				getStylesheet : $.proxy(this._getCarouselStylesheet, this),
			}, this.$viewport, responsive);
		}
	},

	_initLoadingModule: function () {

		var api = {
			container: this.$overview,
			getCurrentPage: $.proxy(this.getCurrentPage, this),
			getItemsForPage: $.proxy(this._getDOMItemsForPage, this),
			getItemsForCurrentPage: $.proxy(this._getDOMItemsForCurrentPage, this)
		};

		var loadingOptions = {
			loadingType: this.settings.loadingType,
			afterLoadedCallback: $.proxy(function () {}, this)
		};

		this.loadingModule = new Loading(api, loadingOptions);
	},

	_createContainer: function () {

		this.$leftIndicator = this.$viewport.children('.left-indicator');
		this.$rightIndicator = this.$viewport.children('.right-indicator');

		if (this.$leftIndicator.length === 0) {
			// No left indicator template was set, using the default template
			this.$viewport.append(leftIndicatorDefaultTemplate);
			this.$leftIndicator = this.$viewport.children('.left-indicator');
		}

		if (this.$rightIndicator.length === 0) {
			// No right indicator template was set, using the default template
			this.$viewport.append(rightIndicatorDefaultTemplate);
			this.$rightIndicator = this.$viewport.children('.right-indicator');
		}

		this.$overview = this.$viewport.children('.overview');

		if (this.$overview.length === 0) {
			this.$viewport.prepend(containerTemplate);
			this.$overview = this.$viewport.children('.overview');
		}

		this.$overview.css('left', '0%');
	},

	_processAddedItems: function () {
		var itemList = this.getItems();

		for (var i = 0; i < itemList.length; i++) {
			var $item = $(itemList[i]);
			this._processAddedItem($item);
			this.size.itemWidth = $item.outerWidth(true);
		}
	},

	_processAddedItem: function($item) {
		this.animationModule.initItem($item);
		$item.css({'width': this.size.itemWidthPct + "%"});
	},

	_hasNextPage: function () {
		return this.pagingModule.hasNextPage();
	},

	_hasPrevPage: function () {
		return this.pagingModule.hasPrevPage();
	},

	_updateNavigators: function () {

		this.$leftIndicator.off('click', this.leftIndicatorClickHandler);
		this.$rightIndicator.off('click', this.rightIndicatorClickHandler);

		// Process indicators visibility
		var alwaysShowNavigationArrows = (this.settings.showNavigationArrows && this.settings.showNavigationArrows !== 'auto');

		var displayBlock = this.settings.circularNavigation || alwaysShowNavigationArrows;
		var displayNone = !this.settings.showNavigationArrows;

		if (displayBlock) {
			this.$rightIndicator.css('display', 'block');
			this.$leftIndicator.css('display', 'block');
		} else if (displayNone) {
			this.$rightIndicator.css('display', 'none');
			this.$leftIndicator.css('display', 'none');
		} else {
			// The visibility depends on the page
			this.$leftIndicator.css('display', (this._hasPrevPage() ? 'block' : 'none'));
			this.$rightIndicator.css('display', (this._hasNextPage() ? 'block' : 'none'));
		}

		if (alwaysShowNavigationArrows) {
			this._showNavigationArrows();
		}

		// Process indicators event handling
		var alwaysHandleEvents = this.settings.circularNavigation;

		if (alwaysHandleEvents) {
			this.$leftIndicator.on('click', this.leftIndicatorClickHandler);
			this.$rightIndicator.on('click', this.rightIndicatorClickHandler);
		} else if(!displayNone) {

			if (this._hasPrevPage()) {
				this.$leftIndicator.on('click', this.leftIndicatorClickHandler);
			}

			if (this._hasNextPage()) {
				this.$rightIndicator.on('click', this.rightIndicatorClickHandler);
			}
		}
	},

	_getOverviewWidth: function () {
		return this.$viewport.width();
	},

	_updatePagingIndicator: function () {
		this.pagingModule.updateUI();
		this.pagingModule.enableUI();
	},

	_makeFirstPageVisible: function () {
		this.loadingModule.loadItem(this._getDOMItemsForCurrentPage());

		this.pagingModule.goToPage(this.getCurrentPage(), {force: true});
		this.animationModule.setItemVisible(this._getDOMItemsForCurrentPage());
	},

	_getCurrentOffset: function () {
		return util.getPixels(this.$overview, 'left');
	},

	_isTouchDevice: function () {
		try {
			document.createEvent("TouchEvent");
			return true;
		} catch (e) {
			return false;
		}
	},

	_startAutomaticPaging: function () {
		if (this.settings.pageInterval > 0) {
			var pagingFunction = function () {
				this.goToPage(this.pagingModule.getNextPage());
			};

			var pausePaging = function() {
				if (this.pagingInterval) {
					clearInterval(this.pagingInterval);
				}
			};

			var resumePaging = function() {
				this.pagingInterval = setInterval(pagingFunction, this.settings.pageInterval);
			};

			pagingFunction = $.proxy(pagingFunction, this);
			pausePaging = $.proxy(pausePaging, this);
			resumePaging = $.proxy(resumePaging, this);

			this.pagingInterval = setInterval(pagingFunction, this.settings.pageInterval);

			if (this._isTouchDevice()) {
				this.$viewport[0].ontouchstart = pausePaging;
				this.$viewport[0].ontouchend = resumePaging;
			} else {
				this.$viewport.on('mouseenter', pausePaging);
				this.$viewport.on('mouseleave', resumePaging);
			}
		}
	},

	_showNavigationArrows: function () {
		var indicatorsOpacity = 0.7;
		this.$leftIndicator.css('opacity', indicatorsOpacity);
		this.$rightIndicator.css('opacity', indicatorsOpacity);
	},

	_hideIndicators: function () {
		this.$leftIndicator.css('display', 'none');
		this.$rightIndicator.css('display', 'none');
	},

	_disableNavigators: function () {
		if (this.settings.animationType === 'slide') {
			this.$leftIndicator.off('click', this.leftIndicatorClickHandler);
			this.$rightIndicator.off('click', this.rightIndicatorClickHandler);
			this.pagingModule.disableUI();
		}
	},

	_trigger: function (eventName, params) {
		$(this).trigger(eventName, params);
		this.$viewport.trigger(eventName, params);
	},

	//Retrieves the carousel selectors to search for CSS values by priority order.
	_getCarouselSelectors: function () {
		var classes = [], perm = [];

		function getCombinations(chars) {
			var result = [],
			f = function(prefix, chars) {
				for (var i = 0; i < chars.length; i++) {
					result.push(prefix + chars[i]);
					f(prefix + chars[i], chars.slice(i + 1));
				}
			};
			f('', chars);
			return result;
		}

		function orderByRelevance(classes) {
			$.each(classes, function(i, className) {
					classes[i] = {className : className, weight: className.split(".").length };
			});

			var ordered = [], aux, i, j;
			for (i = 0; i < classes.length; i += 1) {
				for (j = classes.length - 2; j >= i ; j -= 1) {
					if (classes[j + 1].weight > classes[j].weight) {
						aux = classes[j];
						classes[j] = classes[j + 1];
						classes[j + 1] = aux;
					}
				}
				ordered.push(classes[i].className);
			}
			return ordered;
		}


		function permute(input) {
		var permArr = [], usedChars = [], concatResult =[];

		function main(input) {
			var i, ch;
			for (i = 0; i < input.length; i+= 1) {
				ch = input.splice(i, 1)[0];
				usedChars.push(ch);
				if (input.length === 0) {
					permArr.push(usedChars.slice());
				}
				main(input);
				input.splice(i, 0, ch);
				usedChars.pop();
			}
			return permArr;
		}

		permArr = main(input);
		$.each(permArr, function(i, val){
			concatResult.push(val.join(''));
			});
		return concatResult;
		}

		if (!this.carouselSelectors) {
			if (typeof(this.$viewport.attr('class')) !== 'undefined') {
				//appends dots at the beggining of each word.
				classes = (" " + this.$viewport.attr('class')).replace(/\s/g," .").split(" ");
				classes = classes.slice(1, classes.length);
				classes = getCombinations(classes);

				$.each(classes, function(i, className) {
					var classes = className.replace(/\./g, ",.").split(",");
					classes = classes.slice(1, classes.length);
					if (classes.length > 1) {
						perm = perm.concat(permute(classes));
					} else {
						perm = perm.concat(classes);
					}
				});

				classes = orderByRelevance(perm);
			}

			if (typeof(this.$viewport.attr('id')) !== 'undefined') {
				classes.unshift("#" + this.$viewport.attr('id'));
			}
			this.carouselSelectors = classes;
		}

		return this.carouselSelectors;
	},

	//Among loaded stylesheets it seeks for carousel one.
	_getCarouselStylesheet: function() {
		var carouselStyleSheet, carouselSelectors = this._getCarouselSelectors();
		$.each(document.styleSheets, function(index, styleSheet){
			var found = false;
			if (styleSheet.cssRules) {
				$.each(styleSheet.cssRules,function(index, CSSStyleRule) {
					if (carouselSelectors.indexOf(CSSStyleRule.selectorText) !== -1) {
						carouselStyleSheet = styleSheet;
						found = true;
						return !found;
					}
				});
			}
			return !found;
		});
		return carouselStyleSheet;
	},

	_getSelectedDOMItems: function () {
		return this.$overview.children('.' + SELECTED_CLASS);
	},

	_getDOMItemsForPage: function (pageNumber) {
		var $items = this.getItems();

		return $($.map(this.pagingModule.getIndicesForPage(pageNumber), function (val) {
			return $items[val];
		}));
	},

	_getDOMItemsForCurrentPage: function () {
		return this._getDOMItemsForPage(this.getCurrentPage());
	},

	//************************************Event Handlers***************************************

	selectItemHandlerTouch: function (e) {
		return this.selectItemCommonHandler(e);
	},

	/**
	 * Handles the event when an item is selected with the mouse click.
	 *
	 * @this {Carousel}
	 * @param {event} event - Event containing the clicked item.
	 */
	selectItemHandlerMouse: function (event) {

		if (this.dragModule) {
			if (this.dragModule.finishDragging) {
				this.dragModule.finishDragging = false;
				return false;
			}
		}

		return this.selectItemCommonHandler(event);
	},


	/**
	 * Handles the item selected event.
	 *
	 * @this {Carousel}
	 * @param {event} event - Event containing the selected item.
	 */
	selectItemCommonHandler: function (event) {
		var $selectedItem = $(event.currentTarget);

		var index = $selectedItem.index();
		console.debug('Item of position %d selected', index);
		this.animationModule.pagingAnimation = false;
		this.selectItem(index);

		return false;
	},

	/**
	 * Handles the previous indicator click event.
	 *
	 * @this {Carousel}
	 */
	leftIndicatorClickHandler: function () {
		if (this.animationModule.pagingAnimation) {
			console.debug('Carousel is currently moving. This backwards movement has been cancelled');
			return false;
		}
		this._disableNavigators();
		this.goToPage(this.pagingModule.getPrevPage());
	},

	/**
	 * Handles the next indicator click event.
	 *
	 * @this {Carousel}
	 */
	rightIndicatorClickHandler: function () {
		if (this.animationModule.pagingAnimation) {
			console.debug('Carousel is currently moving. This forward movement has been cancelled');
			return false;
		}
		this._disableNavigators();
		this.goToPage(this.pagingModule.getNextPage());
	},

	/**
	 * Updates the page while the dragging action is being performed
	 *
	 * @this {Carousel}
	 * @param {$object} $element - Event target
	 * @param {number} diff - Difference with the dragging distance.
	 */
	updatePageWhileDragging: function ($element, diff) {
		var currentOffset = this._getCurrentOffset();

		var overviewWidth = this.$overview.width();

		diff = (diff / overviewWidth) * overviewWidth;
		diff = diff * 100 / overviewWidth;

		var positionDifference = (currentOffset - diff);

		console.log('updatePageWhileDragging, currentOffset: ' + this.$overview[0].style.left + ', difference: ' + diff);

		if (positionDifference >= 30 || positionDifference > -(this.size.contentWidth + 30)) {
			$element.css('left', positionDifference + '%');
			this._updateNavigators();
		}
	},

	/**
	 * Updates the page after dragging
	 *
	 * @this {Carousel}
	 * @param {number} initialPageX - Page where the dragging action was started
	 * @param {object} event - Event with the dragging info.
	 */
	updatePageAfterDragging: function (initialPageX, event) {

		var currentPage = this.getCurrentPage();
		var lastPageIndex = this.pagingModule.getLastPage();

		var diffPosition = initialPageX - event.pageX;
		var rightMovement = (diffPosition > 0);

		if ((currentPage === lastPageIndex) && rightMovement) {
			// Go to the last page
			console.log('Move to last page');
			this.goToLastPage();
		} else if ((currentPage === 0) && !rightMovement) {
			// Go to the first page
			console.log('Move to first page');
			this.goToPage(0);
		} else {

			if (Math.abs(diffPosition) > (this.size.itemWidth / 4)) {
				// The dragging movement was long enough to change pages.
				if (rightMovement) {
					console.log('Move forward');
					this.goToPage(this.pagingModule.getNextPage());
				} else {
					console.log('Move backward');
					this.goToPage(this.pagingModule.getPrevPage());
				}
			} else {
				// The dragging movement didn't cause a page change.
				console.log('Stay in the same page');
				this.animationModule.animateToCurrentPage();
			}
		}
	},

	/**
	 * Handles the animation finished event
	 *
	 * @this {Carousel}
	 */
	afterAnimationHandler: function () {},


	/**
	 * Loads the proxies withing the current page
	 *
	 * @this {Carousel}
	 */
	loadProxies: function () {
		this.loadingModule(this._getDOMItemsForCurrentPage());
	}

});

},{"./animation/animation-module":37,"./console-shim-module":42,"./dragging-module":43,"./loading/loading-module":50,"./pagination/paging-module":53,"./responsive-module":54,"./util":55,"class":"hHRmiF","jquery":"lrHQu6"}],42:[function(require,module,exports){
/**
* Returns a function which calls the specified function in the specified
* scope.
*
* @param {Function} func
*            The function to call.
* @param {Object} scope
*            The scope to call the function in.
* @param {...*} args
*            Additional arguments to pass to the bound function.
* @returns {function(...[*]): undefined}
*            The bound function.
*/

var util = require('./util');

var bind = function(func, scope)
{
	var fixedArgs = Array.prototype.slice.call(arguments, 2);
	return function()
	{
		var args = fixedArgs.concat(Array.prototype.slice.call(arguments, 0));
		(/** @type {Function} */ func).apply(scope, args);
	};
};

var execute = function() {

	// Create console if not present
	if (!window["console"]) {
		window.console = /** @type {Console} */ ({});
	}
	var console = (/** @type {Object} */ window.console);

	// Implement console log if needed
	if (!console["log"])
	{
		// Use log4javascript if present
		if (window["log4javascript"])
		{
			var log = window.log4javascript.getDefaultLogger();
			console.log = bind(log.info, log);
			console.debug = bind(log.debug, log);
			console.info = bind(log.info, log);
			console.warn = bind(log.warn, log);
			console.error = bind(log.error, log);
		}
		
		// Use empty dummy implementation to ignore logging
		else {
			console.log = /** @param {...*} args */ function() {};
		}
	}

	// Implement other log levels to console.log if missing
	if (!console["debug"]) {
		console.debug = console.log;
	}
	if (!console["info"]) {
		console.info = console.log;
	}
	if (!console["warn"]) {
		console.warn = console.log;
	}
	if (!console["error"]) {
		console.error = console.log;
	}   

	// Wrap the log methods in IE (<=9) because their argument handling is wrong
	// This wrapping is also done if the __consoleShimTest__ symbol is set. This
	// is needed for unit testing.
	var ieVersion = util.isIE();
	if (window["__consoleShimTest__"] != null || 
		(ieVersion !== false && ieVersion <= 9))
	{
		/**
		 * Wraps the call to a real IE logging method. Modifies the arguments so
		 * parameters which are not represented by a placeholder are properly
		 * printed with a space character as separator.
		 *
		 * @param {...*} args
		 *            The function arguments. First argument is the log function
		 *            to call, the other arguments are the log arguments.
		 */
		var wrap = function(args)
		{
			var i, max, match, log;
			
			// Convert argument list to real array
			args = Array.prototype.slice.call(arguments, 0);
			
			// First argument is the log method to call
			log = args.shift();
			
			max = args.length;
			if (max > 1 && window["__consoleShimTest__"] !== false)
			{
				// When first parameter is not a string then add a format string to
				// the argument list so we are able to modify it in the next stop
				if (typeof(args[0]) !== "string")
				{
					args.unshift("%o");
					max += 1;
				}
				
				// For each additional parameter which has no placeholder in the
				// format string we add another placeholder separated with a
				// space character.
				match = args[0].match(/%[a-z]/g);
				for (i = match ? match.length + 1 : 1; i < max; i += 1)
				{
					args[0] += " %o";
				}
			}
			Function.apply.call(log, console, args);
		};
		
		// Wrap the native log methods of IE to fix argument output problems
		console.log = bind(wrap, window, console.log);
		console.debug = bind(wrap, window, console.debug);
		console.info = bind(wrap, window, console.info);
		console.warn = bind(wrap, window, console.warn);
		console.error = bind(wrap, window, console.error);
	}

	// Implement console.assert if missing
	if (!console["assert"])
	{
		console["assert"] = function()
		{
			var args = Array.prototype.slice.call(arguments, 0);
			var expr = args.shift();
			if (!expr)
			{
				args[0] = "Assertion failed: " + args[0];
				console.error.apply(console, args);
			}
		};
	}

	// Linking console.dir and console.dirxml to the console.log method if
	// missing. Hopefully the browser already logs objects and DOM nodes as a
	// tree.
	if (!console["dir"]) {
		console["dir"] = console.log;
	}
	if (!console["dirxml"]) {
		console["dirxml"] = console.log;
	}

	// Linking console.exception to console.error. This is not the same but
	// at least some error message is displayed.
	if (!console["exception"]) {
		console["exception"] = console.error;
	}

	// Implement console.time and console.timeEnd if one of them is missing
	if (!console["time"] || !console["timeEnd"])
	{
		var timers = {};
		console["time"] = function(id)
		{
			timers[id] = new Date().getTime();
		};
		console["timeEnd"] = function(id)
		{
			var start = timers[id];
			if (start)
			{
				console.log(id + ": " + (new Date().getTime() - start) + "ms");
				delete timers[id];
			}
		};
	}

	// Implement console.table if missing
	if (!console["table"])
	{
		console["table"] = function(data, columns)
		{
			var i, iMax, row, j, jMax, k;
			
			// Do nothing if data has wrong type or no data was specified
			if (!data || !(data instanceof Array) || !data.length) {
				return;
			}

			// Auto-calculate columns array if not set
			if (!columns || !(columns instanceof Array))
			{
				columns = [];
				for (k in data[0])
				{
					if (!data[0].hasOwnProperty(k)) {
						continue;
					}
					columns.push(k);
				}
			}
			
			for (i = 0, iMax = data.length; i < iMax; i += 1)
			{
				row = [];
				for (j = 0, jMax = columns.length; j < jMax; j += 1)
				{
					row.push(data[i][columns[j]]);
				}
				
				Function.apply.call(console.log, console, row);
			}
		};
	}

	// Dummy implementations of other console features to prevent error messages
	// in browsers not supporting it.
	if (!console["clear"]) {
		console["clear"] = function() {};
	}
	if (!console["trace"]) {
		console["trace"] = function() {};
	}
	if (!console["group"]) {
		console["group"] = function() {};
	}
	if (!console["groupCollapsed"]) {
		console["groupCollapsed"] = function() {};
	}
	if (!console["groupEnd"]) {
		console["groupEnd"] = function() {};
	}
	if (!console["timeStamp"]) {
		console["timeStamp"] = function() {};
	}
	if (!console["profile"]) {
		console["profile"] = function() {};
	}
	if (!console["profileEnd"]) {
		console["profileEnd"] = function() {};
	}
	if (!console["count"]) {
		console["count"] = function() {};
	}

};

module.exports = execute;
},{"./util":55}],43:[function(require,module,exports){
var $ = require('jquery');
var Class = require('class');

/**
 *  Dragging module which makes the carousel touch-enabled.
 *	@module carousel/dragging
 */
var DragSupport = Class.extend({

  // Max delay between touch down and touch up that is considered to be a click
  touchClickDelayMS: 300,

  init: function($element, options) {

    this.updatePageWhileDragging = options.duringDragging;
    this.updatePageAfterDragging = options.afterDragging;

    this.$element = $element;

    this.initialPageX = 0;
    this.currentPageX = 0;

    this.isDragging = false;
    this.finishDragging = false;

    // Define proxies for each event handler to keep using this as the DragSupport instance.
    this.startTouchHandlerProxy = $.proxy(this.startTouchHandler, this);
    this.mouseDownHandlerProxy = $.proxy(this.mouseDownHandler, this);

    this.dragHandlerProxy = $.proxy(this.dragHandler, this);

    this.endTouchHandlerProxy = $.proxy(this.endTouchHandler, this);
    this.mouseUpHandlerProxy = $.proxy(this.mouseUpHandler, this);

    this._enableStartEvents();
  },

  isTouchDevice: function() {
    try {
      document.createEvent("TouchEvent");
      return true;
    } catch (e) {
      return false;
    }
  },

  startTouchHandler: function(event) {

    this.touchStartTime = new Date();

    $( "body" ).addClass( "noSelect" );

    var eventData = event.touches[0];

    this.$element[0].ontouchmove = this.dragHandlerProxy;
    this.$element[0].ontouchend = this.endTouchHandlerProxy;
    this.$element[0].ontouchcancel = this.endTouchHandlerProxy;

    document.ontouchmove = this.dragHandlerProxy;
    document.ontouchend = this.endTouchHandlerProxy;
    document.ontouchcancel = this.endTouchHandlerProxy;

    console.debug('Start touch handler, pageX: ' + eventData.pageX);

    this.initialPageX = this.currentPageX = eventData.pageX;
  },

  mouseDownHandler: function(event) {

    this.touchStartTime = new Date();

    event.stopPropagation();

    $( "body" ).addClass( "noSelect" );

    this.$element.on('mousemove', this.dragHandlerProxy);
    this.$element.on('mouseup', this.mouseUpHandlerProxy);

    $(document).on('mousemove', this.dragHandlerProxy);
    $(document).on('mouseup', this.mouseUpHandlerProxy);

    console.debug('Start touch handler, pageX: ' + event.pageX);

    this.initialPageX = this.currentPageX = event.pageX;

    return false;
  },

  dragHandler: function(event) {

    event.preventDefault();

    this.isDragging = true;

    var eventData = event;
    if (this.isTouchDevice()) {
      eventData = event.touches[0];
    }

    var diff = (this.currentPageX - eventData.pageX);
    this.currentPageX = eventData.pageX;

    if (diff === 0) {
			// Skip this event, is duplicated
			return false;
    }

    console.debug('Move touch handler, pageX: ' + this.currentPageX);

    this.updatePageWhileDragging(this.$element, diff);

    this.finishDragging = true;

    return false;
  },

  endTouchHandler: function(event) {

    console.debug('End touch handler');

    var now = new Date();

    var eventData = event;
    if (this.isTouchDevice()) {
      eventData = event.changedTouches[0];
    }

    var diffPosition = this.initialPageX - eventData.pageX;

    this.isDragging = false;

    $( "body" ).removeClass( "noSelect" );

    this.$element[0].ontouchmove = null;
    this.$element[0].ontouchend = null;
    document.ontouchmove = null;
    document.ontouchend = null;

    // If user is not dragging and the delay between touch down and up is smaill enough, consider it a 'click'
    if ( ((diffPosition === 0) || !this.isDragging) && (now.getTime() - this.touchStartTime.getTime() < this.touchClickDelayMS) ) {
      // The user wants to select and item
      $(event.target).trigger('itemTouched');
    } else {
      this.updatePageAfterDragging(this.initialPageX, eventData);
    }
  },

  mouseUpHandler: function(event) {

    console.debug('End touch handler');

    var now = new Date();

    var diffPosition = this.initialPageX - event.pageX;
    var timeDiff = now.getTime() - this.touchStartTime.getTime();

    $( "body" ).removeClass( "noSelect" );

    this.$element.off('mousemove', this.dragHandlerProxy);
    this.$element.off('mouseup', this.mouseUpHandlerProxy);
    $(document).off('mousemove', this.dragHandlerProxy);
    $(document).off('mouseup', this.mouseUpHandlerProxy);

    // If user is not dragging and the delay between touch down and up is small enough, consider it a 'click'
    if ( (diffPosition === 0) && (timeDiff > 0 && timeDiff < this.touchClickDelayMS) ) {
      // The user wants to select and item
      $(event.target).trigger('itemTouched');
    } else {
      this.updatePageAfterDragging(this.initialPageX, event);
    }

    return false;
  },

  _enableStartEvents: function() {
		if (this.isTouchDevice()) {
      this.$element[0].ontouchstart = this.startTouchHandlerProxy;
    } else {
      this.$element.on('mousedown', this.mouseDownHandlerProxy);
    }
  },

  _disableStartEvents: function() {
		if (this.isTouchDevice()) {
      this.$element[0].ontouchstart = null;
    } else {
      this.$element.off('mousedown', this.mouseDownHandlerProxy);
    }
  },

  disableDragging: function() {
		console.log('Disable dragging');
		this._disableStartEvents();
  },

  enableDragging: function() {
		console.log('Enable dragging');
		this._enableStartEvents();
  }

});

// Exports the class
module.exports = DragSupport;

},{"class":"hHRmiF","jquery":"lrHQu6"}],44:[function(require,module,exports){
/**
 * jQuery plugin wrapper
 */
require('jquery-plugin-wrapper').wrap("xnCarousel", require('./carousel'), require('jquery'));

},{"./carousel":41,"jquery":"lrHQu6","jquery-plugin-wrapper":29}],"lrHQu6":[function(require,module,exports){
/**
 * Helper module to adapt jQuery to CommonJS
 *
 */
module.exports = jQuery;

},{}],"jquery":[function(require,module,exports){
module.exports=require('lrHQu6');
},{}],47:[function(require,module,exports){
var Class = require('class');

module.exports = Class.extend({

	init: function (loadingObject) {
		this.loadingObject = loadingObject;
	},

	preLoad: function () {},
	
	load: function () {},

	postLoad: function () {}
	
});

},{"class":"hHRmiF"}],48:[function(require,module,exports){
var $ = require('jquery');

var AbstractStrategy = require('./abstract-strategy');
var Spinner = require('./spinner');

module.exports = AbstractStrategy.extend({

	init: function(loadingObject) {
		this._super(loadingObject);
		this.spinner = new Spinner();
	},

	preLoad: function ($item, carouselItemInnerHtml) {
		console.log('Preloading item');

		var imgSrcAltered =  carouselItemInnerHtml.replace(' src=', ' data-src=');
		var $itemContent = $(imgSrcAltered); 

		$item.append($itemContent);
		$item.addClass('loading');

		this.loadingObject.$overview.append($item);

		var self = this;
		$item.find('img[data-src]').each(function(){
			var src  = $(this).attr('data-src');
			$(this).attr('src',src).error(self, self.postLoad).load(self, self.postLoad);
			$(this).removeAttr('data-src');
			self.spinner.showSpinner($(this));
		});
	},
	
	load: function ($item) {
		console.log('Loading item', $item);

	},

	postLoad: function (event) {
		console.log('After loaded');
		$(this).parents('.carousel-item').removeClass('loading');
		var self = event.data;
		self.spinner.hideSpinner($(this));
		self.loadingObject.afterLoaded();
	}

});

},{"./abstract-strategy":47,"./spinner":51,"jquery":"lrHQu6"}],49:[function(require,module,exports){
var $ = require('jquery');

var AbstractStrategy = require('./abstract-strategy');
var Spinner = require('./spinner');

module.exports = AbstractStrategy.extend({

	init: function(loadingObject) {
		this._super(loadingObject);
		this.spinner = new Spinner();
	},

	preLoad: function ($item, carouselItemInnerHtml) {
		console.debug('Preloading item');

		var imgSrcAltered =  carouselItemInnerHtml.replace(' src=', ' data-src=');
		var $itemContent = $(imgSrcAltered); 

		$item.append($itemContent);
		$item.addClass('proxy');

		this.loadingObject.$overview.append($item);
	},
	
	load: function ($item) {
		console.debug('Loading item');
		var self = this;
		$item.removeClass('proxy');
		$item.addClass('loading');
		$item.find('img[data-src]').each(function(){
			var src  = $(this).attr('data-src');
			$(this).attr('src',src).error(self, self.postLoad).load(self, self.postLoad);
			$(this).removeAttr('data-src');
			self.spinner.showSpinner($(this));
		});
	},

	postLoad: function (event) {
		console.debug('After loaded');
		var self = event.data;
		$(this).parents('.carousel-item').removeClass('loading');
		self.spinner.hideSpinner($(this));
		self.loadingObject.afterLoaded();
	}

});

},{"./abstract-strategy":47,"./spinner":51,"jquery":"lrHQu6"}],50:[function(require,module,exports){
var Class = require('class');

var LazyStrategy = require('./lazy-strategy');
var EagerStrategy = require('./eager-strategy');

/** 
 *	Module to control the carousel items/page loading.
 *  Supports multiple stategies such as lazy and eager.
 *
 * @module carousel/loading 
 */
module.exports = Class.extend({

	/**
	 * Initializes the loading module
	 *
	 * @param {object} api - Carousel API  
	 * @param {object} options - Options object to initialize the module	 
	 * @this {LoadingModule}
	 */
	init: function (api, options) {

		this.carouselApi = api;
		this.$overview = api.container;
		this.loadingType = options.loadingType;
		this.afterLoadedCallback = options.afterLoadedCallback;

		this.loadingStrategy = this._getStrategy();
	},

	/**
	 * Pre loads an item, loading the frame before loading the resources
	 *
	 * @param {object} $item - Jquery item object to be preloaded  
	 * @param {string} carouselItemInnerHtml - String with the item content to be appended
	 * @this {LoadingModule}
	 */
	preLoadItem: function ($item, carouselItemInnerHtml) {
		this.loadingStrategy.preLoad($item, carouselItemInnerHtml);
	},

	/**
	 * Loads an item and creates the loading requests.
	 *
	 * @param {object} $item - Jquery item object to be loaded  
	 * @this {LoadingModule}
	 */
	loadItem: function ($item) {
		this.loadingStrategy.load($item);
	},

	/**
	 * Method that delegates the callback after the requests are received.
	 *
	 * @this {LoadingModule}
	 */
	afterLoaded: function () {
		var callback = this.afterLoadedCallback;
		var self = this;

		if (callback) {
			callback.call(self);
		}
	},

	/**
	 * Returns the strategy given the specified loading type option.
	 *
	 * @private
	 * @this {LoadingModule}
	 */
	_getStrategy: function () {
		if (this.loadingType === 'lazy') {
			return new LazyStrategy(this);
		}else{
			return new EagerStrategy(this);
		}
	},

});

},{"./eager-strategy":48,"./lazy-strategy":49,"class":"hHRmiF"}],51:[function(require,module,exports){
var Class = require('class'),
SpinJs = require('spin.js'),
$ = require('jquery');


module.exports = Class.extend({

    init: function (options) {

       var defaults = {
            lines: 11, // The number of lines to draw
            length: 3, // The length of each line
            width: 5, // The line thickness
            radius: 8, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#000', // #rgb or #rrggbb
            speed: 2, // Rounds per second
            trail: 30, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: true, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 99, // The z-index
            top: '0', // Top position relative to parent
            left: '0' // Left position relative to parent
        };

        this.options = $.extend({}, defaults, options);
        this.loadingElements = [];
        this.$spinners = [];
    },

    showSpinner: function ($loadingElement) {
        var $spinner = $('<div></div>'), $spinnerChild, rules, height, width;
        this.loadingElements.push($loadingElement[0]);

        //create new spinner
        $spinner.addClass("spinnerElement");
        new SpinJs(this.options).spin($spinner[0]);
        this.$spinners.push($spinner);

        //take loading element shape
        rules = window.getComputedStyle($loadingElement[0]);
        $.each(['position', 'margin', 'padding'], function(i, el) {
            $spinner.css(el,rules[el]);
        });

        $loadingElement.parent().append($spinner[0]);

        //Transform spinner fixed container size to a relative one.
        height = 0; width = 0;
        if ($loadingElement[0].clientHeight > 0 && $spinner.parent().height() > 0) {
            height = $loadingElement[0].clientHeight * 100 / $spinner.parent().height();
        } 
        if (height === 0 || height > 100) {
            height = 100;
        }

        if ($loadingElement[0].clientWidth > 0 && $spinner.parent().width() > 0) {
            width = $loadingElement[0].clientWidth * 100 / $spinner.parent().width();
        } 
        if (width === 0 || width > 100) {
            width = 100;
        }

        $spinner.css('height', height + "%");
        $spinner.css('width', width + "%");

        $spinnerChild = $spinner.find('.spinner');
        $spinnerChild.css('height', '100%');
        $spinnerChild.css('width', '100%');

        var self = this, $el;
        $.each($spinnerChild.children(), function(i,el){
            $el = $(el);
            $el.height('100%');
            $el.width('100%');

            //measure in pixels to translate in case default size looks ridiculous for the actual viewport size.
            var size = 11;
            height = self.options.length;
            width = self.options.width;

            if ((0.01 * width) * $el.width() > size ) {
                width = size / 1.2 * 100 / $el.width();
                height = 2.3 * 100 / $el.height();
            }

            $($el.children()[0]).css('width', width + '%');
            $($el.children()[0]).css('height', height + '%');
        });

        $spinnerChild.css('top', '50%');
        $spinnerChild.css('left', '50%');

        $loadingElement.hide();
    },

    hideSpinner: function ($loadingElement) {
        var $spinner = this.$spinners[this.loadingElements.indexOf($loadingElement[0])];
        $spinner.remove();
        $loadingElement.show();
    }
});

},{"class":"hHRmiF","jquery":"lrHQu6","spin.js":35}],52:[function(require,module,exports){
var $ = require('jquery');
var Class = require('class');

var ITEM_CONTAINER_SELECTOR = '.pagination .item-container';
var PAGE_ITEM_SELECTOR = '.item';
var CONTAINER_TEMPLATE = '<div class="pagination"><div class="item-container"></div></div>';
var ITEM_TEMPLATE = '<div class="item"></div>';
var SELECTED_CLASS = 'selected';

var DEFAULTS = {
	onPageSelected: function () {
	},
	pageCount: 0
};

module.exports = Class.extend({
	itemCount: 0,

	init: function ($parent, options) {
		options = $.extend({}, DEFAULTS, options);

		this.notifyPageSelected = options.onPageSelected;

		this.render($parent, options.pageCount);

		this.enablePaginationUI();

		// Set the first page item as selected
		this._getItems().first().addClass(SELECTED_CLASS);
	},

	render: function ($parent, pageCount) {
		this.$itemContainer = this._renderContainer($parent);
		this._renderPageItems(this.$itemContainer, pageCount);

		return this.$itemContainer;
	},

	_renderContainer: function ($parent) {
		var containerTemplate = CONTAINER_TEMPLATE;
		$parent.append(containerTemplate);

		return $parent.find(ITEM_CONTAINER_SELECTOR);
	},

	_renderPageItems: function ($container, pageCount) {
		for (var i = 0; i < pageCount; i++) {
			this.addItem();
		}
	},

	_getItems: function () {
		return this.$itemContainer.find(PAGE_ITEM_SELECTOR);
	},

	addItem: function () {
		this.$itemContainer.append($(ITEM_TEMPLATE));
		this.itemCount++;
	},

	removeItem: function () {
		if (this.itemCount === 0) {
			console.warn("There are no page indicators to remove");
			return;
		}
		this._getItems().last().remove();
		this.itemCount--;
	},

	clear: function() {
		this.itemCount = 0;
		this._getItems().remove();
	},

	select: function (itemIndex) {
		var items = this._getItems();

		items.removeClass(SELECTED_CLASS);
		items.eq(itemIndex).addClass(SELECTED_CLASS);
	},

	onPageItemClick: function (event) {
		var $target = $(event.currentTarget);
		if (!$target.hasClass(SELECTED_CLASS)) {
			var pageIndex = $target.index();
			console.debug('Page item clicked: ' + pageIndex);
			this.select(pageIndex);
			this.notifyPageSelected(pageIndex);
		}
	},

	enablePaginationUI: function () {
		//Prevents appending a handler more than once.
		this.disablePaginationUI();
		this.$itemContainer.on('click', PAGE_ITEM_SELECTOR, $.proxy(this.onPageItemClick, this));
	},

	disablePaginationUI: function () {
		this.$itemContainer.off('click', PAGE_ITEM_SELECTOR);
	}

});

},{"class":"hHRmiF","jquery":"lrHQu6"}],53:[function(require,module,exports){
var Class = require('class');
var PaginationIndicator = require('./paging-indicator.js');

var CURRENT_PAGE_CLASS = 'active';

/**
 *	Module to control the carousel pagination.
 *  Supports multiple customizations such as cirular navigation, page size, callbacks, etc.
 *
 * @module carousel/pagination
 */
module.exports = Class.extend({

	/**
	 * Initializes the pagination module
	 *
	 * @param {object} api - Carousel API
	 * @param {object} options - Options object to initialize the module
	 * @this {PagingModule}
	 */
	init: function (carouselApi, options) {
		this.carouselApi = carouselApi;
		this.onPageSelected = options.onPageSelected;
		this.pageSize = options.pageSize;
		this.circularNavigation = options.circularNavigation;
		this.currentPage = 0;
		this.prevCurrentPage = 0;
	},

	/**
	 * Renders the page indicator
	 *
	 * @this {PagingModule}
	 */
	renderIndicator: function() {
		this.pagingIndicator = new PaginationIndicator(this.carouselApi.container, {
			pageCount: this.getPageCount(),
			onPageSelected: this.onPageSelected
		});
	},

	/**
	 * Retrieves the page count
	 *
	 * @return {number} Page count
	 * @this {PagingModule}
	 */
	getPageCount: function () {
		return Math.ceil(this.carouselApi.getItemCount() / this.pageSize);
	},

	/**
	 * Returns the page number from the specified item index
	 *
	 * @param {number} itemIndex - Item index
	 * @return {number} Item page number.
	 * @this {PagingModule}
	 */
	getPageIndex: function(itemIndex) {
		return ~~(itemIndex / this.pageSize);
	},

	/**
	 * Sets the component current page
	 *
	 * @param {number} pageNumber - Page to be set
	 * @param {object} options - Options to enable or disable the page modification.
	 * @this {PagingModule}
	 */
	goToPage: function(pageNumber, options) {
		if((!options || !options.force) && (pageNumber < 0 || pageNumber >= this.getPageCount())) {
			console.error("Cannot go to page %d. Invalid page", pageNumber);
			return;
		}

		this.carouselApi.getItemsForCurrentPage().removeClass(CURRENT_PAGE_CLASS);
		this.prevCurrentPage = this.currentPage;
		this.currentPage = pageNumber;
		this.carouselApi.getItemsForCurrentPage().addClass(CURRENT_PAGE_CLASS);
	},

	/**
	 * Returns the current page index
	 *
	 * @return {number} Current page index
	 * @this {PagingModule}
	 */
	getCurrentPage: function() {
		return this.currentPage;
	},

	/**
	 * Returns the previous page index
	 *
	 * @return {number} Previous page index
	 * @this {PagingModule}
	 */
	getPrevCurrentPage: function() {
		return this.prevCurrentPage;
	},

	/**
	 * Returns last page index
	 *
	 * @return {number} Last page index
	 * @this {PagingModule}
	 */
	getLastPage: function() {
		return this.getPageCount() - 1;
	},

	/**
	 * Checks if there is a previous page
	 *
	 * @return {boolean} True if there is a previous page. False, if there is not.
	 * @this {PagingModule}
	 */
	hasPrevPage: function() {
		if(this.circularNavigation) { return true; }

		return (this.currentPage > 0);
	},

	/**
	 * Checks if there is a next page
	 *
	 * @return {boolean} True if there is a next page. False, if there is not.
	 * @this {PagingModule}
	 */
	hasNextPage: function() {
		if(this.circularNavigation) { return true; }

		var pageCount = this.getPageCount();
		return (this.currentPage < (pageCount - 1));
	},

	/**
	 * Returns next page index
	 *
	 * @return {number} Next page index
	 * @this {PagingModule}
	 */
	getNextPage: function() {
		// If this is the last page and there's no circular navigation, return the same page
		if(!this.circularNavigation && !this.hasNextPage()) {
			return this.currentPage;
		}

		return (this.currentPage + 1) % this.getPageCount();
	},

	/**
	 * Returns previous page index
	 *
	 * @return {number} Previous page index
	 * @this {PagingModule}
	 */
	getPrevPage: function() {
		// If this is the first page and there's no circular navigation, return the same page
		if(!this.circularNavigation && !this.hasPrevPage()) {
			return this.currentPage;
		}

		var prevPage = (this.currentPage - 1);
		if (prevPage === -1) {
			prevPage = this.getPageCount() - 1;
		}
		return prevPage;
	},

	/**
	 * Returns an array containing the items indices contained in the specified page
	 *
	 * @param {number} pageNumber - Page index
	 * @return {array} Array containing the item's indices contained in the specified page
	 * @this {PagingModule}
	 */
	getIndicesForPage: function(pageNumber) {
		if(pageNumber < 0) { return []; }

		var first = this.pageSize * pageNumber;
		var last = Math.min(first + this.pageSize, this.carouselApi.getItemCount()) - 1;

		var result = [];
		for(var i = first; i <= last; i ++) {
			result.push(i);
		}
		return result;
	},


	/**
	 * Adds a new page to the page indicator
	 *
	 * @this {PagingModule}
	 */
	addPage: function() {
		if (this.pagingIndicator) {
			this.pagingIndicator.addItem();
		}
	},

	/**
	 * Removes a page from the page indicator
	 *
	 * @this {PagingModule}
	 */
	removePage: function() {
		if (this.pagingIndicator) {
			this.pagingIndicator.removeItem();
		}
	},

	/**
	 * Clears the page indicator and set off the previous page
	 *
	 * @this {PagingModule}
	 */
	clear: function() {
		this.currentPage = 0;
		this.prevCurrentPage = 0;
		if (this.pagingIndicator) {
			this.pagingIndicator.clear();
		}
	},

	/**
	 * Refresh the page indicator UI
	 *
	 * @this {PagingModule}
	 */
	updateUI: function() {
		if (this.pagingIndicator) {
			this.pagingIndicator.select(this.currentPage);
		}
	},

	/**
	 * Enables the page indicator UI
	 *
	 * @this {PagingModule}
	 */
	enableUI: function() {
		if (this.pagingIndicator) {
			this.pagingIndicator.enablePaginationUI();
		}
	},

	/**
	 * Disables the page indicator UI
	 *
	 * @this {PagingModule}
	 */
	disableUI: function() {
		if (this.pagingIndicator) {
			this.pagingIndicator.disablePaginationUI();
		}
	}

});

},{"./paging-indicator.js":52,"class":"hHRmiF"}],54:[function(require,module,exports){
var Class = require('class'),
MediaQueryWatcher = require('mediaquerywatcher'),
$ = require('jquery');


/*
*	Given a element its height is calculated based on the actual applied media query.
*/
module.exports = Class.extend({
	init: function (api, $element, activeIntervals) {
		this.api = api;
		this.$element = $element;
		this.activeIntervals = activeIntervals;
		var actualAppliedMediaRule;
		this.mediaStylesProperties = {};
		this.mediaQueryWatcher = new MediaQueryWatcher();
		actualAppliedMediaRule = this.mediaQueryWatcher.addMediaQueriesListener(api.getStylesheet(), $.proxy(this._mediaChangedHandler, this));
		this._setActualMediaProperties(actualAppliedMediaRule, ['height', 'width']);

		this._windowResizedHandler();
		$(window).resize($.proxy(this._windowResizedHandler, this));
	},

	//Determines if this module is active for the actual viewport width based on the provided options.
	_isActiveForViewportWidth : function (actualViewportWidth) {
		if (this.activeIntervals === true) {
			//this module is active in all resolutions
			return true;
		}
		var rule, descending = /\*\.\.([0-9]+)/, ascending = /([0-9]+)\.\.\*/, between = /([0-9]+)\.\.([0-9]+)/;
		for (rule in this.activeIntervals) {
			if (this.activeIntervals.hasOwnProperty(rule)) {
				if (descending.test(rule) === true) {
					if (actualViewportWidth <= descending.exec(rule)[1]) {
						return this.activeIntervals[rule];
					}
				}
				if (between.test(rule) === true) {
					if (actualViewportWidth >= between.exec(rule)[1] && actualViewportWidth <= between.exec(rule)[2]) {
						return this.activeIntervals[rule];
					}
				}
				if (ascending.test(rule) === true) {
					if (actualViewportWidth >= ascending.exec(rule)[1]) {
						return this.activeIntervals[rule];
					}
				}
			}
		}
		return false;
	},

	//Whenever a media query changes, it gets the indicated CSS properties from a target stylesheet.
	_mediaChangedHandler: function (mql) {
		var actualAppliedMediaRule, media,
		mediaQueriesRules = this.mediaQueryWatcher.mediaQueriesRules, exists = false;
		
		//we actually have to know if a media query does not exist for viewport actual state.
		if (mql.matches === false) {
			for (media in mediaQueriesRules) {
				if (mediaQueriesRules.hasOwnProperty(media) === true) {
					exists = this._mediaQueryMatches(media);
					if (exists === true) {
						break;
					}
				}
			}
		}

		if (mql.matches === true || exists === false) {
			
			actualAppliedMediaRule = mql.matches === false ? "noMediaRule" : mql.media;

			this._setActualMediaProperties(actualAppliedMediaRule, ['height', 'width']);
		
			var self = this;
			//defer execution so other action do not invalidate this one.
			setTimeout(function(){
				self._windowResizedHandler();
			},0);
		}
	},

	//Stores the selected CSS properties from a media query for the actual viewport size, to avoid continuous querying.
	_setActualMediaProperties: function (actualAppliedMediaRule, targetProperties) {
		var actualAppliedProperties;

		this.mediaStylesProperties.actualAppliedMediaRule = actualAppliedMediaRule;

		if (typeof(this.mediaStylesProperties[actualAppliedMediaRule]) === 'undefined') {
			actualAppliedProperties = this.mediaQueryWatcher.getMediaQueryProperties(this.mediaQueryWatcher.mediaQueriesRules[actualAppliedMediaRule], this.api.getSelectors(this.$viewport), targetProperties);
			this.mediaStylesProperties[actualAppliedMediaRule] = {};
			this.mediaStylesProperties[actualAppliedMediaRule].actualAppliedProperties = actualAppliedProperties;
			this.mediaStylesProperties[actualAppliedMediaRule].viewportWidth = this._getMediaQueryViewportWidth(actualAppliedMediaRule);
		}
	},

	//Helper to determine wether a mediaQuery applies to the actual viewport size.
	_mediaQueryMatches: function (mediaRule) {
		var min = this._getMediaQueryMinWidth(mediaRule),
		max = this._getMediaQueryMaxWidth(mediaRule),
		viewportWidth = window.innerWidth;
		
		if (min !== null && max !== null) {
			return (viewportWidth >= min && viewportWidth <= max) ? true : false;
		} else if (min !== null) {
			return (viewportWidth >= min) ? true : false;
		} else {
			return (viewportWidth <= max) ? true : false;
		}
	},

	//Parses the media query to obtain width values.
	_getMediaQueryViewportWidth : function (mediaRule) {
		var exprResult = this._getMediaQueryMaxWidth(mediaRule);
		return exprResult !== null ? exprResult :  this._getMediaQueryMinWidth(mediaRule);
	},

		//Parses the media query to obtain width values.
	_getMediaQueryMinWidth : function (mediaRule) {
		var minWidthMediaRuleExpr = /(min-width|min-device-width):\s?([0-9]+)/gi,
		exprResult;

		exprResult = minWidthMediaRuleExpr.exec(mediaRule);
		return exprResult !== null ? exprResult[2] : null;
	},

		//Parses the media query to obtain width values.
	_getMediaQueryMaxWidth : function (mediaRule) {
		var maxWidthMediaRuleExpr = /(max-width|max-device-width):\s?([0-9]+)/gi,
		exprResult;

		exprResult = maxWidthMediaRuleExpr.exec(mediaRule);
		return exprResult !== null ? exprResult[2] : null;
	},

	//Recalculates viewport height of an indicated item to keep aspect ratio.
	_windowResizedHandler: function () {
		var actualAppliedMediaRule = this.mediaStylesProperties.actualAppliedMediaRule, height;
		if (this._isActiveForViewportWidth(window.innerWidth) === true && (actualAppliedMediaRule !== "noMediaRule")) {
				height = window.innerWidth * parseInt(this.mediaStylesProperties[actualAppliedMediaRule].actualAppliedProperties.height, 10) / this.mediaStylesProperties[actualAppliedMediaRule].viewportWidth;
		} else { //Default css behaviour
				height = parseInt(this.mediaStylesProperties[actualAppliedMediaRule].actualAppliedProperties.height, 10);
		}
		this.$element.css('height', height + "px");
		if (this.mediaStylesProperties[actualAppliedMediaRule].actualAppliedProperties.width) {
			this.$element.css('width', this.mediaStylesProperties[actualAppliedMediaRule].actualAppliedProperties.width);
		}
	}
	
});
},{"class":"hHRmiF","jquery":"lrHQu6","mediaquerywatcher":32}],55:[function(require,module,exports){
exports.getDependency = function(dependencies, name, defaultDep) {
	dependencies = dependencies || {};
	return dependencies[name] || defaultDep;
};

exports.trim = function (str) {
  if(!str) { return ''; }
  return (str + '').replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
};

/**
 * @returns true if string is empty. false otherwise.
 */
exports.isEmpty = function (str) {
  return (!exports.trim(str));
};

/**
 * @returns true if the parameter is a string. false otherwise
 */
exports.isString = function (obj) {
  return (typeof obj === 'string');
};

/**
 * Creates a namespace (deep object) starting from the specified root (or window) using the path provided (string separated by ".")
 * @returns an object containing the last parent and the leaf object, so a value can be easily set by using "parent[item] = value"
 */
exports.createDeepVariable = function (path, root) {
  root = root || window; //if no object argument supplied declare a property from is

  var levels = path.split('.');
  var first;
  if(levels.length === 1) {
    first = levels.shift();
  } else {
    first = levels.pop();
    root = exports.createNS(levels.join('.'), root);
  }

  return {parent: root, item: first};
};

/**
 * Creates a namespace (deep object) starting from the specified root (or window) using the path provided (string separated by ".")
 * @returns a reference to the namespace created
 */
exports.createNS = function (path, root) {
  var levels = path.split('.');
  var first = levels.shift();

  root = root || window; //if no object argument supplied declare a property from is
  root[first] = root[first] || {}; // initialize the "level"
  if (levels.length) { // recursion condition
    return exports.createNS(levels.join('.'), root[first]);
  }
  return root[first];
};

/**
 * Gets a value from a deep object starting from the specified root (or window) and using the path provided.
 * null is returned if any part of the path is not found.
 */
exports.getDeepValue = function(path, root) {
  var current = root || window;
  if(!current) { return null; }
  var levels = path.split('.');
  for(var i = 0; i < levels.length; i++) {
    current = current[levels[i]];
    if(!current) { return null; }
  }

  return current;
};

exports.isInt = function(n) {
   return typeof n === 'number' && n % 1 === 0;
};

exports.getPixels = function ($element, cssAttr) {
	var stringValue = $element[0].style[cssAttr];
	if (stringValue[stringValue.length - 1] === '%') {
		return parseInt(stringValue.slice(0, -1), 10);
	} else {
		return parseInt(stringValue.slice(0, -2), 10);
	}
};

exports.isIE = function() {
  var myNav = navigator.userAgent.toLowerCase();
  return (myNav.indexOf('msie') !== -1) ? parseInt(myNav.split('msie')[1], 10) : false;
};

},{}]},{},[44])
;