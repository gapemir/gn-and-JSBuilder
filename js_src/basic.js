namespace gn.ui.basic {
    class Widget extends gn.core.Object{ //widget primarly means div has adders for elements
        constructor(layout, type, classList){
            super();
            this._element = this._createElement(type);
            this._element.setAttribute("gn_name", this.constructor.name);
            this.addClasses(classList);
            this._tooltip = null;
            this._tooltipContent = null;
            this._children = [];

            this._layoutManager = null;
            this._layoutParent = null;
            if(layout){
                this.layoutManager = layout
            }
            //todo add more listeners
            this._element.addEventListener("click", this.onClick.bind(this));
            this._element.addEventListener("dblclick", this.onDblClick.bind(this));
            this._element.addEventListener("mouseover", this.onMouseOver.bind(this));
            this._element.addEventListener("mouseout", this.onMouseOut.bind(this));
            this._element.addEventListener("focusin", this.onFocusIn.bind(this));
            this._element.addEventListener("focusout", this.onFocusOut.bind(this));
        }
        _destructor(){
            if(!gn.lang.Var.isNull(this._layoutParent)){
                this._layoutParent.remove(this);
            }
        }
        get layoutParent(){
            return this._layoutParent;
        }
        set layoutParent(value){
            if(gn.lang.Var.isNull(value)){
                this._layoutParent = null;
            }
            else if(!(value instanceof gn.ui.basic.Widget)){
                throw new TypeError("Layout parent must be a gn.ui.basic.Widget");
            }
            else if(value === this){
                throw new Error("Widget cannot be its own layout parent");
            }
            else {
                this._layoutParent = value;
            }            
        }
        get element(){
            return this._element;
        }
        set layoutManager(value){
            if(gn.lang.Var.isNull(value)){
                if(!gn.lang.Var.isNull(this._layoutManager)){
                    this._layoutManager.dispose();
                    this._layoutManager = null;
                }
                return;
            }
            if(!(value instanceof gn.ui.layout.AbstractLayout)){
                throw new TypeError("Layout manager must be a subclass of AbstractLayout");
            }
            this._layoutManager = value;
            this._layoutManager.widget = this;
        }
        get layoutManager(){
            return this._layoutManager;
        }
        get rect(){
            return gn.util.Geometry.rect(this._element);
        }
        get width(){
            return gn.util.Geometry.width(this._element);
        }
        set width(value){
            if(gn.lang.Var.isNumber(value) && value >= 0){
                this.setStyle("width", value + "px");
            }
        }
        get height(){
            return gn.util.Geometry.height(this._element);
        }
        set height(value){
            if(gn.lang.Var.isNumber(value) && value >= 0){
                this.setStyle("height", value + "px");
            }
        }
        addClass(className){
            if(gn.lang.Var.isEmpty(className)){
                return;
            }
            this._element.classList.add(className);
        }
        addClasses(classNames){
            if(!gn.lang.Var.isArray(classNames)){
                if(gn.lang.Var.isString(classNames) && !gn.lang.Var.isEmpty(classNames)){
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
        setStyle(styleName, value = "", important = false){
            this._element.style[styleName] = value + (important ? " !important" : "");
        }
        setStyles(map){
            for(let key in map){
                if(map.hasOwnProperty(key)){
                    this.setStyle(key, map[key]);
                }
            }
        }
        set tooltip(value){
            if(value instanceof gn.ui.basic.Widget){
                this._tooltip = value;
                this._tooltip.addClass("gn-tooltip");
                this.addClass("gn-tooltip-parent");
            }
            else if(!gn.lang.Var.isNull(value)){
                this._tooltip = new gn.ui.basic.Widget(null, "div");
                this._tooltip.addClass("gn-tooltip");
                this.addClass("gn-tooltip-parent");
                this._tooltipContent = value;
                this._tooltip.label = new gn.ui.basic.Label(value);
                this._tooltip.add(this._tooltip.label)
            }else{
                if(!gn.lang.Var.isNull(this._tooltip)){
                    this._tooltip.dispose();
                    delete this._tooltip;
                }
            }
        }
        set tooltipContent(value){ // only accepts null(to erase) or string (also localizedString)
            if( gn.lang.Var.isNull(value) ){
                this.tooltip = null;
            }
            else if( gn.lang.Var.isString(value) ){
                this.tooltip = value;
            }
            else{
                throw new TypeError("gn.ui.basic.Widget.tooltipContent must be a string, localizedString or null");
            }
        }
        get tooltipContent(){
            return this._tooltipContent
        }
        showTooltip(){
            if(!gn.lang.Var.isNull(this._tooltip)){
                let viewportWidth = document.documentElement.clientWidth;

                this.add(this._tooltip);
                let triggerRect = this.rect;
                let tooltipRect = this._tooltip.rect;

                if (tooltipRect.right > viewportWidth || window.innerWidth > document.documentElement.clientWidth) {
                    this._tooltip.setStyle("left", "auto");
                    this._tooltip.setStyle("right", "0px");

                    tooltipRect = this._tooltip.rect;
                    this._tooltip.setStyle("right", `${tooltipRect.right - viewportWidth +5}px`);
                    tooltipRect = this._tooltip.rect;
                    let bIsScrollBarVisible = window.innerWidth > document.documentElement.clientWidth;
                    let arrowMargin = (triggerRect.x+triggerRect.width/2)-tooltipRect.x + !bIsScrollBarVisible * 15;
                    this._tooltip.element.style.setProperty("--arrow-left", arrowMargin+"px"); 
                    this._tooltip._wasMoved = true;
                }
                else if(tooltipRect.left < 0){
                    //this._tooltip.setStyle("right", "auto");    
                    this._tooltip.setStyle("left", "0px");
                    this._tooltip.setStyle("transform", "none");
                    tooltipRect = this._tooltip.rect;
                    this._tooltip.setStyle("left", `${-tooltipRect.left+5}px`);
                    let arrowMargin = (triggerRect.x+triggerRect.width/2);
                    this._tooltip.element.style.setProperty("--arrow-left", arrowMargin-5+"px");
                    this._tooltip._wasMoved = true;
                }
            }
        }
        hideTooltip(){
            if(!gn.lang.Var.isNull(this._tooltip)){
                this.remove(this._tooltip);
                if(this._tooltip._wasMoved){
                    this._tooltip.setStyles({
                        "left": "",
                        "right": "",
                        "top": "",
                        "bottom": "",
                        "transform": ""
                    })
                    this._tooltip.element.style.removeProperty("--arrow-left")
                    delete this._tooltip._wasMoved
                }
            }
        }
        addNativeElement(nativeElement){
            this.element.appendChild(nativeElement);
            this._children.push("nativeElement");
        }
        removeNativeElement(nativeElement){
            let index = [...this._element.children].indexOf(nativeElement)
            this.element.removeChild(nativeElement);
            this._children.splice(index, 1);
        }
        add(element){
            this._addInternal(element);
        }
        addFirst(element){
            if(this._children.length){
                this._addInternal(element, "before", this._children[0]);
            }else{
                this._addInternal(element);
            }
        }
        addBefore(element, refElement){
            this._addInternal(element, "before", refElement);
        }
        addAfter(element, refElement){
            this._addInternal(element, "after", refElement);
        }
        _addInternal(element, where = null, refElement = null){
            if(gn.lang.Var.isNull(element)){
                throw new Error('Element cannot be null');
            }
            if(gn.lang.Var.isNull(element.element)){
                throw new Error('Element element cannot be null');
            }
            let index = this._element.childElementCount;
            if(!gn.lang.Var.isNull(where)){
                if(gn.lang.Var.isNull(refElement)){
                    where = null;
                } else {
                    index = [...this._element.children].indexOf(refElement.element);
                }
            }
            switch(where){
                case "before":
                    this._element.insertBefore(element.element, refElement.element);
                    break;
                case "after":
                    this._element.insertBefore(element.element, refElement.element.nextSibling);
                    index++
                    break;
                default:
                    this._element.appendChild(element.element);
                    break;
            }
            this._children.splice(index, 0, element)
            element.layoutParent = this;
        }
        remove(element){
            if(gn.lang.Var.isNull(element)){
                throw new Error('Element cannot be null');
            }
            if(gn.lang.Var.isNull(element.element)){
                throw new Error('Element element cannot be null');
            }
            let index = [...this._element.children].indexOf(element.element)
            if(index == -1){
                return false;
            }
            this._element.removeChild(element.element);
            this._children.splice(index, 1);
            element.layoutParent = null;
            return true;
        }
        exclude(val = true){
            if(val){
                this.addClass("gn-exclude");
            }else{
                this.removeClass("gn-exclude");
            }
        }
        _createElement(type){
            return document.createElement(type?type:"div");
        }
        onClick(){
            this.sendEvent("click");
        }
        onDblClick(){
            this.sendEvent("dblclick");
        }
        onMouseOver(){
            this.sendEvent("mouseover");
            if(!gn.lang.Var.isNull(this._tooltip)){
                this.showTooltip();
            }
        }
        onMouseOut(){
            this.sendEvent("mouseout");
            if(!gn.lang.Var.isNull(this._tooltip)){
                this.hideTooltip();
            }
        }
        onFocusIn(){
            this.sendEvent("focusin")
        }
        onFocusOut(){
            this.sendEvent("focusout")
        }
        dispose(){
            if(this._element){
                this._element.remove();
            }
            super.dispose();
        }
    }
    class Label extends gn.ui.basic.Widget{
        constructor(text, classList){
            super(null, "label", "gn-label");
            this._text = "";
            this.text = text;
            this.addClasses(classList);

            gn.locale.LocaleManager.instance().addEventListener("changeLocale", this._onLocaleChanged, this);
        }
        destructor(){
            gn.locale.LocaleManager.instance().removeEventListener("changeLocale", this._onLocaleChanged, this);
        }
        set text(value){
            this._text = value;
            this._element.innerText = this._text;
        }
        get text(){
            return this._text;
        }
        _onLocaleChanged(){
            if(this._text instanceof gn.locale.LocaleString) {
                this.text = this._text.translate();
            }
        }
    }
    class Icon extends gn.ui.basic.Widget{
        constructor(size, iconName, iconSet){
            super(null, "i", "gn-icon");
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
    class Image extends gn.ui.basic.Widget{
        constructor(src, classList){
            super(null, "img");
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
}