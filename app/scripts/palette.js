AFRAME.registerComponent('palette', {
    init: function () {
        let el = this.el;
        let index = 0;
        let palletSize = 4;

        this.aButtonReleased = function () {
            let children = el.getChildEntities();
            // Find next 4 children to display
        }

        this.bButtonReleased = function () {
            let children = el.getChildEntities();
            // Find previous 4 children to display
        }

        this.paletteGrabbed = function (e) {
            // TOOD check which controller
            el.setAttribute('visible', 'true');
        }

        this.palletReleased = function (e) {
            // TODO check which controller
            el.setAttribute('visible', 'false');
        }

        el.sceneEl.addEventListener('abuttonup', this.aButtonReleased);
        el.sceneEl.addEventListener('bbuttonup', this.bButtonReleased);
        el.sceneEl.addEventListener('gripdown', this.paletteGrabbed);
        el.sceneEl.addEventListener('gripup', this.palletReleased);
        el.sceneEl.addEventListener('click', this.aButtonReleased);
    },

    remove() {
        this.el.sceneEl.addEventListener('abuttonup', this.aButtonReleased);
        this.el.sceneEl.addEventListener('bbuttonup', this.bButtonReleased);
        this.el.sceneEl.addEventListener('gripdown', this.paletteGrabbed);
        this.el.sceneEl.addEventListener('gripup', this.palletReleased);
        this.el.sceneEl.addEventListener('click', this.aButtonReleased);
    }
});
