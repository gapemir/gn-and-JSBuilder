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
}