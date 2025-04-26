namespace gn.ui.container {
    class Row extends gn.ui.basic.Widget {
        constructor(classList) {
            super("div", classList);
            this.addClass("gn-container-row")
        }
    }
    class Column extends gn.ui.basic.Widget {
        constructor(classList) {
            super("div", classList);
            this.addClass("gn-container-column")
        }
    }
}