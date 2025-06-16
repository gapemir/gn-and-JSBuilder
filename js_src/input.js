namespace gn.ui.input {
    class AbstractInput extends gn.ui.basic.Widget {
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
            this.addClasses(classList);
            this.element.addEventListener("input", this.onInput.bind(this));
            this.element.addEventListener("change", this.onChange.bind(this));
        }
        get type() {
            return this._element.type;
        }
        get value() {
            throw new TypeError("Abstract class");
        }
        set value(value) {
            throw new TypeError("Abstract class");
        }
        set placeholder(value) {
            if (!["text", "textarea","search", "url", "tel", "email", "password", "number"].includes(this.type)) {
                throw new TypeError("Placeholder for this input type is not supported by standard html")
            }
            if(gn.lang.Var.isNull(value)){
                value = "";
            }
            this._element.placeholder = value;
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
        onInput() {
            this.sendDataEvent("input", this.value);
        }
        onChange() {
            this.sendDataEvent("change", this.value);
        }
    }

    class Line extends gn.ui.input.AbstractInput {
        constructor(classList, placeholder) {
            super("text", classList);
            this.placeholder = placeholder;
        }
        get value() {
            return this._element.value;
        }
        set value(value) {
            this.element.value = value;
        }
    }
    class MultiLine extends gn.ui.input.AbstractInput {
        constructor(classList, placeholder, rows, cols) {
            super("textarea", classList);
            this.placeholder = placeholder;
            let rowsValue = rows || 3;
            let colsValue = cols || 20;
            this.rows = rowsValue;
            this.cols = colsValue;
        }
        get value() {
            return this._element.value;
        }
        set value(value) {
            this._element.value = value;
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

    class Number extends gn.ui.input.AbstractInput {
        constructor(classList, placeholder) {
            super("number", classList);
            this.placeholder = placeholder;
        }
        get value() {
            return this._element.value;
        }
        set value(value) {
            this._element.value = value;
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
    class Password extends gn.ui.input.AbstractInput {
        constructor(classList, placeholder) {
            super("password", classList);
            this.placeholder = placeholder;
        }
        get value() {
            return this._element.value;
        }
        set value(value) {
            this._element.value = value;
        }
    }
    class Color extends gn.ui.input.AbstractInput {
        constructor(classList, value) {
            super("color", classList);
            this.value = value;
        }
        get value() {
            return this._element.value;
        }
        set value(value) {
            if(gn.lang.isString(value) && value.length == 7){
                this._element.value = value;
            }else{
                throw new TypeError("Password must be 7 characters long")
            }
        }
    }
    class CheckBox extends gn.ui.input.AbstractInput {
        constructor(classList, value = false) {
            super("checkbox", classList);
            this.value = value;
        }
        get value() {
            return this._element.checked;
        }
        set value(value) {
            this._element.checked = value;
        }
    }
    class Range extends gn.ui.input.AbstractInput {
        constructor(classList, min, max, value) {
            super("range", classList);
            this.min = min;
            this.max = max;
            this.value = value;
        }
        get value() {
            return this._element.value;
        }
        set value(value) {
            this._element.value = value;
        }
        set min(value) {
            this._element.min = value;
        }
        get min() {
            return this._element.min;
        }
        set max(value) {
            this._element.max = value;
        }
        get max() {
            return this._element.max;
        }
    }
    //TODO support multiple file upload 
    class File extends gn.ui.input.AbstractInput {
        constructor(classList) {
            super("file", classList);
            this._element.multiple = false;
            this._element.accept = "*";
        }
        get value() {
            return this._element.files[0];
        }
        set value(value) {
            if(value){
                throw new TypeError("File set value is made to clear it.")
            }
            this._element.files = null;
        }
        set accept(value) {
            this._element.accept = value;
        }
        get accept() {
            return this._element.accept;
        }
    }
}