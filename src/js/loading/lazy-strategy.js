var $ = require('jquery');

var AbstractStrategy = require('./abstract-strategy');
var Spinner = require('./spinner');

module.exports = AbstractStrategy.extend({

	init: function(loadingObject) {
		this._super(loadingObject);
		this.spinner = new Spinner();
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
		$item.find('img[data-src]').each(function(){
			var src  = $(this).attr('data-src');
			$(this).attr('src',src).error(self, self.postLoad).load(self, self.postLoad);
			$(this).removeAttr('data-src');
			self.spinner.showSpinner($(this));
		});
	},

	postLoad: function (event) {
		console.debug('After loaded');
		var self = event.data;
		$(this).parents('.xn-carousel-item').removeClass('loading');
		self.spinner.hideSpinner($(this));
		self.loadingObject.afterLoaded();
	}

});
