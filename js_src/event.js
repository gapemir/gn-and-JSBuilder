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
    }
    class Emitter {
        //TODO add bubble support, so that events can bubble up the object hierarchy
        //TODO add support for event propagation, so that events can be stopped from propagating
        constructor() {
            this._listeners = new Map();
            this._forwards = {};
            this._idCache = [];
            this._nextId = 0;
        }
        static instance() {
            if(!gn.event.Emitter._instance) {
                gn.event.Emitter._instance = new gn.event.Emitter();
                
            }
            return gn.event.Emitter._instance;
        }
        addEventListener( object, type, listener, context ) {
            let internalId = gn.core.Object.getInternalId( object );
            if( typeof listener !== 'function' ) {
                throw( new TypeError( `Listener for event "${type}" on object must be a function.` ) );
            }
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
            let internalId = gn.core.Object.getInternalId( object );
            const objectEvents = this._listeners.get( internalId );
            if( !objectEvents || !objectEvents.get( type ) ) {
                return false;
            }
            return this._removeEventListenerInternal( objectEvents, type, internalId, listener, context, null );
        }
        removeEventListenerById( object, id, type ) {
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
            let internalId = gn.core.Object.getInternalId( object );
            const objectEvents = this._listeners.get( internalId );
            if( !objectEvents ) {
                return false;
            }
            const eventListeners = objectEvents.get( type );
            return eventListeners ? eventListeners.length > 0 : false;
        }
        removeAllEventListeners( object ) {
            let internalId = gn.core.Object.getInternalId( object );
            if( !this._listeners.has( internalId ) ) {
                return true;
            }
            this._listeners.delete( internalId );
            return true;
        }
        forwardEvent( source, type, target ) {
            var id = source.addEventListener( type, function( e ) { this.sendEvent( e.type, e.data ) }, target )
            this._forwards[ source.internalId + "|" + type + "|" + target.internalId ] = id;
            return true;
        }
        stopForwardEvent( source, type, target ) {  
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
            this.enabled = false;
            this.enabled = true;
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
}