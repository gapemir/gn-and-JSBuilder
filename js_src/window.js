namespace gn.ui.window {

    class Window extends gn.ui.basic.Widget {
        constructor(id, layout, classList) {
            super(layout, null, classList);
            this.addClass("gn-window");

            if( gn.lang.String.isEmpty(id) ) {
                id = "id" + Math.random();
            }
            this._id = id;
        }
        get id() {
            return this._id;
        }
        onActivated() {

        }
    }

    class WindowManager extends gn.ui.container.Stack{
        constructor() {
            super();
            this.addClass("gn-window-manager");

            this._windows = {};
            this._constructables = {};
        }

        registerConstructable(id, window) {
            if(!gn.lang.Var.isConstructableChildOf(window, gn.ui.window.Window)) {
                return false;
            }
            this._constructables[id] = window;
            return true;
        }

        unregisterConstructable(id) {
            delete this._constructables[id];
        }

        add(window) {
            if(!window instanceof gn.ui.window.Window) {
                return;
            }
            this._windows[window.id] = window;
            super.add(window);
            if(this._currentWidget == window) {
                window.onActivated();
            }
        }

        remove(windowOrId) {
            if(!(windowOrId instanceof gn.ui.window.Window)) {
                if(!gn.lang.Var.isNull(this._windows[windowOrId])) {
                    windowOrId = this._windows[windowOrId];
                } else {
                    return;
                }
            }
            delete this._windows[windowOrId.id];
            super.remove(windowOrId);
            windowOrId.dispose();
        }

        activate(windowOrId) {
            if(windowOrId instanceof gn.ui.window.Window) {
                super.activate(windowOrId);
                windowOrId.onActivated();
                return;
            }
            let window = this._windows[windowOrId];
            if(gn.lang.Var.isEmpty(window)) {
                if( gn.lang.Var.isEmpty(this._constructables[windowOrId])) {
                    return false;
                }
                window = new this._constructables[windowOrId]();
                this.add(window);
            }
            super.activate(window);
            window.onActivated();
            return true;
        }   
    }
}