namespace gn.ui.tile {
    class TileContainer extends gn.ui.basic.Widget {
        constructor( details ) {
            super(new gn.ui.layout.Row(), "div", "gn-tileContainer");
            this._model = null;
            this._idElementMap = new Map();
            this._groups = new Map();// id group -> [id elements]
            this._currentGroup = null;
            this._breadcrumb = null;
            this._fakeTiles = [];

            this._details = gn.lang.Object.merge( {
                "header" : true,
                "sort" : false, // TODO
                "filter" : false, // TODO
            }, details )

            this._tileClass = gn.ui.tile.TileItem;
            this._fakeTileClass = gn.ui.tile.FakeTileItem;
            this._subItemContClass = gn.ui.tile.TileSubItemContainer
            if( this._details.header ){
                this._header = new gn.ui.container.Row( "gn-tileContainerHeader" );
            }
            this.add(this._header);

            gn.app.App.instance().addEventListener("resize", this.genFakeTileItems, this);
        }
        set tileClass(value) {
            this._tileClass = value;
        }
        get tileClass() {
            return this._tileClass;
        }
        set subItemContClass(value) {
            this._subItemContClass = value;
        }
        get subItemContClass() {
            return this._subItemContClass;
        }
        set fakeTileClass(value) {
            this._fakeTileClass = value;
        }
        get fakeTileClass() {
            return this._fakeTileClass;
        }
        set model(value) {
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
        get model() {
            return this._model;
        }
        set breadcrumb(value){
            this._breadcrumb = value;
            this._breadcrumb.addEventListener("triggered", this.openGroup, this)
        }
        get breadcrumb(){
            return this._breadcrumb;
        }
        _onDataSet() {
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
        _makeItem(id){
            let data = this._model.data(id, gn.model.Model.DataType.all);
            let item = null
            if(data.type == gn.model.Model.Type.item) {
                item = new this._tileClass(data, this);
            }else if(data.type == gn.model.Model.Type.group) {
                item = new this._subItemContClass(data, this);
                item.addEventListener("openGroup", this.openGroup, this);
            }else {
                throw ("Invalid type of item in Tile Container");
            }
            this._idElementMap.set(id, item);
            this._groups.get(this.model.parent(id)).push(id);
            this.add(item);
        }
        _makeGroup(id) {
            if (gn.lang.Var.isNull(id)) {
                id = null;
            }
            this._groups.set(id, []);
            // let tmpIds = this._model._parentMap.get(id);
            // if (gn.lang.Var.isNull(tmpIds)) {
            //     return;
            // }
            let count = this._model.rowCount( id );
            for (let i = 0; i < count; i++) {
                let index = this._model.index( i, id );
                let data = this._model.data(index, gn.model.Model.DataType.all);
                let item = null
                if (data.type == gn.model.Model.Type.item) {
                    item = new this._tileClass(data, this);
                } else if (data.type == gn.model.Model.Type.group) {
                    item = new this._subItemContClass(data, this);
                    item.addEventListener("openGroup", this.openGroup, this);
                } else {
                    throw ("Invalid type of item in Tile Container");
                }
                this._idElementMap.set(index, item);
                this._groups.get(id).push(index);
                this.add(item);
            }
            this.genFakeTileItems();
        }
        genFakeTileItems() {
            for (let i = 0; i < this._fakeTiles.length; i++) {
                this.remove(this._fakeTiles[i]);
            }
            this._fakeTiles = [];
            var perLine = Math.floor(this.element.clientWidth / parseInt(getComputedStyle(this._idElementMap.entries().next().value[1].element).flexBasis));
            var n = this._groups.get(this._currentGroup).length % perLine;
            if (n == 0) {
                n = perLine;
            } else {
                n = perLine - (n % perLine);
            }
            for (let i = 0; i < n; i++) {
                let item = new this._fakeTileClass(this);
                this._fakeTiles.push(item);
                this.add(this._fakeTiles.at(-1));
            }
        }
        openGroup( e ) {
            this._openGroup(e.data);
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
            this.genFakeTileItems();
        }
    }
    class TileItem extends gn.ui.basic.Widget {
        constructor(data) {
            super(null, "div", "gn-tileItem");
            this._data = data;
        }
        updateItem( data, key ){
            this._data = data;
        }
    }
    class FakeTileItem extends gn.ui.basic.Widget {
        constructor() {
            super(null, "div", "gn-fakeTileItem");
        }
        updateItem( key ){
        }
    }
    class TileSubItemContainer extends gn.ui.basic.Widget { //data.type = "group"
        constructor(data) {
            super(null, "div", "gn-tileSubItemContainer");
            this._data = data;
        }
        updateItem( data, key ){
            this._data = data;
        }
    }
}