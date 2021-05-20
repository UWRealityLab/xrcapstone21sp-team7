// Text Dimensions
const HEADER_TEXT_WIDTH = 10;
const TITLE_TEXT_WIDTH = 3.5;
const INFO_TEXT_WIDTH = 1.5;

// Positions & Offsets
const CENTER_X = 2.5;
const CENTER_Y = 3.4;
const CENTER_Z = -1;
const OFFSET_Z = 1.7;

AFRAME.registerComponent("controls-tutorial", {
  init: function () {
    let el = this.el;
    // grab building to place all instructions relative to the building
    this.building = document.querySelector("#entrance-building");

    // State
    this.visible = true;

    // Hides controls tutorial once no longer inside building
    this.toggleVisibility = (evt) => {
      const newPosition = evt.detail.newPosition;

      // note: maybe check position since generate-base-garden
      // can make the garden dynamic
      const newVisibility =
        19 < newPosition.x &&
        newPosition.x < 26.5 &&
        -5 < newPosition.z &&
        newPosition.z < 5;

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
        color: "#555555",
      });
      textEl.setAttribute("position", {
        x: 0,
        y: size === TITLE_TEXT_WIDTH ? 0.7 : -0.7, // probably enum instead
        z: 0,
      });

      return textEl;
    };
    /* */

    // welcome message
    const welcome = document.createElement("a-entity");
    welcome.setAttribute("text", {
      value: "Welcome to Zendin!",
      align: "center",
      width: HEADER_TEXT_WIDTH,
      shader: "msdf",
      color: "#555555",
    });
    welcome.setAttribute("position", "0 6 1.75");
    welcome.setAttribute("rotation", "20 180 0");

    // Controls image and remove buttonw
    const controls = document.createElement("a-image");
    controls.setAttribute("id", "controls-tutorial-img");
    controls.setAttribute("class", "control-container");
    controls.setAttribute("src", "#controls-img");
    controls.setAttribute("position", {
      x: -CENTER_X - 1,
      y: CENTER_Y,
      z: CENTER_Z,
    });
    controls.setAttribute("rotation", "0 90 0");
    controls.setAttribute("width", "4");
    controls.setAttribute("height", "1.75");

    // const controlsButton = document.createElement("a-box");
    // controlsButton.setAttribute("id", "controls-tutorial-dismiss");
    // controlsButton.setAttribute("class", "rightclickable");
    // controlsButton.setAttribute("position", "0 1.75 7.625");
    // controlsButton.setAttribute("scale", "0.6 0.6 0.2");
    // controlsButton.setAttribute("rotation", "5 0 0");
    // controlsButton.setAttribute("color", "white");
    // controlsButton.setAttribute("yoga-button", "");

    // const controlsButtonImg = document.createElement("a-image");
    // controlsButtonImg.setAttribute("id", "controls-tutorial-dismiss-img");
    // controlsButtonImg.setAttribute("src", "#controls-next-img");
    // controlsButtonImg.setAttribute("position", "0 1.75 7.5");
    // controlsButtonImg.setAttribute("rotation", "-5 180 0");
    // controlsButtonImg.setAttribute("width", "0.5");
    // controlsButtonImg.setAttribute("height", "0.5");

    /* Instructions */

    // menu
    const menuContainer = document.createElement("a-entity");
    menuContainer.setAttribute("position", {
      x: CENTER_X,
      y: CENTER_Y,
      z: CENTER_Z + OFFSET_Z,
    });
    menuContainer.setAttribute("rotation", "0 -90 0");

    const navigateTheMenu = createText("Navigate the Menu", TITLE_TEXT_WIDTH);
    const menuGif = createGif("#menu-gif");
    const menuInstructions = createText(
      "Explore meditation sounds,\nyoga routines, different music/sounds\n and more in the menu",
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
      z: CENTER_Z - OFFSET_Z,
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
      x: CENTER_X,
      y: CENTER_Y,
      z: CENTER_Z,
    });
    placementContainer.setAttribute("rotation", "0 -90 0");

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
    welcome.setAttribute("class", "control-container");
    menuContainer.setAttribute("class", "control-container");
    locomotionContainer.setAttribute("class", "control-container");
    placementContainer.setAttribute("class", "control-container");

    this.building.appendChild(welcome);

    this.building.appendChild(controls);
    // this.building.appendChild(controlsButton);
    // this.building.appendChild(controlsButtonImg);

    this.building.appendChild(menuContainer);
    this.building.appendChild(locomotionContainer);
    this.building.appendChild(placementContainer);

    this.el.sceneEl.addEventListener("teleported", this.toggleVisibility);
    // this.el.sceneEl.addEventListener(
    //   "controls-tutorial-dismiss-triggered",
    //   this.dismissControls
    // );
  },

  remove: function () {
    this.el.sceneEl.removeEventListener("teleported", this.toggleVisibility);
    // this.el.sceneEl.removeEventListener(
    //   "controls-tutorial-dismiss-triggered",
    //   this.dismissControls
    // );
  },

  // dismissControls: function() {
  //   document.querySelectorAll('[id^="controls-tutorial"]').forEach((control) => control.setAttribute("visible", "false"));
  // }
});
