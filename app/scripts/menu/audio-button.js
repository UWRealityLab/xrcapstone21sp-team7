// Needs to activated by the menu
AFRAME.registerComponent("audio-button", {
    schema: {
      title: { type: "string", default: ""},
      img: { type: "selector", default: "#meditation-img" }
    },
    init: function () {
      let el = this.el;
      let data = this.data;

      el.setAttribute("class", "option");

      this.infoText = document.createElement("a-entity");
      this.infoText.setAttribute("mixin", "thumbnail-info-text");
      this.infoText.setAttribute("text", {
        value: data.title,
        align: "center",
        shader: "msdf",
        width: 1,
        opacity: 0,
        zOffset: 0.009
      });

      this.container = document.createElement("a-entity");
      this.container.setAttribute("class", "container");
      this.container.setAttribute("material", "src", data.img);
      this.container.setAttribute("mixin", "thumbnail");
  
      el.appendChild(this.infoText);
      el.appendChild(this.container);
  
      // Handlers
      this.onClick = this.onClick.bind(this);
      this.onMouseEnter = this.onMouseEnter.bind(this);
      this.onMouseLeave = this.onMouseLeave.bind(this);
  
      // Listeners
      el.addEventListener("click", this.onClick);
      el.addEventListener("mouseenter", this.onMouseEnter);
      el.addEventListener("mouseleave", this.onMouseLeave);
    },
  
    remove: function () {
      this.el.removeEventListener("click", this.onClick);
      this.el.removeEventListener("mouseenter", this.onMouseEnter);
      this.el.removeEventListener("mouseleave", this.onMouseLeave);
    },
  
    onClick: function (evt) {
      this.el.sceneEl.emit(`audio-changed`, {audio_id: `${this.el.id}-audio`, audio_name: this.data.title});
      console.log(`${this.el.id}-changed`);
    },
  
    onMouseEnter: function() {
      // TODO: Add so it pops out a bit
      this.infoText.setAttribute("animation", {
        property: "material.opacity",
        to: 0.9,
        dur: 500,
        easing: "easeOutExpo",
      });
  
      this.infoText.setAttribute("animation__text", {
        property: "text.opacity",
        to: 1,
        dur: 500,
        easing: "easeOutExpo",
      });
    },
  
    onMouseLeave: function() {
      // TODO: Add so it goes back to normal after mouse leaves
      this.infoText.setAttribute("animation", {
        property: "material.opacity",
        to: 0,
        dur: 500,
        easing: "easeOutExpo",
      });
  
      this.infoText.setAttribute("animation__text", {
        property: "text.opacity",
        to: 0,
        dur: 500,
        easing: "easeOutExpo"
      });
    },
  });
  