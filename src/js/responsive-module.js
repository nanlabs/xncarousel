var Class = require('class'),
MediaQueryWatcher = require('mediaquerywatcher'),
$ = require('jquery');


/*
*	Given a element its height is calculated based on the actual applied media query.
*/
module.exports = Class.extend({
	init: function (api, $element, activeIntervals) {
		this.api = api;
		this.$element = $element;
		this.activeIntervals = activeIntervals;
		var actualAppliedMediaRule;
		this.mediaStylesProperties = {};
		this.mediaQueryWatcher = new MediaQueryWatcher();
		actualAppliedMediaRule = this.mediaQueryWatcher.addMediaQueriesListener(api.getStylesheet(), $.proxy(this._mediaChangedHandler, this));
		this._setActualMediaProperties(actualAppliedMediaRule, ['height', 'width']);

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
		var actualAppliedMediaRule, media,
		mediaQueriesRules = this.mediaQueryWatcher.mediaQueriesRules, exists = false;
		
		//we actually have to know if a media query does not exist for viewport actual state.
		if (mql.matches === false) {
			for (media in mediaQueriesRules) {
				if (mediaQueriesRules.hasOwnProperty(media) === true) {
					exists = this._mediaQueryMatches(media);
					if (exists === true) {
						break;
					}
				}
			}
		}

		if (mql.matches === true || exists === false) {
			
			actualAppliedMediaRule = mql.matches === false ? "noMediaRule" : mql.media;

			this._setActualMediaProperties(actualAppliedMediaRule, ['height', 'width']);
		
			var self = this;
			//defer execution so other action do not invalidate this one.
			setTimeout(function(){
				self._windowResizedHandler();
			},0);
		}
	},

	//Stores the selected CSS properties from a media query for the actual viewport size, to avoid continuous querying.
	_setActualMediaProperties: function (actualAppliedMediaRule, targetProperties) {
		var actualAppliedProperties;

		this.mediaStylesProperties.actualAppliedMediaRule = actualAppliedMediaRule;

		if (typeof(this.mediaStylesProperties[actualAppliedMediaRule]) === 'undefined') {
			actualAppliedProperties = this.mediaQueryWatcher.getMediaQueryProperties(this.mediaQueryWatcher.mediaQueriesRules[actualAppliedMediaRule], this.api.getSelectors(this.$viewport), targetProperties);
			this.mediaStylesProperties[actualAppliedMediaRule] = {};
			this.mediaStylesProperties[actualAppliedMediaRule].actualAppliedProperties = actualAppliedProperties;
			this.mediaStylesProperties[actualAppliedMediaRule].viewportWidth = this._getMediaQueryViewportWidth(actualAppliedMediaRule);
		}
	},

	//Helper to determine wether a mediaQuery applies to the actual viewport size.
	_mediaQueryMatches: function (mediaRule) {
		var min = this._getMediaQueryMinWidth(mediaRule),
		max = this._getMediaQueryMaxWidth(mediaRule),
		viewportWidth = window.innerWidth;
		
		if (min !== null && max !== null) {
			return (viewportWidth >= min && viewportWidth <= max) ? true : false;
		} else if (min !== null) {
			return (viewportWidth >= min) ? true : false;
		} else {
			return (viewportWidth <= max) ? true : false;
		}
	},

	//Parses the media query to obtain width values.
	_getMediaQueryViewportWidth : function (mediaRule) {
		var exprResult = this._getMediaQueryMaxWidth(mediaRule);
		return exprResult !== null ? exprResult :  this._getMediaQueryMinWidth(mediaRule);
	},

		//Parses the media query to obtain width values.
	_getMediaQueryMinWidth : function (mediaRule) {
		var minWidthMediaRuleExpr = /(min-width|min-device-width):\s?([0-9]+)/gi,
		exprResult;

		exprResult = minWidthMediaRuleExpr.exec(mediaRule);
		return exprResult !== null ? exprResult[2] : null;
	},

		//Parses the media query to obtain width values.
	_getMediaQueryMaxWidth : function (mediaRule) {
		var maxWidthMediaRuleExpr = /(max-width|max-device-width):\s?([0-9]+)/gi,
		exprResult;

		exprResult = maxWidthMediaRuleExpr.exec(mediaRule);
		return exprResult !== null ? exprResult[2] : null;
	},

	//Recalculates viewport height of an indicated item to keep aspect ratio.
	_windowResizedHandler: function () {
		var actualAppliedMediaRule = this.mediaStylesProperties.actualAppliedMediaRule, height;
		if (this._isActiveForViewportWidth(window.innerWidth) === true && (actualAppliedMediaRule !== "noMediaRule")) {
				height = window.innerWidth * parseInt(this.mediaStylesProperties[actualAppliedMediaRule].actualAppliedProperties.height, 10) / this.mediaStylesProperties[actualAppliedMediaRule].viewportWidth;
		} else { //Default css behaviour
				height = parseInt(this.mediaStylesProperties[actualAppliedMediaRule].actualAppliedProperties.height, 10);
		}
		this.$element.css('height', height + "px");
		if (this.mediaStylesProperties[actualAppliedMediaRule].actualAppliedProperties.width) {
			this.$element.css('width', this.mediaStylesProperties[actualAppliedMediaRule].actualAppliedProperties.width);
		}
	}
	
});