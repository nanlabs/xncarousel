var SliderStrategy = require('./slider-strategy');

var NoAnimationStrategy = SliderStrategy.extend({
	_animate: function ($overview, position) {

		var callback = this.animationObject.afterAnimation;
		var self = this.animationObject;

		$overview.css('left', position + '%');

		callback.call(self);
	},

	animatePartial: function() {}

});

module.exports = NoAnimationStrategy;
