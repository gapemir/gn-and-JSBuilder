namespace gn.ui.control {
    class Button extends gn.ui.basic.Widget {
        constructor(classList, text, callback) {
            super(null, "button", classList);
            this.text = text;
            if(!gn.lang.Var.isNull(callback) && callback instanceof Function) {
                this.addEventListener("click", callback, this);
            }
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
            super(null, "select", classList);
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
        constructor(mode) {
            super("gn-breadcrumb");
            this._model = null;
            this._mode = mode || gn.ui.control.Breadcrumb.Type.history

            if(this._mode == gn.ui.control.Breadcrumb.Type.layer){
                this._makeUp()
            }else{
                this._makeBack();
                this._makeForward();
            }

            this._history = [null];// history of groups
            this._historyIdx = 0;

            this._widgets = new Map(); //idx -> {separator+name}
            this._activeWidgets = []; //elements that are shown

            this._currentIndex = null;

            this.up = null;
            this._topLevelName = new gn.ui.basic.Label("", "");
            this.add(this._topLevelName);
            this._rootSeparator = this._generateSeparator(null);
            this.add(this._rootSeparator);
        }
        triggered(idx){
            this.sendDataEvent("triggered", idx)
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
        setIndex(index) {
            this._setIndex(index)
        }
        _setIndex(index, ignoreHistory = false){
            if(index == this._currentIndex)
                return;
            if(this._mode == gn.ui.control.Breadcrumb.Type.history) {
                if(!ignoreHistory){
                    if(this._history.length >= this._historyIdx){
                        this._history = this._history.slice(0, this._historyIdx+1)
                    }
                    this._history.push(index)
                    this._historyIdx++;
                }
            }
            this._currentIndex = index;
            if(!this._widgets.has(this._currentIndex) && this._currentIndex != null){
                let tmp = {};
                tmp.separator = this._generateSeparator(this._currentIndex);
                tmp.label = new gn.ui.basic.Label(this.model.data(this._currentIndex));
                this._widgets.set(this._currentIndex, tmp);
            }
            this._openLabels()
        }
        _openLabels(){
            while( this._activeWidgets.length){
                this.remove(this._activeWidgets[0]);
                this._activeWidgets.shift();
            }
            this._addWidgets(this._currentIndex);
        }
        _addWidgets(idx){
            if(idx == null)
                return;
            let pidx = this._model.getParent(idx);
            if(pidx != null)
                this._addWidgets(pidx);
            
            this.add(this._widgets.get(idx).label);
            this._activeWidgets.push(this._widgets.get(idx).label);
            this.add(this._widgets.get(idx).separator);
            this._activeWidgets.push(this._widgets.get(idx).separator);
        }
        _makeUp(){
            this._up = new gn.ui.basic.Icon(20, "fa-angle-left", ["fa-solid"]);
            this._up.addEventListener("click", function(){
                if(this._currentIndex == null)
                    return;
                this._setIndex(this._model.getParent(this._currentIndex));
                this.triggered( this._currentIndex );
            }, this);
            this._up.tooltip = this.tr("UP");
            this.addBefore(this._up, this._topLevelName);
        }
        _makeBack(){
            this._back = new gn.ui.basic.Icon(20, "fa-angle-left", ["fa-solid"]);
            this._back.addEventListener("click", function(){
                if(this._historyIdx == 0)
                    return;
                this._setIndex(this._history[--this._historyIdx], true);
                this.triggered( this._currentIndex );
            }, this);
            this._back.tooltip = this.tr("BACK");
            this.addBefore(this._back, this._topLevelName);
        }
        _makeForward(){
            this._forw = new gn.ui.basic.Icon(20, "fa-angle-right", ["fa-solid"]);
            this._forw.addEventListener("click", function(){
                if(this._historyIdx +1 >= this._history.length)
                    return;
                this._setIndex( this._history[++this._historyIdx], true );
                this.triggered( this._currentIndex );
            }, this);
            this._forw.tooltip = this.tr("FORWARD");
            this.addBefore(this._forw, this._topLevelName);
        }
        _generateSeparator(idx){
            let sep = new gn.ui.basic.Icon(20, "fa-angle-right", ["fa-solid"]);
            sep.index = idx;
            sep.parent = this;
            sep.addEventListener("generateMenu", function(el){
                el._menu = new gn.ui.popup.Menu(el);
                el._menu.setStyle("min-width", "5rem");
                el._menu.setStyle("min-height", "1rem");
                let children = this.model.getChildren(idx);
                for (let i = 0; i < children.length; i++) {
                    let data = this.model.data(children[i], gn.model.DataType.all)
                    if(data.type == gn.model.Type.group){
                        let lab = new gn.ui.basic.Label(this.model.data(children[i]));
                        el._menu.add(lab);
                    }
                }
            }, this);
            sep.addEventListener("click", function(){
                if(!this.menu){
                    this.sendDataEvent("generateMenu", this);
                }
                this._menu.show();
            }, sep)
            return sep;
        }
    }
    Breadcrumb.Type = gn.lang.Enum({
        history : 1,
        layer : 2
    })

}