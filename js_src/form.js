namespace gn.ui.form {

    class Form extends gn.ui.basic.Widget {
        /**
         * 
         * @param {Array} classList 
         * @param {Number} gap 
         * @param {gn.ui.layout.direction} direction for how label and input
         */
        constructor(classList, gap = 5, direction = gn.ui.layout.direction.Column) {
            super(new gn.ui.layout.Column(gap), "form", classList);
            this.addClass("gn-form");

            this._formElements = {};
            this._errors = {};
            this._childDir = direction;
        }

        /**
         * 
         * @param {String} id 
         * @param {gn.ui.basic.Widget} element 
         * @param {String} label 
         * @param {Boolean} showLabel
         * @param {Boolean} required 
         */
        addElement(id, element, label = null, showLabel = true, required = false) {
            this._formElements[id] = {};
            this._formElements[id]["el"] = element;
            this._formElements[id]["req"] = required;
            this._formElements[id]["label"] = label;
            let lableEl = null;

            if(element instanceof gn.ui.control.Button) {
                element.element.type="button";
            }
        
            if(gn.lang.Var.isString(label) && showLabel) {
                lableEl = new gn.ui.basic.Label(label, "gn-form-label")
            }

            let wrap = new gn.ui.container.Column(null, 5);
            let wrap2 = null;
            if(this._childDir == gn.ui.layout.direction.Column) {
                wrap2 = new gn.ui.container.Column(null, 5);
                if(lableEl != null) {
                    lableEl.setStyle("align-self", "start");
                }
                element.setStyle("width", "100%");
            } else {
                wrap2 = new gn.ui.container.Row(null, 5);
                wrap2.setStyle("justify-content", "space-between");
            }
            this._formElements[id]["wrap"] = wrap;
            wrap.add(wrap2);
            wrap.setStyle("height", "unset");
            if(lableEl != null) {
                wrap2.add(lableEl);
            }
            
            wrap2.add(element);
            this.add(wrap);
        }

        elementAddEventListener(id, event, cb, ctx) {
            this._formElements[id]["el"].addEventListener(event, cb, ctx);
        }

        data() {
            let obj = {};
            for(let el in this._formElements){
                obj[el] = this._formElements[el]["el"].value;
            }
            return obj;
        }

        checkRules() {
            for(let id in this._errors) {
                this._errors[id].dispose();
            }
            let data = this.data();
            let ok = true;
            for(let id in this._formElements) {
                if(this._formElements[id]["req"] && gn.lang.Var.isEmpty(data[id])) {
                    let err = new gn.ui.basic.Label(this.tr("%1_SHOULD_NOT_BE_EMPTY").args(this._formElements[id]["label"]), "gn-form-error");
                    this._errors[id] = err;
                    this._formElements[id]["wrap"].add(err);
                    ok = false;
                }
            }
            return ok;
        }
    }
}