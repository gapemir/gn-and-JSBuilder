namespace gn.event {
    class Emitter {
        //TODO add bubble support, so that events can bubble up the object hierarchy
        //TODO add support for event propagation, so that events can be stopped from propagating
        constructor() {
            this._listeners = new Map(); // Use a Map to store listeners
            this._instance = null; // Singleton instance
        }
        static instance(){
            if(!this._instance){
                this._instance = new gn.event.Emitter();
                window.addEventListener("resize", function(){this.sendEvent("windowResized")}.bind(this._instance));
            }
            return this._instance;
        }
        addEventListener(object, eventName, listener, context) {
            if( gn.lang.Var.isString(object) && gn.lang.Var.isFunction(eventName) ){
                return this.addEventListener(this, object, eventName, listener);
            }
            let internalId = gn.core.Object.getInternalId(object);
            if (typeof listener !== 'function') {
                throw(new TypeError(`Listener for event "${eventName}" on object must be a function.`));
            }
            if (!this._listeners.has(internalId)) {
                this._listeners.set(internalId, new Map()); // Map: event -> Array<{...}>
            }
            const objectEvents = this._listeners.get(internalId);

            if (!objectEvents.has(eventName)) {
                objectEvents.set(eventName, []);
            }
            const eventListeners = objectEvents.get(eventName);
            const listenerEntry = { listener: listener, context: context };

            // Add the listener entry if a matching listener+context is not already present
            // Note: This check requires iterating, can be optimized for very frequent adds
            const exists = eventListeners.some(entry => entry.listener === listener && entry.context === context);
            if (!exists) {
                eventListeners.push(listenerEntry);
            }
        }
        removeEventListener(object, eventName, listener, context) {
                if( gn.lang.Var.isString(object) && gn.lang.Var.isFunction(eventName) ){
                return this.removeEventListener(this, object, eventName, listener);
            }
            let internalId = gn.core.Object.getInternalId(object);
            const objectEvents = this._listeners.get(internalId);
            if (!objectEvents || !objectEvents.get(eventName)) {
                return;
            }
            const filteredListeners = objectEvents.get(eventName).filter(
                (entry) => !(entry.listener === listener && entry.context === context)
            );

            if (filteredListeners.length === 0) {
                objectEvents.delete(eventName);
                if (objectEvents.size === 0) {
                    this._listeners.delete(internalId);
                }
            } else {
                objectEvents.set(eventName, filteredListeners);
            }
        }
        sendEvent(object, eventName) {
            if( gn.lang.Var.isString(object) ){
                return this.sendEvent(this, object);
            }
            let internalId = gn.core.Object.getInternalId(object);
            const objectEvents = this._listeners.get(internalId);
            if (!objectEvents || !objectEvents.get(eventName)) {
                return;
            }
            const listenersToExecute = [...objectEvents.get(eventName)];

            listenersToExecute.forEach((entry) => {
                try {
                    //should pass new object gn.event.Event that has some unique id, sender, receiver, timestamp,...
                    entry.listener.call(entry.context);
                } catch (error) {
                    console.error(`Error executing listener for event "${eventName}" on object:`, object, error);
                    console.error(`Listener:`, entry.listener);
                    console.error(`Context:`, entry.context);
                }
            });
        }
        sendDataEvent(object, eventName, data) {
            if( gn.lang.Var.isString(object) ){
                return this.sendEvent(this, object, data);
            }
            let internalId = gn.core.Object.getInternalId(object);
            const objectEvents = this._listeners.get(internalId);
            if (!objectEvents || !objectEvents.get(eventName)) {
                return;
            }
            const listenersToExecute = [...objectEvents.get(eventName)];

            listenersToExecute.forEach((entry) => {
                try {
                    //should pass new object gn.event.Event that has some unique id, sender, receiver, timestamp,...
                    entry.listener.call(entry.context, data);
                } catch (error) {
                    console.error(`Error executing listener for event "${eventName}" on object:`, object, error);
                    console.error(`Listener:`, entry.listener);
                    console.error(`Context:`, entry.context);
                }
            });
        }
        hasListeners(object, eventName) {
            if( gn.lang.Var.isString(object) && gn.lang.Var.isFunction(eventName) ){
                return this.hasListeners(this, object);
            }
            let internalId = gn.core.Object.getInternalId(object);
            const objectEvents = this._listeners.get(internalId);
            if (!objectEvents) {
                return false;
            }
            const eventListeners = objectEvents.get(eventName);
            return eventListeners ? eventListeners.length > 0 : false;
        }
        removeAllEventListeners(object = this){
            let internalId = gn.core.Object.getInternalId(object);
            if (!this._listeners.has(internalId)) {
                return
            }
            this._listeners.delete(internalId);
            //TODO we should check if removed object is saved somewhere in the context
        }
    }
}