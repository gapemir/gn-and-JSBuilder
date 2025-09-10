namespace gn.geometry{
    class Rect{
        constructor(x, y, width, height) {
            this._x = x;
            this._y = y;
            this._width = width;
            this._height = height;
        }
        get x() {
            return this._x;
        }
        get y() {
            return this._y;
        }
        get left() {
            return this._x;
        }
        get right() {
            return this._x + this._width;
        }
        get top() {
            return this._y;
        }
        get bottom() {
            return this._y + this._height;
        }
        get width() {
            return this._width;
        }
        get height() {
            return this._height;
        }
        get centerX() {
            return this._x + (this._width / 2);
        }
        get centerY() {
            return this._y + (this._height / 2);
        }
    }
    class Size {
        constructor( width, height ) {
            this._width = width;
            this._height = height;
        }
        get width() {
            return this._width;
        }
        get height() {
            return this._height;
        }
    }
    class Point{
        constructor(x, y) {
            this._x = x;
            this._y = y;
        }
        get x() {
            return this._x;
        }
        get y() {
            return this._y;
        }
    }
}