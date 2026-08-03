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
    class Request {
        static async request(endpoint, body = null, options = {}) {
            const {
                method = 'GET',
                headers = {},
                timeout = 1000,
                ...customConfig
            } = options;

            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeout);

            const config = {
                method,
                ...headers,
                signal: controller.signal,
                ...customConfig,
            };

            if (body) {
                if (typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
                    config.body = JSON.stringify(body);
                } else {
                    config.body = body;
                }
            }

            try {
                const response = await fetch(endpoint, config);
                clearTimeout(timer);

                if (response.status === 204) { // 204 No content
                    return null;
                }

                const data = await this._parseResponse(response);
                if (!response.ok) {
                    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                    error.status = response.status;
                    error.data = data;
                    throw error;
                }

                return data;
            } catch (error) {
                clearTimeout(timer);
            
                if (error.name === 'AbortError') {
                    throw new Error(`Request timed out after ${timeout}ms`);
                }
                throw error;
            }
        }

        static async _parseResponse(response) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            return await response.text();
        }

        static async get(endpoint, body = null, options = {}) {
            return this.request(endpoint, body, { ...options, method: 'GET' });
        }

        static async post(endpoint, body = null, options = {}) {
            return this.request(endpoint, body, { ...options, method: 'POST', body });
        }

        static async put(endpoint, body = null, options = {}) {
            return this.request(endpoint, body, { ...options, method: 'PUT', body });
        }

        static async patch(endpoint, body = null, options = {}) {
            return this.request(endpoint, body, { ...options, method: 'PATCH', body });
        }

        static async delete(endpoint, body = null, options = {}) {
            return this.request(endpoint, body, { ...options, method: 'DELETE' });
        }
    }
}