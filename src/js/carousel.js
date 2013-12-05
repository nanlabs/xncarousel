var $ = require('jquery');
var Class = require('class');
var util = require('./util');

var consoleShim = require ('./console-shim-module');

var responsiveModule = require('./responsive-module');

var DragSupport = require('./dragging-module');
var PaginationModule = require('./pagination/paging-module');
var Animation = require('./animation/animation-module');
var Loading = require('./loading/loading-module');


var leftIndicatorDefaultTemplate = '<div class="left-indicator"><div class="triangle-left"></div></div>';
var rightIndicatorDefaultTemplate = '<div class="right-indicator"><div class="triangle-right"></div></div>';

var containerTemplate = '<div class="overview"></div>';

var SELECTED_CLASS = "selected";

/**
 *  Generic carousel with several features such as animations, pagination, loading strategy.
 *	@module carousel
 */
module.exports = Class.extend({

	/**
	 * Initializes the carousel within the selector with the specified options
	 *
	 * @param {string} selector - Selector to contain the component
	 * @param {object} options - Object containig the options to initialize the carousel
	 * @this {Carousel}
	 */
	init: function (selector, options) {

		// Variable Definitions

		var defaults = {
			touchEnabled: false,
			pageSize: 1,
			animationType: 'none',
			loadingType: 'lazy',
			moveSpeed: 1000,
			pagingIndicators: false,
			pageInterval: 0,
			showNavigationArrows: 'auto',
			circularNavigation: false,
			responsive: true,
			itemTemplate: function () {
				return '<div></div>';
			}
		};

		this.$viewport = $(selector);
		this.settings = $.extend({}, defaults, options);

		consoleShim();

		this.size = {
			contentWidth: 0,
			overviewWidth: 0,
			itemWidthPct: 100 / this.settings.pageSize
		};

		this._initPaginationModule();
		this._initializeResponsiveModule(this.settings.responsive);

		this.leftIndicatorClickHandler = $.proxy(this.leftIndicatorClickHandler, this);
		this.rightIndicatorClickHandler = $.proxy(this.rightIndicatorClickHandler, this);

		this._trigger('carousel:initialized');
	},

	//*****************************Public API***************************************


	/**
	 * Enables the specified event with the handler
	 *
	 * @param {string} eventName - Event name to listen to
	 * @param {function} handler - Function associated with the event listening
	 * @this {Carousel}
	 */
	on: function (eventName, handler) {
		$(this).on(eventName, handler);
	},

	/**
	 * Disables the specified event with the handler
	 *
	 * @param {string} eventName - Event name to stop listening to
	 * @param {function} handler - Function associated with the event
	 * @this {Carousel}
	 */
	off: function (eventName, handler) {
		$(this).off(eventName, handler);
	},

	/**
	 * Sets the specified page as selected
	 *
	 * @param {number} pageNumber - Index to navigate to
	 * @this {Carousel}
	 */
	goToPage: function (pageNumber) {
		this._trigger('carousel:pageChangeStart', [this.pagingModule.getCurrentPage(), pageNumber]);
		this.pagingModule.goToPage(pageNumber);
		this.loadingModule.loadItem(this._getDOMItemsForCurrentPage());
		this.animationModule.animate(this.pagingModule.getPrevCurrentPage(), pageNumber);

		this._trigger('carousel:pageChanged', [pageNumber]);
	},

	/**
	 * Sets the next page as selected
	 *
	 * @this {Carousel}
	 */
	goNext: function () {
		this.goToPage(this.pagingModule.getNextPage());

	},

	/**
	 * Sets the previous page as selected
	 *
	 * @this {Carousel}
	 */
	goBack: function () {
		this.goToPage(this.pagingModule.getPrevPage());
	},

	/**
	 * Sets the last page as selected
	 *
	 * @this {Carousel}
	 */
	goToLastPage: function () {
		this.goToPage(this.pagingModule.getLastPage());
	},

	/**
	 * Sets the first page as selected
	 *
	 * @this {Carousel}
	 */
	goToFirstPage: function () {
		this.goToPage(0);
	},

	/**
	 * Retrieves the current page index
	 *
	 * @this {Carousel}
	 * @return {number} Current page index
	 */
	getCurrentPage: function () {
		return this.pagingModule.getCurrentPage();
	},

	/**
	 * Retrieves the number of items
	 *
	 * @this {Carousel}
	 * @return {number} Items count
	 */
	getItemCount: function () {
		return this.getItems().length;
	},

	/**
	 * Retrieves the number of pages
	 *
	 * @this {Carousel}
	 * @return {number} Pages count
	 */
	getPageCount: function () {
		return this.pagingModule.getPageCount();
	},

	/**
	 * Retrieves the carousel items
	 *
	 * @this {Carousel}
	 * @param {number} itemIndex - Index containing the carousel item
	 * @return {number} Item page index
	 */
	getPageIndex: function(itemIndex) {
		return this.pagingModule.getPageIndex(itemIndex);
	},

	/**
	 * Retrieves the carousel items
	 *
	 * @this {Carousel}
	 * @return {array} Array containing the carousel items
	 */
	getItems: function () {
		return this.$overview.children('.carousel-item');
	},

	/**
	 * Retrieves the last item index.
	 *
	 * @this {Carousel}
	 * @return {number} Last item index
	 */
	getLastItemIndex: function () {
		return this.getItemCount() - 1;
	},

	/**
	 * Retrieves all the index contained within the the specified page.
	 *
	 * @this {Carousel}
	 * @param {number} pageNumber - Page index
	 * @return {array} Array containing the indices
	 */
	getItemIndicesForPage: function (pageNumber) {
		return this.pagingModule.getIndicesForPage(pageNumber);
	},

	/**
	 * Retrieves all the index contained within the current page.
	 *
	 * @this {Carousel}
	 * @return {array}  Array containing the indices
	 */
	getItemIndicesForCurrentPage: function () {
		return this.pagingModule.getIndicesForPage(this.getCurrentPage());
	},

	/**
	 * Removes all the items from the carousel, resets the paging, clear the styles and navigators.
	 *
	 * @this {Carousel}
	 * @param {object} options - Set silent to avoid firing events.
	 * @fires carousel:itemsCleared Event to notify that the carousel has been cleared.
	 */
	clear: function (options) {
		this.$overview.empty();
		this.$overview.css('left', '0%');
		this.refreshContentWidth();
		this._updateNavigators();
		this.pagingModule.clear();

		if (!options || !options.silent) {
			this._trigger('carousel:itemsCleared');
		}

	},

	/**
	 * Check whether the index if a valid existing item or not
	 *
	 * @this {Carousel}
	 * @param {number} index - Item index to be removed.
	 * @return {boolean} true if the index is valid. false, if it the index is invalid.
	 */
	isValidItemIndex: function (index) {
		return (index >= 0 && index < this.getItemCount());
	},

	/**
	 * Removes a carousel item given the index
	 *
	 * @this {Carousel}
	 * @param {number} index - Index of the item to be removed.
	 * @fires carousel:pageRemoved - Event to notify that item removed has removed an existing page.
	 * @fires carousel:itemRemoved - Event to notify that item has been removed from the carousel.
	 */
	removeItem: function (index) {
		if (!this.isValidItemIndex(index)) { return; }

		var item = this.getItems()[index];
		if(!item) { return; }

		var oldPageCount = this.getPageCount();

		var $itemToBeRemoved = $(item);
		var $itemsToBeUpdated = $itemToBeRemoved.nextAll();

		$itemToBeRemoved.remove();

		if ($itemsToBeUpdated.length > 0) {

			this.animationModule.updateAfterRemoval($itemsToBeUpdated);

			this.animationModule.setItemVisible(this._getDOMItemsForCurrentPage());
			this.loadingModule.loadItem(this._getDOMItemsForCurrentPage());
		}

		// Check if the page count changed. That would mean a page was removed, the page module must be notified.
		var newPageCount = this.getPageCount();
		if (oldPageCount > newPageCount) {
			this.pagingModule.removePage();

			// If there are pages and the current one was removed, go to last page available
			if(newPageCount > 0 && this.getCurrentPage() >= newPageCount) {
				this.goToLastPage();
			}
			this._trigger('carousel:pageRemoved');
		}

		this.refreshContentWidth();
		this._updateNavigators();

		this._trigger('carousel:itemRemoved');
	},

	/**
	 * Refresh the carousel content width with the sum of every item including margings and padings.
	 *
	 * @this {Carousel}
	 */
	refreshContentWidth: function () {
		var itemList = this.getItems();
		var offset = 0;

		itemList.each(function() {
			offset += $(this).outerWidth(true);
		});

		this.size.contentWidth = offset;
	},

	/**
	 * Selects a carousel item
	 *
	 * @this {Carousel}
	 * @param {number} index - Index to be selected
	 * @param {object} options - Use silent to avoid triggering events.
	 * @fires carousel:selectionClear - Event to notify that the item has been selected.
	 */
	selectItem: function (index, options) {
		if (!this.isValidItemIndex(index)) {
			console.error("Cannot select item. Invalid index: %d", index);
			return;
		}

		this.clearSelection({silent: true});
		var itemList = this.getItems();
		$(itemList[index]).addClass(SELECTED_CLASS);

		if (!options || !options.silent) {
			this._trigger('carousel:itemSelected', index);
		}
	},

	/**
	 * Clears the item selection
	 *
	 * @this {Carousel}
	 * @param {object} options - Use silent to avoid triggering events.
	 * @fires carousel:selectionClear - Event to notify that the selection has been cleared.
	 */
	clearSelection: function (options) {
		this._getSelectedDOMItems().removeClass(SELECTED_CLASS);

		if (!options || !options.silent) {
			this._trigger('carousel:selectionClear');
		}
	},

	/**
	 * Returns the selected carousel item index
	 *
	 * @this {Carousel}
	 * @return {number} If found, returns the selected index. -1 if not item is selected.
	 */
	getSelectedIndex: function () {
		var item = this._getSelectedDOMItems();

		if (item) {
			return item.index();
		}

		return -1;
	},

	/**
	 * Appends a carousel item into the carousel
	 *
	 * @this {Carousel}
	 * @param {object} item - Item to be added
	 * @param {boolean} batchMode - If true, then no events are thrown and no UI refresh actions are performed
	 * @fires carousel:pageAdded - Event to notify that item added has created a new page.
	 * @fires carousel:itemAdded - Event to notify that item has been added.
	 */
	addItem: function (item, batchMode) {
		var itemObject;

		if (typeof(item) === "object") {
			itemObject = item;
			item = this.settings.itemTemplate(item);
		}

		var pageCount = this.getPageCount();

		var $carouselItem = $('<div class="carousel-item"></div>');

		this.loadingModule.preLoadItem($carouselItem, item);

		$carouselItem.click($.proxy(this.selectItemHandlerMouse, this));
		$carouselItem.on('itemTouched', $.proxy(this.selectItemHandlerTouch, this));

		if (!batchMode) {
			this.loadingModule.loadItem($carouselItem);
			this._processAddedItem($carouselItem);

			var pageIndex = this.pagingModule.getPageIndex($carouselItem.index());
			if (pageIndex === pageCount) {
				this.pagingModule.addPage();
				this._trigger('carousel:pageAdded', [pageIndex]);
			}

			if (pageIndex === this.getCurrentPage()) {
				// This is done for the case there were no pages and we added the first item. We want the indicator
				// to appear as selected
				this.pagingModule.updateUI();

				this.animationModule.setItemVisible($carouselItem);
			}

			this._updateNavigators();

			this._trigger('carousel:itemAdded', [itemObject || item, $carouselItem]);
		}
	},

	/**
	 * Renders the carousel with their items
	 *
	 * @this {Carousel}
	 * @param {array} items - Items to be rendered.
	 * @fires carousel:rendered - Event to notify that the rendering is ready.
	 */
	render: function (items) {

		if (typeof(items) === 'undefined'){
			var $items = this.$viewport.find('.xn-items');
			items = [];		
			$.each($items.children(), function(i, el){
				items.push(el.outerHTML);
			});
			$items.remove();
		}

		this._createContainer();
		this._initLoadingModule();

		this.clear({ silent: true });

		var self = this;
		$.each(items, function (i, e) {
			self.addItem(e, true);
		});

		this._initAnimationModule();


		if (this.animationModule.supportsTouch()) {
			if (this.settings.touchEnabled) {
				this._initDraggingModule();
				this._hideIndicators();
			}
		} else {
			if (this._isTouchDevice()) {
				this._showNavigationArrows();
			}
		}

		this._processAddedItems();

		if (this.settings.pagingIndicators) {
			this.pagingModule.renderIndicator();
		}

		this._makeFirstPageVisible();

		this.size.overviewWidth = this._getOverviewWidth();

		this.refreshContentWidth();
		this._updateNavigators();

		this._startAutomaticPaging();

		this._trigger('carousel:rendered');
	},

	//***************************Private Methods**********************************************

	_initPaginationModule: function () {

		var api = {
			container: this.$viewport,
			getItemCount: $.proxy(this.getItemCount, this),
			getItemsForPage: $.proxy(this._getDOMItemsForPage, this),
			getItemsForCurrentPage: $.proxy(this._getDOMItemsForCurrentPage, this)
		};

		this.pagingModule = new PaginationModule(api, {
			pageSize: this.settings.pageSize,
			circularNavigation: this.settings.circularNavigation,
			onPageSelected: $.proxy(function (pageIndex) {
				this._disableNavigators();
				this.goToPage(pageIndex);
			}, this)
		});
	},

	_initAnimationModule: function () {

		var api = {
			container: this.$overview,
			getCurrentPage: $.proxy(this.getCurrentPage, this),
			getItemsForPage: $.proxy(this._getDOMItemsForPage, this),
			getItemsForCurrentPage: $.proxy(this._getDOMItemsForCurrentPage, this)
		};

		var animationOptions = {
			animationType: this.settings.animationType,
			animationSpeed: this.settings.moveSpeed,
			pageSize: this.settings.pageSize,
			size: this.size,
			afterAnimationCallback: $.proxy(function () {
				this._updateNavigators();
				this._updatePagingIndicator();
			}, this)
		};

		this.animationModule = new Animation(api, animationOptions);

		var animationEndHandler = function () {
			this._trigger('carousel:pageChangeEnded', [this.pagingModule.getPrevCurrentPage(), this.pagingModule.getCurrentPage()]);
		};

		animationEndHandler = $.proxy(animationEndHandler, this);

		this.$overview.on('animation:finished', animationEndHandler);
	},

	_initDraggingModule: function () {

		var dragModuleOptions = {
			duringDragging: $.proxy(this.updatePageWhileDragging, this),
			afterDragging: $.proxy(this.updatePageAfterDragging, this)
		};

		this.dragModule = new DragSupport(this.$overview, dragModuleOptions);

		var animationStartHandler = function () {
			this.dragModule.disableDragging();
		};

		var animationEndHandler = function () {
			this.dragModule.enableDragging();
		};

		animationStartHandler = $.proxy(animationStartHandler, this);
		animationEndHandler = $.proxy(animationEndHandler, this);

		this.$overview.on('animation:started', animationStartHandler);
		this.$overview.on('animation:finished', animationEndHandler);

		this.$viewport[0].ontouchstart = function(event) { event.stopPropagation(); };
		this.$viewport[0].ontouchend = function(event) { event.stopPropagation(); };
	},

	_initializeResponsiveModule: function (responsive) {
		if (responsive !== false) {
			new responsiveModule({
				getSelectors : $.proxy(this._getCarouselSelectors, this),
				getStylesheet : $.proxy(this._getCarouselStylesheet, this),
			}, this.$viewport, responsive);
		}
	},

	_initLoadingModule: function () {

		var api = {
			container: this.$overview,
			getCurrentPage: $.proxy(this.getCurrentPage, this),
			getItemsForPage: $.proxy(this._getDOMItemsForPage, this),
			getItemsForCurrentPage: $.proxy(this._getDOMItemsForCurrentPage, this)
		};

		var loadingOptions = {
			loadingType: this.settings.loadingType,
			afterLoadedCallback: $.proxy(function () {}, this)
		};

		this.loadingModule = new Loading(api, loadingOptions);
	},

	_createContainer: function () {

		this.$leftIndicator = this.$viewport.children('.left-indicator');
		this.$rightIndicator = this.$viewport.children('.right-indicator');

		if (this.$leftIndicator.length === 0) {
			// No left indicator template was set, using the default template
			this.$viewport.append(leftIndicatorDefaultTemplate);
			this.$leftIndicator = this.$viewport.children('.left-indicator');
		}

		if (this.$rightIndicator.length === 0) {
			// No right indicator template was set, using the default template
			this.$viewport.append(rightIndicatorDefaultTemplate);
			this.$rightIndicator = this.$viewport.children('.right-indicator');
		}

		this.$overview = this.$viewport.children('.overview');

		if (this.$overview.length === 0) {
			this.$viewport.prepend(containerTemplate);
			this.$overview = this.$viewport.children('.overview');
		}

		this.$overview.css('left', '0%');
	},

	_processAddedItems: function () {
		var itemList = this.getItems();

		for (var i = 0; i < itemList.length; i++) {
			var $item = $(itemList[i]);
			this._processAddedItem($item);
			this.size.itemWidth = $item.outerWidth(true);
		}
	},

	_processAddedItem: function($item) {
		this.animationModule.initItem($item);
		$item.css({'width': this.size.itemWidthPct + "%"});
	},

	_hasNextPage: function () {
		return this.pagingModule.hasNextPage();
	},

	_hasPrevPage: function () {
		return this.pagingModule.hasPrevPage();
	},

	_updateNavigators: function () {

		this.$leftIndicator.off('click', this.leftIndicatorClickHandler);
		this.$rightIndicator.off('click', this.rightIndicatorClickHandler);

		// Process indicators visibility
		var alwaysShowNavigationArrows = (this.settings.showNavigationArrows && this.settings.showNavigationArrows !== 'auto');

		var displayBlock = this.settings.circularNavigation || alwaysShowNavigationArrows;
		var displayNone = !this.settings.showNavigationArrows;

		if (displayBlock) {
			this.$rightIndicator.css('display', 'block');
			this.$leftIndicator.css('display', 'block');
		} else if (displayNone) {
			this.$rightIndicator.css('display', 'none');
			this.$leftIndicator.css('display', 'none');
		} else {
			// The visibility depends on the page
			this.$leftIndicator.css('display', (this._hasPrevPage() ? 'block' : 'none'));
			this.$rightIndicator.css('display', (this._hasNextPage() ? 'block' : 'none'));
		}

		if (alwaysShowNavigationArrows) {
			this._showNavigationArrows();
		}

		// Process indicators event handling
		var alwaysHandleEvents = this.settings.circularNavigation;

		if (alwaysHandleEvents) {
			this.$leftIndicator.on('click', this.leftIndicatorClickHandler);
			this.$rightIndicator.on('click', this.rightIndicatorClickHandler);
		} else if(!displayNone) {

			if (this._hasPrevPage()) {
				this.$leftIndicator.on('click', this.leftIndicatorClickHandler);
			}

			if (this._hasNextPage()) {
				this.$rightIndicator.on('click', this.rightIndicatorClickHandler);
			}
		}
	},

	_getOverviewWidth: function () {
		return this.$viewport.width();
	},

	_updatePagingIndicator: function () {
		this.pagingModule.updateUI();
		this.pagingModule.enableUI();
	},

	_makeFirstPageVisible: function () {
		this.loadingModule.loadItem(this._getDOMItemsForCurrentPage());

		this.pagingModule.goToPage(this.getCurrentPage(), {force: true});
		this.animationModule.setItemVisible(this._getDOMItemsForCurrentPage());
	},

	_getCurrentOffset: function () {
		return util.getPixels(this.$overview, 'left');
	},

	_isTouchDevice: function () {
		try {
			document.createEvent("TouchEvent");
			return true;
		} catch (e) {
			return false;
		}
	},

	_startAutomaticPaging: function () {
		if (this.settings.pageInterval > 0) {
			var pagingFunction = function () {
				this.goToPage(this.pagingModule.getNextPage());
			};

			var pausePaging = function() {
				if (this.pagingInterval) {
					clearInterval(this.pagingInterval);
				}
			};

			var resumePaging = function() {
				this.pagingInterval = setInterval(pagingFunction, this.settings.pageInterval);
			};

			pagingFunction = $.proxy(pagingFunction, this);
			pausePaging = $.proxy(pausePaging, this);
			resumePaging = $.proxy(resumePaging, this);

			this.pagingInterval = setInterval(pagingFunction, this.settings.pageInterval);

			if (this._isTouchDevice()) {
				this.$viewport[0].ontouchstart = pausePaging;
				this.$viewport[0].ontouchend = resumePaging;
			} else {
				this.$viewport.on('mouseenter', pausePaging);
				this.$viewport.on('mouseleave', resumePaging);
			}
		}
	},

	_showNavigationArrows: function () {
		var indicatorsOpacity = 0.7;
		this.$leftIndicator.css('opacity', indicatorsOpacity);
		this.$rightIndicator.css('opacity', indicatorsOpacity);
	},

	_hideIndicators: function () {
		this.$leftIndicator.css('display', 'none');
		this.$rightIndicator.css('display', 'none');
	},

	_disableNavigators: function () {
		if (this.settings.animationType === 'slide') {
			this.$leftIndicator.off('click', this.leftIndicatorClickHandler);
			this.$rightIndicator.off('click', this.rightIndicatorClickHandler);
			this.pagingModule.disableUI();
		}
	},

	_trigger: function (eventName, params) {
		$(this).trigger(eventName, params);
		this.$viewport.trigger(eventName, params);
	},

	//Retrieves the carousel selectors to search for CSS values by priority order.
	_getCarouselSelectors: function () {
		var classes = [], perm = [];

		function getCombinations(chars) {
			var result = [],
			f = function(prefix, chars) {
				for (var i = 0; i < chars.length; i++) {
					result.push(prefix + chars[i]);
					f(prefix + chars[i], chars.slice(i + 1));
				}
			};
			f('', chars);
			return result;
		}

		function orderByRelevance(classes) {
			$.each(classes, function(i, className) {
					classes[i] = {className : className, weight: className.split(".").length };
			});

			var ordered = [], aux, i, j;
			for (i = 0; i < classes.length; i += 1) {
				for (j = classes.length - 2; j >= i ; j -= 1) {
					if (classes[j + 1].weight > classes[j].weight) {
						aux = classes[j];
						classes[j] = classes[j + 1];
						classes[j + 1] = aux;
					}
				}
				ordered.push(classes[i].className);
			}
			return ordered;
		}


		function permute(input) {
		var permArr = [], usedChars = [], concatResult =[];

		function main(input) {
			var i, ch;
			for (i = 0; i < input.length; i+= 1) {
				ch = input.splice(i, 1)[0];
				usedChars.push(ch);
				if (input.length === 0) {
					permArr.push(usedChars.slice());
				}
				main(input);
				input.splice(i, 0, ch);
				usedChars.pop();
			}
			return permArr;
		}

		permArr = main(input);
		$.each(permArr, function(i, val){
			concatResult.push(val.join(''));
			});
		return concatResult;
		}

		if (!this.carouselSelectors) {
			if (typeof(this.$viewport.attr('class')) !== 'undefined') {
				//appends dots at the beggining of each word.
				classes = (" " + this.$viewport.attr('class')).replace(/\s/g," .").split(" ");
				classes = classes.slice(1, classes.length);
				classes = getCombinations(classes);

				$.each(classes, function(i, className) {
					var classes = className.replace(/\./g, ",.").split(",");
					classes = classes.slice(1, classes.length);
					if (classes.length > 1) {
						perm = perm.concat(permute(classes));
					} else {
						perm = perm.concat(classes);
					}
				});

				classes = orderByRelevance(perm);
			}

			if (typeof(this.$viewport.attr('id')) !== 'undefined') {
				classes.unshift("#" + this.$viewport.attr('id'));
			}
			this.carouselSelectors = classes;
		}

		return this.carouselSelectors;
	},

	//Among loaded stylesheets it seeks for carousel one.
	_getCarouselStylesheet: function() {
		var carouselStyleSheet, carouselSelectors = this._getCarouselSelectors();
		$.each(document.styleSheets, function(index, styleSheet){
			var found = false;
			if (styleSheet.cssRules) {
				$.each(styleSheet.cssRules,function(index, CSSStyleRule) {
					if (carouselSelectors.indexOf(CSSStyleRule.selectorText) !== -1) {
						carouselStyleSheet = styleSheet;
						found = true;
						return !found;
					}
				});
			}
			return !found;
		});
		return carouselStyleSheet;
	},

	_getSelectedDOMItems: function () {
		return this.$overview.children('.' + SELECTED_CLASS);
	},

	_getDOMItemsForPage: function (pageNumber) {
		var $items = this.getItems();

		return $($.map(this.pagingModule.getIndicesForPage(pageNumber), function (val) {
			return $items[val];
		}));
	},

	_getDOMItemsForCurrentPage: function () {
		return this._getDOMItemsForPage(this.getCurrentPage());
	},

	//************************************Event Handlers***************************************

	selectItemHandlerTouch: function (e) {
		return this.selectItemCommonHandler(e);
	},

	/**
	 * Handles the event when an item is selected with the mouse click.
	 *
	 * @this {Carousel}
	 * @param {event} event - Event containing the clicked item.
	 */
	selectItemHandlerMouse: function (event) {

		if (this.dragModule) {
			if (this.dragModule.finishDragging) {
				this.dragModule.finishDragging = false;
				return false;
			}
		}

		return this.selectItemCommonHandler(event);
	},


	/**
	 * Handles the item selected event.
	 *
	 * @this {Carousel}
	 * @param {event} event - Event containing the selected item.
	 */
	selectItemCommonHandler: function (event) {
		var $selectedItem = $(event.currentTarget);

		var index = $selectedItem.index();
		console.debug('Item of position %d selected', index);
		this.animationModule.pagingAnimation = false;
		this.selectItem(index);

		return false;
	},

	/**
	 * Handles the previous indicator click event.
	 *
	 * @this {Carousel}
	 */
	leftIndicatorClickHandler: function () {
		if (this.animationModule.pagingAnimation) {
			console.debug('Carousel is currently moving. This backwards movement has been cancelled');
			return false;
		}
		this._disableNavigators();
		this.goToPage(this.pagingModule.getPrevPage());
	},

	/**
	 * Handles the next indicator click event.
	 *
	 * @this {Carousel}
	 */
	rightIndicatorClickHandler: function () {
		if (this.animationModule.pagingAnimation) {
			console.debug('Carousel is currently moving. This forward movement has been cancelled');
			return false;
		}
		this._disableNavigators();
		this.goToPage(this.pagingModule.getNextPage());
	},

	/**
	 * Updates the page while the dragging action is being performed
	 *
	 * @this {Carousel}
	 * @param {$object} $element - Event target
	 * @param {number} diff - Difference with the dragging distance.
	 */
	updatePageWhileDragging: function ($element, diff) {
		var currentOffset = this._getCurrentOffset();

		var overviewWidth = this.$overview.width();

		diff = (diff / overviewWidth) * overviewWidth;
		diff = diff * 100 / overviewWidth;

		var positionDifference = (currentOffset - diff);

		console.log('updatePageWhileDragging, currentOffset: ' + this.$overview[0].style.left + ', difference: ' + diff);

		if (positionDifference >= 30 || positionDifference > -(this.size.contentWidth + 30)) {
			$element.css('left', positionDifference + '%');
			this._updateNavigators();
		}
	},

	/**
	 * Updates the page after dragging
	 *
	 * @this {Carousel}
	 * @param {number} initialPageX - Page where the dragging action was started
	 * @param {object} event - Event with the dragging info.
	 */
	updatePageAfterDragging: function (initialPageX, event) {

		var currentPage = this.getCurrentPage();
		var lastPageIndex = this.pagingModule.getLastPage();

		var diffPosition = initialPageX - event.pageX;
		var rightMovement = (diffPosition > 0);

		if ((currentPage === lastPageIndex) && rightMovement) {
			// Go to the last page
			console.log('Move to last page');
			this.goToLastPage();
		} else if ((currentPage === 0) && !rightMovement) {
			// Go to the first page
			console.log('Move to first page');
			this.goToPage(0);
		} else {

			if (Math.abs(diffPosition) > (this.size.itemWidth / 4)) {
				// The dragging movement was long enough to change pages.
				if (rightMovement) {
					console.log('Move forward');
					this.goToPage(this.pagingModule.getNextPage());
				} else {
					console.log('Move backward');
					this.goToPage(this.pagingModule.getPrevPage());
				}
			} else {
				// The dragging movement didn't cause a page change.
				console.log('Stay in the same page');
				this.animationModule.animateToCurrentPage();
			}
		}
	},

	/**
	 * Handles the animation finished event
	 *
	 * @this {Carousel}
	 */
	afterAnimationHandler: function () {},


	/**
	 * Loads the proxies withing the current page
	 *
	 * @this {Carousel}
	 */
	loadProxies: function () {
		this.loadingModule(this._getDOMItemsForCurrentPage());
	}

});
