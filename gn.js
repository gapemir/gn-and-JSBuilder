'use strict';
var gn;
if(!gn) gn = {};
if(!gn.lang) gn.lang = {};
if(!gn.event) gn.event = {};
if(!gn.core) gn.core = {};
if(!gn.model) gn.model = {}; //for holding data used by ui tile and list
if(!gn.ui) gn.ui = {};
if(!gn.ui.basic) gn.ui.basic = {};
if(!gn.ui.tile) gn.ui.tile = {};
//TODO gn.ui.list
//TODO input class and subclasses, general input >subclasiran na input, multiline, checkbox, radio, button
//TODO breadcrumb
//todo popup menus

//abaout geomerty some is in Widget.tooltip
//todo geometry, object widget has getGeometry

//gn.model abstract model, list model tree model
//gn.ui ui elements like lists,
// >.basic images, buttons, inputs, etc
//gn.ui.list.List, ListItem
//gn.ui.tree.Tree, TreeItem
//gn.ui.tile.TileContaier, TileItem


gn.lang.Var = class {
    static isNull(value){
        if(value == undefined || value == null || value == '')
            return true;    
        return false;
    }
    static isArray(value){
        return value instanceof Array;
    }
    static isString(value){
        return typeof value == 'string';
    }
}
gn.lang.Array = class {
    static isEmpty (array){
        if(gn.lang.Var.isNull(array) || array.length == 0)
            return true;
        return false;
    }
}
gn.lang.String = class{
    static isEmpty (string){
        if(gn.lang.Var.isNull(string) || string.length == 0)
            return true;
        return false;
    }
}
gn.core.Object = class{
    constructor(parent){
        this._parent = parent//topology parent, can be null
        //in gn.ui.basic.widget there is property _domParent for ui parent
        this._internalId = this.internalId;
    }
    _destructor(){
    }
    set parent(parent){
        this._parent = parent
    }
    get parent(){
        return this._parent
    }
    get internalId()
    {
        if ( !this._internalId ) {
            this._internalId = gn.core.Object.getInternalId( this );
        }
        return this._internalId;
    }
    tr(text, ...extra){
        return text;
    }
    dispose(){
        gn.event.Emitter.instance().removeAllEventListeners(this);
        //remove it from dom
        gn.core.Object._idCache.push(gn.core.Object.getInternalId(this))
        this._destructor();
        delete this;
    }
    addEventListener(type, callback, thisObj){
        gn.event.Emitter.instance().addEventListener(this, type, callback, thisObj);
    }
    removeEventListener(type, callback, thisObj){
        gn.event.Emitter.instance().removeEventListener(this, type, callback, thisObj);
    }
    sendEvent(type){
        gn.event.Emitter.instance().sendEvent(this, type);
    }
    sendDataEvent(type, data){
        gn.event.Emitter.instance().sendDataEvent(this, type, data);
    }
    static getInternalId(obj){
        var id = obj._internalId;
        if ( id != null && id != undefined ) return id;
        if ( gn.core.Object._idCache.length > 0 ) {
            id = gn.core.Object._idCache.pop();
        }
        else {
            id = gn.core.Object._nextId++ + "";
        }
        return obj._internalId = id;
    }
}
gn.core.Object._idCache = [];
gn.core.Object._nextId = 0;
gn.event.Emitter = class{
    constructor() {
        this._listeners = new Map(); // Use a Map to store listeners
        this._instance = null; // Singleton instance
    }
    static instance(){
        if(!this._instance){
            this._instance = new gn.event.Emitter();
        }
        return this._instance;
    }
    addEventListener(object, eventName, listener, context) {
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
        let internalId = gn.core.Object.getInternalId(object);
        const objectEvents = this._listeners.get(internalId);
        if (!objectEvents) {
            return false;
        }
        const eventListeners = objectEvents.get(eventName);
        return eventListeners ? eventListeners.length > 0 : false;
    }
    removeAllEventListeners(object){
        let internalId = gn.core.Object.getInternalId(object);
        if (!this._listeners.has(internalId)) {
            return
        }
        this._listeners.delete(internalId);
        //TODO we should check if removed object is saved somewhere in the context
    }
}
gn.ui.basic.Widget = class extends gn.core.Object{
    constructor(type, classList){
        super();
        this._element = document.createElement(type?type:"div");
        this.addClasses(classList);
        this._tooltip = null;
        this._tooltipContent = null;
        this._domParent = null;
        //todo add more listeners
        this._element.addEventListener("click", function(){this.sendEvent("click")}.bind(this));
        this._element.addEventListener("mouseover", function(){
            if(!gn.lang.Var.isNull(this._tooltip)){
                this.showTooltip();
            }   
            this.sendEvent("mouseover")}.bind(this));
        this._element.addEventListener("mouseout", function(){
            if(!gn.lang.Var.isNull(this._tooltip)){
                this.hideTooltip();
            }   
            this.sendEvent("mouseout")}.bind(this));
    }
    _destructor(){
        if(!gn.lang.Var.isNull(this._domParent)){
            this._domParent.remove(this);
        }
    }
    set domParent(domParent){
        this._domParent = domParent;
    }
    get domParent(){
        return this._domParent;
    }
    get element(){
        return this._element;
    }
    addClass(className){
        if(gn.lang.Var.isNull(className)){
            return;
        }
        this._element.classList.add(className);
    }
    addClasses(classNames){
        if(!gn.lang.Var.isArray(classNames)){
            if(gn.lang.Var.isString(classNames)){
                this.addClasses(classNames.split(" "));
            }
            return;
        }
        for(let i = 0; i<classNames.length; i++){
            this.addClass(classNames[i]);
        }
    }
    removeClass(className){
        this._element.classList.remove(className);
    }
    removeClasses(classNames){
        if(!gn.lang.Var.isArray(classNames)){
            if(gn.lang.Var.isString(classNames)){
                this.removeClasses(classNames.split(" "));
            }
            return;
        }
        for(let i = 0; i<classNames.length; i++){
            this.removeClass(classNames[i]);
        }
    }
    setStyle(styleName, value = null){
        this._element.style[styleName] = value;
    }
    set tooltip(value){
        if(value instanceof gn.ui.basic.Widget){
            this._tooltip = value;
            this._tooltip.addClass("gn-tooltip");
            this.addClass("gn-tooltip-parent");
        }
        else if(!gn.lang.Var.isNull(value)){
            this._tooltip = new gn.ui.basic.Widget("div");
            this._tooltip.addClass("gn-tooltip");
            this.addClass("gn-tooltip-parent");
            this._tooltipContent = value;
            this._tooltip.label = new gn.ui.basic.Label(value);
            this._tooltip.add(this._tooltip.label)
        }else{
            this._tooltip.dispose();
            delete this._tooltip;
        }
    }
    set tooltipContent(value){
        this._tooltipContent = value;
        if(!gn.lang.Var.isNull(this._tooltip) && !gn.lang.Var.isNull(this._tooltip.label)){
            this._tooltip.label.text = value;
        }else{
            throw ("Trying to set tooltip content but toltip label doesn't exist");
        }
    }
    get tooltipContent(){
        return this._tooltipContentM
    }
    showTooltip(){
        if(!gn.lang.Var.isNull(this._tooltip)){
            this.add(this._tooltip);

            let triggerRect = this._element.getBoundingClientRect();
            let tooltipRect = this._tooltip.element.getBoundingClientRect();
            let viewportWidth = document.documentElement.clientWidth;
          
            if (tooltipRect.right > viewportWidth) {
              this._tooltip.setStyle("left", "auto");
              this._tooltip.setStyle("right", "0px");
              tooltipRect = this._tooltip.element.getBoundingClientRect();
              this._tooltip.setStyle("right", `${tooltipRect.right - viewportWidth}px`);
              tooltipRect = this._tooltip.element.getBoundingClientRect();
              let arrowMargin = (triggerRect.x+triggerRect.width/2)-tooltipRect.x
              this._tooltip.element.style.setProperty("--arrow-left", arrowMargin+"px");
              this._tooltip._wasMoved = true;
            }
            else if(tooltipRect.left < 0){
                //this._tooltip.setStyle("right", "auto");
                this._tooltip.setStyle("left", "0px");
                tooltipRect = this._tooltip.element.getBoundingClientRect();
                this._tooltip.setStyle("left", `${-tooltipRect.left}px`);
                tooltipRect = this._tooltip.element.getBoundingClientRect();
                let arrowMargin = (triggerRect.x+triggerRect.width/2);
                this._tooltip.element.style.setProperty("--arrow-left", arrowMargin+"px");
                this._tooltip._wasMoved = true;
            }
        }
    }
    hideTooltip(){
        if(!gn.lang.Var.isNull(this._tooltip)){
            this.remove(this._tooltip);
            if(this._tooltip._wasMoved){
                this._tooltip.setStyle("right");
                this._tooltip.setStyle("top");
                this._tooltip.setStyle("left");
                this._tooltip.setStyle("bottom");
                this._tooltip.element.style.removeProperty("--arrow-left")
                delete this._tooltip._wasMoved
            }
        }
    }
    add(element){
        if(gn.lang.Var.isNull(element)){
            throw new Error('Element cannot be null');
        }
        if(gn.lang.Var.isNull(element.element)){
            throw new Error('Element element cannot be null');
        }
        element.domParent = this;
        this._element.appendChild(element.element);
    }
    addBefore(element){
        if(gn.lang.Var.isNull(element)){
            throw new Error('Element cannot be null');
        }
        element.domParent = this;
        this._element.parentNode.insertBefore(element, this._element);
    }
    addAfter(element){
        if(gn.lang.Var.isNull(element)){
            throw new Error('Element cannot be null');
        }
        element.domParent = this;
        this._element.parentNode.insertBefore(element, this._element.nextSibling);
    }
    remove(element){
        if(gn.lang.Var.isNull(element)){
            throw new Error('Element cannot be null');
        }
        if(gn.lang.Var.isNull(element.element)){
            throw new Error('Element elementcannot be null');
        }
        element.domParent = null;
        this._element.removeChild(element.element);
    }
    dispose(){
        if(this._element){
            this._element.remove();
        }
        super.dispose();
    }
}
gn.ui.basic.Label = class extends gn.ui.basic.Widget{
    constructor(text, classList){
        super("span");
        this._text = text;
        this._element.innerText = this._text;
        this._element.className = 'gn-span';
        this.addClasses(classList);
    }
    set text(value){
        this._text = value;
        this._element.innerText = this._text;
    }
    get text(){
        return this._text;
    }
}
gn.ui.basic.Icon = class extends gn.ui.basic.Widget{
    constructor(size, iconName, iconSet){
        super("i", "gn-icon");
        this._size = size;
        this._iconName = iconName;
        if(!gn.lang.Var.isNull(iconSet) && !gn.lang.Var.isArray(iconSet)){
            throw new Error('Icon set must be an array');
        }
        this._iconSet = iconSet || [];
        if(!gn.lang.Var.isArray(this._iconSet)){
            this._iconSet = [this._iconSet];
        }
        this.addClasses([this._iconName, ...this._iconSet]);
        this.setStyle('font-size', this._size + 'px');
    }
    set iconName(value){
        this.removeClass(this._iconName);
        this._iconName = value;
        this.addClasses([this._iconName, ...this._iconSet]);
    }
    get iconName(){
        return this._iconName;
    }
    set iconSet(value){
        this.removeClasses(this._iconSet);
        this._iconSet = value || [];
        this.addClasses([this._iconName, ...this._iconSet]);
    }
    get iconSet(){
        return this._iconSet;
    }
    set size(value){
        this._size = value;
        this.setStyle('font-size', this._size + 'px');
    }
    get size(){
        return this._size;
    }
}
gn.ui.basic.Image = class extends gn.ui.basic.Widget{
    constructor(src, classList){
        super("img");
        this._element.src = src;
        this._element.className = 'gn-img';
        this.addClasses(classList);
    }
    set src(value){
        this._element.src = src;
    }
    get src(){
        return this._element.src;
    }
    set alt(value){
        this._element.alt = value;
    }
    get alt(){
        return this._element.alt;
    }
}

