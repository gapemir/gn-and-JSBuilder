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
        static _outerBoundingClientRect(element){
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
        static rect(el){
            return gn.util.Geometry._boundingClientRect(el);
        }
        static size(el){
            let rect = gn.util.Geometry._boundingClientRect(el);
            return new gn.geometry.Size( rect.width, rect.height );
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
}