AFRAME.registerComponent("yoga-mode", {
  init: function() {
    this.paused = false;

    // Time for current pose to animate to null before playing the animation from null to another pose.
    this.animationDelay = 4000;

    this.yogaStart = this.yogaStart.bind(this);
    this.stopYogaMode = this.stopYogaMode.bind(this);
    this.imageLoop = this.imageLoop.bind(this);
    this.onImageLoopTimeout = this.onImageLoopTimeout.bind(this);
    this.countdown = this.countdown.bind(this);
    this.yogaBack = this.yogaBack.bind(this);
    this.yogaPause = this.yogaPause.bind(this);
    this.yogaNext = this.yogaNext.bind(this);
    this.yogaReplay = this.yogaReplay.bind(this);

    this.el.sceneEl.addEventListener('menu-item-deselected', this.stopYogaMode);
    this.el.sceneEl.addEventListener('yogaStart', this.yogaStart);
    this.el.sceneEl.addEventListener('yoga-control-back-triggered', this.yogaBack);
    this.el.sceneEl.addEventListener('yoga-control-pause-triggered', this.yogaPause);
    this.el.sceneEl.addEventListener('yoga-control-next-triggered', this.yogaNext);
    this.el.sceneEl.addEventListener('replay-yoga', this.yogaReplay);

    /* for debugging
    document.querySelector("#yoga-instructor").setAttribute("visible", "true");
    let detail = {
      script: "quick-yoga"
    };
    this.el.sceneEl.emit("yogaStart", detail);
    */
  },

  remove: function() {
    this.el.sceneEl.removeEventListener('menu-item-deselected', this.stopYogaMode);
    this.el.sceneEl.removeEventListener("yogaStart", this.yogaStart);
    this.el.sceneEl.removeEventListener('yoga-control-back-triggered', this.yogaBack);
    this.el.sceneEl.removeEventListener('yoga-control-pause-triggered', this.yogaPause);
    this.el.sceneEl.removeEventListener('yoga-control-next-triggered', this.yogaNext);
    this.el.sceneEl.removeEventListener('replay-yoga', this.yogaReplay);
  },

  yogaStart: function(evt) {
    this.inYogaMode = true;
    this.loopCount = 0;

    let timerEl = document.querySelector("#yoga-timer");
    this.timerId = setInterval(this.countdown, 1000);

    // Select which animation and time array gets used
    this.currScript = evt.detail.script;
    switch (this.currScript) {
      case "morning-yoga":
        this.animArray = MORNING_YOGA_ANIM_ARRAY;
        this.timeArray = MORNING_YOGA_TIME_ARRAY;
        this.yogaScript = "morning";
        break;
      case "quick-yoga":
        this.animArray = QUICK_YOGA_ANIM_ARRAY;
        this.timeArray = QUICK_YOGA_TIME_ARRAY;
        this.yogaScript = "quick";
        break;
      case "plank-yoga":
        this.animArray = PLANK_YOGA_ANIM_ARRAY;
        this.timeArray = PLANK_YOGA_TIME_ARRAY;
        this.yogaScript = "plank";
        break;
    }

    this.timer = this.timeArray[this.loopCount];

    // Initialization for first loop
    this.animateTo(this.loopCount, null);
    timerEl.setAttribute("visible", "true");

    // Enable sound
    let y = this.el.querySelector("#yoga-script");
    let attr = y.getAttribute("sound");
    attr.src = "#" + this.yogaScript + "-yoga-audio-" + this.loopCount;
    y.setAttribute("sound", attr);
    y.components.sound.playSound();

    document.querySelector("#yoga-instructor")
            .setAttribute("sound", "src: #As-the-rain; autoplay: true; loop: true; volume: 0.05");

    // Show buttons
    document.querySelectorAll('[id^="yoga-control"]').forEach((control) => control.setAttribute("visible", "true"));

    this.imageLoop();
  },

  stopYogaMode: function() {
    if (this.inYogaMode) {
      this.inYogaMode = false;
      this.el.sceneEl.emit('yogaStop');
      this.el.querySelector("#yoga-script").components.sound.stopSound();
      document.querySelector("#yoga-instructor").removeAttribute('sound');
      document.querySelector("#yoga-instructor").removeAttribute('src');
      document.querySelector("#yoga-timer").setAttribute('visible', 'false');

      // Hide buttons
      document.querySelectorAll('[id^="yoga-control"]').forEach((control) => control.setAttribute("visible", "false"));

      if (this.timerId) {
        clearInterval(this.timerId);
      }
      if (this.imageLoopTimeout) {
        clearTimeout(this.imageLoopTimeout);
      }
      if (this.animationTimeout) {
        clearTimeout(this.animationTimeout);
      }
    }
  },

  yogaReplay: function() {
    if (this.inYogaMode) {
      this.stopYogaMode();
      let detail = {
        script: this.currScript
      };
      this.yogaStart(detail);
    }
  },

  // Recursively goes through images and timers until done
  imageLoop: function() {
    // Add earlier timeout to transition animation back to neutral, so it transitions to next pose as next audio clip plays
    this.animationTimeout = setTimeout(this.animateTo(this.loopCount, this.loopCount + 1),
                                       this.timeArray[this.loopCount] - (this.animationDelay / 2));
    this.imageLoopTimeout = setTimeout(this.onImageLoopTimeout, this.timeArray[this.loopCount]);
  },

  onImageLoopTimeout: function() {
    this.loopCount++;

    if (this.loopCount < this.timeArray.length) {
      // Set yoga sound
      let y = this.el.querySelector("#yoga-script");
      let attr = y.getAttribute("sound"); 
      attr.src = "#" + this.yogaScript + "-yoga-audio-" + this.loopCount;
      y.setAttribute("sound", attr);
      y.components.sound.playSound();

      this.timer = this.timeArray[this.loopCount];
      this.imageLoop();
    } else { // Clear when done looping
      this.stopYogaMode();
    }
  },
  
  // Decrements timer every second
  countdown: function() {
    let timerEl = document.querySelector("#yoga-timer");
    timerEl.setAttribute("text", "value", this.timer / 1000);
    this.timer -= 1000;
  },

  // Helper function for animating to null before next pose
  animateTo: function(currLoopCount, toLoopCount) {
    // Animate back to null before next
    document.querySelector("#yoga-instructor").components['animate-yoga-poses'].animatePose(null, this.animArray[currLoopCount]);
    console.log("Animating " + this.animArray[currLoopCount] + " to null");

    clearTimeout(this.animationTimeout);
    this.animationTimeout = setTimeout(() => {
      // Animate to next pose (give 3 seconds for prev pose to animate to null)
      document.querySelector("#yoga-instructor").components['animate-yoga-poses'].animatePose(this.animArray[toLoopCount], null);
      console.log("Animating null to " + this.animArray[toLoopCount]);
    }, this.animationDelay);
  },

  yogaBack: function() {
    if (this.loopCount > 0) {
      // Animation a bit glitchy with going back
      this.animateTo(this.loopCount, --this.loopCount);

      // Set yoga sound
      let y = this.el.querySelector("#yoga-script");
      let attr = y.getAttribute("sound");
      attr.src = "#" + this.yogaScript + "-yoga-audio-" + this.loopCount;
      y.setAttribute("sound", attr);
      y.components.sound.playSound();

      // TODO: Still some slight bugginess with going back while paused
      this.timer = this.timeArray[this.loopCount];
      clearInterval(this.imageLoopTimeout);
      if (this.paused) {
        this.yogaPause();
      } else {
        this.imageLoop();
      }
    }
  },

  yogaPause: function() {
    if (this.paused) {
      // Resume timeouts with saved timer, and change icon to pause
      setTimeout(this.onImageLoopTimeout, this.timer);
      setTimeout(this.animateTo(this.loopCount, this.loopCount + 1), 
                                Math.max(this.timer - (this.animationDelay / 2), 0));
      this.timerId = setInterval(this.countdown, 1000);

      this.el.querySelector("#yoga-script").components.sound.playSound();
      document.getElementById("yoga-control-pause-img")
              .setAttribute("src", "#yoga-pause");
    } else {
      // Clear current intervals and sound, and change icon to play
      clearInterval(this.imageLoopTimeout);
      clearInterval(this.animationTimeout);
      clearInterval(this.timerId);

      this.el.querySelector("#yoga-script").components.sound.pauseSound();
      document.getElementById("yoga-control-pause-img")
              .setAttribute("src", "#yoga-play");
    }
    this.paused = !this.paused;
  },

  yogaNext: function() {
    if (this.loopCount < this.timeArray.length - 1) {
      this.animateTo(this.loopCount, ++this.loopCount);

      // Set yoga sound
      let y = this.el.querySelector("#yoga-script");
      let attr = y.getAttribute("sound");
      attr.src = "#" + this.yogaScript + "-yoga-audio-" + this.loopCount;
      y.setAttribute("sound", attr);
      y.components.sound.playSound();

      this.timer = this.timeArray[this.loopCount];
      clearInterval(this.imageLoopTimeout);
      if (this.paused) {
        this.yogaPause();
      } else {
        this.imageLoop();
      }
    }
  }
});