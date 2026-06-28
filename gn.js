"use strict";

var gn = {};
if(!gn.core) gn.core = {};
if(!gn.lang) gn.lang = {};
if(!gn.geometry) gn.geometry = {};
if(!gn.util) gn.util = {};
if(!gn.event) gn.event = {};
if(!gn.event.manager) gn.event.manager = {};
if(!gn.locale) gn.locale = {};
if(!gn.ui) gn.ui = {};
if(!gn.ui.basic) gn.ui.basic = {};
if(!gn.model) gn.model = {};
if(!gn.ui.layout) gn.ui.layout = {};
if(!gn.helper) gn.helper = {};
if(!gn.app) gn.app = {};
if(!gn.ui.list) gn.ui.list = {};
if(!gn.ui.container) gn.ui.container = {};
if(!gn.ui.tile) gn.ui.tile = {};
if(!gn.ui.control) gn.ui.control = {};
if(!gn.ui.input) gn.ui.input = {};
if(!gn.ui.popup) gn.ui.popup = {};

gn.core.Object = class gn_core_Object {
    constructor() {
        this._internalId = this.internalId;
        this._disposed = false;

        gn.core.Object._ObjectMap.set(this._internalId, this);
    }

    _destructor() {}

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

gn.core.Object._idCache = [];
gn.core.Object._nextId = 0;
gn.core.Object._ObjectMap = new Map();
gn.lang.Var = class gn_lang_Var {
    static isNull(value) {
        return value === undefined || value === null;
    }
    static isEmpty(value) {
        return gn.lang.Var.isNull(value) || value.length === 0 || value.size === 0 || (gn.lang.Var.isObject(value) && Object.keys(value).length === 0);
    }
    static isArray(value) {
        return value instanceof Array;
    }
    static isString(value) {
        return typeof value === 'string' || value instanceof String;
    }
    static isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    }
    static isBoolean(value) {
        return typeof value === 'boolean';
    }
    static isFunction(value) {
        return typeof value === 'function';
    }
    static isObject(value) {
        return value !== null && value.constructor.name === "Object"
    }
}
gn.lang.Array = class gn_lang_Array {
    static isEmpty(array) {
        return !!(gn.lang.Var.isNull(array) || array.length === 0);
    }
    static clone(array) {
        return gn.lang.Object.clone(array);
    }
    static remove(array, element) {
        let index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
        }
    }
    static insertBefore(array, element, refElement) {
        let index = array.indexOf(refElement);
        array.splice(index >= 0 ? index : array.length, 0, element);
    }
    static insertAfter(array, element, refElement) {
        let index = array.indexOf(refElement);
        array.splice(index >= 0 ? index + 1 : array.length, 0, element);
    }
}
gn.lang.String = class gn_lang_String {
    static isEmpty(string) {
        return !!(gn.lang.Var.isNull(string) || string.length === 0);
    }
}
gn.lang.Number = class gn_lang_Number {

}

