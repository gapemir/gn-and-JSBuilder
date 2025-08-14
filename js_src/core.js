namespace gn.core {
    class Object {
        constructor() {
            //in gn.ui.basic.widget there is property _layoutParent for ui parent
            this._internalId = this.internalId;
        }

        _destructor() {
        }

        get internalId() {
            if (!this._internalId) {
                this._internalId = gn.core.Object.getInternalId(this);
            }
            return this._internalId;
        }

        tr(messageId, count) {
            return new gn.locale.LocaleString(messageId, messageId, count);
            return text.toLowerCase();
        }

        static tr(messageId, count) {
            return new gn.locale.LocaleString(messageId, messageId, count);
            return text.toLowerCase();
        }

        dispose() {
            gn.event.Emitter.instance().removeAllEventListeners(this);
            this._destructor();
            gn.core.Object._idCache.push(gn.core.Object.getInternalId(this))
            this._disposed = true;
            // we hope js garbage collector does its job
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
    Object._idCache = [];
    Object._nextId = 0;
}