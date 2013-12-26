$ = require 'jquery'
Carousel = require '../../../src/js/carousel'

LazyStrategy = require '../../../src/js/loading/lazy-strategy'
EagerStrategy = require '../../../src/js/loading/eager-strategy'

describe 'Loading module', ->

	$elem = $("#element")

	carousel = {}
	validItems = [{id: 1}, {id: 2}, {id: 3}, {id: 4}]
	validItem = [{id: 5}]
	afterLoaded = -> true

	beforeEach ->
		$elem = $("#element")
		cleanElement()

	afterEach ->
		carousel.clear()
		cleanElement()

	createCarouselWithEagerLoading = (items, callback) ->
		callback ?= ->

		renderer = (item) ->
			return "<div class='template' data-id='#{item.id}'><img src='test.jpg'></img></div>"

		c = new Carousel($elem, {loadingType: 'eager', pageSize: 2, itemTemplate: renderer})
		return c


	createCarouselWithLazyLoading = (items, callback) ->
		callback ?= ->

		renderer = (item) ->
			return "<div class='template' data-id='#{item.id}'><img src='test.jpg'></img></div>"

		c = new Carousel($elem, {loadingType: 'lazy', pageSize: 2, itemTemplate: renderer})
		return c

	cleanElement = ->
		$elem.off()
		$elem.empty()

	describe 'module initialization', ->
		it 'should set the proper loading strategy when initialized', (done) ->
			carousel = createCarouselWithEagerLoading()
			carousel.render(validItems)
			eagerCheck = carousel.loadingModule.loadingStrategy instanceof EagerStrategy
			expect(eagerCheck).to.be.equal(true)

			carousel = createCarouselWithLazyLoading()
			carousel.render(validItems)
			lazyCheck = carousel.loadingModule.loadingStrategy instanceof LazyStrategy
			expect(lazyCheck).to.be.equal(true)
			done()

	describe 'lazy loading', ->
		it 'should preload all the items and load only the visible ones', (done) ->
			carousel = createCarouselWithLazyLoading()
			carousel.render(validItems)
			expect($elem.find('img[src]').length).to.be.equal(2)
			expect($elem.find('img[data-src]').length).to.be.equal(2)
			carousel.goNext()
			expect($elem.find('img[src]').length).to.be.equal(4)
			expect($elem.find('img[data-src]').length).to.be.equal(0)
			done()

		it 'should load items added and rendered', (done) ->
			carousel = createCarouselWithLazyLoading()
			carousel.render(validItems)
			carousel.addItem(validItem,false)
			expect($elem.find('img[src]').length).to.be.equal(3)
			expect($elem.find('img[data-src]').length).to.be.equal(2)
			done()

		it 'should load items next to item removed if needed', (done) ->
			carousel = createCarouselWithLazyLoading()
			carousel.render(validItems)
			expect($elem.find('img[src]').length).to.be.equal(2)
			expect($elem.find('img[data-src]').length).to.be.equal(2)
			carousel.removeItem(0)
			expect($elem.find('img[src]').length).to.be.equal(2)
			expect($elem.find('img[data-src]').length).to.be.equal(1)
			done()

	describe 'eager loading', ->
		it 'should preload all the items and load all the items', ->
			carousel = createCarouselWithEagerLoading()
			carousel.render(validItems)
			expect($elem.find('img[data-src]').length).to.be.equal(0)
			expect($elem.find('img[src]').length).to.be.equal(4)
			