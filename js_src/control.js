namespace gn.ui.control {
    class Button extends gn.ui.basic.Widget {
        constructor(classList, text) {
            super("button", classList);
            this.text = text;
        }
        set text(value) {
            this._element.innerText = value;
        }
        get text() {
            return this._element.innerText;
        }
    }
    class Select extends gn.ui.basic.Widget {
        constructor(classList, options, multiple) {
            //TODO how will we handle multiple select options? nativly this doesnt work as it returnes first selected value
            //maybe we need to create a custom select element that handles multiple select
            super("select", classList);
            this._options = null;
            //this._element.innerHTML = options.map(option => `<option value="${option.value}">${option.text}</option>`).join('');
            if(multiple) {
                throw new Error("Multiple select not supported yet");
            }
            //this._element.multiple = multiple || false;
            this.options = options;
        }
        set value(value) { // sets to selected value if multiple is true, sets to array of selected values
            this._element.value = value;

        }
        get value() { // returns selected value
            return this._element.value;
        }
        set text(value) { // sets to selected text
            this.element.selectedIndex = [...x.element.options].findIndex(opt=>{return opt.text == value;})
        }
        get text() { // gets selected text
            return this._element.options[this.selectedIndex].text;
        }
        set options(value) {
            this._element.innerHTML = ""; // Clear existing options
            value.forEach((val) => {
                let item = null;
                if(val.hr) {
                    item = document.createElement("hr");
                }else if(val.options){
                    item = document.createElement("optgroup");
                    item.label = val.label;
                    val.options.forEach((option) => {
                        let opt = document.createElement("option");
                        opt.value = option.value;
                        opt.text = option.label;
                        if (option.selected) {
                            opt.selected = true;
                        }
                        item.appendChild(opt);
                    });
                }else{
                    item = document.createElement("option");
                    item.value = val.value;
                    item.text = val.label || val.value;
                    if (val.selected) {
                        item.selected = true;
                    }
                }
                this.addNativeElement(item); 
            });
            this._options = value;
        }
        get options() { //returns an array of objects with value and label properties
            return this._options;
        }
        get selectedIndex() {
            return this._element.selectedIndex;
        }
        set selectedIndex(value) {
            this._element.selectedIndex = value;
        }
        get selectedOptions() { // Returns an array of native selected options
            return [...this._element.selectedOptions];
        }
        set multiple(value) {
            this._element.multiple = value || false;
        }
        get multiple() {
            return this._element.multiple;
        }
        //example of options array
        /*[
            {value:1, label:"Option 1"}, // options
            {label:"Group 1", options:[{value:5, label:"Option 5", selected:true}, {value:6, label:"Option 6"}]}, // optgroup
            {hr:1} // horizontal rule
            ]
        */
    }
    class Breadcrumb extends gn.ui.container.Row {
        constructor() {
            super("gn-breadcrumb");
            this._model = null;
            this._history = [];// history of groups
            
            this._nextArrows = [];

            this._back = new gn.ui.basic.Icon(20, "fa-angle-left", ["fa-solid"]);
            this._back.addEventListener("click", this.onBackClick, this);
            this.add(this._back);
            this._topLevelName = new gn.ui.basic.Label("", "");
            this.add(this._topLevelName);

            /*let arr = new gn.ui.basic.Icon(20, "fa-angle-right", ["fa-solid"]);
            this._nextArrows.push(arr);
            arr.addEventListener("click", this._showArrowOptions, this);
            this.add(arr);*/
        }
        set model(value) {
            if (gn.lang.Var.isNull(value)) {
                throw new Error('Model cannot be null');
            }
            this._model = value;
        }
        get model() {
            return this._model;
        }
        set topLevelName(value) {
            this._topLevelName.text = value;
        }
        get topLevelName() {
            return this._topLevelName.text;
        }
        onBackClick() {
            this.sendEvent("back");
        }

    }

}