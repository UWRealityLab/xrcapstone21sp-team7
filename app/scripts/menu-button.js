// Modified from -> https://github.com/aframevr/aframe/blob/master/examples/showcase/ui/highlight.js

AFRAME.registerComponent("menu-button", {
  schema: {
    title: { type: "string", default: "Title" },
    info: { type: "string", default: "Info" },
    img: { type: "selector", default: "#meditation-img" },
    width: { type: "number", default: 1 },
  },

  init: function () {
    let el = this.el;
    let data = this.data;

    // add image and text
    let imageEl = document.createElement("a-entity");
    imageEl.setAttribute("class", "poster");
    imageEl.setAttribute("material", "src", data.img);
    imageEl.setAttribute("mixin", "poster");
    // imageEl.setAttribute("text", {
    //   value: data.title,
    //   align: "center",
    //   shader: "msdf",
    //   width: data.width,
    // });

    this.titleText = document.createElement("a-entity");
    this.titleText.setAttribute("text", {
      value: data.title,
      align: "center",
      shader: "msdf",
      width: data.width,
    });

    this.infoText = document.createElement("a-entity");
    this.infoText.setAttribute("mixin", "info-text");
    this.infoText.setAttribute("text", {
      value: data.info,
      align: "center",
      shader: "msdf",
      width: 0.8,
      opacity: 0,
    });

    // add
    imageEl.appendChild(this.titleText);
    imageEl.appendChild(this.infoText);
    el.appendChild(imageEl);

    this.onClick = this.onClick.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.reset = this.reset.bind(this);
    // backgroundEl.addEventListener('click', this.reset);
    el.addEventListener("mouseenter", this.onMouseEnter);
    el.addEventListener("mouseleave", this.onMouseLeave);
    el.addEventListener("click", this.onClick);
  },

  remove: function () {
    // this.backgroundEl.removeEventListener('click', this.reset);
    this.el.removeEventListener("mouseenter", this.onMouseEnter);
    this.el.removeEventListener("mouseleave", this.onMouseLeave);
    this.el.removeEventListener("click", this.onClick);
  },

  onClick: function (evt) {
    console.log(`${evt.target.id}-clicked`);
    this.el.emit(`${evt.target.id}-clicked`, {});
  },

  onMouseEnter: function (evt) {
    // evt.target.setAttribute("material", "color", "#046de7");
    this.infoText.setAttribute("animation", {
      property: "material.opacity",
      to: 0.95,
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

  onMouseLeave: function (evt) {
    // evt.target.setAttribute("material", "color", "white");
    // evt.target
    //   .querySelector(".poster")
    //   .setAttribute("text", {
    //     value: this.data.title,
    //     width: this.data.width
    //   });
    // evt.target.querySelector(".info-text").

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

  reset: function () {
    this.el.emit("mouseleave");
  },

  //   play: function() {
  //     this.addEventListeners();
  //   },

  //   pause: function() {
  //     this.removeEventListeners();
  //   },

  //   addEventListeners: function() {
  //     this.el.addEventListener('mouseenter', this.onMouseEnter);
  //     this.el.addEventListener('mouseleave', this.onMouseLeave);
  //     this.el.addEventListener('click', this.onClick);
  //   },

  //   removeEventListeners: function() {
  //     this.el.removeEventListener('mouseenter', this.onMouseEnter);
  //     this.el.removeEventListener('mouseleave', this.onMouseLeave);
  //     this.el.removeEventListener('click', this.onClick);
  //   }
});
