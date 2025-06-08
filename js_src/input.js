namespace gn.ui.input {
    class AbstractInput extends gn.ui.basic.Widget {
        constructor(type, classList) {
            switch (type) {
                case "text-area":
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
            if (!["text", "textarea","url", "tel", "email", "password"].includes(this.type)) {
                throw new TypeError("Placeholder for this input type is not supported by standard html")
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
        constructor(classList, placeholder) {
            super("textarea", classList);
            this.placeholder = placeholder;
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