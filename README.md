
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

The component only requires [jQuery][1] 1.9


## Usage


### Download

 - If you are building the component. Read the [Development][2] section at the end of the document.
 - or Add this component as a bower dependency, poiting to this repo. Read the [Bower][3] section.
 - or Download the files in the dist directory in this repo.

<a name="bower"></a>
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

1. Include the [minified js library][4] in the html page as follows:
```html
<script src="<carousel dir>/jquery.xnCarousel.min.js"></script>
```

2. Include the stylesheet [css][5] or [less][6] (read the [Styling][7] section)

3. Include the html dom element to hold the component

```html
<div class="carousel-container"></div>
``` 

4. Initialize it from your javascript code 

```javascript

$(function () {
	$(".carousel-container").xnCarousel({
		...options (see below)...
	});
```

### Item Definition

There are 2 ways to define the items, via DOM elements or using a template and JSON. 

#### 
#### 1. DOM Definition

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

#### 2. JSON items (with a template)

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

Name | Type | Default | Description
----|------|----|----
**touchEnabled** | ```boolean``` | ```false``` | Enables or disables the touch feature
**circularNavigation** | ```boolean``` | ```false``` | ```true``` enables the circular (loop) navigation
**itemTemplate** | ```function``` | empty template | Function that receives an item and returns the HTML to be used when rendering that item. Used as a template when loading items via JSON
**pageSize** | ```number``` | 1 | Number of items per page. Items width will adjust to always fit this amount of items on a single page. Ignored when ```itemWidth``` is defined
**itemWidth** | ```number``` | ```null``` | tem width in pixels. When defined, ```pageSize``` is ignored, as items will always have this width, so if the carousel container size change, the amount of items on a single page will also change accordingly
**pagingIndicators** | ```boolean``` | ```false``` | ```true``` to display the page indicators (bullets). ```false``` to hide them. See the [pagination][8] section for more details.
**pageInterval** | ```number``` | 0 | If > 0, carousel will automatically move to the next page using the value as interval in milliseconds, ie 1000 means the carousel will change the page once a second. If set to 0, automatic navigation is disabled
**showNavigationArrows** | ```true``` or ```false``` or ```'auto'``` | ```'auto'``` | Shows page navigation arrows (prev/next). To understand the possible values, see the [pagination][9] section.
**animationType** | ```'slide'``` or ```'fade'``` or ```'none'``` | ```'none'``` | Transition effect to be used when navigating pages
**moveSpeed** | ```number``` | 1000 | Duration of the transition animations (in milliseconds)
**loadingType** | ```'lazy'``` or ```'eager'``` | ```lazy``` | Sets the items loading strategy. ```lazy``` will delay the item's image loading until that item is displayed (showing an animation while loading). ```eager``` will load all images as soon as possible
**responsive** | ```true``` or ```false``` or ```rangesObject``` | ```true``` | Enables/disables responsive behaviour in all cases (when booleans) or it does dynamically for different resolutions. See [below][10]* in this guide for more details


<a name="responsive_details"></a>
#### * Responsive parameter details
```javascript
rangesObject : 
    { 
        "*..320" : true,
    	"321..768" : false,
    	"769..*" : true
    }
```

 this stands for: 

 - **max-width 320px**: carousel responsive enabled.
 - **min-width 321px** and max-width 768px: carousel responsive disabled.
 - **min-width 769px**: carousel responsive enabled.

 
 
### Pagination

The carousel includes a pagination module that enables this feature.

<a name="pagination_indicators"></a>
#### Indicators

If ```pagingIndicators``` is set to ```true```, pagination bullets will be displayed on the bottom, containing one bullet per page.

The indicators will be added and removed dynamically when the number of pages change.

The indicators are clickable (allowing to jump to a certain page) and fully responsive, as the will grow or shink when the viewport size changes.

<a name="pagination_arrows"></a>
#### Navigation Arrows

Navigation arrows allow the user to go to the previous or next page.

The *next* arrow will only be shown if there is a next page. So, when the user reaches the last page, it will disappear, unless the carousel is on loop navigation mode. In that case, the arrow will always be available, because when he clicks next on the last page, the first one will be displayed. The same logic applies to the *prev* arrow when on the first page.