gn.lang.Object = class gn_lang_Object {
    static isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

    static merge(obj1, obj2) {
        return Object.assign(obj1, obj2);
    }
    static clone(value, deep) {
        if (gn.lang.Var.isObject(value)) {
            var clone = {};
            for (var key in value) {
                clone[key] = deep ? gn.lang.Object.clone(value[key], deep) : item;
            }
            return clone;
        } else if (gn.lang.Var.isArray(value)) {
            var clone = [];
            for (let item of value) {
                clone.push(deep ? gn.lang.Object.clone(item, deep) : item);
            }
            return clone;
        }
        return value;
    }
}
gn.lang.Enum = function(obj) {
    return Object.freeze ? (Object.freeze(obj)) : obj;
};
gn.geometry.Rect = class gn_geometry_Rect {
    constructor(x, y, width, height) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get left() {
        return this._x;
    }
    get right() {
        return this._x + this._width;
    }
    get top() {
        return this._y;
    }
    get bottom() {
        return this._y + this._height;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get centerX() {
        return this._x + (this._width / 2);
    }
    get centerY() {
        return this._y + (this._height / 2);
    }
}
gn.geometry.Size = class gn_geometry_Size {
    constructor(width, height) {
        this._width = width;
        this._height = height;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
}
gn.geometry.Point = class gn_geometry_Point {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
}
gn.util.Cookie = class gn_util_Cookie {
    static get() {
        let cookies = document.cookie.split('; ').reduce((acc, cookie) => {
            let [name, value] = cookie.split('=');
            acc[name] = decodeURIComponent(value);
            return acc;
        }, {});
        return cookies;
    }
    static set(name, value, timeout) {
        let expires = "";
        if (timeout) {
            let date = new Date();
            date.setTime(date.getTime() + timeout);
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }
    static del(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
}
gn.util.Geometry = class gn_util_Geometry {
    static _boundingClientRect(element) {
        let el = element
        if (el instanceof gn.ui.basic.Widget) {
            el = element.el;
        }
        if (el instanceof HTMLElement) {
            let rect = el.getBoundingClientRect();
            return new gn.geometry.Rect(rect.x, rect.y, rect.width, rect.height);
        } else {
            throw new Error("Invalid element type for boundingClientRect");
        }
    }
    static _outerBoundingClientRect(element) {
        let el = element
        if (el instanceof gn.ui.basic.Widget) {
            el = element.el;
        }
        let rect = gn.util.Geometry._boundingClientRect(el);
        let cs = window.getComputedStyle(el);
        let l = parseInt(cs.getPropertyValue("margin-left")) || 0;
        let r = parseInt(cs.getPropertyValue("margin-right")) || 0;
        let t = parseInt(cs.getPropertyValue("margin-top")) || 0;
        let b = parseInt(cs.getPropertyValue("margin-bottom")) || 0;
        return new gn.geometry.Rect(rect.x - l, rect.y - t, rect.width + l + r, rect.height + t + b);
    }
    static rect(el) {
        return gn.util.Geometry._boundingClientRect(el);
    }
    static size(el) {
        let rect = gn.util.Geometry._boundingClientRect(el);
        return new gn.geometry.Size(rect.width, rect.height);
    }
    static width(el) {
        return gn.util.Geometry._boundingClientRect(el).width;
    }
    static height(el) {
        return gn.util.Geometry._boundingClientRect(el).height;
    }
    static outerRect(el) {
        return gn.util.Geometry._outerBoundingClientRect(el);
    }
    static outerWidth(el) {
        return gn.util.Geometry._outerBoundingClientRect(el).width;
    }
    static outerHeight(el) {
        return gn.util.Geometry._outerBoundingClientRect(el).height;
    }
}
gn.event.manager.AbstractManager = class gn_event_manager_AbstractManager {
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
        for (const type of this.supportedEvents) {
            document.addEventListener(type, this._onEventBind, this.useCapture);
        }
    }
    _exitObserver() {
        for (const type of this.supportedEvents) {
            document.removeEventListener(type, this._onEventBind);
        }
        this._onEventBind = null;
    }
    _sendEvent(object, type, domEvent, data = null, bubbles = true, additionalEventData = null) {
        if (!object) {
            return;
        }




        const event = new gn.event.Event(type, object, data, bubbles);
        event.copyFromNative(domEvent);
        gn.lang.Object.merge(event, data);
        gn.lang.Object.merge(event, additionalEventData);






        gn.event.Emitter.instance().dispatchEvent(event);
    }
    _onEvent(domEvent) {
        throw new Error('Abstract method _onEvent must be implemented');
    }
    destroy() {
        this._exitObserver();
    }
}
gn.event.manager.PointerManager = class gn_event_manager_PointerManager extends gn.event.manager.AbstractManager {
    constructor() {
        super();
        this._lastPointerDown = null;
        this._clickCount = 0;
        this._clickTimer = null;
        this._DOUBLE_CLICK_THRESHOLD = 200;
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
        if (this._lastPointerDown === null) {
            return;
        }
        this._sendEvent(this._lastPointerDown.target, "click", this._lastPointerDown.domEvent, null, true);
        this._lastPointerDown = null;
    }
}
gn.event.manager.DragManager = class gn_event_manager_DragManager extends gn.event.manager.AbstractManager {
    constructor(options = {}) {
        super();
        this._dragStartThreshold = options.dragStartThreshold || 5;

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
        this._startPos = {
            ...pos
        };
        this._currentPos = {
            ...pos
        };
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

                this._sendEvent(this._dragTargetObj, "dragstart", domEvent);
            }
            return;
        }

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


        this._sendEvent(this._dragTargetObj, "dragstart", domEvent);
    }

    _getPosition(domEvent) {
        let a = domEvent;
        if (domEvent.touches && domEvent.touches.length > 0) {
            a = domEvent.touches[0];
        }
        return {
            x: a.clientX,
            y: a.clientY
        };
    }

    _reset() {
        if (this._targetElement && this._pointerId && this._targetElement.releasePointerCapture) {
            try {
                this._targetElement.releasePointerCapture(this._pointerId);
            } catch (e) {}
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

gn.event.manager.MobileScrollManager = class gn_event_manager_MobileScrollManager extends gn.event.manager.AbstractManager {
    constructor(options = {}) {
        super();
        this._scrollStartThreshold = options.scrollStartThreshold || 5;
        this._velocityFrames = options.velocityFrames || 5;
        this._minVelocity = options.minVelocity || 0.2;
        this._velocityDecay = options.velocityDecay || 0.95;

        this._pointerId = null;
        this._targetElement = null;
        this._dragActive = false;
        this._dragStarted = false;

        this._startPos = null;
        this._lastPos = null;
        this._currentPos = null;

        this._velocityHistory = [];
        this._lastTimestamp = 0;
        this._currentVelocity = {
            x: 0,
            y: 0
        };

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
        this._startPos = {
            ...pos
        };
        this._lastPos = {
            ...pos
        };
        this._currentPos = {
            ...pos
        };

        this._velocityHistory = [];
        this._currentVelocity = {
            x: 0,
            y: 0
        };
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

                this._dragStarted = true;
            }
            return;
        }

        this._sendScrollEvent(domEvent);
        this._lastPos = {
            ...this._currentPos
        };
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

        if (!Number.isNaN(vy) && !Number.isNaN(vx)) {
            this._velocityHistory.push({
                vx,
                vy,
                timestamp: currentTime,
            });
        }

        const cutoffTime = currentTime - 100;
        this._velocityHistory = this._velocityHistory.filter(v => v.timestamp >= cutoffTime);
        if (this._velocityHistory.length > 0) {
            const sum = this._velocityHistory.reduce((acc, v) => {
                acc.vx += v.vx;
                acc.vy += v.vy;
                return acc;
            }, {
                vx: 0,
                vy: 0
            });

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

        let velocity = {
            ...initialVelocity
        };
        let lastTime = performance.now();

        const animateScroll = (currentTime) => {
            const dt = Math.min(32, currentTime - lastTime);

            velocity.x *= Math.pow(this._velocityDecay, dt / 16);
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
        return {
            x: a.clientX,
            y: a.clientY
        };
    }

    _reset() {
        if (this._targetElement && this._pointerId && this._targetElement.releasePointerCapture) {
            try {
                this._targetElement.releasePointerCapture(this._pointerId);
            } catch (e) {}
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
gn.event.manager.FocusManager = class gn_event_manager_FocusManager extends gn.event.manager.AbstractManager {
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


            this._sendEvent(targetObj, 'focusin', domEvent, {
                relatedTarget: relatedTargetObj
            }, true);
            this._sendEvent(targetObj, 'focus', domEvent, {
                relatedTarget: relatedTargetObj
            }, false);
        }

        if (type === 'focusout' && targetObj) {

            this._sendEvent(targetObj, 'blur', domEvent, {
                relatedTarget: relatedTargetObj
            }, false);
            this._sendEvent(targetObj, 'focusout', domEvent, {
                relatedTarget: relatedTargetObj
            }, true);

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
gn.event.manager.WheelManager = class gn_event_manager_WheelManager extends gn.event.manager.AbstractManager {
    constructor() {
        super();
    }
    get supportedEvents() {
        return ["wheel"];
    }
    get internalEvents() {
        return ["scroll"];
    }
    _onEvent(domEvent) {
        const type = domEvent.type;
        const targetObj = domEvent.target ? gn.core.Object.getObjectById(domEvent.target.id) : null;

        if (!targetObj) {
            return;
        }

        this._sendEvent(targetObj, "scroll", domEvent, null, true);
    }
}
gn.event.manager.InputManager = class gn_event_manager_InputManager extends gn.event.manager.AbstractManager {
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
gn.event.Event = class gn_event_Event {
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
        if (!domEvent) return;
        const standardProps = ["target", "currentTarget", "altKey", "ctrlKey", "shiftKey", "metaKey"];
        for (const prop of standardProps) {
            if (prop in domEvent) {
                this[prop] = domEvent[prop];
            }
        }
        for (const [eventType, props] of Object.entries(gn.event.Event.COPY_FROM_NATIVE)) {
            if (domEvent instanceof window[eventType]) {
                for (const prop of props) {
                    if (prop in domEvent) {
                        this[prop] = domEvent[prop];
                    }
                }
            }
        }
    }
    set(obj) {
        if (obj && typeof obj === "object") {
            Object.assign(this, obj);
        }
    }
    clone() {
        const clone = new gn.event.Event(this._type, this._sender, this._data, this._bubbles);
        clone._timestamp = this._timestamp;
        clone._stop = this._stop;
        return clone;
    }
}

gn.event.Event.COPY_FROM_NATIVE = {
    'MouseEvent': ['clientX', 'clientY', 'screenX', 'screenY', 'button', 'buttons'],
    'WheelEvent': ['deltaX', 'deltaY', 'deltaZ', 'deltaMode'],
    'KeyboardEvent': ['key', 'code', 'keyCode', 'which'],
    'TouchEvent': ['touches', 'targetTouches', 'changedTouches'],
    'FocusEvent': ['relatedTarget'],
    'DragEvent': ['dataTransfer']
};
gn.event.Emitter = class gn_event_Emitter {
    constructor() {
        this._listeners = new Map();
        this._forwards = new Map();
        this._idCache = [];
        this._nextId = 0;
        this._managersSupportedTypes = new Set();
        this._bubblingStack = [];
    }
    static instance() {
        if (!gn.event.Emitter._instance) {
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
        for (const type of manager.internalEvents) {
            this._managersSupportedTypes.add(type);
        }
    }
    addEventListener(object, type, listener, context) {
        if (gn.lang.Var.isString(object)) {
            return this.addEventListener(this, object, type, listener);
        }
        if (typeof listener !== 'function') {
            throw new TypeError(`Listener for event "${type}" must be a function`);
        }

        const internalId = gn.core.Object.getInternalId(object);
        if (!this._listeners.has(internalId)) {
            this._listeners.set(internalId, new Map());
        }

        const objectEvents = this._listeners.get(internalId);
        if (!objectEvents.has(type)) {
            objectEvents.set(type, new Set());
        }

        const eventListeners = objectEvents.get(type);

        for (const existing of eventListeners) {
            if (existing.listener === listener && existing.context === context) {
                return existing.id;
            }
        }

        const entry = {
            listener,
            context,
            id: this._getNextId()
        };
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

        const id = source.addEventListener(type, function(event) {
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
        return this._idCache.length ? this._idCache.pop() : (this._nextId++).toString();
    }
    dumpListeners() {
        const dump = {};
        for (const [objId, events] of this._listeners) {
            dump[objId] = {};
            for (const [type, listeners] of events) {
                dump[objId][type] = listeners.size;
            }
        }
        return dump;
    }
}

gn.event.Timer = class gn_event_Timer extends gn.core.Object {
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
}
gn.event.Emitter._instance = null;
gn.locale.LocaleString = class gn_locale_LocaleString {
    constructor(messageId, text, count) {
        this._messageId = messageId;
        this._text = text;
        this._count = count;
        this._args = [];
        gn.locale.LocaleManager.instance().translate(this);

    }
    get messageId() {
        return this._messageId;
    }
    get text() {
        return this._text;
    }
    set text(value) {
        this._text = value;
    }
    get count() {
        return this._count;
    }
    get argz() {
        return this._args
    }
    translate() {
        return gn.locale.LocaleManager.instance().translate(this);
    }
    args(...argz) {
        this._args = argz;
        if (this._args.length != 0) {
            if (this._args.length == 1) {
                this._count = this._args[0];
            }
            let newText = this._text;
            for (let i = 0; newText.match(/%\d+/); i++) {
                newText = newText.replace(/%\d+/, this._args[i])
            }
            this._text = newText;
        }
        return this;
    }
    toString() {
        return this._text;
    }
}
gn.locale.LocaleManager = class gn_locale_LocaleManager extends gn.core.Object {
    constructor() {
        super();
        this._locale = "";
        this._locales = {};
    }
    static instance() {
        if (gn.locale.LocaleManager._instance == null) {
            gn.locale.LocaleManager._instance = new gn.locale.LocaleManager();
        }
        return gn.locale.LocaleManager._instance;
    }
    set locale(locale) {
        if (gn.lang.Var.isNull(locale)) {
            return;
        }
        if (gn.lang.Var.isNull(this._locales[locale])) {
            this._loadLocale(locale);
        } else if (locale !== this._locale) {
            this._locale = locale;
            this._changeLocale();
        }
    }
    get locale() {
        return this._locale;
    }
    async _loadLocale(locale) {
        let localeFiles = gn.app.App.instance().getLocalePath();
        for (let file of localeFiles) {
            try {
                let loc = await gn.app.App.instance().requestJ(file + locale + ".json");
                if (!gn.lang.Var.isNull(loc)) {
                    if (!this._locales[locale]) {
                        this._locales[locale] = loc;
                        this._locales[locale].pluralCB = new Function("n", loc.plural)
                    } else {
                        gn.lang.Object.merge(this._locales[locale].tr, loc.tr);
                    }
                } else {
                    throw new Error("Locale file is empty or not found: " + file + locale + ".json");
                }
            } catch (e) {
                console.error("Failed to load locale: " + locale + " file: " + file + locale + ".json", e);
                return;
            }
        }
        this._locale = locale;
        this._changeLocale();
    }
    _getLocalisedText(text, count) {
        if (this._locales[this.locale] && this._locales[this._locale].tr[text]) {
            if (gn.lang.Var.isArray(this._locales[this._locale].tr[text])) {
                let idx = this._locales[this._locale].pluralCB(count || 1)
                if (this._locales[this._locale].tr[text].length > idx) {
                    return this._locales[this._locale].tr[text][idx];
                } else if (this._locales[this._locale].tr[text].length) {
                    return this._locales[this._locale].tr[text][this._locales[this._locale].tr[text].length - 1];
                }
                return text;
            }
            return this._locales[this.locale].tr[text];
        } else {
            return text;
        }
    }
    translate(ls) {
        if (this._locale == "") {
            return ls;
        }
        ls.text = this._getLocalisedText(ls.messageId, ls.count);
        return ls.args(ls.argz);
    }
    _changeLocale() {
        this.sendEvent("changeLocale");
    }
}
gn.locale.LocaleManager._instance = null;
gn.ui.basic.Widget = class gn_ui_basic_Widget extends gn.core.Object {
    constructor(layout, type, classList) {
        super();
        this._element = this._createElement(type);
        this._element.id = "gn_" + this._internalId;
        this._element.setAttribute("gn_name", this.constructor.name);
        this.addClasses(classList);
        this._tooltip = null;
        this._tooltipContent = null;
        this._children = [];

        this._layoutManager = null;
        this._layoutParent = null;
        if (layout) {
            this.layoutManager = layout
        }
    }
    _destructor() {
        if (!gn.lang.Var.isNull(this._layoutParent)) {
            this._layoutParent.remove(this);
        }
    }
    get layoutParent() {
        return this._layoutParent;
    }
    set layoutParent(value) {
        if (gn.lang.Var.isNull(value)) {
            this._layoutParent = null;
        } else if (!(value instanceof gn.ui.basic.Widget)) {
            throw new TypeError("Layout parent must be a gn.ui.basic.Widget");
        } else if (value === this) {
            throw new Error("Widget cannot be its own layout parent");
        } else {
            this._layoutParent = value;
        }
    }
    get element() {
        return this._element;
    }
    set layoutManager(value) {
        if (gn.lang.Var.isNull(value)) {
            if (!gn.lang.Var.isNull(this._layoutManager)) {
                this._layoutManager.dispose();
                this._layoutManager = null;
            }
            return;
        }
        if (!(value instanceof gn.ui.layout.AbstractLayout)) {
            throw new TypeError("Layout manager must be a subclass of AbstractLayout");
        }
        this._layoutManager = value;
        this._layoutManager.widget = this;
    }
    get layoutManager() {
        return this._layoutManager;
    }
    get rect() {
        return gn.util.Geometry.rect(this._element);
    }
    get size() {
        return gn.util.Geometry.size(this._element);
    }
    get width() {
        return gn.util.Geometry.width(this._element);
    }
    set width(value) {
        if (gn.lang.Var.isNumber(value) && value >= 0) {
            this.setStyle("width", value + "px");
        } else {
            this.setStyle("width", value);
        }
    }
    get height() {
        return gn.util.Geometry.height(this._element);
    }
    set height(value) {
        if (gn.lang.Var.isNumber(value) && value >= 0) {
            this.setStyle("height", value + "px");
        } else {
            this.setStyle("height", value);
        }
    }
    addClass(className) {
        if (gn.lang.Var.isEmpty(className)) {
            return;
        }
        this._element.classList.add(className);
    }
    addClasses(classNames) {
        if (!gn.lang.Var.isArray(classNames)) {
            if (gn.lang.Var.isString(classNames) && !gn.lang.Var.isEmpty(classNames)) {
                this.addClasses(classNames.split(" "));
            }
            return;
        }
        for (let i = 0; i < classNames.length; i++) {
            this.addClass(classNames[i]);
        }
    }
    removeClass(className) {
        this._element.classList.remove(className);
    }
    removeClasses(classNames) {
        if (!gn.lang.Var.isArray(classNames)) {
            if (gn.lang.Var.isString(classNames)) {
                this.removeClasses(classNames.split(" "));
            }
            return;
        }
        for (let i = 0; i < classNames.length; i++) {
            this.removeClass(classNames[i]);
        }
    }
    setStyle(styleName, value = "", important = false) {
        this._element.style[styleName] = (value ? value : "") + (important ? " !important" : "");
    }
    resetStyle(styleName) {
        this.setStyle(styleName, null);
    }
    getStyle(styleName) {
        return this._element.style[styleName];
    }
    setStyles(map) {
        for (let key in map) {
            if (map.hasOwnProperty(key)) {
                this.setStyle(key, map[key]);
            }
        }
    }
    set tooltip(value) {
        this.addEventListener("hoverover", this.onMouseOver, this);
        this.addEventListener("hoverout", this.onMouseOut, this);
        if (value instanceof gn.ui.basic.Widget) {
            this._tooltip = value;
            this._tooltip.addClass("gn-tooltip");
            this.addClass("gn-tooltip-parent");
        } else if (!gn.lang.Var.isNull(value)) {
            this._tooltip = new gn.ui.basic.Widget();
            this._tooltip.addClass("gn-tooltip");
            this.addClass("gn-tooltip-parent");
            this._tooltipContent = value;
            this._tooltip.label = new gn.ui.basic.Label(value);
            this._tooltip.add(this._tooltip.label)
        } else {
            if (!gn.lang.Var.isNull(this._tooltip)) {
                this._tooltip.dispose();
                delete this._tooltip;
            }
        }
    }
    set tooltipContent(value) {
        if (gn.lang.Var.isNull(value)) {
            this.tooltip = null;
        } else if (gn.lang.Var.isString(value)) {
            this.tooltip = value;
        } else {
            throw new TypeError("gn.ui.basic.Widget.tooltipContent must be a string, localizedString or null");
        }
    }
    get tooltipContent() {
        return this._tooltipContent
    }
    showTooltip() {
        if (!gn.lang.Var.isNull(this._tooltip)) {
            let viewportWidth = document.documentElement.clientWidth;

            this.add(this._tooltip);
            let triggerRect = this.rect;
            let tooltipRect = this._tooltip.rect;

            if (tooltipRect.top < 0) {
                this._tooltip.setStyle("bottom", "-150%");
                this._tooltip.element.style.setProperty("--arrow-rotation", "180deg");
                this._tooltip.element.style.setProperty("--arrow-top", "-40%");

                this._tooltip._wasMoved = true;
            }
            if (tooltipRect.left < 0) {

                this._tooltip.setStyle("left", "0px");
                this._tooltip.setStyle("transform", "none");
                tooltipRect = this._tooltip.rect;
                this._tooltip.setStyle("left", `${-tooltipRect.left+5}px`);
                let arrowMargin = (triggerRect.x + triggerRect.width / 2);
                this._tooltip.element.style.setProperty("--arrow-left", arrowMargin - 5 + "px");
                this._tooltip._wasMoved = true;
            } else if (tooltipRect.right > viewportWidth || tooltipRect.right > document.documentElement.clientWidth) {
                this._tooltip.setStyle("left", "auto");
                this._tooltip.setStyle("right", "0px");

                tooltipRect = this._tooltip.rect;
                this._tooltip.setStyle("right", `${tooltipRect.right - viewportWidth +5}px`);
                tooltipRect = this._tooltip.rect;
                let bIsScrollBarVisible = window.innerWidth > document.documentElement.clientWidth;
                let arrowMargin = (triggerRect.x + triggerRect.width / 2) - tooltipRect.x + !bIsScrollBarVisible * 15;
                this._tooltip.element.style.setProperty("--arrow-left", arrowMargin + "px");
                this._tooltip._wasMoved = true;
            }
        }
    }
    hideTooltip() {
        if (!gn.lang.Var.isNull(this._tooltip)) {
            this.remove(this._tooltip);
            if (this._tooltip._wasMoved) {
                this._tooltip.setStyles({
                    "left": "",
                    "right": "",
                    "top": "",
                    "bottom": "",
                    "transform": ""
                })
                this._tooltip.element.style.removeProperty("--arrow-left");
                this._tooltip.element.style.removeProperty("--arrow-rotate");
                this._tooltip.element.style.removeProperty("--arrow-top");
                delete this._tooltip._wasMoved
            }
        }
    }
    addNativeElement(nativeElement) {
        this.element.appendChild(nativeElement);
        this._children.push("nativeElement");
    }
    removeNativeElement(nativeElement) {
        let index = [...this._element.children].indexOf(nativeElement)
        this.element.removeChild(nativeElement);
        this._children.splice(index, 1);
    }
    add(child) {
        this._addInternal(child);
    }
    addFirst(child) {
        if (this._children.length) {
            this._addInternal(child, "before", this._children[0]);
        } else {
            this._addInternal(child);
        }
    }
    addBefore(child, refChild) {
        this._addInternal(child, "before", refChild);
    }
    addAfter(child, refChild) {
        this._addInternal(child, "after", refChild);
    }
    _addInternal(child, where = null, refChild = null) {
        child.layoutParent?.remove(child);
        child.layoutParent = this;
        if (child.element) {
            switch (where) {
                case "before":
                    gn.lang.Array.insertBefore(this._children, child, refChild);
                    this._element.insertBefore(child.element, refChild.element);
                    break;
                case "after":
                    gn.lang.Array.insertAfter(this._children, child, refChild);
                    this._element.insertBefore(child.element, refChild.element.nextSibling);
                    index++
                    break;
                default:
                    this._children.push(child);
                    this._element.appendChild(child.element);
                    break;
            }
        }
    }
    remove(child) {
        child.layoutParent = null;
        gn.lang.Array.remove(this._children, child);
        this._element.removeChild(child.element);
    }
    get visibility() {
        return this._visibility;
    }
    set visibility(value) {
        if (this._visibility != value) {
            this._visibility = value;
            if (value == "visible") {
                this.removeClass("gn-exclude");
                this.setStyle("visibility", "visible");
            } else if (value == "hidden") {
                this.removeClass("gn-exclude");
                this.setStyle("visibility", "hidden");
            } else if (value == "excluded") {
                this.addClass("gn-exclude");
            }
        }
    }
    show() {
        this.visibility = "visible";
    }
    hide() {
        this.visibility = "hidden";
    }
    exclude() {
        this.visibility = "excluded";
    }
    isVisible() {
        this.visibility == "visible";
    }
    set focusable(value) {
        if (value === true || value >= 0) {
            value = 0;
        } else {
            value = -1;
        }
        this._element.tabIndex = value;
    }
    get focusable() {
        return this._element.tabIndex;
    }
    _createElement(type) {
        return document.createElement(type ? type : "div");
    }
    onMouseOver() {
        if (!gn.lang.Var.isNull(this._tooltip)) {
            this.showTooltip();
        }
    }
    onMouseOut() {
        if (!gn.lang.Var.isNull(this._tooltip)) {
            this.hideTooltip();
        }
    }
    dispose() {
        if (this._element) {
            this._element.remove();
        }
        super.dispose();
    }
}
gn.ui.basic.Label = class gn_ui_basic_Label extends gn.ui.basic.Widget {
    constructor(text, classList) {
        super(null, "label", "gn-label");
        this._text = "";
        this.text = text;
        this.addClasses(classList);
    }
    _destructor() {
        if (this._text instanceof gn.locale.LocaleString) {
            gn.locale.LocaleManager.instance().removeEventListener("changeLocale", this._onLocaleChanged, this);
        }
        super._destructor();
    }
    set text(value) {
        this._text = value;
        this._element.innerText = this._text;

        if (this._text instanceof gn.locale.LocaleString) {
            gn.locale.LocaleManager.instance().addEventListener("changeLocale", this._onLocaleChanged, this);
        }
    }
    get text() {
        return this._text;
    }
    _onLocaleChanged() {
        if (this._text instanceof gn.locale.LocaleString) {
            this.text = this._text.translate();
        }
    }
}
gn.ui.basic.Icon = class gn_ui_basic_Icon extends gn.ui.basic.Widget {
    constructor(size, iconName, iconSet) {
        super(null, "i", "gn-icon");
        this._size = size;
        this._iconName = iconName;
        if (!gn.lang.Var.isNull(iconSet) && !gn.lang.Var.isArray(iconSet)) {
            throw new Error('Icon set must be an array');
        }
        this._iconSet = iconSet || [];
        if (!gn.lang.Var.isArray(this._iconSet)) {
            this._iconSet = [this._iconSet];
        }
        this.addClasses([this._iconName, ...this._iconSet]);
        this.setStyle('font-size', this._size + 'px');
    }
    set iconName(value) {
        this.removeClass(this._iconName);
        this._iconName = value;
        this.addClasses([this._iconName, ...this._iconSet]);
    }
    get iconName() {
        return this._iconName;
    }
    set iconSet(value) {
        this.removeClasses(this._iconSet);
        this._iconSet = value || [];
        this.addClasses([this._iconName, ...this._iconSet]);
    }
    get iconSet() {
        return this._iconSet;
    }
    set size(value) {
        this._size = value;
        this.setStyle('font-size', this._size + 'px');
    }
    get size() {
        return this._size;
    }
}
gn.ui.basic.Image = class gn_ui_basic_Image extends gn.ui.basic.Widget {
    constructor(src, classList) {
        super(null, "img");
        this._element.src = src;
        this._element.className = 'gn-img';
        this.addClasses(classList);
    }
    set src(value) {
        this._element.src = src;
    }
    get src() {
        return this._element.src;
    }
    set alt(value) {
        this._element.alt = value;
    }
    get alt() {
        return this._element.alt;
    }
}
gn.model.TreeModel = class gn_model_TreeModel extends gn.core.Object {
    constructor() {
        super();
        this._data = {};
        this._mapData = {
            null: []
        };
        this._key = "id"
        this._subKey = "subitems";
    }
    set key(value) {
        this._key = value;
    }
    set subKey(value) {
        this._subKey = value;
    }
    rowCount(row = null) {
        return this._mapData[row]?.length || 0;
    }
    index(row, parent = null) {
        if (row >= 0 && row < this.rowCount(parent)) {
            return this._mapData[parent][row];
        }
        return null;
    }
    setDataFromFlat(data, parentKey) {
        this._reset();
        let removedData = {};
        for (let i = 0; i < data.length; i++) {
            if (data[i][parentKey]) {
                let item = data.find(el => el[this._key] == data[i][parentKey])
                if (item) {
                    if (gn.lang.Var.isNull(item.subitems)) {
                        item.subitems = [];
                    }
                    item.subitems.push(data[i]);
                } else {
                    if (gn.lang.Var.isNull(removedData[data[i]].subitems)) {
                        item.subitems = [];
                    }
                    removedData[data[i]].subitems.push(data[i])
                }
                data.splice(data.indexOf(data[i]), 1);
                i--;
            }
        }
        this._setData(data);
        this.sendEvent('dataSet');
    }
    setData(data) {
        this._reset();
        this._setData(data);
        this.sendEvent('dataSet');
    }
    _setData(data, parent = null) {
        if (gn.lang.Var.isArray(data)) {
            data.forEach(obj => {
                this._checkIndex(obj[this._key]);
                this._data[obj[this._key]] = obj;
                this._mapData[parent].push(obj[this._key]);
                if (obj[this._subKey]) {
                    this._ensureChildMapping(obj[this._key]);
                    this._setData(obj[this._subKey], obj[this._key]);
                }
            });
        }
    }
    insertRow(obj, row = this.rowCount(), parent = null) {
        if (gn.lang.Var.isNull(obj)) {
            throw new Error('Data cannot be null');
        }
        if (row < 0 || row > this.rowCount()) {
            row = this.rowCount()
        }
        this._checkIndex(obj[this._key]);

        this._data[obj[this._key]] = obj;
        this._ensureChildMapping(parent);
        this._mapData[parent].splice(row, 0, obj[this._key]);
        if (obj[this._subKey]) {
            this._ensureChildMapping(obj[this._key])
            this._setData(obj[this._subKey], obj[this._key]);
        }
        this.sendEvent('dataAdded', obj[this._key]);
    }
    changeData(index, key, value) {
        if (gn.lang.Var.isNull(index)) {
            throw new Error("Data identifier cannot be null");
        }
        if (gn.lang.Var.isNull(this._data[index])) {
            throw new Error("Data with this id doesn't exist");
        }
        this._data[index][key] = value;
        this.sendEvent("dataChanged", {
            index: index,
            key: key
        })
    }
    moveRow() {
        throw new TypeError("not implemented yet")
    }
    removeData(index) {
        if (gn.lang.Var.isNull(index)) {
            throw new Error('Data item does not have identifier');
        }
        this.sendEvent("beforeDataRemoved", index);
        this._removeData(index, this.parent(index));
        this.sendEvent("dataRemoved", index);
    }
    _removeData(index, parent = undefined) {
        delete this._data[index];
        if (parent !== undefined) {
            this._mapData[parent] = this._mapData[parent].filter(i => i != index);
        }
        this._mapData[index]?.forEach(idx => this._removeData(idx));
        delete this._mapData[index];
    }

    data(index, role = gn.model.Model.DataType.display) {
        if (gn.lang.Var.isNull(index)) {
            throw new Error('Data identifier cannot be null');
        }
        let ret = this._data[index];
        switch (role) {
            case gn.model.Model.DataType.display:
                ret = ret["display"] || ret[this._key];
                break;
            case gn.model.Model.DataType.all:
                break;
            default:
                throw new Error('Invalid type');
                break;
        }
        return ret;
    }
    reset() {
        this._reset();
        this.sendEvent('reset');
    }
    _reset() {
        this._data = {};
        this._mapData = {
            null: []
        };
    }
    _ensureChildMapping(index) {
        if (!this._mapData[index]) {
            this._mapData[index] = [];
        }
    }
    _checkIndex(index) {
        if (gn.lang.Var.isNull(index)) {
            throw new Error('Data item does not have identifier');
        } else if (!gn.lang.Var.isNull(this._data[index])) {
            throw new Error('Every item must have a unique id');
        }
    }
    parent(index) {
        for (let idx in this._mapData) {
            if (this._mapData[idx].includes(index)) {
                if (idx == "null") {
                    return null;
                }
                return idx;
            }
        }
        return null;
    }
    children(index) {
        return this._mapData[index];
    }
}



gn.model.TableModel = class gn_model_TableModel extends gn.core.Object {
    constructor() {
        super();
        throw new TypeError("Not implemented yet");
    }
}
gn.model.FilterSortTreeModel = class gn_model_FilterSortTreeModel extends gn.core.Object {
    constructor(model) {
        super();
        this._source = null;
        this._mapping = {
            null: []
        };

        this._filterCB = null;
        this._filter = null;
        this._sortCB = null;
        this._sort = null;

        this.sourceModel = model;
    }
    get sourceModel() {
        return this._source;
    }
    set sourceModel(value) {
        if (this._source) {

            this._source.stopForwardEvent("reset", this);
            this._source.stopForwardEvent("dataSet", this);
            this._source.stopForwardEvent("dataChanged", this);
            this._source.stopForwardEvent("beforeDataRemoved", this);
            this._source.stopForwardEvent("dataRemoved", this);
            this._source.stopForwardEvent("dataAdded", this);
        }
        this._mapping = {
            null: []
        };
        this._source = value;
        if (this._source) {
            this._source.forwardEvent("reset", this);
            this._source.forwardEvent("dataSet", this);
            this._source.forwardEvent("dataChanged", this);
            this._source.forwardEvent("beforeDataRemoved", this);
            this._source.forwardEvent("dataRemoved", this);
            this._source.forwardEvent("dataAdded", this);
        }
    }
    set filterCB(value) {
        this._filterCB = value;
    }
    set sortCB(value) {
        this._sortCB = value;
    }

    applyFilter(value) {
        this._filter = value;
        this._applyFilterSort();
    }

    applySort(value) {
        this._sort = value;
        this._applyFilterSort();
    }
    _applyFilterSort() {
        this._mapping = {
            null: []
        };
        if (!gn.lang.Var.isNull(this._filter) || !gn.lang.Var.isNull(this._sort)) {
            this._filterInternal();
            if (!gn.lang.Var.isNull(this._sort)) {
                this._sortInternal();
            }
        }
        this.sendEvent("decorationChanged");
    }
    _filterInternal(parent = null) {
        let filterFunc = this._defaultFilter;
        if (this._filterCB) {
            filterFunc = this._filterCB;
        }
        let ret = false;

        for (let i = 0; i < this._source.rowCount(parent); i++) {
            let index = this._source.index(i, parent)
            let bAccept = false;
            if (this._source.children(index)) {
                this._mapping[index] = [];
                bAccept = this._filterInternal(index);
            }
            if (!bAccept) {
                bAccept = filterFunc.call(this, this.data(index, gn.model.Model.DataType.all), this._filter);
            }
            if (bAccept) {
                ret = true;
                this._mapping[parent].push(index)
            }
        }
        return ret
    }
    _defaultFilter(data, filter) {
        let bRet = true;
        for (let key in filter) {
            bRet &= data[key].includes(filter[key]);
        }
        return bRet;
    }
    _sortInternal() {
        let sortFunc = this._defaultSort;
        if (this._sortCB) {
            sortFunc = this._sortCB;
        }
        let swapped;
        let tmp = null;
        for (let key in this._mapping) {
            let n = this._mapping[key].length;
            for (let i = 0; i < n - 1; i++) {
                swapped = false;
                for (let j = 0; j < n - i - 1; j++) {
                    if (sortFunc.call(this, this.data(this._mapping[key][j], gn.model.Model.DataType.all), this.data(this._mapping[key][j + 1], gn.model.Model.DataType.all), this._sort) > 0) {
                        tmp = this._mapping[key][j];
                        this._mapping[key][j] = this._mapping[key][j + 1];
                        this._mapping[key][j + 1] = tmp;
                        swapped = true;
                    }
                }
                if (!swapped)
                    break;
            }
        }
    }
    _defaultSort(dataA, dataB, sort) {
        let ret = 0;
        if (gn.lang.Var.isArray(sort)) {
            for (let sortObj of sort.toReversed()) {
                for (let key in sortObj) {
                    if (gn.lang.Var.isString(dataA[key])) {
                        ret = dataA[key].localeCompare(dataB[key]) * ((sortObj[key] ? 1 : -1));
                        if (ret) {
                            return ret;
                        }
                    }
                }
            }
        }
        return ret;
    }

    set key(value) {
        this._source.key = value;
    }
    set subKey(value) {
        this._subKey = value;
    }
    rowCount(row = null) {
        if (gn.lang.Var.isNull(this._filter) && gn.lang.Var.isNull(this._sort)) {
            return this._source.rowCount(row);
        }
        return this._mapping[row]?.length || 0;
    }
    index(row, parent = null) {
        if (gn.lang.Var.isNull(this._filter) && gn.lang.Var.isNull(this._sort)) {
            return this._source.index(row, parent);
        }
        if (row >= 0 && row < this.rowCount(parent)) {
            return this._mapping[parent][row];
        }
        return null;
    }
    setDataFromFlat(...args) {
        return this._source ? this._source.setDataFromFlat(...args) : null;
    }
    setData(data) {
        return this._source ? this._source.setData(data) : null;
    }
    changeData(index, key, value) {
        return this._source ? this._source.changeData(index, key, value) : null;
    }
    data(index, role) {
        return this._source ? this._source.data(index, role) : null;
    }
    reset() {
        return this._source ? this._source.reset() : null;
    }
    insertRow(...args) {
        return this._source ? this._source.insertRow(...args) : null;
    }
    moveRow() {
        return this._source ? this._source.moveRow(index) : null;
    }
    removeData(index) {
        return this._source ? this._source.removeData(index) : null;
    }
    parent(index) {
        return this._source ? this._source.parent(index) : null;
    }
    children(index) {
        return this._source ? this._source.children(index) : null;
    }
}
gn.model.filterSortTableModel = class gn_model_filterSortTableModel extends gn.core.Object {
    constructor() {
        super();
        throw new TypeError("Not implemented yet");
    }
}
gn.model.selectionModel = class gn_model_selectionModel extends gn.core.Object {
    constructor() {
        super();
        throw new TypeError("Not implemented yet");
    }
}
gn.model.Model = {};
gn.model.Model.DataType = gn.lang.Enum({
    display: 1,
    all: 2,
});
gn.model.Model.Type = gn.lang.Enum({
    item: 1,
    group: 2
});
gn.ui.layout.AbstractLayout = class gn_ui_layout_AbstractLayout extends gn.core.Object {
    constructor() {
        super();
        this._widget = null;
        this._gap = 0;
    }
    set widget(value) {
        if (gn.lang.Var.isNull(value)) {
            if (this._widget) {
                this._widget.removeClasses(this._getClasses());
                this._widget = null;
            }
            return;
        } else if (!(value instanceof gn.ui.basic.Widget)) {
            throw new Error("Widget must be instance of Widget");
        }
        this._widget = value;
        this._widget.addClasses(this._getClasses());
        this._widget.setStyles(this._getStyles());
    }
    get gap() {
        return this._gap;
    }
    set gap(value) {
        if (!gn.lang.Var.isString(value) && (!gn.lang.Var.isNumber(value) || value < 0)) {
            throw new Error("Spacing must be a non-negative number or any of the permited strings");
        }
        this._gap = value;
        if (this._widget) {
            value = gn.lang.Var.isNumber(value) ? value + "px" : value;
            this._widget.setStyle("gap", value);
        }
    }
    _getClasses() {
        throw new Error("Abstract method _getClasses must be implemented in subclass");
    }
    _getStyles() {
        throw new Error("Abstract method _getStyles must be implemented in subclass");
    }
}
gn.ui.layout.Box = class gn_ui_layout_Box extends gn.ui.layout.AbstractLayout {
    constructor(direction, gap = 0, wrap = false) {
        super();
        this._direction = direction;
        this._gap = 0;
        this._wrap = false;
        if (!gn.lang.Var.isNull(gap)) {
            this.gap = gap;
        }
        if (!gn.lang.Var.isNull(wrap)) {
            this.wrap = wrap;
        }
    }
    get direction() {
        return this._direction;
    }
    set direction(value) {
        if (this._widget) {
            this.widget.removeClasses(this._getClasses());
        }
        this._direction = value;
        if (this._widget) {
            this.widget.addClasses(this._getClasses());
        }
    }
    get wrap() {
        return this._wrap;
    }
    set wrap(value) {
        if (typeof value !== "boolean") {
            throw new Error("Wrap must be a boolean");
        }
        this._wrap = value;
        if (this._widget) {
            this._widget.setStyle("flex-wrap", value ? "wrap" : "nowrap");
        }
    }
    _getClasses() {
        return "gn-layout-box " + (this.direction === gn.ui.layout.direction.Row ? "gn-layout-row" : "gn-layout-column");
    }
    _getStyles() {
        let ret = {};
        if (this.spacing != 0) {
            ret["gap"] = this.spacing + "px";
        }
        if (this.wrap) {
            ret["flex-wrap"] = "wrap";
        }
        return ret;
    }
}
gn.ui.layout.Row = class gn_ui_layout_Row extends gn.ui.layout.Box {
    constructor(spacing, wrap) {
        super(gn.ui.layout.direction.Row, spacing, wrap);
    }
}
gn.ui.layout.Column = class gn_ui_layout_Column extends gn.ui.layout.Box {
    constructor(spacing, wrap) {
        super(gn.ui.layout.direction.Column, spacing, wrap);
    }
}
gn.ui.layout.Grid = class gn_ui_layout_Grid extends gn.ui.layout.AbstractLayout {
    constructor(columns, rows, gap) {
        super();
        this._templateColumns = null;
        this._templateRows = null;
        this._columns = null;
        this._rows = null;

        this.templateColumns = "auto";
        this.templateRows = "auto";
        if (!gn.lang.Var.isNull(columns)) {
            this.templateColumns = columns;
        }
        if (!gn.lang.Var.isNull(rows)) {
            this.templateRows = rows;
        }
        if (!gn.lang.Var.isNull(gap)) {
            this.gap = gap;
        }
    }
    get columns() {
        return this._columns;
    }
    set columns(value) {
        if (!gn.lang.Var.isNumber(value)) {
            throw new Error("Columns must be a number");
        }
        if (value < 1) {
            throw new Error("Columns must be a positive number");
        }
        this._columns = value;
        this._templateColumns = "repeat(" + value + ", 1fr)";
        if (this._widget) {
            this._widget.setStyle("grid-template-columns", this._templateColumns);
        }
    }
    get templateColumns() {
        return this._templateColumns;
    }
    set templateColumns(value) {
        if (!gn.lang.Var.isString(value) && !gn.lang.Var.isArray(value) && !gn.lang.Var.isNumber(value) && !gn.lang.Var.isNumber(value)) {
            throw new Error("Row template must be a string of sizes, e.g. '100px 200px auto' or 'repeat(3, 1fr)' or array of those values or number");
        } else if (gn.lang.Var.isArray(value)) {
            value = value.join(" ");
        } else if (gn.lang.Var.isNumber(value)) {
            this.columns = value;
            return;
        }
        this._columns = null;
        this._templateColumns = value;
        if (this._widget) {
            this._widget.setStyle("grid-template-columns", this._templateColumns);
        }
    }
    get rows() {
        return this._rows;
    }
    set rows(value) {
        if (!gn.lang.Var.isNumber(value)) {
            throw new Error("Columns must be a number");
        }
        if (value < 1) {
            throw new Error("Columns must be a positive number");
        }
        this._rows = value;
        this._templateRows = "repeat(" + value + ", 1fr)";
        if (this._widget) {
            this._widget.setStyle("grid-template-rows", this._templateRows);
        }
    }
    get templateRows() {
        return this._templateRows;
    }
    set templateRows(value) {
        if (!gn.lang.Var.isString(value) && !gn.lang.Var.isArray(value) && !gn.lang.Var.isNumber(value) && !gn.lang.Var.isNumber(value)) {
            throw new Error("Row template must be a string of sizes, e.g. '100px 200px auto' or 'repeat(3, 1fr)' or array of those values or number");
        } else if (gn.lang.Var.isArray(value)) {
            value = value.join(" ");
        } else if (gn.lang.Var.isNumber(value)) {
            this.rows = value;
            return;
        }
        this._rows = null;
        this._templateRows = value;
        if (this._widget) {
            this._widget.setStyle("grid-template-rows", this._templateRows);
        }
    }
    _getClasses() {
        return "gn-layout-grid";
    }
    _getStyles() {
        let ret = {};
        if (!gn.lang.Var.isNull(this.templateColumns)) {
            ret["grid-template-columns"] = this.templateColumns;
        }
        if (!gn.lang.Var.isNull(this.templateRows)) {
            ret["grid-template-rows"] = this.templateRows;
        }
        if (this.spacing != 0) {
            ret["gap"] = this.spacing ?? 0 + "px";
        }
        return ret;
    }
}

gn.ui.layout.direction = gn.lang.Enum({
    Row: 1,
    Column: 2
})
gn.helper.FormDataFileUpload = class gn_helper_FormDataFileUpload extends gn.core.Object {

    constructor() {
        super();
        this._formData = new FormData();
        this._filechunks = [];
        this._currentChunkIndex = 0;
        this._done = true;
    }
    get formData() {
        return this._formData;
    }
    get done() {
        return this._done;
    }
    addField(key, value) {
        this._formData.append(key, value);
    }
    clearFiles() {
        this._formData.delete("file");
        this._formData.delete("fp");
        this._formData.delete("tp");
    }
    addFile(file) {
        let sizeToSplit = 0;
        if (file.size > gn.helper.FormDataFileUpload.maxFileSize) {
            sizeToSplit = gn.helper.FormDataFileUpload.maxFileSize;
        }
        if (file.size + this._size() + 630 > gn.helper.FormDataFileUpload.maxPostSize) {
            let newFileToSplit = gn.helper.FormDataFileUpload.maxPostSize - this._size() - 630;
            sizeToSplit = Math.min(sizeToSplit, newFileToSplit);
        }
        if (!sizeToSplit) {
            this._formData.append("file", file);
            this.sendEvent("send", this._formData);
        } else {
            this._filechunks = this._splitFile(file, sizeToSplit);
            this._done = false;
            this.sendChunk();
        }
    }
    sendChunk() {
        if (this._done) {
            return;
        }
        this._formData.append("file", this._filechunks[this._currentChunkIndex]);
        this._formData.append("fp", ++this._currentChunkIndex);
        this._formData.append("tp", this._filechunks.length);
        this.sendEvent("send", this._formData);
        this.clearFiles();
        if (this._currentChunkIndex == this._filechunks.length) {
            this._done = true;
        }
    }
    _size() {
        let total = 0;
        for (let [key, value] of this._formData.entries()) {
            total += new TextEncoder().encode(key).length;

            if (typeof value === "string") {
                total += new TextEncoder().encode(value).length;
            } else if (value instanceof Blob || value instanceof File) {
                total += value.size;
            }
            total += 200;
        }
        return total;
    }
    _splitFile(file, chunkSize) {
        const chunks = [];
        let offset = 0;
        let chunkIndex = 0;

        while (offset < file.size) {
            const chunk = file.slice(offset, offset + chunkSize);

            const chunkFile = new window.File([chunk], file.name, {
                type: file.type,
                lastModified: file.lastModified,
            });

            chunks.push(chunkFile);
            offset += chunkSize;
            chunkIndex++;
        }

        return chunks;
    }
}
gn.helper.FormDataFileUpload.maxFileSize = 1024 * 1024 * 2;
gn.helper.FormDataFileUpload.maxFileNum = 20;
gn.helper.FormDataFileUpload.maxPostSize = 1024 * 1024 * 8;
gn.app.App = class gn_app_App extends gn.core.Object {
    constructor() {
        super();
        this._root = null;
        this._header = null
        this._footer = null;
    }
    static instance() {
        if (gn.app.App._instance == null) {
            throw new Error("Application class not initialized. Call startup() first.");
        }
        return gn.app.App._instance;
    }
    static startup(appClass) {
        if (gn.app.App._instance == null) {
            if (appClass == null) {
                throw new Error("Application class cannot be null");
            }
            if (appClass == gn.app.App) {
                throw new Error("Application class cannot be the abstract class");
            }

            gn.app.App._instance = new appClass();
            gn.app.App.instance().main();
        }
        return gn.app.App._instance;
    }
    main() {
        window.addEventListener("resize", function() {
            this.sendEvent("resize")
        }.bind(this));
    }
    set root(root) {
        this._root = root;
        document.body.appendChild(root.element);
    }
    get root() {
        return this._root;
    }
    set header(header) {
        document.body.prepend(header.element);
        this._header = header;
    }
    get header() {
        return this._header;
    }
    async request(url, data) {
        let promise = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (!promise.ok) {
            throw new Error('Network response was not ok' + promise.statusText);
        }
        return promise;
    }
    async requestJ(url, data) {
        let promise = await this.request(url, data);
        return await promise.json();
    }
    async requestT(url, data) {
        let promise = await this.request(url, data);
        return await promise.text();
    }
    async requestA(url, data) {
        let promise = await this.request(url, data);
        return await promise.arrayBuffer();
    }
    getLocalePath() {
        return ["./gn/translations/"];
    }
}
gn.app.App._instance = null;
gn.ui.list.List = class gn_ui_list_List extends gn.ui.basic.Widget {
    constructor() {
        super();

        this._model = null;
        this._idElementMap = new Map();
        this._groups = new Map();
        this._itemClass = gn.ui.list.ListItem;
        this._titleClass = gn.ui.list.ListTitle;
    }
    set itemClass(value) {
        this._itemClass = value;
    }
    get itemClass() {
        return this._itemClass;
    }
    set titleClass(value) {
        this._titleClass = value;
    }
    get titleClass() {
        return this._titleClass;
    }
    get model() {
        return this._model;
    }
    set model(value) {
        if (this._model) {
            this._model.removeEventListener("dataSet", this._onDataSet, this);
            this._model.removeEventListener("dataAdded", this._onDataAdded, this);
            this._model.removeEventListener("reset", this._onReset, this);
            this._model.removeEventListener("beforeDataRemoved", this._onRemoveData, this);
            this._model.removeEventListener("dataRemoved", this._onDataRemoved, this);
            this._model.removeEventListener("dataChanged", this._onDataChanged, this);
            this._model.removeEventListener("decorationChanged", this._onReset, this);
        }
        this._model = value;
        if (this._model) {
            this._model.addEventListener("dataSet", this._onDataSet, this);
            this._model.addEventListener("dataAdded", this._onDataAdded, this);
            this._model.addEventListener("reset", this._onReset, this);
            this._model.addEventListener("beforeDataRemoved", this._onRemoveData, this);
            this._model.addEventListener("dataRemoved", this._onDataRemoved, this);
            this._model.addEventListener("dataChanged", this._onDataChanged, this);
            this._model.addEventListener("decorationChanged", this._onDecorationChanged, this);
        }
    }
    _onDataSet(e) {
        this._openGroup();
    }
    _onDataAdded(e) {
        let id = e.data;
        let parent = this.model.parent(id);
        if (this._groups.has(parent)) {
            this._makeItem(id);
            this._openGroup(parent);
        }
    }
    _onReset() {
        for (let item of this._idElementMap.values()) {
            item.dispose();
        }
        this._idElementMap = new Map();
        this._groups = new Map();
        this._currentGroup = null;
        this._openGroup();
    }
    _onDecorationChanged() {
        for (let item of this._idElementMap.values()) {
            item.dispose();
        }
        this._idElementMap = new Map();
        this._groups = new Map();
        this._openGroup(this._currentGroup);
    }
    _onRemoveData(e) {
        let id = e.data;
        if (this._groups.has(id)) {
            if (this._groups.get(id).length != 0) {
                throw new Error('Group has children, cannot be removed.');
            }
        }
        if (this._idElementMap.has(id)) {
            this.remove(this._idElementMap.get(id));
            this._idElementMap.delete(id);
        }
        let parent = this.model.parent(id);
        if (this._groups.has(parent)) {
            let ids = this._groups.get(parent);
            let index = ids.indexOf(id);
            if (index > -1) {
                ids.splice(index, 1);
            }
        }
        this.genFakeTileItems();
    }
    _onDataRemoved(e) {}
    _onDataChanged(e) {
        this._idElementMap.get(e.data.index).updateItem(this.model.data(e.data.index, gn.model.Model.DataType.all), e.data.key);
    }
    _makeGroup(id) {
        if (gn.lang.Var.isNull(id)) {
            id = null;
        }
        this._groups.set(id, []);

        let count = this._model.rowCount(id);
        for (let i = 0; i < count; i++) {
            let index = this._model.index(i, id);
            let data = this._model.data(index, gn.model.Model.DataType.all);
            let item = null
            if (data.type == gn.model.Model.Type.item) {
                item = new this._itemClass(data, this);
            } else if (data.type == gn.model.Model.Type.group) {
                item = new this._titleClass(data, this);
                item.addEventListener("openGroup", this.openGroup, this);
            } else {
                throw ("Invalid type of item in List");
            }
            this._idElementMap.set(index, item);
            this._groups.get(id).push(index);
            this.add(item);
        }
    }
    _openGroup(id) {
        if (gn.lang.Var.isNull(id)) {
            id = null;
        }
        if (!this._groups.has(this._currentGroup)) {
            this._makeGroup(this._currentGroup);
            return;
        }
        let ids = this._groups.get(this._currentGroup)
        for (let i = 0; i < ids.length; i++) {
            this._idElementMap.get(ids[i]).exclude();
        }
        this._currentGroup = id;
        if (this._groups.has(this._currentGroup)) {
            ids = this._groups.get(this._currentGroup)
            for (let i = 0; i < ids.length; i++) {
                this._idElementMap.get(ids[i]).show();
            }
        } else {
            this._makeGroup(this._currentGroup);
        }
        this.sendEvent("groupOpened", this._currentGroup);
        if (this._breadcrumb) {
            this._breadcrumb.setIndex(this._currentGroup);
        }
    }
    openGroup(e) {
        this._openGroup(e.data);
    }
}
gn.ui.list.ListItem = class gn_ui_list_ListItem extends gn.ui.basic.Widget {
    constructor(data) {
        super(null, "div", "gn-listItem");
        this._data = data;
    }
    updateItem(data, key) {
        this._data = data;

    }
}
gn.ui.list.ListTitle = class gn_ui_list_ListTitle extends gn.ui.basic.Widget {
    constructor(data) {
        super(null, "div", "gn-listTitle");
        this._data = data;
    }
    updateItem(data, key) {
        this._data = data;

    }
}
gn.ui.container.Row = class gn_ui_container_Row extends gn.ui.basic.Widget {
    constructor(classList) {
        super(new gn.ui.layout.Row(), "div", classList);
    }
}
gn.ui.container.Column = class gn_ui_container_Column extends gn.ui.basic.Widget {
    constructor(classList) {
        super(new gn.ui.layout.Column(), "div", classList);
    }
}
gn.ui.container.Grid = class gn_ui_container_Grid extends gn.ui.basic.Widget {
    constructor(classList) {
        super(new gn.ui.layout.Grid(), "div", classList);
    }
}
gn.ui.container.Stack = class gn_ui_container_Stack extends gn.ui.basic.Widget {
    constructor(classList) {
        super(null, "div", classList);
        this._order = []
        this._currentWidget;
        this._prevWidget;

        this._animDir = null;
        this._animLoop = false;
        this._animBounceDir = true;
        this._animnOnEdge = true;
        this.addClass("gn-stack");

    }
    get currentWidget() {
        return this._currentWidget;
    }

    add(child, animation) {
        child.addClass("gn-stack-child");
        super.add(child);
        this._order.push(child);
        if (!this._currentWidget) {
            this._currentWidget = child;
        } else {
            child.exclude();
        }
    }
    remove(child) {
        child.removeClass("gn-stack-child");
        super.remove(child);
        if (child == this._currentWidget) {
            this.next();
        }
        this._order.splice(this._order.indexOf(child), 1)
    }

    setAnimationMode(dir, loop = true) {
        if (!["left", "right", "up", "down"].includes(dir)) {
            this._animDir = null;
            return;
        }
        this._animDir = dir;
        this._animLoop = loop;
    }
    activate(widget, forward = true) {
        this._prevWidget = this._currentWidget;
        this._currentWidget = widget;

        let x = this._processAnimation(this._prevWidget, true, forward);
        x ? this._prevWidget.setStyle("transform", x) : null;


        let y = this._processAnimation(this._currentWidget, false, forward);
        y ? this._currentWidget.setStyle("transform", y) : null;
        this._currentWidget.show();

        if (x) {
            gn.event.Timer.singleShot(this, () => {
                this._currentWidget.setStyle("transform", "translate( 0 )");
            }, 1);
            gn.event.Timer.singleShot(this, () => {
                this._prevWidget.exclude();
            }, 500);
        } else {
            this._prevWidget.exclude();
        }
    }
    _processAnimation(widget, out, forward) {
        if (!this._animDir) {
            return null;
        }
        if (this._animLoop) {
            return this._animHelper(this._animDir, forward == out);
        } else {
            let ret = this._animHelper(this._animDir, (forward == out));
            if (!out) {
                let i = this._order.indexOf(widget)
                if ((this._animDir == "right" || this._animDir == "down")) {
                    this._animBounceDir ? i++ : i--;
                } else {
                    this._animBounceDir ? i-- : i++;
                }
                this._animnOnEdge = false;
                if (i < 0) {
                    this._animBounceDir = true;
                    this._animnOnEdge = true;
                } else if (i >= this._order.length) {
                    this._animBounceDir = false;
                    this._animnOnEdge = true;
                }
            }
            return ret;
        }
        return

    }
    _animHelper(dir, forward) {
        let ret = 100;
        if (dir == "left" || dir == "up") {
            ret = -100;
        }
        if (!forward) {
            ret *= -1;
        }
        if (dir == "up" || dir == "down") {
            return "translate( 0," + ret + "%)";
        }
        return "translate(" + ret + "%)";
    }
    next(skip = false) {
        if (!this._animLoop && !this._animBounceDir && !skip) {
            this.previous(true);
            return;
        }
        let i = this._order.indexOf(this._currentWidget) + 1;
        this.activate(this._order[(i >= this._order.length ? 0 : i)], true);
    }
    previous(skip = false) {
        if (!this._animLoop && this._animBounceDir && !skip) {
            this.next(true);
            return;
        }
        let i = this._order.indexOf(this._currentWidget) - 1;
        this.activate(this._order[(i < 0 ? this._order.length - 1 : i)], false);
    }
}
gn.ui.container.Split = class gn_ui_container_Split extends gn.ui.basic.Widget {
    constructor(layout, handleSize = 5) {
        super(layout || new gn.ui.layout.Row, "div", "gn-split");
        this._handleSize = handleSize;
    }
    _addInternal(child, where, refChild) {
        if (!this._children.length) {
            super._addInternal(child, where, refChild);
            return;
        }
        if (gn.lang.Var.isNull(child) || gn.lang.Var.isNull(child.element)) {
            throw new Error('Element cannot be null');
        }
        super._addInternal(new gn.ui.container.SplitHandle(this.layoutManager.direction, this._handleSize), where, refChild);
        super._addInternal(child, where, refChild);
        for (let i = 1; i < this._children.length - 1; i += 2) {
            this._children[i].before = this._children[i - 1];
            this._children[i].after = this._children[i + 1];
        }
        gn.event.Timer.singleShot(this, this._devideSize);
    }
    _devideSize() {
        let num = Math.ceil(this._children.length / 2);
        let widthOfHandles = Math.floor(this._children.length / 3) * this._handleSize * 100 / this.size.width;
        let a = (100 - widthOfHandles);
        a = a / num + "%";
        for (let child of this._children) {
            if (!(child instanceof gn.ui.container.SplitHandle)) {
                if (this.layoutManager.direction == gn.ui.layout.direction.Row) {
                    child.width = a;
                    child.height = "100%";
                } else {
                    child.height = a;
                    child.width = "100%";
                }
            }
        }
    }
}
gn.ui.container.SplitHandle = class gn_ui_container_SplitHandle extends gn.ui.basic.Widget {
    constructor(direction, size) {
        super(null, "div", "gn-split-handle");
        this._direction = direction;
        this._before = null;
        this._after = null;
        this._splitSize = null;
        this._originalPosition = null;
        this._handleSize = size;
        if (direction == gn.ui.layout.direction.Row) {
            this.height = "100%";
            this.width = size;
        } else {
            this.width = "100%";
            this.height = size;
        }
        this.addEventListener("dragstart", this._onDragStart, this);
        this.addEventListener("drag", this._onDrag, this);
        this.addEventListener("dragend", this._onDragStop, this);
    }
    set before(value) {
        this._before = value;
    }
    get before() {
        return this._before;
    }
    set after(value) {
        this._after = value;
    }
    get after() {
        return this._after;
    }
    _onDrag(e) {

        if (e.clientX == 0 && e.clientY == 0) {
            return;
        }
        if (this._moving) {
            if (this._direction == gn.ui.layout.direction.Column) {
                var delta = e.clientY - this._originalPosition.y;
                var b = (this._beforeSize.height + delta) * 100 / this._splitSize.height;
                var a = (this._afterSize.height - delta) * 100 / this._splitSize.height;
                this._before.height = b + "%";
                this._after.height = a + "%";
            } else {
                var delta = e.clientX - this._originalPosition.x;
                var b = (this._beforeSize.width + delta) * 100 / this._splitSize.width;
                var a = (this._afterSize.width - delta) * 100 / this._splitSize.width;
                this._before.width = b + "%";
                this._after.width = a + "%";
            }
            return false;
        }
    }
    _onDragStart(e) {
        this._moving = true;
        this._splitSize = this.layoutParent.size;
        this._originalPosition = {
            x: e.clientX,
            y: e.clientY
        };
        this._beforeSize = this._before.size;
        this._afterSize = this._after.size;
    }
    _onDragStop(e) {
        this._moving = false;
        this._splitSize = null;
        this._originalPosition = null;
        this._beforeSize = null;
        this._afterSize = null;
    }
}
gn.ui.container.ScrollCustom = class gn_ui_container_ScrollCustom extends gn.ui.basic.Widget {
    constructor(content, classList) {
        super(null, null, classList);
        this.addClass("gn-scroll")

        this._body = content || new gn.ui.basic.Widget();
        this._body.addClass("body");
        super._addInternal(this._body);

        this._body.addEventListener("scroll", this._onScroll, this);

        this._speed = 0.2;

        super._addInternal(new gn.ui.container.ScrollBar(this, gn.ui.layout.direction.Row));
        super._addInternal(new gn.ui.container.ScrollBar(this, gn.ui.layout.direction.Column));
    }

    get body() {
        return this._body;
    }

    _addInternal(child, where, refChild) {
        this._body._addInternal(child, where, refChild);
    }

    remove(child) {
        this._body.remove(child);
    }

    _getClampedOffsets(y, x) {
        const maxScrollTop = Math.max(0, this._body.element.scrollHeight - this.element.clientHeight);
        const maxScrollLeft = Math.max(0, this._body.element.scrollWidth - this.element.clientWidth);

        return {
            y: Math.max(0, Math.min(maxScrollTop, y)),
            x: Math.max(0, Math.min(maxScrollLeft, x))
        };
    }

    scrollTo(x, y) {
        const currentY = -parseFloat(this._body.element.style.top || 0);
        const currentX = -parseFloat(this._body.element.style.left || 0);

        y = (y === null || typeof y === 'undefined') ? currentY : y;
        x = (x === null || typeof x === 'undefined') ? currentX : x;

        const clamped = this._getClampedOffsets(y, x);

        this._body.element.style.top = (-clamped.y) + "px";
        this._body.element.style.left = (-clamped.x) + "px";

        this.sendEvent("scrolled");
    }

    scrollBy(x, y) {
        const currentY = -parseFloat(this._body.element.style.top || 0);
        const currentX = -parseFloat(this._body.element.style.left || 0);

        const targetY = currentY + (y || 0);
        const targetX = currentX + (x || 0);

        this.scrollTo(targetX, targetY);
    }

    _onScroll(e) {

        const power = 1.2;
        const dynamicY = Math.pow(Math.abs(e.deltaY), power) * Math.sign(e.deltaY);
        const dynamicX = Math.pow(Math.abs(e.deltaX), power) * Math.sign(e.deltaX);

        this.scrollBy(this._speed * dynamicX, this._speed * dynamicY);
    }
}
gn.ui.container.ScrollBar = class gn_ui_container_ScrollBar extends gn.ui.basic.Widget {
    constructor(scroll, orientation, classList) {
        super(null, "div", classList);
        this.addClass("gn-scrollbar");
        this._orientation = orientation;
        this._scroll = scroll;
        this._wheelScrollSpeed = 0.1;

        this._thumb = new gn.ui.basic.Widget(null, "div", "thumb");

        if (gn.ui.layout.direction.Row == orientation) {
            this.addClass("horizontal");
            this._thumb.setStyle("width", "100px");
            this._thumb.setStyle("height", "100%");
        } else {
            this.addClass("vertical");
            this._thumb.setStyle("height", "100px");
            this._thumb.setStyle("width", "100%");
        }

        this.addEventListener("scroll", this._onTumbScrolled, this);
        this._thumb.addEventListener("dragstart", this._onDragStart, this);
        this._thumb.addEventListener("drag", this._onDrag, this);
        this._thumb.addEventListener("dragend", this._onDragStop, this);
        this.add(this._thumb);

        this._scroll.addEventListener("scrolled", this._updatePositionOfThumb, this);

        gn.event.Timer.singleShot(this, () => {
            this._updateLengthOfThumb();
        });
    }

    _updateLengthOfThumb() {
        if (gn.ui.layout.direction.Row == this._orientation) {
            let width = this.width;
            let contentWidth = this._scroll.body.width;
            let thumbWidth = Math.max(20, width * width / contentWidth);
            this._thumb.setStyle("width", thumbWidth + "px");
            if (thumbWidth >= width) {
                this.exclude();
            } else {
                this.show();
            }
        } else {
            let height = this.height;
            let contentHeight = this._scroll.body.height;
            let thumbHeight = Math.max(20, height * height / contentHeight);
            this._thumb.setStyle("height", thumbHeight + "px");
            if (thumbHeight >= height) {
                this.exclude();
            } else {
                this.show();
            }
        }
    }

    _updatePositionOfThumb() {
        if (gn.ui.layout.direction.Row == this._orientation) {
            let scrollLeft = -parseFloat(this._scroll.body.element.style.left || 0);
            let contentWidth = this._scroll.body.width;
            let thumbLeft = scrollLeft * this.width / contentWidth;
            this._thumb.setStyle("left", thumbLeft + "px");
        } else {
            let scrollTop = -parseFloat(this._scroll.body.element.style.top || 0);
            let contentHeight = this._scroll.body.height;
            let thumbTop = scrollTop * this.height / contentHeight;
            this._thumb.setStyle("top", thumbTop + "px");
        }
    }

    _onDrag(e) {
        console.log(e.clientX, e.clientY)
        if (e.clientX == 0 && e.clientY == 0) {
            return;
        }
        if (this._moving) {
            if (this._orientation == gn.ui.layout.direction.Column) {
                var delta = e.clientY - this._originalPosition.y;
                this._scroll.scrollBy(0, delta * this._scroll.body.height / this.height);
            } else {
                var delta = e.clientX - this._originalPosition.x;
                this._scroll.scrollBy(delta * this._scroll.body.width / this.width, 0);
            }
            this._originalPosition = {
                x: e.clientX,
                y: e.clientY
            };
            console.log("orig", this._originalPosition)
            return false;
        }
    }
    _onDragStart(e) {
        this._moving = true;
        this._originalPosition = {
            x: e.clientX,
            y: e.clientY
        };
    }
    _onDragStop(e) {
        this._moving = false;
        this._originalPosition = null;
    }
    _onTumbScrolled(e) {
        console.log(e)
        if (this._orientation == gn.ui.layout.direction.Column) {
            var delta = e.deltaY * this._wheelScrollSpeed;
            this._scroll.scrollBy(0, delta * this._scroll.body.height / this.height);
        } else {
            var delta = e.deltaX * this._wheelScrollSpeed;
            this._scroll.scrollBy(delta * this._scroll.body.width / this.width, 0);
        }
    }
}
gn.ui.container.ScrollSys = class gn_ui_container_ScrollSys extends gn.ui.basic.Widget {
    constructor(content, classList) {
        super(null, null, classList);
        this.addClass("gn-scroll-sys")

        this._body = content || new gn.ui.basic.Widget();
        this._body.addClass("body");
        super._addInternal(this._body);

        this._speed = 0.2;
    }

    get body() {
        return this._body;
    }

    _addInternal(child, where, refChild) {
        this._body._addInternal(child, where, refChild);
    }

    remove(child) {
        this._body.remove(child);
    }

    scrollTo(x, y) {
        this.element.scrollTo(x, y);
    }

    scrollBy(x, y) {
        this.element.scrollBy(x, y);
    }
}
gn.ui.container.Scroll = class gn_ui_container_Scroll extends gn.ui.container.ScrollCustom {}
gn.ui.tile.TileContainer = class gn_ui_tile_TileContainer extends gn.ui.basic.Widget {
    constructor(details) {
        super(new gn.ui.layout.Row(), "div", "gn-tileContainer");
        this._model = null;
        this._idElementMap = new Map();
        this._groups = new Map();
        this._currentGroup = null;
        this._breadcrumb = null;
        this._fakeTiles = [];

        this._details = gn.lang.Object.merge({
            "header": true,
            "sort": false,
            "filter": false,
        }, details)

        this._tileClass = gn.ui.tile.TileItem;
        this._fakeTileClass = gn.ui.tile.FakeTileItem;
        this._subItemContClass = gn.ui.tile.TileSubItemContainer
        if (this._details.header) {
            this._header = new gn.ui.container.Row("gn-tileContainerHeader");
        }
        this.add(this._header);

        gn.app.App.instance().addEventListener("resize", this.genFakeTileItems, this);
    }
    set tileClass(value) {
        this._tileClass = value;
    }
    get tileClass() {
        return this._tileClass;
    }
    set subItemContClass(value) {
        this._subItemContClass = value;
    }
    get subItemContClass() {
        return this._subItemContClass;
    }
    set fakeTileClass(value) {
        this._fakeTileClass = value;
    }
    get fakeTileClass() {
        return this._fakeTileClass;
    }
    set model(value) {
        if (this._model) {
            this._model.removeEventListener("dataSet", this._onDataSet, this);
            this._model.removeEventListener("dataAdded", this._onDataAdded, this);
            this._model.removeEventListener("reset", this._onReset, this);
            this._model.removeEventListener("beforeDataRemoved", this._onRemoveData, this);
            this._model.removeEventListener("dataRemoved", this._onDataRemoved, this);
            this._model.removeEventListener("dataChanged", this._onDataChanged, this);
            this._model.removeEventListener("decorationChanged", this._onReset, this);
        }
        this._model = value;
        if (this._model) {
            this._model.addEventListener("dataSet", this._onDataSet, this);
            this._model.addEventListener("dataAdded", this._onDataAdded, this);
            this._model.addEventListener("reset", this._onReset, this);
            this._model.addEventListener("beforeDataRemoved", this._onRemoveData, this);
            this._model.addEventListener("dataRemoved", this._onDataRemoved, this);
            this._model.addEventListener("dataChanged", this._onDataChanged, this);
            this._model.addEventListener("decorationChanged", this._onDecorationChanged, this);
        }
    }
    get model() {
        return this._model;
    }
    set breadcrumb(value) {
        this._breadcrumb = value;
        this._breadcrumb.addEventListener("triggered", this.openGroup, this)
    }
    get breadcrumb() {
        return this._breadcrumb;
    }
    _onDataSet() {
        this._openGroup();
    }
    _onDataAdded(e) {
        let id = e.data;
        let parent = this.model.parent(id);
        if (this._groups.has(parent)) {
            this._makeItem(id);
            this._openGroup(parent);
        }
    }
    _onReset() {
        for (let item of this._idElementMap.values()) {
            item.dispose();
        }
        this._idElementMap = new Map();
        this._groups = new Map();
        this._currentGroup = null;
        this._openGroup();
    }
    _onDecorationChanged() {
        for (let item of this._idElementMap.values()) {
            item.dispose();
        }
        this._idElementMap = new Map();
        this._groups = new Map();
        this._openGroup(this._currentGroup);
    }
    _onRemoveData(e) {
        let id = e.data;
        if (this._groups.has(id)) {
            if (this._groups.get(id).length != 0) {
                throw new Error('Group has children, cannot be removed.');
            }
        }
        if (this._idElementMap.has(id)) {
            this.remove(this._idElementMap.get(id));
            this._idElementMap.delete(id);
        }
        let parent = this.model.parent(id);
        if (this._groups.has(parent)) {
            let ids = this._groups.get(parent);
            let index = ids.indexOf(id);
            if (index > -1) {
                ids.splice(index, 1);
            }
        }
        this.genFakeTileItems();
    }
    _onDataRemoved(e) {}
    _onDataChanged(e) {
        this._idElementMap.get(e.data.index).updateItem(this.model.data(e.data.index, gn.model.Model.DataType.all), e.data.key);
    }
    _makeItem(id) {
        let data = this._model.data(id, gn.model.Model.DataType.all);
        let item = null
        if (data.type == gn.model.Model.Type.item) {
            item = new this._tileClass(data, this);
        } else if (data.type == gn.model.Model.Type.group) {
            item = new this._subItemContClass(data, this);
            item.addEventListener("openGroup", this.openGroup, this);
        } else {
            throw ("Invalid type of item in Tile Container");
        }
        this._idElementMap.set(id, item);
        this._groups.get(this.model.parent(id)).push(id);
        this.add(item);
    }
    _makeGroup(id) {
        if (gn.lang.Var.isNull(id)) {
            id = null;
        }
        this._groups.set(id, []);




        let count = this._model.rowCount(id);
        for (let i = 0; i < count; i++) {
            let index = this._model.index(i, id);
            let data = this._model.data(index, gn.model.Model.DataType.all);
            let item = null
            if (data.type == gn.model.Model.Type.item) {
                item = new this._tileClass(data, this);
            } else if (data.type == gn.model.Model.Type.group) {
                item = new this._subItemContClass(data, this);
                item.addEventListener("openGroup", this.openGroup, this);
            } else {
                throw ("Invalid type of item in Tile Container");
            }
            this._idElementMap.set(index, item);
            this._groups.get(id).push(index);
            this.add(item);
        }
        this.genFakeTileItems();
    }
    genFakeTileItems() {
        for (let i = 0; i < this._fakeTiles.length; i++) {
            this.remove(this._fakeTiles[i]);
        }
        this._fakeTiles = [];
        var perLine = Math.floor(this.element.clientWidth / parseInt(getComputedStyle(this._idElementMap.entries().next().value[1].element).flexBasis));
        var n = this._groups.get(this._currentGroup).length % perLine;
        if (n == 0) {
            n = perLine;
        } else {
            n = perLine - (n % perLine);
        }
        for (let i = 0; i < n; i++) {
            let item = new this._fakeTileClass(this);
            this._fakeTiles.push(item);
            this.add(this._fakeTiles.at(-1));
        }
    }
    openGroup(e) {
        this._openGroup(e.data);
    }
    _openGroup(id) {
        if (gn.lang.Var.isNull(id)) {
            id = null;
        }
        if (!this._groups.has(this._currentGroup)) {
            this._makeGroup(this._currentGroup);
            return;
        }
        let ids = this._groups.get(this._currentGroup)
        for (let i = 0; i < ids.length; i++) {
            this._idElementMap.get(ids[i]).exclude();
        }
        this._currentGroup = id;
        if (this._groups.has(this._currentGroup)) {
            ids = this._groups.get(this._currentGroup)
            for (let i = 0; i < ids.length; i++) {
                this._idElementMap.get(ids[i]).show();
            }
        } else {
            this._makeGroup(this._currentGroup);
        }
        this.sendEvent("groupOpened", this._currentGroup);
        if (this._breadcrumb) {
            this._breadcrumb.setIndex(this._currentGroup);
        }
        this.genFakeTileItems();
    }
}
gn.ui.tile.TileItem = class gn_ui_tile_TileItem extends gn.ui.basic.Widget {
    constructor(data) {
        super(null, "div", "gn-tileItem");
        this._data = data;
    }
    updateItem(data, key) {
        this._data = data;
    }
}
gn.ui.tile.FakeTileItem = class gn_ui_tile_FakeTileItem extends gn.ui.basic.Widget {
    constructor() {
        super(null, "div", "gn-fakeTileItem");
    }
    updateItem(key) {}
}
gn.ui.tile.TileSubItemContainer = class gn_ui_tile_TileSubItemContainer extends gn.ui.basic.Widget {
    constructor(data) {
        super(null, "div", "gn-tileSubItemContainer");
        this._data = data;
    }
    updateItem(data, key) {
        this._data = data;
    }
}
gn.ui.control.Button = class gn_ui_control_Button extends gn.ui.basic.Widget {
    constructor(text, classList, callback, context) {
        super(null, "button", classList);
        this.addClass("gn-button");
        this._text = "";
        this.text = text;
        if (!gn.lang.Var.isNull(callback) && callback instanceof Function) {
            this.addEventListener("click", callback, context || this);
        }
    }
    _destructor() {
        if (this._text instanceof gn.locale.LocaleString) {
            gn.locale.LocaleManager.instance().removeEventListener("changeLocale", this._onLocaleChanged, this);
        }
        super._destructor();
    }
    set text(value) {
        this._text = value;
        this._element.innerText = this._text;

        if (this._text instanceof gn.locale.LocaleString) {
            gn.locale.LocaleManager.instance().addEventListener("changeLocale", this._onLocaleChanged, this);
        }
    }
    get text() {
        return this._element.innerText;
    }
    set disabled(value) {
        this._element.disabled = value;
    }
    get disabled() {
        return this._element.disabled;
    }
    set type(value) {
        if (!["submit", "reset", "button"].includes(value)) return
        this._element.type = value;
    }
    get type() {
        return this._element.type;
    }
    _onLocaleChanged() {
        if (this._text instanceof gn.locale.LocaleString) {
            this.text = this._text.translate();
        }
    }
}
gn.ui.control.Switch = class gn_ui_control_Switch extends gn.ui.basic.Widget {
    constructor(checked, classList) {
        super(null, "label", classList);
        this.addClass("gn-switch");
        this._input = new gn.ui.input.CheckBox(null, checked);
        this.add(this._input);
        this._span = new gn.ui.basic.Widget(null, "span", "gn-switch");
        this.add(this._span);
        this.checked = checked || false;
        this._input.addEventListener("change", () => {
            this.sendEvent("change", this.checked);
        }, this);
    }
    set checked(value) {
        this._input.value = value;
    }
    get checked() {
        return this._input.value;
    }
    set value(value) {
        this.checked = value;
    }
    get value() {
        return this.checked;
    }
}
gn.ui.control.Select = class gn_ui_control_Select extends gn.ui.basic.Widget {
    constructor(classList, options) {
        super(null, "select", classList);
        this._options = null;
        this.options = options;
    }
    set value(value) {
        this._element.value = value;

    }
    get value() {
        return this._element.value;
    }
    set text(value) {
        this.element.selectedIndex = [...x.element.options].findIndex(opt => {
            return opt.text == value;
        })
    }
    get text() {
        return this._element.options[this.selectedIndex].text;
    }
    set options(value) {
        this._element.innerHTML = "";
        value.forEach((val) => {
            let item = null;
            if (val.hr) {
                item = document.createElement("hr");
            } else if (val.options) {
                item = document.createElement("optgroup");
                item.label = val.label;
                val.options.forEach((option) => {
                    let opt = document.createElement("option");
                    opt.value = option.value;
                    opt.text = option.label;
                    if (option.selected) {
                        opt.selected = true;
                    }
                    item.appendChild(opt);
                });
            } else {
                item = document.createElement("option");
                item.value = val.value;
                item.text = val.label || val.value;
                if (val.selected) {
                    item.selected = true;
                }
            }
            this.addNativeElement(item);
        });
        this._options = value;
    }
    get options() {
        return this._options;
    }
    get selectedIndex() {
        return this._element.selectedIndex;
    }
    set selectedIndex(value) {
        this._element.selectedIndex = value;
    }
    get selectedOptions() {
        return [...this._element.selectedOptions];
    }
    set multiple(value) {
        this._element.multiple = value || false;
    }
    get multiple() {
        return this._element.multiple;
    }


}
gn.ui.control.Breadcrumb = class gn_ui_control_Breadcrumb extends gn.ui.container.Row {
    constructor(mode) {
        super("gn-breadcrumb");
        this._model = null;
        this._mode = mode || gn.ui.control.Breadcrumb.Type.history

        this._history = [null];
        this._historyIdx = 0;

        this._widgets = new Map();
        this._activeWidgets = [];

        this._currentIndex = null;

        this.up = null;
        this._topLevelName = new gn.ui.basic.Label();
        this._topLevelName.setStyle("cursor", "pointer");
        this._topLevelName.addEventListener("click", function() {
            this._setIndex(null);
            this.triggered(null);
        }, this);
        this.add(this._topLevelName);
        this._rootSeparator = this._generateSeparator(null);
        this.add(this._rootSeparator);

        if (this._mode == gn.ui.control.Breadcrumb.Type.layer) {
            this._makeUp()
        } else {
            this._makeBack();
            this._makeForward();
        }

    }
    triggered(idx) {
        this.sendEvent("triggered", idx)
    }
    set model(value) {
        if (gn.lang.Var.isNull(value)) {
            throw new Error('Model cannot be null');
        }
        this._model = value;
    }
    get model() {
        return this._model;
    }
    set topLevelName(value) {
        this._topLevelName.text = value;
    }
    get topLevelName() {
        return this._topLevelName.text;
    }
    setIndex(index) {
        this._setIndex(index)
    }
    _setIndex(index, ignoreHistory = false) {
        if (index == this._currentIndex)
            return;
        if (this._mode == gn.ui.control.Breadcrumb.Type.history) {
            if (!ignoreHistory) {
                if (this._history.length >= this._historyIdx) {
                    this._history = this._history.slice(0, this._historyIdx + 1)
                }
                this._history.push(index)
                this._historyIdx++;
            }
        }
        this._currentIndex = index;
        if (!this._widgets.has(this._currentIndex) && this._currentIndex != null) {
            let tmp = {};
            tmp.separator = this._generateSeparator(this._currentIndex);
            tmp.label = new gn.ui.basic.Label(this.model.data(this._currentIndex));
            tmp.label.setStyle("cursor", "pointer");
            var index = this._currentIndex;
            tmp.label.addEventListener("click", function() {
                this._setIndex(index);
                this.triggered(index);
            }, this);
            this._widgets.set(this._currentIndex, tmp);
        }
        this._openLabels()
    }
    _openLabels() {
        while (this._activeWidgets.length) {
            this.remove(this._activeWidgets[0]);
            this._activeWidgets.shift();
        }
        this._addWidgets(this._currentIndex);
    }
    _addWidgets(idx) {
        if (idx == null)
            return;
        let pidx = this._model.parent(idx);
        if (pidx != null)
            this._addWidgets(pidx);

        this.add(this._widgets.get(idx).label);
        this._activeWidgets.push(this._widgets.get(idx).label);
        this.add(this._widgets.get(idx).separator);
        this._activeWidgets.push(this._widgets.get(idx).separator);
    }
    _makeUp() {
        this._up = new gn.ui.basic.Icon(20, "fa-angle-left", ["fa-solid"]);
        this._up.addEventListener("click", function() {
            if (this._currentIndex == null)
                return;
            this._setIndex(this._model.parent(this._currentIndex));
            this.triggered(this._currentIndex);
        }, this);
        this._up.tooltip = this.tr("UP");
        this.addBefore(this._up, this._topLevelName);
    }
    _makeBack() {
        this._back = new gn.ui.basic.Icon(20, "fa-angle-left", ["fa-solid"]);
        this._back.addEventListener("click", function() {
            if (this._historyIdx == 0)
                return;
            this._setIndex(this._history[--this._historyIdx], true);
            this.triggered(this._currentIndex);
        }, this);
        this._back.tooltip = this.tr("BACK");
        this.addBefore(this._back, this._topLevelName);
    }
    _makeForward() {
        this._forw = new gn.ui.basic.Icon(20, "fa-angle-right", ["fa-solid"]);
        this._forw.addEventListener("click", function() {
            if (this._historyIdx + 1 >= this._history.length)
                return;
            this._setIndex(this._history[++this._historyIdx], true);
            this.triggered(this._currentIndex);
        }, this);
        this._forw.tooltip = this.tr("FORWARD");
        this.addBefore(this._forw, this._topLevelName);
    }
    _generateSeparator(idx) {
        let sep = new gn.ui.basic.Icon(20, "fa-angle-right", ["fa-solid"]);
        sep.index = idx;
        sep.parent = this;
        sep.addEventListener("generateMenu", function(e) {
            let el = e.data;
            el._menu = new gn.ui.popup.Menu(el);
            el._menu.setStyle("min-width", "5rem");
            el._menu.setStyle("min-height", "1rem");
            let children = this._model.children(idx);
            if (children) {
                for (let i = 0; i < children.length; i++) {
                    let data = this._model.data(children[i], gn.model.Model.DataType.all)
                    if (data.type == gn.model.Model.Type.group) {
                        let menuItem = new gn.ui.popup.MenuItem(data.name, null, function() {
                            this._setIndex(children[i]);
                            this.triggered(children[i]);
                        }, this);


                        el._menu.addItem(menuItem);
                    }
                }
            }
        }, this);
        sep.addEventListener("click", function() {
            if (!this._menu) {
                this.sendEvent("generateMenu", this);
            }
            this._menu.show();
        }, sep)
        return sep;
    }
}
gn.ui.control.Breadcrumb.Type = gn.lang.Enum({
    history: 1,
    layer: 2
})
gn.ui.input.AbstractInput = class gn_ui_input_AbstractInput extends gn.ui.basic.Widget {
    constructor(type, classList) {
        switch (type) {
            case "textarea":
                super(null, "textarea", "gn-text-area");
                break;
            default:
                super(null, "input", "gn-input");
                this._element.type = type;
                break;
        }
        this._plcText = "";

        this.addClasses(classList);
        this.addEventListener("focus", this._onFocus, this);

    }
    _destructor() {
        if (this._plcText instanceof gn.locale.LocaleString) {
            gn.locale.LocaleManager.instance().removeEventListener("changeLocale", this._onLocaleChanged, this);
        }
        super._destructor();
    }
    get type() {
        return this._element.type;
    }
    get value() {
        throw new TypeError("Abstract class");
    }
    set value(value) {
        throw new TypeError("Abstract class");
    }
    set disabled(value) {
        this._element.disabled = value;
    }
    get disabled() {
        return this._element.disabled;
    }
    set placeholder(value) {
        if (!["text", "textarea", "search", "url", "tel", "email", "password", "number"].includes(this.type)) {
            throw new TypeError("Placeholder for this input type is not supported by standard html")
        }
        this._element.placeholder = value || "";

        this._plcText = value;
        this._element.innerText = this._plcText;

        if (this._plcText instanceof gn.locale.LocaleString) {
            gn.locale.LocaleManager.instance().addEventListener("changeLocale", this._onLocaleChanged, this);
        }
    }
    get placeholder() {
        return this._element.placeholder;
    }
    set readonly(value) {
        if (typeof value != "boolean" && (typeof value != "number" || value != 1 && value != 0)) {
            throw new TypeError("Readonly property can be boolan or 0&1");
        }
        this._element.readonly = value;
    }
    get readonly() {
        return this._element.readonly;
    }
    set required(value) {
        if (typeof value != "boolean" && (typeof value != "number" || value != 1 && value != 0)) {
            throw new TypeError("Readonly property can be boolan or 0&1");
        }
        if (!["text", "textarea", "search", "url", "tel", "email", "password", "date", "month", "week", "time", "datetime-local", "number", "checkbox", "radio", "file"].includes(this.type)) {
            throw new TypeError("Required for this input type is not supported by standard html")
        }
        this.element.required = value;
    }
    get required() {
        return this.element.required;
    }
    set maxlength(value) {
        if (typeof value !== "number" || value < 0) {
            throw new TypeError("Maxlength must be a positive number");
        }
        if (!["text", "search", "url", "tel", "email", "password"].includes(this.type)) {
            throw new TypeError("Maxlength for this input type is not supported by standard html")
        }
    }
    get maxlength() {
        return this._element.maxLength;
    }
    set minlength(value) {
        if (typeof value !== "number" || value < 0) {
            throw new TypeError("Minlength must be a positive number");
        }
        if (!["text", "search", "url", "tel", "email", "password"].includes(this.type)) {
            throw new TypeError("Minlength for this input type is not supported by standard html")
        }
        this._element.minLength = value;
    }
    get minlength() {
        return this._element.minLength;
    }
    set autocomplete(value) {
        if (!["text", "textarea", "search", "url", "tel", "email", "password", "date", "month", "week", "time", "datetime-local", "number", "range", "color"].includes(this.type)) {
            throw new TypeError("Autocomplete for this input type is not supported by standard html")
        }
        this._element.autocomplete = value;
    }
    get autocomplete() {
        return this._element.autocomplete;
    }
    set pattern(value) {
        if (!["text", "search", "url", "tel", "email", "password"].includes(this.type)) {
            throw new TypeError("Pattern for this input type is not supported by standard html")
        }
        if (gn.lang.Var.isNull(value)) {
            value = "";
        }
        this._element.pattern = value;
    }
    get pattern() {
        return this._element.pattern;
    }
    click() {
        this._element.click();
    }
    _onFocus() {

    }
    _onLocaleChanged() {
        if (this._plcText instanceof gn.locale.LocaleString) {
            this.placeholder = this._plcText.translate();
        }
    }
}

gn.ui.input.Line = class gn_ui_input_Line extends gn.ui.input.AbstractInput {
    constructor(value, placeholder, classList) {
        super("text", classList);
        this.placeholder = placeholder;
        this.value = value;
    }
    get value() {
        return this._element.value;
    }
    set value(value) {
        this.element.value = value || "";
    }
}
gn.ui.input.MultiLine = class gn_ui_input_MultiLine extends gn.ui.input.AbstractInput {
    constructor(value, placeholder, classList, rows, cols) {
        super("textarea", classList);
        this.placeholder = placeholder;
        let rowsValue = rows || 3;
        let colsValue = cols || 20;
        this.rows = rowsValue;
        this.cols = colsValue;
        this.value = value;
    }
    get value() {
        return this._element.value;
    }
    set value(value) {
        this._element.value = value || "";
    }
    set rows(value) {
        this._element.rows = value;
    }
    get rows() {
        return this._element.rows;
    }
    set cols(value) {
        this._element.cols = value;
    }
    get cols() {
        return this._element.cols;
    }
    get type() {
        return "textarea";
    }
    set defaultValue(value) {
        this._element.defaultValue = value;
    }
    get defaultValue() {
        return this._element.defaultValue;
    }
}

gn.ui.input.Number = class gn_ui_input_Number extends gn.ui.input.AbstractInput {
    constructor(value, placeholder, classList) {
        super("number", classList);
        this.placeholder = placeholder;
        this.value = value;
    }
    get value() {
        return this._element.value;
    }
    set value(value) {
        this._element.value = value || "";
    }
    get step() {
        return this._element.step;
    }
    set step(value) {
        if (typeof value !== "number" || value <= 0) {
            throw new TypeError("Step must be a positive number");
        }
        this._element.step = value;
    }
    set min(value) {
        if (typeof value !== "number") {
            throw new TypeError("Min must be a number");
        }
        this._element.min = value;
    }
    get min() {
        return this._element.min;
    }
    set max(value) {
        if (typeof value !== "number") {
            throw new TypeError("Max must be a number");
        }
        this._element.max = value;
    }
    get max() {
        return this._element.max;
    }
}
gn.ui.input.Password = class gn_ui_input_Password extends gn.ui.input.AbstractInput {
    constructor(value, placeholder, classList) {
        super("password", classList);
        this.placeholder = placeholder;
        value = value;
    }
    get value() {
        return this._element.value || "";
    }
    set value(value) {
        this._element.value = value;
    }
}
gn.ui.input.Color = class gn_ui_input_Color extends gn.ui.input.AbstractInput {
    constructor(value, classList) {
        super("color", classList);
        this.value = value;
    }
    get value() {
        return this._element.value;
    }
    set value(value) {
        if (gn.lang.Var.isString(value) && value.length == 7) {
            this._element.value = value;
        } else {
            throw new TypeError("Color value must be a string in the format '#RRGGBB'");
        }
    }
}
gn.ui.input.CheckBox = class gn_ui_input_CheckBox extends gn.ui.input.AbstractInput {
    constructor(value, classList) {
        super("checkbox", classList);
        this.value = value;
    }
    get value() {
        return this._element.checked;
    }
    set value(value) {
        this._element.checked = value || false;
    }
}
gn.ui.input.Range = class gn_ui_input_Range extends gn.ui.input.AbstractInput {
    constructor(value, min, max, classList) {
        super("range", classList);
        this.value = value;
        this.min = min;
        this.max = max;
    }
    get value() {
        return this._element.value;
    }
    set value(value) {
        this._element.value = value || 0;
    }
    get min() {
        return this._element.min;
    }
    set min(value) {
        this._element.min = value || 0;
    }
    set max(value) {
        this._element.max = value || 100;
    }
    get max() {
        return this._element.max;
    }
    get step() {
        return this._element.step;
    }
    set step(value) {
        if (typeof value !== "number" || value <= 0) {
            throw new TypeError("Step must be a positive number");
        }
        this._element.step = value;
    }
}
gn.ui.input.FileMin = class gn_ui_input_FileMin extends gn.ui.input.AbstractInput {
    constructor(classList) {
        super("file", classList)
    }
    get value() {
        return this._element.files
    }
    set value(value) {}
}

gn.ui.input.File = class gn_ui_input_File extends gn.ui.container.Column {
    constructor(classList) {
        super(classList);
        this.addClass("gn-input-file");
        this._input = new gn.ui.input.FileMin("gn-exclude");
        this._input.element.multiple = false;
        this._input.element.accept = "*";
        this.add(this._input);
        this._button = new gn.ui.control.Button(this.tr("SELECT_FILE"));
        this._button.addEventListener("click", function() {
            this._input.click();
        }, this)
        this.add(this._button);
        this._label = new gn.ui.basic.Label("");
        this.add(this._label);
        this._input.element.addEventListener("cancel", this.onCancel.bind(this));
        this._input.addEventListener("input", this.onInput, this);
        this._input.addEventListener("change", this.onChange, this);
    }
    get value() {
        return this._input.value.length ? this._input.value[0] : null;
    }
    set value(value) {
        if (value) {
            throw new TypeError("File set value is made to clear it.")
        }
        this._input.element.files = null;
    }
    set accept(value) {
        this._input.element.accept = value;
    }
    get accept() {
        return this._input.element.accept;
    }
    get type() {
        return this._input.type;
    }
    set disabled(value) {
        this._button.disabled = value;
    }
    get disabled() {
        return this._button.disabled;
    }
    _updateLabel() {
        if (this.value) {
            this._label.text = this.value.name;
        } else {
            this._label.text = "";
        }
    }
    onCancel() {
        this._updateLabel();
        this.sendEvent("cancel", null);
    }
    onInput() {
        this._updateLabel();
        this.sendEvent("input", this.value);
    }
    onChange() {
        this._updateLabel();
        this.sendEvent("change", this.value);
    }
}
gn.ui.popup.PopupBase = class gn_ui_popup_PopupBase extends gn.ui.container.Column {
    constructor(classList, blocker = true) {
        super("gn-popup-base");
        this.addClasses(classList);
        if (blocker) {
            this._blocker = new gn.ui.popup.Blocker();
        }
    }
    hide() {
        document.body.removeChild(this.element);
        if (this._blocker) {
            this._blocker.hide();
        }
    }
    exclude() {
        document.body.removeChild(this.element);
        if (this._blocker) {
            this._blocker.exclude();
        }
    }
    show() {
        if (this._blocker) {
            this._blocker.show();
        }
        document.body.appendChild(this.element);
    }
    dispose() {
        this._blocker.dispose();
        super.dispose();
    }
}
gn.ui.popup.Popup = class gn_ui_popup_Popup extends gn.ui.popup.PopupBase {
    constructor(buttons, blocker) {
        super("gn-popup");
        this._callback = null;
        this.header = new gn.ui.container.Row("gn-popup-header");
        this.body = new gn.ui.container.Column("gn-popup-body");
        this.footer = new gn.ui.container.Row("gn-popup-footer");
        if (buttons & gn.ui.popup.OK) {
            let button = new gn.ui.control.Button("OK");
            button.addEventListener("click", function() {
                this.sendEvent("ok", this._callback ? this._callback.call(this, "ok", this) : null);
                this.dispose();
            }, this);
            this.footer.add(button);
        }
        if (buttons & gn.ui.popup.CLOSE) {
            let close = new gn.ui.basic.Icon(14, "fa-xmark", ["fa-solid"]);
            close.addEventListener("click", function() {
                this.sendEvent("close", this._callback ? this._callback.call(this, "close", this) : null);
                this.dispose();
            }, this);
            this.header.add(close);
        }
        if (buttons & gn.ui.popup.CANCEL) {
            let button = new gn.ui.control.Button("CANCEL");
            button.addEventListener("click", function() {
                this.sendEvent("cancel", this._callback ? this._callback.call(this, "cancel", this) : null);
                this.dispose();
            }, this);
            this.footer.add(button);
        }
        if (buttons & gn.ui.popup.YES) {
            let button = new gn.ui.control.Button("YES");
            button.addEventListener("click", function() {
                this.sendEvent("yes", this._callback ? this._callback.call(this, "yes", this) : null);
                this.dispose();
            }, this);
            this.footer.add(button);
        }
        if (buttons & gn.ui.popup.NO) {
            let button = new gn.ui.control.Button("NO");
            button.addEventListener("click", function() {
                this.sendEvent("no", this._callback ? this._callback.call(this, "no", this) : null);
                this.dispose();
            }, this);
            this.footer.add(button);
        }
    }
    set header(header) {
        this._header = header;
        this.add(header);
    }
    get header() {
        return this._header;
    }
    set body(body) {
        this._body = body;
        this.add(body);
    }
    get body() {
        return this._body;
    }
    set footer(footer) {
        this._footer = footer;
        this.add(footer);
    }
    get footer() {
        return this._footer;
    }
    set callback(value) {
        this._callback = value;
    }
    static InformationPopup(titleWidget, messageWidget) {
        let popup = new gn.ui.popup.Popup(gn.ui.popup.OK | gn.ui.popup.CLOSE);
        popup.header.addFirst(titleWidget);
        popup.body.add(messageWidget);
        return popup;
    }
    static ConfirmationPopup(titleWidget, messageWidget) {
        let popup = new gn.ui.popup.Popup(gn.ui.popup.YES | gn.ui.popup.NO | gn.ui.popup.CLOSE);
        popup.header.addFirst(titleWidget);
        popup.body.add(messageWidget);
        return popup;
    }
}
gn.ui.popup.Menu = class gn_ui_popup_Menu extends gn.ui.popup.PopupBase {
    constructor(menuParent) {
        super("gn-popup-menu");
        this._items = [];
        this._menuParent = menuParent;
    }
    addItem(item) {
        if (!(item instanceof gn.ui.popup.MenuItem)) {
            throw new Error("Item must be instance of MenuItem");
        }
        this._items.push(item);
        this.add(item);
        item.addEventListener("click", function() {
            this.hide();
            if (item.action) {
                item.action();
            }
        }, this);
    }
    get items() {
        return this._items;
    }
    show() {
        super.show();
        let rect = this._menuParent.rect;
        let trect = this.rect;
        this.setStyle("top", rect.bottom + "px");
        this.setStyle("left", rect.right - trect.width + "px");
        this._windowClickBound = this._windowClick.bind(this)
        document.addEventListener("click", this._windowClickBound);
    }
    hide() {
        super.hide();
        this.c = false;
        document.removeEventListener("click", this._windowClickBound);
    }
    _windowClick(event) {
        if (!this.c) {
            this.c = true;
            return;
        } else if (event.target !== this.element && !this.element.contains(event.target)) {
            this.hide();
            document.removeEventListener("click", this._windowClickBound);
        }
    }
}
gn.ui.popup.MenuItem = class gn_ui_popup_MenuItem extends gn.ui.container.Row {
    constructor(label, icon, action, context) {
        super("gn-popup-menu-item");
        this._label = label;
        this._icon = icon;
        this._action = action;
        this._context = context;
        if (icon) {
            this.add(this._icon);
        }
        if (gn.lang.Var.isString(label)) {
            this._label = new gn.ui.basic.Label(label);
        } else if (!label instanceof gn.ui.basic.Label) {
            throw new Error("Label must be instance of gn.ui.basic.Label or string");
        }
        this.add(this._label);
        this.setStyle("cursor", "pointer");
        this.addEventListener("click", function() {
            if (this._action) {
                if (this._context) {
                    this._action.call(this._context);
                } else {
                    this._action.call(this);
                }
            }
        }, this);
        gn.locale.LocaleManager.instance().addEventListener("localeChange", function() {
            if (this._label instanceof gn.locale.LocaleString) {
                this.label = this._label.translate();
            }
        }, this);
    }
    set label(label) {
        this._label = label;
    }
    get label() {
        return this._label;
    }
    set icon(icon) {
        this._icon = icon;
    }
    get icon() {
        return this._icon;
    }
}
gn.ui.popup.OK = 1;
gn.ui.popup.CANCEL = 2;
gn.ui.popup.CLOSE = 4;
gn.ui.popup.YES = 8;
gn.ui.popup.NO = 16;

gn.ui.popup.Blocker = class gn_ui_popup_Blocker extends gn.ui.basic.Widget {
    constructor() {
        super();
        this.addClass("gn-blocker")
    }
    hide() {
        document.body.removeChild(this.element);
    }
    exclude() {
        document.body.removeChild(this.element);
    }
    show() {
        document.body.appendChild(this.element);
    }
}
gn.ui.Header = class gn_ui_Header extends gn.ui.container.Row {
    constructor(options) {
        super("gn-header");
        this._options = gn.lang.Object.merge({
            "left": true,
            "center": true,
            "right": true,
        }, options);
        this._left = null;
        this._center = null;
        this._right = null;
        if (this._options.left) {
            this._left = new gn.ui.container.Row("gn-header-left");
            this.add(this._left);
        }
        if (this._options.center) {
            this._center = new gn.ui.container.Row("gn-header-center");
            this.add(this._center);
        }
        if (this._options.right) {
            this._right = new gn.ui.container.Row("gn-header-right");
            this.add(this._right);
        }
        this._sticky = false;
    }
    set sticky(value) {
        if (value) {
            this.setStyle("position", "sticky");
        } else {
            this.setStyle("position", "")
        }
        this._sticky = value;
    }
    get sticky() {
        return this._sticky;
    }
    get left() {
        return this._left;
    }
    get center() {
        return this._center;
    }
    get right() {
        return this._right;
    }
}
