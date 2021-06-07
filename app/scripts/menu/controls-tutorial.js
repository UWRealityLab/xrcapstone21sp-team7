// Text Dimensions
const HEADER_TEXT_WIDTH = 7;
const TITLE_TEXT_WIDTH = 4;
const INFO_TEXT_WIDTH = 2;

// Positions & Offsets
const CENTER_X = 27.5;
const CENTER_Y = 3.4;
const CENTER_Z = 0;
const GAP = 1.9;

const TEXT_COLOR = "#222222";

AFRAME.registerComponent("controls-tutorial", {
  init: function () {
    // grab building to place all instructions relative to the building
    let el = this.building = this.el;

    // State
    this.visible = true;

    // Hides controls tutorial once no longer inside building
    this.toggleVisibility = (evt) => {
      const newPosition = evt.detail.newPosition;

      // note: maybe check position since generate-base-garden
      // can make the garden dynamic
      const newVisibility =
        25 < newPosition.x &&
        newPosition.x < 32 &&
        -4.4 < newPosition.z &&
        newPosition.z < 4.4;

      if (this.visible != newVisibility) {
        this.building.querySelectorAll(".gif-panel").forEach((gifPanel) => {
          gifPanel.components.gif.togglePlayback();
        });
        this.building
          .querySelectorAll(".control-container")
          .forEach((container) => {
            container.setAttribute("visible", newVisibility);
          });
        this.visible = newVisibility;
      }
    };

    /* Helpers */
    const createGif = (src) => {
      const gif = document.createElement("a-entity");
      gif.setAttribute("class", "gif-panel");
      gif.setAttribute("geometry", "primitive: plane");
      gif.setAttribute("scale", "1.2 1.2 1.2");
      gif.setAttribute("material", {
        shader: "gif",
        src: src,
      });
      gif.setAttribute("gif", "");

      return gif;
    };

    const createText = (text, size) => {
      const textEl = document.createElement("a-entity");
      textEl.setAttribute("text", {
        value: text,
        align: "center",
        shader: "msdf",
        width: size,
        color: TEXT_COLOR,
      });
      textEl.setAttribute("position", {
        x: 0,
        y: size === TITLE_TEXT_WIDTH ? 0.9 : -1, // probably enum instead
        z: 0,
      });

      return textEl;
    };
    /* */

    // welcome message
    const welcome = document.createElement("a-entity");
    welcome.setAttribute("text", {
      value: "Welcome!\nStep into your garden whenever you're ready!",
      align: "center",
      width: HEADER_TEXT_WIDTH,
      shader: "msdf",
      color: TEXT_COLOR,
    });
    welcome.setAttribute("position", {
      x: CENTER_X,
      y: 5.5,
      z: CENTER_Z
    });
    welcome.setAttribute("rotation", "10 90 0");

    // // Controls image and remove button
    // const controls = document.createElement("a-image");
    // controls.setAttribute("id", "controls-tutorial-img");
    // controls.setAttribute("class", "control-container");
    // controls.setAttribute("src", "#controls-img");
    // controls.setAttribute("position", {
    //   x: CENTER_X,
    //   y: CENTER_Y,
    //   z: -CENTER_Z,
    // });
    // controls.setAttribute("width", "4");
    // controls.setAttribute("height", "1.75");

    /* Instructions */

    // menu
    const menuContainer = document.createElement("a-entity");
    menuContainer.setAttribute("position", {
      x: CENTER_X,
      y: CENTER_Y,
      z: CENTER_Z - GAP,
    });
    menuContainer.setAttribute("rotation", "0 80 0");

    const navigateTheMenu = createText("Navigate the Menu", TITLE_TEXT_WIDTH);
    const menuGif = createGif("#menu-gif");
    const menuInstructions = createText(
      "Explore meditation sounds,\nyoga routines, different music/sounds\n and more in the menu.\nClick the A button (lower one on your right hand)\nto open, go back, and close the menu and\npress the right trigger to select!",
      INFO_TEXT_WIDTH
    );

    menuContainer.append(navigateTheMenu);
    menuContainer.append(menuGif);
    menuContainer.append(menuInstructions);
    //

    // locomotion
    const locomotionContainer = document.createElement("a-entity");
    locomotionContainer.setAttribute("position", {
      x: CENTER_X,
      y: CENTER_Y,
      z: CENTER_Z + GAP,
    });
    locomotionContainer.setAttribute("rotation", "0 100 0");

    const gettingAround = createText("Getting Around", TITLE_TEXT_WIDTH);
    const teleportGif = createGif("#teleport-gif");
    const teleportInsructions = createText(
      "Flick and hold the left joystick\nforward and release to\nget to your destination.\nTilt the joystick left or right to rotate.",
      INFO_TEXT_WIDTH
    );

    locomotionContainer.appendChild(gettingAround);
    locomotionContainer.appendChild(teleportGif);
    locomotionContainer.appendChild(teleportInsructions);
    //

    // asset placement
    const placementContainer = document.createElement("a-entity");
    placementContainer.setAttribute("position", {
      x: CENTER_X - 0.2,
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
      "Hold the right grip to bring\nup the placement menu. Click and\nhold the left trigger to drag and\ndrop the item. Rotate the item using\nthe left grip and undo using\nthe X button (lower one on your left hand)",
      INFO_TEXT_WIDTH
    );

    placementContainer.appendChild(customizeYourGarden);
    placementContainer.appendChild(placementGif);
    placementContainer.appendChild(placmentInstructions);
    //

    // Add to building
    // welcome.setAttribute("class", "control-container");
    menuContainer.setAttribute("class", "control-container");
    locomotionContainer.setAttribute("class", "control-container");
    placementContainer.setAttribute("class", "control-container");

    this.building.appendChild(welcome);
    // this.building.appendChild(controls);
    this.building.appendChild(menuContainer);
    this.building.appendChild(locomotionContainer);
    this.building.appendChild(placementContainer);

    this.el.sceneEl.addEventListener("teleported", this.toggleVisibility);
  },

  remove: function () {
    this.el.sceneEl.removeEventListener("teleported", this.toggleVisibility);
  },
});