The ```showNavigationArrows``` parameter has 3 possible values.

 - ```true```: The arrows will be *always* visible (unless there's no next or prev page as stated above.
 - ```false```: The arrows will *never* be shown. Useful when using a touch-enabled device and you don't want the arrows
 - ```'auto'```: The arrows will appear when the mouse is over the carousel and disappear when the mouse goes out. A nice fade transition is used to provide a smooth effect.


**Customizing the look of the arrows**

The carousel provides default arrows style. It can be customized by modifying the classes ```xn-left-indicator``` and ```xn-triangle-left``` for the *prev* arrow and ```xn-right-indicator``` and ```xn-triangle-right``` for the *next* arrow.

If you want to customize the arrows in a way that changing the styles is not enough (eg. adding new DOM elements), you can add your own HTML code. You need to define 2 DOM elements as children of the main carousel container. One element must have the css class ```xn-left-indicator``` and the other one the class ```xn-right-indicator```. Any other DOM element can be added inside. The carousel will look for those classes and use them if they are found (it will add a ```click``` listener and control their opacity). Only if this elements are not found the carousel uses the default ones.
 
<a name="styling"></a>
## Styling

The carousel includes a base stylesheet that must be included/imported in your code and extended for your custom look.
The stylesheet is located in the _"dist"_ directory (and included in the bower component) and is provided as:
 - a minified css ([jquery.xnCarousel.min.css][11]) which can be included using the _link_ tag.
 - a LESS file ([jquery.xnCarousel.less][12]) which you can import if you are using LESS
 - a SASS file ([jquery.xnCarousel.scss][13]) which you can import if you are using SASS
 

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

Name | Returns | Description
----|------|----
**goToPage(pageNumber)** | -  | Navigates to the provided page
**goNext()** | -  | Navigates to the next page if available (might be the first when loop navigation is enabled)
**goBack()** | -  | Navigates to the prev page if available (might be the last when loop navigation is enabled)
**goToLastPage()** | -  | Navigates to the last page
**goToFirstPage()** | -  | Navigates to the first page
**getCurrentPage()** | ```number```  | Returns the current page index
**getItemCount()** | ```number```  | Returns the number of items
**getPageCount()** | ```number```  | Returns the number of pages
**getPageIndex(itemIndex)** | ```number```  | Returns the page index for the provided item
**getItems()** | ```$items```  | Returns the jQuery DOM elements for the items
**getLastItemIndex()** | ```number```  | Returns the index of the last item
**getItemIndicesForPage(pageIndex)** | ```[number]``` | Returns an array with the item indices that belong to the provided page
**getItemIndicesForCurrentPage()** | ```[number]``` | Returns an array with the item indices that belong to the current page
**clear(options)** | - | Removes all the items. The event is not fired if ```options.silent = true```
**isValidItemIndex(index)** | Boolean | Returns ```true``` if the provided index is valid (within range). ```false``` otherwise
**removeItem(index)** | - | Removes an item by index
**selectItem(index, options)** | - | Changes the current selection to an item by index. The event is not fired if ```options.silent = true```
**clearSelection(options)** | - | Clears the selected item. The event is not fired if ```options.silent = true```
**getSelectedIndex()** | ```number``` | Returns the index of the selected item
**addItem(item)** | - | Adds an item to the carousel. The item parameter might be a JS object (the template function is used) or an html code as a string
**render(items)** | - | Renders the items passed as parameters or the ones under the DOM elements with class "xn-items". Must be called once on initialization




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

Name | Parameters | Trigger
----|------|----
**initialized** | -  | After the carousel is initialized, but before items are rendered
**rendered** | - | After the carousel items and pagination components have been rendered 
 |  | 
**pageSelected** | index | A page is selected
**itemSelected** | index | An item is selected
**selectionClear** | - | The selection has been removed 
 |  | 
**itemRemoved** | - | An item has been removed 
**itemAdded** | itemJSON, $item | An item has been added
**itemsCleared** | - | All the carousel items have been removed
**pageChangeStart** | currentPageIndex, newPageIndex | A page changed was requested (by code or UI), before actually changing the page
**pageChanged** | pageIndex | The state of the carousel has changed (to the new current page) and the animation has started but before the animation ends
**pageChangeEnded** | oldPageIndex, currentPageIndex | The page change has finished (incl. animations)
**pageRemoved** | - | A carousel page has been removed, because an item has been removed 
**pageAdded** | pageIndex |  A carousel page has been added, because an item has been added



## Responsive behaviour

Let's put an example to get this better. Suppose that the carousel viewport has a media query like this setted:


    @media (max-width: 900px) {
       width: 80%;
       height: 296px;
    }


If carousel responsive option is set to false, the media query works as defaults, otherwise it updates the height to keep the aspect. So for this case the height (296px) applies to the upper limit (900px) and then it keeps the same proportions at different resolutions. Also remember that the carousel responsive option accepts an object with different ranges (like CSS3 media queries do) where this behaviour is enabled/disabled.


<a name="development"></a>
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


  [1]: http://www.jquery.com
  [2]: #development
  [3]: #bower
  [4]: https://raw.github.com/nanlabs/xncarousel/master/dist/jquery.xnCarousel.min.js
  [5]: https://raw.github.com/nanlabs/xncarousel/master/dist/jquery.xnCarousel.min.css
  [6]: https://raw.github.com/nanlabs/xncarousel/master/dist/jquery.xnCarousel.less
  [7]: #styling
  [8]: #pagination_indicators
  [9]: #pagination_arrows
  [10]: #responsive_details
  [11]: https://raw.github.com/nanlabs/xncarousel/master/dist/jquery.xnCarousel.min.css
  [12]: https://raw.github.com/nanlabs/xncarousel/master/dist/jquery.xnCarousel.less
  [13]: https://raw.github.com/nanlabs/xncarousel/master/dist/jquery.xnCarousel.scss
