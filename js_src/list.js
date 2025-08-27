namespace gn.ui.list {
    class List extends gn.ui.basic.Widget {
        constructor() {
            super();

            this._model = null;
            this._idElementMap = new Map();
            this._groups = new Map();// id group -> [id elements]
            this._itemClass = gn.ui.list.ListItem;
            this._titleClass = gn.ui.list.ListTitle; 
        }
        set itemClass(value) {
            this._itemClass = value;
        }
        get itemClass() {
            return this._itemClass;
        }
        set titleClass(value) {
            this._titleClass = value;
        }
        get titleClass() {
            return this._titleClass;
        }
        get model() {
            return this._model;
        }
        set model( value ) {
            if( this._model ){
                this._model.removeEventListener("dataSet", this._onDataSet, this);
                this._model.removeEventListener("dataAdded", this._onDataAdded, this);
                this._model.removeEventListener("reset", this._onReset, this);
                this._model.removeEventListener("beforeDataRemoved", this._onRemoveData, this);
                this._model.removeEventListener("dataRemoved", this._onDataRemoved, this );
                this._model.removeEventListener("dataChanged", this._onDataChanged, this );
                this._model.removeEventListener("decorationChanged", this._onReset, this);
            }
            this._model = value;
            if( this._model ) {
                this._model.addEventListener("dataSet", this._onDataSet, this);
                this._model.addEventListener("dataAdded", this._onDataAdded, this);
                this._model.addEventListener("reset", this._onReset, this);
                this._model.addEventListener("beforeDataRemoved", this._onRemoveData, this);
                this._model.addEventListener("dataRemoved", this._onDataRemoved, this );
                this._model.addEventListener("dataChanged", this._onDataChanged, this );
                this._model.addEventListener("decorationChanged", this._onDecorationChanged, this);
            }
        }
        _onDataSet( e ) {
            this._openGroup();
        }
        _onDataAdded(e) {
            let id = e.data;
            let parent = this.model.parent(id);
            if (this._groups.has(parent)) {
                this._makeItem(id);
                this._openGroup(parent);
            }
        }
        _onReset() {
            for( let item of this._idElementMap.values() ) {
                item.dispose();
            }
            this._idElementMap = new Map();
            this._groups = new Map();
            this._currentGroup = null;
            this._openGroup();
        }
                _onDecorationChanged() {
            for( let item of this._idElementMap.values() ) {
                item.dispose();
            }
            this._idElementMap = new Map();
            this._groups = new Map();
            this._openGroup( this._currentGroup );
        }
        _onRemoveData(e) {
            let id = e.data;
            if (this._groups.has(id)) {
                if(this._groups.get(id).length != 0) {
                    throw new Error('Group has children, cannot be removed.');
                }
            }
            if (this._idElementMap.has(id)) {
                this.remove(this._idElementMap.get(id));
                this._idElementMap.delete(id);
            }
            let parent = this.model.parent(id);
            if (this._groups.has(parent)) {
                let ids = this._groups.get(parent);
                let index = ids.indexOf(id);
                if (index > -1) {
                    ids.splice(index, 1);
                }
            }
            this.genFakeTileItems();
        }
        _onDataRemoved(e) {
        }
        _onDataChanged(e){
            this._idElementMap.get(e.data.index).updateItem(this.model.data(e.data.index, gn.model.Model.DataType.all), e.data.key);
        }
        _makeGroup(id) {
            if (gn.lang.Var.isNull(id)) {
                id = null;
            }
            this._groups.set(id, []);

            let count = this._model.rowCount( id );
            for (let i = 0; i < count; i++) {
                let index = this._model.index( i, id );
                let data = this._model.data(index, gn.model.Model.DataType.all);
                let item = null
                if (data.type == gn.model.Model.Type.item) {
                    item = new this._itemClass(data, this);
                } else if (data.type == gn.model.Model.Type.group) {
                    item = new this._titleClass(data, this);
                    item.addEventListener("openGroup", this.openGroup, this);
                } else {
                    throw ("Invalid type of item in List");
                }
                this._idElementMap.set(index, item);
                this._groups.get(id).push(index);
                this.add(item);
            }
        }
        _openGroup(id) {
            if (gn.lang.Var.isNull(id)) {
                id = null;
            }
            if (!this._groups.has(this._currentGroup)) {
                this._makeGroup(this._currentGroup);
                return;
            }
            let ids = this._groups.get(this._currentGroup)
            for (let i = 0; i < ids.length; i++) {
                this._idElementMap.get(ids[i]).exclude();
            }
            this._currentGroup = id;
            if (this._groups.has(this._currentGroup)) {
                ids = this._groups.get(this._currentGroup)
                for (let i = 0; i < ids.length; i++) {
                    this._idElementMap.get(ids[i]).show();
                }
            } else {
                this._makeGroup(this._currentGroup);
            }
            this.sendEvent("groupOpened", this._currentGroup);
            if(this._breadcrumb){
                this._breadcrumb.setIndex(this._currentGroup);
            }
        }
        openGroup( e ) {
            this._openGroup(e.data);
        }
    }
    class ListItem extends gn.ui.basic.Widget {
        constructor( data ) {
            super( null, "div", "gn-listItem" );
            this._data = data;
        }
        updateItem( data, key ){
            this._data = data;
            //TODO
        }
    }
    class ListTitle extends gn.ui.basic.Widget {
        constructor( data ) {
            super( null, "div", "gn-listTitle" );
            this._data = data;
        }
        updateItem( data, key ){
            this._data = data;
            //TODO
        }
    }
}