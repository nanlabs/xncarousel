var AbstractStrategy = require('./abstract-strategy');

module.exports = AbstractStrategy.extend({

	animateToPage: function ($overview, $currentItem, $nextItem) {
		this._animateItem($currentItem, $nextItem);
		this._disabled = false; 
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
		return this.animationObject.size.initialItemWidth * itemPositionWithinPage;
	},

	_animateItem: function ($currentItem, $nextItem) {

		var callback = this.animationObject.afterAnimation;
		var self = this.animationObject;

		var transitionEndHandler = function () {

			$nextItem.off('transitionend', transitionEndHandler);
			$nextItem.off('webkitTransitionEnd', transitionEndHandler);

			$nextItem.css('transition', '');
			$nextItem.css('-webkit-transition', '');
			if ($currentItem.css('z-index') === '0') {
				$currentItem.css('opacity', 0);
			}
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
		return true;
	},

	animatePartial: function($overview, pcn, $currentItem) {
		if (!this._disabled){
			this._disabled = true;
			var pctAdapted = Math.abs(pcn) < 0.8 ? Math.abs(pcn) : 0.8;
			$currentItem.css('opacity', (1 - Math.abs(pctAdapted)));
		}

	}

});
