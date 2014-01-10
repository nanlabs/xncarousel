$ = require 'jquery'
PagingIndicator = require '../../../src/js/pagination/paging-indicator'

###
# Test class for the Pagination indicator
#
###
describe 'Pagination indicator', ->
  $elem = $("#element")

  paginator = {}

  beforeEach ->
    $elem = $("#element")
    createIndicator()

  afterEach ->
    cleanElement()

  createIndicator = (pageCount, pageSelectedCallback) ->
    cleanElement()
    pageSelectedCallback ?= ->
    pageCount ?= 0
    getPageCount = ->
      return pageCount

    api = {}
    api.getLogger = -> console
    paginator = new PagingIndicator({api: api, getPageCount: getPageCount, onPageSelected: pageSelectedCallback})
    paginator.render($elem)

  cleanElement = ->
    $elem.off()
    $elem.empty()

  getItems = ->
    $elem.find '.item-container .item'

  validateSize = (num) ->
    expect(getItems()).to.have.lengthOf num
    expect(paginator.itemCount).to.be.equal num

  describe 'component rendering', ->

    it 'should create the container', ->
      expect($elem.find('.xn-pagination')).to.have.lengthOf 1
      expect($elem.find('.xn-pagination .item-container')).to.have.lengthOf 1

    it 'should create the UI with the amount of page items specified', ->
      createIndicator 4
      validateSize 4


    it 'should create the UI with no page items if desired', ->
      validateSize 0


  describe 'item selection', ->

    it 'should select only the first item when initialized', ->
      createIndicator 5
      expect(getItems().first().hasClass('selected')).to.be.true
      expect(getItems().filter('.selected')).to.have.lengthOf 1

    it 'should select an item when clicked and deselect the others', ->
      createIndicator 5
      $item = getItems().eq 2

      expect(getItems().first().hasClass('selected')).to.be.true
      expect($item.hasClass 'selected').to.be.false

      $item.simulate 'click'
      expect($item.hasClass 'selected').to.be.true
      expect(getItems().first().hasClass('selected')).to.be.false

      expect(getItems().filter('.selected')).to.have.lengthOf 1

    it 'should trigger a "selected" event with the proper index', ->
      selectionHandler = sinon.spy()

      createIndicator 5, selectionHandler

      $item = getItems().eq 2
      $item.simulate 'click'

      expect(selectionHandler).to.have.been.calledOnce
      expect(selectionHandler).to.have.been.calledWith 2

    it 'should allow to select an item by code (without triggering the event)', ->
      selectionHandler = sinon.spy()

      createIndicator 5, selectionHandler
      $item = getItems().eq 3

      expect(getItems().first().hasClass('selected')).to.be.true
      expect($item.hasClass 'selected').to.be.false

      paginator.select 3

      expect($item.hasClass 'selected').to.be.true
      expect(getItems().first().hasClass('selected')).to.be.false

      expect(getItems().filter('.selected')).to.have.lengthOf 1
      expect(selectionHandler.called).to.be.false

  describe 'item list manipulation', ->

    it 'should add an new item to an empty indicator', ->
      validateSize 0
      paginator.addItem()
      validateSize 1

    it 'should add an new items to a not empty indicator', ->
      createIndicator 4
      validateSize 4
      paginator.addItem()
      validateSize 5
      paginator.addItem()
      validateSize 6

    it 'should remove the last item if it exists', ->
      createIndicator 4
      validateSize 4
      paginator.removeItem()
      validateSize 3
      paginator.removeItem()
      validateSize 2

    it 'should not remove anything if it is already empty', ->
      validateSize 0
      paginator.removeItem()
      validateSize 0

    it 'should allow to add and remove', ->
      validateSize 0
      paginator.addItem()
      validateSize 1
      paginator.removeItem()
      validateSize 0
      paginator.addItem()
      validateSize 1
      paginator.addItem()
      validateSize 2
      paginator.removeItem()
      validateSize 1
