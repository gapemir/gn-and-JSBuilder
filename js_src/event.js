namespace gn.event {
    class Event {
        constructor(type, sender, data = null, bubbles = false) {
            this._type = type;
            this._sender = sender;
            this._data = data;
            this._timestamp = Date.now();
            this._bubbles = bubbles;
            this._stop = false;
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
        get bubbles() {
            return this._bubbles;
        }
        get timestamp() {
            return this._timestamp;
        }
        get stop() {
            return this._stop;
        }
        stop() {
            this._stop = true;
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
            clone._stop = this._stop;
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
            this._managers = new Map();
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
            new gn.event.FocusManager();
            new gn.event.DragManager();
            new gn.event.ClickManager();
            new gn.event.TouchManager({
                tap: 'click',
                doubleTap: 'dblclick',
                longTap: 'contextmenu'
            });
            new gn.event.InputManager();
            new gn.event.WheelManager();
        }
        addManager(manager) {
            for( const type of manager.internalEvents ) {
                this._managersSupportedTypes.add( type );
                this._managers.set( type, manager );
            }
        }
        addEventListener( object, type, listener, context ) {
            if (gn.lang.Var.isString(object)) {
                return this.addEventListener( this, object, type, listener );
            }
            if( typeof listener !== 'function' ) {
                throw new TypeError( `Listener for event "${type}" must be a function` );
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
                    this._dispatchToTarget(target, event);

                    if (event.propagationStopped) {
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

                if (event.immediatePropagationStopped) {
                    break;
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
    }

    class Timer extends gn.core.Object {
        constructor(interval, callback = null) {
            super();
            this._enabled = false;
            this._interval = interval || 1000;
            this._singleShot = false;
            this._intervalId = null;
            this._boundTimeout = callback ? callback.bind(this) : this._timeout.bind(this);
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
                this._start();
            }
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
        static interval(obj, func, interval) {
            if (typeof func !== 'function') {
                throw new TypeError('Must be a function');
            }

            return setInterval(() => {
                if (obj && !obj._disposed) {
                    func.call(obj);
                }
            }, interval);
        }
    }
    Emitter._instance = null;

    class AbstractManager {
        constructor() {
            this._onEventBind = this._onEvent.bind(this);
            this._initObserver();
            gn.event.Emitter.instance().addManager(this);
        }
        get supportedEvents() { 
            throw new Error('Abstract property supportedEvents must be implemented');
        }
        get internalEvents() {  
            throw new Error('Abstract property internalEvents must be implemented');
        }
        _initObserver() {
            for( const type of this.supportedEvents ) {
                document.addEventListener(type, this._onEventBind, true);
            }
        }
        _exitObserver() {
            for( const type of this.supportedEvents ) {
                document.removeEventListener(type, this._onEventBind);
            }
            this._onEventBind = null;
        }
        _sendEvent(object, type, domEvent, data = null, bubbles = true) {
            if (!object) {
                return;
            }
            // still need this to be comented as we dont have all managers yet but we should not use events on native elements
            // domEvent.stopPropagation();
            // domEvent.preventDefault();

            const event = new gn.event.Event(type, object, data, bubbles);
            event.copyFromNative(domEvent);

            // event.setStopCB = function(){
            //     domEvent.stopPropagation();
            //     domEvent.preventDefault();
            // }

            gn.event.Emitter.instance().dispatchEvent(event);
        }
        _onEvent(domEvent) {
            throw new Error('Abstract method _onEvent must be implemented');
        }
        destroy() {
            this._exitObserver();
        }
    }
    class ClickManager extends gn.event.AbstractManager {
        constructor() {
            super();
            this._lastPointerDown = null;
            this._clickPrevented = false;
        }

        get supportedEvents() {
            return ['click', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'dblclick', 'contextmenu'];
        }

        get internalEvents() {
            return this.supportedEvents;
        }

        _onEvent(domEvent) {
            const type = domEvent.type;
            console.log(type)
            const targetObj = domEvent.target ? gn.core.Object.getObjectById(domEvent.target.id) : null;

            if (!targetObj) {
                return;
            }
            if (type === 'click' && this._clickPrevented) {
                domEvent.preventDefault();
                domEvent.stopPropagation();
                return;
            }

            if (type === 'mousedown') {
                this._lastPointerDown = {
                    target: domEvent.target.id,
                    time: Date.now(),
                    x: domEvent.clientX,
                    y: domEvent.clientY,
                };
                this._clickPrevented = false;
            }

            if (type === 'mouseup' && this._lastPointerDown) {
                const dx = Math.abs(domEvent.clientX - this._lastPointerDown.x);
                const dy = Math.abs(domEvent.clientY - this._lastPointerDown.y);
                const timeDiff = Date.now() - this._lastPointerDown.time;

                if (dx > 10 || dy > 10 || timeDiff > 500) {
                    this._clickPrevented = true;
                }
            }

            this._sendEvent(targetObj, type, domEvent, null, true);
        }
    }
    class DragManager extends gn.event.AbstractManager {
        constructor() {
            super();
            this._dragActive = false;
            this._dragStartThreshold = 5;
            this._dragStartPos = null;
            this._dragTarget = null;
            this._dragTargetObj = null;
            this._dragStarted = false; // Track if threshold was crossed
        }
        
        get supportedEvents() {
            return ["mousedown", /*"mousemove", */"mouseup"/*, "mouseleave"*/];
        }
        
        get internalEvents() {
            return ["drag", "dragstart", "dragend"];
        }

        _initMoveObserver() {
            document.addEventListener("mousemove", this._onEventBind);
        }

        _exitMoveObserver() {
            document.removeEventListener("mousemove", this._onEventBind);
        }
        
        _onEvent(domEvent) {
            const type = domEvent.type;
            const targetObj = domEvent.target ? gn.core.Object.getObjectById(domEvent.target.id) : null;

            if (type === "mousedown") {
                this._handleMouseDown(domEvent, targetObj);
            }
            else if (type === "mousemove" && this._dragActive) {
                this._handleMouseMove(domEvent);
            }
            else if (type === "mouseup" && this._dragActive) {
                this._handleMouseUp(domEvent);
            }
            else if (type === "mouseleave" && this._dragActive) {
                // this._endDrag(domEvent);
            }
        }
        
        _handleMouseDown(domEvent, targetObj) {
            if (!targetObj) return;
            domEvent.preventDefault();
            
            this._dragActive = true;
            this._dragTarget = domEvent.target;
            this._dragTargetObj = targetObj;
            this._dragStarted = false;
            this._dragStartPos = {
                x: domEvent.clientX,
                y: domEvent.clientY,
                targetX: 0,
                targetY: 0,
            };
            
            if (targetObj.x !== undefined && targetObj.y !== undefined) {
                this._dragStartPos.targetX = targetObj.x;
                this._dragStartPos.targetY = targetObj.y;
            }
            this._initMoveObserver();
        }
        
        _handleMouseMove(domEvent) {
            if (!this._dragStartPos) return;
            
            const dx = Math.abs(domEvent.clientX - this._dragStartPos.x);
            const dy = Math.abs(domEvent.clientY - this._dragStartPos.y);
            
            if (!this._dragStarted) {
                if (dx >= this._dragStartThreshold || dy >= this._dragStartThreshold) {
                    this._startDrag(domEvent);
                }
                return;
            }
            
            if (this._dragTargetObj) {
                const deltaX = domEvent.clientX - this._dragStartPos.x;
                const deltaY = domEvent.clientY - this._dragStartPos.y;
                
                const dragData = {
                    deltaX: deltaX,
                    deltaY: deltaY,
                    startX: this._dragStartPos.x,
                    startY: this._dragStartPos.y,
                    currentX: domEvent.clientX,
                    currentY: domEvent.clientY,
                    target: this._dragTarget,
                    originalEvent: domEvent,
                };
                this._sendEvent(this._dragTargetObj, "drag", domEvent, dragData);
            }
        }
        
        _startDrag(domEvent) {
            this._dragStarted = true;
            
            if (this._dragTargetObj) {
                const dragData = {
                    startX: this._dragStartPos.x,
                    startY: this._dragStartPos.y,
                    target: this._dragTarget,
                    targetStartX: this._dragStartPos.targetX,
                    targetStartY: this._dragStartPos.targetY,
                    originalEvent: domEvent,
                };
                this._sendEvent(this._dragTargetObj, "dragstart", domEvent, dragData);
            }
        }
        
        _handleMouseUp(domEvent) {
            this._endDrag(domEvent);
            this._exitMoveObserver();
        }
        
        _endDrag(domEvent) {
            if (this._dragStarted && this._dragTargetObj) {
                const dragData = {
                    startX: this._dragStartPos?.x,
                    startY: this._dragStartPos?.y,
                    endX: domEvent.clientX,
                    endY: domEvent.clientY,
                    target: this._dragTarget,
                    originalEvent: domEvent,
                };
                this._sendEvent(this._dragTargetObj, "dragend", domEvent, dragData);
            }
            this._dragActive = false;
            this._dragStarted = false;
            this._dragStartPos = null;
            this._dragTarget = null;
            this._dragTargetObj = null;
        }
    
        destroy() {
            if (this._dragActive) {
                this._endDrag(null);
            }
            super.destroy();
        }
    }
    class FocusManager extends gn.event.AbstractManager {
        constructor() {
            super();
            this._currentFocused = null;
            this._focusStack = [];
        }

        get supportedEvents() {
            return ['focusin', 'focusout'];
        }

        get internalEvents() {
            return ['focus', 'blur', 'focusin', 'focusout'];
        }

        _onEvent(domEvent) {
            const type = domEvent.type;
            const targetObj = domEvent.target ? gn.core.Object.getObjectById(domEvent.target.id) : null;
            const relatedTargetObj = domEvent.relatedTarget ? gn.core.Object.getObjectById(domEvent.relatedTarget.id) : null;

            if (type === 'focusin' && targetObj) {
                if (this._currentFocused) {
                    this._focusStack.push(this._currentFocused);
                }
                this._currentFocused = targetObj;

                // Send focusin (bubbles) and focus (doesn't bubble)
                this._sendEvent(targetObj, 'focusin', domEvent, { relatedTarget: relatedTargetObj }, true);
                this._sendEvent(targetObj, 'focus', domEvent, { relatedTarget: relatedTargetObj }, false);
            }

            if (type === 'focusout' && targetObj) {
                // Send blur (doesn't bubble) and focusout (bubbles)
                this._sendEvent(targetObj, 'blur', domEvent, { relatedTarget: relatedTargetObj }, false);
                this._sendEvent(targetObj, 'focusout', domEvent, { relatedTarget: relatedTargetObj }, true);

                this._currentFocused = this._focusStack.pop() || null;
            }
        }

        getCurrentFocused() {
            return this._currentFocused;
        }

        focusPrevious() {
            if (this._focusStack.length > 0) {
                const previous = this._focusStack.pop();
                if (previous && previous.focus) {
                    previous.focus();
                }
            }
        }
    }
    class WheelManager extends gn.event.AbstractManager {
        constructor() {
            super();
        }
        get supportedEvents() {
            return ["wheel"]//["scroll"]//[ "wheel", "scroll", "scrollend" ];
        }
        get internalEvents() {
            return ["scroll"];
        }
        _onEvent( domEvent ){
            const type = domEvent.type;
            const targetObj = domEvent.target ? gn.core.Object.getObjectById(domEvent.target.id) : null;

            if (!targetObj) {
                return;
            }

            this._sendEvent(targetObj, "scroll", domEvent, null, true);
        }
    }
    class TouchManager extends gn.event.AbstractManager {
        constructor(config = {}) {
            super();
            this._touchStartTime = null;
            this._lastTapTime = 0;
            this._startX = 0;
            this._startY = 0;
            this._isMoving = false;
            this._lastTargetId = null;
            this._longTapThreshold = config.longTapThreshold || 700;
            this._dblTapThreshold = config.dblTapThreshold || 300;
            this._moveThreshold = config.moveThreshold || 10;
            this._tapTimeout = null;
            this._longTapTimeout = null;
            this._config = config;
            this._activeTouches = new Map(); // Track multiple touches
        }

        get supportedEvents() {
            return ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
        }

        get internalEvents() {
            return ['tap', 'doubleTap', 'longTap', 'swipe'];
        }

        _onEvent(domEvent) {
            switch (domEvent.type) {
                case 'touchstart':
                    this._handleTouchStart(domEvent);
                    break;
                case 'touchmove':
                    this._handleTouchMove(domEvent);
                    break;
                case 'touchend':
                    this._handleTouchEnd(domEvent);
                    break;
                case 'touchcancel':
                    this._handleTouchCancel(domEvent);
                    break;
            }
        }

        _handleTouchStart(event) {
            if (this._config.preventDefault !== false) {
                event.preventDefault();
            }
            for (const touch of event.touches) {
                const touchId = touch.identifier;

                this._activeTouches.set(touchId, {
                    startX: touch.clientX,
                    startY: touch.clientY,
                    startTime: Date.now(),
                    targetId: event.target.id,
                    lastX: touch.clientX,
                    lastY: touch.clientY,
                });
            }
            if (event.touches.length === 1) {
                this._clearTimeouts();

                const touch = event.touches[0];
                this._startX = touch.clientX;
                this._startY = touch.clientY;
                this._touchStartTime = Date.now();
                this._isMoving = false;
                this._lastTargetId = event.target.id;

                this._longTapTimeout = setTimeout(() => {
                    this._sendTapEvent('longTap', event);
                }, this._longTapThreshold);
            }
        }

        _handleTouchMove(event) {
            event.preventDefault();
            for (const touch of event.touches) {
                const touchId = touch.identifier;
                const touchData = this._activeTouches.get(touchId);

                if (touchData) {
                    touchData.lastX = touch.clientX;
                    touchData.lastY = touch.clientY;
                }
            }
            if (event.touches.length === 1) {
                const touch = event.touches[0];
                const dx = Math.abs(touch.clientX - this._startX);
                const dy = Math.abs(touch.clientY - this._startY);

                if (dx > this._moveThreshold || dy > this._moveThreshold) {
                    this._isMoving = true;
                    this._clearTimeouts();
                }
            }
        }

        _handleTouchEnd(event) {
            event.preventDefault();
            if (event.touches.length === 0 && !this._isMoving) {
                this._handleGestureEnd(event);
            }
            for (const touch of event.changedTouches) {
                this._activeTouches.delete(touch.identifier);
            }
        }

        _handleTouchCancel(event) {
            this._clearTimeouts();
            this._activeTouches.clear();
            this._isMoving = false;
        }

        _handleGestureEnd(event) {
            this._clearTimeouts();

            const endTime = Date.now();
            const touchDuration = endTime - this._touchStartTime;

            if (event.changedTouches.length === 1) {
                const touch = event.changedTouches[0];
                const dx = touch.clientX - this._startX;
                const dy = touch.clientY - this._startY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 50 && touchDuration < 300) {
                    let direction = '';
                    if (Math.abs(dx) > Math.abs(dy)) {
                        direction = dx > 0 ? 'right' : 'left';
                    } else {
                        direction = dy > 0 ? 'down' : 'up';
                    }

                    this._sendEventToTarget('swipe', {
                        direction,
                        distance,
                        velocity: distance / touchDuration,
                        startX: this._startX,
                        startY: this._startY,
                        endX: touch.clientX,
                        endY: touch.clientY,
                    });
                    return;
                }
            }

            if (endTime - this._lastTapTime < this._dblTapThreshold) {
                this._lastTapTime = 0;
                this._sendTapEvent('doubleTap', event);
            } else {
                this._tapTimeout = setTimeout(() => {
                    this._sendTapEvent('tap', event);
                }, this._dblTapThreshold);

                this._lastTapTime = endTime;
            }
        }

        _sendTapEvent(eventType, domEvent) {
            const target = gn.core.Object.getObjectById(this._lastTargetId);
            if (!target) {
                return;
            }

            const touch = domEvent.changedTouches[0];
            const data = {
                x: touch ? touch.clientX : this._startX,
                y: touch ? touch.clientY : this._startY,
                timestamp: Date.now()
            };

            this._sendEvent(target, eventType, domEvent, data, true);

            const mappedType = this._config[eventType];
            if (mappedType) {
                this._sendEvent(target, mappedType, domEvent, data, true);
            }
        }

        _sendEventToTarget(eventType, data) {
            const target = gn.core.Object.getObjectById(this._lastTargetId);
            if (!target) {
                return;
            }

            gn.event.Emitter.instance().sendEvent(target, eventType, data, true);
        }

        _clearTimeouts() {
            if (this._tapTimeout) {
                clearTimeout(this._tapTimeout);
                this._tapTimeout = null;
            }
            if (this._longTapTimeout) {
                clearTimeout(this._longTapTimeout);
                this._longTapTimeout = null;
            }
        }
    }
    class InputManager extends gn.event.AbstractManager {
        constructor() {
            super();
        }

        get supportedEvents() {
            return ['input', 'change'];
        }

        get internalEvents() {
            return this.supportedEvents;
        }

        _onEvent(domEvent) {
            const targetObj = domEvent.target ? gn.core.Object.getObjectById(domEvent.target.id) : null;

            if (!targetObj) {
                return;
            }
            this._sendEvent(targetObj, domEvent.type, domEvent, null, true);
        }
    }
}