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
            return gn.event.Emitter.instance().addEventListener(this, type, callback, thisObj);
        }

        removeEventListener(type, callback, thisObj) {
            return gn.event.Emitter.instance().removeEventListener(this, type, callback, thisObj);
        }

        removeEventListenerById( id, type ) { // type is optional but faster
            return gn.event.Emitter.instance().removeEventListenerById(this, id, type);
        }

        sendEvent( type, data ) { // type must be alphanumerical and _, otherwise it may break system, espetialy "|""
            gn.event.Emitter.instance().sendEvent( this, type, data );
        }

        forwardEvent( type, object ) {
            return gn.event.Emitter.instance().forwardEvent(this, type, object);
        }

        stopForwardEvent( type, object ) {
            return gn.event.Emitter.instance().stopForwardEvent(this, type, object);
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