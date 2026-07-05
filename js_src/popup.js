namespace gn.ui.popup {
    //TODO popups stay if user scrolls or size of webside is changed
    class PopupBase extends gn.ui.container.Column {
        constructor( classList, blocker = true ) {
            super( "gn-popup-base" );
            this.addClasses( classList );
            if( blocker ){
                this._blocker = new gn.ui.popup.Blocker();
            }
        }
        hide() {
            document.body.removeChild( this.element );
            if( this._blocker ) {
               this._blocker.hide();
            }
        }
        exclude() {
            document.body.removeChild( this.element );
            if( this._blocker ) {
                this._blocker.exclude();
            }
        }
        show() {
            if( this._blocker ) {
                this._blocker.show();
            }
            document.body.appendChild( this.element );
        }
        dispose(){
            this._blocker.dispose();
            super.dispose();
        }
    }
    class Popup extends gn.ui.popup.PopupBase { //TODO bug it shows on top of page(if page is scrolled it wont show in the middle, we should also lock scroll when we have a popup)
        constructor(buttons, blocker) {
            super("gn-popup");
            this._callback = null;
            this.header = new gn.ui.container.Row("gn-popup-header");
            this._title = new gn.ui.basic.Label();
            this._header.add(this._title);
            this.body = new gn.ui.container.Column("gn-popup-body");
            this.footer = new gn.ui.container.Row("gn-popup-footer");
            if(buttons & gn.ui.popup.OK) {
                let button = new gn.ui.control.Button("OK");
                button.addEventListener("click", function () {
                    this.sendEvent("ok", this._callback ? this._callback.call(this, "ok", this) : null);
                    this.dispose();
                }, this);
                this.footer.add(button);
            }
            if(buttons & gn.ui.popup.CLOSE) {
                let close = new gn.ui.basic.Icon(14, "fa-xmark", ["fa-solid"]);
                close.addEventListener("click", function () {
                    this.sendEvent("close", this._callback ? this._callback.call(this, "close", this) : null);
                    this.dispose();
                }, this);
                this.header.add(close);
            }
            if(buttons & gn.ui.popup.CANCEL) {
                let button = new gn.ui.control.Button("CANCEL");
                button.addEventListener("click", function () {
                    this.sendEvent("cancel", this._callback ? this._callback.call(this, "cancel", this) : null);
                    this.dispose();
                }, this);
                this.footer.add(button);
            }
            if(buttons & gn.ui.popup.YES) {
                let button = new gn.ui.control.Button("YES");
                button.addEventListener("click", function () {
                    this.sendEvent("yes", this._callback ? this._callback.call(this, "yes", this) : null);
                    this.dispose();
                }, this);
                this.footer.add(button);
            }
            if(buttons & gn.ui.popup.NO) {
                let button = new gn.ui.control.Button("NO");
                button.addEventListener("click", function () {
                    this.sendEvent("no", this._callback ? this._callback.call(this, "no", this) : null);
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
        set title(value) {
            this._title.text = value
        }
        set callback(value){
            this._callback = value;
        }
        static InformationPopup(title, message) {
            let popup = new gn.ui.popup.Popup(gn.ui.popup.OK|gn.ui.popup.CLOSE);
            popup.title = title;
            if(message instanceof gn.ui.basic.Widget){
                popup.body.add(message);
            }
            else if(gn.lang.Var.isString(message)){
                popup.body.add(new gn.ui.basic.Label(message));
            }
            return popup;
        }
        static ConfirmationPopup(title, message) {
            let popup = new gn.ui.popup.Popup(gn.ui.popup.YES|gn.ui.popup.NO|gn.ui.popup.CLOSE);
            popup.title = title;
            if(message instanceof gn.ui.basic.Widget){
                popup.body.add(message);
            }
            else if(gn.lang.Var.isString(message)){
                popup.body.add(new gn.ui.basic.Label(message));
            }
            return popup;
        }
    }
    OK = 1;
    CANCEL = 2;
    CLOSE = 4;
    YES = 8;
    NO = 16;

    class Blocker extends gn.ui.basic.Widget{
        constructor() {
            super();
            this.addClass( "gn-blocker" )
        }
        hide() {
            document.body.removeChild( this.element );
        }
        exclude() {
            document.body.removeChild( this.element );
        }
        show() {
            document.body.appendChild( this.element );
        }
    }
}