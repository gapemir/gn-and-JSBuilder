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
}