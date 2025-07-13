namespace gn.ui.popup {
    //TODO popups stay if user scrolls or size of webside is changed
    class PopupBase extends gn.ui.container.Column {
        constructor(classList){
            super("gn-popup-base");
            this.addClasses(classList);
        }
        hide() {
            document.body.removeChild(this.element);
        }
        show() {
            document.body.appendChild(this.element);
        }
    }
    class Popup extends gn.ui.popup.PopupBase { //TODO bug it shows on top of page(if page is scrolled it wont show in the middle, we should also lock scroll when we have a popup)
        constructor(buttons) {
            super("gn-popup");
            this.header = new gn.ui.container.Row("gn-popup-header");
            this.body = new gn.ui.container.Column("gn-popup-body");
            this.footer = new gn.ui.container.Row("gn-popup-footer");
            if(buttons & gn.ui.popup.OK) {
                let button = new gn.ui.control.Button("OK");
                button.addEventListener("click", function () {
                    this.sendEvent("ok");
                    this.dispose();
                }, this);
                this.footer.add(button);
            }
            if(buttons & gn.ui.popup.CLOSE) {
                let close = new gn.ui.basic.Icon(14, "fa-xmark", ["fa-solid"]);
                close.addEventListener("click", function () {
                    this.sendEvent("close");
                    this.dispose();
                }, this);
                this.header.add(close);
            }
            if(buttons & gn.ui.popup.CANCEL) {
                let button = new gn.ui.control.Button("CANCEL");
                button.addEventListener("click", function () {
                    this.sendEvent("cancel");
                    this.dispose();
                }, this);
                this.footer.add(button);
            }
            if(buttons & gn.ui.popup.YES) {
                let button = new gn.ui.control.Button("YES");
                button.addEventListener("click", function () {
                    this.sendEvent("yes");
                    this.dispose();
                }, this);
                this.footer.add(button);
            }
            if(buttons & gn.ui.popup.NO) {
                let button = new gn.ui.control.Button("NO");
                button.addEventListener("click", function () {
                    this.sendEvent("no");
                    this.dispose();
                }, this);
                this.footer.add(button);
            }
        }
        set header(header) {
            this._header = header;
            this.add(header);
        }
        get header() {
            return this._header;
        }
        set body(body) {
            this._body = body;
            this.add(body);
        }
        get body() {
            return this._body;
        }
        set footer(footer) {
            this._footer = footer;
            this.add(footer);
        }
        get footer() {
            return this._footer;
        }
        static InformationPopup(titleWidget, messageWidget) {
            let popup = new gn.ui.popup.Popup(gn.ui.popup.OK|gn.ui.popup.CLOSE);
            popup.header.addFirst(titleWidget);
            popup.body.add(messageWidget);
            return popup;
        }
        static ConfirmationPopup(titleWidget, messageWidget) {
            let popup = new gn.ui.popup.Popup(gn.ui.popup.YES|gn.ui.popup.NO|gn.ui.popup.CLOSE);
            popup.header.addFirst(titleWidget);
            popup.body.add(messageWidget);
            return popup;
        }
    }
    class Menu extends gn.ui.popup.PopupBase {
        constructor(menuParent) {
            super("gn-popup-menu");
            this._items = [];
            this._menuParent = menuParent; // we need parent in order to position the menu correctly
        }
        addItem(item){
            if(!(item instanceof gn.ui.popup.MenuItem)){
                throw new Error("Item must be instance of MenuItem");
            }
            this._items.push(item);
            this.add(item);
            item.addEventListener("click", function () {
                this.hide();
                if (item.action) {
                    item.action();
                }
            }, this);
        }
        get items() {
            return this._items;
        }
        show() {
            document.body.appendChild(this.element);
            let rect = this._menuParent.rect;
            let trect = this.rect;
            this.setStyle("top", rect.bottom + "px");
            this.setStyle("left", rect.right - trect.width + "px");
            this._windowClickBound = this._windowClick.bind(this)
            document.addEventListener("click", this._windowClickBound);
        }
        hide() {
            super.hide();
            this.c = false; // we reset click state so that next click will close the menu
            document.removeEventListener("click", this._windowClickBound);
        }
        _windowClick(event){ //TODO this works for simple one layer menus, for complex we need to rethink how we handle where user clicked
            if(!this.c){ // we remove first click it is a bug that would/will be solved by focus manager
                this.c = true;
                return;
            }
            else if (event.target !== this.element && !this.element.contains(event.target)) {
                this.hide();
                document.removeEventListener("click", this._windowClickBound);
            }
        }
    }
    class MenuItem extends gn.ui.container.Row {
        constructor(label, icon, action, context) {
            super("gn-popup-menu-item");
            this._label = label;
            this._icon = icon;
            this._action = action;
            this._context = context;
            if(icon){
                this.add(this._icon);
            }
            if(gn.lang.Var.isString(label)) {
                this._label = new gn.ui.basic.Label(label);
            } else if (!label instanceof gn.ui.basic.Label) {
                throw new Error("Label must be instance of gn.ui.basic.Label or string");
            }
            this.add(this._label);
            this.setStyle("cursor", "pointer");
            this.addEventListener("click", function () {
                if (this._action) {
                    if(this._context) {
                        this._action.call(this._context);
                    } else {
                        this._action.call(this);
                    }
                }
            }, this);
            gn.locale.LocaleManager.instance().addEventListener("localeChange", function () {
                if(this._label instanceof gn.locale.LocaleString) {
                    this.label = this._label.translate();
                }
            }, this);
        }
        set label(label) {
            this._label = label;
        }
        get label() {
            return this._label;
        }
        set icon(icon) {
            this._icon = icon;
        }
        get icon() {
            return this._icon;
        }
    }
    OK = 1;
    CANCEL = 2;
    CLOSE = 4;
    YES = 8;
    NO = 16;
}