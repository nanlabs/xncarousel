var $ = require('jquery');
var Class = require('class');

/**
 *  Dragging module which makes the carousel touch-enabled.
 *	@module carousel/dragging
 */
var DragSupport = Class.extend({

  // Max delay between touch down and touch up that is considered to be a click
  touchClickDelayMS: 300,

  init: function($element, options) {

    this.onDrag = options.onDrag;
    this.onDragFinish = options.onDragFinish;

    this.$element = $element;

    this.initialPageX = 0;
    this.currentPageX = 0;

    this.isDragging = false;
    this.finishDragging = false;

    // Define proxies for each event handler to keep using this as the DragSupport instance.
    this.startTouchHandler = $.proxy(this.startTouchHandler, this);
    this.mouseDownHandler = $.proxy(this.mouseDownHandler, this);

    this.dragHandler = $.proxy(this.dragHandler, this);

    this.endTouchHandler = $.proxy(this.endTouchHandler, this);
    this.mouseUpHandler = $.proxy(this.mouseUpHandler, this);

    this._enableStartEvents();
  },

  isTouchDevice: function() {
    try {
      document.createEvent("TouchEvent");
      return true;
    } catch (e) {
      return false;
    }
  },

  startTouchHandler: function(event) {

    this.touchStartTime = new Date();

    $( "body" ).addClass( "noSelect" );

    var eventData = event.touches[0];

    this.$element[0].ontouchmove = this.dragHandler;
    this.$element[0].ontouchend = this.endTouchHandler;
    this.$element[0].ontouchcancel = this.endTouchHandler;

    document.ontouchmove = this.dragHandler;
    document.ontouchend = this.endTouchHandler;
    document.ontouchcancel = this.endTouchHandler;

    console.debug('Start touch handler, pageX: ' + eventData.pageX);

    this.initialPageX = this.currentPageX = eventData.pageX;
  },

  mouseDownHandler: function(event) {

    this.touchStartTime = new Date();

    event.stopPropagation();

    $( "body" ).addClass( "noSelect" );

    this.$element.on('mousemove', this.dragHandler);
    this.$element.on('mouseup', this.mouseUpHandler);

    $(document).on('mousemove', this.dragHandler);
    $(document).on('mouseup', this.mouseUpHandler);

    console.debug('Start touch handler, pageX: ' + event.pageX);

    this.initialPageX = this.currentPageX = event.pageX;

    return false;
  },

  dragHandler: function(event) {

    event.preventDefault();

    this.isDragging = true;

    var eventData = event;
    if (this.isTouchDevice()) {
      eventData = event.touches[0];
    }

    var diff = (this.currentPageX - eventData.pageX);
    this.currentPageX = eventData.pageX;

    if (diff === 0) {
		// Skip this event, is duplicated
		return false;
    }

    console.debug('Move touch handler, pageX:', this.currentPageX);

    this.onDrag(diff);

    this.finishDragging = true;

    return false;
  },


  endTouchHandler: function(event) {

    console.debug('End touch handler');

    var now = new Date();

    var eventData = event;
    if (this.isTouchDevice()) {
      eventData = event.changedTouches[0];
    }

    var diffPosition = this.initialPageX - eventData.pageX;

    this.isDragging = false;

    $( "body" ).removeClass( "noSelect" );

    this.$element[0].ontouchmove = null;
    this.$element[0].ontouchend = null;
    document.ontouchmove = null;
    document.ontouchend = null;

    // If user is not dragging and the delay between touch down and up is smaill enough, consider it a 'click'
    if ( ((diffPosition === 0) || !this.isDragging) && (now.getTime() - this.touchStartTime.getTime() < this.touchClickDelayMS) ) {
      // The user wants to select and item
      $(event.target).trigger('itemTouched');
    } else {
      this.onDragFinish(this.initialPageX, eventData);
    }
  },

  mouseUpHandler: function(event) {

    console.debug('End touch handler');

    var now = new Date();

    var diffPosition = this.initialPageX - event.pageX;
    var timeDiff = now.getTime() - this.touchStartTime.getTime();

    $( "body" ).removeClass( "noSelect" );

    this.$element.off('mousemove', this.dragHandler);
    this.$element.off('mouseup', this.mouseUpHandler);
    $(document).off('mousemove', this.dragHandler);
    $(document).off('mouseup', this.mouseUpHandler);

    // If user is not dragging and the delay between touch down and up is small enough, consider it a 'click'
    if ( (diffPosition === 0) && (timeDiff > 0 && timeDiff < this.touchClickDelayMS) ) {
      // The user wants to select and item
      $(event.target).trigger('itemTouched');
    } else {
      this.onDragFinish(this.initialPageX, event);
    }

    return false;
  },

  _enableStartEvents: function() {
		if (this.isTouchDevice()) {
      this.$element[0].ontouchstart = this.startTouchHandler;
    } else {
      this.$element.on('mousedown', this.mouseDownHandler);
    }
  },

  _disableStartEvents: function() {
		if (this.isTouchDevice()) {
      this.$element[0].ontouchstart = null;
    } else {
      this.$element.off('mousedown', this.mouseDownHandler);
    }
  },

  disableDragging: function() {
		console.log('Disable dragging');
		this._disableStartEvents();
  },

  enableDragging: function() {
		console.log('Enable dragging');
		this._enableStartEvents();
  }

});

// Exports the class
module.exports = DragSupport;
