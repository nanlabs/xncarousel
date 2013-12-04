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
