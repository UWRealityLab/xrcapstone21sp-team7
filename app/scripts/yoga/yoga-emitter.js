AFRAME.registerComponent("yoga-emitter", {
  init: function() {
    let el = this.el;
    
    this.yogaTrigger = function() {
      document.querySelector("#yoga-cylinder").setAttribute("color", "blue");
      el.emit("yogaStart");
    }
    
    this.el.addEventListener("click", this.yogaTrigger);
  },
  remove: function() {
    this.el.removeEventListener("click", this.yogaTrigger);
  }
});