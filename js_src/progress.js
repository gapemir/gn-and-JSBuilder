namespace gn.ui.progress {
    class ProgressBase extends gn.ui.basic.Widget {
        constructor(){
            super();

            this._start = 0;
            this._end = 100;
            this._value = 0;

            this._infinite = false;
            this._infiniteSpeed = 2.5
        }

        set start(start) {
            this._start = start;
        }
        get start() {
            return this._start;
        }
        set end(end) {
            this._end = end;
        }
        get end() {
            return this._end;
        } 
        set value(value) {
            this._value = value;
            this._updateVisualProgress();
        }
        get value() {
            return this._value;
        }
        set infinite(isInfinite) {
            this._infinite = !!isInfinite;
            this._updateInfiniteState();
        }
        get infinite() {
            return this._infinite;
        }
        set infiniteSpeed(value){
            this._infiniteSpeed = value;
        }
        _updateVisualProgress() {

        }
        _updateInfiniteState() {

        }
        _calcPercentage(){
            return (this._value - this._start) / (this._end - this._start);
        }
    }
    class ProgressBar extends gn.ui.progress.ProgressBase {
        constructor() {
            super();
            this.addClass("gn-progress-bar");

            this._bar = new gn.ui.basic.Widget();
            this.add(this._bar);
        }
        _updateVisualProgress() {
            let percentage = this._calcPercentage()
            let offset = percentage * this.width;
            this._bar.width = offset;
        }
        _updateInfiniteState() {
            if (this.infinite) {
                this.addClass("gn-infinite")
                this._bar.setStyle("animation", "gn-ui-progress-bar-inf " + this._infiniteSpeed + "s infinite linear");
            } else {
                this.removeClass("gn-infinite")
                this._bar.setStyle("animation");
                this._updateVisualProgress();
            }
        }
    }
    class ProgressBanner extends gn.ui.progress.ProgressBase {
        constructor() {
            super();
            this.addClass("gn-progress-banner");

            this._bar = new gn.ui.basic.Widget();
            this.add(this._bar);
        }
        _updateVisualProgress() {
            let percentage = this._calcPercentage()
            let offset = percentage * this.width;
            this._bar.width = offset;
        }
        _updateInfiniteState() {
            if (this.infinite) {
                this.addClass("gn-infinite")
                this._bar.setStyle("animation", "gn-ui-progress-bar-inf " + this._infiniteSpeed + "s infinite linear");
            } else {
                this.removeClass("gn-infinite")
                this._bar.setStyle("animation");
                this._updateVisualProgress();
            }
        }
    }
    class ProgressWheel extends gn.ui.progress.ProgressBase {
        constructor() {
            super();
            this.addClass("progress-wheel");
            
            this._size = 150;
            this._circumference = 408.4;

            this.width = this._size;
            this.height = this._size;
            gn.event.Timer.singleShot(this, () => this._initSvgLayout(), 0);
        }

        _initSvgLayout() {            
            this.setHTML(`
                <!--<div class="gn-progress-wheel" style="width: ${this.width}px; height: ${this.height}px;">-->
                    <svg width="100%" height="100%" viewBox="0 0 150 150" style="transform: rotate(-90deg); display: block;">
                        <circle class="gn-bg-circle" cx="75" cy="75" r="65"></circle>
                        <circle class="gn-fg-circle" cx="75" cy="75" r="65"></circle>
                    </svg>
                <!--</div>-->
            `);
            
            this._fgCircle = this.element.querySelector('.gn-fg-circle');
            this._updateVisualProgress();
            this._updateInfiniteState();
        }

        _updateVisualProgress() {
            if (!this._fgCircle || this._infinite) return;

            let percentage = this._calcPercentage();
            percentage = Math.max(0, Math.min(1, percentage)); 
            
            // Calculate offset: 0% progress = 408.4 offset, 100% progress = 0 offset
            let offset = this._circumference * (1 - percentage);
            this._fgCircle.style.strokeDashoffset = offset;
        }

        _updateInfiniteState() {
            if (this._infinite) {
                this.addClass('gn-infinite');
            } else {
                this.removeClass('gn-infinite');
                this._updateVisualProgress();
            }
        }
    }
}