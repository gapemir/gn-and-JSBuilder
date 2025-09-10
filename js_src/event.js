namespace gn.event {
    class Event {
        constructor( type, sender, data = null ) {
            this._type = type;
            this._sender = sender;
            this._data = data;
            this._timestamp = Date.now();
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
        copyFromNative( domEvent ) {
            for( let type in gn.event.Event.COPY_FROM_NATIVE ) {
                if( domEvent instanceof window[type] ) {
                    for( let prop of gn.event.Event.COPY_FROM_NATIVE[ type ] ) {
                        this[ prop ] = domEvent[ prop ];
                    }
                }
            }
        }
    }
    Event.COPY_FROM_NATIVE = {
        "MouseEvent" : [ "clientX", "clientY" ]
    }
    class Emitter {
        //TODO add bubble support, so that events can bubble up the object hierarchy
        //TODO add support for event propagation, so that events can be stopped from propagating
        constructor() {
            this._listeners = new Map();
            this._forwards = {};
            this._idCache = [];
            this._nextId = 0;
            this._managers = new Map();
            this._managersSupportedTypes = []
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
        }
        addManager( manager ) {
            this._managersSupportedTypes = this._managersSupportedTypes.concat( manager.supportedEvents );
            for( let type of manager.supportedEvents ) {
                this._managers.set( type, manager );
            }
        }
        addEventListener( object, type, listener, context ) {
            if( gn.lang.Var.isString( object ) ){
                return this.addEventListener( this, object, type, listener );
            }
            if( typeof listener !== 'function' ) {
                throw( new TypeError( `Listener for event "${type}" on object must be a function.` ) );
            }
            if( this._managersSupportedTypes.includes( type ) ) {
                if( type == "focus" || type == "focusin" || type == "focusout" || type == "drop" ) {
                    if( object.focusable < 0 ) {
                        object.focusable = -1;
                    }
                }
                //TODO ?
            }
            let internalId = gn.core.Object.getInternalId( object );
            if( !this._listeners.has( internalId) ) {
                this._listeners.set( internalId, new Map() ); // Map: event -> Array<{...}>
            }
            const objectEvents = this._listeners.get( internalId );

            if( !objectEvents.has( type ) ) {
                objectEvents.set( type, [] );
            }
            const eventListeners = objectEvents.get( type );
            const listenerEntry = { listener : listener, context : context, id : this._getNextId() };

            // Add the listener entry ifa matching listener+context is not already present
            // Note: This check requires iterating, can be optimized for very frequent adds
            const exists = eventListeners.some( entry => entry.listener === listener && entry.context === context );
            if( !exists ) {
                eventListeners.push( listenerEntry );
            }
            return listenerEntry.id;
        }
        removeEventListener( object, type, listener, context ) {
            if( gn.lang.Var.isString( object ) ){
                return this.removeEventListener( this, object, type, listener );
            }
            let internalId = gn.core.Object.getInternalId( object );
            const objectEvents = this._listeners.get( internalId );
            if( !objectEvents || !objectEvents.get( type ) ) {
                return false;
            }
            return this._removeEventListenerInternal( objectEvents, type, internalId, listener, context, null );
        }
        removeEventListenerById( object, id, type ) {
            if( gn.lang.Var.isString( object ) ){
                return this.removeEventListenerById( this, object, id );
            }
            let internalId = gn.core.Object.getInternalId( object );
            const objectEvents = this._listeners.get( internalId );
            if( !objectEvents ) {
                return false;
            }
            if( gn.lang.Var.isNull( type ) ) {
                for( let [eName, events] of objectEvents ) {
                    if( events.find( ( event ) => event.id == id ) ) {
                        type = eName;
                    }
                }
            }
            if( gn.lang.Var.isNull( type ) ) {
                return false;
            }
            return this._removeEventListenerInternal( objectEvents, type, internalId, null, null, id );
        }
        _removeEventListenerInternal( objectEvents, type, internalId, listener, context, id ) {
            const eventsToRemove = objectEvents.get(type).filter(
                ( entry ) => ( ( entry.listener === listener && entry.context === context ) || entry.id === id )
            );
            if( !eventsToRemove.length ) {
                return false;
            }
            const filteredListeners = objectEvents.get( type ).splice( objectEvents.get( type ).indexOf( eventsToRemove[ 0 ] ), 1)

            this._idCache.push( eventsToRemove[ 0 ].id );
            if( filteredListeners.length === 0 ) {
                objectEvents.delete( type );
                if( objectEvents.size === 0 ) {
                    this._listeners.delete( internalId );
                }
            }
            return true;
        }
        sendEvent( object, type, data ) { // remove and by default use sendEvent
            if( gn.lang.Var.isString( object ) ){
                return this.sendEvent( this, object, type );
            }
            let event = new gn.event.Event( type, object, data );
            this.dispatchEvent( event );
        }
        dispatchEvent( event ) {
            let internalId = gn.core.Object.getInternalId( event.sender );
            const objectEvents = this._listeners.get( internalId );
            if( !objectEvents || !objectEvents.get( event.type ) ) {
                return;
            }
            const listenersToExecute = [...objectEvents.get( event.type )];
            for ( let i = 0; i < listenersToExecute.length; i++ ) {
                const entry = listenersToExecute[i];
                entry.listener.call( entry.context, event );
            }
        }
        hasListeners( object, type ) {
            if( gn.lang.Var.isString( object ) ){
                return this.hasListeners( this, type );
            }
            let internalId = gn.core.Object.getInternalId( object );
            const objectEvents = this._listeners.get( internalId );
            if( !objectEvents ) {
                return false;
            }
            const eventListeners = objectEvents.get( type );
            return eventListeners ? eventListeners.length > 0 : false;
        }
        removeAllEventListeners( object ) {
            if( gn.lang.Var.isString( object ) ){
                return this.removeAllEventListeners( this, object );
            }
            let internalId = gn.core.Object.getInternalId( object );
            if( !this._listeners.has( internalId ) ) {
                return true;
            }
            this._listeners.delete( internalId );
            return true;
        }
        forwardEvent( source, type, target ) {
            if( gn.lang.Var.isString( source ) ){
                return this.forwardEvent( this, source, type );
            }
            var id = source.addEventListener( type, function( e ) { this.sendEvent( e.type, e.data ) }, target )
            this._forwards[ source.internalId + "|" + type + "|" + target.internalId ] = id;
            return true;
        }
        stopForwardEvent( source, type, target ) { 
            if( gn.lang.Var.isString( source ) ){
                return this.stopForwardEvent( this, source, type );
            }
            let index = source.internalId + "|" + type + "|" + target.internalId;
            let id = this._forwards[ index ];
            delete this._forwards[ index ];
            return this.removeEventListenerById( source, id, type );
        }
        _getNextId() {
            return this._idCache.length ? this._idCache.pop() : this._nextId++ + "";
        }
    }
    class Timer extends gn.core.Object{
        constructor( interval ) {
            super();
            this._enabled = false;
            this._interval = null;
            this._singleShot = false;
            this._intervalId = null;
            if( interval ) {
                this.interval = interval
            }
        }
        destructor() {
            if( this._intervalId ) {
                window.clearInterval( this._intervalId );
            }
            this._intervalId = null;
        }
        get enabled() {
            return this._enabled;
        }
        set enabled( value ) {
            if( this._enabled != value ) {
                if( this._enabled ) {
                    window.clearInterval( this._intervalId );
                    this._intervalId = null;
                }
                this._enabled = value;
                if( this._enabled ) {
                    this._intervalId = window.setInterval( this.timeout, this._interval, this );
                }
            }
        }
        get interval() {
            return this._interval;
        }
        set interval( value ) {
            if( this.interval != value ) {
                this._interval = value;
                this.restart();
            }
        }
        get singleShot() {
            return this._singleShot;
        }
        set singleShot( value ) {
            this._singleShot = value;
        }
        start( interval ) {
            if( interval ) {
                this._interval = interval;
            }
            this.enabled = true;
        }
        restart() {
            if( this._enabled ){
                this.enabled = false;
                this.enabled = true;
            }
        }
        stop() {
            this.enabled = false;
        }
        timeout( self ) {
            if( self._enabled ) {
                self.sendEvent( "timeout" );
            }
            if( self._singleShot ) {
                self.stop();
            }
        }
        static singleShot( obj, func, timeout = 0 ) {
            if( !gn.lang.Var.isFunction( func ) ) {
                throw Error( "Must be function" );
            }
            window.setTimeout( function() {
                if( !obj._disposed ) {
                    func.call( obj );
                }
                obj = null;
            }, timeout );
        }
    }
    Emitter._instance = null;
    
    class AbstractManager {
        constructor() {
            this._onEventBind = null;
            this._initObserver();
            gn.event.Emitter.instance().addManager( this );
        }
        get supportedEvents() {
            return [];
        }
        _initObserver(){
            this._onEventBind = this._onEvent.bind( this );
            for( let type of this.supportedEvents ) {
                document.addEventListener( type, this._onEventBind );
            }
        }
        _exitObserver(){
            for( let type of this.supportedEvents ) {
                document.removeEventListener( type, this._onEventBind );
            }
            this._onEventBind = null;
        }
        _sendEvent( object, type, domEvent ) {
            let event = new gn.event.Event( type, object );
            event.copyFromNative( domEvent );
            gn.event.Emitter.instance().dispatchEvent( event );
        }
        _onEvent(){
            throw new Error( "Abstract" );
        }
    }
    //TODO somehow make some of this configurable by app itself, via class globals or something else
    class ClickManager extends gn.event.AbstractManager { // we listen to pointerdown &up and send it but we also send click on up, we listento pointerove&out and send also mouse alternatives
        constructor() {
            super();
            this._lastEvent;
        }
        get supportedEvents() {
            // "pointerover", "pointerenter", "pointermove", "pointercancel", "pointerout", "pointerleave", "gotpointercapture", "lostpointercapture"
            return [ "pointerdown", "pointerup", "pointerout", "pointerover", "dblclick", "contextmenu" ];
        }
        _onEvent( domEvent ) {
            let type = domEvent.type;
            let send = true;
            let sendAlso = [];
            if( type == "pointerdown" ) {
                this._lastEvent = domEvent;
            }
            else if( type == "pointerup" && domEvent.target.id == this._lastEvent.target.id ) {
                this._lastEvent = null;
                sendAlso.push( "click" );
            }
            else if( type == "pointerover" ) {
                sendAlso.push( "mouseover" );
            }
            else if( type == "pointerout" ) {
                sendAlso.push( "mouseout" );
            }
            if( send ) {
                this._internalSend( type, domEvent )
            }
            if( sendAlso.length ) {
                for( let atype of sendAlso ) {
                    this._internalSend( atype, domEvent );
                }
            }
        }
        _internalSend( type, domEvent ) {
            if( domEvent.target && gn.core.Object.getObjectById( domEvent.target.id ) && gn.event.Emitter.instance().hasListeners( gn.core.Object.getObjectById( domEvent.target.id ), type ) ) {
                console.log( type )
                this._sendEvent( gn.core.Object.getObjectById( domEvent.target.id ), type, domEvent );
            }
        }
    }

    class DragManager extends gn.event.AbstractManager {
        constructor() {
            super();
        }
        get supportedEvents() {
            return [ "drag", "dragstart", "dragend", "dragenter", "dragexit", "dragleave", "dragover", "drop" ];
        }
        _onEvent( domEvent ){
            var type = domEvent.type;
            if ( domEvent.target && gn.core.Object.getObjectById( domEvent.target.id ) && gn.event.Emitter.instance().hasListeners( gn.core.Object.getObjectById( domEvent.target.id ), type ) ) {
                console.log(type)
                if( type == "drag" && domEvent.clientX == 0 && domEvent.clientY == 0 ) { // i have a bug on brave on pop os 22 that last event reports coordinates as 0,0 whitch i dont want so we skip this event
                    return;
                }
                this._sendEvent( gn.core.Object.getObjectById( domEvent.target.id ), type, domEvent );
            }
        }
    }
    class FocusManager extends gn.event.AbstractManager {
        constructor() {
            super();
            this._currentFocused = null;
        }
        get supportedEvents() {
            return [ "focusin", "focusout" ]; // focus and blur does not bubble so we cant get it in document
        }
        _onEvent( domEvent) {
            var type = domEvent.type;
            let sendAlso = [];
            if( domEvent.target && gn.core.Object.getObjectById( domEvent.target.id ) ) {
                if( type == "focusin" ) {
                    this._currentFocused = gn.core.Object.getObjectById( domEvent.target.id );
                    sendAlso.push( "focus" );
                }
                if( type == "focusout" ) {
                    sendAlso.push( "blur" );
                }
            }

            if ( domEvent.target && this._currentFocused && gn.event.Emitter.instance().hasListeners( this._currentFocused, type ) ) {
                console.log(type);
                this._sendEvent( this._currentFocused, type, domEvent );
            }

            if( sendAlso ) {
                for( let atype of sendAlso ) {
                    console.log(atype);
                    this._sendEvent( this._currentFocused, atype, domEvent );
                }
            }

            if( type == "focusout" ) {
                this._currentFocused = null;
            }
        }
    }
}