namespace gn.ui{
    class Header extends gn.ui.container.Column {
        constructor(options){
            super("gn-header");
            this._options = gn.lang.Object.merge( {
                "left" : true,
                "center" : true,
                "right" : true,
                "progress" : true
            }, options);
            this._left = null;
            this._center = null;
            this._right = null;
            this._progressBanner = null;
            this._top = new gn.ui.container.Row();
            this.add(this._top);
            if( this._options.left ) {
                this._left = new gn.ui.container.Row("gn-header-left");
                this._top.add(this._left);
            }
            if( this._options.center ) {
                this._center = new gn.ui.container.Row("gn-header-center");
                this._top.add(this._center);
            }
            if( this._options.right ) {
                this._right = new gn.ui.container.Row("gn-header-right");
                this._top.add(this._right);
            }
            if( this._options.progress ) {
                this._progressBanner = new gn.ui.progress.ProgressBanner();
                this.add(this._progressBanner);
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
        get progress(){
            return this._progressBanner;
        }
    }
}