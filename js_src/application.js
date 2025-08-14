namespace gn.app {
    class App extends gn.core.Object {
        constructor() {
            super();
            this._root = null;
            this._header = null
            this._footer = null;
        }
        static instance() {
            if (gn.app.App._instance == null) {
                throw new Error("Application class not initialized. Call startup() first.");
            }
            return gn.app.App._instance;
        }
        static startup(appClass) {
            if (gn.app.App._instance == null) {
                if (appClass == null) {
                    throw new Error("Application class cannot be null");
                }
                if( appClass == gn.app.App) {
                    throw new Error("Application class cannot be the abstract class");
                }

                gn.app.App._instance = new appClass();
                gn.app.App.instance().main();
            }
            return gn.app.App._instance;
        }
        main(){
        }
        set root(root) {
            this._root = root;
            document.body.appendChild(root.element);
        }
        get root() {
            return this._root;
        }
        set header(header) {
            document.body.prepend(header.element);
            this._header = header;
        }
        get header() {
            return this._header;
        }
        async phpRequest(url, data) {
            let promise = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            if(!promise.ok){
                throw new Error('Network response was not ok' + promise.statusText);
            }
            return promise;
        }
        async phpRequestJ(url, data) {
            let promise = await this.phpRequest(url, data);
            return await promise.json();
        }
        async phpRequestT(url, data) {
            let promise = await this.phpRequest(url, data);
            return await promise.text();
        }
        async phpRequestA(url, data) {
            let promise = await this.phpRequest(url, data);
            return await promise.arrayBuffer();
        }
        getLocalePath() {
            return "./gn/translations/";
        }
    }
    App._instance = null;
}