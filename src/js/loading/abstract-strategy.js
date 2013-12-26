var Class = require('class');

module.exports = Class.extend({

	init: function (loadingObject) {
		this.loadingObject = loadingObject;
	},

	preLoad: function () {},
	
	load: function () {},

	postLoad: function () {}
	
});
