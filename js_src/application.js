namespace gn.app {
    class App {
        constructor() {
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
                if(  appClass == gn.app.App) {
                    throw new Error("Application class cannot be the abstract class");
                }
                gn.app.App._instance = new appClass();
            }
            return gn.app.App._instance;
        }
        async phpRequest(url, data) {
            let promise = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            if(!promise.ok){
                throw new Error('Network response was not ok' + promise.statusText);
            }
            return await promise.json();
        }
    }
    App._instance = null;
}