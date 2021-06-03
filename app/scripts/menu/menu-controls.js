const CLOUDS_SCENE = "Head in the Clouds";
const HOT_SPRINGS_SCENE = "Hot Spring Serenity";

const SCENE_EVENTS = {
  "Head in the Clouds": "cloud-meditation",
  "Hot Spring Serenity": "mountain-meditation",
};

AFRAME.registerComponent("menu-controls", {
  init: function () {
    let el = this.el;

    this.currentMenu;

    // will it cause audio overlapping problems if currMeditationScript is initialized here?
    this.currMeditationScript;
    this.breathingSong = document.querySelector("#sky").querySelector("#breathing-meditation");
    // for now we need to initialize each script here, at least for meditation, so that we can trigger the background music to start playing again.

    this.breathingOn = false;
    this.yogaOn = false;

    this.currScene = null;
    this.currSong = "Default Zendin";
    this.currScript = "";
    this.currVolume = "0.1";
    this.currLight = "2.5";
    this.scriptPlaying = false;

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

    /* Bind Functions */
    this.onMenuActivate = this.onMenuActivate.bind(this);
    this.onMenuRecenter = this.onMenuRecenter.bind(this);
    // this.onToggleMenuVisibility = this.onToggleMenuVisibility.bind(this);
    this.onVolumeChanged = this.onVolumeChanged.bind(this);

    this.onScenesButtonClicked = this.onScenesButtonClicked.bind(this);
    this.onMeditationButtonClicked = this.onMeditationButtonClicked.bind(this);
    this.onYogaButtonClicked = this.onYogaButtonClicked.bind(this);
    this.onAudioMenuClicked = this.onAudioMenuClicked.bind(this);
    this.onLightModeClicked = this.onLightModeClicked.bind(this);

    this.audioChanged = this.audioChanged.bind(this);
    this.onAudioShift = this.onAudioShift.bind(this);
    this.onDayLight = this.onDayLight.bind(this);
    this.onNightLight = this.onNightLight.bind(this);
    this.onBackgroundMusic = this.onBackgroundMusic.bind(this);

    this.onHomeButton = this.onHomeButton.bind(this);
    this.onPlayPauseButton = this.onPlayPauseButton.bind(this);
    this.onStopButton = this.onStopButton.bind(this);
    this.onReplayButton = this.onReplayButton.bind(this);

    this.onGuidedMeditationClicked = this.onGuidedMeditationClicked.bind(this);
    this.onStoryMeditationClicked = this.onStoryMeditationClicked.bind(this);
    this.onConfidenceBoosterClicked = this.onConfidenceBoosterClicked.bind(this);
    this.onBreathingExerciseButtonClicked = this.onBreathingExerciseButtonClicked.bind(this);

    this.onCloudMeditationButtonClicked = this.onCloudMeditationButtonClicked.bind(this);
    this.onMountainMeditationButtonClicked = this.onMountainMeditationButtonClicked.bind(this);
    this.onMorningYogaButtonClicked = this.onMorningYogaButtonClicked.bind(this);
    this.onQuickYogaButtonClicked = this.onQuickYogaButtonClicked.bind(this);
    this.onPlankYogaButtonClicked = this.onPlankYogaButtonClicked.bind(this);
    this.onYogaEnded = this.onYogaEnded.bind(this);

    // Breathing Audio
    this.onBreathAudio1 = this.onBreathAudio1.bind(this);
    this.onBreathAudio2 = this.onBreathAudio2.bind(this);
    this.onBreathAudio3 = this.onBreathAudio3.bind(this);

    this.removeEventListeners = this.removeEventListeners.bind(this);

    /* Event Listeners */
    el.addEventListener("abuttondown", this.onMenuActivate);
    el.sceneEl.addEventListener('bbuttondown', this.onMenuRecenter);
    // el.addEventListener("gripup", this.onToggleMenuVisibility);
    el.sceneEl.addEventListener("scenes-button-clicked", this.onScenesButtonClicked);
    el.sceneEl.addEventListener("meditation-button-clicked", this.onMeditationButtonClicked);
    el.sceneEl.addEventListener("yoga-button-clicked", this.onYogaButtonClicked);
    el.sceneEl.addEventListener("lighting-button-clicked", this.onLightModeClicked);
    el.sceneEl.addEventListener("guided-meditation-button-clicked", this.onGuidedMeditationClicked);
    el.sceneEl.addEventListener("story-telling-button-clicked", this.onStoryMeditationClicked);
    el.sceneEl.addEventListener("confidence-booster-button-clicked", this.onConfidenceBoosterClicked);
    el.sceneEl.addEventListener("breathing-exercise-button-clicked", this.onBreathingExerciseButtonClicked);
    el.sceneEl.addEventListener("cloud-meditation-button-clicked", this.onCloudMeditationButtonClicked);
    el.sceneEl.addEventListener("mountain-meditation-button-clicked", this.onMountainMeditationButtonClicked);
    el.sceneEl.addEventListener("morning-yoga-button-clicked", this.onMorningYogaButtonClicked);
    el.sceneEl.addEventListener("quick-yoga-button-clicked", this.onQuickYogaButtonClicked);
    el.sceneEl.addEventListener("plank-yoga-button-clicked", this.onPlankYogaButtonClicked);
    el.sceneEl.addEventListener("yoga-ended", this.onYogaEnded);
    el.sceneEl.addEventListener("volume-slider-changed", this.onVolumeChanged);
    el.sceneEl.addEventListener("audio-button-clicked", this.onAudioMenuClicked);
    el.sceneEl.addEventListener("audio-changed", this.audioChanged);
    el.sceneEl.addEventListener("audio-menu-slider-changed", this.onAudioShift);
    el.sceneEl.addEventListener("home-button-changed", this.onHomeButton);
    el.sceneEl.addEventListener("play-pause-button-changed", this.onPlayPauseButton);
    el.sceneEl.addEventListener("stop-button-changed", this.onStopButton);
    el.sceneEl.addEventListener("replay-button-changed", this.onReplayButton);
    el.sceneEl.addEventListener("replay-button-changed", this.onReplayButton);
    el.sceneEl.addEventListener("Day-clicked", this.onDayLight);
    el.sceneEl.addEventListener("Night-clicked", this.onNightLight);
    
    // this is to know when the meditation scripts end so that we can start playing backround music again.
    document.querySelector("#sky").querySelector("#meditation-1").addEventListener("sound-ended", this.onBackgroundMusic);
    document.querySelector("#sky").querySelector("#rain").addEventListener("sound-ended", this.onBackgroundMusic);
    document.querySelector("#sky").querySelector("#confidence-meditation").addEventListener("sound-ended", this.onBackgroundMusic);
    document.querySelector("#sky").querySelector("#breathing-meditation-3").addEventListener("sound-ended", this.onBackgroundMusic);

    // this is to konw when the yoga routine ends so that we can start playing background music again
    document.querySelector("#sky").addEventListener("yogaEnd", this.onBackgroundMusic);

    // changing audio of breathing exercise
    el.sceneEl.addEventListener("breath-capture-start", this.onBreathAudio1);
    el.sceneEl.addEventListener("change-breathing-exercise-2", this.onBreathAudio2);
    el.sceneEl.addEventListener("breath-capture-end", this.onBreathAudio3);

    // Helpers
    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.activateSliders = this.activateSliders.bind(this);
    this.deactivateSliders = this.deactivateSliders.bind(this);
    this.activateMediaKeys = this.activateMediaKeys.bind(this);
    this.deactivateMediaKeys = this.deactivateMediaKeys.bind(this);
    this.changeCurrentMenu = this.changeCurrentMenu.bind(this);
    this.changeDisplayMenu = this.changeDisplayMenu.bind(this);
    this.startScript = this.startScript.bind(this);
  },

  /** 
   * Displays the menu, or hides if already displayed
  */
  onMenuActivate: function () {
    if (this.displayed) {
      const id = this.currentMenu.id;

      // Exit menu or go to previous menu
      if (id === "first-menu") {
        this.ui.setAttribute("visible", "false");
        this.displayed = false;
        this.el.setAttribute("raycaster", "lineOpacity", 0);
        this.el.setAttribute("raycaster", "enabled", false);
        this.deactivateMediaKeys();
      } else {
        this.changeCurrentMenu("#first-menu");
      }
    } else {
      this.ui.setAttribute("visible", "true");
      this.changeCurrentMenu("#first-menu");
      this.activateMediaKeys();

      this.displayed = true;
      this.el.setAttribute("raycaster", "enabled", true);
      this.el.setAttribute("raycaster", "lineOpacity", 1);

      this.changeDisplayMenu();
    }
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
      this.el.setAttribute("raycaster", "lineOpacity", !visible ? 1 : 0);
    }
  },

  /**
   * Displays the scenes menu
   */
  onScenesButtonClicked: function() {
    this.changeCurrentMenu("#scenes-menu");
  },

  /**
   * Displays the meditation menu
   */
  onMeditationButtonClicked: function () {
    this.changeCurrentMenu("#meditation-menu");
  },

  /**
   * Starts the guided meditation script
   */
  onGuidedMeditationClicked: function () {
    this.startScript("#meditation-1", "Guided Meditation", false, false);
  },

  /**
   * Starst the rain story meditation script
   */
  onStoryMeditationClicked: function () {
    this.startScript("#rain", "Story Meditation", false, false);
  },

  /**
   * Starts the confidence booster meditation script
   */
  onConfidenceBoosterClicked: function () {
    this.startScript("#confidence-meditation", "Confidence Booster Meditation", false, false);
  },

  /**
   * Start breathing exercise.
   */
  onBreathingExerciseButtonClicked: function () {
    // Play the breathing exercise background song
    this.startScript("", "Breathing Exercise", true, false);
  },

  onBreathAudio1: function () {
    if (this.currMeditationScript) {
      this.currMeditationScript.components.sound.stopSound();
    }

    let sky = document.querySelector("#sky");
    let script = sky.querySelector("#breathing-meditation-1");
    script.components.sound.playSound();
    this.currMeditationScript = script;
  },

  onBreathAudio2: function () {
    if (this.currMeditationScript) {
      this.currMeditationScript.components.sound.stopSound();
    }

    let sky = document.querySelector("#sky");
    let script = sky.querySelector("#breathing-meditation-2");
    script.components.sound.playSound();
    this.currMeditationScript = script;
  },

  onBreathAudio3: function () {
    if (this.currScript) {
      this.currMeditationScript.components.sound.stopSound();
    }

    //if (this.breathSong) {
      this.breathingSong.components.sound.stopSound();
    //}

    let sky = document.querySelector("#sky");
    let script = sky.querySelector("#breathing-meditation-3");
    script.components.sound.playSound();
    this.currMeditationScript = script;
    //this.scriptPlaying = false;
    //this.breathingOn = false;
  },

  /**
   * Starts cloud meditation scene
   */
  onCloudMeditationButtonClicked: function () {
    this.el.sceneEl.emit("cloud-meditation-start");
    
    this.currScene = CLOUDS_SCENE;
    this.changeDisplayMenu();
    
    // Move user so they can see the clouds
    const camRig = document.querySelector("#camRig");
    if (camRig) {
      camRig.setAttribute("position", "-15 0 -12");
      camRig.setAttribute("rotation", "0 90 0");
    }
  },

  /**
   * Starts mountain/hot springs meditation scene
   */
  onMountainMeditationButtonClicked: function() {
    this.el.sceneEl.emit("mountain-meditation-start");

    this.currScene = HOT_SPRINGS_SCENE;
    this.changeDisplayMenu();

    // Move user so they can see the gates
    const camRig = document.querySelector("#camRig");
    if (camRig) {
      camRig.setAttribute("position", "31.75 1.5 0");
      camRig.setAttribute("rotation", "0 -90 0");
    }
  },

  /**
   * Displays the different yoga options
  */
  onYogaButtonClicked: function () {
    this.changeCurrentMenu("#yoga-menu");
  },

  onYogaEnded: function () {
    this.yogaOn = false;
  },

  onMorningYogaButtonClicked: function () {
    this.startScript("morning-yoga", "Morning Yoga", false, true);
  },

  onQuickYogaButtonClicked: function () {
    this.startScript("quick-yoga", "Quick Yoga", false, true);
  },

  onPlankYogaButtonClicked: function () {
    this.startScript("plank-yoga", "Planking Yoga", false, true);
  },

  onVolumeChanged: function (evt) {
    let sky = document.querySelector("#sky");
    let attr = sky.getAttribute("sound");
    //this.log("Volume before:" + attr.volume);
    attr.volume = evt.detail.percent;
    this.log("src:" + attr.src);
    //this.log("Volume after:" + attr.volume);

    sky.setAttribute("sound", attr);

    sky.querySelectorAll(".audio")?.forEach((audio) => {
      
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

  /**
   * Starts the script while pausing any background music
   * 
   * @param {*} audioID selector for script audio to start playing 
   * @param {*} scriptName name of script playing, used to display
   * @param {*} startBreathing whether or not starting breathing script
   */
  startScript: function(audioID, scriptName, startBreathing, startYoga) {
    const sky = document.querySelector("#sky");
    sky.components.sound.stopSound();
    // stop a script that is currently playing
    if (this.currScript || this.currMeditationScript) {
      this.currMeditationScript.components.sound.stopSound();
    }

    // if breathing or yoga are on, just turn it all off before starting new activity
    if (this.breathingOn) {
      this.breathingOn = false;
      this.el.emit("breath-capture-end");
      this.currMeditationScript.components.sound.stopSound();
      this.breathingSong.components.sound.stopSound();
    } else if (this.yogaOn) {
      this.yogaOn = false;
      this.el.sceneEl.emit("yogaEnd");
    }

    // Start breathing song if needed
    if (startBreathing) {
      this.el.sceneEl.emit("breath-capture-start");
      if (!this.breathingOn) {  // if breathing exercise is already on then no need for breathingSong to play again
        this.breathingSong.components.sound.playSound();
      }
      this.breathingOn = true;

    } else if (startYoga) {
      this.yogaOn = true;
      this.scriptPlaying = true;
      let detail = {
        script: audioID
      };
      //this.el.sceneEl.emit("yogaEnd");
      this.el.sceneEl.emit("yogaStart", detail);

      // set yoga-script entity to the current script
      this.currMeditationScript = document.querySelector("#sky").querySelector("#yoga-script");
      
      // stop the background music
      document.querySelector("#sky").components.sound.stopSound();
    
    } else {
      const script = sky.querySelector(audioID);
      script.components.sound.playSound();
      this.currMeditationScript = script;
    }

    this.scriptPlaying = true;

    this.currScript = scriptName;
    this.changeDisplayMenu();

    // change play button to pause
    document.querySelector("#play-pause-button").setAttribute("material", "src", "#pause-icon");
  },

  /**
   * Ends the current scene if there is one, brings the user
   * back to the center of the garden
   */
  onHomeButton: function() {
    if (this.currScene) {
      const eventEnd = SCENE_EVENTS[this.currScene];
      this.el.sceneEl.emit(`${eventEnd}-end`);
    }

    // Bring user back to the home building
    const camRig = document.querySelector("#camRig");
    camRig.setAttribute("position", "0 0 0");
    camRig.setAttribute('rotation', '0 -90 0');
  },

  onPlayPauseButton: function () {
    // Only do something if we have an active script
    // Currently do not have functionality for play/pause for yoga. For right now, if yoga routine is on, just return.
    if (!this.currScript || this.yogaOn) {
      return;
    }
    const button = document.querySelector("#play-pause-button");

    /* For yoga
    if (this.yogaOn) {
      this.el.emit('yoga-control-pause-triggered');
    }
    */
    
    // Pause script
    if (this.scriptPlaying) {
      this.currMeditationScript.components.sound.pauseSound();
      if (this.breathingOn) {
        let detail = {
          state: "play"
        };
        this.el.emit("pause-breathing", detail);
        this.breathingSong.components.sound.pauseSound();
      }
      this.scriptPlaying = false;

      // Change to pause icon
      button.setAttribute("material", "src", "#play-icon");

      document.querySelector("#sky").components.sound.playSound();
    } else {
      // Play script
      document.querySelector("#sky").components.sound.stopSound();
      this.currMeditationScript.components.sound.playSound();
      if (this.breathingOn) {
        let detail = {
          state: "pause"
        };
        this.el.emit("pause-breathing", detail);
        this.breathingSong.components.sound.playSound();
      }
      // Change to play icon
      this.scriptPlaying = true;
      button.setAttribute("material", "src", "#pause-icon");
    }
  },

  onStopButton: function () {
    // Stop the current script
    if (this.currScript) {
      this.currMeditationScript.components.sound.stopSound();
      if (this.breathingOn) {
        this.el.emit("breath-capture-end");
        this.breathingOn = false;
      } else if (this.yogaOn) {
        this.el.emit("yogaEnd");
        this.yogaOn = false;
        this.currMeditationScript = null;
        this.onBackgroundMusic();
      } else {
        this.onBackgroundMusic();
        this.currMeditationScript = null;
      }
      
      //this.onBackgroundMusic();

      // change pause button to play
      document.querySelector("#play-pause-button").setAttribute("material", "src", "#play-icon");

      // TODO: will this break anything?? -- yes with yoga and breathing exercise audio 3, they overlap if you start yoga while audio3 is going on
      
    }
  },

  onReplayButton: function () {
    // Currently do not have functionality for replay for yoga. For right now, if yoga routine is on, just return.
    if (this.currScript && !this.yogaOn) {
      document.querySelector("#sky").components.sound.stopSound();
      this.currMeditationScript.components.sound.stopSound();
      this.currMeditationScript.components.sound.playSound();

      if (this.breathingOn) {
        let detail = {
          state: "replay"
        }
        this.el.emit("pause-breathing", detail);
      }
      // change play button to pause
      document.querySelector("#play-pause-button").setAttribute("material", "src", "#pause-icon");
      // do same for yoga
      this.el.emit("replay-yoga");
    }

  },

  onAudioShift: function (evt) {
    let x = evt.detail.percent - this.prevAudioSlider;
    let m = this.bottomAudioOption / 0.9;

    let y = m * x;

    this.currentMenu.querySelectorAll(".option")?.forEach((option) => {
      let attr = option.getAttribute("position");
      attr.x = attr.x - y;
      option.setAttribute("position", attr);
    });
    this.prevAudioSlider = evt.detail.percent;
  },

  onAudioMenuClicked: function () {
    this.changeCurrentMenu("#audio-options");
  },

  onLightModeClicked: function () {
    this.changeCurrentMenu("#light-menu");
  },

  audioChanged: function (evt) {
    let audio_id = evt.detail.audio_id;
    let sky = document.querySelector("#sky");

    this.log("audio id: " + audio_id);

    if (this.scriptPlaying) {
      sky.setAttribute("sound", 'autoplay', false);
    }
    sky.setAttribute("sound", 'src', `#${audio_id}`);
    this.currSong = evt.detail.audio_name;

    this.log('all sound', document.querySelectorAll('[sound]'));

    this.changeDisplayMenu();
  },

  onDayLight: function () {
    this.currLight = 2.5;
    this.el.emit("endMeditation", { song: this.currSong, light: this.currLight });
  },

  onNightLight: function () {
    this.currLight = 0.2;
    this.el.emit("startMeditation", { light: this.currLight });
  },

  /**
   * Turn on sliders to be detected by raycasting
  */
  activateSliders: function (element) {
    element.querySelectorAll(".slider")?.forEach((slider) => {
      slider.setAttribute("visible", true);
      slider
        .querySelector(".container")
        ?.setAttribute("class", "rightclickable container");
    });
  },

  /**
   * Turn off sliders, no longer raycastable
  */
  deactivateSliders: function (element) {
    element.querySelectorAll(".slider")?.forEach((slider) => {
      slider.setAttribute("visible", false);
      slider.querySelector(".container").setAttribute("class", "container");
    });
  },

  /**
   * 
   * @param {*} element submenu element to activate
   */
  activate: function (element) {
    if (!element) return;
    element.querySelectorAll(".option")?.forEach((option) => {
      option.setAttribute("class", "rightclickable option");
    });
    element.setAttribute("visible", "true");

    // Sliders
    this.activateSliders(element);
  },

  /**
   * 
   * @param {*} element submenu element to deactivate
   */
  deactivate: function (element) {
    if (!element) return;
    element.setAttribute("visible", "false");
    element.querySelectorAll(".option")?.forEach((option) => {
      option.setAttribute("class", "option");
    });

    // Sliders
    this.deactivateSliders(element);
  },

  /**
   * Turns on media keys
   */
  activateMediaKeys: function() {
    const mediakeys = document.querySelector("#function-buttons");

    // Turn on volume slider and playback buttons
    this.activate(mediakeys);
  },

  /**
   * Turns off media keys
   */
  deactivateMediaKeys: function() {
    const mediaKeys = document.querySelector("#function-buttons");

    // Turn off volume slider and playback buttons
    this.deactivate(mediaKeys);
  },

  /**
   * 
   * @param {*} next selector of menu to change to
   *  
   */
  changeCurrentMenu: function(next) {
    if (this.currentMenu) {
      this.deactivate(this.currentMenu);
    }

    // Activate meditation options
    const nextMenu = document.querySelector(next);
    this.activate(nextMenu);
    this.currentMenu = nextMenu;
  },

  changeDisplayMenu: function () {
    // TODO: add scene info
    let display = document.querySelector("#display-box");
    let audioInfo = display.querySelector("#audio-info");
    let activityInfo = display.querySelector("#activity-info");

    if (!audioInfo || !activityInfo) {
      return;
    }
    // let title_3 = display.querySelector(".title-3");

    let songText = audioInfo.getAttribute("text");
    songText.value = this.currSong;
    audioInfo.setAttribute("text", songText);

    let activityText = activityInfo.getAttribute("text");
    activityText.value = this.currScript;
    activityInfo.setAttribute("text", activityText);

    // let text_3 = title_3.getAttribute("text");
    // text_3.value = this.currVolume;
    // title_3.setAttribute("text", text_3);
  },

  onBackgroundMusic: function () {
    if (this.breathingOn) {
      this.breathingOn = false;
    }
    this.scriptPlaying = false;
    this.currScript = "";
    this.currMeditationScript = null;
    this.changeDisplayMenu();
    document.querySelector("#sky").components.sound.playSound();
  },

  remove: function () {
    this.removeEventListeners();
  },

  removeEventListeners: function () {
    let el = this.el;

    el.removeEventListener("abuttondown", this.onMenuActivate); // maybe change trigger button?
    el.removeEventListener('bbuttondown', this.onMenuRecenter);
    // el.removeEventListener("gripup", this.onToggleMenuVisibility);
    el.sceneEl.removeEventListener("meditation-button-clicked", this.onMeditationButtonClicked);
    el.sceneEl.removeEventListener("yoga-button-clicked", this.onYogaButtonClicked);
    el.sceneEl.removeEventListener("lighting-button-clicked", this.onLightModeClicked);
    el.sceneEl.removeEventListener("guided-meditation-button-clicked", this.onGuidedMeditationClicked);
    el.sceneEl.removeEventListener("story-telling-button-clicked", this.onStoryMeditationClicked);
    el.sceneEl.removeEventListener("confidence-booster-button-clicked", this.onConfidenceBoosterClicked);
    el.sceneEl.removeEventListener("breathing-exercise-button-clicked", this.onBreathingExerciseButtonClicked);
    el.sceneEl.removeEventListener("morning-yoga-button-clicked", this.onMorningYogaButtonClicked);
    el.sceneEl.removeEventListener("quick-yoga-button-clicked", this.onQuickYogaButtonClicked);
    el.sceneEl.removeEventListener("plank-yoga-button-clicked", this.onPlankYogaButtonClicked);
    el.sceneEl.removeEventListener("volume-slider-changed",this.onVolumeChanged);
    el.sceneEl.removeEventListener("audio-button-clicked", this.onAudioMenuClicked);
    el.sceneEl.removeEventListener("audio-changed", this.audioChanged);
    el.sceneEl.removeEventListener("audio-menu-slider-changed", this.onAudioShift);
    el.sceneEl.removeEventListener("home-button-changed", this.onHomeButton);
    el.sceneEl.removeEventListener("play-pause-button-changed", this.onPlayPauseButton);
    el.sceneEl.removeEventListener("stop-button-changed", this.onStopButton);
    el.sceneEl.removeEventListener("replay-button-changed", this.onReplayButton);
    el.sceneEl.removeEventListener("breath-capture-start", this.onBreathAudio1);
    el.sceneEl.removeEventListener("change-breathing-exercise-2", this.onBreathAudio2);
    el.sceneEl.removeEventListener("breath-capture-end", this.onBreathAudio3);
    el.sceneEl.removeEventListener("Day-clicked", this.onDayLight);
    el.sceneEl.removeEventListener("Night-clicked", this.onNightLight);
    el.sceneEl.removeEventListener("yoga-ended", this.onYogaEnded);

    document.querySelector("#sky").querySelector("#meditation-1").removeEventListener("sound-ended", this.onBackgroundMusic);
    document.querySelector("#sky").querySelector("#rain").removeEventListener("sound-ended", this.onBackgroundMusic);
    document.querySelector("#sky").querySelector("#confidence-meditation").removeEventListener("sound-ended", this.onBackgroundMusic);
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
