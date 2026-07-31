namespace gn.io {
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

    class Clipboard {
        static writeText(text) {
            navigator.clipboard.writeText(text); //if debugger is opened and this throws error its expected behavior
        }
        static async readText() {
            return await navigator.clipboard.readText();
        }
    }

    class Url {
        static getQueryParamKeys(urlString = window.location.href) {
            const url = new URL(urlString, window.location.origin);
            const keys = [];
            for (const key of url.searchParams.keys()) {
                keys.push(key);
            }
            return keys;
        }

        static getQueryParam(key, urlString = window.location.href) {
            const url = new URL(urlString, window.location.origin);
            return url.searchParams.get(key);
        }

        static getAllQueryParamValues(key, urlString = window.location.href) {
            const url = new URL(urlString, window.location.origin);
            return url.searchParams.getAll(key);
        }

        static addQueryParam(key, value, urlString = window.location.href) {
            const url = new URL(urlString);

            if (value === null || value === undefined || value === '') {
                url.searchParams.delete(key);
            } else if (Array.isArray(value)) {
                url.searchParams.delete(key);
                value.forEach(v => url.searchParams.append(key, v));
            } else {
                url.searchParams.set(key, value);
            }
            return url.toString();
        }

        static setQueryParams(params, urlString = window.location.href) {
            const url = new URL(urlString);

            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === undefined || value === '') {
                    url.searchParams.delete(key);
                } else if (Array.isArray(value)) {
                    url.searchParams.delete(key);
                    value.forEach(v => url.searchParams.append(key, v));
                } else {
                    url.searchParams.set(key, value);
                }
            });
            return url.toString();
        }

        static removeQueryParam(key, urlString = window.location.href) {
            const url = new URL(window.location.href);
            url.searchParams.delete(key);
            return url.toString();
        }
        
        // this state can be used to store data and when user clicks back then it can be accessed via history.state
        static updateBrowserUrl(url, replace = false, state = {} ) {
            const targetUrl = typeof url === 'string' ? url : url.toString();    
            if (replace) {
                window.history.replaceState(state, '', targetUrl);
            } else {
                window.history.pushState(state, '', targetUrl);
            }
        }

    }
}