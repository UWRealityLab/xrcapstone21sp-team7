// Needs to activated by the menu
AFRAME.registerComponent("small-button", {
    schema: {
      //title: { type: "string", default: ""},
      img: { type: "selector", default: "" },
      color: { type: "string", default: "white"},
    },
    init: function () {
      let el = this.el;
      let data = this.data;

      // Container
      el.setAttribute("class", "option");
      el.setAttribute("material", "src", data.img);
      el.setAttribute("material", "color", data.color);
      el.setAttribute("material", "alphaTest", 0.5);
      el.setAttribute("mixin", "small-square");
  
      // Handlers
      this.onClick = this.onClick.bind(this);
      this.onMouseEnter = this.onMouseEnter.bind(this);
      this.onMouseLeave = this.onMouseLeave.bind(this);
  
      // Listeners
      this.el.addEventListener("click", this.onClick);
      this.el.addEventListener("mouseenter", this.onMouseEnter);
      this.el.addEventListener("mouseleave", this.onMouseLeave);
    },
  
    remove: function () {
      this.el.removeEventListener("click", this.onClick);
      this.el.removeEventListener("mouseenter", this.onMouseEnter);
      this.el.removeEventListener("mouseleave", this.onMouseLeave);
    },
  
    onClick: function (evt) {
      this.el.sceneEl.emit(`${this.el.id}-changed`, {audio_id: this.el.id});
      console.log(`${this.el.id}-changed`);
    },
  
    onMouseEnter: function() {
      // TODO: Add so it pops out a bit
    },
  
    onMouseLeave: function() {
      // TODO: Add so it goes back to normal after mouse leaves
    },
  });
  