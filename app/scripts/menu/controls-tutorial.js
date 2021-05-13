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
      width: 14,
      shader: "msdf",
    });
    welcome.setAttribute("position", "0 7 1.75");
    welcome.setAttribute("rotation", "25 180 0");

    /* Instructions 
      TODO: probably use images of some sort to avoid using text
    */

    // menu
    const menuInstructions = "TODO: menu instructions";
    const menu = document.createElement("a-entity");
    menu.setAttribute("text", {
      value: menuInstructions,
      align: "center",
      shader: "msdf",
      width: 8
    });
    menu.setAttribute("position", "0 4 1.6");
    menu.setAttribute("rotation", "0 180 0");

    // locomotion
    const teleportInstructions = "you can get around the garden\nby walking or using the left\njoystick to teleport";
    const teleport = document.createElement("a-entity");
    teleport.setAttribute("text", {
      value: teleportInstructions,
      align: "center",
      shader: "msdf",
      width: 8
    });
    teleport.setAttribute("position", "3.8 4 -0.85");
    teleport.setAttribute("rotation", "0 -90 0");

    // asset placement
    const placementInstructions = "TODO: placement instructions";
    const placement = document.createElement("a-entity");
    placement.setAttribute("text", {
      value: placementInstructions,
      align: "center",
      shader: "msdf",
      width: 8
    });
    placement.setAttribute("position", "-3.8 4 -0.85");
    placement.setAttribute("rotation", "0 90 0");

    // Add to building
    building.appendChild(welcome);
    building.appendChild(menu);
    building.appendChild(teleport);
    building.appendChild(placement);
  },
  remove: function() {},
})