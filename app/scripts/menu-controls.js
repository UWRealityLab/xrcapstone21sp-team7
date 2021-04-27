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
    this.onMeditationButtonClicked = this.onMeditationButtonClicked.bind(this);
    this.onYogaButtonClicked = this.onYogaButtonClicked.bind(this);

    this.onGuidedMeditationClicked = this.onGuidedMeditationClicked.bind(this);
    this.onStoryMeditationClicked = this.onStoryMeditationClicked.bind(this);
    this.onConfidenceBoosterClicked = this.onConfidenceBoosterClicked.bind(this);

    // Button event listeners
    this.el.addEventListener("abuttondown", this.onMenuActivate); // maybe change trigger button?
    this.el.sceneEl.addEventListener(
      "meditation-button-clicked",
      this.onMeditationButtonClicked
    );
    this.el.sceneEl.addEventListener(
      "yoga-button-clicked",
      this.onYogaButtonClicked
    );

    this.el.sceneEl.addEventListener(
      'guided-meditation-button-clicked', this.onGuidedMeditationClicked
    );
    this.el.sceneEl.addEventListener(
      'story-telling-button-clicked', this.onStoryMeditationClicked
    );
    this.el.sceneEl.addEventListener(
      'confidence-booster-button-clicked', this.onConfidenceBoosterClicked
    );

    // Helpers
    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
  },

  /*
    Displays or hides the menu
  */
  onMenuActivate: function () {
    if (this.displayed) {
      this.ui.setAttribute("visible", "false");
      this.deactivate(this.currentMenu);
    } else {
      this.el.emit("goMeditation", { returnColor: "meditation" }); // Darken the environment when menu is displayed
      this.ui.setAttribute("visible", "true");
      this.activate(document.querySelector("#first-menu"));
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
  onGuidedMeditationClicked: function() {
    let sky = document.querySelector("#sky");
    sound="on: model-loaded; src: #meditation-1; autoplay: true; loop: false; positional: false; volume: 1";
      
    sky.setAttribute('sound', sound);
  },

  // Start the rain story script
  onStoryMeditationClicked: function() {
    let sky = document.querySelector("#sky");
    sound="on: model-loaded; src: #rain; autoplay: true; loop: false; positional: false; volume: 1";
      
    sky.setAttribute('sound', sound);
  },

  // Start confidence booster script
  onConfidenceBoosterClicked: function() {
    let sky = document.querySelector("#sky");
    sound="on: model-loaded; src: #confidence-meditation; autoplay: true; loop: false; positional: false; volume: 1";
      
    sky.setAttribute('sound', sound);
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

  remove: function () {},

  //   addEventListeners: function() {
  //     this.el.addEventListener('meditation-button-clicked', this.onMeditationButtonClicked);
  //     this.el.addEventListener('yoga-button-clicked', this.onYogaButtonClicked);
  //   },

  //   removeEventListeners: function() {
  //     this.el.removeEventListener('meditation-button-clicked', this.onMeditationButtonClicked);
  //     this.el.removeEventListener('yoga-button-clicked', this.on)
  //   },
});