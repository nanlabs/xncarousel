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

## Development Requirements

 - node.js
 - Grunt and Bower:
   `npm install -g grunt-cli bower`

## Dependencies

The component only requires jQuery 1.9

## Getting started 

 - `git clone https://github.com/nanlabs/xncarousel.git`
 - `cd xncarousel`
 - `npm install`
 - `bower install`
 

## Build commands

### Full build

`grunt`
Compiles, tests and packages the development and production (minified) version of the component.

`grunt build-no-tests`
Same as above but doesn't run tests.

### Development

`grunt dev`
Compiles the code and then creates a server, opens the dev page in the default browser and watches for file changes as you develop. Everytime a file changes it will compile, test them and reload the dev page. 

### Test

`grunt test`
Compiles and runs the tests in the console (terminal).
 
`grunt test-browsers`
Compiles and runs the tests in real browsers.

`grunt coverage`
Compiles, runs the tests and crates a coverage report.


## Usage

### Initialization

To use the component, follow these steps:

1. Include the minified js library in the html page as follows:
```<script src="<carousel dir>/jquery.xnCarousel.min.js"></script>``` 

2. Include the html dom element to hold the component
```<div class="carousel-container"></div>``` 

3. Initialize it from your javascript code 

```javascript

$(function () {
	$(".carousel-container").xnCarousel({
		...options (see below)...
	});
```

### Item Definition

There are 2 ways to define the items, via DOM elements or using a template and JSON. 

1. DOM Definition

Put the items markup inside a wrapper with "xn-items" class defined. The wrapper must be a child of the main carousel container. 

eg:
	```
	<div class="carousel-container">
		<div class="xn-items">
			<div class="template"><img src="test1.jpg"></img></div>
			<div class="template"><img src="test2.jpg"></img></div>
			<div class="template"><img src="test3.jpg"></img></div>
		</div>
	</div>
	``` 
	
No special option must be used since the component will look for items insde a "xn-items" wrapper. 
Then render the items by calling
```javascript
$(".carousel-container").xnCarousel("render");
``` 

2. JSON items (with a template)

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
* **itemWidth**: {number - default: none}  ___ *Item width in pixels. When defined, pageSize is ignored as there are as many items as can fit in the carousel viewport*
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


## Documentation

### Events

* **carousel:initialized** *Thrown after the carousel is initialized, but before items are rendered.*

* **carousel:pageSelected [index]** *Thrown when the pages are selected*
* **carousel:selectionClear** *Thrown when the selection has been removed*
* **carousel:itemRemoved** *Thrown after a carousel item has been removed*
* **carousel:itemAdded** *Thrown after a carousel item has been added*

* **carousel:pageChanged [pageNumber]** *Thrown when the pages are changed, by clicking or automatically*
* **carousel:pageChangeEnded** *Thrown when the pages changing animations are done*
* **carousel:pageRemoved** *Thrown after a carousel page has been removed, because the items quotient has been decreased*
* **carousel:pageAdded** *Thrown after a carousel page has been added, because the items quotient has been increased*

* **carousel:itemsCleared** *Thrown after the carousel items are cleared*







###Responsive behaviour

Let's put an example to get this better. Suppose that the carousel viewport has a media query like this setted:


    @media (max-width: 900px) {
       width: 80%;
       height: 296px;
    }


If carousel responsive option is set to false, the media query works as defaults, otherwise it updates the height to keep the aspect. So for this case the height (296px) applies to the upper limit (900px) and then it keeps the same proportions at different resolutions. Also remember that the carousel responsive option accepts an object with different ranges (like CSS3 media queries do) where this behaviour is enabled/disabled.


## License

**The MIT License (MIT)**

**Copyright © 2013 X-Team**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
