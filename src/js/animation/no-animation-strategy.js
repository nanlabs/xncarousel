var SliderStrategy = require('./slider-strategy');
var console;

var NoAnimationStrategy = SliderStrategy.extend({

	init: function(animationObject) {
		this._super(animationObject);
		console = animationObject.carouselApi.getLogger();
	},

	_animate: function ($overview, position) {

		var callback = this.animationObject.afterAnimation;
		var self = this.animationObject;

		$overview.css('left', position + this.animationObject.size.unitType);

		callback.call(self);
	},

	animatePartial: function() {}

});

module.exports = NoAnimationStrategy;
