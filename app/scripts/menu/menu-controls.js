AFRAME.registerComponent("menu-controls", {
  init: function () {
    let el = this.el;

    this.currentMenu;

    this.currMeditationScript;
    this.meditationSong = document.querySelector("#sky").querySelector("#meditation");
    this.breathingSong = document.querySelector("#sky").querySelector("#breathing-meditation");

    this.breathingOn = false;
    this.yogaOn = false;

    this.currAudioMenu;
    this.currSong = "background-music";
    this.currScript = "";
    this.currVolume = "0.1";

    // the x value of the audio options at the start and end
    // need to change if change the number of audios.
    this.topAudioOption = -0.45;
    this.bottomAudioOption = 1.8;
    this.prevAudioSlider = 0.1;

    // An entity with the same x/z position as the user's head such that when recentering the ui the ui is rotated around the user's head
    this.uiHousing = document.createElement('a-entity');
    document.querySelector('#camRig').appendChild(this.uiHousing);

    // Grab template of menu to display
    this.displayed = false;
    this.ui = document
      .querySelector("#activity-menu-template")
      .content.cloneNode(true)
      .querySelector("#ui");
    this.uiHousing.appendChild(this.ui);

    // Add breath capture template to the uiHousing entity
    let breathMeditationTemplate = document
      .querySelector('#breath-meditation-template')
      .content.cloneNode(true);
    let meditationRing = breathMeditationTemplate.querySelector('#meditation-ring');
    let automatedMeditationRing = breathMeditationTemplate.querySelector('#meditation-automated-ring');
    let meditationMenu = breathMeditationTemplate.querySelector('#breath-meditation-menu');
    this.uiHousing.appendChild(meditationRing);
    this.uiHousing.appendChild(automatedMeditationRing);
    this.uiHousing.appendChild(meditationMenu);

    // Grab env menu to display
    this.envMenu = document.querySelector("#env-settings");

    // Event handlers
    this.onMenuActivate = this.onMenuActivate.bind(this);
    this.onMenuRecenter = this.onMenuRecenter.bind(this);
    this.onToggleMenuVisibility = this.onToggleMenuVisibility.bind(this);
    this.onVolumeChanged = this.onVolumeChanged.bind(this);
    // this.onEnvSliderChanged = this.onEnvSliderChanged.bind(this);
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

    // Breathing Audio
    this.onBreathAudio1 = this.onBreathAudio1.bind(this);
    this.onBreathAudio2 = this.onBreathAudio2.bind(this);
    this.onBreathAudio3 = this.onBreathAudio3.bind(this);

    this.removeEventListeners = this.removeEventListeners.bind(this);

    // Button event listeners
    // TODO: change trigger button
    this.el.addEventListener("abuttondown", this.onMenuActivate);
    this.el.sceneEl.addEventListener('bbuttondown', this.onMenuRecenter);
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

    this.el.sceneEl.addEventListener(
      "replay-button-changed",
      this.onReplayButton
    );

    // changing audio of breathing exercise
    this.el.sceneEl.addEventListener(
      "breath-capture-start",
      this.onBreathAudio1
    );
    this.el.sceneEl.addEventListener(
      "change-breathing-exercise-2",
      this.onBreathAudio2
    );
    this.el.sceneEl.addEventListener(
      "breath-capture-end",
      this.onBreathAudio3
    );

    // env menu listeners
    this.el.sceneEl.addEventListener(
      "env-menu-slider-changed",
      this.onEnvSliderChanged
    );

    // Helpers
    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.activateSliders = this.activateSliders.bind(this);
    this.deactivateSliders = this.deactivateSliders.bind(this);

    this.activateSmallButton = this.activateSmallButton.bind(this);
    this.deactivateSmallButton = this.deactivateSmallButton.bind(this);

    this.changeDisplayMenu = this.changeDisplayMenu.bind(this);
  },

  /*
    Displays or hides the menu
  */
  onMenuActivate: function () {
    if (this.displayed) {
      // TODO: change this, still want if user selected a meditation mode
      let id;
      if (this.currentMenu == null && this.currAudioMenu != null) {
        // then it must be audio menu
        id = this.currAudioMenu.id;
        this.deactivateSmallButton(this.currAudioMenu);
        //this.activateSmallButton(document.querySelector("#audio-menu"));
      } else {
        id = this.currentMenu.id;
        this.deactivate(this.currentMenu);
      }
      //const id = this.currentMenu.id;
      //this.deactivate(this.currentMenu);

      this.el.sceneEl.emit("menu-item-deselected");

      // Hide first menu or go back to first menu
      if (id === "first-menu") {
        this.deactivateSliders(this.currAudioMenu);
        this.ui.setAttribute("visible", "false");
        this.deactivateSmallButton(this.currAudioMenu);
        this.displayed = false;
        // this.el.setAttribute("raycaster", "enabled", false);
        this.el.setAttribute("raycaster", "lineOpacity", 0);
      } else {
        this.activate(document.querySelector("#first-menu"));
        this.el.emit("endMeditation", { song: this.currSong });
        this.meditationSong.components.sound.stopSound();
        this.breathingSong.components.sound.stopSound();
        if (this.currMeditationScript != undefined && !this.breathingOn) {
          this.currMeditationScript.components.sound.stopSound();
          //this.breathingOn = false;
        }
        
        // TODO JANE: something's happening here, find bug so no need for this if else statement
        if (id != "audio-options") { // && id != "yoga-menu") {
          document.querySelector("#sky").components.sound.playSound();
        }

        // play pause replay buttons
        this.deactivateSmallButton(document.querySelector("#function-buttons"));

        // activate audio option
        this.activateSmallButton(document.querySelector("#audio-menu"));

        this.currMeditationScript = null;

        // deactive volume slider
        //this.deactivateSliders();

        this.currScript = "";
        this.changeDisplayMenu();
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

      this.changeDisplayMenu();
    }

    // this.displayed = !this.displayed;
  },

  /**
   * re-centers the menu in the user's center field of vision
   */
  onMenuRecenter: function() {
    if (this.displayed) {
      const camera = document.getElementById('cam');

      const p = camera.object3D.position;
      let positionAnimation = {
        property: 'position',
        to: `${p.x} 0 ${p.z}`
      };

      const yRotation = 180 * camera.object3D.rotation.y / Math.PI;
      let rotationAnimation = {
        property: 'rotation',
        to: `0 ${yRotation} 0`
      };

      this.uiHousing.setAttribute('animation__rotation', rotationAnimation);
      this.uiHousing.setAttribute('animation__position', positionAnimation);
    }
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
      // this.el.setAttribute("raycaster", "enabled", !visible);
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

    // play pause replay buttons
    this.activateSmallButton(document.querySelector("#function-buttons"));

    // deactivate audio option
    this.deactivateSmallButton(document.querySelector("#audio-menu"));

    // activate volume
    //this.activateSliders();

    let sky = document.querySelector("#sky");
    let attr = sky.getAttribute("sound");
    this.log("sky before:" + attr.src);

    this.el.emit("startMeditation");
    
    sky.components.sound.stopSound();
    attr = sky.getAttribute("sound");
    this.log("sky after meditation:" + attr.src);

    this.meditationSong.components.sound.playSound();
  },

  // Start the meditation script
  onGuidedMeditationClicked: function () {
    let sky = document.querySelector("#sky");

    if (this.breathingOn) {
      this.el.emit("breath-capture-end");
      this.breathingSong.components.sound.stopSound();
    }
    
    // stop background music
    this.meditationSong.components.sound.stopSound();
    sky.components.sound.stopSound();
    // stop if another script is playing
    if (this.currMeditationScript != undefined) {
      this.currMeditationScript.components.sound.stopSound();
    }

    // play and set the new script
    let script = sky.querySelector("#meditation-1");
    script.components.sound.playSound();
    this.currMeditationScript = script;

    this.breathingOn = false;
    this.yogaOn = false;

    this.currScript = "Guided Meditation";
    this.changeDisplayMenu();
  },

  // Start the rain story script
  onStoryMeditationClicked: function () {
    let sky = document.querySelector("#sky");

    if (this.breathingOn) {
      this.el.emit("breath-capture-end");
      this.breathingSong.components.sound.stopSound();
    }

    // stop background music
    this.meditationSong.components.sound.stopSound();
    sky.components.sound.stopSound();
    // stop if another script is playing
    if (this.currMeditationScript != undefined) {
      this.currMeditationScript.components.sound.stopSound();
    }

    // play and set the new script
    let script = sky.querySelector("#rain");
    script.components.sound.playSound();
    this.currMeditationScript = script;

    this.breathingOn = false;
    this.yogaOn = false;

    this.currScript = "Story Meditation";
    this.changeDisplayMenu();

  },

  // Start confidence booster script
  onConfidenceBoosterClicked: function () {
    let sky = document.querySelector("#sky");

    if (this.breathingOn) {
      this.el.emit("breath-capture-end");
      this.breathingSong.components.sound.stopSound();
    }

    // stop background music
    this.meditationSong.components.sound.stopSound();
    sky.components.sound.stopSound();
    // stop if another script is playing
    if (this.currMeditationScript != undefined) {
      this.currMeditationScript.components.sound.stopSound();
    }

    // play and set the new script
    let script = sky.querySelector("#confidence-meditation");
    script.components.sound.playSound();
    this.currMeditationScript = script;

    this.breathingOn = false;
    this.yogaOn = false;

    this.currScript = "Confidence Booster Meditation";
    this.changeDisplayMenu();
  },

  /**
   * Start breathing exercise.
   */
  onBreathingExerciseButtonClicked: function () {
    this.breathingOn = true;

    let sky = document.querySelector("#sky");
    //sound =
      //"on: model-loaded; src: #Meditation-Aquatic; autoplay: true; loop: true; positional: false; volume: 0.1";
    //sky.setAttribute("sound", sound);
    //let attr = sky.getAttribute("sound");
    //attr.src = "#Imaginary-waterfalls";
    //sky.setAttribute("sound", attr);

    // Stop the meditation background song
    this.meditationSong.components.sound.stopSound();
    // stop if another script is playing
    if (this.currMeditationScript != undefined) {
      this.currMeditationScript.components.sound.stopSound();
    }

    // Play the breathing exercise background song
    this.breathingSong.components.sound.playSound();

    this.el.sceneEl.emit("breath-capture-start");

    this.yogaOn = false;

    this.currScript = "Breathing Exercise";
    this.changeDisplayMenu();
  },

  onBreathAudio1: function () {
    if (this.currMeditationScript != undefined) {
      this.currMeditationScript.components.sound.stopSound();
    }

    let sky = document.querySelector("#sky");
    let script = sky.querySelector("#breathing-meditation-1");
    script.components.sound.playSound();
    this.currMeditationScript = script;
  },

  onBreathAudio2: function () {
    if (this.currMeditationScript != undefined) {
      this.currMeditationScript.components.sound.stopSound();
    }

    let sky = document.querySelector("#sky");
    let script = sky.querySelector("#breathing-meditation-2");
    script.components.sound.playSound();
    this.currMeditationScript = script;
  },

  onBreathAudio3: function () {
    if (this.currMeditationScript != undefined) {
      this.currMeditationScript.components.sound.stopSound();
    }

    let sky = document.querySelector("#sky");
    let script = sky.querySelector("#breathing-meditation-3");
    script.components.sound.playSound();
    this.currMeditationScript = script;
  },

  /*
    Starts cloud meditation
  */
  onCloudMeditationButtonClicked: function () {
    // TODO: maybe change scene a bit
    this.el.sceneEl.emit("cloud-meditation-start");

    this.currScript = "Cloud Meditation";
    this.changeDisplayMenu();
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

    // deactivate audio option
    this.deactivateSmallButton(document.querySelector("#audio-menu"));

    // activate volume
    //this.activateSliders();
  },

  onGuidedYogaButtonClicked: function () {
    this.yogaOn = true;
    this.el.sceneEl.emit("yogaStart");

    // set yoga-script entity to the current script
    this.currMeditationScript = document.querySelector("#sky").querySelector("#yoga-script");
    
    // stop the background music
    document.querySelector("#sky").components.sound.stopSound();

    this.currScript = "Guided Yoga";
    this.changeDisplayMenu();
  },

  onVolumeChanged: function (evt) {
    let sky = document.querySelector("#sky");
    let attr = sky.getAttribute("sound");
    //this.log("Volume before:" + attr.volume);
    attr.volume = evt.detail.percent;
    this.log("src:" + attr.src);
    //this.log("Volume after:" + attr.volume);

    sky.setAttribute("sound", attr);

    sky.querySelectorAll(".audio").forEach((audio) => {
      
      let sound = audio.getAttribute("sound");
      sound.volume = evt.detail.percent;
      this.log(sound.volume);
      
      audio.setAttribute("sound", sound);
      
    });

    let x = evt.detail.percent;
    x = x * 100;
    x = Math.round(x);
    x = x / 100;
    this.currVolume = x;
    this.changeDisplayMenu();

  },

  /*
  onEnvSliderChanged: function (evt) {
    let sky = document.querySelector("#sky");

    let light = {
      property: 'light.intensity',
      to: evt.detail.percent,
      dur: 2000,
      easing: 'linear'
    };
    sky.setAttribute('animation', light);
  },
  */

  onPlayButton: function () {
    if (this.currMeditationScript != undefined) {
      this.currMeditationScript.components.sound.playSound();
      if (this.breathingOn) {
        this.el.emit("play-breathing");
      }
      // do same for yoga
      //this.el.emit("play-yoga");
    }

  },

  onPauseButton: function () {
    if (this.currMeditationScript != undefined) {
      this.currMeditationScript.components.sound.pauseSound();
      if (this.breathingOn) {
        this.el.emit("pause-breathing");
      }
      // do same for yoga
      //this.el.emit("pause-yoga");
    }

  },

  onReplayButton: function () {
    if (this.currMeditationScript != undefined) {
      this.currMeditationScript.components.sound.stopSound();
      this.currMeditationScript.components.sound.playSound();

      if (this.breathingOn) {
        this.el.emit("replay-breathing");
      }
      // do same for yoga
      //this.el.emit("replay-yoga");
    }

  },

  onAudioShift: function (evt) {
    let x = evt.detail.percent - this.prevAudioSlider;
    let m = this.bottomAudioOption / 0.9;

    let y = m * x;

    this.currAudioMenu.querySelectorAll(".small-button").forEach((button) => {
      let attr = button.getAttribute("position");
      attr.x = attr.x - y;
      button.setAttribute("position", attr);
    });
    this.prevAudioSlider = evt.detail.percent;
  },

  onAudioMenuChanged: function () {
    let firstMenu = document.querySelector("#audio-menu");
    this.deactivateSmallButton(firstMenu);

    // also deactivate the firstMenu
    this.deactivate(document.querySelector("#first-menu"));

    // activate the volume bar
    this.activateSliders();

    // Activate meditation options
    let audioSubMenu = document.querySelector("#audio-options");
    this.activateSmallButton(audioSubMenu);
  },

  audioChanged: function (evt) {
    let audio_id = evt.detail.audio_id;
    let sky = document.querySelector("#sky");
    let attr = sky.getAttribute("sound");
    attr.src = "#" + audio_id;
    console.log("audio id: " + audio_id);

    sky.setAttribute("sound", attr);
    this.currSong = evt.detail.audio_name;

    this.changeDisplayMenu();
    
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
    });

    element.querySelectorAll(".audio-slider").forEach((button) => {
      button
        .querySelector(".container")
        .setAttribute("class", "rightclickable container");
      //this.log(button.getAttribute("id"));
    });

    element.querySelectorAll(".back-button").forEach((button) => {
      button
        .querySelector(".container")
        .setAttribute("class", "rightclickable container");
      //this.log(button.getAttribute("id"));
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

  changeDisplayMenu: function () {
    let display = document.querySelector("#display-box");
    let title_1 = display.querySelector(".title-1");
    let title_2 = display.querySelector(".title-2");
    let title_3 = display.querySelector(".title-3");

    let text_1 = title_1.getAttribute("text");
    text_1.value = this.currSong;
    title_1.setAttribute("text", text_1);

    let text_2 = title_2.getAttribute("text");
    text_2.value = this.currScript;
    title_2.setAttribute("text", text_2);

    let text_3 = title_3.getAttribute("text");
    text_3.value = this.currVolume;
    title_3.setAttribute("text", text_3);
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
    el.removeEventListener('bbuttondown', this.onMenuRecenter);
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

    this.el.sceneEl.removeEventListener(
      "breath-capture-start",
      this.onBreathAudio1
    );
    this.el.sceneEl.removeEventListener(
      "change-breathing-exercise-2",
      this.onBreathAudio2
    );
    this.el.sceneEl.removeEventListener(
      "breath-capture-end",
      this.onBreathAudio3
    );
  },

  log(string, ...etc) {
    if (!Q.LOGGING.MenuControls) return;

    console.groupCollapsed(
      `[UserView-${this.userViewId}${this.isMyUser ? " (YOU)" : ""}] ${string}`,
      ...etc
    );
    console.trace(); // hidden in collapsed group
    console.groupEnd();
  }
});
