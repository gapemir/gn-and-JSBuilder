namespace gn.core {
    class Action extends gn.core.Object {
        constructor(id, label) {
            super();
            this._id;
            this._label = label;
            this._checkable = false;
            this._icon = null;

            this._enabled = true;
            this._hidden = false;
            this._toggleState = false;
            this._actions = [];
            // gn.locale.Manager.instance().addEventListener( "changeLocale", this._onChangeLocale, this );
        }
        
        destructor()
        {
            // oc.locale.Manager.instance().removeEventListener( "changeLocale", this._onChangeLocale, this );
        }

        set label(label) {
            this._label = label;
        }
        get label() {
            return this._label;
        }
        set enabled(enabled) {
            this._enabled = enabled;
        }
        get enabled() {
            return this._enabled;
        }
        set hidden(hidden) {
            this._hidden = hidden;
        }
        get hidden() {
            return this._hidden;
        }
        set checkable(value) {
            this._checkable = value;
        }
        get checkable() {
            return this._checkable;
        }
        set actions(value) {
            this._actions = value;
        }
        get actions() {
            return this._actions;
        }
        get hasSubActions() {
            return this._actions.length > 0;
        }
        get toggleState() {
            return this._toggleState;
        }
        set icon(icon) {
            this._icon = icon;
        }
        get icon() {
            return this._icon;
        }

        addAction(action) {
            this._actions.push(action);
            this.sendEvent("changed");
        }
        addActions(actions) {
            this._actions.concat(actions);
            this.sendEvent("changed");
        }

        toggle() {
            if(this._checkable) {
                this._toggleState = !this._toggleState;
                this.sendEvent("toggled", this._toggleState);
            }
        }

        trigger() {
            this.sendEvent("triggered");
        }

        _onChangeLocale() {
            console.log("TODO ACTION")
        }
    }
}