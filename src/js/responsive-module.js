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
		var actualAppliedMediaRules;
		this.mediaStylesProperties = {};
		this.mediaQueryWatcher = new MediaQueryWatcher();
		actualAppliedMediaRules = this.mediaQueryWatcher.addMediaQueriesListener(api.getStylesheet(), $.proxy(this._mediaChangedHandler, this));
		var self = this;
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
		var actualAppliedMediaRule, self = this,
		mediaQueriesRules = this.mediaQueryWatcher.mediaQueriesRules, exists = false,
		missingMediaProperties = ['height', 'width'];
		
		//we actually have to know if a media query does not exist for viewport actual state.
		if (mql.matches === false) {
			$.each(mediaQueriesRules, function(media) {
				if (media !== "noMediaRule") {
					exists = self._mediaQueryMatches(media);
				}
				return !exists;
			});
			
			if (exists === true) {
				$.each(mediaQueriesRules, function(media) {
				if (media !== "noMediaRule") {
					$.each(self.mediaQueryWatcher.getMediaQueryProperties(self.mediaQueryWatcher.mediaQueriesRules[media], self.api.getSelectors(self.$element), ['height', 'width']), function(property) {
						if (missingMediaProperties.indexOf(property) !== -1) {
							missingMediaProperties.splice(missingMediaProperties.indexOf(property), 1);
						}
					});
				}
				});
				//If media queries cannot supply required properties it seeks in the stylesheet.
				if (missingMediaProperties.length > 0) {
					this._setActualMediaProperties("noMediaRule", missingMediaProperties);
				}
			}
		}

		if (mql.matches === true || exists === false) {
			
			actualAppliedMediaRule = mql.matches === false ? "noMediaRule" : mql.media;

			this._setActualMediaProperties(actualAppliedMediaRule, ['height', 'width']);
		
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

		actualAppliedProperties = this.mediaQueryWatcher.getMediaQueryProperties(this.mediaQueryWatcher.mediaQueriesRules[actualAppliedMediaRule], this.api.getSelectors(this.$element), targetProperties);
		if (actualAppliedProperties.height) {
			this.mediaStylesProperties.viewportWidth = this._getMediaQueryViewportWidth(actualAppliedMediaRule);
		}

		this.mediaStylesProperties.actualAppliedProperties = this.mediaStylesProperties.actualAppliedProperties || {}; 
		this.mediaStylesProperties.actualAppliedProperties = $.extend({}, this.mediaStylesProperties.actualAppliedProperties, actualAppliedProperties);
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
				height = window.innerWidth * parseInt(this.mediaStylesProperties.actualAppliedProperties.height, 10) / this.mediaStylesProperties.viewportWidth;
		} else { //Default css behaviour
				height = parseInt(this.mediaStylesProperties.actualAppliedProperties.height, 10);
		}
		this.$element.css('height', height + "px");
		if (this.mediaStylesProperties.actualAppliedProperties.width) {
			this.$element.css('width', this.mediaStylesProperties.actualAppliedProperties.width);
		}
	}
	
});