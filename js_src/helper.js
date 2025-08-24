namespace gn.helper {
    class FormDataFileUpload extends gn.core.Object {
        /**
         * useful if file is very big
         * emits send event when it is "full"
         * for now it only supports one file at a time with name "1" and file name named "fileName1" and it imidiatly sends "send" event
         * if file is splited then two fields are appended for each splited file, "fp1" - file part and "tp1" - total part
         */
        constructor(){
            super();
            this._formData = new FormData();
            this._filechunks = [];
            this._currentChunkIndex = 0;
            this._done = true;
        }
        get formData() {
            return this._formData;
        }
        get done(){
            return this._done;
        }
        addField( key, value ) {
            this._formData.append( key, value );
        }
        clearFiles() {
            this._formData.delete( "file" );
            this._formData.delete( "fp" );
            this._formData.delete( "tp" );
        }
        addFile( file ) {
            let sizeToSplit = 0;
            if( file.size > gn.helper.FormDataFileUpload.maxFileSize ){
                sizeToSplit = gn.helper.FormDataFileUpload.maxFileSize;
            }
            if( file.size + this._size() + 630 > gn.helper.FormDataFileUpload.maxPostSize ) { // 630 is cca size for fpX and tpX and fileX
                let newFileToSplit = gn.helper.FormDataFileUpload.maxPostSize - this._size() - 630;
                sizeToSplit = Math.min( sizeToSplit, newFileToSplit );
            }
            if( !sizeToSplit ) { // send only one file
                this._formData.append( "file", file );
                this.sendEvent( "send", this._formData );
            }
            else {
                this._filechunks = this._splitFile( file, sizeToSplit );
                this._done = false;
                this.sendChunk();
            }
        }
        sendChunk() {
            if( this._done ){
                return;
            }
            this._formData.append( "file", this._filechunks[ this._currentChunkIndex ] );
            this._formData.append( "fp", ++this._currentChunkIndex );
            this._formData.append( "tp", this._filechunks.length );
            this.sendEvent( "send", this._formData );
            this.clearFiles();
            if( this._currentChunkIndex == this._filechunks.length ) {
                this._done = true;
            }
        }
        _size() {
            let total = 0;
            for ( let [key, value] of this._formData.entries() ) {
                total += new TextEncoder().encode( key ).length;

                if ( typeof value === "string" ) {
                    total += new TextEncoder().encode(value).length;
                } else if ( value instanceof Blob || value instanceof File ) {
                    total += value.size;
                }
                total += 200; // this is just example overhead per item but it should be enough
            }
            return total;
        }
        _splitFile( file, chunkSize ) {
            const chunks = [];
            let offset = 0;
            let chunkIndex = 0;

            while (offset < file.size) {
                const chunk = file.slice(offset, offset + chunkSize);
                
                const chunkFile = new window.File([chunk], file.name, {
                    type: file.type,
                    lastModified: file.lastModified,
                });

                chunks.push(chunkFile);
                offset += chunkSize;
                chunkIndex++;
            }
            
            return chunks;
        }
    }
    FormDataFileUpload.maxFileSize = 1024*1024*2;
    FormDataFileUpload.maxFileNum = 20;
    FormDataFileUpload.maxPostSize = 1024*1024*8;
}