// Needs to activated by the menu
AFRAME.registerComponent("small-button", {
    schema: {
      //title: { type: "string", default: ""},
      img: { type: "selector", default: "#meditation-img" }
    },
    init: function () {
      let el = this.el;
      let data = this.data;
  
      // Container
      //this.container = document.createElement("a-image");
      //this.container.setAttribute("src", data.img);

      this.container = document.createElement("a-entity");
      this.container.setAttribute("class", "container");
      this.container.setAttribute("material", "src", data.img);
      this.container.setAttribute("mixin", "small-square");
  
      el.appendChild(this.container);
  
      // Handlers
      this.onClick = this.onClick.bind(this);
      this.onMouseEnter = this.onMouseEnter.bind(this);
      this.onMouseLeave = this.onMouseLeave.bind(this);
  
      // Listeners
      this.container.addEventListener("click", this.onClick);
      this.container.addEventListener("mouseenter", this.onMouseEnter);
      this.container.addEventListener("mouseleave", this.onMouseLeave);
    },
  
    remove: function () {
      this.container.removeEventListener("click", this.onClick);
      this.container.removeEventListener("mouseenter", this.onMouseEnter);
      this.container.removeEventListener("mouseleave", this.onMouseLeave);
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
  