namespace gn.ui.tile {
// try using grid for tiles
    class TileContainer extends gn.ui.basic.Widget {
        constructor(parent) {
            super("div", "gn-tileContainer");
            this._parent = parent;
            this._model = null;
            this._idElementMap = new Map();
            this._groups = new Map();// id group -> [id elements]
            this._currentGroup = null;
            this._fakeTiles = [];
            this._tileClass = gn.ui.tile.TileItem;
            this._fakeTileClass = gn.ui.tile.FakeTileItem;
            this._subItemContClass = gn.ui.tile.TileSubItemContainer
            this._header = new gn.ui.basic.Widget("div", "gn-tileContainerHeader");
            let back = new gn.ui.basic.Icon(20, "fa-angle-left", ["fa-solid"])
            back.addEventListener("click", function () {
                if (!gn.lang.Var.isNull(this._currentGroup)) {
                    this.openGroup(this.model.getParent(this._currentGroup));
                }
            }, this);
            this._header.add(back);
            this.add(this._header);
        }

        set tileClass(value) {
            if (gn.lang.Var.isNull(value)) {
                throw new Error('Tile class cannot be null');
            }
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
            if (gn.lang.Var.isNull(value)) {
                throw new Error('Tile class cannot be null');
            }
            this._fakeTileClass = value;
        }

        get fakeTileClass() {
            return this._fakeTileClass;
        }

        set model(value) {
            if (gn.lang.Var.isNull(value)) {
                throw new Error('Model cannot be null');
            }
            this._model = value;
            this._model.addEventListener('dataSet', this._onDataSet, this);
            this._model.addEventListener('dataAdded', this._onDataAdded, this);
            this._model.addEventListener('reset', this._onDataAdded, this);
        }

        get model() {
            return this._model;
        }

        _onDataSet() {
            this.openGroup();
        }

        _onDataAdded(data) {
            throw new Error('Method "_onDataAdded" is not yet implemented');
        }

        _onReset() {
            throw new Error('Method "_onReset" is not yet implemented');
        }

        _makeGroup(id) {
            if (gn.lang.Var.isNull(id)) {
                id = null;
            }
            this._groups.set(id, []);
            let tmpIds = this._model._parentMap.get(id);
            if (gn.lang.Var.isNull(tmpIds)) {
                return;
            }
            for (let i = 0; i < tmpIds.length; i++) {
                let data = this._model.data(tmpIds[i], gn.model.DataType.all);
                let item = null
                if (data.type == gn.model.Type.item) {
                    item = new this._tileClass(data, this);
                } else if (data.type == gn.model.Type.group) {
                    item = new this._subItemContClass(data, this);
                    item.addEventListener("openGroup", this.openGroup, this);
                } else {
                    throw ("Invalid type of item in Tile Container");
                }
                this._idElementMap.set(tmpIds[i], item);
                this._groups.get(id).push(tmpIds[i]);
                this.add(item);
            }
            this.genFakeTileItems();
        }

        genFakeTileItems() {
            for (let i = 0; i < this._fakeTiles.length; i++) {
                this.remove(this._fakeTiles[i]);
            }
            ;
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

        openGroup(id) {
            if (gn.lang.Var.isNull(id)) {
                id = null;
            }
            if (!this._groups.has(this._currentGroup)) {
                this._makeGroup(this._currentGroup);
                return;
            }
            let ids = this._groups.get(this._currentGroup)
            for (let i = 0; i < ids.length; i++) {
                this._idElementMap.get(ids[i]).setStyle("display", "none");
            }
            this._currentGroup = id;
            if (this._groups.has(this._currentGroup)) {
                ids = this._groups.get(this._currentGroup)
                for (let i = 0; i < ids.length; i++) {
                    this._idElementMap.get(ids[i]).setStyle("display", "flex");
                }
            } else {
                this._makeGroup(this._currentGroup);
            }
            this.sendEvent("groupOpened", this._currentGroup);
            this.genFakeTileItems();
        }
    }
    class TileItem extends gn.ui.basic.Widget {
        constructor(data, parent) {
            super("div", "gn-tileItem");
            this._parent = parent;
            this._data = data;
        }
    }
    class FakeTileItem extends gn.ui.basic.Widget {
        constructor(parent) {
            super("div", "gn-fakeTileItem");
            this._parent = parent;
        }
    }
    class TileSubItemContainer extends gn.ui.basic.Widget { //data.type = "group"
        constructor(data, parent) {
            super("div", "gn-tileSubItemContainer");
            this._parent = parent;
            this._data = data;
        }
    }
}