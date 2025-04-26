namespace gn.ui.control {
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