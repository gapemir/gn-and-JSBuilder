namespace gn.core {
    class Object {
        constructor(parent) {
            this._parent = parent//topology parent, can be null
            //in gn.ui.basic.widget there is property _domParent for ui parent
            this._internalId = this.internalId;
        }

        _destructor() {
        }

        set parent(parent) {
            this._parent = parent
        }

        get parent() {
            return this._parent
        }

        get internalId() {
            if (!this._internalId) {
                this._internalId = gn.core.Object.getInternalId(this);
            }
            return this._internalId;
        }

        tr(text, ...extra) {
            return text;
        }

        dispose() {
            gn.event.Emitter.instance().removeAllEventListeners(this);
            //remove it from dom
            gn.core.Object._idCache.push(gn.core.Object.getInternalId(this))
            this._destructor();
            delete this;
        }

        addEventListener(type, callback, thisObj) {
            gn.event.Emitter.instance().addEventListener(this, type, callback, thisObj);
        }

        removeEventListener(type, callback, thisObj) {
            gn.event.Emitter.instance().removeEventListener(this, type, callback, thisObj);
        }

        sendEvent(type) {
            gn.event.Emitter.instance().sendEvent(this, type);
        }

        sendDataEvent(type, data) {
            gn.event.Emitter.instance().sendDataEvent(this, type, data);
        }

        static getInternalId(obj) {
            var id = obj._internalId;
            if (id != null && id != undefined) return id;
            if (gn.core.Object._idCache.length > 0) {
                id = gn.core.Object._idCache.pop();
            } else {
                id = gn.core.Object._nextId++ + "";
            }
            return obj._internalId = id;
        }
    }

    gn.core.Object._idCache = [];
    gn.core.Object._nextId = 0;
}