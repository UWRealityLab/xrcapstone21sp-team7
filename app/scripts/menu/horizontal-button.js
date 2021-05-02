// Needs to activated by the menu
// TODO: Either make this a completey different aesthetic or combine this with audio-button.js
//         -- almost entirely same code, just the events emitted are different.
AFRAME.registerComponent("horizontal-button", {
    schema: {
      title: { type: "string", default: ""},
      img: { type: "selector", default: "#meditation-img" }
    },
    init: function () {
      let el = this.el;
      let data = this.data;

      // Title Text
      this.text = document.createElement("a-entity");
      this.text.setAttribute("position", "0.15 0.2 0");
      this.text.setAttribute("text", {
        value: data.title,
        align: "left",
        shader: "msdf",
        color: "#B7B4A7",
      });

      // Title of Song playing now
      this.songTitle = document.createElement("a-entity");
      this.songTitle.setAttribute("class", "songTitle");
      this.songTitle.setAttribute("position", "0 0 0");
      this.songTitle.setAttribute("text", {
        value: "SONG PLAYING NOW",
        align: "center",
        shader: "msdf",
        color: "#B7B4A7"
      });

      // Image
      /*this.soundImage = document.createElement("a-image");
      this.soundImage.setAttribute("position", "0 0 0");
      this.soundImage.setAttribute("src", "#sound-wave");*/

      // Figure out the image
      this.soundImage = document.createElement("a-entity");
      this.soundImage.setAttribute("class", "image");
      this.soundImage.setAttribute("material", "src", "#sound-wave");
  
      // Container
      this.container = document.createElement("a-entity");
      this.container.setAttribute("class", "container");
      this.container.setAttribute("material", "color", "black");
      this.container.setAttribute("mixin", "horizontal-menu");
  
      //el.appendChild(this.text);
      this.container.appendChild(this.text);
      this.container.appendChild(this.songTitle);
      //this.container.appendChild(this.soundImage);
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
      this.el.sceneEl.emit(`${this.el.id}-changed`, {});
      console.log(`${this.el.id}-changed`);
    },
  
    onMouseEnter: function() {
      
    },
  
    onMouseLeave: function() {
      
    },
  });
  