# UI

## basic

### Widget

Base widget, has native element of any type, primarly div. It has methods to visualy modify native element like width, height ...
It can have layout manager whitch tells how its children are positioned. It also has support for tooltips.

```js
const widget = new gn.ui.basic.Widget();
const child = new gn.ui.basic.Widget();
widget.add(child);
widget.height = 100; //can be any unit, if number then px is assumed, this can be checked by looking at the function :)
```

### Image

Widget that can hold any type of image.

```js
const image = new gn.ui.basic.Image("src_of_image");
```

### Icon
Icon wrapper widget, mostly used for icons like awesome font.

### Label
Label wrapper widget with option of localization.

## container

### Row

Simple widget with BoxLayoutManager in horizontal direction. See RowLayoutManager.

### Column

Simple widget with BoxLayoutManager in vertical direction. See ColumnLayoutManager.

### Grid

Simple widget with BoxLayoutManager in horizontal direction. See RowLayoutManager.

### Stack

Widget that can hold multiple widgets but it only displays one at a time. It has left, right, up, down sliding animations.

```js
const stack = new gn.ui.container.Stack();
stack.add(new gn.ui.basic.Image("..."));
stack.add(new gn.ui.basic.Image("..."));
```

### Split

Widget that holds more than one widget with splitters in the middle. Splitters are used to resize each segment of split.

```js
const splitter = new gn.ui.container.Split();
splitter.add(new gn.ui.basic.Image("..."));
splitter.add(new gn.ui.basic.Image("..."));
```

#### SplitHandle

Widget used in split.

### Scroll

Widget that makes its one child scrolable. It has vertical and horizontal scrollbars that are present when needed.

```js
const scroll = new gn.ui.container.Scroll(new gn.ui.basic.Image(""));
scroll.height = "300px";
scroll.width = "600px";

scroll.body.setStyle("height", "800px");
scroll.body.setStyle("width", "800px");
```

#### Scrollbar

Widget used in scroll.

## layout
Layouts are not physical elemtns so they maybe dont belong here but they do manage how elements are aranged.

### AbstractLayout
Abstract layout and all layouts need to inherit from this one.

### Box
Simple layout with given direction and gap.

### Row
Box layout with horizontal direction.

### Column
Box layout with vertical direction.

### Grid
Layout that simplifies grid layout in css. It accepts simple columns & rows number or complex columnsTemplate & rowsTemplate like used in css