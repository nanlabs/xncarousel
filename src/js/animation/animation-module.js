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

	animatePartial: function(pcn) {
		this.animationStrategy.animatePartial(this.$overview, pcn);
	},

	animateDragFinish: function() {

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
