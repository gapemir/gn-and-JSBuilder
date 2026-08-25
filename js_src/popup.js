namespace gn.ui.popup {
    class PopupBase extends gn.ui.container.Column {
        constructor( classList, blocker = true ) {
            super( "gn-popup-base" );
            this.addClasses( classList );
            if( blocker ) {
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
    class Dialog extends gn.ui.popup.PopupBase {
        /**
         * @param {String} title
         * @param {String|gn.ui.basic.Widget} content
         * @param {gn.ui.popup.Button} buttons 
         * @param {Boolean} blocker 
         */
        constructor(title, content, buttons, blocker = true) {
            super("gn-dialog", blocker);
            this.header = new gn.ui.container.Row("gn-popup-header");
            this.body = new gn.ui.container.Column("gn-popup-body");
            this.footer = new gn.ui.container.Row("gn-popup-footer");
            
            this.title = title;
            this.content = content;
            if(buttons & gn.ui.popup.Button.OK) {
                let button = new gn.ui.control.Button("OK");
                button.addEventListener("click", function () {
                    this._return(gn.ui.popup.Button.OK);
                }, this);
                this.footer.add(button);
            }
            if(buttons & gn.ui.popup.Button.CLOSE) {
                let close = new gn.ui.basic.Icon(14, "fa-xmark", ["fa-solid"]);
                close.addEventListener("click", function () {
                    this._return(gn.ui.popup.Button.CLOSE);
                }, this);
                this.header.add(close);
            }
            if(buttons & gn.ui.popup.Button.CANCEL) {
                let button = new gn.ui.control.Button("CANCEL");
                button.addEventListener("click", function () {
                    this._return(gn.ui.popup.Button.CANCEL);
                }, this);
                this.footer.add(button);
            }
            if(buttons & gn.ui.popup.Button.YES) {
                let button = new gn.ui.control.Button("YES");
                button.addEventListener("click", function () {
                    this._return(gn.ui.popup.Button.YES);
                }, this);
                this.footer.add(button);
            }
            if(buttons & gn.ui.popup.Button.NO) {
                let button = new gn.ui.control.Button("NO");
                button.addEventListener("click", function () {
                    this._return(gn.ui.popup.Button.NO);
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
        async show() {
            return this.exec();
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
        _return(button) {
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            if (this._blocker) {
                this._blocker.hide();
            }
            this.dispose();

            if (this._resolvePromise) {
                this._resolvePromise(button);
                this._resolvePromise = null;
                //TODO dispose????
            }
        }
    }
    Button = gn.lang.Enum({
        OK: 1,
        CANCEL: 2,
        CLOSE: 4,
        YES: 8,
        NO: 16,
    });

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