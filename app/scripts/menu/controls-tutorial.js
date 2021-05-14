const HEADER_TEXT_WIDTH = 14;
const TITLE_TEXT_WIDTH = 8;
const INFO_TEXT_WIDTH = 4;

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
      width: HEADER_TEXT_WIDTH,
      shader: "msdf",
    });
    welcome.setAttribute("position", "0 7 1.75");
    welcome.setAttribute("rotation", "25 180 0");

    /* Instructions 
      TODO: probably use images of some sort to avoid using text
    */

    // menu
    const menuContainer = document.createElement("a-entity");
    menuContainer.setAttribute("position", "0 3.5 1.6");
    menuContainer.setAttribute("rotation", "0 180 0");

    const menuInstructions = "TODO: menu instructions";
    const menu = document.createElement("a-entity");
    menu.setAttribute("text", {
      value: menuInstructions,
      align: "center",
      shader: "msdf",
      width: TITLE_TEXT_WIDTH
    });

    menuContainer.append(menu);
    //

    // locomotion
    const locomotionContainer = document.createElement("a-entity");
    locomotionContainer.setAttribute("position", "3.48 3.5 -0.8");
    locomotionContainer.setAttribute("rotation", "0 -90 0");

    const gettingAround = document.createElement("a-entity");
    gettingAround.setAttribute("text", {
      value: "Getting Around",
      align: "center",
      shader: "msdf",
      width: TITLE_TEXT_WIDTH
    });
    gettingAround.setAttribute("position", "0 1.4 0");

    const teleportGif = document.createElement("a-entity");
    teleportGif.setAttribute("geometry", "primitive: plane");
    teleportGif.setAttribute("material", {
      shader: "gif",
      src: "#teleport-gif"
    });
    teleportGif.setAttribute("scale", "2 2 2");

    const teleportInsructions = document.createElement("a-entity");
    teleportInsructions.setAttribute("text", {
      value: "Flick and hold the joystick\nforward to select your destination",
      align: "center",
      shader: "msdf",
      width: INFO_TEXT_WIDTH
    });
    teleportInsructions.setAttribute("position", "0 -1.4 0");

    locomotionContainer.appendChild(gettingAround);
    locomotionContainer.appendChild(teleportGif);
    locomotionContainer.appendChild(teleportInsructions);
    //

    // asset placement
    const placementContainer = document.createElement("a-entity");
    placementContainer.setAttribute("position", "-3.8 3.5 -0.5");
    placementContainer.setAttribute("rotation", "0 90 0");

    const placementInstructions = "TODO: placement instructions";
    const placement = document.createElement("a-entity");
    placement.setAttribute("text", {
      value: placementInstructions,
      align: "center",
      shader: "msdf",
      width: TITLE_TEXT_WIDTH
    });

    placementContainer.appendChild(placement);
    //

    // Add to building
    building.appendChild(welcome);
    building.appendChild(menuContainer);
    building.appendChild(locomotionContainer);
    building.appendChild(placementContainer);
  },
  remove: function() {},
})