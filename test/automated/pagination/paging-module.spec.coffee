$ = require 'jquery'
PagingModule = require '../../../src/js/pagination/paging-module'

###
# Test class for the Pagination module
#
###
describe 'Pagination module', (done)->
	$elem = $("#element")

	module = {}

	beforeEach ->
		createModule()

	afterEach ->
		cleanElement()
		module.circularNavigation = true

	createModule = ->
		cleanElement()

		jqMock =
			removeClass: ->
			addClass: ->

		api =
			container: $elem
			getItemCount: -> 17
			getItemsForPage: ->
			getItemsForCurrentPage: -> jqMock

		options =
			pageSize: 5
			circularNavigation: true
			onPageSelected: ->

		module = new PagingModule(api, options)

	cleanElement = ->
		$elem.off()
		$elem.empty()

	describe 'initialization', ->
		it 'should set initial values', ->
			expect(module.getCurrentPage()).to.equal 0
			expect(module.getPrevCurrentPage()).to.equal 0


	describe 'navigation', ->

		it 'should go to page when requested', ->
			jqMock = module.carouselApi.getItemsForCurrentPage()
			removeClassSpy = sinon.spy(jqMock, 'removeClass')
			addClassSpy = sinon.spy(jqMock, 'addClass')

			expect(module.getCurrentPage()).to.equal 0

			module.goToPage 2
			expect(module.getPrevCurrentPage()).to.equal 0
			expect(module.getCurrentPage()).to.equal 2

			expect(removeClassSpy).to.have.been.calledWith 'active'
			expect(addClassSpy).to.have.been.calledWith 'active'

			module.goToPage 1
			expect(module.getPrevCurrentPage()).to.equal 2
			expect(module.getCurrentPage()).to.equal 1

			jqMock.addClass.restore()
			jqMock.removeClass.restore()

	describe 'calculation (circular = true/false)', ->

		it 'should calculate the number of pages', ->
			expect(module.getPageCount()).to.equal 4

		it 'should calculate the last page', ->
			expect(module.getLastPage()).to.equal 3

		it 'should calculate the next page index (+1) when not in the last page', ->
			module.goToPage 0
			expect(module.getNextPage()).to.equal 1

			module.goToPage 1
			expect(module.getNextPage()).to.equal 2

		it 'should calculate the prev page index (-1) when not in the first page', ->
			module.goToPage 2
			expect(module.getPrevPage()).to.equal 1

			module.goToPage 1
			expect(module.getPrevPage()).to.equal 0

		it 'should calculate the item indices for a given page (and return empty array on invalid page)', ->
			expect(module.getIndicesForPage(-1)).to.be.empty
			expect(module.getIndicesForPage(0)).to.have.members [0, 1, 2, 3, 4]
			expect(module.getIndicesForPage(1)).to.have.members [5, 6, 7, 8, 9]
			expect(module.getIndicesForPage(2)).to.have.members [10, 11, 12, 13, 14]
			expect(module.getIndicesForPage(3)).to.have.members [15, 16]
			expect(module.getIndicesForPage(4)).to.be.empty

	describe 'calculation (circular = false)', ->

		beforeEach ->
			module.circularNavigation = false

		it 'should determine if there is a prev page', ->
			module.goToPage 0
			expect(module.hasPrevPage()).to.be.false

			module.goToPage 2
			expect(module.hasPrevPage()).to.be.true

		it 'should determine if there is a next page', ->
			module.goToPage 0
			expect(module.hasNextPage()).to.be.true

			module.goToPage 3
			expect(module.hasNextPage()).to.be.false

		it 'should return the same page as "Next Page" when in the last page', ->
			module.goToPage 3
			expect(module.getNextPage()).to.equal 3

		it 'should return the same page as "Prev Page" when in the first page', ->
			module.goToPage 0
			expect(module.getPrevPage()).to.equal 0

	describe 'calculation (circular = true)', ->

		it 'should always assume a prev page exist', ->
			module.goToPage 0
			expect(module.hasPrevPage()).to.be.true

			module.goToPage 2
			expect(module.hasPrevPage()).to.be.true

		it 'should always assume a next page exist', ->
			module.goToPage 0
			expect(module.hasNextPage()).to.be.true

			module.goToPage 3
			expect(module.hasNextPage()).to.be.true

		it 'should return the first page as "Next Page" when in the last page', ->
			module.goToPage 3
			expect(module.getNextPage()).to.equal 0

		it 'should return the last page as "Prev Page" when in the first page', ->
			module.goToPage 0
			expect(module.getPrevPage()).to.equal 3


	describe 'UI', ->

		it 'should create the pagination indicator UI', ->
			expect(module.pagingIndicator).to.not.exist
			module.renderIndicator()
			expect(module.pagingIndicator).to.exist

		it 'should delegate to the pagination indicator to update the UI', ->
			module.renderIndicator()
			spy = sinon.spy(module.pagingIndicator, "select")

			module.updateUI()

			expect(spy).to.have.been.calledWith module.getCurrentPage()
			module.pagingIndicator.select.restore()

		it 'should delegate to the pagination indicator to enable the UI', ->
			module.renderIndicator()
			spy = sinon.spy(module.pagingIndicator, "enablePaginationUI")

			module.enableUI()

			expect(spy).to.have.been.calledOnce
			module.pagingIndicator.enablePaginationUI.restore()

		it 'should delegate to the pagination indicator to disnable the UI', ->
			module.renderIndicator()
			spy = sinon.spy(module.pagingIndicator, "disablePaginationUI")

			module.disableUI()

			expect(spy).to.have.been.calledOnce
			module.pagingIndicator.disablePaginationUI.restore()