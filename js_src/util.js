namespace gn.util{
    class Cookie{
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
                date.setTime(date.getTime() + timeout );
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "") + expires + "; path=/";
        }
        static del(name){
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
    }
    class Geometry{
        constructor(element) {
            this.gnElement = element;
            this.domElement = element;
            if(element.element) {
                this.domElement = element.element;
            }
        }
        get width() {
            return this.domElement.getBoundingClientRect().width;
        }
        set width(value) {
            this.gnElement.setStyle('width', value + 'px');
        }
        get height() {
            return this.domElement.getBoundingClientRect().height;
        }
        set height(value) {
            this.gnElement.setStyle('height', value + 'px');
        }
        get x() {
            return this.domElement.getBoundingClientRect().left;
        }
        get y() {
            return this.domElement.getBoundingClientRect().top;
        }
        get left() {
            return this.domElement.getBoundingClientRect().left;
        }
        get right() {
            return this.domElement.getBoundingClientRect().right;
        }
        get top() {
            return this.domElement.getBoundingClientRect().top;
        }
        get bottom() {
            return this.domElement.getBoundingClientRect().bottom;
        }
        get centerX() {
            let bound = this.domElement.getBoundingClientRect();
            return bound.left + (bound.width / 2);
        }
        get centerY() {
            let bound = this.domElement.getBoundingClientRect();
            return bound.top + (bound.height / 2);
        }
        get geometry() {
            let bound = this.domElement.getBoundingClientRect();
            let ret = {};
            for (let key of ["width", "height", "x", "y", "left", "right", "top", "bottom"]) {
                ret[key] = bound[key];
            }
            ret.centerX = bound.left + (bound.width / 2);
            ret.centerY = bound.top + (bound.height / 2);
            return ret;
        }
    }
}