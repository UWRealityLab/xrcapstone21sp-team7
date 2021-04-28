AFRAME.registerComponent("menu-controls", {
  init: function () {
    let el = this.el;

    this.currentMenu;
    // Grab template of menu to display
    this.displayed = false;
    this.ui = document
      .querySelector("#activity-menu-template")
      .content.cloneNode(true)
      .querySelector("#ui");
    document.querySelector("#camRig").appendChild(this.ui);

    // Event handlers
    this.onMenuActivate = this.onMenuActivate.bind(this);
    this.onVolumeChanged = this.onVolumeChanged.bind(this);
    this.onMeditationButtonClicked = this.onMeditationButtonClicked.bind(this);
    this.onYogaButtonClicked = this.onYogaButtonClicked.bind(this);

    this.onGuidedMeditationClicked = this.onGuidedMeditationClicked.bind(this);
    this.onStoryMeditationClicked = this.onStoryMeditationClicked.bind(this);
    this.onConfidenceBoosterClicked = this.onConfidenceBoosterClicked.bind(this);
    this.onBreathingExerciseButtonClicked = this.onBreathingExerciseButtonClicked.bind(this);

    this.removeEventListeners = this.removeEventListeners.bind(this);

    // Button event listeners
    // TODO: change trigger button
    this.el.addEventListener("abuttondown", this.onMenuActivate);
    this.el.sceneEl.addEventListener(
      "meditation-button-clicked",
      this.onMeditationButtonClicked
    );
    this.el.sceneEl.addEventListener(
      "yoga-button-clicked",
      this.onYogaButtonClicked
    );
    this.el.sceneEl.addEventListener(
      "guided-meditation-button-clicked",
      this.onGuidedMeditationClicked
    );
    this.el.sceneEl.addEventListener(
      "story-telling-button-clicked",
      this.onStoryMeditationClicked
    );
    this.el.sceneEl.addEventListener(
      "confidence-booster-button-clicked",
      this.onConfidenceBoosterClicked
    );
    this.el.sceneEl.addEventListener(
      "breathing-exercise-button-clicked",
      this.onBreathingExerciseButtonClicked
    );
    this.el.sceneEl.addEventListener("volume-slider-changed", this.onVolumeChanged);

    // Helpers
    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.activateSliders = this.activateSliders.bind(this);
    this.deactivateSliders = this.deactivateSliders.bind(this);

    this.activateSmallButton = this.activateSmallButton.bind(this);
    this.deactivateSmallButton = this.deactivateSmallButton.bind(this);
  },

  /*
    Displays or hides the menu
  */
  onMenuActivate: function () {
    if (this.displayed) {
      this.ui.setAttribute("visible", "false");
      this.deactivate(this.currentMenu);
      // this.deactivate(document.querySelector("#volume-button"));
      this.deactivateSliders();

      this.deactivateSmallButton();
    } else {
      this.el.emit("goMeditation", { returnColor: "meditation" }); // Darken the environment when menu is displayed
      this.ui.setAttribute("visible", "true");
      // this.activate(document.querySelector("#volume-button"));
      this.activate(document.querySelector("#first-menu"));

      // Turn on sliders
      this.activateSliders();

      this.activateSmallButton();
    }

    this.displayed = !this.displayed;
  },

  /*
    Displays the different meditation options
  */
  onMeditationButtonClicked: function () {
    // Deactivate first menu options
    let firstMenu = document.querySelector("#first-menu");
    this.deactivate(firstMenu);

    // Activate meditation options
    let medMenu = document.querySelector("#meditation-menu");
    this.activate(medMenu);
  },

  // Start the meditation script
  onGuidedMeditationClicked: function () {
    let sky = document.querySelector("#sky");
    // sound="on: model-loaded; src: #meditation-1; autoplay: true; loop: false; positional: false; volume: 1";
    let attr = sky.getAttribute("sound");
    attr.src = "#meditation-1";

    sky.setAttribute("sound", attr);
  },

  // Start the rain story script
  onStoryMeditationClicked: function () {
    let sky = document.querySelector("#sky");
    // sound="on: model-loaded; src: #rain; autoplay: true; loop: false; positional: false; volume: 1";
    let attr = sky.getAttribute("sound");
    attr.src = "#rain";

    sky.setAttribute("sound", attr);
  },

  // Start confidence booster script
  onConfidenceBoosterClicked: function () {
    let sky = document.querySelector("#sky");
    // sound="on: model-loaded; src: #confidence-meditation; autoplay: true; loop: false; positional: false; volume: 1";
    let attr = sky.getAttribute("sound");
    attr.src = "#confidence-meditation";

    sky.setAttribute("sound", attr);
  },

  /**
   * Start breathing exercise.
   */
  onBreathingExerciseButtonClicked: function () {
    // TODO
    // let sky = document.querySelector('#sky');
    // sound = 'on: model-loaded; src: #breath-exercise-meditation; autoplay: true; loop: false; positional: false; volume: 1';
    // sky.setAttribute('sound', sound);

    this.el.sceneEl.emit("breath-capture-start");
  },

  /*
    Displays the different yoga options
  */
  onYogaButtonClicked: function () {
    // Deactivate first menu options
    let firstMenu = document.querySelector("#first-menu");
    this.deactivate(firstMenu);

    // Activate meditation options
    let yogaMenu = document.querySelector("#yoga-menu");
    this.activate(yogaMenu);
  },

  onVolumeChanged: function (evt) {
    let sky = document.querySelector("#sky");
    let attr = sky.getAttribute("sound");
    console.log("Volume before:" + attr.volume);
    attr.volume = evt.detail.percent;
    console.log("Volume after:" + attr.volume);

    sky.setAttribute("sound", attr);
  },

  /*
    Turn on sliders
  */
  activateSliders: function () {
    this.ui.querySelectorAll(".slider").forEach((slider) => {
      slider.setAttribute("visible", true);
      slider
        .querySelector(".container")
        .setAttribute("class", "rightclickable container");
    });

  },

  /*
    Turn off sliders
  */
  deactivateSliders: function () {
    this.ui.querySelectorAll(".slider").forEach((slider) => {
      slider.setAttribute("visible", false);
      slider.querySelector(".container").setAttribute("class", "container");
    });
  },

  /*
    Turn on small-button
  */
 activateSmallButton: function () {
  this.ui.querySelectorAll(".small-button").forEach((button) => {
    button.setAttribute("visible", true);
    button
      .querySelector(".container")
      .setAttribute("class", "rightclickable container");
  });

},

/*
  Turn off small-button
*/
deactivateSmallButton: function () {
  this.ui.querySelectorAll(".small-button").forEach((button) => {
    button.setAttribute("visible", false);
    button.querySelector(".container").setAttribute("class", "container");
  });
},

  /*
    Activates menu options so they can be detected by raycasting
  */
  activate: function (element) {
    element.querySelectorAll(".option").forEach((option) => {
      option.setAttribute("class", "rightclickable option");
    });
    element.setAttribute("visible", "true");

    // set active menu
    this.currentMenu = element;
  },

  /*
    Deactivates menu options so they can't be detected by raycasting
  */
  deactivate: function (element) {
    element.setAttribute("visible", "false");
    element.querySelectorAll(".option").forEach((option) => {
      option.setAttribute("class", "option");
    });

    this.currentMenu = null;
  },

  remove: function () {
    this.removeEventListeners();
  },

  //   addEventListeners: function() {
  //     this.el.addEventListener('meditation-button-clicked', this.onMeditationButtonClicked);
  //     this.el.addEventListener('yoga-button-clicked', this.onYogaButtonClicked);
  //   },

  removeEventListeners: function () {
    let el = this.el;

    el.removeEventListener("abuttondown", this.onMenuActivate); // maybe change trigger button?
    el.sceneEl.removeEventListener(
      "meditation-button-clicked",
      this.onMeditationButtonClicked
    );
    el.sceneEl.removeEventListener(
      "yoga-button-clicked",
      this.onYogaButtonClicked
    );

    el.sceneEl.removeEventListener(
      "guided-meditation-button-clicked",
      this.onGuidedMeditationClicked
    );
    el.sceneEl.removeEventListener(
      "story-telling-button-clicked",
      this.onStoryMeditationClicked
    );
    el.sceneEl.removeEventListener(
      "confidence-booster-button-clicked",
      this.onConfidenceBoosterClicked
    );
    el.sceneEl.removeEventListener(
      "breathing-exercise-button-clicked",
      this.onBreathingExerciseButtonClicked
    );
    this.el.sceneEl.removeEventListener("volume-slider-changed", this.onVolumeChanged);
  },
});
