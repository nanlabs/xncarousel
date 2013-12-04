$ = require 'jquery'
Wrapper = require '../../src/js/jquery-wrapper'
Carousel = require '../../src/js/carousel'


describe 'jQuery Plugin Wrapper', ->
	$elem = $('<div></div>')

	it 'should create the jquery plugin', ->
		expect($.fn.xnCarousel).to.exist
		expect($elem.data 'plugin_xnCarousel').not.to.exist
		$elem.xnCarousel()
		expect($elem.data 'plugin_xnCarousel').to.be.instanceOf Carousel
