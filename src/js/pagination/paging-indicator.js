var $ = require('jquery');
var Class = require('class');

var ITEM_CONTAINER_SELECTOR = '.xn-pagination .item-container';
var PAGE_ITEM_SELECTOR = '.item';
var CONTAINER_TEMPLATE = '<div class="xn-pagination"><div class="item-container"></div></div>';
var ITEM_TEMPLATE = '<div class="item"></div>';
var SELECTED_CLASS = 'selected';

var DEFAULTS = {
	onPageSelected: function () {
	},
	pageCount: 0
};

module.exports = Class.extend({
	itemCount: 0,

	init: function (options) {
		this.options = $.extend({}, DEFAULTS, options);

		this.paginationContainerSelector = options.paginationContainerSelector || ITEM_CONTAINER_SELECTOR;
		this.paginationItemSelector = options.paginationItemSelector || PAGE_ITEM_SELECTOR;
		this.notifyPageSelected = options.onPageSelected;
	},

	render: function ($parent) {
		if (this.options.paginationContainerSelector) {
			this.$itemContainer = this.$itemContainer || $(this.options.paginationContainerSelector);
		} else {
			this.$itemContainer = this.$itemContainer || this._renderContainer($parent);
		}

		if (!this.options.paginationItemSelector){
			this._renderPageItems(this.$itemContainer, this.options.getPageCount());
		}

		this.enablePaginationUI();

		// Set the first page item as selected
		this._getItems().first().addClass(SELECTED_CLASS);

		return this.$itemContainer;
	},

	_renderContainer: function ($parent) {
		var containerTemplate = CONTAINER_TEMPLATE;
		$parent.append(containerTemplate);

		return $parent.find(ITEM_CONTAINER_SELECTOR);
	},

	_renderPageItems: function ($container, pageCount) {
		this.clear();
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
			event.preventDefault();
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
