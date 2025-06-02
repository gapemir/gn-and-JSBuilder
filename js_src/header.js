namespace gn.ui{
    class Header extends gn.ui.container.Row{
        constructor(options){
            super("gn-header");
            this.options = Object.assign({
                    "left":true,
                    "center":true,
                    "right":true,
                }, options);
            this._left = null;
            this._center = null;
            this._right = null;
            if(options["left"]){
                this._left = new gn.ui.container.Row("gn-header-left");
                this.add(this._left);
            }
            if(options["center"]){
                this._center = new gn.ui.container.Row("gn-header-center");
                this.add(this._center);
            }
            if(options["right"]){
                this._right = new gn.ui.container.Row("gn-header-right");
                this.add(this._right);
            }
            this._sticky = false;
        }
        set sticky(value){
            if(value){
                this.setStyle("position", "sticky");
            }else{
                this.setStyle("position", "")
            }
            this._sticky = value;
        }
        get sticky(){
            return this._sticky;
        }
        get left(){
            return this._left;
        }
        get center(){
            return this._center;
        }
        get right(){
            return this._right;
        }
    }
}