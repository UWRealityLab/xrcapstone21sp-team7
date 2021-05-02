// Needs to activated by the menu
AFRAME.registerComponent("vertical-slider", {
    schema: {
      title: { type: "string", default: ""}
    },
    init: function () {
      let el = this.el;
      let data = this.data;
  
      // Dimensions
      this.barHeight = 1;
  
      // Container
      this.container = document.createElement("a-entity");
      this.container.setAttribute("class", "container");
      this.container.setAttribute(
        "geometry",
        `primitive: plane; width: 0.1; height: ${this.barHeight};`
      );
      this.container.setAttribute(
        "material",
        "shader: flat; opacity: 0"
      );
  
      // Line
      this.line = document.createElement("a-entity");
      this.line.setAttribute(
        "geometry",
        `primitive: box; width: 0.01; height: ${this.barHeight}; depth: 0.01`
      );
      this.line.setAttribute(
        "material",
        "shader: flat; opacity: 1; color: white; side: front"
      );
  
      // Circle
      this.marker = document.createElement("a-entity");
      this.marker.setAttribute(
        "geometry",
        "primitive: cylinder; radius: 0.02; height: 0.01"
      );
      this.marker.setAttribute("rotation", "90 0 0");
      this.marker.setAttribute(
        "material",
        "shader: flat; opacity: 1; side: double; color: white"
      );
      
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
      const y = this.container.object3D.worldToLocal(evt.detail.intersection.point).y;
      const percent = ( y + 0.5 * this.barHeight ) / this.barHeight;
      console.log(percent);
  
      this.marker.setAttribute("animation", {
        property: "position.y",
        to: y,
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
  