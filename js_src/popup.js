namespace gn.ui.popup {
    class PopupBase extends gn.ui.container.Column {
        /**
         * 
         * @param {String[]} classList 
         * @param {Boolean} modal 
         */
        constructor( classList, modal = false, hideOnModalClick = false ) {
            super( "gn-popup-base" );
            this.addClasses( classList );
            this._modal = modal;
            this._isShown = false;
            this._hideOnBlockerClick = hideOnModalClick;
            this._blocker = null;
        }
        set modal(value) {
            this._modal = value;
        }
        get modal() {
            return this._modal;
        }
        exclude() {
            hide();
            super.exclude();
        }
        hide() {
            if(!this._isShown) {
                return;
            }
            this._isShown = false;
            if(this._blocker) {
                this._blocker.hide();
            }
            this.element.remove();
        }
        show() {
            if(this._isShown) {
                return;
            }
            if(this._modal) {
                if(!this._blocker) {
                    this._blocker = new gn.ui.popup.Blocker(this, this._hideOnBlockerClick);
                }
                this._blocker.show();
            }
            document.body.appendChild( this.element );
            this._isShown = true;
            gn.app.App.instance().sendEvent( "popup" );
        }
        close() {
            this.dispose();
        }
        _destructor() {
            if(this._blocker) {
                this._blocker.dispose();
            }
        }
    }
    class Dialog extends gn.ui.popup.PopupBase {
        /**
         * @param {String} title
         * @param {String|gn.ui.basic.Widget} content
         * @param {gn.ui.popup.Button} buttons 
         * @param {Boolean} blocker 
         */
        constructor(title, content, buttons, blocker = true) {
            super("gn-dialog", blocker);
            this.header = new gn.ui.container.Row("gn-dialog-header");
            this.body = new gn.ui.container.Column("gn-dialog-body");
            this.footer = new gn.ui.container.Row("gn-dialog-footer");
            
            this.title = title;
            this.content = content;
            if(buttons & gn.ui.popup.Button.OK) {
                this._footer.add(new gn.ui.control.Button("OK", null, this._accept, this));
            }
            if(buttons & gn.ui.popup.Button.CLOSE) {
                let close = new gn.ui.basic.Icon(14, "fa-xmark", ["fa-solid"]);
                close.addEventListener("click", this._reject, this);
                this.header.add(close);
            }
            if(buttons & gn.ui.popup.Button.CANCEL) {
                this._footer.add(new gn.ui.control.Button("CANCEL", null, this._reject, this));
            }
            if(buttons & gn.ui.popup.Button.YES) {
                this._footer.add(new gn.ui.control.Button("YES", null, this._accept, this));
            }
            if(buttons & gn.ui.popup.Button.NO) {
                this._footer.add(new gn.ui.control.Button("NO", null, this._reject, this));
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
        set title(value) {
            this._title = new gn.ui.basic.Label(value);
            this._header.add(this._title);
        }
        set content(value) {
            this._content = value;
            if(value instanceof gn.ui.basic.Widget) {
                this._body.add(value);
            }
            else if(gn.lang.Var.isString(value)) {
                this._body.add(new gn.ui.basic.Label(value));
            }
        }
        get content() {
            return this._content;
        }
        async exec() {
            super.show();
            return new Promise((resolve) => {
                this._resolvePromise = resolve;
            });
        }
        static InformationDialog(title, content) {
            return new gn.ui.popup.Dialog(title, content, gn.ui.popup.Button.OK | gn.ui.popup.Button.CLOSE, true);
        }
        static ConfirmationDialog(title, content) {
            return new gn.ui.popup.Dialog(title, content, gn.ui.popup.Button.YES | gn.ui.popup.Button.NO | gn.ui.popup.Button.CLOSE, true);
        }
        _accept() {
            this.hide();
            this.dispose();
            if (this._resolvePromise) {
                this._resolvePromise(gn.ui.popup.Dialog.DialogCode.Accepted);
                this._resolvePromise = null;
            }
        }
        _reject() {
            this.hide();
            this.dispose();
            if (this._resolvePromise) {
                this._resolvePromise(gn.ui.popup.Dialog.DialogCode.Rejected);
                this._resolvePromise = null;
            }
        }
        
    }
    Dialog.DialogCode = gn.lang.Enum({
        Accepted : 0,
        Rejected : 1,
    });

    Button = gn.lang.Enum({
        OK: 1,
        CANCEL: 2,
        CLOSE: 4,
        YES: 8,
        NO: 16,
    });    

    class Blocker extends gn.ui.basic.Widget {
        constructor(popup, closePopupOnClick = false) {
            super();
            this.addClass( "gn-blocker" )
            this._popup = popup;
            this._isHideOnActivated = closePopupOnClick;
        }
        hide() {
            this.element.remove();
            if(this._isHideOnActivated) {
                this.removeEventListener("click", this._onClicked, this);
            }
        }
        show() {
            document.body.appendChild( this.element );
            if(this._isHideOnActivated) {
                this.addEventListener("click", this._onClicked, this);
            }
        }
        _onClicked() {
            this._popup.hide();
        }
    }
}