gn.model.DataType = {
    view : 1,
    edit : 2,
    all : 3,
}
gn.model.Type = {
    item : 1,
    group : 2
}
gn.model.Model = class extends gn.core.Object{
    constructor(identifier, parent){
        super(parent);
        this._data = null;
        this._dataIdentifier = identifier;
    }
    set dataIdentifier(value){
        if(gn.lang.Var.isNull(value)){
            throw new Error('Data identifier cannot be null');
        }
        this._dataIdentifier = value;
    }
    setData(data){
        throw new Error('Method "setData" must be implemented in subclass');
    }
    addDataEntry(data){
        throw new Error('Method "addDataEntry" must be implemented in subclass');
    }
    data(id, type){
        throw new Error('Method "data" must be implemented in subclass');
    }
    reset(){
        throw new Error('Method "reset" must be implemented in subclass');
    }
}
gn.model.SortModel = class extends gn.model.Model{
    constructor (identifier, parent){
        throw new Error('SortModel is not implemented yet');
        super(identifier, parent);
        this._data = new Map();
        this._currLevel = null;
        this._parentIdentifier = null;
    }
}
gn.model.TreeModel = class extends gn.model.Model{
    constructor (identifier, parent){
        super(identifier, parent);
        this._data = new Map();
        this._parentMap = new Map(); // id -> children ids
        this._currLevel = null;
        this._parentIdentifier = null;
    }
    set parentIdentifier(value){
        if(gn.lang.Var.isNull(value)){
            throw new Error('Parent identifier cannot be null');
        }
        this._parentIdentifier = value;
    }
    setData(data){
        this._data = new Map();
        if(gn.lang.Var.isArray(data)){
            data.forEach((item) => {
                this._addData(item);
            });
        }
        this.sendEvent('dataSet');
    }
    addDataEntry(data){
        this._addData(data);
        this.sendDataEvent('dataAdded', data);
    }
    _addData(data){
        if(gn.lang.Var.isNull(data)){
            throw new Error('Data cannot be null');
        }
        if(gn.lang.Array.isEmpty(data[this._dataIdentifier])){
            throw new Error('Data doesnt have identifier used in this model');
        }
        this._data.set(data[this._dataIdentifier], data);
        if(!this._data.has(data[this._parentIdentifier]) && !gn.lang.Var.isNull(data[this._parentIdentifier])){
            throw new Error('Parent data not found in model');
        }
        let parentId = data[this._parentIdentifier];
        if(gn.lang.Var.isNull(parentId)){
            parentId = null;
        }
        if(this._parentMap.has(parentId)){
            this._parentMap.get(parentId).push(data[this._dataIdentifier]);
        }else{
            this._parentMap.set(parentId, [data[this._dataIdentifier]]);
        }
    }
    data(id, type){
        if(gn.lang.Var.isNull(id)){
            throw new Error('Data identifier cannot be null');
        }
        if(type == gn.model.DataType.view){
            return this._data.get(id);
        }else if(type == gn.model.DataType.edit){
            return this._data.get(id);
        }else if(type == gn.model.DataType.all){
            return this._data.get(id);
        }else{
            throw new Error('Invalid type');
        }
    }
    getChildren(id){
        if(this._parentMap.has(id)){
            return this._parentMap.get(id);
        }else{
            return null;
        }
    }
    getParent(id){
        if(gn.lang.Var.isNull(id)){
            throw new Error('Id cannot be null');
        }
        for(let [key, value] of this._parentMap.entries()){
            if(value.includes(id)){
                return key;
            }
        }
        throw new Error('This should not happen, contact me');
    }
    reset(){
        this._data = new Map();
        this._parentMap = new Map();
        this._currLevel = null;
        this.sendEvent("reset");
    }
}
// try using grid for tiles
gn.ui.tile.TileContainer = class extends gn.ui.basic.Widget{
    constructor(parent){
        super("div", "gn-tileContainer");
        this._parent = parent;
        this._model = null;
        this._idElementMap = new Map();
        this._groups = new Map();// id group -> [id elements]
        this._currentGroup = null;
        this._fakeTiles = [];
        this._tileClass = gn.ui.tile.TileItem;
        this._fakeTileClass = gn.ui.tile.FakeTileItem;
        this._subItemContClass = gn.ui.tile.TileSubItemContainer
        this._header = new gn.ui.basic.Widget("div", "gn-tileContainerHeader");
        let back = new gn.ui.basic.Icon(20, "fa-angle-left", ["fa-solid"])
        back.addEventListener("click", function(){
            if(!gn.lang.Var.isNull(this._currentGroup)){
                this.openGroup(this.model.getParent(this._currentGroup));
            }
        }, this);
        this._header.add(back);
        this.add(this._header);
    }
    set tileClass(value){
        if(gn.lang.Var.isNull(value)){
            throw new Error('Tile class cannot be null');
        }
        this._tileClass = value;
    }
    get tileClass(){
        return this._tileClass;
    }
    set subItemContClass(value){
        this._subItemContClass = value;
    }
    get subItemContClass(){
        return this._subItemContClass;
    }
    set fakeTileClass(value){
        if(gn.lang.Var.isNull(value)){
            throw new Error('Tile class cannot be null');
        }
        this._fakeTileClass = value;
    }
    get fakeTileClass(){
        return this._fakeTileClass;
    }
    set model(value){
        if(gn.lang.Var.isNull(value)){
            throw new Error('Model cannot be null');
        }
        this._model = value;
        this._model.addEventListener('dataSet', this._onDataSet, this);
        this._model.addEventListener('dataAdded', this._onDataAdded, this);
        this._model.addEventListener('reset', this._onDataAdded, this);
    }
    get model(){
        return this._model;
    }
    _onDataSet(){
        this.openGroup();
    }
    _onDataAdded(data){
        throw new Error('Method "_onDataAdded" is not yet implemented');
    }
    _onReset(){
        throw new Error('Method "_onReset" is not yet implemented');
    }
    _makeGroup(id){
        if(gn.lang.Var.isNull(id)){
            id = null;
        }
        this._groups.set(id, []);
        let tmpIds = this._model._parentMap.get(id);
        if(gn.lang.Var.isNull(tmpIds)){
            return;
        }
        for (let i = 0; i < tmpIds.length; i++) {
            let data = this._model.data(tmpIds[i], gn.model.DataType.all);
            let item = null
            if(data.type == gn.model.Type.item){
                item = new this._tileClass(data, this);
            }else if(data.type == gn.model.Type.group){
                item = new this._subItemContClass(data, this);
                item.addEventListener("openGroup", this.openGroup, this);
            }else{
                throw ("Invalid type of item in Tile Container");
            }
            this._idElementMap.set(tmpIds[i], item);
            this._groups.get(id).push(tmpIds[i]);
            this.add(item);
        }
        this.genFakeTileItems();
    }
    genFakeTileItems(){
        for (let i = 0; i < this._fakeTiles.length; i++) {
            this.remove(this._fakeTiles[i]);
        };
        this._fakeTiles = [];
        var perLine = Math.floor(this.element.clientWidth / parseInt(getComputedStyle(this._idElementMap.entries().next().value[1].element).flexBasis));
        var n = this._groups.get(this._currentGroup).length % perLine;
        if(n == 0){
            n = perLine;
        }else{
            n = n % perLine;
        }
        for(let i = 0; i < n; i++){
            let item = new this._fakeTileClass(this);
            this._fakeTiles.push(item);
            this.add(this._fakeTiles.at(-1));
        }
    }
    openGroup(id){
        if(gn.lang.Var.isNull(id)){
            id = null;
        }
        if(!this._groups.has(this._currentGroup)){
            this._makeGroup(this._currentGroup);
            return;
        }
        let ids = this._groups.get(this._currentGroup)
        for(let i = 0; i<ids.length; i++){
            this._idElementMap.get(ids[i]).setStyle("display", "none");
        }
        this._currentGroup = id;
        if(this._groups.has(this._currentGroup)){
            ids = this._groups.get(this._currentGroup)
            for(let i = 0; i<ids.length; i++){
                this._idElementMap.get(ids[i]).setStyle("display", "flex");
            }
        }else{
            this._makeGroup(this._currentGroup);
        }
        this.sendEvent("groupOpened", this._currentGroup);
        this.genFakeTileItems();
    }
}
gn.ui.tile.TileItem = class extends gn.ui.basic.Widget{
    constructor(data, parent){
        super("div", "gn-tileItem");
        this._parent = parent;
        this._data = data;
    }
}
gn.ui.tile.FakeTileItem = class extends gn.ui.basic.Widget{
    constructor(parent){
        super("div", "gn-fakeTileItem");
        this._parent = parent;
    }
}
gn.ui.tile.TileSubItemContainer = class extends gn.ui.basic.Widget{ //data.type = "group"
    constructor(data, parent){
        super("div", "gn-tileSubItemContainer"); 
        this._parent = parent;
        this._data = data;
    }
}