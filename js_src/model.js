namespace gn.model {
    class Model extends gn.core.Object {
        constructor(identifier, parent) {
            super(parent);
            this._data = new Map(); // id -> data
            this._dataId = identifier || "id";
            this._viewId = "view";

            this._filterText = "";
            this._filterCb = null;
            this._filterCtx = null;
            this._sortCb = null;
            this._sortCtx = null;
        }
        set dataId(value) {
            if (gn.lang.Var.isNull(value)) {
                throw new Error('Data identifier cannot be null');
            }
            this._dataId = value;
        }
        set viewId(value){
            if (gn.lang.Var.isNull(value)) {
                throw new Error('View identifier cannot be null');
            }
            this._viewId = value;
        }
        setData(data) {
            this._data = new Map();
            if(gn.lang.Var.isArray(data)) {
                data.forEach((item) => {
                    if (gn.lang.Var.isNull(item[this._dataId])) {
                        throw new Error('Data item does not have identifier used in this model');
                    }
                    this._data.set(item[this._dataId], item);
                });
            }
            this.sendEvent('dataSet');
        }
        addData(data) {
            if (gn.lang.Var.isNull(data)) {
                throw new Error('Data cannot be null');
            }
            if (gn.lang.Var.isNull(data[this._dataId])) {
                throw new Error('Data does not have identifier used in this model');
            }
            this._data.set(data[this._dataId], data);
            this.sendDataEvent('dataAdded', data[this._dataId]);
        }
        removeData(id){
            if (gn.lang.Var.isNull(id)) {
                throw new Error('Id cannot be null');
            }
            if (!this._data.has(id)) {
                throw new Error('Data not found in model');
            }
            this.sendDataEvent('toRemoveData', id);
            this._data.delete(id);
            this.sendDataEvent('dataRemoved', id);
        }
        fAllData(type = gn.model.Model.DataType.view) {
            let tmp = Array.from(this._data.values());
            if (gn.lang.Var.isFunction(this._filterCb)) {
                for (let val in tmp) {
                    if (this._filter.call(this._filterCtx, this._filterText, val, this)) {
                        tmp.push(val);
                    }
                }
            }
            if (gn.lang.Var.isFunction(this._sort)) {
                tmp.sort((a, b) => this._sort.call(this._sortCtx, a, b, this));
            }
            let ret = [];
            switch (type) {
                case gn.model.Model.DataType.view:
                    ret = tmp.map(item => item[this._viewId]);
                    break;
                case gn.model.Model.DataType.edit:
                    new TypeError("We are considering removing this one")
                    break;
                case gn.model.Model.DataType.all:
                    ret = tmp;
                    break;
                default:
                    break
            }
            return ret;
        }
        fData(id, type = gn.model.Model.DataType.view) {
            if (gn.lang.Var.isNull(id)) {
                throw new Error('Data identifier cannot be null');
            }
            let ret = this._data.get(id);
            if (gn.lang.Var.isFunction(this._filter)) {
                if (!this._filter.call(this._filterCtx, this._filterText, ret, this)) {
                        return null;
                }
            }
            switch (type) {
                case gn.model.Model.DataType.view:
                    ret = ret[this._viewId];
                    break;
                case gn.model.Model.DataType.edit:
                    new TypeError("We are considering removing this one")
                    break;
                case gn.model.Model.DataType.all:
                    break;
                default:
                    throw new Error('Invalid type');
                    break;
            }
            return ret;
        }
        data(id, type = gn.model.Model.DataType.view) {
            if (gn.lang.Var.isNull(id)) {
                throw new Error('Data identifier cannot be null');
            }
            let ret =  this._data.get(id)[this._viewId];
            switch (type) {
                case gn.model.Model.DataType.all:
                    ret = this._data.get(id);
                    break;
                case gn.model.Model.DataType.edit:
                    new TypeError("We are considering removing this one")
                    break;
                default:
                    break;
            }
            return ret;
        }
        reset() {
            this._data = new Map();
            this.sendEvent('reset');
        }
        setAcceptFilter(cb, ctx){
            if (gn.lang.Var.isNull(cb) || !gn.lang.Var.isFunction(cb)) {
                throw new Error('Filter callback must be a function');
            }
            this._filterCb = cb;
            this._filterCtx = ctx;
            this.sendEvent('filterSet');
        }
        setAcceptSort(cb, ctx){
            if (gn.lang.Var.isNull(cb) || !gn.lang.Var.isFunction(cb)) {
                throw new Error('Sort callback must be a function');
            }
            this._sortCb = cb;
            this._sortCtx = ctx;
            this.sendEvent('sortSet');
        }
    }
    class TreeModel extends gn.model.Model {
        constructor(identifier, parent) {
            super(identifier, parent);
            this._parentMap = new Map(); // id -> children ids
            //this._currLevel = null;
            this._parentId = null;
        }
        set parentId(value) {
            if (gn.lang.Var.isNull(value)) {
                throw new Error('Parent identifier cannot be null');
            }
            this._parentId = value;
        }
        setData(data) {
            this._data = new Map();
            if (gn.lang.Var.isArray(data)) {
                let cpy = [...data];
                let i = 0;
                while(cpy.length){
                    if(i >= cpy.length) {
                        i = 0;
                    }
                    if(this._data.has(cpy[i][this._parentId]) || cpy[i][this._parentId] == null){
                        this._addData(cpy[i])
                        cpy.splice(i,1);
                        i = 0;
                    } else {
                        i++;
                    }
                }
            }
            this.sendEvent('dataSet');
        }
        _addData(data) {
            if (gn.lang.Var.isNull(data)) {
                throw new Error('Data cannot be null');
            }
            if (gn.lang.Var.isNull(data[this._dataId])) {
                throw new Error('Data doesnt have identifier used in this model');
            }
            if(!this._data.has(data[this._parentId]) && !gn.lang.Var.isNull(data[this._parentId])){
                throw new Error('Parent data not found in model');
            }
            this._data.set(data[this._dataId], data);

            let parentId = data[this._parentId];
            if (gn.lang.Var.isNull(parentId)) {
                parentId = null;
            }
            if (this._parentMap.has(parentId)) {
                this._parentMap.get(parentId).push(data[this._dataId]);
            } else {
                this._parentMap.set(parentId, [data[this._dataId]]);
            }
        }
        addData(data) {
            if( gn.lang.Var.isNull(data)) {
                throw new Error('Data cannot be null');
            }
            if (gn.lang.Var.isNull(data[this._dataId])) {
                throw new Error('Data does not have identifier used in this model');
            }
            if(!this._data.has(data[this._parentId]) && !gn.lang.Var.isNull(data[this._parentId])){
                throw new Error('Parent data not found in model');
            }
            let parentId = data[this._parentId];
            if (gn.lang.Var.isNull(parentId)) {
                parentId = null;
            }
            if (this._parentMap.has(parentId)) {
                this._parentMap.get(parentId).push(data[this._dataId]);
            } else {
                this._parentMap.set(parentId, [data[this._dataId]]);
            }
            super.addData(data);
        }
        removeData(id) {
            if (gn.lang.Var.isNull(id)) {
                throw new Error('Id cannot be null');
            }
            if (!this._data.has(id)) {
                throw new Error('Data not found in model');
            }
            if(this._parentMap.has(id)) {
                let children = this._parentMap.get(id);
                children.forEach((childId) => {
                    this.removeData(childId);
                });
            }            
            this._parentMap.forEach((value, key) => {
                let index = value.indexOf(id);
                if (index > -1) {
                    value.splice(index, 1);
                }
            });
            super.removeData(id);
        }
        getChildren(id) {
            if (this._parentMap.has(id)) {
                return this._parentMap.get(id);
            } else {
                return null;
            }
        }
        getParent(id) {
            if (gn.lang.Var.isNull(id)) {
                throw new Error('Id cannot be null');
            }
            for (let [key, value] of this._parentMap.entries()) {
                if (value.includes(id)) {
                    return key;
                }
            }
            throw new Error('This should not happen, contact me');
        }
        reset() {
            this._parentMap = new Map();
            //this._currLevel = null;
            super.reset();
        }
    }
    Model.DataType = gn.lang.Enum({
        view: 1,
        edit: 2, //! NOT NEEDED???
        all: 3,
    });
    Model.Type = gn.lang.Enum({
        item: 1,
        group: 2
    });
}