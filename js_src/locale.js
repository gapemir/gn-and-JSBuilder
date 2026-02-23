namespace gn.locale{
    class LocaleString { // TODO swap for jsonc files so we can have comments, but we need to make a minify function that will remove comments on frontend
        constructor(messageId, text, count) {
            this._messageId = messageId;
            this._text = text;
            this._count = count; // for pluratization
            this._args = [];
            gn.locale.LocaleManager.instance().translate(this);

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

            //return this;
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
            let localeFiles = gn.app.App.instance().getLocalePath();
            for(let file of localeFiles){
                try{
                    let loc = await gn.app.App.instance().phpRequestJ(file + locale + ".json");
                    if(!gn.lang.Var.isNull(loc)) {
                        if(!this._locales[locale]) {
                            this._locales[locale] = loc;
                            this._locales[locale].pluralCB = new Function("n", loc.plural)
                        } else {
                            gn.lang.Object.merge(this._locales[locale].tr, loc.tr);
                        }
                    }
                    else {
                        throw new Error("Locale file is empty or not found: " + file + locale + ".json");
                    }
                } catch(e) {
                    console.error("Failed to load locale: " + locale + " file: " + file + locale + ".json", e);
                    return;
                }
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
            if(this._locale == "") {
                return ls;
            }
            ls.text = this._getLocalisedText(ls.messageId, ls.count);
            return ls.args(ls.argz);
        }
        _changeLocale(){
            this.sendEvent("changeLocale");
        }
    }
    LocaleManager._instance = null;
}