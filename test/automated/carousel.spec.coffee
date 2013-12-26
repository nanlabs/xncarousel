$ = require 'jquery'
Carousel = require '../../src/js/carousel'

describe 'carousel', ->
	$elem = $("#element")
	$overview = {}

	carousel = {}
	validItems = {}
	validItem = {}

	beforeEach ->
		$elem = $("#element")
		carousel = createCarousel()
		validItems = [{id: 1}, {id: 2}, {id: 3}]
		validItem = {id: 3}

	afterEach ->
		cleanElement()

	createCarousel = (items, callback) ->
		callback ?= ->

		renderer = (item) ->
			return "<div class='template' data-id='#{item.id}'></div>"

		c = new Carousel($elem, {animationType: 'none', pageSize: 1, itemTemplate: renderer})
		$elem.find '.xn-overview'
		return c

	createCarouselWithTwoItemsPerPage = (showNavigationArrows) ->

		renderer = (item) ->
			return "<div class='template' data-id='#{item.id}'></div>"

		return new Carousel($elem, {animationType: 'none', pageSize: 2, itemTemplate: renderer})

	createCarouselWithPagingIndicators = (showNavigationArrows) ->

		renderer = (item) ->
			return "<div class='template' data-id='#{item.id}'></div>"

		return new Carousel($elem, {animationType: 'none', pageSize: 1, itemTemplate: renderer, showNavigationArrows: showNavigationArrows})

	createCarouselWithInterval = (pageInterval) ->
		renderer = (item) ->
			return "<div class='template' data-id='#{item.id}'></div>"

		return new Carousel($elem, {animationType: 'none', pageSize: 1, itemTemplate: renderer, pageInterval: pageInterval})

	createCarouselWithCircularNavigation = ->
		renderer = (item) ->
			return "<div class='template' data-id='#{item.id}'></div>"

		return new Carousel($elem, {animationType: 'none', pageSize: 1, itemTemplate: renderer, circularNavigation: true})

	createCarouselWithSlideAnimation = ->
		renderer = (item) ->
			return "<div class='template' data-id='" + item.id + "'></div>"

		new Carousel($elem, {animationType: "slide", moveSpeed: 50, pageSize: 1, pagingIndicators: true, itemTemplate: renderer})

	createCarouselWithDragSupport = ->
		renderer = (item) ->
			return "<div class='template' data-id='" + item.id + "'></div>"

		new Carousel($elem, {animationType: "slide", moveSpeed: 50, pageSize: 1, pagingIndicators: true, itemTemplate: renderer, touchEnabled: true})

	cleanElement = ->
		$elem.off()
		$elem.empty()

	describe 'component rendering', ->

		it 'should create the UI with the specified items', ->
			carousel.render validItems
			expect($elem.find '.xn-carousel-item').to.have.lengthOf validItems.length

		it 'should create the UI with no items if desired', ->
			carousel.render []
			assert.lengthOf $elem.find('.xn-carousel-item'), 0

		it 'should render a new set of items if some were existing', ->
			carousel.render validItems
			carousel.render [validItem]
			$items = $elem.find '.xn-carousel-item'
			expect($items).to.have.lengthOf 1

	describe 'pagination arrows rendering', ->

		it 'should hide the paging indicators when the parameter showNavigationArrows is false', ->

			carousel = createCarouselWithPagingIndicators(false)
			carousel.render validItems

			$rightIndicator = $elem.find '.xn-right-indicator'
			expect($rightIndicator).not.to.be.null
			expect($rightIndicator.css('display')).to.be.equal 'none'

			$leftIndicator = $elem.find '.xn-left-indicator'
			expect($leftIndicator).not.to.be.null
			expect($leftIndicator.css('display')).to.be.equal 'none'

		it 'should always show the paging indicators when the parameter showNavigationArrows is true', ->

			carousel = createCarouselWithPagingIndicators(true)
			carousel.render [validItem]

			$rightIndicator = $elem.find '.xn-right-indicator'
			expect($rightIndicator).not.to.be.null
			expect($rightIndicator.css('display')).to.be.equal 'block'
			expect($rightIndicator.css('opacity')).not.to.be.equal 0

			$leftIndicator = $elem.find '.xn-left-indicator'
			expect($leftIndicator).not.to.be.null
			expect($leftIndicator.css('display')).to.be.equal 'block'
			expect($leftIndicator.css('opacity')).not.to.be.equal 0

		it 'should show the paging indicators when needed if the parameter showNavigationArrows is auto', ->

			carousel = createCarouselWithPagingIndicators()
			carousel.render [validItem]
			expect(carousel.settings.showNavigationArrows).to.be.equal('auto')

			$rightIndicator = $elem.find '.xn-right-indicator'
			expect($rightIndicator).not.to.be.null
			expect($rightIndicator.css('display')).to.be.equal 'none'

			$leftIndicator = $elem.find '.xn-left-indicator'
			expect($leftIndicator).not.to.be.null
			expect($leftIndicator.css('display')).to.be.equal 'none'

	describe 'item selection', ->

		it 'should mark the selected item as selected', ->
			carousel.render validItems
			carousel.selectItem 1
			expect(carousel.getSelectedIndex()).to.equal 1
			$selected = $elem.find '.xn-carousel-item.selected .template'
			expect($selected).to.have.lengthOf 1
			itemId = $($selected[0]).attr 'data-id'
			expect(itemId).to.be.equal String(validItems[1].id)

		it 'should refresh the selection when selecting a new item', ->
			carousel.render validItems
			carousel.selectItem 1
			expect(carousel.getSelectedIndex()).to.equal 1
			carousel.selectItem 0
			expect(carousel.getSelectedIndex()).to.equal 0
			$selected = $elem.find '.xn-carousel-item.selected .template'
			expect($selected).to.have.lengthOf 1
			itemId = $($selected[0]).attr 'data-id'
			expect(itemId).to.be.equal String(validItems[0].id)

		it 'should mark as selected when clicking on an item', ->
			carousel.render validItems

			$item = $($elem.find('.xn-carousel-item')[1])
			$item.simulate 'click'

			$selected = $elem.find '.xn-carousel-item.selected'
			expect($selected).to.have.lengthOf 1
			expect($item[0]).to.be.equal $selected[0]

		it 'should allow to clear the selection', ->
			carousel.render validItems
			carousel.selectItem 1
			carousel.clearSelection()
			$selected = $elem.find '.xn-carousel-item.selected'
			expect($selected).to.have.lengthOf 0
			expect(carousel.getSelectedIndex()).to.be.equal -1

	describe 'item adding', ->

		it 'should append a new item', ->
			carousel.render validItems
			carousel.addItem validItem
			$items = $elem.find '.xn-carousel-item .template'
			expect($items).to.have.lengthOf validItems.length + 1
			newItemId = $($items[2]).attr 'data-id'
			expect(newItemId).to.be.equal String(validItem.id)

	describe 'item removal', ->

		it 'should remove an existing item', ->
			carousel.render validItems
			carousel.removeItem 0
			$items = $elem.find '.xn-carousel-item .template'
			expect($items).to.have.lengthOf validItems.length - 1
			remainingId = $($items[0]).attr 'data-id'
			expect(remainingId).to.be.equal String(validItems[1].id)

	describe 'should remove all items when it is cleared', ->

		it 'should remove an existing item', ->
			carousel.render validItems
			carousel.clear()
			$items = $elem.find '.xn-carousel-item'
			expect($items).to.have.lengthOf 0
			expect(carousel.getItems()).to.have.lengthOf 0

	describe 'carousel navigation', ->

		it 'should hide left indicator in the first page', ->
			carousel.render validItems

			$leftIndicator = $elem.find '.xn-left-indicator'
			expect($leftIndicator).not.to.be.null
			expect($leftIndicator.css('display')).to.be.equal 'none'

		it 'should go to the next page when clicking right indicator', ->
			carousel.render validItems

			$overview = $elem.find '.xn-overview'

			$rightIndicator = $elem.find '.xn-right-indicator'

			expect($rightIndicator).not.to.be.null

			console.log "Overview position: #{$overview.css('position')}"
			$activeItem = $overview.children('.xn-carousel-item.active')
			expect($activeItem.data('id'), validItems[0].id)

			$rightIndicator.simulate 'click'
			$activeItem = $overview.children('.xn-carousel-item.active')
			expect($activeItem.data('id'), validItems[1].id)

		it 'should go to the previous page when clicking left indicator', ->
			carousel.render validItems

			$overview = $elem.find '.xn-overview'

			$leftIndicator = $elem.find '.xn-left-indicator'
			expect($leftIndicator).not.to.be.null

			$rightIndicator = $elem.find '.xn-right-indicator'
			expect($rightIndicator).not.to.be.null

			console.log "Overview position: #{$overview.css('position')}"
			$activeItem = $overview.children('.xn-carousel-item.active')
			expect($activeItem.data('id'), validItems[0].id)

			$rightIndicator.simulate 'click'
			$activeItem = $overview.children('.xn-carousel-item.active')
			expect($activeItem.data('id'), validItems[1].id)

			$leftIndicator.simulate 'click'
			$activeItem = $overview.children('.xn-carousel-item.active')
			expect($activeItem.data('id'), validItems[0].id)

		it 'should hide the right indicator in the last page', ->
			carousel.render [validItem]

			assert.lengthOf $elem.find('.xn-carousel-item'), 1

			$rightIndicator = $elem.find '.xn-right-indicator'

			expect($rightIndicator).not.to.be.null
			expect($rightIndicator.css('display')).to.be.equal 'none'

		it "should disable navigators before the animation has finished", (done) ->
			carousel = createCarouselWithSlideAnimation()
			carousel.render validItems
			$item = $elem.find(".xn-right-indicator")
			$overviewChildren = $elem.find(".xn-overview").children()
			setTimeout (->
				expect($($overviewChildren.get(0)).hasClass("active")).to.be.equal false
				expect($($overviewChildren.get(1)).hasClass("active")).to.be.equal true
				done()
			), 200
			$item.simulate "click"
			$item.simulate "click"

		it "should disable pagination navigators before the animation has finished", (done) ->
			carousel = createCarouselWithSlideAnimation()
			carousel.render validItems
			$pagIndicators = $elem.find(".xn-pagination .item-container").children()
			setTimeout (->
				expect($($pagIndicators.get("1")).hasClass("selected")).to.be.equal true
				expect($($pagIndicators.get("0")).hasClass("selected")).to.be.equal false
				done()
			), 200
			$($pagIndicators.get("1")).simulate "click"
			$($pagIndicators.get("0")).simulate "click"

		it "should allow pagination and arrow navigators to be mutually excluded before the animation has finished", (done) ->
			carousel = createCarouselWithSlideAnimation()
			carousel.render validItems
			$pagIndicators = $elem.find(".xn-pagination .item-container").children()
			$item = $elem.find(".xn-left-indicator")
			$overviewChildren = $elem.find(".xn-overview").children()
			setTimeout (->
				expect($($overviewChildren.get(0)).hasClass("active")).to.be.equal false
				expect($($overviewChildren.get(1)).hasClass("active")).to.be.equal true
				expect($($pagIndicators.get("1")).hasClass("selected")).to.be.equal true
				expect($($pagIndicators.get("0")).hasClass("selected")).to.be.equal false
				done()
			), 200
			$($pagIndicators.get("1")).simulate "click"
			$item.simulate "click"

		it 'should go to the last page when the function goToLastPage is called', (done)->
			carousel = createCarousel()
			carousel.render(validItems)

			$overview = $elem.find '.xn-overview'

			afterAnimationHandler = ->
				currentIndex = carousel.getItemIndicesForCurrentPage()[0]
				lastIndex = carousel.getLastItemIndex()
				expect(currentIndex).to.be.equal(lastIndex)
				done()

			$overview.on('animation:finished', afterAnimationHandler)

			carousel.goToLastPage()

	describe 'carousel circular navigation', ->

		it 'should go to the last page when clicking the left indicator', ->
			carousel = createCarouselWithCircularNavigation()
			carousel.render validItems

			$overview = $elem.find '.xn-overview'

			$leftIndicator = $elem.find '.xn-left-indicator'
			expect($leftIndicator).not.to.be.null
			expect($leftIndicator.css('display')).to.be.equal 'block'

			currentPage = carousel.getCurrentPage()

			expect(currentPage).to.be.equal(0)

			$leftIndicator.simulate 'click'

			currentPage = carousel.getCurrentPage()

			expect(currentPage).to.be.equal(validItems.length - 1)

		it 'should go to the first page when clicking the right indicator in the last page', ->
			carousel = createCarouselWithCircularNavigation()
			carousel.render validItems

			$overview = $elem.find '.xn-overview'

			$rightIndicator = $elem.find '.xn-right-indicator'
			expect($rightIndicator).not.to.be.null
			expect($rightIndicator.css('display')).to.be.equal 'block'

			currentPage = carousel.getCurrentPage()

			expect(currentPage).to.be.equal(0)

			$rightIndicator.simulate 'click'

			currentPage = carousel.getCurrentPage()

			expect(currentPage).to.be.equal(1)

			$rightIndicator.simulate 'click'

			currentPage = carousel.getCurrentPage()

			expect(currentPage).to.be.equal(2)

			$rightIndicator.simulate 'click'

			currentPage = carousel.getCurrentPage()

			expect(currentPage).to.be.equal(0)

	describe 'page interval', ->
		it 'should change to the next page after the time set', (done)->
			carousel = createCarouselWithInterval(500)
			carousel.render validItems

			$overview = $elem.find '.xn-overview'

			currentPage = carousel.getCurrentPage()

			setTimeout ->
				nextPage = carousel.getCurrentPage()
				expect(nextPage).to.be.equal(currentPage + 1)
				done()
			, 501

	describe 'touch support', ->
		it 'should create the DragModule object when touch support is enabled', ->
			carousel = createCarouselWithDragSupport()
			carousel.render validItems

			expect(carousel.dragModule).not.to.be.null

	describe 'carousel API', ->
		beforeEach ->
			carousel.render validItems

		it 'should return the current page', ->
			expect(carousel.getCurrentPage()).to.equal 0

			carousel.goToPage 1
			expect(carousel.getCurrentPage()).to.equal 1

			carousel.goToPage 2
			expect(carousel.getCurrentPage()).to.equal 2

		it 'should go to previous page', ->
			carousel.goToPage 2
			expect(carousel.getCurrentPage()).to.equal 2
			##expect($overview.children('.xn-carousel-item.active').index()).to.equal 2

			carousel.goBack()
			expect(carousel.getCurrentPage()).to.equal 1
			## expect($overview.children('.xn-carousel-item.active').index()).to.equal 1

		it 'should go to next page', ->
			carousel.goToPage 1
			expect(carousel.getCurrentPage()).to.equal 1
			##expect($overview.children('.xn-carousel-item.active').index()).to.equal 1

			carousel.goNext()
			expect(carousel.getCurrentPage()).to.equal 2
			## expect($overview.children('.xn-carousel-item.active').index()).to.equal 2

		it 'should go to first page', ->
			carousel.goToPage 2
			expect(carousel.getCurrentPage()).to.equal 2
			##expect($overview.children('.xn-carousel-item.active').index()).to.equal 2

			carousel.goToFirstPage()
			expect(carousel.getCurrentPage()).to.equal 0
			## expect($overview.children('.xn-carousel-item.active').index()).to.equal 0

		it 'should go to last page', ->
			carousel.goToPage 0
			expect(carousel.getCurrentPage()).to.equal 0
			##expect($overview.children('.xn-carousel-item.active').index()).to.equal 0

			carousel.goToLastPage()
			expect(carousel.getCurrentPage()).to.equal 2
			## expect($overview.children('.xn-carousel-item.active').index()).to.equal 2

		it 'should go to a specified page', ->
			carousel.goToPage 0
			expect(carousel.getCurrentPage()).to.equal 0
			##expect($overview.children('.xn-carousel-item.active').index()).to.equal 0

			carousel.goToPage 2
			expect(carousel.getCurrentPage()).to.equal 2
			## expect($overview.children('.xn-carousel-item.active').index()).to.equal 2

			carousel.goToPage 1
			expect(carousel.getCurrentPage()).to.equal 1
			## expect($overview.children('.xn-carousel-item.active').index()).to.equal 1

		it 'should return the number of items', ->
			expect(carousel.getItemCount()).to.equal validItems.length
			expect(carousel.getItemCount()).to.equal carousel.getItems().length

			carousel.removeItem 0
			expect(carousel.getItemCount()).to.equal validItems.length - 1
			expect(carousel.getItemCount()).to.equal carousel.getItems().length

			carousel.addItem {id:5}
			carousel.addItem {id:7}
			expect(carousel.getItemCount()).to.equal validItems.length + 1
			expect(carousel.getItemCount()).to.equal carousel.getItems().length

		it 'should return the number of pages', ->
			expect(carousel.getPageCount()).to.equal validItems.length

			carousel.removeItem 0
			expect(carousel.getPageCount()).to.equal validItems.length - 1

			carousel.addItem {id:5}
			carousel.addItem {id:7}
			expect(carousel.getPageCount()).to.equal validItems.length + 1

		it 'should return the selected Index', ->
			expect(carousel.getSelectedIndex()).to.equal -1

			carousel.selectItem 1
			expect(carousel.getSelectedIndex()).to.equal 1

			carousel.selectItem 0
			expect(carousel.getSelectedIndex()).to.equal 0
			##expect($overview.find('.selected').index()).to.equal 0

			carousel.clearSelection()
			expect(carousel.getSelectedIndex()).to.equal -1
			##expect($overview.children('.selected').index()).to.equal -1

		it 'should return the indices for a specified page', ->
			expect(carousel.getItemIndicesForPage(0)).to.have.members [0]
			expect(carousel.getItemIndicesForPage(1)).to.have.members [1]
			expect(carousel.getItemIndicesForPage(2)).to.have.members [2]

		it 'should return the last item index', ->
			expect(carousel.getLastItemIndex()).to.equal 2
			expect(carousel.getLastItemIndex()).to.equal carousel.getItemCount()-1

		it 'should return the page index for an specific item index', ->
			expect(carousel.getPageIndex(0)).to.equal 0
			expect(carousel.getPageIndex(1)).to.equal 1

			carousel = createCarouselWithTwoItemsPerPage()
			carousel.render validItems

			expect(carousel.getPageIndex(0)).to.equal 0
			expect(carousel.getPageIndex(1)).to.equal 0

	describe 'carousel events', ->
		it 'should trigger the carousel:initialized event when the carousel is created', (done)->

			this.timeout 100

			initializedHandler = ->
				done()

			$elem.on('carousel:initialized', initializedHandler)
			carousel = createCarousel()

		it 'should trigger the carousel:rendered event when method render is called', (done)->

			this.timeout 100

			renderedHandler = ->
				done()

			$elem.on('carousel:rendered', renderedHandler)
			carousel = createCarousel()
			carousel.render validItems

		it 'should trigger the carousel:itemAdded event when a new item is added', (done)->
			carousel = createCarousel()
			carousel.render validItems

			itemAddedHandler = (event, item, $item)->

				newItemId = $item.children('.template').attr 'data-id'
				expect(newItemId).to.be.equal String(validItem.id)
				expect(item.id).to.be.equal(validItem.id)
				done()

			$elem.on('carousel:itemAdded', itemAddedHandler)

			carousel.addItem validItem

		it 'should trigger the carousel:itemRemoved event when an existing item is removed', (done)->
			carousel = createCarousel()
			carousel.render validItems

			itemRemovedHandler = ->
				$items = $elem.find '.xn-carousel-item .template'
				expect($items).to.have.lengthOf validItems.length - 1
				remainingId = $($items[0]).attr 'data-id'
				expect(remainingId).to.be.equal String(validItems[1].id)
				done()

			$elem.on('carousel:itemRemoved', itemRemovedHandler)

			carousel.removeItem 0

		it 'should trigger the carousel:itemsCleared event when the clear method is called', (done)->

			carousel = createCarousel()
			carousel.render validItems

			$overview = $elem.find '.xn-overview'

			itemsClearedHandler = ->
				expect($overview.children().length).to.be.equal(0)
				done()

			$elem.on('carousel:itemsCleared', itemsClearedHandler)

			carousel.clear()

		it 'should trigger events in both the DOM element and the carousel instance', ->
			evHandler = sinon.spy()
			evHandlerDOM = sinon.spy()
			carousel = createCarousel()
			carousel.render validItems

			carousel.on('carousel:testevent', evHandler)
			$elem.on('carousel:testevent', evHandlerDOM)

			carousel._trigger 'carousel:testevent'

			expect(evHandler).to.have.been.calledOnce
			expect(evHandlerDOM).to.have.been.calledOnce

		it 'should trigger the carousel:itemSelected when selectItem is called', ->
			itemSelectedHandler = sinon.spy()
			carousel = createCarousel()
			carousel.render validItems

			$elem.on('carousel:itemSelected', itemSelectedHandler)

			carousel.selectItem 2

			expect(itemSelectedHandler).to.have.been.called

		it 'should NOT trigger the carousel:itemSelected when selectItem is called with silent = true', ->
			itemSelectedHandler = sinon.spy()
			carousel = createCarousel()
			carousel.render validItems

			$elem.on('carousel:itemSelected', itemSelectedHandler)

			carousel.selectItem(2, {silent:true})

			expect(itemSelectedHandler.called).to.be.false

		it 'should trigger the carousel:itemSelected event when an item is marked as selected', (done)->
			carousel = createCarousel()
			carousel.render validItems

			itemSelectedHandler = (event, selectedIndex)->
				$selected = $elem.find '.xn-carousel-item.selected'
				expect($selected.index()).to.be.equal(selectedIndex)

				$selected = $elem.find '.xn-carousel-item.selected .template'
				expect($selected).to.have.lengthOf 1
				itemId = $($selected[0]).attr 'data-id'
				expect(itemId).to.be.equal String(validItems[selectedIndex].id)
				done()

			$elem.on('carousel:itemSelected', itemSelectedHandler)

			$item = $($elem.find('.xn-carousel-item')[1])
			$item.simulate 'click'
###
    it 'should change to the first page after the last one', (done)->
      carousel = createCarouselWithInterval(500)
      carousel.render validItems

      $overview = $elem.find '.xn-overview'

      currentPage = carousel.getCurrentPage()

      setTimeout ->
        nextPage = carousel.getCurrentPage()
        expect(nextPage).to.be.equal(currentPage + 1)
      , 501

      setTimeout ->
        nextPage = carousel.getCurrentPage()
        expect(nextPage).to.be.equal(0)
        done()
      , 1000
###



