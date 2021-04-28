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
    this.onBreathingExerciseButtonClicked = this.onBreathingExerciseButtonClicked.bind(this);

    this.removeEventListeners = this.removeEventListeners.bind(this);

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
    this.el.sceneEl.addEventListener(
      'breathing-exercise-button-clicked', this.onBreathingExerciseButtonClicked
    );

    this.el.sceneEl.addEventListener(
      'up-volume-clicked', this.upVolume
    );

    this.el.sceneEl.addEventListener(
      'down-volume-clicked', this.downVolume
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
      this.deactivate(document.querySelector("#volume-button"));
    } else {
      this.el.emit("goMeditation", { returnColor: "meditation" }); // Darken the environment when menu is displayed
      this.ui.setAttribute("visible", "true");
      this.activate(document.querySelector("#volume-button"));
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
    // sound="on: model-loaded; src: #meditation-1; autoplay: true; loop: false; positional: false; volume: 1";
    let attr = sky.getAttribute('sound');
    attr.src = "#meditation-1";
      
    sky.setAttribute('sound', attr);
  },

  // Start the rain story script
  onStoryMeditationClicked: function() {
    let sky = document.querySelector("#sky");
    // sound="on: model-loaded; src: #rain; autoplay: true; loop: false; positional: false; volume: 1";
    let attr = sky.getAttribute('sound');
    attr.src = "#rain";  

    sky.setAttribute('sound', attr);
  },

  // Start confidence booster script
  onConfidenceBoosterClicked: function() {
    let sky = document.querySelector("#sky");
    // sound="on: model-loaded; src: #confidence-meditation; autoplay: true; loop: false; positional: false; volume: 1";
    let attr = sky.getAttribute('sound');
    attr.src = "#confidence-meditation";  

    sky.setAttribute('sound', attr);
  },

  /**
   * Start breathing exercise.
   */
  onBreathingExerciseButtonClicked: function() {
    // TODO
    // let sky = document.querySelector('#sky');
    // sound = 'on: model-loaded; src: #breath-exercise-meditation; autoplay: true; loop: false; positional: false; volume: 1';
    // sky.setAttribute('sound', sound);

    this.el.sceneEl.emit('breath-capture-start');
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

  upVolume: function () {

    let sky = document.querySelector('#sky');
    let attr = sky.getAttribute('sound');
    console.log("Volume before:" + attr.volume);
    attr.volume = attr.volume + 0.05;
    console.log("Volume after:" + attr.volume);
    
    sky.setAttribute('sound', attr);
        
  },

  downVolume: function () {

    let sky = document.querySelector('#sky');

    let attr = sky.getAttribute('sound');
    console.log("Volume before:" + attr.volume);

    attr.volume = attr.volume - 0.05;

    if (attr.volume < 0) {
      attr.volume = 0;
    }
    console.log("Volume after:" + attr.volume);
    
    sky.setAttribute('sound', attr);
        
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

  removeEventListeners: function() {
    let el = this.el;

    el.removeEventListener('abuttondown', this.onMenuActivate); // maybe change trigger button?
    el.sceneEl.removeEventListener(
      'meditation-button-clicked',
      this.onMeditationButtonClicked
    );
    el.sceneEl.removeEventListener(
      "yoga-button-clicked",
      this.onYogaButtonClicked
    );

    el.sceneEl.removeEventListener(
      'guided-meditation-button-clicked', this.onGuidedMeditationClicked
    );
    el.sceneEl.removeEventListener(
      'story-telling-button-clicked', this.onStoryMeditationClicked
    );
    el.sceneEl.removeEventListener(
      'confidence-booster-button-clicked', this.onConfidenceBoosterClicked
    );
    el.sceneEl.removeEventListener(
      'breathing-exercise-button-clicked', this.onBreathingExerciseButtonClicked
    );
  },
});
