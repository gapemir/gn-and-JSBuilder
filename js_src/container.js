namespace gn.ui.container {
    class Row extends gn.ui.basic.Widget {
        constructor(classList) {
            super(new gn.ui.layout.Row(), "div", classList);
        }
    }
    class Column extends gn.ui.basic.Widget {
        constructor(classList) {
            super(new gn.ui.layout.Column(), "div", classList);
        }
    }
    class Grid extends gn.ui.basic.Widget {
        constructor(classList) {
            super(new gn.ui.layout.Grid(), "div", classList);
        }
    }
    class Stack extends gn.ui.basic.Widget {
        constructor(classList) {
            super( null, "div", classList );
            this._order = []
            this._currentWidget;
            this._prevWidget;
            // this._animations = {};
            this._animDir = null;
            this._animLoop = false;
            this._animBounceDir = true; // it means it will go forward to animDir
            this._animnOnEdge = true; // means anim is on edge
            this.addClass( "gn-stack" );
            /*
            round up|down|left|right
            bounce up|down|left|right
            */
        }
        get currentWidget() {
            return this._currentWidget;
        }
        /**
         * 
         * @param {gn.ui.basic.Widget} child 
         * @param {{dir: string, reverse: boolean}} animation // TODO true default, from right to left
         * dir = left|right|up|down
         * reverse -on way out
         */
        add( child, animation ) {
            child.addClass( "gn-stack-child" );
            super.add( child );
            this._order.push( child );
            if( !this._currentWidget ) {
                this._currentWidget = child;
            }
            else {
                child.exclude();
            }
        }
        remove( child ) {
            child.removeClass( "gn-stack-child" );
            super.remove( child);
            if( child == this._currentWidget ) {
                this.next();
            }
            this._order.splice( this._order.indexOf( child ), 1 )
        }
        /**
         * 
         * @param {string} dir left|right|up|down
         * @param {boolean} loop if it loops or bounces, default = true
         */
        setAnimationMode( dir, loop = true ) {
            if( ![ "left", "right", "up", "down" ].includes( dir ) ) {
                this._animDir = null;
                return;
            }
            this._animDir = dir;
            this._animLoop = loop;
        }
        activate( widget, forward = true ) {
            this._prevWidget = this._currentWidget;
            this._currentWidget = widget;

            let x = this._processAnimation( this._prevWidget, true, forward );
            x ? this._prevWidget.setStyle( "transform", x ) : null;

            
            let y = this._processAnimation( this._currentWidget, false, forward );
            y ? this._currentWidget.setStyle( "transform", y ) : null;
            this._currentWidget.show();

            if( x ) {
                gn.event.Timer.singleShot( this, () => {
                    this._currentWidget.setStyle( "transform", "translate( 0 )" ); 
                }, 1 );
                gn.event.Timer.singleShot( this, () => { 
                    this._prevWidget.exclude(); 
                }, 500 );
            } else {
                this._prevWidget.exclude(); 
            }
        }
        _processAnimation( widget, out, forward ) {
            if( !this._animDir ) {
                return null;
            }
            if( this._animLoop ) {
                return this._animHelper( this._animDir, forward == out );
            }
            else {
                let ret = this._animHelper( this._animDir, (forward == out) );
                if( !out ) {
                    let i = this._order.indexOf( widget )
                    if( ( this._animDir == "right" || this._animDir == "down" ) ) {
                        this._animBounceDir ? i++ : i--;
                    } else{
                        this._animBounceDir ? i-- : i++;
                    }
                    this._animnOnEdge = false;
                    if( i < 0 ) {
                        this._animBounceDir = true;
                        this._animnOnEdge = true;
                    }
                    else if( i >= this._order.length ) {
                        this._animBounceDir = false;
                        this._animnOnEdge = true;
                    }
                }
                return ret;
            }
            return 
            
        }
        _animHelper( dir, forward ) {
            let ret = 100;
            if( dir == "left" || dir == "up" ) {
                ret = -100;
            }
            if( !forward ) {
                ret *= -1;
            }
            if( dir == "up" || dir == "down" ){
                return "translate( 0," + ret + "%)";
            }
            return "translate(" + ret + "%)";
        }
        next( skip = false ) {
            if( !this._animLoop && !this._animBounceDir/*  && this._animnOnEdge */ && !skip ) {
                this.previous( true );
                return;
            }
            let i = this._order.indexOf( this._currentWidget ) + 1;
            this.activate( this._order[ ( i >= this._order.length ? 0 : i ) ], true );
        }
        previous( skip = false ) {
            if( !this._animLoop && this._animBounceDir /* && this._animnOnEdge */ && !skip ) {
                this.next( true );
                return;
            }
            let i = this._order.indexOf( this._currentWidget ) - 1;
            this.activate( this._order[ ( i < 0 ? this._order.length-1 : i ) ], false );
        }
    }
    class Split extends gn.ui.basic.Widget { // class for two containers and handle in the middle whitch is used to resize containers
        constructor( layout ) {
            super( layout || new gn.ui.layout.Row, "div", "gn-split" );
        }
        _addInternal( child, where, refChild ) {
            if( !this._children.length ){
                super._addInternal( child, where, refChild );
                return;
            }
            if( gn.lang.Var.isNull( child ) || gn.lang.Var.isNull( child.element ) ) {
                throw new Error('Element cannot be null');
            }
            super._addInternal( new gn.ui.container.SplitHandle( this.layoutManager.direction, 3 ), where, refChild );
            super._addInternal( child, where, refChild );
            for( let i = 1; i < this._children.length - 1; i+=2 ) {
                this._children[ i ].before = this._children[ i-1 ];
                this._children[ i ].after = this._children[ i+1 ];
            }
            this._devideSize();
        }
        _devideSize() {
            let num = Math.ceil( this._children.length / 2 );
            let a = 100 / num + "%";
            for( let child of this._children ){
                if( !( child instanceof gn.ui.container.SplitHandle ) ) {
                    if( this.layoutManager.direction == gn.ui.layout.direction.Row ) {
                        child.width = a;
                        child.height = "100%";
                    }
                    else {
                        child.height = a;
                        child.width = "100%";
                    }
                }
            }
        }
    }
    class SplitHandle extends gn.ui.basic.Widget {
        constructor( direction, size ) { // gn.ui.layout.direction
            super( null, "div", "gn-split-handle" );
            this._direction = direction;
            this._before = null;
            this._after = null;
            this._splitSize = null;
            this._originalPosition = null;
            if( direction == gn.ui.layout.direction.Row ) {
                this.height = "100%";
                this.width = size;
            }
            else {
                this.width = "100%";
                this.height = size;
            }
            this.addEventListener( "dragstart", this._onDragStart, this );
            this.addEventListener( "drag", this._onDrag, this );
            this.addEventListener( "dragend", this._onDragStop, this );
        }
        set before( value ) {
            this._before = value;
        }
        get before() {
            return this._before;
        }
        set after( value ) {
            this._after = value;
        }
        get after() {
            return this._after;
        }
        _onDrag( e ){
            console.log( e.clientX, e.clientY )
            if( e.clientX == 0 && e.clientY == 0 ) {
                return;
            }
            if ( this._moving ) {
                if ( this._direction == gn.ui.layout.direction.Column ) {
                    var delta = e.clientY - this._originalPosition.y;
                    var b = ( this._beforeSize.height + delta ) * 100 / this._splitSize.height;
                    var a = ( this._afterSize.height - delta ) * 100 / this._splitSize.height;
                    this._before.height = b + "%";
                    this._after.height = a + "%";
                }
                else {
                    var delta = e.clientX - this._originalPosition.x;
                    var b = ( this._beforeSize.width + delta ) * 100 / this._splitSize.width;
                    var a = ( this._afterSize.width - delta ) * 100 / this._splitSize.width;
                    this._before.width = b + "%";
                    this._after.width = a + "%";
                }
                return false;
            }
        }
        _onDragStart( e ){
            this._moving = true;
            this._splitSize = this.layoutParent.size;
            this._originalPosition = { x : e.clientX, y : e.clientY };
            this._beforeSize = this._before.size;
            this._afterSize = this._after.size;
        }
        _onDragStop( e ) {
            this._moving = false;
            this._splitSize = null;
            this._originalPosition = null;
            this._beforeSize = null;
            this._afterSize = null;
        }
    }
    // this will be redone some day so we will have custom all, rn we still rely on browser overflow : auto whitch is ugly and cant be removed on focus out ....
    class Scroll extends gn.ui.basic.Widget { 
        constructor( content, classList ) {
            super( null, null, classList );
            this.addClass( "gn-scroll" )

            this._body = content || new gn.ui.basic.Widget();
            this._body.addClass( "body" );
            super._addInternal( this._body );

            this._body.addEventListener( "scroll", this._onScroll, this );

            this._speed = 0.1;

            super._addInternal(new gn.ui.container.ScrollBar( this, gn.ui.layout.direction.Row ));
            super._addInternal(new gn.ui.container.ScrollBar( this, gn.ui.layout.direction.Column ));
        }

        get body() {
            return this._body;
        }

        _addInternal( child, where, refChild ) {
            this._body._addInternal( child, where, refChild );
        }

        remove( child ) {
            this._body.remove( child );
        }

        _getClampedOffsets(y, x) {
            const maxScrollTop = Math.max(0, this._body.element.scrollHeight - this.element.clientHeight);
            const maxScrollLeft = Math.max(0, this._body.element.scrollWidth - this.element.clientWidth);

            return {
                y: Math.max(0, Math.min(maxScrollTop, y)),
                x: Math.max(0, Math.min(maxScrollLeft, x))
            };
        }

        scrollTo(y, x) {
            const currentY = -parseFloat(this._body.element.style.top || 0);
            const currentX = -parseFloat(this._body.element.style.left || 0);
            
            y = (y === null || typeof y === 'undefined') ? currentY : y;
            x = (x === null || typeof x === 'undefined') ? currentX : x;

            const clamped = this._getClampedOffsets(y, x);

            this._body.element.style.top = (-clamped.y) + "px";
            this._body.element.style.left = (-clamped.x) + "px";

            this.sendEvent("scrolled");
        }

        scrollBy(y, x) {
            const currentY = -parseFloat(this._body.element.style.top || 0);
            const currentX = -parseFloat(this._body.element.style.left || 0);

            const targetY = currentY + (y || 0);
            const targetX = currentX + (x || 0);

            this.scrollTo(targetY, targetX);
        }

        _onScroll(e) {  
            this.scrollBy(this._speed * e.deltaY, this._speed * e.deltaX);
        }
    }
    class ScrollBar extends gn.ui.basic.Widget {
        constructor( scroll, orientation, classList ) {
            super( null, "div", classList );
            this.addClass( "gn-scrollbar" );
            this._orientation = orientation;
            this._scroll = scroll;
            this._wheelScrollSpeed = 0.1;

            this._thumb = new gn.ui.basic.Widget( null, "div", "thumb" );

            if( gn.ui.layout.direction.Row == orientation ) {
                this.addClass( "horizontal" );
                this._thumb.setStyle("width", "100px");
                this._thumb.setStyle("height", "100%");
            }
            else {
                this.addClass( "vertical" );
                this._thumb.setStyle("height", "100px");
                this._thumb.setStyle("width", "100%");
            }

            this.addEventListener( "scroll", this._onTumbScrolled, this );
            this._thumb.addEventListener( "dragstart", this._onDragStart, this );
            this._thumb.addEventListener( "drag", this._onDrag, this );
            this._thumb.addEventListener( "dragend", this._onDragStop, this );
            this.add(this._thumb);

            this._scroll.addEventListener( "scrolled", this._updatePositionOfThumb, this );

            gn.event.Timer.singleShot( this, () => {
                this._updateLengthOfThumb();
            });
        }

        _updateLengthOfThumb() {
            if( gn.ui.layout.direction.Row == this._orientation ) {
                let width = this.width;
                let contentWidth = this._scroll.body.width;
                let thumbWidth = Math.max( 20, width * width / contentWidth );
                this._thumb.setStyle("width", thumbWidth + "px");
                if(thumbWidth >= width) {
                    this.exclude();
                }
                else {
                    this.show();
                }
            }
            else {
                let height = this.height;
                let contentHeight = this._scroll.body.height;
                let thumbHeight = Math.max( 20, height * height / contentHeight );
                this._thumb.setStyle("height", thumbHeight + "px");
                if(thumbHeight >= height) {
                    this.exclude();
                }
                else {
                    this.show();
                }
            }
        }

        _updatePositionOfThumb() {
            if( gn.ui.layout.direction.Row == this._orientation ) {
                let scrollLeft = -parseFloat(this._scroll.body.element.style.left || 0);
                let contentWidth = this._scroll.body.width;
                let thumbLeft = scrollLeft * this.width / contentWidth;
                this._thumb.setStyle("left", thumbLeft + "px");
            }
            else {
                let scrollTop = -parseFloat(this._scroll.body.element.style.top || 0);
                let contentHeight = this._scroll.body.height;
                let thumbTop = scrollTop * this.height / contentHeight;
                this._thumb.setStyle("top", thumbTop + "px");
            }
        }

        _onDrag( e ) {
            console.log( e.clientX, e.clientY )
            if( e.clientX == 0 && e.clientY == 0 ) {
                return;
            }
            if ( this._moving ) {
                if ( this._orientation == gn.ui.layout.direction.Column ) {
                    var delta = e.clientY - this._originalPosition.y;
                    console.log( "delta", delta );
                    // this._thumb.setStyle( "top", ( parseFloat( this._thumb.element.style.top || 0 ) + delta ) + "px" );
                    this._scroll.scrollBy( delta * this._scroll.body.height / this.height, 0 );
                }
                else {
                    var delta = e.clientX - this._originalPosition.x;
                    console.log( "delta", delta );
                    //this._thumb.setStyle( "left", ( parseFloat( this._thumb.element.style.left || 0 ) + delta ) + "px" );

                    this._scroll.scrollBy( 0, delta * this._scroll.body.width / this.width );
                }
                this._originalPosition = { x : e.clientX, y : e.clientY };
                console.log("orig", this._originalPosition )
                return false;
            }
        }
        _onDragStart( e ){
            this._moving = true;
            this._originalPosition = { x : e.clientX, y : e.clientY };
        }
        _onDragStop( e ) {
            this._moving = false;
            this._originalPosition = null;
        }
        _onTumbScrolled( e ) {
            console.log(e)
            if ( this._orientation == gn.ui.layout.direction.Column ) {
                var delta = e.deltaY * this._wheelScrollSpeed;
                console.log( "delta", delta );
                this._scroll.scrollBy( delta * this._scroll.body.height / this.height, 0 );
            }
            else {
                var delta = e.deltaX * this._wheelScrollSpeed;
                console.log( "delta", delta );
                //this._thumb.setStyle( "left", ( parseFloat( this._thumb.element.style.left || 0 ) + delta ) + "px" );

                this._scroll.scrollBy( 0, delta * this._scroll.body.width / this.width );
            }
        }
    }
}