$.fn.scrollWithPage = function(scrollContainer, offsetEl) {
    var $this = $(this); //the element that will be scrolling with the page
    var $container = $(this).closest(scrollContainer); //the parent container element that should be used to determine the outer bounds
    var $offsetEl = offsetEl ? $(offsetEl) : null; //The offset element is used to keep the nav lower than another fixed element (for instance, the header);

    console.log($container);
    console.log($this);
    console.log($offsetEl);

    if (!$container){
        throw "Container element wasn't found";
    }

    //initialize scrolledContent object
    if ($this.length > 0) {
        var scrolledContent = {
            //scrolled element
            element: $this,

            //container element
            container: {
                element: $container,
                height: $container.outerHeight(), //height of the content-wrap element,
                bottom: $container.outerHeight() + $container.offset().top //bottom of the content-wrap element
            },

            offsetEl: {
                element: $offsetEl ? $offsetEl : null,
                height: $offsetEl ? $offsetEl.outerHeight() : 0
            },

            //basic positioning data
            origOffset: $this.parent().offset().top, //original position of links by looking at the parent.
            currentPos: $this.position().top, //current relative position of links.
            height: $this.outerHeight(true), //height of element w/ margin
            width: $this.parent().width(), //width - based off parent element (since el will be fixed)
            top: $this.offset().top, //current offset relative to document
            bottom: Math.ceil($this.offset().top + $this.outerHeight(true)),

            //scroll data
            distanceScrolled: $(window).scrollTop(),
            scrollDir: false,

            //viewport data
            viewport: {
                height: window.innerHeight,
                bottom: window.innerHeight
            },

            changePos: function(position, top, bottom, width) {
                //method to change the css of the element
                this.element.css({
                    position: position,
                    top: top,
                    bottom: bottom
                });

                if (width) {
                    this.element.css({ width: width + "px" });
                } else {
                    this.element.css({ width: "auto" });
                }
            },

            //update method, called on scroll
            update: function() {
                var obj = this;
                var element = obj.element;
                var container = obj.container.element;

                this.origOffset = element.parent().offset().top; //original position of links by looking at the parent.
                this.currentPos = element.position().top; //current relative position of links.
                this.height = element.outerHeight(true); //height of element
                this.width = element.parent().width(); //width - based off parent element (since el will be fixed)
                this.top = element.offset().top; //current offset relative to document
                this.bottom = Math.ceil(
                    element.offset().top + element.outerHeight(true)
                );

                //container vars
                //var containerTop = container.offset().top;
                var containerHeight = $(this.container.element).outerHeight();

                this.container.heightWithMargin = $(this.container.element).outerHeight(true);
                this.container.height = containerHeight; //height of the content-wrap element
                this.container.bottom = containerHeight + container.offset().top; //bottom of the content-wrap element

                //offsetElements height
                this.offsetEl.height = this.offsetEl.element ? this.offsetEl.element.outerHeight() : 0;

                //scroll vars
                this.lastDistanceScrolled = this.distanceScrolled; //save lastDistance scrolled to compare
                this.distanceScrolled = $(window).scrollTop();
                this.scrollDir = this.distanceScrolled - this.lastDistanceScrolled > 0 ? "down" : "up";

                //window vars
                var windowHeight = window.innerHeight;
                this.viewport.height = windowHeight;
                this.viewport.bottom = windowHeight + this.distanceScrolled;

                //event comparisons
                
                var heightDifference = this.distanceScrolled > this.top - this.offsetEl.height ? Math.floor(this.distanceScrolled - this.top) : 0;
                var hasReachedBottom = this.distanceScrolled + this.height - heightDifference + this.offsetEl.height >= this.container.bottom;
                var hasScrolledPastLinks = this.distanceScrolled > this.origOffset - this.offsetEl.height;
                var isTallerThanViewport = this.height > this.viewport.height - this.offsetEl.height;
                var isTallerThanContainer = this.height >= this.container.height;

                //set a minheight on container in case it's smaller.
                //This keeps content from resizing when the links list gets fixed/absolutely positioned.
                if (this.container.heightWithMargin < this.height) {
                    this.container.element.css("minHeight", this.height + "px");
                }

                //Start checking
                if (!hasScrolledPastLinks) {
                    console.log("Hasnt scrolled past links");
                    //Hasn't scrolled past the links, do nothing
                    this.changePos("relative", "auto", "auto");

                } else if (hasReachedBottom) {
                    console.log("Reached the bottom");
                    //Has reached the bottom of its container.  Position it at the bottom
                    this.changePos("absolute", this.container.height - this.height, "auto", this.width);
                } else if (hasScrolledPastLinks && !hasReachedBottom) {
                    console.log("Purgatory");
                    if (isTallerThanContainer) {
                        //Normal position
                        this.changePos("relative", "auto", "auto");
                    } else if (!isTallerThanViewport) {
                        //links arent taller than container, or viewport.  Fix them to the top.
                        this.changePos("fixed", this.offsetEl.height, "auto",obj.width);
                    } else if (isTallerThanViewport) {
                        if (
                            this.distanceScrolled <= this.top &&
                            this.scrollDir === "up"
                        ) {
                            this.changePos("fixed", 0, "auto", this.width);
                        } else if (
                            this.viewport.bottom >= this.bottom &&
                            this.scrollDir === "down"
                        ) {
                            this.changePos("fixed", "auto", 0, this.width);
                        } else {
                            this.changePos("absolute", this.top - this.origOffset, "auto", this.width);
                        }
                    }
                }
            }
        };

        //if object exists, set event handlers
        if (scrolledContent) {
            $(window).scroll(function() {
                console.log("Scrolled");
                scrolledContent.update(); //bind the nav to update on scroll
            });

            $(document).ready(function() {
                console.log("Loaded");
                scrolledContent.update(); //update once as soon as the dom is loaded
            });

            $(window).resize(function() {
                console.log("Resized");
                scrolledContent.update(); //update on resize
            });

            $("a[href^='#']").click(function() {
                setTimeout(function() {
                    scrolledContent.update();
                }, 100); //set the nav to update 100ms after clicking any anchor tag in the content.  This helps with relative links
            });
        }
    }
};
