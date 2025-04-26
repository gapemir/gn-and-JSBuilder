namespace gn.model {
    DataType = {
        view: 1,
        edit: 2,
        all: 3,
    }
    Type = {
        item: 1,
        group: 2
    }
    class Model extends gn.core.Object {
        constructor(identifier, parent) {
            super(parent);
            this._data = null;
            this._dataIdentifier = identifier;
        }

        set dataIdentifier(value) {
            if (gn.lang.Var.isNull(value)) {
                throw new Error('Data identifier cannot be null');
            }
            this._dataIdentifier = value;
        }

        setData(data) {
            throw new Error('Method "setData" must be implemented in subclass');
        }

        addDataEntry(data) {
            throw new Error('Method "addDataEntry" must be implemented in subclass');
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
            this._data = new Map();
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
                data.forEach((item) => {
                    this._addData(item);
                });
            }
            this.sendEvent('dataSet');
        }

        addDataEntry(data) {
            this._addData(data);
            this.sendDataEvent('dataAdded', data);
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
            if (type == gn.model.DataType.view) {
                return this._data.get(id);
            } else if (type == gn.model.DataType.edit) {
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
}