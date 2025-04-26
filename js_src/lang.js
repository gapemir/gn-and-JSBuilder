namespace gn.lang {
    class Var {
        static isNull(value){
            if(value == undefined || value == null || value == '')
                return true;
            return false;
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
            if(gn.lang.Var.isNull(array) || array.length == 0)
                return true;
            return false;
        }
    }
    class String {
        static isEmpty (string){
            if(gn.lang.Var.isNull(string) || string.length == 0)
                return true;
            return false;
        }
    }
}