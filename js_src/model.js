namespace gn.model {
    class AbstractModel extends gn.core.Object {
        constructor() {
            super();
            this._key = "id"
            this._data = {}; // index -> value
        }
        set key(value) {
            this._key = value;
        }
        rowCount() {
            return 0;
        }
        columnCount() {
            return 0;
        }
        index( row, parent) { // watch out becouse table models should have row, column, parent
            throw new TypeError("Abstract class");
        }
        setData( data ) { // param array
            this._reset();
            this._setData( data );
            this.sendEvent('dataSet');
        }

        // some sort of data inserts, movers, deleters

        changeData( index, key, value ){
            if ( gn.lang.Var.isNull( index ) ) {
                throw new Error("Data identifier cannot be null");
            }
            if( gn.lang.Var.isNull( this._data[ index ] ) ){
                throw new Error("Data with this id doesn't exist");
            }
            this._data[ index ][ key ] = value;
            this.sendEvent("dataChanged", { index: index, key: key } )
        }
        data(index, role = gn.model.Model.DataType.display) {
            if ( gn.lang.Var.isNull( index ) ) {
                throw new Error('Data identifier cannot be null');
            }
            let ret = this._data[ index ];
            switch ( role ) {
                case gn.model.Model.DataType.display:
                    ret = ret[ "display" ] || ret[ this._key ];
                    break;
                case gn.model.Model.DataType.all:
                    break;
                default:
                    throw new Error('Invalid type');
                    break;
            }
            return ret;
        }
        reset() {
            this._reset();
            this.sendEvent('reset');
        }
        _checkIndex( index ) {
            if ( gn.lang.Var.isNull( index ) ) {
                throw new Error('Data item does not have identifier');
            }
            else if( !gn.lang.Var.isNull( this._data[index] ) ) {
                throw new Error('Every item must have a unique id');
            }
        }
        _setData() {
            throw new TypeError("Abstract class");
        }
        _reset() {
            throw new TypeError("Abstract class");
        }
    }
    class TreeModel extends gn.model.AbstractModel {
        constructor() {
            super();
            this._subKey = "subitems";
            this._mapData = { null : [] }; // parent mappings
        }
        set subKey( value ){
            this._subKey = value;
        }
        rowCount( row = null ){
            return this._mapData[ row ]?.length || 0;
        }
        index( row, parent = null ) {
            if( row >= 0 && row < this.rowCount( parent ) ) {
                return this._mapData[ parent ][ row ];
            }
            return null;
        }
        setDataFromFlat( data, parentKey ) {
            this._reset();
            let removedData = {};
            for( let i = 0; i < data.length; i++ ) {
                if( data[i][parentKey] ) {
                    let item = data.find( el => el[this._key] == data[i][parentKey] )
                    if( item ){
                        if( gn.lang.Var.isNull( item.subitems ) ) {
                            item.subitems = [];
                        }
                        item.subitems.push( data[i] );
                    } else{
                        if( gn.lang.Var.isNull( removedData[ data[ i ] ].subitems ) ) {
                            item.subitems = [];
                        }
                        removedData[ data[ i ] ].subitems.push( data[ i ] )
                    }
                    data.splice( data.indexOf( data[ i ] ), 1 );
                    i--;
                }
            }
            this._setData( data );
            this.sendEvent('dataSet');
        }
        _setData(data, parent = null) {
            if(gn.lang.Var.isArray(data)) {
                data.forEach( obj => {
                    this._checkIndex( obj[this._key] );
                    this._data[ obj[ this._key ] ] = obj;
                    this._mapData[ parent ].push( obj[ this._key ] );
                    if( obj[ this._subKey ] ) {
                        this._ensureChildMapping( obj[ this._key ] );
                        this._setData( obj[ this._subKey ], obj[ this._key ] );
                    }
                });
            }
        }
        insertRow( obj, row = this.rowCount(), parent = null ) {
            if ( gn.lang.Var.isNull( obj ) ) {
                throw new Error('Data cannot be null');
            }
            if( row < 0 || row > this.rowCount() ){
                throw new Error("Row is not good");
            }
            this._checkIndex( obj[ this._key ] );
            //this.sendEvent('beforeDataAdded');
            this._data[ obj[ this._key ] ] = obj;
            this._ensureChildMapping( parent );
            this._mapData[ parent ].splice( row, 0, obj[ this._key ] );
            if( obj[ this._subKey ] ) {
                this._ensureChildMapping( obj[ this._key ] )
                this._setData( obj[ this._subKey ], obj[ this._key ] );
            }
            this.sendEvent('dataAdded', obj[ this._key ]);
        }
        moveRow(){
            throw new TypeError("not implemented yet")
        }
        removeData( index ) {
            if ( gn.lang.Var.isNull( index ) ) {
                throw new Error('Data item does not have identifier');
            }
            this.sendEvent( "beforeDataRemoved", index );
            this._removeData( index, this.parent( index ) );
            this.sendEvent( "dataRemoved", index );
        }
        _removeData( index, parent = undefined ){
            delete this._data[ index ];
            if( parent !== undefined ) {
                this._mapData[ parent ] = this._mapData[ parent ].filter( i => i != index );
            }
            this._mapData[ index ]?.forEach( idx => this._removeData( idx ) );
            delete this._mapData[ index ];
        }
        _reset(){
            this._data = {};
            this._mapData = { null : [] };
        }
        _ensureChildMapping( index ) {
            if( !this._mapData[ index ] ) {
                this._mapData[ index ] = [];
            }
        }
        parent( index ){
            for( let idx in this._mapData ) {
                if( this._mapData[ idx ].includes( index ) ) {
                    if( idx == "null" ) {
                        return null;
                    }
                    return idx;
                }
            }
            return null;
        }
        children( index ) {
            return this._mapData[ index ];
        }
    }
    // internal note: insertRow/Colun + move + remove actualy changes structure, first set Data to that, how will we handle index of empty cell, when row is iserted some id is created, but that defeats the puprose of using objects id
    // ok i have an idea, we make insertCell function that takes row, column, parent and obj and returns index this way we can have our idea of createCell, but are APIs between model compatible???
    class TableModel extends gn.model.AbstractModel {
        constructor() {
            super();
            throw new TypeError("Not implemented yet");
        }
    }
    class AbstractDecoratorModel extends gn.core.Object {
        constructor() {
            super();
            this._source = null;
        }
        set key(value){
            this._source.key = value;
        }
        rowCount() {
            return 0;
        }
        columnCount() {
            return 0;
        }
        index() {
            throw new TypeError("Abstract class");
        }
        setData( data ) { // param array
            return this._source ? this._source.setData( data ) : null;
        }
        changeData( index, key, value ){
            return this._source ? this._source.changeData( index, key, value ) : null;
        }
        data(index, role) {
            return this._source ? this._source.data( index, role ) : null;
        }
        reset() {
            return this._source ? this._source.reset() : null;
        }
    }
    class FilterSortTreeModel extends gn.model.AbstractDecoratorModel { // for now filterSortModel will only work on TreeModel not on table model
        constructor( model ) {
            super();
            this._source = null;
            this._mapping = { null : [] };

            this._filterCB = null;
            this._filter = null;
            this._sortCB = null;
            this._sort = null;

            this.sourceModel = model;
        }
        get sourceModel() {
            return this._source;
        }
        set sourceModel( value ) {
            if( this._source ) {
                //TODO
                this._source.stopForwardEvent( "reset", this );
                this._source.stopForwardEvent( "dataSet", this );
                this._source.stopForwardEvent( "dataChanged", this );
                this._source.stopForwardEvent( "beforeDataRemoved", this );
                this._source.stopForwardEvent( "dataRemoved", this );
                this._source.stopForwardEvent( "dataAdded", this );
            }
            this._mapping = { null : [] };
            this._source = value;
            if( this._source ) {
                this._source.forwardEvent( "reset", this );
                this._source.forwardEvent( "dataSet", this );
                this._source.forwardEvent( "dataChanged", this );
                this._source.forwardEvent( "beforeDataRemoved", this );
                this._source.forwardEvent( "dataRemoved", this );
                this._source.forwardEvent( "dataAdded", this );
            }
        }
        set filterCB( value ) {
            this._filterCB = value;
        }
        set sortCB( value ) {
            this._sortCB = value;
        }
        applyFilter( value ) {
            this._filter = value;
            this._applyFilterSort();
        }
        applySort( key ) {
            this._sort = key;
            this._applyFilterSort();
        }
        _applyFilterSort() {
            this._mapping = { null : [] };
            if( !gn.lang.Var.isNull( this._filter ) || !gn.lang.Var.isNull( this._sort ) ) {
                this._filterInternal();
                if( !gn.lang.Var.isNull( this._sort ) ) {
                    this._sortInternal();
                }
            }
            this.sendEvent( "decorationChanged" );
        }
        _filterInternal( parent = null ) {
            let filterFunc = this._defaultFilter;
            if( this._filterCB ) {
                filterFunc = this._filterCB;
            }
            let ret = false;
            
            for( let i = 0; i < this._source.rowCount( parent ); i++ ) {
                let index =  this._source.index( i, parent )
                let bAccept = false;
                if( this._source.children( index ) ) {
                    this._mapping [ index ] = [];
                    bAccept = this._filterInternal( index );
                }
                if( !bAccept ) {
                    bAccept = filterFunc.call( this , this.data( index, gn.model.Model.DataType.all ), this._filter );
                }
                if( bAccept ) {
                    ret = true;
                    this._mapping[ parent ].push( index )
                }
            }
            return ret
        }
        _defaultFilter( data, filter ) { // arguments should be object with key -> value and it works only with strings
            let bRet = true;
            for( let key in filter ) {
                bRet &= data[ key ].includes( filter[ key ] );
            }
            return bRet;
        }
        _sortInternal() {
            let sortFunc = this._defaultSort;
            if( this._sortCB ) {
                sortFunc = this._sortCB;
            }
            let swapped;
            let tmp = null;
            for( let key in this._mapping ) {
                let n = this._mapping[ key ].length;
                for( let i = 0; i < n - 1; i++ ) {
                    swapped = false;
                    for( let j = 0; j < n - i - 1; j++ ) {
                        if( sortFunc.call( this, this.data( this._mapping[ key ][ j ], gn.model.Model.DataType.all ), this.data( this._mapping[ key ][j + 1], gn.model.Model.DataType.all ), this._sort ) > 0 ) {
                            tmp = this._mapping[ key ][j];
                            this._mapping[ key ][j] = this._mapping[ key ][j + 1];
                            this._mapping[ key ][j + 1] = tmp;
                            swapped = true;
                        }
                    }
                    if (!swapped)
                        break;
                }
            }
        }
        _defaultSort( dataA, dataB, sort ) { // sort should be an array of keys, it only supports strings and numerical values
            let ret = 0;
            if( gn.lang.Var.isArray( sort ) ) {
                for( let key of sort ) {
                    ret = dataA[ key ] > dataB[ key ]
                    if( ret ) { 
                        return ret;
                    }
                }
            }
            return ret;
        }
        // reimplemented
        rowCount( row = null ){
            if( gn.lang.Var.isNull( this._filter ) && gn.lang.Var.isNull( this._sort ) ) {
                return this._source.rowCount( row );
            }
            return this._mapping[ row ]?.length || 0;
        }
        index( row, parent = null ) {
            if( gn.lang.Var.isNull( this._filter ) && gn.lang.Var.isNull( this._sort ) ) {
                return this._source.index( row, parent );
            }
            if( row >= 0 && row < this.rowCount( parent ) ) {
                return this._mapping[ parent ][ row ];
            }
            return null;
        }
        setDataFromFlat( ...args ) {
            return this._source ? this._source.setDataFromFlat( ...args ) : null;
        }
        insertRow( ...args ) { 
            return this._source ? this._source.insertRow( ...args ) : null;
        }
        moveRow() {
            return this._source ? this._source.moveRow( index ) : null;
        }
        removeData( index ) {
            return this._source ? this._source.removeData( index ) : null;
        }
        parent( index ) {
            return this._source ? this._source.parent( index ) : null;
        }
        children( index ) {
            return this._source ? this._source.children( index ) : null;
        }
    } 
    class filterSortTableModel extends gn.model.AbstractDecoratorModel {
        constructor() {
            super();
            throw new TypeError("Not implemented yet");
        }
    }
    Model = {};
    Model.DataType = gn.lang.Enum({
        display: 1,
        all: 2,
    });
    Model.Type = gn.lang.Enum({
        item: 1,
        group: 2
    });
}