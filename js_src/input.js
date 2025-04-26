namespace gn.ui.input {
    class AbstractInput extends gn.ui.basic.Widget {
        constructor(type, classList) {
            switch (type) {
                case "button":
                    super("button", "gn-button");
                    break
                default:
                    super("input", "gn-input");
                    this._element.type = type;
                    break
            }
            this.addClasses(classList);
            this._placeholder = null;//not all have placeholder
            this._readonly;
            this.element.addEventListener("input", this.onInput, this);
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
            if (!["text", "url", "tel", "email", "password"].includes(this.type)) {
                throw new TypeError("Placeholder for this input type is not supported by standard html")
            }
            this._placeholder = value;
            this._element.placeholder = value;
        }

        get placeholder() {
            return this._placeholder;
        }

        set readonly(value) {
            if (typeof value != "boolean" && (typeof value != "number" || value != 1 && value != 0)) {
                throw new TypeError("Readonly property can be boolan or 0&1");
            }
            this._readonly = value;
            this._element.readonly = value;
        }

        get readonly() {
            return this._readonly;
        }

        onInput() {
            this.sendDataEvent("input", this._element.value);
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
    class Button extends gn.ui.input.AbstractInput {
        constructor(classList, text) {
            super("button", classList);
            this.value = text;
        }

        set value(value) {
            this._element.textContent = value;
        }

        set value(value) {
            this._element.textContent = value;
        }
    }
}