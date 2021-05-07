AFRAME.registerComponent("menu-controls", {
  init: function () {
    let el = this.el;

    this.currentMenu;

    this.currMeditationScript;
    this.meditationSong = document.querySelector("#sky").querySelector("#meditation");

    this.currAudioMenu;
    this.currSong = "background-music";

    // the x value of the audio options at the start and end
    // need to change if change the number of audios.
    this.topAudioOption = 0;
    this.bottomAudioOption = -0.9;
    this.prevAudioSlider = 0.5;

    // Grab template of menu to display
    this.displayed = false;
    this.ui = document
      .querySelector("#activity-menu-template")
      .content.cloneNode(true)
      .querySelector("#ui");
    document.querySelector("#camRig").appendChild(this.ui);

    // Event handlers
    this.onMenuActivate = this.onMenuActivate.bind(this);
    this.onToggleMenuVisibility = this.onToggleMenuVisibility.bind(this);
    this.onVolumeChanged = this.onVolumeChanged.bind(this);
    this.onMeditationButtonClicked = this.onMeditationButtonClicked.bind(this);
    this.onYogaButtonClicked = this.onYogaButtonClicked.bind(this);
    this.onAudioMenuChanged = this.onAudioMenuChanged.bind(this);
    this.audioChanged = this.audioChanged.bind(this);
    this.onAudioShift = this.onAudioShift.bind(this);

    this.onPlayButton = this.onPlayButton.bind(this);
    this.onPauseButton = this.onPauseButton.bind(this);
    this.onReplayButton = this.onReplayButton.bind(this);

    this.onGuidedMeditationClicked = this.onGuidedMeditationClicked.bind(this);
    this.onStoryMeditationClicked = this.onStoryMeditationClicked.bind(this);
    this.onConfidenceBoosterClicked = this.onConfidenceBoosterClicked.bind(
      this
    );
    this.onBreathingExerciseButtonClicked = this.onBreathingExerciseButtonClicked.bind(
      this
    );
    this.onCloudMeditationButtonClicked = this.onCloudMeditationButtonClicked.bind(
      this
    );
    this.onGuidedYogaButtonClicked = this.onGuidedYogaButtonClicked.bind(this);

    this.removeEventListeners = this.removeEventListeners.bind(this);

    // Button event listeners
    // TODO: change trigger button
    this.el.addEventListener("abuttondown", this.onMenuActivate);
    this.el.addEventListener("gripup", this.onToggleMenuVisibility);
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
    this.el.sceneEl.addEventListener(
      "cloud-meditation-button-clicked",
      this.onCloudMeditationButtonClicked
    );
    this.el.sceneEl.addEventListener(
      "guided-yoga-button-clicked",
      this.onGuidedYogaButtonClicked
    );
    this.el.sceneEl.addEventListener(
      "volume-slider-changed",
      this.onVolumeChanged
    );

    this.el.sceneEl.addEventListener(
      "audio-menu-button-changed",
      this.onAudioMenuChanged
    );

    this.el.sceneEl.addEventListener("audio-changed", this.audioChanged);

    this.el.sceneEl.addEventListener(
      "audio-menu-slider-changed",
      this.onAudioShift
    );

    this.el.sceneEl.addEventListener(
      "play-button-changed",
      this.onPlayButton
    );

    this.el.sceneEl.addEventListener(
      "pause-button-changed",
      this.onPauseButton
    );

    this.el.sceneEl.addEventListener(
      "replay-button-changed",
      this.onReplayButton
    );

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

      this.el.sceneEl.emit("menu-item-deselected");

      // Hide first menu or go back to first menu
      if (id === "first-menu") {
        this.deactivateSliders(this.currAudioMenu);
        this.ui.setAttribute("visible", "false");
        this.deactivateSmallButton(this.currAudioMenu);
        this.displayed = false;
        this.el.setAttribute("raycaster", "enabled", false);
        this.el.setAttribute("raycaster", "lineOpacity", 0);
      } else {
        this.activate(document.querySelector("#first-menu"));
        this.el.emit("endMeditation", { song: this.currSong });
        this.meditationSong.components.sound.stopSound();
        if (this.currMeditationScript != undefined) {
          this.currMeditationScript.components.sound.stopSound();
        }
        document.querySelector("#sky").components.sound.playSound();
      }
    } else {
      //this.el.emit("startMeditation");
      this.ui.setAttribute("visible", "true");
      this.activate(document.querySelector("#first-menu"));

      // Turn on sliders
      this.activateSliders();

      this.activateSmallButton(document.querySelector("#audio-menu"));
      this.displayed = true;
      this.el.setAttribute("raycaster", "enabled", true);
      this.el.setAttribute("raycaster", "lineOpacity", 1);
    }

    // this.displayed = !this.displayed;
  },

  /**
   * Toggles the visibility of the menu when in meditation mode (the user will still be
   * in meditation mode, just the actual menu won't be visible). Also hides the raycaster
   * when the menu is not visible.
   */
  onToggleMenuVisibility: function () {
    if (this.displayed) {
      let visible = this.ui.getAttribute("visible");
      this.ui.setAttribute("visible", !visible);
      this.el.setAttribute("raycaster", "enabled", !visible);
      this.el.setAttribute("raycaster", "lineOpacity", !visible ? 1 : 0);
    }
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

    let sky = document.querySelector("#sky");
    let attr = sky.getAttribute("sound");
    console.log("sky before:" + attr.src);

    this.el.emit("startMeditation");
    
    sky.components.sound.stopSound();
    attr = sky.getAttribute("sound");
    console.log("sky after meditation:" + attr.src);

    this.meditationSong.components.sound.playSound();
  },

  // Start the meditation script
  onGuidedMeditationClicked: function () {
    let sky = document.querySelector("#sky");
    // sound="on: model-loaded; src: #meditation-1; autoplay: true; loop: false; positional: false; volume: 1";
    //let attr = sky.getAttribute("sound");
    //attr.src = "#meditation-1";
    
    // stop background music
    this.meditationSong.components.sound.stopSound();
    // stop if another script is playing
    if (this.currMeditationScript != undefined) {
      this.currMeditationScript.components.sound.stopSound();
    }

    // play and set the new script
    let script = sky.querySelector("#meditation-1");
    script.components.sound.playSound();
    this.currMeditationScript = script;

    // sky.setAttribute("sound", attr);
  },

  // Start the rain story script
  onStoryMeditationClicked: function () {
    let sky = document.querySelector("#sky");
    // sound="on: model-loaded; src: #rain; autoplay: true; loop: false; positional: false; volume: 1";
    // let attr = sky.getAttribute("sound");
    // attr.src = "#rain";

    // stop background music
    this.meditationSong.components.sound.stopSound();
    // stop if another script is playing
    if (this.currMeditationScript != undefined) {
      this.currMeditationScript.components.sound.stopSound();
    }

    // play and set the new script
    let script = sky.querySelector("#rain");
    script.components.sound.playSound();
    this.currMeditationScript = script;

    // sky.setAttribute("sound", attr);
  },

  // Start confidence booster script
  onConfidenceBoosterClicked: function () {
    let sky = document.querySelector("#sky");
    // sound="on: model-loaded; src: #confidence-meditation; autoplay: true; loop: false; positional: false; volume: 1";
    // let attr = sky.getAttribute("sound");
    // attr.src = "#confidence-meditation";

    // stop background music
    this.meditationSong.components.sound.stopSound();
    // stop if another script is playing
    if (this.currMeditationScript != undefined) {
      this.currMeditationScript.components.sound.stopSound();
    }

    // play and set the new script
    let script = sky.querySelector("#confidence-meditation");
    script.components.sound.playSound();
    this.currMeditationScript = script;

    // sky.setAttribute("sound", attr);
  },

  /**
   * Start breathing exercise.
   */
  onBreathingExerciseButtonClicked: function () {
    // TODO
    let sky = document.querySelector("#sky");
    sound =
      "on: model-loaded; src: #Meditation-Aquatic; autoplay: true; loop: true; positional: false; volume: 0.1";
    sky.setAttribute("sound", sound);

    this.el.sceneEl.emit("breath-capture-start");
  },

  /*
    Starts cloud meditation
  */
  onCloudMeditationButtonClicked: function () {
    // TODO: maybe change scene a bit
    this.el.sceneEl.emit("cloud-meditation-start");
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

  onGuidedYogaButtonClicked: function () {
    this.el.sceneEl.emit("yogaStart");
  },

  onVolumeChanged: function (evt) {
    let sky = document.querySelector("#sky");
    let attr = sky.getAttribute("sound");
    //console.log("Volume before:" + attr.volume);
    attr.volume = evt.detail.percent;
    console.log("src:" + attr.src);
    //console.log("Volume after:" + attr.volume);

    sky.setAttribute("sound", attr);

    sky.querySelectorAll(".audio").forEach((audio) => {
      
      let sound = audio.getAttribute("sound");
      sound.volume = evt.detail.percent;
      console.log(sound.volume);
      
      audio.setAttribute("sound", sound);
      
    });
  },

  onPlayButton: function () {
    if (this.currMeditationScript != undefined) {
      this.currMeditationScript.components.sound.playSound();
    }

  },

  onPauseButton: function () {
    if (this.currMeditationScript != undefined) {
      this.currMeditationScript.components.sound.pauseSound();
    }

  },

  onReplayButton: function () {
    if (this.currMeditationScript != undefined) {
      this.currMeditationScript.components.sound.stopSound();
      this.currMeditationScript.components.sound.playSound();
    }

  },

  onAudioShift: function (evt) {
    let x = evt.detail.percent - this.prevAudioSlider;
    let m = this.bottomAudioOption / 0.5;

    let y = m * x;

    this.currAudioMenu.querySelectorAll(".small-button").forEach((button) => {
      let attr = button.getAttribute("position");
      attr.y = attr.y - y;
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

  audioChanged: function (evt) {
    let audio_id = evt.detail.audio_id;

    if (audio_id == "audio-exit") {
      this.deactivateSmallButton(this.currAudioMenu);
      this.activateSmallButton(document.querySelector("#audio-menu"));
    } else {
      let sky = document.querySelector("#sky");
      let attr = sky.getAttribute("sound");
      attr.src = "#" + audio_id;

      sky.setAttribute("sound", attr);
      this.currSong = audio_id;
    }
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

      if (button.getAttribute("id") == "audio-menu-button") {
        let attr = button
          .querySelector(".container")
          .querySelector(".songTitle")
          .getAttribute("text");
        attr.value = this.currSong;
        button
          .querySelector(".container")
          .querySelector(".songTitle")
          .setAttribute("text", attr);
      }
    });

    element.querySelectorAll(".audio-slider").forEach((button) => {
      button
        .querySelector(".container")
        .setAttribute("class", "rightclickable container");
      //console.log(button.getAttribute("id"));
    });

    element.querySelectorAll(".back-button").forEach((button) => {
      button
        .querySelector(".container")
        .setAttribute("class", "rightclickable container");
      //console.log(button.getAttribute("id"));
    });
    element.setAttribute("visible", true);

    this.currAudioMenu = element;
  },

  /*
  Turn off small-button
*/
  deactivateSmallButton: function (element) {
    element.querySelectorAll(".small-button").forEach((button) => {
      button.querySelector(".container").setAttribute("class", "container");
    });
    element.setAttribute("visible", false);

    this.currAudioMenu = null;
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
    el.removeEventListener("gripup", this.onToggleMenuVisibility);
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
    this.el.sceneEl.removeEventListener(
      "volume-slider-changed",
      this.onVolumeChanged
    );

    el.sceneEl.removeEventListener(
      "audio-menu-button-changed",
      this.onAudioMenuChanged
    );
    el.sceneEl.removeEventListener("audio-changed", this.audioChanged);
    el.sceneEl.removeEventListener(
      "audio-menu-slider-changed",
      this.onAudioShift
    );

    this.el.sceneEl.removeEventListener(
      "play-button-changed",
      this.onPlayButton
    );

    this.el.sceneEl.removeEventListener(
      "pause-button-changed",
      this.onPauseButton
    );

    this.el.sceneEl.removeEventListener(
      "replay-button-changed",
      this.onReplayButton
    );
  },
});
