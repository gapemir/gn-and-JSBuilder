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
                let button = new gn.ui.control.Button("", "OK");
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
                let button = new gn.ui.control.Button("", "CANCEL");
                button.addEventListener("click", function () {
                    this.sendEvent("cancel");
                    this.dispose();
                }, this);
                this.footer.add(button);
            }
            if(buttons & gn.ui.popup.YES) {
                let button = new gn.ui.control.Button("", "YES");
                button.addEventListener("click", function () {
                    this.sendEvent("yes");
                    this.dispose();
                }, this);
                this.footer.add(button);
            }
            if(buttons & gn.ui.popup.NO) {
                let button = new gn.ui.control.Button("", "NO");
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
        constructor(parent) {// we need parent in order to position the menu correctly
            super("gn-popup-menu");
            this._items = null;
            this._parent = parent;
        }
        set items(items) {
            this._items = items;
            this._items.forEach(item => {
                let div = new gn.ui.container.Row();
                div.setStyle("cursor", "pointer");
                div.add(item.icon);
                let text = item.label;
                div.add(text)
                div.addEventListener("click", function () {
                    this.close();
                    if (item.action) {
                        item.action();
                    }
                }, this);
                this.add(div);
            });
        }
        get items() {
            return this._items;
        }
        show() {
            document.body.appendChild(this.element);
            let rect = this._parent.element.getBoundingClientRect();
            let trect = this.element.getBoundingClientRect();
            this.setStyle("top", rect.bottom + "px");
            this.setStyle("left", rect.right - trect.width + "px");
            this._windowClickBound = this._windowClick.bind(this)
            document.addEventListener("click", this._windowClickBound);
        }
        _windowClick(event){ //TODO this works for simple one layer menus, for complex we need to rethink how we handle where user clicked
            if(!this.c){ // we remove first click
                this.c = true;
                return;
            }
            if (event.target !== this.element && !this.element.contains(event.target)) {
                this.hide();
                document.removeEventListener("click", this._windowClickBound);
            }
        }
    }
    OK = 1;
    CANCEL = 2;
    CLOSE = 4;
    YES = 8;
    NO = 16;
}