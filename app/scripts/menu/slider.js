// Needs to activated by the menu
AFRAME.registerComponent("slider", {
  schema: {
    title: { type: "string", default: ""},
    color: { type: "string", default: "white" }
  },
  init: function () {
    let el = this.el;
    let data = this.data;

    el.setAttribute("class", "slider");

    // Dimensions
    this.barWidth = 1;

    // Text
    this.text = document.createElement("a-entity");
    this.text.setAttribute("position", "0 0.07 0");
    this.text.setAttribute("text", {
      value: data.title,
      align: "left",
      shader: "msdf",
      color: data.color,
    });

    // Container
    this.container = document.createElement("a-entity");
    this.container.setAttribute("class", "container");
    this.container.setAttribute(
      "geometry",
      `primitive: plane; width: ${this.barWidth}; height: 0.1;`
    );
    this.container.setAttribute(
      "material",
      "shader: flat; opacity: 0"
    );

    // Line
    this.line = document.createElement("a-entity");
    this.line.setAttribute(
      "geometry",
      `primitive: box; width: ${this.barWidth}; height: 0.01; depth: 0.01`
    );
    this.line.setAttribute(
      "material",
      "shader: flat; opacity: 1; side: front"
    );
    this.line.setAttribute("material", "color", data.color);

    // Circle
    this.marker = document.createElement("a-entity");
    this.marker.setAttribute(
      "geometry",
      "primitive: cylinder; radius: 0.02; height: 0.01",
    );
    this.marker.setAttribute("rotation", "90 0 0");
    this.marker.setAttribute(
      "material",
      "shader: flat; opacity: 1; side: double"
    );
    this.marker.setAttribute("material", "color", data.color);
    this.marker.setAttribute("position", "-0.4 0 0")
    
    el.appendChild(this.text);
    el.appendChild(this.line);
    el.appendChild(this.marker);
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
    const x = this.container.object3D.worldToLocal(evt.detail.intersection.point).x;
    const percent = ( x + 0.5 * this.barWidth ) / this.barWidth;
    console.log(percent);

    this.marker.setAttribute("animation", {
      property: "position.x",
      to: x,
      dur: 500,
      easing: "easeOutExpo"
    });

    this.el.sceneEl.emit(`${this.el.id}-changed`, { percent: percent});
    console.log(`${this.el.id}-changed`);
  },

  onMouseEnter: function() {
    this.marker.setAttribute("animation", {
      property: "geometry.radius",
      to: 0.03,
      dur: 500,
      easing: "easeOutExpo"
    });
  },

  onMouseLeave: function() {
    this.marker.setAttribute("animation", {
      property: "geometry.radius",
      to: 0.02,
      dur: 500,
      easing: "easeOutExpo"
    });
  },
});
