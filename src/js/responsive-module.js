var Class = require('class'),
MediaQueryWatcher = require('mediaquerywatcher'),
$ = require('jquery');


/*
*	Given a element its height is calculated based on the actual applied media query.
*/
module.exports = Class.extend({
	init: function (api, $element, activeIntervals) {
		var actualAppliedMediaRules, self = this;
		this.api = api;
		this.$element = $element;
		this.activeIntervals = activeIntervals;
		this.mediaStylesProperties = {};
		this.mediaQueryWatcher = new MediaQueryWatcher();
		actualAppliedMediaRules = this.mediaQueryWatcher.addMediaQueriesListener(api.getStylesheet(), $.proxy(this._mediaChangedHandler, this));
		this.mediaStylesProperties.actualAppliedProperties = {}; 
		$.each(actualAppliedMediaRules, function(i, actualAppliedMediaRule){
			self._setActualMediaProperties(actualAppliedMediaRule, ['height', 'width']);
		});
		this._windowResizedHandler();
		$(window).resize($.proxy(this._windowResizedHandler, this));
	},

	//Determines if this module is active for the actual viewport width based on the provided options.
	_isActiveForViewportWidth : function (actualViewportWidth) {
		if (this.activeIntervals === true) {
			//this module is active in all resolutions
			return true;
		}
		var rule, descending = /\*\.\.([0-9]+)/, ascending = /([0-9]+)\.\.\*/, between = /([0-9]+)\.\.([0-9]+)/;
		for (rule in this.activeIntervals) {
			if (this.activeIntervals.hasOwnProperty(rule)) {
				if (descending.test(rule) === true) {
					if (actualViewportWidth <= descending.exec(rule)[1]) {
						return this.activeIntervals[rule];
					}
				}
				if (between.test(rule) === true) {
					if (actualViewportWidth >= between.exec(rule)[1] && actualViewportWidth <= between.exec(rule)[2]) {
						return this.activeIntervals[rule];
					}
				}
				if (ascending.test(rule) === true) {
					if (actualViewportWidth >= ascending.exec(rule)[1]) {
						return this.activeIntervals[rule];
					}
				}
			}
		}
		return false;
	},

	//Whenever a media query changes, it gets the indicated CSS properties from a target stylesheet.
	_mediaChangedHandler: function (mql) {
		var self = this,
		mediaQueriesRules = this.mediaQueryWatcher.mediaQueriesRules, exists = false;
		
		//we actually have to know if a media query does not exist for viewport actual state.
		if (mql.matches === false) {
			$.each(mediaQueriesRules, function(media) {
				if (media !== "noMediaRule") {
					exists = self._mediaQueryMatchesForCarousel(media);
				}
				return !exists;
			});
		}

		if (mql.matches === true || exists === false) {
			if (mql.matches === true && this._mediaQueryMatchesForCarousel(mql.media) === false) {
				return;
			}
			this.mediaStylesProperties.actualAppliedProperties = {};
			this._setActualMediaProperties("noMediaRule", ['height', 'width']);
		}

		if (mql.matches === true) {
			this._setActualMediaProperties(mql.media, ['height', 'width']);
		}
		
		//defer execution so other action do not invalidate this one.
		setTimeout(function(){
			self._windowResizedHandler();
		},0);
	},

	//Stores the selected CSS properties from a media query for the actual viewport size, to avoid continuous querying.
	_setActualMediaProperties: function (actualAppliedMediaRule, targetProperties) {
		var actualAppliedProperties;
		
		this.mediaStylesProperties.actualAppliedMediaRule = actualAppliedMediaRule;

		actualAppliedProperties = this.mediaQueryWatcher.getMediaQueryProperties(this.mediaQueryWatcher.mediaQueriesRules[actualAppliedMediaRule], this.api.getSelectors(), targetProperties);
		this.mediaStylesProperties.viewportWidth = this._getMediaQueryViewportWidth(actualAppliedMediaRule);
		
		this.mediaStylesProperties.actualAppliedProperties = $.extend({}, this.mediaStylesProperties.actualAppliedProperties, actualAppliedProperties);
	},

	//Helper to determine wether a mediaQuery applies to the actual viewport size.
	_mediaQueryMatchesForCarousel: function (mediaRule) {
		var self = this;

		function matchesForCarousel(mediaRule) {
			var mediaData = self.mediaQueryWatcher.mediaQueriesRules[mediaRule],
			exists = false;
		
			$.each(mediaData, function(selector) {
				$.each(selector.replace(/,\s+/g,',').split(','), function(i, selector) {
					if (self.api.getSelectors().indexOf(selector) !== -1) {
						exists =true;
					}
					return !exists;
				});
				return !exists;
			});
			return exists;
		}

		var min = this._getMediaQueryMinWidth(mediaRule),
		max = this._getMediaQueryMaxWidth(mediaRule),
		viewportWidth = window.innerWidth;
		
		if (min !== null && max !== null) {
			return ((viewportWidth >= min && viewportWidth <= max) && matchesForCarousel(mediaRule) === true ) ? true : false;
		} else if (min !== null) {
			return (viewportWidth >= min && matchesForCarousel(mediaRule) === true ) ? true : false;
		} else {
			return (viewportWidth <= max && matchesForCarousel(mediaRule) === true ) ? true : false;
		}
	},

	//Parses the media query to obtain width values.
	_getMediaQueryViewportWidth : function (mediaRule) {
		var exprResult = this._getMediaQueryMaxWidth(mediaRule);
		return exprResult !== null ? exprResult :  this._getMediaQueryMinWidth(mediaRule);
	},

	//Return unit value ("px", "%", "em" for re-use correct one when translating)
  _getUnit : function (val){
    return val.match(/\D+$/);
  },

	//Remove 'px' and other artifacts
  _cleanValue : function (val) {
    return parseFloat(val.replace(this._getUnit(val), ''));
  },

	_getPxSize : function (value, unit) {
		switch(unit)
		{
		case "px":
			return value;
		case "em":
			return value * 16;
		case "rem":
			return value * 16;
		}
	},

	//Parses the media query to obtain width values.
	_getMediaQueryMinWidth : function (mediaRule) {
		var minWidthMediaRuleExpr = /(min-width|min-device-width)\s*:\s*([0-9]+[^0-9]+)\)/gi,
		exprResult;

		exprResult = minWidthMediaRuleExpr.exec(mediaRule);
		if (exprResult !== null && typeof(exprResult[2] !== 'undefined')) {
			return this._getPxSize(this._cleanValue(exprResult[2]), this._getUnit(exprResult[2])[0]);
		} else {
			return null;
		}
	},

		//Parses the media query to obtain width values.
	_getMediaQueryMaxWidth : function (mediaRule) {
		var maxWidthMediaRuleExpr = /(max-width|max-device-width)\s*:\s*([0-9]+[^0-9]+)\)/gi,
		exprResult;

		exprResult = maxWidthMediaRuleExpr.exec(mediaRule);
		if (exprResult !== null && typeof(exprResult[2] !== 'undefined')) {
			return this._getPxSize(this._cleanValue(exprResult[2]), this._getUnit(exprResult[2])[0]);
		} else {
			return null;
		}
	},

	//Recalculates viewport height of an indicated item to keep aspect ratio.
	_windowResizedHandler: function () {
		var actualAppliedMediaRule = this.mediaStylesProperties.actualAppliedMediaRule, height;
		
		if (this.mediaStylesProperties.actualAppliedProperties.height) {
			if (this._isActiveForViewportWidth(window.innerWidth) === true && (actualAppliedMediaRule !== "noMediaRule")) {
					height = window.innerWidth * parseInt(this.mediaStylesProperties.actualAppliedProperties.height, 10) / this.mediaStylesProperties.viewportWidth;
			} else { //Default css behaviour
					height = parseInt(this.mediaStylesProperties.actualAppliedProperties.height, 10);
			}
			this.$element.css('height', height + "px");
		}
		if (this.mediaStylesProperties.actualAppliedProperties.width) {
			this.$element.css('width', this.mediaStylesProperties.actualAppliedProperties.width);
		}
	}
	
});