var Class = require('class'),
SpinJs = require('spin.js'),
$ = require('jquery');


module.exports = Class.extend({

    init: function (options) {

       var defaults = {
            lines: 11, // The number of lines to draw
            length: 3, // The length of each line
            width: 5, // The line thickness
            radius: 8, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#000', // #rgb or #rrggbb
            speed: 2, // Rounds per second
            trail: 30, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: true, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 99, // The z-index
            top: '0', // Top position relative to parent
            left: '0' // Left position relative to parent
        };

        this.options = $.extend({}, defaults, options);
        this.loadingElements = [];
        this.$spinners = [];
    },

    showSpinner: function ($loadingElement) {
        var $spinner = $('<div></div>'), $spinnerChild, rules, height, width;
        this.loadingElements.push($loadingElement[0]);

        //create new spinner
        $spinner.addClass("spinnerElement");
        new SpinJs(this.options).spin($spinner[0]);
        this.$spinners.push($spinner);

        //take loading element shape
        rules = window.getComputedStyle($loadingElement[0]);
        $.each(['position', 'margin', 'padding'], function(i, el) {
            $spinner.css(el,rules[el]);
        });

        $loadingElement.parent().append($spinner[0]);

        //Transform spinner fixed container size to a relative one.
        height = 0; width = 0;
        if ($loadingElement[0].clientHeight > 0 && $spinner.parent().height() > 0) {
            height = $loadingElement[0].clientHeight * 100 / $spinner.parent().height();
        }
        if (height === 0 || height > 100) {
            height = 100;
        }

        if ($loadingElement[0].clientWidth > 0 && $spinner.parent().width() > 0) {
            width = $loadingElement[0].clientWidth * 100 / $spinner.parent().width();
        }
        if (width === 0 || width > 100) {
            width = 100;
        }

        $spinner.css('height', height + "%");
        $spinner.css('width', width + "%");

        $spinnerChild = $spinner.find('.spinner');
        $spinnerChild.css('height', '100%');
        $spinnerChild.css('width', '100%');

        var self = this, $el;
        $.each($spinnerChild.children(), function(i,el){
            $el = $(el);
            $el.height('100%');
            $el.width('100%');

            //measure in pixels to translate in case default size looks ridiculous for the actual viewport size.
            var size = 11;
            height = self.options.length;
            width = self.options.width;

            if ((0.01 * width) * $el.width() > size ) {
                width = size / 1.2 * 100 / $el.width();
                height = 2.3 * 100 / $el.height();
            }

            $($el.children()[0]).css('width', width + '%');
            $($el.children()[0]).css('height', height + '%');
        });

        $spinnerChild.css('top', '50%');
        $spinnerChild.css('left', '50%');

        $loadingElement.hide();
    },

    hideSpinner: function ($loadingElement) {
        var $spinner = this.$spinners[this.loadingElements.indexOf($loadingElement[0])];
        $spinner.remove();
        $loadingElement.show();
    }
});
