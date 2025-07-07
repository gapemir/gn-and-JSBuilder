namespace gn.ui.layout {
    class AbstractLayout extends gn.core.Object {
        constructor() {
            super();
            this._widget = null;
            this._gap = 0;
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
            this._widget.setStyles( this._getStyles() );
        }
        get gap() {
            return this._gap;
        }
        set gap(value) {
            if(!gn.lang.Var.isString(value) && (!gn.lang.Var.isNumber(value) || value < 0)){ 
                throw new Error("Spacing must be a non-negative number or any of the permited strings");
            }
            this._gap = value;
            if (this._widget) {
                value = gn.lang.Var.isNumber(value) ? value + "px" : value;
                this._widget.setStyle("gap", value);
            }
        }
        _getClasses() {
            throw new Error("Abstract method _getClasses must be implemented in subclass");
        }
        _getStyles() {
            throw new Error("Abstract method _getStyles must be implemented in subclass");
        }
    }
    class Box extends gn.ui.layout.AbstractLayout {
        constructor( direction, gap = 0, wrap = false ) {
            super();
            this._direction = direction;
            this._gap = 0;
            this._wrap = false;
            if(!gn.lang.Var.isNull(gap)){
                this.gap = gap;
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
        _getStyles() {
            let ret = {};
            if(this.spacing != 0){
                ret["gap"] = this.spacing + "px";
            }
            if(this.wrap){
                ret["flex-wrap"] = "wrap";
            }
            return ret;
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
    class Grid extends gn.ui.layout.AbstractLayout {
        constructor(columns, rows, gap) {
            super();
            this._templateColumns = null;
            this._templateRows = null;
            this._columns = null;
            this._rows = null;

            this.templateColumns = "auto";
            this.templateRows = "auto";
            if(!gn.lang.Var.isNull(columns)) { 
                this.templateColumns = columns;
            }
            if(!gn.lang.Var.isNull(rows)) {
                this.templateRows = rows;
            }
            if(!gn.lang.Var.isNull(gap)) {
                this.gap = gap;
            }
        }
        get columns() {
            return this._columns;
        }
        set columns(value) {
            if (!gn.lang.Var.isNumber(value)) {
                throw new Error("Columns must be a number");
            }
            if (value < 1) {
                throw new Error("Columns must be a positive number");
            }
            this._columns = value;
            this._templateColumns = "repeat(" + value + ", 1fr)";
            if (this._widget) {
                this._widget.setStyle("grid-template-columns", this._templateColumns);
            }
        }
        get templateColumns() {
            return this._templateColumns;
        }
        set templateColumns(value) {
            if (!gn.lang.Var.isString(value) && !gn.lang.Var.isArray(value) && !gn.lang.Var.isNumber(value) && !gn.lang.Var.isNumber(value)) {
                throw new Error("Row template must be a string of sizes, e.g. '100px 200px auto' or 'repeat(3, 1fr)' or array of those values or number");
            }
            else if (gn.lang.Var.isArray(value)) {
                value = value.join(" ");
            }
            else if(gn.lang.Var.isNumber(value)) {
                this.columns = value;
                return;
            }
            this._columns = null;
            this._templateColumns = value;
            if (this._widget) {
                this._widget.setStyle("grid-template-columns", this._templateColumns);
            }
        }
        get rows(){
            return this._rows;
        }
        set rows(value){
            if (!gn.lang.Var.isNumber(value)) {
                throw new Error("Columns must be a number");
            }
            if (value < 1) {
                throw new Error("Columns must be a positive number");
            }
            this._rows = value;
            this._templateRows = "repeat(" + value + ", 1fr)";
            if (this._widget) {
                this._widget.setStyle("grid-template-rows", this._templateRows);
            }
        }
        get templateRows() {
            return this._templateRows;
        }
        set templateRows(value) {
            if (!gn.lang.Var.isString(value) && !gn.lang.Var.isArray(value) && !gn.lang.Var.isNumber(value) && !gn.lang.Var.isNumber(value)) {
                throw new Error("Row template must be a string of sizes, e.g. '100px 200px auto' or 'repeat(3, 1fr)' or array of those values or number");
            }
            else if (gn.lang.Var.isArray(value)) {
                value = value.join(" ");
            }
            else if(gn.lang.Var.isNumber(value)) {
                this.rows = value;
                return;
            }
            this._rows = null;
            this._templateRows = value;
            if (this._widget) {
                this._widget.setStyle("grid-template-rows", this._templateRows);
            }
        }
        _getClasses() {
            return "gn-layout-grid";
        }
        _getStyles() {
            let ret = {};
            if(!gn.lang.Var.isNull(this.templateColumns)) {
                ret["grid-template-columns"] = this.templateColumns;
            }
            if(!gn.lang.Var.isNull(this.templateRows)) {
                ret["grid-template-rows"] = this.templateRows;
            }
            if (this.spacing != 0) {
                ret["gap"] = this.spacing ?? 0 + "px";
            }
            return ret;
        }
    }

    direction = gn.lang.Enum({
        Row: 1,
        Column: 2
    })
}