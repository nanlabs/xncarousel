# xnCarousel jQuery Plugin

jQuery plugin to create a fully featured Carousel component 

## Getting Started

 - Download the project
 - Install node.js
 - Install Grunt and Bower:
   `npm install -g grunt-cli bower`
 - `npm install`
 - `bower install`
 
After doing that, all the dependencies will be downloaded.
Then, use grunt to build and test the component and also run the demo.

### Build and test

Run `grunt`

It will test and build the development and production (minified) version of the component.

### Develop

Run `grunt dev`

It will create a server, open the dev page and watch for file changes as you develop (it will compile and test them and reload the dev page). 

### Test

Run `grunt test`

It will only run the tests.
 
## Examples

Run `grunt demo`


## Usage
This plugin has two ways of using it:

###JS component:
To properly use the library just follow this steps:

1. Include the minified js library in the html page as follows:
```<script src="../../dist/carousel.min.js"></script>``` 

2. Include the html dom element to hold the component
```<div class="carousel-container"></div>``` 

3. Declare the item definition template: 

```javascript
var itemTemplate = function (item) {
    var itemTemplate = '<span class="thumbnail-wrapper"><img class="thumbnail" src="' + item.thumb + '"/></span>';
	itemTemplate += '<div class="name">' + item.name + '</div>';
	itemTemplate += '<div class="date">' + item.date + '</div>';

    return itemTemplate;
};
```

4.. Finally just invoke the carousel constructor: 

```javascript
var Carousel = require('xnCarousel');

$(function () {
	var carousel = new Carousel(".carousel-container", {
		touchEnabled: true,
		pageSize: 1,
		pagingIndicators: true,
		animationType: 'none',
		moveSpeed: 500,
		showIndicators: true,
		itemTemplate: itemTemplate                       
	});
	
	carousel.render(items);
});
```

###JQuery plugin:
Just perform the previous steps 1,2,3 and then:
```javascript

$(function () {
	$(".carousel-container").xnCarousel({
		touchEnabled: true,
		pageSize: 1,
		pagingIndicators: true,
		animationType: 'none',
		moveSpeed: 500,
		showIndicators: true,
		itemTemplate: itemTemplate                       
	});

	$(".carousel-container").xnCarousel("render", items);
});
```


## Dependencies

The component requires jQuery 1.9.


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


### Component options:

* **touchEnabled**: {true | false}  ___ *Enables or disables the touch behavior*
* **circularNavigation**: {true | false}  ___ *True enables the circular (loop) navigation*
* **itemTemplate**: {function}  ___ *Function that receives an item and returns the HTML to be used when rendering that item*


* **pageSize**: {1..n}  ___ *Number of items per page*
* **pagingIndicators**: {true | false}  ___ *True to display the page indicators. False to hide them*


* **animationType**: {'slide' | 'fade' | 'none'}  ___ *Transition effect to be used when navigating pages*
* **animationSpeed**: {1..n}  ___ *Duration of the transition animations (in milliseconds)*
* **afterAnimationCallback**: {function}  ___ *Callback to be executed after animations*


* **loadingType**: {'lazy' | 'eager'}  ___ *Sets the items loading strategy. "Lazy" will delay the item's image loading until that item is displayed*
* **afterLoadedCallback**: {function}  ___ *Callback to be executed after images loaded*

* **responsive**: {true | false | rangesObject} __ *Enables/disables responsive behaviour in all cases (when booleans) or it does dynamically for different resolutions. See below in this guide for more details.*


		rangesObject : { "*..320" : true,
				 		 "321..768" : false,
						 "769..*" : true
				        }


 this stands for: 
 - max-width 320px: carousel responsive enabled.
 - min-width 321px and max-width 768px: carousel responsive disabled.
 - min-width 769px: carousel responsive enabled.




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
