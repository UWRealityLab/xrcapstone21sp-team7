// Needs to activated by the menu
// TODO: Either make this a completey different aesthetic or combine this with audio-button.js
//         -- almost entirely same code, just the events emitted are different.
AFRAME.registerComponent("horizontal-button", {
    schema: {
      title_1: { type: "string", default: "" },
      title_2: { type: "string", default: "" },
      title_3: { type: "string", default: "" },
      img: { type: "selector", default: "#meditation-img" }
    },
    init: function () {
      let el = this.el;
      let data = this.data;

      // Title Text
      this.text = document.createElement("a-entity");
      this.text.setAttribute("position", "0.15 0.2 0");
      this.text.setAttribute("text", {
        value: data.title_1,
        align: "left",
        shader: "msdf",
        color: "#B7B4A7",
      });

      // Custom Text
      this.custom_1 = document.createElement("a-entity");
      this.custom_1.setAttribute("class", "title-1");
      this.custom_1.setAttribute("position", "0.3 0.2 0");
      this.custom_1.setAttribute("text", {
        value: "TEST",
        align: "center",
        shader: "msdf",
        color: "#B7B4A7",
      });

      // Second Title
      this.text_2 = document.createElement("a-entity");
      this.text_2.setAttribute("position", "0.15, 0, 0");
      this.text_2.setAttribute("text", {
        value: data.title_2,
        align: "left",
        shader: "msdf",
        color: "#B7B4A7",
      });

      // Custom Text 2
      this.custom_2 = document.createElement("a-entity");
      this.custom_2.setAttribute("class", "title-2");
      this.custom_2.setAttribute("position", "0.3 0 0");
      this.custom_2.setAttribute("text", {
        value: "TEST_2",
        align: "center",
        shader: "msdf",
        color: "#B7B4A7",
      });

      // Third Title
      this.text_3 = document.createElement("a-entity");
      this.text_3.setAttribute("position", "0.15, -0.2, 0");
      this.text_3.setAttribute("text", {
        value: data.title_3,
        align: "left",
        shader: "msdf",
        color: "#B7B4A7",
      });

      // Custom Text 3
      this.custom_3 = document.createElement("a-entity");
      this.custom_3.setAttribute("class", "title-3");
      this.custom_3.setAttribute("position", "0.3 -0.2 0");
      this.custom_3.setAttribute("text", {
        value: "TEST_3",
        align: "center",
        shader: "msdf",
        color: "#B7B4A7",
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
      this.container.appendChild(this.custom_1);
      this.container.appendChild(this.text_2);
      this.container.appendChild(this.custom_2);
      this.container.appendChild(this.text_3);
      this.container.appendChild(this.custom_3);
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
  