namespace gn.ui.basic {
    class Widget extends gn.core.Object{ //widget primarly means div has adders for elements
        constructor(type, classList){
            super();
            this._element = this._createElement(type);
            this.addClasses(classList);
            this._tooltip = null;
            this._tooltipContent = null;
            this._domParent = null;
            this._children = [];
            //todo add more listeners
            this._element.addEventListener("click", this.onClick.bind(this));
            this._element.addEventListener("mouseover", this.onMouseOver.bind(this));
            this._element.addEventListener("mouseout", this.onMouseOut.bind(this));
            this._element.addEventListener("focusin", this.onFocusIn.bind(this));
            this._element.addEventListener("focusout", this.onFocusOut.bind(this));
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
        addBefore(element, refElement){
            this._addInternal(element, refElement, "before");
        }
        addAfter(element, refElement){
            this._addInternal(element, refElement, "after");
        }
        _addInternal(element, refElement, where){
            if(gn.lang.Var.isNull(element)){
                throw new Error('Element cannot be null');
            }
            if(gn.lang.Var.isNull(element.element)){
                throw new Error('Element element cannot be null');
            }
            let index = this._element.childElementCount
            if(!gn.lang.Var.isNull(where)){
                if(gn.lang.Var.isNull(refElement)){
                    throw new Error('refElement cannot be null on '+where);
                }
                if(gn.lang.Var.isNull(refElement.element)){
                    throw new Error('Element element cannot be null on ' +where);
                }
                index = [...this._element.children].indexOf(refElement.element)
                if(index == -1){
                    throw new TypeError("refElement is not a child of this node");
                }
            }
            switch(where){
                case "before":
                    refElement.element.before(element.element);
                    break;
                case "after":
                    refElement.element.after(element.element);
                    index++
                    break;
                default:
                    this._element.appendChild(element.element);
                    break;
            }
            this._children.splice(index, 0, element)
            element.domParent = this;
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
                throw new TypeError("Element is not part of this element");
            }
            this._element.removeChild(element.element);
            this._children.splice(index, 1);
            element.domParent = null;
        }
        _createElement(type){
            return document.createElement(type?type:"div");
        }
        onClick(){
            this.sendEvent("click");
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
            super("label", "gn-label");
            this._text = text;
            this._element.innerText = this._text;
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
    class Icon extends gn.ui.basic.Widget{
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
    class Image extends gn.ui.basic.Widget{
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
}