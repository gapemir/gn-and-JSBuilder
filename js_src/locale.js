namespace gn.locale{
    class LocaleString extends String {
        constructor(data, origin){
            super(data);
            this._origin = origin;
            this._data = data; //data is string key
        }
        translate(){
            return gn.locale.LocaleManager.instance().translate(this._data, this._origin);
        }
    }
    class LocaleManager extends gn.core.Object { // TODO add support for pluralization
        constructor() {
            super();
            this._locale = "";
            this._locales = {};
        }
        static instance() {
            if (gn.locale.LocaleManager._instance == null) {
                gn.locale.LocaleManager._instance = new gn.locale.LocaleManager();
            }
            return gn.locale.LocaleManager._instance;
        }
        set locale(locale) {
            if(gn.lang.Var.isNull(locale)){
                return;
            }
            if(gn.lang.Var.isNull(this._locales[locale])){
                this._loadLocale(locale);
            }
            else if(locale !== this._locale){
                this._locale = locale;
                this._changeLocale();
            }
        }
        get locale() {
            return this._locale;
        }
        async _loadLocale(locale){ //i have decided we wont use .po files, we will rather have a json file with key:translation pairs
            try{
                let loc = await gn.app.App.instance().phpRequestJ(gn.app.App.instance().getLocalePath() + locale + ".json");
                if(!gn.lang.Var.isNull(loc)){
                    this._locales[locale] = loc;
                }
                else{
                    throw new Error("Locale file is empty or not found: " + locale);
                }
            }catch(e){
                console.error("Failed to load locale: " + locale, e);
                return;
            }
            this._locale = locale;
            this._changeLocale();
        }
        _getLocalisedText(text) {
            if(this._locales[this.locale] && this._locales[this.locale][text]){
                return this._locales[this.locale][text];
            }
            else{
                return text; //fallback to original text if locale not found
            }
        }
        translate(data, origin = null, extra = null){ // extra is not used yet, but can be used for pluralization or other features in the future
            let txt = data
            if(!gn.lang.Var.isNull(origin)){
                txt = origin;
            }
            txt = this._getLocalisedText(txt);
            txt = new gn.locale.LocaleString(txt, origin);
            return txt;
        }
        _changeLocale(){
            this.sendEvent("changeLocale");
        }
    }
    LocaleManager._instance = null;
}