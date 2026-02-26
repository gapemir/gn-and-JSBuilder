namespace gn.event.manager {
    class AbstractManager {
        constructor() {
            this._onEventBind = this._onEvent.bind(this);
            this._initObserver();
            gn.event.Emitter.instance().addManager(this);
        }
        get useCapture() {
            return true;
        }
        get supportedEvents() { 
            throw new Error('Abstract property supportedEvents must be implemented');
        }
        get internalEvents() {  
            throw new Error('Abstract property internalEvents must be implemented');
        }
        _initObserver() {
            for( const type of this.supportedEvents ) {
                document.addEventListener(type, this._onEventBind, this.useCapture);
            }
        }
        _exitObserver() {
            for( const type of this.supportedEvents ) {
                document.removeEventListener(type, this._onEventBind);
            }
            this._onEventBind = null;
        }
        _sendEvent(object, type, domEvent, data = null, bubbles = true, additionalEventData = null) {
            if (!object) {
                return;
            }
            // still need this to be comented as we dont have all managers yet but we should not use events on native elements
            // domEvent.stopPropagation();
            // domEvent.preventDefault();

            const event = new gn.event.Event(type, object, data, bubbles);
            event.copyFromNative(domEvent);
            gn.lang.Object.merge(event, data);
            gn.lang.Object.merge(event, additionalEventData);

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
    class PointerManager extends gn.event.manager.AbstractManager {
        constructor() {
            super();
            this._lastPointerDown = null;
            this._clickCount = 0;
            this._clickTimer = null;
            this._DOUBLE_CLICK_THRESHOLD = 200; // ms
            this._clickTimer = new gn.event.Timer(this._DOUBLE_CLICK_THRESHOLD);
            this._clickTimer.addEventListener("timeout", this._sendClick, this);
            this._clickTimer.singleShot = true;
        }

        get supportedEvents() {
            return ["pointerdown", "pointerover", "pointerout", "pointerup", "pointercancel"];
        }

        get internalEvents() {
            return ["click", "dblclick", "contextmenu", "hoverover", "hoverout"];
        }

        _onEvent(domEvent) {
            const type = domEvent.type;
            const targetObj = domEvent.target ? gn.core.Object.getObjectById(domEvent.target.id) : null;
            if (!targetObj) {
                return;
            }

            switch (type) {
                case "pointerdown":
                    this._handleDown(targetObj, domEvent);
                    break;
                case "pointerup":
                    this._handleUp(targetObj, domEvent);
                    break;
                case "pointercancel":
                    this._lastPointerDown = null;
                    break;
                case "pointerover":
                    this._sendEvent(targetObj, "hoverover", domEvent, null, true);
                    break;
                case "pointerout":
                    this._sendEvent(targetObj, "hoverout", domEvent, null, true);
                    break;
            }
        }
        _handleDown(targetObj, domEvent) {
            this._lastPointerDown = {
                target: targetObj,
                domEvent: domEvent,
            };

            if (domEvent.button === 2) {
                this._sendEvent(targetObj, "contextmenu", domEvent, null, true);
            }
        }

        _handleUp(targetObj, domEvent) {
            if (!this._lastPointerDown) {
                return;
            }
            this._clickTimer.start();

            if (this._lastPointerDown.target === targetObj && domEvent.button !== 2) {
                const now = Date.now();
                
                if (now - this._lastClickTime < this._DOUBLE_CLICK_THRESHOLD) {
                    this._sendEvent(targetObj, "dblclick", domEvent, null, true);
                    this._lastClickTime = 0;
                    this._clickTimer.stop();
                } else {
                    this._lastClickTime = now;
                }
            }
        }

        _sendClick() {
            if(this._lastPointerDown === null) {
                return;
            }
            this._sendEvent(this._lastPointerDown.target, "click", this._lastPointerDown.domEvent, null, true);
            this._lastPointerDown = null;
        }
    }
    class DragManager extends gn.event.manager.AbstractManager {
        constructor(options = {}) {
            super();
            this._dragStartThreshold = options.dragStartThreshold || 5; // pixels
            
            this._pointerId = null;
            this._targetElement = null;
            this._dragActive = false;
            this._dragStarted = false;
            
            this._startPos = null;
            this._currentPos = null;
            
            this._dragTarget = null;
            this._dragTargetObj = null;
        }
        
        get supportedEvents() {
            return ["pointerdown", "pointerup", "pointermove", "pointercancel"];
        }
        
        get internalEvents() {
            return ["dragstart", "drag", "dragend"];
        }
        
        _onEvent(domEvent) {
            switch (domEvent.type) {
                case "pointerdown":
                    this._onPointerDown(domEvent);
                    break;
                case "pointermove":
                    this._onPointerMove(domEvent);
                    break;
                case "pointerup":
                    this._onPointerUp(domEvent);
                    break;
                case "pointercancel":
                    this._onPointerCancel(domEvent);
                    break;
            }
        }
        
        _onPointerDown(domEvent) {
            const targetObj = domEvent.target ? gn.core.Object.getObjectById(domEvent.target.id) : null;
            if (!targetObj) {
                return;
            }

            const isInteractive = domEvent.target.matches(
                'input, textarea, select, button, [contenteditable="true"], label, a'
            );
            if (!isInteractive) {
                domEvent.preventDefault();
            }
            
            this._pointerId = domEvent.pointerId;
            this._targetElement = domEvent.target;
            
            if (this._targetElement && this._targetElement.setPointerCapture) {
                try {
                    this._targetElement.setPointerCapture(this._pointerId);
                } catch (e) {
                    console.warn('Pointer capture failed:', e);
                }
            }
            
            this._dragActive = true;
            this._dragStarted = false;
            this._dragTarget = domEvent.target;
            this._dragTargetObj = targetObj;
            
            const pos = this._getPosition(domEvent);
            this._startPos = { ...pos };
            this._currentPos = { ...pos };
        }
        
        _onPointerMove(domEvent) {
            if (!this._dragActive || !this._dragTargetObj) {
                return;
            }
            this._currentPos = this._getPosition(domEvent);
            
            if (!this._dragStarted) {
                const dx = Math.abs(this._currentPos.x - this._startPos.x);
                const dy = Math.abs(this._currentPos.y - this._startPos.y);

                if (dx >= this._dragStartThreshold || dy >= this._dragStartThreshold) {
                    this._dragStarted = true;
                    // console.log('Emitting dragstart');
                    this._sendEvent(this._dragTargetObj, "dragstart", domEvent);
                }
                return;
            }
            // console.log('Sending drag event', domEvent.clientX, domEvent.clientY);
            this._sendEvent(this._dragTargetObj, "drag", domEvent);
        }
        
        _onPointerUp(domEvent) {
            console.log('Pointer up');
            if (!this._dragActive || !this._dragTargetObj) {
                this._reset();
                return;
            }
            this._sendEvent(this._dragTargetObj, "dragend", domEvent);
            
            this._reset();
        }
        
        _onPointerCancel(domEvent) {
            console.log('Pointer cancel');
            if (!this._dragActive || !this._dragTargetObj) {
                this._reset();
                return;
            }
        
            if (this._dragStarted && this._dragTargetObj) {
                this._sendEvent(this._dragTargetObj, "dragend", domEvent);
            }
            
            this._reset();
        }

        _startDrag(domEvent) {
            this._dragStarted = true;
            
            if (!this._dragTargetObj) {
                return;
            }
            
            // console.log('Emitting dragstart');
            this._sendEvent(this._dragTargetObj, "dragstart", domEvent);
        }

        _getPosition(domEvent) {
            let a = domEvent;
            if (domEvent.touches && domEvent.touches.length > 0) {
                a = domEvent.touches[0];
            }
            return { x: a.clientX, y: a.clientY };
        }
        
        _reset() {
            if (this._targetElement && this._pointerId && this._targetElement.releasePointerCapture) {
                try {
                    this._targetElement.releasePointerCapture(this._pointerId);
                } catch (e) {
                }
            }
            this._dragActive = false;
            this._dragStarted = false;
            this._pointerId = null;
            this._targetElement = null;
            this._startPos = null;
            this._currentPos = null;
            this._dragTarget = null;
            this._pendingMoveEvent = null;
        }
        
        destroy() {
            if (this._dragActive) {
                this._cleanup();
                if (this._dragStarted && this._dragTargetObj) {
                    this._sendEvent(this._dragTargetObj, "dragend", null);
                }
                this._reset();
            }
            super.destroy();
        }
    }

    class MobileScrollManager extends gn.event.manager.AbstractManager {
        constructor(options = {}) {
            super();
            this._scrollStartThreshold = options.scrollStartThreshold || 5; // pixels
            this._velocityFrames = options.velocityFrames || 5; // number of frames to track for velocity
            this._minVelocity = options.minVelocity || 0.2; // minimum velocity to emit scroll after up
            this._velocityDecay = options.velocityDecay || 0.95; // decay factor for velocity simulation
            
            this._pointerId = null;
            this._targetElement = null;
            this._dragActive = false;
            this._dragStarted = false;
            
            this._startPos = null;
            this._lastPos = null;
            this._currentPos = null;

            this._velocityHistory = [];
            this._lastTimestamp = 0;
            this._currentVelocity = { x: 0, y: 0 };

            this._scrollAnimationId = null;
            this._lastScrollTime = 0;
            
            this._target = null;
            this._targetObj = null;
        }
        
        get supportedEvents() {
            return ["touchstart", "touchmove", "touchend", "touchcancel"];
        }
        
        get internalEvents() {
            return ["scroll"];
        }
        
        _onEvent(domEvent) {
            switch (domEvent.type) {
                case "touchstart":
                    this._onTouchStart(domEvent);
                    break;
                case "touchmove":
                    this._onTouchMove(domEvent);
                    break;
                case "touchend":
                    this._onTouchEnd(domEvent);
                    break;
                case "touchcancel":
                    this._onTouchCancel(domEvent);
                    break;
            }
        }
        
        _onTouchStart(domEvent) {
            const targetObj = domEvent.target ? gn.core.Object.getObjectById(domEvent.target.id) : null;
            if (!targetObj) {
                return;
            }

            const isInteractive = domEvent.target.matches(
                'input, textarea, select, button, [contenteditable="true"], label, a'
            );
            if (!isInteractive) {
                domEvent.preventDefault();
            }

            this._cancelScrollAnimation();
            
            this._pointerId = domEvent.pointerId;
            this._targetElement = domEvent.target;
            
            if (this._targetElement && this._targetElement.setPointerCapture) {
                try {
                    this._targetElement.setPointerCapture(this._pointerId);
                } catch (e) {
                    console.warn('Pointer capture failed:', e);
                }
            }
            
            this._dragActive = true;
            this._dragStarted = false;
            this._target = domEvent.target;
            this._targetObj = targetObj;
            
            const pos = this._getPosition(domEvent);
            this._startPos = { ...pos };
            this._lastPos = { ...pos };
            this._currentPos = { ...pos };

            this._velocityHistory = [];
            this._currentVelocity = { x: 0, y: 0 };
            this._lastTimestamp = domEvent.timeStamp;
        }
        
        _onTouchMove(domEvent) {
            if (!this._dragActive) {
                return;
            }
            
            this._currentPos = this._getPosition(domEvent);
            this._updateVelocity(domEvent.timeStamp);
            
            const dx = Math.abs(this._currentPos.x - this._startPos.x);
            const dy = Math.abs(this._currentPos.y - this._startPos.y);
            
            if (!this._dragStarted) {
                if (dx >= this._scrollStartThreshold || dy >= this._scrollStartThreshold) {
                    // console.log('Starting drag after threshold');
                    this._dragStarted = true;
                }
                return;
            }
            
            this._sendScrollEvent(domEvent);
            this._lastPos = { ...this._currentPos };
        }

        _updateVelocity(currentTime) {
            if (!this._lastTimestamp || currentTime - this._lastTimestamp === 0) {
                return;
            }
            
            const dt = currentTime - this._lastTimestamp;
            let vx = (this._currentPos.x - this._lastPos.x);
            vx /= dt;
            let vy = (this._currentPos.y - this._lastPos.y);
            vy /= dt;
            
            if( !Number.isNaN(vy) && !Number.isNaN(vx)) {
                this._velocityHistory.push({
                    vx,
                    vy,
                    timestamp: currentTime,
                });
            }
            
            const cutoffTime = currentTime - 100; // keep last 100ms
            this._velocityHistory = this._velocityHistory.filter(v => v.timestamp >= cutoffTime);
            if (this._velocityHistory.length > 0) {
                const sum = this._velocityHistory.reduce((acc, v) => {
                    acc.vx += v.vx;
                    acc.vy += v.vy;
                    return acc;
                }, { vx: 0, vy: 0 });
                
                this._currentVelocity = {
                    x: sum.vx / this._velocityHistory.length,
                    y: sum.vy / this._velocityHistory.length,
                };
            }
        }
        
        _onTouchEnd(domEvent) {
            console.log('Touch end');
            if (!this._dragActive) {
                this._reset();
                return;
            }
            
            this._currentPos = this._getPosition(domEvent);
            this._updateVelocity(domEvent.timeStamp);
            
            const velocityMagnitude = Math.sqrt(this._currentVelocity.x * this._currentVelocity.x + this._currentVelocity.y * this._currentVelocity.y);
            console.log('Min velocity:', this._minVelocity, 'magnitude:', velocityMagnitude);
            if (velocityMagnitude >= this._minVelocity) {
                this._startScrollAnimation(this._currentVelocity);
            }
            this._reset();
        }
        
        _onTouchCancel(domEvent) {
            console.log('Touch cancel');
            if (!this._dragActive) {
                return;
            }
            
            this._reset();
        }

        _sendScrollEvent(domEvent) {
            if (!this._dragStarted || !this._lastPos) {
                return;
            }
            
            const scrollData = {
                deltaX: (this._lastPos.x - this._currentPos.x) * 3.2,
                deltaY: (this._lastPos.y - this._currentPos.y) * 3.2,
            };
            console.log('Sending scroll event', scrollData.deltaX, scrollData.deltaY);
            this._sendEvent(this._targetObj, "scroll", domEvent, null, true, scrollData);
        }

        _startScrollAnimation(initialVelocity) {
            console.log('Starting scroll animation with velocity:', initialVelocity);
            
            this._cancelScrollAnimation();
            
            let velocity = { ...initialVelocity };
            let lastTime = performance.now();
            
            const animateScroll = (currentTime) => {
                const dt = Math.min(32, currentTime - lastTime); // cap at 32ms to avoid large jumps
                
                velocity.x *= Math.pow(this._velocityDecay, dt / 16); // decay per 16ms frame
                velocity.y *= Math.pow(this._velocityDecay, dt / 16);
                const deltaX = velocity.x * dt * 15;
                const deltaY = velocity.y * dt * 15;

                if (Math.abs(velocity.x) < 0.01 && Math.abs(velocity.y) < 0.01) {
                    return;
                }
                
                const scrollData = {
                    deltaX: -deltaX,
                    deltaY: -deltaY,
                };
                this._sendEvent(this._targetObj, "scroll", null, null, true, scrollData);
                
                lastTime = currentTime;
                this._scrollAnimationId = requestAnimationFrame(animateScroll);
            };
            
            lastTime = performance.now();
            this._scrollAnimationId = requestAnimationFrame(animateScroll);
        }
        
        _cancelScrollAnimation() {
            if (this._scrollAnimationId) {
                cancelAnimationFrame(this._scrollAnimationId);
                this._scrollAnimationId = null;
            }
        }
        
        _getPosition(domEvent) {
            let a = domEvent;
            if (domEvent.touches && domEvent.touches.length > 0) {
                a = domEvent.touches[0];
            }
            return { x: a.clientX, y: a.clientY };
        }
        
        _reset() {
            if (this._targetElement && this._pointerId && this._targetElement.releasePointerCapture) {
                try {
                    this._targetElement.releasePointerCapture(this._pointerId);
                } catch (e) {
                }
            }
            this._dragActive = false;
            this._dragStarted = false;
            this._pointerId = null;
            this._targetElement = null;
            this._startPos = null;
            this._lastPos = null;
            this._currentPos = null;
            this._target = null;
            this._pendingMoveEvent = null;
        }
        
        destroy() {
            if (this._dragActive) {
                this._cleanup();
                this._reset();
            }
            super.destroy();
        }
    }
    class FocusManager extends gn.event.manager.AbstractManager {
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
    class WheelManager extends gn.event.manager.AbstractManager {
        constructor() {
            super();
        }
        get supportedEvents() {
            return ["wheel"];
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
    class InputManager extends gn.event.manager.AbstractManager {
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