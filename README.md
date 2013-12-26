# xnCarousel jQuery Plugin

jQuery plugin to create a fully featured Carousel component 

## Features

 - Very Flexible (easy to adapt using the settings and templates)
 - Paginable (One or multiple items per page). Includes pagination components (arrows and bullets)
 - Responsive 
 - Touch enabled
 - Different layout/animation strategies (slide, fade, no animation)
 - Uses Hardware accelerated CSS3 animations when available (with fallback to jQuery animations)
 - Item Data can be provided via DOM elements or using JSON
 - Complete API to interact with the carousel using Javascript


## Dependencies

The component only requires jQuery 1.9


## Usage

### Download

 - If you are building the component. Read the _"Development"_ section at the end of the document.
 - or Add this component as a bower dependency, poiting to this repo (develop branch). Read the _"Bower"_ section.
 - or Download the files in the dist directory in this repo.

### Bower

Install the carousel as bower component by:

 - executing:
`bower install http://github.com/nanlabs/xncarousel.git`

 - or by adding the following line to the dependencies on your bower.json
`"xnCarousel": "http://github.com/nanlabs/xncarousel.git"`
and executing
`bower install`

After doing this, the carousel distribution files should be located at `<bower libs>/xnCarousel/dist`.
`<bower libs>` is usually `<root>/bower_components`, but it could be different in your environment.


### Initialization

To use the component, follow these steps:

1. Include the minified js library in the html page as follows:
```<script src="<carousel dir>/jquery.xnCarousel.min.js"></script>``` 

2. Include the stylesheet css or less (read the *"Styling"* section)

3. Include the html dom element to hold the component
```<div class="carousel-container"></div>``` 

4. Initialize it from your javascript code 

```javascript

$(function () {
	$(".carousel-container").xnCarousel({
		...options (see below)...
	});
```

### Item Definition

There are 2 ways to define the items, via DOM elements or using a template and JSON. 

#### DOM Definition
Put the items markup inside a wrapper with "xn-items" class defined. The wrapper must be a child of the main carousel container. 

Example (which creates 3 items):
```html
	<div class="carousel-container">
		<div class="xn-items">
			<div class="some-class"><img src="test1.jpg"></img></div>
			<div class="some-class"><img src="test2.jpg"></img></div>
			<div class="some-class"><img src="test3.jpg"></img></div>
		</div>
	</div>
``` 
	
No special option must be used since the component will look for items insde a "xn-items" wrapper. 
Then render the items by calling
```javascript
$(".carousel-container").xnCarousel("render");
``` 

#### JSON items (with a template)

If you need to load items using JSON, don't define the items in the DOM. Instead, create a JS function that receieves a single item and returns the HTML as a string.
Example:
```javascript
var templateFunction = function (item) {
    var itemTemplate = '<span class="thumbnail-wrapper"><img class="thumbnail" src="' + item.thumb + '"/></span>';
	itemTemplate += '<div class="name">' + item.name + '</div>';
	itemTemplate += '<div class="date">' + item.date + '</div>';

    return itemTemplate;
};
```

Provide the function to the carousel on initalization:
```javascript
$(".carousel-container").xnCarousel({
	...
	itemTemplate: templateFunction,
	...
});
```

Then call the render method, but passing the items array:
```javascript
$(".carousel-container").xnCarousel("render", itemsArray);
``` 


### Component options:

* **touchEnabled**: {boolean - default: false}  ___ *Enables or disables the touch feature*
* **circularNavigation**: {boolean - default: false}  ___ *True enables the circular (loop) navigation*
* **itemTemplate**: {function - default: empty template}  ___ *Function that receives an item and returns the HTML to be used when rendering that item. Used as a template when loading items via JSON*


* **pageSize**: {number - default: 1}  ___ *Number of items per page*
* **pagingIndicators**: {boolean - default: false}  ___ *True to display the page indicators (bullets). False to hide them*
* **pageInterval**: {number - default: 0}  ___ *If > 0, carousel will automatically move to the next page using the value as interval in milliseconds, ie 1000 means the carousel will change the page once a second. If set to 0, automatic navigation is disabled.*
* **showNavigationArrows**: {true | false | "auto" - default: auto}  ___ *Shows page navigation arrows (prev/next). If true, the arrows are always displayed, when set to false, arrows are not shown. If set to auto, it will display arrows on mouse over*


* **animationType**: {'slide' | 'fade' | 'none'}  ___ *Transition effect to be used when navigating pages*
* **moveSpeed**: {number - default: 1000}  ___ *Duration of the transition animations (in milliseconds)*

* **loadingType**: {'lazy' | 'eager'}  ___ *Sets the items loading strategy. "Lazy" will delay the item's image loading until that item is displayed (showing an animation while loading). "Eager" will load all images as soon as possible*

* **responsive**: {true | false | rangesObject} __ *Enables/disables responsive behaviour in all cases (when booleans) or it does dynamically for different resolutions. See below in this guide for more details.*


		rangesObject : { "*..320" : true,
				 		 "321..768" : false,
						 "769..*" : true
				        }


 this stands for: 
 - max-width 320px: carousel responsive enabled.
 - min-width 321px and max-width 768px: carousel responsive disabled.
 - min-width 769px: carousel responsive enabled.


### Pagination

*TODO*  Pagination classes instructions



## Styling

The carousel includes a base stylesheet that must be included/imported in your code and extended for your custom look.
The stylesheet is located in the _"dist"_ directory (and included in the bower component) and is provided as:
 - a minified css (_jquery.xnCarousel.min.css_) which can be included using the _link_ tag.
 - a LESS file (_jquery.xnCarousel.less_) which you can import if you are using LESS
 - a SASS file (_jquery.xnCarousel.scss_) which you can import if you are using SASS
 

