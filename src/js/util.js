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
		return parseFloat(stringValue.slice(0, -1), 10);
	} else {
		return parseFloat(stringValue.slice(0, -2), 10);
	}
};

exports.isIE = function() {
  var myNav = navigator.userAgent.toLowerCase();
  return (myNav.indexOf('msie') !== -1) ? parseFloat(myNav.split('msie')[1], 10) : false;
};
