namespace gn.lang {
    class Var {
        static isNull(value){
            return value === undefined || value === null;
        }
        static isEmpty(value){
            return gn.lang.Var.isNull(value) || value.length === 0 || value.size === 0 || (gn.lang.Var.isObject(value) && Object.keys(value).length === 0);
        }
        static isArray(value){
            return value instanceof Array;
        }
        static isString(value){
            return typeof value === 'string';
        }
        static isNumber(value){
            return typeof value === 'number' && !isNaN(value);
        }
        static isBoolean(value){
            return typeof value === 'boolean';
        }
        static isFunction(value){
            return typeof value === 'function';
        }
        static isObject(value){
            return value !== null && value.constructor.name === "Object"
        }
    }
    class Array {
        static isEmpty (array){
            return !!(gn.lang.Var.isNull(array) || array.length === 0);

        }
    }
    class String {
        static isEmpty (string){
            return !!(gn.lang.Var.isNull(string) || string.length === 0);

        }
    }
    //class Object is for handling native Objects, it is not designet to handle class objects as inherited properties are skipped
    class Object{
        static isEmpty(obj){
            return Object.keys(obj).length === 0;
        }
        static merge(obj1, obj2) {
            return Object.assign({}, obj1, obj2);
        }
        static clone(obj) {
            return Object.assign({}, obj);
        }
    }
    Enum = function( obj ) {
        return Object.freeze ? ( Object.freeze( obj ) ) : obj;
    };
}