# Welcome to my simple JS framework/UI library
It has classes for many simple things in UI including event system and translating.<br/>
Project also has my JSBuilder which combines js files into one so we dont have to mess with modules because they suck.<br/>
JS files that JSBuilder works with are not typical as they have namespaces defined at the top line.
</br>
Example code in pure js.
```js
let cont = document.createElement("div");
cont.classList.add("fileCont", "fileTileFirst");
let sp1 = document.createElement("span");
sp1.innerText = "Upload a file";
cont.appendChild(sp1)
let fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.id = "fileInput"
cont.appendChild(fileInput);
sp1 = document.createElement("span");
sp1.innerText = "Rename file (Optional):";
cont.append(sp1);
let nameOfFile = document.createElement("input");
nameOfFile.type = "text";
nameOfFile.id = "fileName";
nameOfFile.placeholder = "whitout file extension";
contappendChild(nameOfFile);
let but1 = document.createElement("button");
but1.innerText = "Upload";
but1.onclick = this._uploadFile.bind(this);
contappendChild(but1);
```
Example in gn.js
```js
let cont = new gn.ui.container.Column("fileCont fileTileFirst");
cont.add(new gn.ui.basic.Label("Upload a file"))
this._firstItem.fileInput = new gn.ui.input.File();
cont.add(this._firstItem.fileInput);
cont.add(new gn.ui.basic.Label("Rename file (optional):"))
this._firstItem.nameOfFile = new gn.ui.input.Line("", "file whitout extension");
cont.add(this._firstItem.nameOfFile);
let but1 = new gn.ui.control.Button("", "Upload");
but1.addEventListener("click", this._uploadFile, this);
cont.add(but1);
```
### About JSBuilder
JSBuilder is a simple tool that converts js files into a big file. It requires a builder.config file. example:
```
 version=1.0.0
 strict=true
 src=js_src/
 out=gn.js

 file1.js
 file2.js
```
example of js file:
```js
namespace gn.ui.container {
    class Row extends gn.ui.basic.Widget {
        constructor(classList) {
            super("div", classList);
            this.addClass("gn-container-row")
        }
    }
    class Column extends gn.ui.basic.Widget {
        constructor(classList) {
            super("div", classList);
            this.addClass("gn-container-column")
        }
    }
}
```

### Known issues
builderJS doesnt recognize well switch statements so each case/default should have its own break
last thing in a file must be "}" as any new lines mess with builderJS