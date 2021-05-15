// Text Dimensions
const HEADER_TEXT_WIDTH = 14;
const TITLE_TEXT_WIDTH = 7;
const INFO_TEXT_WIDTH = 3;

// Positions & Offsets
const CENTER_X = 3.48;
const CENTER_Y = 3.5;
const CENTER_Z = -1;

AFRAME.registerComponent("controls-tutorial", {
  init: function () {
    let el = this.el;

    /* Helpers */
    const createGif = (src) => {
      const gif = document.createElement("a-entity");
      gif.setAttribute("geometry", "primitive: plane");
      gif.setAttribute("material", {
        shader: "gif",
        src: src,
      });
      gif.setAttribute("scale", "2 2 2");

      return gif;
    };

    const createText = (text, size) => {
      const textEl = document.createElement("a-entity");
      textEl.setAttribute("text", {
        value: text,
        align: "center",
        shader: "msdf",
        width: size,
      });
      textEl.setAttribute("position", {
        x: 0,
        y: size === TITLE_TEXT_WIDTH ? 1.4 : -1.4, // probably enum instead
        z: 0,
      });

      return textEl;
    };
    /* */

    // grab building to place all instructions relative to the building
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
    menuContainer.setAttribute("position", `0 ${CENTER_Y} 1.6`);
    menuContainer.setAttribute("rotation", "0 180 0");

    const menu = createText("TODO: menu instructions", INFO_TEXT_WIDTH);

    menuContainer.append(menu);
    //

    // locomotion
    const locomotionContainer = document.createElement("a-entity");
    locomotionContainer.setAttribute("position", {
      x: CENTER_X,
      y: CENTER_Y,
      z: CENTER_Z,
    });
    locomotionContainer.setAttribute("rotation", "0 -90 0");

    const gettingAround = createText("Getting Around", TITLE_TEXT_WIDTH);
    const teleportGif = createGif("#teleport-gif");
    const teleportInsructions = createText(
      "Flick and hold the joystick\nforward to select your destination",
      INFO_TEXT_WIDTH
    );

    locomotionContainer.appendChild(gettingAround);
    locomotionContainer.appendChild(teleportGif);
    locomotionContainer.appendChild(teleportInsructions);
    //

    // asset placement
    const placementContainer = document.createElement("a-entity");
    placementContainer.setAttribute("position", {
      x: -CENTER_X,
      y: CENTER_Y,
      z: CENTER_Z,
    });
    placementContainer.setAttribute("rotation", "0 90 0");

    const customizeYourGarden = createText(
      "Customize Your Garden",
      TITLE_TEXT_WIDTH
    );
    const placementGif = createGif("#placement-gif");
    const placmentInstructions = createText(
      "Hold the right grip to bring\nup the placement menu. Click and\nhold the left trigger to drag\nand drop the item",
      INFO_TEXT_WIDTH
    );

    placementContainer.appendChild(customizeYourGarden);
    placementContainer.appendChild(placementGif);
    placementContainer.appendChild(placmentInstructions);
    //

    // Add to building
    building.appendChild(welcome);
    building.appendChild(menuContainer);
    building.appendChild(locomotionContainer);
    building.appendChild(placementContainer);
  },
  remove: function () {},
});
