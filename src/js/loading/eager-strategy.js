var $ = require('jquery');

var AbstractStrategy = require('./abstract-strategy');
var Spinner = require('./spinner');

module.exports = AbstractStrategy.extend({

	init: function(loadingObject) {
		this._super(loadingObject);
		this.spinner = new Spinner();
	},

	preLoad: function ($item, carouselItemInnerHtml) {
		console.log('Preloading item');

		var imgSrcAltered =  carouselItemInnerHtml.replace(' src=', ' data-src=');
		var $itemContent = $(imgSrcAltered); 

		$item.append($itemContent);
		$item.addClass('loading');

		this.loadingObject.$overview.append($item);

		var self = this;
		$item.find('img[data-src]').each(function(){
			var src  = $(this).attr('data-src');
			$(this).attr('src',src).error(self, self.postLoad).load(self, self.postLoad);
			$(this).removeAttr('data-src');
			self.spinner.showSpinner($(this));
		});
	},
	
	load: function ($item) {
		console.log('Loading item', $item);

	},

	postLoad: function (event) {
		console.log('After loaded');
		$(this).parents('.carousel-item').removeClass('loading');
		var self = event.data;
		self.spinner.hideSpinner($(this));
		self.loadingObject.afterLoaded();
	}

});
