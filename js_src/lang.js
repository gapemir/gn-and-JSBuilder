namespace gn.lang {
    class Var {
        static isNull(value){
            return value === undefined || value == null || value === "";
        }
        static isArray(value){
            return value instanceof Array;
        }
        static isString(value){
            return typeof value == 'string';
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
    Enum = function( obj ) {
        return Object.freeze ? ( Object.freeze( obj ) ) : obj;
    };
}