*TODO*  LESS/SASS INSTRUCTIONS


## API Documentation

### Methods

The carousel includes many methods which can be used to interact with it.
There are 2 ways of calling these methods:
- Using the jQuery plugin directly
```
var result = $(<selector>).xnCarousel("<method name>", <param1>, <param2>, ...) 
```

Example:
```javascript
var itemIndex = $(".carousel-container").xnCarousel("getPageIndex", 2);
``` 

- Using the carousel instance
```
var carousel = $(<selector>).xnCarousel({api: true});
var result = carousel.<method name>(<param1>, <param2>, ...);
```

Example:
```javascript
var carousel = $(".carousel-container").xnCarousel({api: true});
var itemIndex = carousel.getPageIndex(2);
``` 

List of methods:

* **goToPage(pageNumber)** *Navigates to the provided page*
* **goNext()** *Navigates to the next page if available (might be the first when loop navigation is enabled)*
* **goBack()** *Navigates to the prev page if available (might be the last when loop navigation is enabled)*
* **goToLastPage()** *Navigates to the last page*
* **goToFirstPage()** *Navigates to the first page*
* **getCurrentPage() -> Number** *Returns the current page index*
* **getItemCount() -> Number** *Returns the number of items*
* **getPageCount() -> Number** *Returns the number of pages*
* **getPageIndex(itemIndex) -> Number** *Returns the page index for the provided item*
* **getItems() -> $items** *Returns the jQuery DOM elements for the items*
* **getLastItemIndex() -> Number** *Returns the index of the last item*
* **getItemIndicesForPage(pageIndex) -> [Number]** *Returns an array with the item indices that belong to the provided page*
* **getItemIndicesForCurrentPage() -> [Number]** *Returns an array with the item indices that belong to the current page*
* **clear(options)** *Removes all the items. The event is not fired if options.silent = true*
* **isValidItemIndex(index) -> Boolean** *Returns true if the provided index is valid (within range). False otherwise*
* **removeItem(index)** *Removes an item by index*
* **selectItem(index, options)** *Changes the current selection to an item by index. The event is not fired if options.silent = true*
* **clearSelection(options)** *Clears the selected item. The event is not fired if options.silent = true*
* **getSelectedIndex() -> Number** *Returns the index of the selected item*
* **addItem(item)** *Adds an item to the carousel. The item parameter might be a JS object (the template function is used) or an html code as a string*
* **render(items)** *Renders the items passed as parameters or the ones under the DOM elements with class "xn-items". Must be called once on initialization*


### Events

The Carousel triggers many events to notify the client code of situations. The component uses jQuery's event infrastructure.
Listeners for this events might be added to the same DOM element to which the plugin was applied (in the example, ``` $(".carousel-container")```)

To avoid conflicts, all event names contain a namespace prefix: "carousel:".

For example, to add a listener for the pageSelected event, use the following code:
```javascript
$(".carousel-container").on("carousel:pageSelected", function(event, pageIndex) {
	...Listener logic...
});
``` 

#### List
* **initialized** *Triggered after the carousel is initialized, but before items are rendered.*
* **rendered** *Triggered after the carousel items and pagination components have been rendered.*

* **pageSelected [index]** *Triggered when the pages are selected*
* **itemSelected  [index]** *Triggered after an item has been selected*
* **selectionClear** *Triggered when the selection has been removed*

* **itemRemoved** *Triggered after a carousel item has been removed*
* **itemAdded [itemJSON, $item]** *Triggered after a carousel item has been added*
* **itemsCleared** *Triggered after all the carousel items are removed*

* **pageChangeStart [currentPageIndex, newPageIndex]** *Triggered when a page changed was requested (by code or UI), before actually changing the page*
* **pageChanged [pageIndex]** *Triggered after the state of the carousel has changed (new current page) and the animation has started but before the animation ends*
* **pageChangeEnded [oldPageIndex, currentPageIndex]** *Triggered when the page change has finished (incl. animations)*

* **pageRemoved** *Triggered after a carousel page has been removed, because an item has been removed*
* **pageAdded [pageIndex]** *Triggered after a carousel page has been added, because an item has been added*


## Responsive behaviour

Let's put an example to get this better. Suppose that the carousel viewport has a media query like this setted:


    @media (max-width: 900px) {
       width: 80%;
       height: 296px;
    }


If carousel responsive option is set to false, the media query works as defaults, otherwise it updates the height to keep the aspect. So for this case the height (296px) applies to the upper limit (900px) and then it keeps the same proportions at different resolutions. Also remember that the carousel responsive option accepts an object with different ranges (like CSS3 media queries do) where this behaviour is enabled/disabled.


## Development 

### Requirements

 - node.js
 - Grunt and Bower:
   `npm install -g grunt-cli bower`

###  Getting started 

 - `git clone https://github.com/nanlabs/xncarousel.git`
 - `cd xncarousel`
 - `npm install`
 - `bower install`
 

###  Build commands

#### Full build

`grunt`
Compiles, tests and packages the development and production (minified) version of the component.

`grunt build-no-tests`
Same as above but doesn't run tests.

#### Development

`grunt dev`
Compiles the code and then creates a server, opens the dev page in the default browser and watches for file changes as you develop. Everytime a file changes it will compile, test them and reload the dev page. 

#### Test

`grunt test`
Compiles and runs the tests in the console (terminal).
 
`grunt test-browsers`
Compiles and runs the tests in real browsers.

`grunt coverage`
Compiles, runs the tests and crates a coverage report.

## License

**The MIT License (MIT)**

**Copyright © 2013 X-Team**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
