namespace gn.model {
    class Model extends gn.core.Object {
        constructor(identifier, parent) {
            super(parent);
            this._data = null;
            this._dataIdentifier = identifier;
            this._viewId = "view";
        }
        set dataIdentifier(value) {
            if (gn.lang.Var.isNull(value)) {
                throw new Error('Data identifier cannot be null');
            }
            this._dataIdentifier = value;
        }
        set viewId(value){
            if (gn.lang.Var.isNull(value)) {
                throw new Error('View identifier cannot be null');
            }
            this._viewId = value;
        }
        setData(data) {
            throw new Error('Method "setData" must be implemented in subclass');
        }
        addData(data) {
            throw new Error('Method "addData" must be implemented in subclass');
        }
        data(id, type) {
            throw new Error('Method "data" must be implemented in subclass');
        }
        reset() {
            throw new Error('Method "reset" must be implemented in subclass');
        }
    }
    class SortModel extends gn.model.Model {
        constructor(identifier, parent) {
            throw new Error('SortModel is not implemented yet');
            super(identifier, parent);
            this._data = new Map();
            this._currLevel = null;
            this._parentIdentifier = null;
        }
    }
    class TreeModel extends gn.model.Model {
        constructor(identifier, parent) {
            super(identifier, parent);
            this._data = new Map();// id -> data
            this._parentMap = new Map(); // id -> children ids
            this._currLevel = null;
            this._parentIdentifier = null;
        }
        set parentIdentifier(value) {
            if (gn.lang.Var.isNull(value)) {
                throw new Error('Parent identifier cannot be null');
            }
            this._parentIdentifier = value;
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
                    if(this._data.has(cpy[i][this._parentIdentifier]) || cpy[i][this._parentIdentifier] == null){
                        this._addData(cpy[i])
                        cpy.splice(i,1);
                        i = 0;
                    } else {
                        i++;
                    }
                }
                //data.forEach((item) => {
                //    this._addData(item);
                //});
            }
            this.sendEvent('dataSet');
        }
        addData(data) {
            this._addData(data);
            this.sendDataEvent('dataAdded', data[this._dataIdentifier]);
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
            this.sendDataEvent('toRemoveData', id);
            this._data.delete(id);
            this._parentMap.forEach((value, key) => {
                let index = value.indexOf(id);
                if (index > -1) {
                    value.splice(index, 1);
                }
            });
        }
        _addData(data) {
            if (gn.lang.Var.isNull(data)) {
                throw new Error('Data cannot be null');
            }
            if (gn.lang.Array.isEmpty(data[this._dataIdentifier])) {
                throw new Error('Data doesnt have identifier used in this model');
            }
            this._data.set(data[this._dataIdentifier], data);
            if (!this._data.has(data[this._parentIdentifier]) && !gn.lang.Var.isNull(data[this._parentIdentifier])) {
                throw new Error('Parent data not found in model');
            }
            let parentId = data[this._parentIdentifier];
            if (gn.lang.Var.isNull(parentId)) {
                parentId = null;
            }
            if (this._parentMap.has(parentId)) {
                this._parentMap.get(parentId).push(data[this._dataIdentifier]);
            } else {
                this._parentMap.set(parentId, [data[this._dataIdentifier]]);
            }
        }
        data(id, type) {
            if (gn.lang.Var.isNull(id)) {
                throw new Error('Data identifier cannot be null');
            }
            if(gn.lang.Var.isNull(type)){
                type = gn.model.DataType.view;
            }
            if (type == gn.model.DataType.view) {
                return this._data.get(id)[this._viewId];
            } else if (type == gn.model.DataType.edit) {
                throw new TypeError("We are considering removing this one and replacing it with type(item, group)")
                return this._data.get(id);
            } else if (type == gn.model.DataType.all) {
                return this._data.get(id);
            } else {
                throw new Error('Invalid type');
            }
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
            this._data = new Map();
            this._parentMap = new Map();
            this._currLevel = null;
            this.sendEvent("reset");
        }
    }
    DataType = gn.lang.Enum({
        view: 1,
        edit: 2, //! NOT NEEDED???
        all: 3,
    });
    Type = gn.lang.Enum({
        item: 1,
        group: 2
    });
}