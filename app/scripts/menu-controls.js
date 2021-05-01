AFRAME.registerComponent("menu-controls", {
  init: function () {
    let el = this.el;

    this.currentMenu;

    this.currAudio;

    // the x value of the audio options at the start and end
    // need to change if change the number of audios.
    this.startAudioOption = -1.35;
    this.endAudioOption = 1.35;
    this.prevAudioSlider = 0.5

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
    this.onAudioMenuChanged = this.onAudioMenuChanged.bind(this);
    this.audioChanged = this.audioChanged.bind(this);
    this.onAudioShift = this.onAudioShift.bind(this);

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

    this.el.sceneEl.addEventListener("audio-menu-button-changed", this.onAudioMenuChanged);

    this.el.sceneEl.addEventListener("audio-changed", this.audioChanged);

    this.el.sceneEl.addEventListener("audio-menu-slider-changed", this.onAudioShift);

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
      // TODO: change this, still want if user selected a meditation mode
      const id = this.currentMenu.id;
      this.deactivate(this.currentMenu);
      
      // Hide first menu or go back to first menu
      if (id === "first-menu") {
        this.el.emit("endMeditation");
        this.deactivateSliders(this.currAudio);
        this.ui.setAttribute("visible", "false");
        this.deactivateSmallButton(this.currAudio);
        this.displayed = false;
      } else {
        this.activate(document.querySelector("#first-menu"));
      }
    } else {
      this.el.emit("startMeditation");
      this.ui.setAttribute("visible", "true");
      this.activate(document.querySelector("#first-menu"));

      // Turn on sliders
      this.activateSliders();

      this.activateSmallButton(document.querySelector("#audio-menu"));
      this.displayed = true;
    }

    // this.displayed = !this.displayed;
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
    let sky = document.querySelector('#sky');
    sound = 'on: model-loaded; src: #Meditation-Aquatic; autoplay: true; loop: true; positional: false; volume: 0.1';
    sky.setAttribute('sound', sound);

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
    //console.log("Volume before:" + attr.volume);
    attr.volume = evt.detail.percent;
    //console.log("Volume after:" + attr.volume);

    sky.setAttribute("sound", attr);
  },

  onAudioShift: function (evt) {
    let x = evt.detail.percent - this.prevAudioSlider;
    let m = this.endAudioOption / 0.5;

    let y = m * x;

    this.currAudio.querySelectorAll(".small-button").forEach((button) => {
      let attr = button.getAttribute("position");
      attr.x = attr.x - y;
      button.setAttribute("position", attr);
    });
    this.prevAudioSlider = evt.detail.percent;
  },

  onAudioMenuChanged: function () {
    let firstMenu = document.querySelector("#audio-menu");
    this.deactivateSmallButton(firstMenu);

    // Activate meditation options
    let audioSubMenu = document.querySelector("#audio-options");
    this.activateSmallButton(audioSubMenu);
  },

  audioChanged: function(evt) {
    let audio_id = evt.detail.audio_id;

    let sky = document.querySelector("#sky");
    let attr = sky.getAttribute("sound");
    attr.src = "#" + audio_id;

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
 activateSmallButton: function (element) {
  element.querySelectorAll(".small-button").forEach((button) => {
    button
      .querySelector(".container")
      .setAttribute("class", "rightclickable container");
      //console.log(button.getAttribute("id"));
  });

  element.querySelectorAll(".audio-slider").forEach((button) => {
    button
      .querySelector(".container")
      .setAttribute("class", "rightclickable container");
      //console.log(button.getAttribute("id"));
  });
  element.setAttribute("visible", true);

  this.currAudio = element;

},

/*
  Turn off small-button
*/
deactivateSmallButton: function (element) {
  element.querySelectorAll(".small-button").forEach((button) => {
    button.querySelector(".container").setAttribute("class", "container");
  });
  element.setAttribute("visible", false);

  this.currAudio = null;
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

    el.sceneEl.removeEventListener("audio-menu-button-changed", this.onAudioMenuChanged);
    el.sceneEl.removeEventListener("audio-changed", this.audioChanged);
    el.sceneEl.removeEventListener("audio-menu-slider-changed", this.onAudioShift);
  },
});
