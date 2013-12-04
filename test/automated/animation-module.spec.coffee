$ = require 'jquery'
Carousel = require '../../src/js/carousel'

FadeStrategy = require '../../src/js/animation/fade-strategy'
SliderStrategy = require '../../src/js/animation/slider-strategy'
NoAnimationStrategy = require '../../src/js/animation/no-animation-strategy'

describe 'Animation module', ->

	$elem = $("#element")

	carousel = {}
	validItems = {}
	validItem = {}

	beforeEach ->
		$elem = $("#element")
		carousel = createCarousel()
		validItems = [{id: 1}, {id: 2}]
		validItem = {id: 3}

	afterEach ->
		cleanElement()

	createCarousel = (items, callback) ->
		callback ?= ->

		renderer = (item) ->
			return "<div class='template' data-id='#{item.id}'></div>"

		c = new Carousel($elem, {animationType: 'none', pageSize: 1, itemTemplate: renderer})
		return c

	createCarouselWithSliderAnimation = ->
		renderer = (item) ->
			return "<div class='template' data-id='#{item.id}'></div>"

		return new Carousel($elem, {animationType: 'slide', moveSpeed: 50, pageSize: 1, itemTemplate: renderer})

	createCarouselWithFadeAnimation = ->
		renderer = (item) ->
			return "<div class='template' data-id='#{item.id}'></div>"

		return new Carousel($elem, {animationType: 'fade', moveSpeed: 50, pageSize: 1, itemTemplate: renderer})

	cleanElement = ->
		$elem.off()
		$elem.empty()

	describe 'module initialization', ->
		it 'should set the proper animation strategy when initialized', ->
			carousel = createCarouselWithSliderAnimation()
			carousel.render(validItems)

			sliderCheck = carousel.animationModule.animationStrategy instanceof SliderStrategy

			expect(sliderCheck).to.be.equal(true)

			carousel = createCarouselWithFadeAnimation()
			carousel.render(validItems)

			fadeCheck = carousel.animationModule.animationStrategy instanceof FadeStrategy

			expect(fadeCheck).to.be.equal(true)

			carousel = createCarousel()
			carousel.render(validItems)

			noAnimationCheck = carousel.animationModule.animationStrategy instanceof NoAnimationStrategy

			expect(noAnimationCheck).to.be.equal(true)

	describe 'slider animation', ->

		it 'should set the layout for all the pages when rendering', ->
			carousel = createCarouselWithSliderAnimation()
			carousel.render(validItems)

			$overview = $elem.find '.overview'
			## The style is neccessary to calculate the offset of the overview
			$overview.css({padding: 0, margin: 0, position: 'relative', height: '100%'})

			currentOffset = 0

			$items = $overview.children('.carousel-item')
			$items.each(->
				$this = $(this)
				expect($this[0].style.left).to.be.equal(currentOffset + '%')
				currentOffset += 100
			)

		it 'should move to the left the page width when clicking right indicator', (done)->
			carousel = createCarouselWithSliderAnimation()
			carousel.render(validItems)

			$overview = $elem.find '.overview'
			## The style is neccessary to calculate the offset of the overview
			$overview.css({padding: 0, margin: 0, position: 'relative', width: '100%'})

			afterAnimationHandler = ->
				expect($overview[0].style.left).to.be.equal('-100%')
				done()

			$elem.on('carousel:pageChangeEnded', afterAnimationHandler)

			expect(carousel.getCurrentPage()).to.be.equal(0)
			expect(carousel.getPageCount()).to.be.equal(2)

			$currentItem = $overview.children('.carousel-item.active')
			expect($currentItem.outerWidth()).to.be.equal(1042)

			$rightIndicator = $elem.find '.right-indicator'

			expect($rightIndicator).not.to.be.a('null')
			expect($rightIndicator.length).to.be.equal 1
			expect($rightIndicator.css('display')).to.be.equal 'block'
			expect($rightIndicator.css('opacity')).not.to.be.equal 0

			events = $._data($rightIndicator[0], 'events')
			expect(events).not.to.be.a('null')
			expect(events.click).not.to.be.a('null')

			expect($overview.css('left')).to.be.equal('0px')

			$rightIndicator.simulate('click')

	describe 'fade animation', ->

		it 'should set opacity to 0 to all the pages, except the active', ->
			carousel = createCarouselWithFadeAnimation()
			carousel.render(validItems)

			$overview = $elem.find '.overview'

			$items = $overview.children('.carousel-item')
			$items.each(->
				$this = $(this)
				if ($this.hasClass('active'))
					expect($this.css('opacity')).to.be.equal('1')
				else
					expect($this.css('opacity')).to.be.equal('0')
			)

		it 'should set opacity to 1 to the page when clicking right indicator', (done)->
			carousel = createCarouselWithFadeAnimation()
			carousel.render(validItems)

			$overview = $elem.find '.overview'

			afterAnimationHandler = ->
				$currentItem = $overview.children('.carousel-item.active')
				expect($currentItem.css('opacity')).to.be.equal('1')
				done()

			$overview.on('animation:finished', afterAnimationHandler)

			$rightIndicator = $elem.find '.right-indicator'

			expect($rightIndicator).not.to.be.a('null')

			$rightIndicator.simulate('click')

		it 'should set opacity to 1 to the page when clicking left indicator', (done)->
			carousel = createCarouselWithFadeAnimation()
			carousel.render(validItems)

			$overview = $elem.find '.overview'

			$rightIndicator = $elem.find '.right-indicator'

			expect($rightIndicator).not.to.be.a('null')

			$rightIndicator.simulate('click')

			afterAnimationHandler = ->
				$currentItem = $overview.children('.carousel-item.active')
				expect($currentItem.css('opacity')).to.be.equal('1')
				done()

			$overview.on('animation:finished', afterAnimationHandler)

			$leftIndicator = $elem.find '.left-indicator'

			expect($leftIndicator).not.to.be.a('null')

			$leftIndicator.simulate('click')
