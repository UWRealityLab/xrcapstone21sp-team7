AFRAME.registerComponent("mountain-meditation", {
  init: function() {
    let el = this.el;
    // Toggle visibility of mountain meditation scene
    this.onStart = function() {
      console.log("making visible");
      el.setAttribute("visible", true);
    };

    this.onEnd = function() {
      console.log("making invisible");
      el.setAttribute("visible", false);
    };

    // Event Listeners
    this.el.sceneEl.addEventListener("mountain-meditation-start", this.onStart);
    this.el.sceneEl.addEventListener("menu-item-deselected", this.onEnd);
  },
  remove: function() {
    this.el.sceneEl.removeEventListener("mountain-meditation-start", this.onStart);
    this.el.sceneEl.removeEventListener("menu-item-deselected", this.onEnd);
  }
});