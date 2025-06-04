namespace gn.ui.layout {
    class AbstractLayout extends gn.core.Object {
        constructor() {
            super();
            this._widget = null;
        }
        set widget(value) {
            if(gn.lang.Var.isNull(value)){
                if(this._widget){
                    this._widget.removeClasses( this._getClasses() );
                    this._widget = null;
                }
                return;
            }
            else if (!(value instanceof gn.ui.basic.Widget)) {
                throw new Error("Widget must be instance of Widget");
            }
            this._widget = value;
            this._widget.addClasses( this._getClasses() );
        }
        _getClasses() {
            throw new Error("Abstract method _getClasses must be implemented in subclass");
        }
    }
    class Box extends gn.ui.layout.AbstractLayout {
        constructor( direction, spacing = 0, wrap = true ) {
            super();
            this._direction = direction;
            this._spacing = 0;
            this._wrap = false;
            if(!gn.lang.Var.isNull(spacing)){
                this.spacing = spacing;
            }
            if(!gn.lang.Var.isNull(wrap)){
                this.wrap = wrap;
            }
        }
        get direction() {
            return this._direction;
        }
        set direction(value) {
            if(this._widget){
                this.widget.removeClasses(this._getClasses());
            }
            this._direction = value;
            if(this._widget){
                this.widget.addClasses(this._getClasses());
            }
        }
        get spacing() {
            return this._spacing;
        }
        set spacing(value) {
            if(!gn.lang.Var.isNumber(value) || value < 0){
                throw new Error("Spacing must be a non-negative number");
            }
            this._spacing = value;
            if (this._widget) {
                this._widget.setStyle("gap", value + "px");
            }
        }
        get wrap() {
            return this._wrap;
        }
        set wrap(value) {
            if (typeof value !== "boolean") {
                throw new Error("Wrap must be a boolean");
            }
            this._wrap = value;
            if (this._widget) {
                this._widget.setStyle("flex-wrap", value ? "wrap" : "nowrap");
            }
        }
        _getClasses() {
            return "gn-layout-box " + (this.direction === gn.ui.layout.direction.Row ? "gn-layout-row" : "gn-layout-column");
        }
    }
    class Row extends gn.ui.layout.Box {
        constructor(spacing, wrap) {
            super(gn.ui.layout.direction.Row, spacing, wrap);
        }
    }
    class Column extends gn.ui.layout.Box {
        constructor(spacing, wrap) {
            super(gn.ui.layout.direction.Column, spacing, wrap);
        }
    }
    class Grid extends gn.ui.layout.AbstractLayout { // TODO implement grid layout, tile container is perfect for grid layout
        constructor(columns, spacing) {
            super();
            this._columns = columns;
            this._spacing = spacing;
        }
        get columns() {
            return this._columns;
        }
        set columns(value) {
            if (!gn.lang.Var.isNumber(value) || value < 1) {
                throw new Error("Columns must be a positive integer");
            }
            this._columns = value;
            if (this._widget) {
                this._widget.setStyle("grid-template-columns", `repeat(${value}, 1fr)`);
            }
        }
        get spacing() {
            return this._spacing;
        }
        set spacing(value) {
            if (!gn.lang.Var.isNumber(value) || value < 0) {
                throw new Error("Spacing must be a non-negative number");
            }
            this._spacing = value;
            if (this._widget) {
                this._widget.setStyle("gap", value + "px");
            }
        }
        _getClasses() {
            return "gn-layout-grid";
        }
    }

    direction = gn.lang.Enum({
        Row: 1,
        Column: 2
    })
}