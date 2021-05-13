AFRAME.registerComponent("controls-tutorial", {
  init: function() {
    let el = this.el;

    // grab building to place all instructinos relative to the building
    const building = document.querySelector("#entrance-building");

    // welcome message
    const welcome = document.createElement("a-entity");
    welcome.setAttribute("text", {
      value: "Welcome to Zendin!",
      align: "center",
      width: 8,
      shader: "msdf",
    });
    welcome.setAttribute("position", "0 4 1.5");
    welcome.setAttribute("rotation", "0 180 0");

    // Add to building
    building.appendChild(welcome);
  },
  remove: function() {},
})