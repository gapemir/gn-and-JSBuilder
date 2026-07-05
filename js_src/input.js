namespace gn.ui.input {
    class BaseInput extends gn.ui.basic.Widget {
        constructor(type, classList) {
            switch (type) {
                case "textarea":
                    super(null, "textarea", "gn-text-area");
                    break;
                default:
                    super(null, "input", "gn-input");
                    this._element.type = type;
                    break;
            }
            this._plcText = "";

            this.addClasses(classList);
            this.addEventListener( "focus", this._onFocus, this );
            // this.focusable = 0;
        }
        _destructor() {
            if(this._plcText instanceof gn.locale.LocaleString) {
                gn.locale.LocaleManager.instance().removeEventListener("changeLocale", this._onLocaleChanged, this);
            }
            super._destructor();
        }
        get type() {
            return this._element.type;
        }
        get value() {
            return this._element.value;
        }
        set value(value) {
            this._element.value = value || "";
        }
        set disabled( value ) {
            this._element.disabled = value;
        }
        get disabled(){
            return this._element.disabled;
        }
        set placeholder(value) {
            if (!["text", "textarea","search", "url", "tel", "email", "password", "number"].includes(this.type)) {
                throw new TypeError("Placeholder for this input type is not supported by standard html")
            }
            this._element.placeholder = value || "";

            this._plcText = value;
            this._element.innerText = this._plcText;

            if(this._plcText instanceof gn.locale.LocaleString) {
                gn.locale.LocaleManager.instance().addEventListener("changeLocale", this._onLocaleChanged, this);
            }
        }
        get placeholder() {
            return this._element.placeholder;
        }
        set readonly(value) {
            if (typeof value != "boolean" && (typeof value != "number" || value != 1 && value != 0)) {
                throw new TypeError("Readonly property can be boolan or 0&1");
            }
            this._element.readonly = value;
        }
        get readonly() {
            return this._element.readonly;
        }
        set required(value){
            if (typeof value != "boolean" && (typeof value != "number" || value != 1 && value != 0)) {
                throw new TypeError("Readonly property can be boolan or 0&1");
            }
            if (!["text", "textarea","search", "url", "tel", "email", "password", "date", "month", "week", "time", "datetime-local", "number", "checkbox", "radio", "file"].includes(this.type)) {
                throw new TypeError("Required for this input type is not supported by standard html")
            }
            this.element.required = value;
        }
        get required(){
            return this.element.required;
        }
        set maxlength(value) {
            if (typeof value !== "number" || value < 0) {
                throw new TypeError("Maxlength must be a positive number");
            }
            if (!["text", "search", "url", "tel", "email", "password"].includes(this.type)) {
                throw new TypeError("Maxlength for this input type is not supported by standard html")
            }
        }
        get maxlength() {
            return this._element.maxLength;
        }
        set minlength(value) {
            if (typeof value !== "number" || value < 0) {
                throw new TypeError("Minlength must be a positive number");
            }
            if (!["text", "search", "url", "tel", "email", "password"].includes(this.type)) {
                throw new TypeError("Minlength for this input type is not supported by standard html")
            }
            this._element.minLength = value;
        }
        get minlength() {
            return this._element.minLength;
        }
        set autocomplete(value) {
            if (!["text", "textarea","search", "url", "tel", "email", "password", "date", "month", "week", "time", "datetime-local", "number", "range", "color"].includes(this.type)) {
                throw new TypeError("Autocomplete for this input type is not supported by standard html")
            }
            this._element.autocomplete = value;
        }
        get autocomplete() {
            return this._element.autocomplete;
        }
        set pattern(value) {
            if (!["text", "search", "url", "tel", "email", "password"].includes(this.type)) {
                throw new TypeError("Pattern for this input type is not supported by standard html")
            }
            if (gn.lang.Var.isNull(value)) {
                value = "";
            }
            this._element.pattern = value;
        }
        get pattern() {
            return this._element.pattern;
        }
        click() {
            this._element.click();
        }
        _onFocus() {
            //
        }
        _onLocaleChanged() {
            if(this._plcText instanceof gn.locale.LocaleString) {
                this.placeholder = this._plcText.translate();
            }
        }
    }

    class Line extends gn.ui.input.BaseInput {
        constructor(value, placeholder, classList) {
            super("text", classList);
            this.placeholder = placeholder;
            this.value = value;
        }
    }
    class MultiLine extends gn.ui.input.BaseInput {
        constructor(value, placeholder, classList, rows, cols) {
            super("textarea", classList);
            this.placeholder = placeholder;
            let rowsValue = rows || 3;
            let colsValue = cols || 20;
            this.rows = rowsValue;
            this.cols = colsValue;
            this.value = value;
        }
        set rows(value) {
            this._element.rows = value;
        }
        get rows() {
            return this._element.rows;
        }
        set cols(value) {
            this._element.cols = value;
        }
        get cols() {
            return this._element.cols;
        }
        get type() {
            return "textarea";
        }
        set defaultValue(value) {
            this._element.defaultValue = value;
        }
        get defaultValue () {
            return this._element.defaultValue;
        }
    }

    class Number extends gn.ui.input.BaseInput {
        constructor(value, placeholder, classList) {
            super("number", classList);
            this.placeholder = placeholder;
            this.value = value;
        }
        get step() {
            return this._element.step;
        }
        set step(value) {
            if (typeof value !== "number" || value <= 0) {
                throw new TypeError("Step must be a positive number");
            }
            this._element.step = value;
        }
        set min(value) {
            if (typeof value !== "number") {
                throw new TypeError("Min must be a number");
            }
            this._element.min = value;
        }
        get min() {
            return this._element.min;
        }
        set max(value) {
            if (typeof value !== "number") {
                throw new TypeError("Max must be a number");
            }
            this._element.max = value;
        }
        get max() {
            return this._element.max;
        }
    }
    class Password extends gn.ui.input.BaseInput {
        constructor(value, placeholder, classList) {
            super("password", classList);
            this.placeholder = placeholder;
            value = value;
        }
    }
    class Color extends gn.ui.input.BaseInput {
        constructor(value, classList) {
            super("color", classList);
            this.value = value;
        }
        set value(value) {
            if(gn.lang.Var.isString(value) && value.length == 7){
                this._element.value = value;
            }else{
                throw new TypeError("Color value must be a string in the format '#RRGGBB'");
            }
        }
    }
    class CheckBox extends gn.ui.input.BaseInput { //* should use gn.ui.control.Switch
        constructor(value, classList) {
            super("checkbox", classList);
            this.value = value;
        }
        get value() {
            return this._element.checked;
        }
        set value(value) {
            this._element.checked = value || false;
        }
    }
    class Range extends gn.ui.input.BaseInput {
        constructor(value, min, max, classList ) {
            super("range", classList);
            this.value = value;
            this.min = min;
            this.max = max;
        }
        get min() {
            return this._element.min;
        }
        set min(value) {
            this._element.min = value || 0;
        }
        set max(value) {
            this._element.max = value || 100;
        }
        get max() {
            return this._element.max;
        }
        get step() {
            return this._element.step;
        }
        set step(value) {
            if (typeof value !== "number" || value <= 0) {
                throw new TypeError("Step must be a positive number");
            }
            this._element.step = value;
        }
    }
    class File extends gn.ui.container.Column {
        constructor(multi = false, classList) {
            super(classList);
            this.addClass("gn-input-file");
            this._input = new gn.ui.input.BaseInput("file", "gn-exclude");
            this._input.element.multiple = multi;
            this._input.element.accept = "*";
            this.add(this._input);
            this._button = new gn.ui.control.Button(this.tr("SELECT_FILE"));
            this._button.addEventListener( "click", function(){
                this._input.click();
            }, this )
            this.add(this._button);
            this._label = new gn.ui.basic.Label( "" );
            this.add(this._label);
            this._input.element.addEventListener("cancel", this.onCancel.bind(this));
            this._input.addEventListener( "input", this.onInput, this );
            this._input.addEventListener( "change", this.onChange, this );
        }
        get value() {
            return this._input.element.files || null;
        }
        set value(value) {
            if(value){
                throw new TypeError("File set value is made to clear it.")
            }
            this._input.element.files = null;
        }
        set accept(value) {
            this._input.element.accept = value;
        }
        get accept() {
            return this._input.element.accept;
        }
        get type() {
            return this._input.type;
        }
        set disabled( value ){
            this._button.disabled = value;
        }
        get disabled(){
            return this._button.disabled;
        }
        _updateLabel(){
            let text = "";
            for(let i = 0; i < this._input.element.files.length; i++){
                text += this._input.element.files[i].name;
                if(i < this._input.element.files.length - 1){
                    text += ", ";
                }
            }
            this._label.text = text;
        }
        onCancel() {
            this._updateLabel();
            this.sendEvent("cancel", null);
        }
        onInput() {
            this._updateLabel();
            this.sendEvent("input", this.value);
        }
        onChange() {
            this._updateLabel();
            this.sendEvent("change", this.value);
        }
    }
    class Date extends gn.ui.input.BaseInput {
        constructor(value, classList) {
            super("date", classList);
            this.value = value;
        }
        set value(value) {
            if (value instanceof Date) {
                value = value.toISOString().split("T")[0];
            }
            this._element.value = value || "";
        }
    }
    class ComboBox extends gn.ui.basic.Widget {
        constructor(placeholder = "", nonEditable = false, classList = "") {
            super(null, "div", "gn-input-combo");
            this.addClasses(classList);
            
            this._options = [];
            this._isOpen = false;
            this._value = null;

            this._input = new gn.ui.input.Line("", placeholder);
            if (nonEditable) {
                this._input.readonly = true;
                this._input.addEventListener("click", this.togglePopup, this);
            }
            this.add(this._input);
            
            this._popup = new gn.ui.control.Menu(this, true);
            this._popup.addEventListener("aboutToHide", () => {
                this._isOpen = false;
            }, this);

            this._toggleBtn = new gn.ui.basic.Widget(null, "div", "gn-toggle");
            this._toggleBtn.element.innerHTML = "&#9662;"; // Arrow character
            this._toggleBtn.addEventListener("click", this.togglePopup, this);
            this.add(this._toggleBtn);
        }

        set options(items) {
            // expects layout format like [{value: 'val1', label: 'Label 1'}, ...]
            this._options = items || [];
            this._popup.clear();
            this._options.forEach(opt => {
                let item = new gn.ui.control.MenuItem(opt.value, opt.label || opt.value, opt.icon || null);
                item.addEventListener("selected", () => this._onOptionSelect(opt), this);
                this._popup.addItem(item);
            });
        }

        get options() {
            return this._options;
        }

        set text(value) {
            this._input.value = value;
        }

        get text() {
            return this._input.value;
        }

        get value() {
            return this._value;
        }

        set value(val) {
            this._value = val;
            let opt = this.options.find(a => a.value == val);
            this.text = opt ? (opt.label || opt.value) : val;
            this._popup.walkItems(item => {
                if(item._id == val) {
                    item._selected = true;
                    item.addClass("gn-selected");
                } else {
                    item._selected = false;
                    item.removeClass("gn-selected");
                }
            });
        }

        togglePopup() {
            this._isOpen = !this._isOpen;
            if(this._isOpen) {
                this._popup.show();
            } else {
                this._popup.hide();
            }
        }

        _onOptionSelect(option) {   
            this.value = option.value;
            this.text = option.label || option.value;
            this.togglePopup();
            this.sendEvent("change", this.value);
        }
    }

    class MultiComboBox extends gn.ui.input.ComboBox {
        constructor(placeholder = "", nonEditable = false, classList = "") {
            super(placeholder, nonEditable, classList);
            this._value = [];
        }

        set value(val) {
            if(!Array.isArray(val)) {
                throw new TypeError("Value for MultiComboBox must be an array");
            }
            this._value = val;
            let opts = this.options.filter(a => val.includes(a.value));
            this.text = opts.map(o => o.label || o.value).join(", ");
            this._popup.walkItems(item => {
                if(this._value.includes(item._id)) {
                    item._selected = true;
                    item.addClass("gn-selected");
                } else {
                    item._selected = false;
                    item.removeClass("gn-selected");
                }
            });
        }

        _onOptionSelect(option) {
            if(this._value.includes(option.value)) {
                this.value = this._value.filter(v => v !== option.value);
            } else {
                this.value = this._value.concat(option.value);
            }
            this.text = this._value.map(v => {
                let opt = this._options.find(o => o.value === v);
                return opt ? (opt.label || opt.value) : v;
            }).join(", ");
            this.sendEvent("change", this.value);
        }
    }
    class Switch extends gn.ui.basic.Widget {
        constructor(checked, classList) {
            super(null, "label", classList);
            this.addClass("gn-switch");
            this._input = new gn.ui.input.CheckBox(null , checked);
            this.add(this._input);
            this._span = new gn.ui.basic.Widget(null, "span", "gn-switch");
            this.add(this._span);
            this.checked = checked || false;
            this._input.addEventListener("change", () => {
                this.sendEvent("change", this.checked);
            }, this);
        }
        set checked(value) {
            this._input.value = value;
        }
        get checked() {
            return this._input.value;
        }
        set value(value) {
            this.checked = value;
        }
        get value() {
            return this.checked;
        }
    }
}