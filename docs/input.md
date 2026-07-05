# ui.input

### BaseInput

base class for most of the inputs
all classes have value setter and getter, many have placeholder, dont have labels so they require external lable(checkbox, switch, range, ...)

### Line
line input
```js
const lineInput = new gn.ui.input.Line("", "Enter text here");
lineInput.addEventListener("change", (e) => {
    console.log("Line input changed:", e);
});
```

### MultiLine
```js
const multiLineInput = new gn.ui.input.MultiLine("", "Enter multiple lines here");
multiLineInput.addEventListener("change", (e) => {
    console.log("Multi-line input changed:", e);
});
```

### Number
```js
const numberInput = new gn.ui.input.Number("", "Enter a number");
numberInput.addEventListener("change", (e) => {
    console.log("Number input changed:", e);
});
```

### Password
```js
const passwordInput = new gn.ui.input.Password("", "Enter a password");
passwordInput.addEventListener("change", (e) => {
    console.log("Password input changed:", e);
});
```

### CheckBox
wrapper around native checbox, more visually appealing is Switch
```js
const checkbox = new gn.ui.input.CheckBox(true);
checkbox.addEventListener("change", (e) => {
    console.log("Checkbox changed:", e);
});
```

### Color
```js
const colorPicker = new gn.ui.input.Color("#ff0000");
colorPicker.addEventListener("change", (e) => {
    console.log("Color picker changed:", e);
});
```

### ComboBox
```js
const comboBox = new gn.ui.input.ComboBox("Select an option");
comboBox.options = [
    {value: 'val1', label: 'Label 1'},
    {value: 'val2', label: 'Label 2'},
    {value: 'val3', label: 'Label 3'},
];
comboBox.addEventListener("change", (e) => {
    console.log("ComboBox changed:", e);
}); 
```

### MultiComboBox
```js
const multiComboBox = new gn.ui.input.MultiComboBox("Select multiple options");
multiComboBox.options = [
    {value: 'val1', label: 'Label 1'},
    {value: 'val2', label: 'Label 2'},
    {value: 'val3', label: 'Label 3'},
];
multiComboBox.addEventListener("change", (e) => {
    console.log("MultiComboBox changed:", e);
});
```

### Date
```js
const dateInput = new gn.ui.input.Date();
dateInput.addEventListener("change", (e) => {
    console.log("Date input changed:", e);
});
```

### File
```js
const fileInput = new gn.ui.input.File(true);
fileInput.addEventListener("change", (e) => {
    console.log("File input changed:", e);
});
```

### Range
```js
const rangeInput = new gn.ui.input.Range(50, 0, 100);
rangeInput.addEventListener("change", (e) => {
    console.log("Range input changed:", e);
});
```

### Switch
```js
const switchInput = new gn.ui.input.Switch(true);
switchInput.addEventListener("change", (e) => {
    console.log("Switch changed:", e);
});
```