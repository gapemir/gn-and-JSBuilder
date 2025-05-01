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
}