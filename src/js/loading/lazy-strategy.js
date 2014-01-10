var $ = require('jquery');
var console;

var AbstractStrategy = require('./abstract-strategy');
var Spinner = require('./spinner');

module.exports = AbstractStrategy.extend({

	init: function(loadingObject, api) {
		this._super(loadingObject);
		this.spinner = new Spinner();
		this.itemClass = api.getItemClass();
		console = api.getLogger();
	},

	preLoad: function ($item, carouselItemInnerHtml) {
		console.debug('Preloading item');

		var imgSrcAltered =  carouselItemInnerHtml.replace(' src=', ' data-src=');
		var $itemContent = $(imgSrcAltered); 

		$item.append($itemContent);
		$item.addClass('proxy');

		this.loadingObject.$overview.append($item);
	},
	
	load: function ($item) {
		console.debug('Loading item');
		var self = this;

		// Only load items that are not already loaded (ie. has the 'proxy' class)
		$item = $item.filter(function() {
			return $(this).hasClass('proxy');
		});
		$item.removeClass('proxy');
		$item.addClass('loading');
		$item.find('img').each(function(){
			$(this).error(self, self.postLoad).load(self, self.postLoad);
			self.spinner.showSpinner($(this));
			if (this.hasAttribute('data-src')){
				var src  = $(this).attr('data-src');
				$(this).attr('src',src);
				$(this).removeAttr('data-src');
			}
		});
	},

	postLoad: function (event) {
		console.debug('After loaded');
		var self = event.data;
		$(this).parents('.' + this.itemClass).removeClass('loading');
		self.spinner.setSpinnerSize({spinnerHeight : $(this).height(), spinnerWidth : $(this).width()});
		self.spinner.hideSpinner($(this));
		self.loadingObject.afterLoaded($(this), event);
	}

});
