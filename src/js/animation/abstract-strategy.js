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

	animatePartial: function() {},

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
