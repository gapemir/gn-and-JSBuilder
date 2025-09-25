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
            if( e.clientX == 0 ){
                console.log("wtf");
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

            // this.addEventListener( "scroll", this._onScroll, this );
        }

        get body() {
            return this._body;
        }

        _addInternal( child, where, refChild ) {
            this._body._addInternal( child, where, refChild );
        }
        remove( child ) {
            this._body.remove( child, where, refChild );
        }
        // _onScroll( e ) {
        //     const currentTop = parseFloat(this._body.element.style.top) || 0;
        //     const newTop = currentTop - this._speed * e.deltaY;

        //     const maxScroll = Math.min(0, this.element.clientHeight - this._body.element.scrollHeight);
        //     const clampedTop = Math.max(maxScroll, Math.min(0, newTop));

        //     this._body.element.style.top = clampedTop + "px";
            
        //     console.log("scroll", e.deltaY, "new top:", clampedTop);
        // }

        scrollTo( y, x, instant = false ) {
            y = gn.lang.Var.isNull( y ) ? this._element.scrollTop : y;
            x = gn.lang.Var.isNull( x ) ? this._element.scrollLeft : x;
            this._element.scrollTo( {
                top: y,
                left: x,
                behavior: ( instant ? "instant" : "auto" )
            } );
        }

        scrollBy( y, x, instant = false ) {
            y = gn.lang.Var.isNull( y ) ? 0 : y;
            x = gn.lang.Var.isNull( x ) ? 0 : x;
            this._element.scrollBy({
                top: y,
                left: x,
                behavior: ( instant ? "instant" : "auto" )
            } );
        }
    }
}