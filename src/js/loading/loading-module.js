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
