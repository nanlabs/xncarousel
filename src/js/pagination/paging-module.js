var Class = require('class');
var PaginationIndicator = require('./paging-indicator.js');
var $ = require('jquery');
var console;

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
		this.paginationContainerSelector = options.paginationContainerSelector || null;
		this.paginationItemSelector = options.paginationItemSelector || null;
		this.currentPage = 0;
		this.prevCurrentPage = 0;
		console = carouselApi.getLogger();
	},

	/**
	 * Renders the page indicator
	 *
	 * @this {PagingModule}
	 */
	renderIndicator: function() {
		this.pagingIndicator = this.pagingIndicator || new PaginationIndicator({
			api: this.carouselApi,
			getPageCount: $.proxy(this.getPageCount, this),
			onPageSelected: this.onPageSelected,
			paginationContainerSelector : this.paginationContainerSelector || null,
			paginationItemSelector : this.paginationItemSelector || null
		});
		this.pagingIndicator.render(this.carouselApi.container);
	},

	/**
	 * Retrieves the page count
	 *
	 * @return {number} Page count
	 * @this {PagingModule}
	 */
	getPageCount: function () {
		return this.pageSize === 0 ? 0 : Math.ceil(this.carouselApi.getItemCount() / this.pageSize);
	},

	updatePageSize: function (pageSize) {
		this.pageSize = pageSize;
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

		if(first > last) { return []; }
		
		//It only displays pages full of content
		if (last - first < this.pageSize - 1) {
			first -= this.pageSize - 1 - (last - first);
		}
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
