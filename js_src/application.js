namespace gn.application {
    class Application {
        constructor() {
            this._instance = null; // Singleton instance
        }
        static instance() {
            throw new Error("Abstract class cannot be instantiated directly");
        }
        async _phpRequest(url, data) {
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
}