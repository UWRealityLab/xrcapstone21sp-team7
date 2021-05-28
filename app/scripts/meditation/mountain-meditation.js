AFRAME.registerComponent("mountain-meditation", {
  init: function() {
    let el = this.el;
    // Toggle visibility of mountain meditation scene
    this.onStart = function() {
      el.setAttribute("visible", true);
    };

    this.onEnd = function() {
      el.setAttribute("visible", false);
    };

    // Event Listeners
    this.el.sceneEl.addEventListener("mountain-meditation-start", this.onStart);
    this.el.sceneEl.addEventListener("mountain-meditation-end", this.onEnd);
  },
  remove: function() {
    this.el.sceneEl.removeEventListener("mountain-meditation-start", this.onStart);
    this.el.sceneEl.removeEventListener("mountain-meditation-end", this.onEnd);
  }
});