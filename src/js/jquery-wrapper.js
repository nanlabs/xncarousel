/**
 * jQuery plugin wrapper
 */
var Carousel = require('./carousel');
require('jquery-plugin-wrapper').wrap("xnCarousel", Carousel, require('jquery'));
module.exports = Carousel;
