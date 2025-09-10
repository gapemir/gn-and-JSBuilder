namespace gn.locale{
    /**
     * we swapped to normal object as Stirings are imutable in js, in order to introduce string methord back to this string i changed this into proxy, we will se if its ok, else we might go back to imutable strings
     * count is overriden by args parameter, only if there is only one
     */
    //TODO swap back to extending strings as they have useful methods eg length, localeCompare
    class LocaleString { // TODO swap for jsonc files so we can have comments, but we need to make a minify function that will remove comments on frontend
        constructor(messageId, text, count) {
            //super(text);
            this._messageId = messageId;
            this._text = text;
            this._count = count; // for pluratization
            this._args = [];

            return new Proxy(this,{
                get: (target, prop) => {
                    // If the property is on our class (like "translate"), return it
                    if (Reflect.has(target, prop)) {
                    return target[prop];
                    }

                    // Otherwise, assume it's a string method and call it on the internal string
                    if (typeof target._text[prop] === 'function') {
                    return (...args) => {
                        return target._text[prop](...args);
                    };
                    }

                    // For properties like "length", return the value directly
                    return target._text[prop];
                },
            });
        }
        get messageId(){
            return this._messageId;
        }
        get text(){
            return this._text;
        }
        set text(value){
            this._text = value;
        }
        get count(){
            return this._count;
        }
        get argz(){
            return this._args
        }
        translate() {
            return gn.locale.LocaleManager.instance().translate(this);
        }
        args( ...argz ) {
            this._args = argz;
            if( this._args.length != 0 ){
                if( this._args.length == 1 ){
                    this._count = this._args[0];
                }
                let newText = this._text;
                for(let i = 0; newText.match(/%\d+/); i++){
                    newText = newText.replace(/%\d+/, this._args[i])
                }
                this._text = newText;
            }
            return this;
        }
        toString() {
            return this._text;
        }
    }
    class LocaleManager extends gn.core.Object {
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
                    this._locales[locale].pluralCB = new Function("n", this._locales['en'].plural)
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
        _getLocalisedText(text, count) { // for now if locale for language count is not found it defaults to source text, we should to first???
            if(this._locales[this.locale] && this._locales[this._locale].tr[text]){
                if( gn.lang.Var.isArray(this._locales[this._locale].tr[text]) ){
                    let idx = this._locales[this._locale].pluralCB(count||1)
                    if( this._locales[this._locale].tr[text].length > idx ){
                        return this._locales[this._locale].tr[text][idx];
                    } else if(this._locales[this._locale].tr[text].length){
                        return this._locales[this._locale].tr[text][this._locales[this._locale].tr[text].length-1];
                    }
                    return text;
                }
                return this._locales[this.locale].tr[text];
            }
            else{
                return text; //fallback to original text if locale not found
            }
        }
        translate(ls){
            ls.text = this._getLocalisedText(ls.messageId, ls.count);
            return ls.args(ls.argz);
        }
        _changeLocale(){
            this.sendEvent("changeLocale");
        }
    }
    LocaleManager._instance = null;
}