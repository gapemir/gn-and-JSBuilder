namespace gn.ui.control {
    class Button extends gn.ui.basic.Widget {
        constructor(text, classList, callback, context) {
            super(null, "button", classList );
            this.addClass("gn-button");
            this._text = "";
            this.text = text;
            if(!gn.lang.Var.isNull(callback) && callback instanceof Function) {
                this.addEventListener("click", callback, context || this );
            }
        }
        _destructor() {
            if(this._text instanceof gn.locale.LocaleString) {
                gn.locale.LocaleManager.instance().removeEventListener("changeLocale", this._onLocaleChanged, this);
            }
        }
        set text(value) {
            this._text = value;
            this._element.innerText = this._text;

            if(this._text instanceof gn.locale.LocaleString) {
                gn.locale.LocaleManager.instance().addEventListener("changeLocale", this._onLocaleChanged, this);
            }
        }
        get text() {
            return this._element.innerText;
        }
        set disabled(value) {
            this._element.disabled = value;
        }
        get disabled() {
            return this._element.disabled;
        }
        set type(value) {
            if( !["submit", "reset", "button"].includes(value) ) return
            this._element.type = value;
        }
        get type(){
            return this._element.type;
        }
        _onLocaleChanged(){
            if(this._text instanceof gn.locale.LocaleString) {
                this.text = this._text.translate();
            }
        }
    }
    class Breadcrumb extends gn.ui.container.Row {
        constructor(mode) {
            super("gn-breadcrumb");
            this._model = null;
            this._mode = mode || gn.ui.control.Breadcrumb.Type.history

            this._history = [null];// history of groups
            this._historyIdx = 0;

            this._widgets = new Map(); //idx -> {separator+name}
            this._activeWidgets = []; //elements that are shown

            this._currentIndex = null;

            this.up = null;
            this._topLevelName = new gn.ui.basic.Label();
            this._topLevelName.setStyle("cursor", "pointer");
            this._topLevelName.addEventListener("click", function(){
                this._setIndex(null);
                this.triggered(null);
            }, this);
            this.add(this._topLevelName);
            this._rootSeparator = this._generateSeparator(null);
            this.add(this._rootSeparator);

            if(this._mode == gn.ui.control.Breadcrumb.Type.layer) {
                this._makeUp()
            } else {
                this._makeBack();
                this._makeForward();
            }

        }
        triggered(idx){
            this.sendEvent("triggered", idx)
        }
        set model(value) { // TODO addd event listeners at least "reset" and maybe "decorationChanged"
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
                tmp.label.setStyle("cursor", "pointer");
                var index = this._currentIndex;
                tmp.label.addEventListener("click", function(){
                    this._setIndex(index);
                    this.triggered(index);
                }, this);
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
            let pidx = this._model.parent(idx);
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
                this._setIndex(this._model.parent(this._currentIndex));
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
            sep.addEventListener("generateMenu", function(e){
                let el = e.data;
                el._menu = new gn.ui.control.Menu(el, true);
                el._menu.setStyle("min-width", "5rem");
                el._menu.setStyle("min-height", "1rem");
                let children = this._model.children(idx);
                if(children) {
                    for (let i = 0; i < children.length; i++) {
                        let data = this._model.data(children[i], gn.model.Model.DataType.all)
                        if(data.type == gn.model.Model.Type.group) {
                            let action = new gn.core.Action(data.name, data.name);
                            action.addEventListener("triggered", function() {
                                this._setIndex(children[i]);
                                this.triggered( children[i] );
                            }, this);
                            el._menu.addAction(action)
                        }
                    }
                }
            }, this);
            sep.addEventListener("click", function(){
                if(!this._menu){
                    this.sendEvent("generateMenu", this);
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
    class Menu extends gn.ui.popup.PopupBase {
        constructor(menuParent, closeOnSelected = false, bParentWide = false) {
            super("gn-popup-menu", true, true);
            this._items = []; // gn.ui.control.MenuItems
            this._menuParent = menuParent; // we need parent in order to position the menu correctly
            this._selected = [];
            this._bParentWide = bParentWide; // if true menu will be as wide as parent
            this._closeOnSelected = closeOnSelected;
            this._actions = []; // gn.core.Actions
            this._constructed = false;
        }
        set actions(actions) {
            this._actions = actions;
            if(this._constructed) {
                this._reconstruct();
            }
        }
        addAction(action) {
            this._actions.push(action);
            if(this._constructed) {
                this._reconstruct();
            }
        }
        show() {
            this._construct();
            super.show();
            let rect = this._menuParent.rect;
            let trect = this.rect;
            this.setStyle("top", rect.bottom + "px");
            if (this._bParentWide) {
                this.setStyle("left", rect.left + "px");
                this.setStyle("width", rect.width + "px");
            } else {
                this.setStyle("left", rect.right - trect.width + "px");
            }
        }
        hide() {
            if(!this._isShown) {
                return;
            }
            this.sendEvent("aboutToHide");
            super.hide();
            if(this._menuParent instanceof gn.ui.control.Menu) {
                this._menuParent.hide();
            }
        }
        _reconstruct() {
            this._items.forEach(item => {
                item.dispose();
            });
            this._items = [];
            this._construct;
        }
        _construct() {
            if(this._constructed){
                return;
            }
            for( let i = 0; i < this._actions.length; i++ ) {
                let action = this._actions[i];
                let item = new gn.ui.control.MenuItem(this, action);
                item.addEventListener("click", this._handleClick, this);
                this.add(item);
            }
            this._constructed = true;
        }
        _handleClick(e) {
            let item = e.sender;
            if(!item.action.enabled) {
                return;
            }
            if ( item.action.hasSubActions ) {
                if ( this._childMenu && !this._childMenu.isDisposed ) {
                    this._childMenu.dispose();
                    this._childMenu = null;
                }
                this._childMenu = new gn.ui.control.Menu(this, this._closeOnSelected, this._bParentWide);
                this._childMenu.actions = item.action.actions;
                this._childMenu.position = "right-top";
                this._childMenu.show();
                this._childMenu.addEventListener( "triggered", this._handleMenuTriggered, this );
            }
            else {
                if (item.action.checkable) {
                    item.action.toggle();
                    item.checkbox.value = item.action.toggleState;
                }
                else {
                    item.action.trigger();
                }
                this.sendEvent("triggered", item.action);
                if ( this._closeOnSelected && !item.action.checkable ) { // TODO should this be controlled by action like final keyword
                    this.hide();
                }
            }
        }
        _handleMenuTriggered(e) {
            this.sendEvent("triggered", e.data);
            if(this._closeOnSelected && !e.data.checkable) {
                this.hide();
            }
        }
        _destructor() {
            while(this._children.length) {
                this._children[0].dispose();
            }
        }
    }
    class MenuItem extends gn.ui.container.Row {
        constructor(menu, action) {
            super("gn-popup-menu-item");
            this._menu = menu;
            this._action = action;
            this._checkbox = null;
            if(this._action.icon) {
                this.add(this._action.icon);
            }
            if(this._action.checkable) {
                this._checkbox = new gn.ui.input.CheckBox();
                this.add(this._checkbox);
            }
            this._label = new gn.ui.basic.Label(action.label);
            this.add(this._label);
            if(!this._action.enabled) {
                this.addClass("gn-disabled")
            }
        }
        get action() {
            return this._action;
        }
        set label(label) {
            this._label = label;
        }
        get label() {
            return this._label;
        }
        get checkbox() {
            return this._checkbox;
        }
    }
}