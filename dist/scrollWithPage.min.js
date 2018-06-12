var scrollElement = function(scrollingElement, containerElement, offsetElement){
    
     //Scrolling Element
    this.scrollingElement = scrollingElement;

    //Scrolling element initial position data
    this.origOffset = scrollingElement.parent().offset().top; //original position of links based on parents
    this.currentPos = scrollingElement.position().top; //current relative position of links.
    this.height = scrollingElement.outerHeight(true); //height of element w/ margin
    this.width = scrollingElement.parent().width(); //width - based off parent element (since el will be fixed)
    this.top = scrollingElement.offset().top; //current offset relative to document
    this.bottom = Math.ceil(scrollingElement.offset().top + scrollingElement.outerHeight(true));

    //container element
    this.container = {
        element: containerElement,
        height: containerElement.outerHeight(), //height of the content-wrap element,
        bottom: containerElement.outerHeight() + containerElement.offset().top //bottom of the content-wrap element
    };

    //if offset element
    this.offsetEl = {
        element: offsetElement ? offsetElement : null,
        height: offsetElement ? offsetElement.outerHeight() : 0
    }; 

    //Initial viewport info 
    this.viewport = {
        height: window.innerHeight,
        bottom: window.innerHeight
    };   
}

//Initialize
scrollElement.prototype.init = function(){
    this.distanceScrolled = $(window).scrollTop();
    this.scrollDir = false;
    this.isTallerThanViewport = this.height > this.viewport.height;
    this.distanceScrolled = $(window).scrollTop();

    var obj = this;
    //bind event handlers
    $(document).ready(function() {
        obj.update(); //update once as soon as the dom is loaded
    });

    $(window).scroll(function() {
        obj.update(); //bind the nav to update on scroll
    });

    $(window).resize(function() {
        obj.handleResize(); //update on resize
    });

    $("a").click(function() {
        setTimeout(function() {
            obj.update();
        }, 100); //set the nav to update 100ms after clicking any anchor tag in the content.  This helps with relative links
    });
}

//Handle Resize
scrollElement.prototype.handleResize = function(){
    this.viewport.height = window.innerHeight;
    this.isTallerThanViewport = this.height > this.viewport.height;
}

//Change Position method
scrollElement.prototype.changePosition = function(position, top, bottom, width) {
    this.scrollingElement.css({
        position: position,
        top: top,
        bottom: bottom
    });

    if (width) {
        this.scrollingElement.css({ width: width + "px" });
    } else {
        this.scrollingElement.css({ width: "auto" });
    }
}

scrollElement.prototype.update = function(){
    var scrollingElement = this.scrollingElement;
    var containerElement = this.container.element;

    this.currentPos = scrollingElement.position().top; //current relative position of links.
    this.height = scrollingElement.outerHeight(true); //height of element
    
    this.width = scrollingElement.parent().width(); //width - based off parent element (since el will be fixed)
    this.top = scrollingElement.offset().top - parseInt(scrollingElement.css("marginTop")); //current offset relative to document
    this.bottom = Math.ceil( this.top + this.height );

    //container vars
    //var containerTop = container.offset().top;
    this.container.height = containerElement.outerHeight();; //height of the container element
    this.container.heightWithMargin = containerElement.outerHeight(true);
    this.container.bottom = this.container.height + containerElement.offset().top; //bottom of the content-wrap element

    //offset Elements height
    this.offsetEl.height = this.offsetEl.element ? this.offsetEl.element.outerHeight() : 0;

    //scroll vars
    this.lastDistanceScrolled = this.distanceScrolled; //save lastDistance scrolled to compare
    this.distanceScrolled = $(window).scrollTop();
    this.scrollDir = this.distanceScrolled - this.lastDistanceScrolled > 0 ? "down" : "up";

    //bottom of the viewport's relative pixel location
    this.viewport.bottom = window.innerHeight + this.distanceScrolled;
    console.log(this);

    //event comparisons
    var heightDifference = this.distanceScrolled > this.top - this.offsetEl.height ? Math.floor(this.distanceScrolled - this.top) : 0;
    var hasReachedBottom = this.distanceScrolled + this.height - heightDifference + this.offsetEl.height >= this.container.bottom;
    var hasScrolledPastLinks = this.distanceScrolled > this.origOffset - this.offsetEl.height;
    var isTallerThanContainer = this.height >= this.container.height;
    var isTallerThanViewport = this.isTallerThanViewport;

    //set a minheight on container in case it's smaller.
    //This keeps content from resizing when the links list gets fixed/absolutely positioned.
    if (this.container.heightWithMargin < this.height) {
        this.container.element.css("minHeight", this.height + "px");
    }

    //Start checking
    if (!hasScrolledPastLinks) {
        //Hasn't scrolled past the links, do nothing
        this.changePosition("relative", "auto", "auto");

    } else if (hasReachedBottom) {
        //Has reached the bottom of its container.  Position it at the bottom
        this.changePosition("absolute", this.container.height - this.height, "auto", this.width);
    } else if (hasScrolledPastLinks && !hasReachedBottom) {
        if (isTallerThanContainer) {
            //Normal position
            this.changePosition("relative", "auto", "auto");
        } else if (isTallerThanViewport) {
            console.log(this.top, this.origOffset, parseInt(scrollingElement.css("marginTop")));
            if (this.distanceScrolled <= this.top && this.scrollDir === "up") {
                console.log("up");
                this.changePosition("fixed", 0, "auto", this.width);
            } else if ( this.viewport.bottom >= this.bottom && this.scrollDir === "down") {
                console.log("down");
                this.changePosition("fixed", "auto", 0, this.width);
            } else if ( this.scrollingElement.css('position') === "fixed" ) {
                this.changePosition("absolute", (this.top - this.origOffset), "auto", this.width);
            } else {
                console.log("Did nothing");
            }
        } else {
            this.changePosition("fixed", this.offsetEl.height, "auto", this.width); 
        }

        console.log("--------");
    }
}

$.fn.scrollWithPage = function(scrollContainer, offsetEl) {
    var $scrollingElement = $(this); //the element that will be scrolling with the page
    var $containerElement = $(this).closest(scrollContainer); //the parent container element that should be used to determine the outer bounds
    var $offsetElement = offsetEl ? $(offsetEl) : null; //The offset element is used to keep the nav lower than another fixed element (for instance, the header);

    if (!$containerElement){
        throw "Container doesn't exist";
    } else if (!$scrollingElement) {
        throw "Element doesn't exist";
    } 

    //Initialize the scrolling object
    var scrollObj = new scrollElement($scrollingElement, $containerElement, $offsetElement);
    scrollObj.init();

    console.log(scrollObj);
}

