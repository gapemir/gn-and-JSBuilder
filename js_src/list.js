namespace gn.ui.list {
    class List extends gn.ui.container.Column {
        constructor() {
            super();

            this._model = null;
            this._idElementMap = new Map(); // id -> listElement
            this._groups = new Map();// id group -> gn.ui.list.Group
            this._openedGroups = [];
            this._itemRenderer = new gn.ui.list.ItemRenderer();
            this._titleRenderer = new gn.ui.list.TitleRenderer();
            this._currentGroup = null; // id of currently opened group
        }
        set itemRenderer(value) {
            this._itemRenderer = value;
        }
        set titleRenderer(value) {
            this._titleRenderer = value;
        }
        _destructor() {
            this._itemRenderer = null;
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
            if(!(value instanceof gn.model.AbstractTreeModel)) {
                throw new TypeError("Wrong model type")
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
        openGroup( e ) {
            this._openGroup(e.data);
        }
        _onDataSet( e ) {
            this._openGroup();
        }
        _onDataAdded(e) {
            let id = e.data;
            let parent = this.model.parent(id);
            if (this._groups.has(parent)) {
                this._makeItem(id, this._groups.get(parent));
            }
        }
        _onReset() {
            for( let id of this._idElementMap.keys() ) {
                this._getRenderer(id).disposeElement(this._idElementMap.get(id))
            }
            for( let group of this._groups.values() ) {
                group.dispose();
            }
            this._idElementMap = new Map();
            this._groups = new Map();
            this._currentGroup = null;
            this._openedGroups = [];
            this._openGroup();
        }
        _onDecorationChanged() {
            for( let id of this._idElementMap.keys() ) {
                this._getRenderer(id).disposeElement(this._idElementMap.get(id))
            }
            for( let group of this._groups.values() ) {
                group.dispose();
            }
            this._idElementMap = new Map();
            this._groups = new Map();
            this._currentGroup = null;
            this._openedGroups = [];
            this._openGroup( this._currentGroup );
        }
        _onRemoveData(e) {
            let id = e.data;
            let parent = this.model.parent(id);
            if (this._groups.has(id)) {
                let group = this._groups.get(id);
                this._groups.delete(id)
                for(let idx of group.itemsKeys()) { 
                    this._idElementMap.get(idx).dispose();
                }
                group.dispose();
                if (this._groups.has(parent)) {
                    let pGroup = this._groups.get(parent)
                    pGroup.removeGroup(id);
                }
            }
            if (this._idElementMap.has(id)) {
                this._idElementMap.get(id).dispose();
                this._idElementMap.delete(id);
            }
            if (this._groups.has(parent)) {
                let pGroup = this._groups.get(parent)
                pGroup.removeItem(id);
            }
        }
        _onDataRemoved(e) {
            // nothing is needed here
        }
        _onDataChanged(e) {
            let element = this._idElementMap.get(e.data.index)
            this._getRenderer(e.data.index).updateElement(element, this._createDataForRenderer(e.data.index), e.data.key);
        }
        _toggleGroup(id) {
            let group = this._groups.get(id);
            if(gn.lang.Var.isNull(group)) {
                this._openGroup(id);
                return;
            }
            if(group.isVisible()) {
                this._openedGroups.splice(this._openedGroups.indexOf(id), 1);
                group.exclude();
                this._getRenderer(id).updateElement(this._idElementMap.get(id), this._createDataForRenderer(id));
            }
            else {
                this._openedGroups.push(id);
                group.show();
                this._getRenderer(id).updateElement(this._idElementMap.get(id), this._createDataForRenderer(id));
            }
        }
        _openGroup(id = null) {
            this._currentGroup = id;
            let group = this._groups.get(this._currentGroup)
            if (gn.lang.Var.isNull(group)) {
                group = this._makeGroup(this._currentGroup);
            }
            this.sendEvent("groupOpened", this._currentGroup);
            if(this._breadcrumb){
                this._breadcrumb.setIndex(this._currentGroup);
            }
            if(id !== null) {
                this._getRenderer(id).updateElement(this._idElementMap.get(id), this._createDataForRenderer(id));
            }
        }
        _makeGroup(id = null) {
            let group = new gn.ui.list.Group(id);
            if(id == null) {
                this.add(group);
            } else {
                let pId = this.model.parent(id);
                let pGroup = this._groups.get(pId);
                if(gn.lang.Var.isNull(pGroup)) {
                    this._makeGroup(pId);
                }
                pGroup.addGroup(id, group);
                group.level = pGroup.level + 1;
            }
            this._groups.set(id, group);
            this._openedGroups.push(id);

            let count = this._model.rowCount( id );
            for (let i = 0; i < count; i++) {
                let index = this._model.index( i, id );
                this._makeItem(index, group);
            }
            return group;
        }
        _makeItem(idx, group) {
            let data = this._createDataForRenderer(idx);
            let type = this._model.data(idx, gn.model.Model.DataType.type)

            let renderer = this._getRenderer(idx);
            let item = renderer.createElement(data);
            renderer.updateElement(item, data);
            item._list = this;
            
            if (type == gn.model.Model.Type.group) {    
                item.addEventListener("click", _ => this._toggleGroup(idx), this);
            }
            this._idElementMap.set(idx, item);
            group.add(idx, item);
        }
        _getRenderer(idx) {
            let type = this._model.data(idx, gn.model.Model.DataType.type);
            if (type == gn.model.Model.Type.item) {
                return this._itemRenderer;
            }
            else {
                return this._titleRenderer;
            }
        }
        _createDataForRenderer(idx) {
            return {
                opened : this._openedGroups.indexOf(idx) != -1,
                data : this._model.data(idx, gn.model.Model.DataType.all),
                type : this._model.data(idx, gn.model.Model.DataType.type),
            }
        }
    }
    class Group extends gn.ui.container.Column {
        constructor(id) {
            super("gn-list-group");
            this._id = id;
            this._mapItems = {};
            this._mapGroups = {};
            this._level = 0;
        }
        _distructor() {
            this._mapItems = {};
            this._mapGroups = {};
        }

        get level() {
            return this._level;
        }

        set level(value) {
            this._level = value;
            this.setStyle("padding-left", this._level * 20 + "px");
        }

        add(index, item) {
            this._mapItems[index] = item;
            super.add(item);
        }
        itemsKeys() {
            return Object.keys(this._mapItems);
        }
        item(idx) {
            return this._mapItems[idx];
        }
        removeItem(idx) {
            delete this._mapItems[idx];
        }

        addGroup(index, group) {
            this._mapGroups[index] = group;
            let title = this._mapItems[index];
            super.addAfter(group, title);
        }
        groupsKeys() {
            return Object.keys(this._mapGroups);
        }
        groupe(idx) {
            return this._mapGroups[idx];
        }
        removeGroup() {
            delete this._mapGroups[idx];
        }
    }

    class Renderer {
        createElement(data) {
            throw new TypeError("Abstract class");
        }

        updateElement(element, data) {
            throw new TypeError("Abstract class");
        }

        disposeElement(element) {
            throw new TypeError("Abstract class");
        }
    }
    class ItemRenderer extends gn.ui.list.Renderer {
        createElement(data) {
            let el = new gn.ui.container.Row();
            el.setStyle("border", "1px solid gray");
            el.setStyle("margin", "3px");

            if(data.data.icon) {
                el.icon = new gn.ui.basic.Icon();
                el.icon.setStyle("margin-right", "5px");
                el.add(el.icon);
            }
            let label = new gn.ui.basic.Label();
            el.label = label;
            el.add(label);

            return el;
        }

        updateElement(element, data) {
            element.label.text = data.data.title;
            if(data.data.icon) {
                element.icon.size = data.data.icon.size;
                element.icon.iconName = data.data.icon.iconName;
                element.icon.iconSet = data.data.icon.iconSet;
            }
        }

        disposeElement(element) {
            element.dispose();
        }
    }
    class TitleRenderer extends gn.ui.list.Renderer {
        createElement(data) {
            let el = new gn.ui.container.Row();
            el.setStyle("border", "1px solid gray");
            el.setStyle("margin", "3px");
            el.setStyle("position", "relative");

            el.expandIcon = new gn.ui.basic.Icon(12, "fa-caret-down", ["fa-solid"]);
            el.expandIcon.setStyle("position", "absolute ")
            el.expandIcon.setStyle("left", "10px")
            el.add(el.expandIcon);

            if(data.data.icon) {
                el.icon = new gn.ui.basic.Icon()
                el.icon.setStyle("margin-right", "5px");
                el.add(el.icon);
            }
            el.label = new gn.ui.basic.Label();
            el.add(el.label);

            return el;
        }

        updateElement(element, data) {
            element.label.text = data.data.title;
            if(data.data.icon) {
                element.icon.size = data.data.icon.size;
                element.icon.iconName = data.data.icon.iconName;
                element.icon.iconSet = data.data.icon.iconSet;
            }
            if(data.opened) {
                element.expandIcon.iconName = "fa-caret-up"
            } else {
                element.expandIcon.iconName = "fa-caret-down"
            }
        }

        disposeElement(element) {
            element.dispose();
        }
    }
}