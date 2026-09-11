namespace gn.event {
    class Event {
        constructor(type, sender, data = null, bubbles = false) {
            this._type = type;
            this._sender = sender;
            this._originalSender = sender;
            this._data = data;
            this._timestamp = Date.now();
            this._bubbles = bubbles;
            this._stopPropagation = false;
        }
        get type() {
            return this._type;
        }
        get data() {
            return this._data;
        }
        get sender() {
            return this._sender;
        }
        set sender(sender) {
            this._sender = sender;
        }
        get originalSender() {
            return this._originalSender;
        }
        get bubbles() {
            return this._bubbles;
        }
        get timestamp() {
            return this._timestamp;
        }
        get stopPropagation() {
            return this._stopPropagation;
        }
        set stopPropagation(value) {
            this._stopPropagation = value;
        }
        copyFromNative(domEvent) {
            if( !domEvent ) return;
            const standardProps = [ "target", "currentTarget", "altKey", "ctrlKey", "shiftKey", "metaKey" ];
            for( const prop of standardProps ) {
                if( prop in domEvent ) {
                    this [ prop ] = domEvent [ prop ];
                }
            }
            for( const [ eventType, props ] of Object.entries( gn.event.Event.COPY_FROM_NATIVE ) ) {
                if( domEvent instanceof window [ eventType ] ) {
                    for( const prop of props ) {
                        if( prop in domEvent ) {
                            this [ prop ] = domEvent [ prop ];
                        }
                    }
                }
            }
        }
        set(obj) {
            if( obj && typeof obj === "object" ) {
                Object.assign( this, obj );
            }
        }
        clone() {
            const clone = new gn.event.Event( this._type, this._sender, this._data, this._bubbles );
            clone._timestamp = this._timestamp;
            clone._stopPropagation = this._stopPropagation;
            return clone;
        }
    }

    Event.COPY_FROM_NATIVE = {
        'MouseEvent': ['clientX', 'clientY', 'screenX', 'screenY', 'button', 'buttons'],
        'WheelEvent': ['deltaX', 'deltaY', 'deltaZ', 'deltaMode'],
        'KeyboardEvent': ['key', 'code', 'keyCode', 'which'],
        'TouchEvent': ['touches', 'targetTouches', 'changedTouches'],
        'FocusEvent': ['relatedTarget'],
        'DragEvent': ['dataTransfer']
    };
    class Emitter {
        constructor() {
            this._listeners = new Map(); // Map<objectId, Map<eventType, Set<listenerEntry>>>
            this._forwards = new Map(); // Map<forwardKey, listenerId>
            this._idCache = [];
            this._nextId = 0;
            this._managersSupportedTypes = new Set();
            this._bubblingStack = [];
        }
        static instance() {
            if(!gn.event.Emitter._instance) {
                gn.event.Emitter._instance = new gn.event.Emitter();
                gn.event.Emitter._instance.registerHandlers();
            }
            return gn.event.Emitter._instance;
        }
        registerHandlers() {
            new gn.event.manager.PointerManager();
            new gn.event.manager.InputManager();
            new gn.event.manager.FocusManager();
            new gn.event.manager.DragManager();
            new gn.event.manager.WheelManager();
            new gn.event.manager.MobileScrollManager();
        }
        addManager(manager) {
            for( const type of manager.internalEvents ) {
                this._managersSupportedTypes.add( type );
            }
        }
        addEventListener( object, type, listener, context ) {
            if (gn.lang.Var.isString(object)) {
                return this.addEventListener( this, object, type, listener );
            }
            if( typeof listener !== 'function' ) {
                throw new TypeError( `Listener for event "${type}" must be a function` );
            }
            if(object.disposed) {
                throw new TypeError("Trying to add lisner to disposed object")
            }

            const internalId = gn.core.Object.getInternalId( object );
            if( !this._listeners.has(internalId)) {
                this._listeners.set(internalId, new Map());
            }

            const objectEvents = this._listeners.get(internalId);
            if(!objectEvents.has(type)) {
                objectEvents.set(type, new Set());
            }

            const eventListeners = objectEvents.get(type);

            for (const existing of eventListeners) {
                if (existing.listener === listener && existing.context === context) {
                    return existing.id;
                }
            }

            const entry = { listener, context, id: this._getNextId() };
            eventListeners.add(entry);

            if (this._managersSupportedTypes.has(type)) {
                if (type.startsWith('focus') && object.focusable === undefined) {
                    object.focusable = -1;
                }
            }
            return entry.id;
        }

        removeEventListener(object, type, listener, context) {
            if (gn.lang.Var.isString(object)) {
                return this.removeEventListener(this, object, type, listener);
            }

            const internalId = gn.core.Object.getInternalId(object);
            const objectEvents = this._listeners.get(internalId);

            if (!objectEvents || !objectEvents.has(type)) {
                return false;
            }

            const eventListeners = objectEvents.get(type);
            for (const entry of eventListeners) {
                if (entry.listener === listener && entry.context === context) {
                    eventListeners.delete(entry);
                    this._idCache.push(entry.id);

                    if (eventListeners.size === 0) {
                        objectEvents.delete(type);
                        if (objectEvents.size === 0) {
                            this._listeners.delete(internalId);
                        }
                    }
                    return true;
                }
            }
            return false;
        }

        removeEventListenerById(object, id, type) {
            if (gn.lang.Var.isString(object)) {
                return this.removeEventListenerById(this, object, id);
            }

            const internalId = gn.core.Object.getInternalId(object);
            const objectEvents = this._listeners.get(internalId);

            if (!objectEvents) {
                return false;
            }

            const typesToCheck = type ? [type] : Array.from(objectEvents.keys());

            for (const t of typesToCheck) {
                const eventListeners = objectEvents.get(t);
                if (!eventListeners) {
                    continue;
                }

                for (const entry of eventListeners) {
                    if (entry.id === id) {
                        eventListeners.delete(entry);
                        this._idCache.push(id);

                        if (eventListeners.size === 0) {
                            objectEvents.delete(t);
                            if (objectEvents.size === 0) {
                                this._listeners.delete(internalId);
                            }
                        }
                        return true;
                    }
                }
            }
            return false;
        }

        sendEvent(object, type, data, bubbles = false) {
            if (gn.lang.Var.isString(object)) {
                return this.sendEvent(this, object, type);
            }

            const event = new gn.event.Event(type, object, data, bubbles);
            this.dispatchEvent(event);
        }

        dispatchEvent(event) {
            if (!event || !event.sender) return;

            this._bubblingStack.length = 0;

            let current = event.sender;
            while (current) {
                this._bubblingStack.push(current);
                if (!event.bubbles) break;
                current = current.layoutParent || null;
            }

            if (event.bubbles) {
                for (let i = 0; i < this._bubblingStack.length; i++) {
                    const target = this._bubblingStack[i];
                    event.sender = target;
                    this._dispatchToTarget(target, event);

                    if (event.stopPropagation) {
                        break;
                    }
                }
            } else {
                this._dispatchToTarget(event.sender, event);
            }
        }

        _dispatchToTarget(target, event) {
            const internalId = gn.core.Object.getInternalId(target);
            const objectEvents = this._listeners.get(internalId);

            if (!objectEvents) return;

            const listeners = objectEvents.get(event.type);
            if (!listeners || listeners.size === 0) return;

            const listenersArray = Array.from(listeners);

            for (const entry of listenersArray) {
                if (!listeners.has(entry)) continue;

                try {
                    entry.listener.call(entry.context || target, event);
                } catch (error) {
                    console.error(`Error in event listener for ${event.type}:`, error);
                }
            }

            if (listeners.size === 0) {
                objectEvents.delete(event.type);
                if (objectEvents.size === 0) {
                    this._listeners.delete(internalId);
                }
            }
        }

        hasListeners(object, type) {
            if (gn.lang.Var.isString(object)) {
                return this.hasListeners(this, object);
            }

            const internalId = gn.core.Object.getInternalId(object);
            const objectEvents = this._listeners.get(internalId);

            if (!objectEvents) {
                return false;
            }

            const listeners = objectEvents.get(type);
            return listeners ? listeners.size > 0 : false;
        }

        getListenerCount(object, type) {
            if (!this.hasListeners(object, type)) {
                return 0;
            }

            const internalId = gn.core.Object.getInternalId(object);
            return this._listeners.get(internalId).get(type).size;
        }

        removeAllEventListeners(object) {
            if (gn.lang.Var.isString(object)) {
                return this.removeAllEventListeners(this, object);
            }

            const internalId = gn.core.Object.getInternalId(object);
            const removed = this._listeners.delete(internalId);

            for (const [key, id] of this._forwards) {
                if (key.startsWith(internalId + '|')) {
                    this._forwards.delete(key);
                    this._idCache.push(id);
                }
            }

            return removed;
        }

        forwardEvent(source, type, target) {
            if (gn.lang.Var.isString(source)) {
                return this.forwardEvent(this, source, type);
            }

            const id = source.addEventListener(type, function (event) {
                const clonedEvent = event.clone();
                clonedEvent._sender = target;
                target.sendEvent(clonedEvent.type, clonedEvent.data, clonedEvent.bubbles);
            }, target);

            const key = `${source.internalId}|${type}|${target.internalId}`;
            this._forwards.set(key, id);

            return true;
        }

        stopForwardEvent(source, type, target) {
            if (gn.lang.Var.isString(source)) {
                return this.stopForwardEvent(this, source, type);
            }

            const key = `${source.internalId}|${type}|${target.internalId}`;
            const id = this._forwards.get(key);

            if (!id) {
                return false;
            }

            this._forwards.delete(key);
            return this.removeEventListenerById(source, id, type);
        }
        _getNextId() {
            return this._idCache.length ? this._idCache.pop() : ( this._nextId++ ).toString();
        }
        dumpListeners() {
            const dump = {};
            for ( const [ objId, events ] of this._listeners ) {
                dump[ objId ] = {};
                for ( const [ type, listeners ] of events ) {
                    dump[ objId ][ type ] = listeners.size;
                }
            }
            return dump;
        }

        static static() {
            gn.event.Emitter.instance(); // inits event system
        }
    }

    class Timer extends gn.core.Object {
        constructor(interval) {
            super();
            this._enabled = false;
            this._interval = interval || 1000;
            this._singleShot = false;
            this._intervalId = null;
            this._boundTimeout = this._timeout.bind(this);
        }

        _destructor() {
            this.stop();
        }
        get enabled() { 
            return this._enabled; 
        }
        set enabled(value) {
            if (this._enabled === value) {
                return;
            }
            if (value) {
                this._start();
            } else {
                this._stop();
            }
        }
        get interval() { 
            return this._interval; 
        }
        set interval(value) {
            if (this._interval !== value) {
                this._interval = Math.max(1, value);
                if (this._enabled) {
                    this.restart();
                }
            }
        }
        get singleShot() { 
            return this._singleShot; 
        }
        set singleShot(value) { 
            this._singleShot = value; 
        }
        _start() {
            if (this._intervalId) {
                this._stop();
            }
            this._intervalId = window.setInterval(this._boundTimeout, this._interval);
            this._enabled = true;
        }
        _stop() {
            if (this._intervalId) {
                window.clearInterval(this._intervalId);
                this._intervalId = null;
            }
            this._enabled = false;
        }
        start(interval = null) {
            if (interval !== null) {
                this.interval = interval;
            }
            this.enabled = true;
        }
        restart() {
            if (this._enabled) {
                this._stop();
            }
            this._start();
        }
        stop() {
            this.enabled = false;
        }
        _timeout() {
            if (!this._enabled) {
                return;
            }

            this.sendEvent('timeout');

            if (this._singleShot) {
                this.stop();
            }
        }
        static singleShot(obj, func, timeout = 0) {
            if (typeof func !== 'function') {
                throw new TypeError('Must be a function');
            }

            return setTimeout(() => {
                if (obj && !obj._disposed) {
                    func.call(obj);
                }
            }, timeout);
        }
    }
    Emitter._instance = null;
}