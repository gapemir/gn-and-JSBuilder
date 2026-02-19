namespace gn.core {
    class Object {
        constructor() {
            this._internalId = this.internalId;
            this._disposed = false;
            //gn.core.Object._ObjectMap.set(this._internalId, new WeakRef(this));  //this will correctly handle garbage collection but it requires larger starting memory, also need to run cleanAfterGC periodicly to clean empty WeakRefs
            gn.core.Object._ObjectMap.set(this._internalId, this);
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
        }
        
        static tr(messageId, count) {
            return new gn.locale.LocaleString(messageId, messageId, count);
        }
        
        dispose() {
            if (this._disposed) {
                return;
            }
            gn.event.Emitter.instance().removeAllEventListeners(this);
            this._destructor();
            gn.core.Object._ObjectMap.delete(this._internalId);
            gn.core.Object._idCache.push(this._internalId);
            this._disposed = true;
        }
        
        addEventListener(type, callback, thisObj) {
            return gn.event.Emitter.instance().addEventListener(this, type, callback, thisObj);
        }
        
        removeEventListener(type, callback, thisObj) {
            return gn.event.Emitter.instance().removeEventListener(this, type, callback, thisObj);
        }
        
        removeEventListenerById(id, type) {
            return gn.event.Emitter.instance().removeEventListenerById(this, id, type);
        }
        
        sendEvent(type, data, bubbles = false) {
            gn.event.Emitter.instance().sendEvent(this, type, data, bubbles);
        }
        
        forwardEvent(type, object) {
            return gn.event.Emitter.instance().forwardEvent(this, type, object);
        }
        
        stopForwardEvent(type, object) {
            return gn.event.Emitter.instance().stopForwardEvent(this, type, object);
        }
        
        hasListeners(type) {
            return gn.event.Emitter.instance().hasListeners(this, type);
        }
        
        static getInternalId(obj) {
            if (obj == null) {
                return null;
            }
            if (obj._internalId) {
                return obj._internalId;
            }
            const id = gn.core.Object._idCache.length > 0 ? gn.core.Object._idCache.pop() : (gn.core.Object._nextId++).toString();
            
            obj._internalId = id;
            return id;
        }
        
        static getObjectById(id) {
            if (!id) {
                return null;
            }
            const cleanId = id.replace(/^gn_/, '');
            return gn.core.Object._ObjectMap.get(cleanId) || null;
        }
        
        static getObjectCount() {
            return gn.core.Object._ObjectMap.size;
        }
    }

    Object._idCache = [];
    Object._nextId = 0;
    Object._ObjectMap = new Map(); // todo this is not ok, wee need weakref but then we need to manualy run cleanAfterGC so it destroys empty WeakRefs
    //TODO make a function in class that if present JSBuilder will put it after all other code so we have timer defined
}