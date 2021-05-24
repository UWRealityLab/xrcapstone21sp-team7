/* Time array for long yoga routine
// Time for each image until moving onto next (in milliseconds)
const TIME_ARRAY = [10000,  // welcome screen (0)
                    15000,  // headset adjustment (1)
                    5000,   // breathing exercise (2)
                    10000,
                    10000,
                    5000,
                    5000,
                    15000,  // transition to all fours (7)
                    10000,  // begin cat cow (8)
                    10000,
                    25000,
                    8000,   // transition to high plank (11)
                    8000,   // transition to low cobra (12)
                    25000,
                    10000  // transition to child's pose (14)
                   ];


// Time array for short yoga routine - 3 min 40 sec
const TIME_ARRAY = [10000,  // welcome screen (0)
                    15000,  // headset adjustment (1)
                    5000,   // breathing exercise (2)
                    10000,
                    10000,
                    5000,
                    5000,
                    45000,  // transition to child's pose (7)
                    30000,  // transition to downward dog (8)
                    30000,  // transition to cobra (9)
                    45000,  // transition to baby back end (10)
                    10000   // end (11)
                    ];
                    */

// Arrays for short yoga routine - 4 min 35 sec
const SHORT_ANIM_ARRAY = [
  null,
  null,
  'mountain',
  'tree',
  'chair',
  'lunge',
  'lunge2',
  'warrior2',
  'warrior3',
  'plank',
  'sidePlank',
  null
];

// const SHORT_TIME_ARRAY = [
const TIME_ARRAY = [
  15000,  // welcome screen
  15000,  // headset adjustment
  30000,  // mountain pose
  30000,  // tree pose
  30000,  // chair pose
  15000,  // lunge 1
  15000,  // lunge 2
  30000,  // warrior 2
  30000,  // warrior 1 (even though its called 3)
  30000,  // plank
  30000,  // side plank
  10000   // end
];

/* This code will go through the linked images in the image array, and
 * switch to the next one after the amount of time in the corresponding
 * array.
 * TODO: fix issue with back/next buttons causing yoga model to flash
 */
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

    this.el.sceneEl.addEventListener('menu-item-deselected', this.stopYogaMode);
    this.el.sceneEl.addEventListener('yogaStart', this.yogaStart);
    this.el.sceneEl.addEventListener('yoga-control-back-triggered', this.yogaBack);
    this.el.sceneEl.addEventListener('yoga-control-pause-triggered', this.yogaPause);
    this.el.sceneEl.addEventListener('yoga-control-next-triggered', this.yogaNext);
  },

  remove: function() {
    this.el.sceneEl.removeEventListener('menu-item-deselected', this.stopYogaMode);
    this.el.sceneEl.removeEventListener("yogaStart", this.yogaStart);
    this.el.sceneEl.removeEventListener('yoga-control-back-triggered', this.yogaBack);
    this.el.sceneEl.removeEventListener('yoga-control-pause-triggered', this.yogaPause);
    this.el.sceneEl.removeEventListener('yoga-control-next-triggered', this.yogaNext);
  },

  yogaStart: function() {
    console.log('starting yoga');
    this.inYogaMode = true;
    let timerEl = document.querySelector("#yoga-timer");
    let instructorEl = document.querySelector("#yoga-instructor").components['animate-yoga-poses'];

    this.timerId = setInterval(this.countdown, 1000);

    this.loopCount = 0;
    this.timer = TIME_ARRAY[this.loopCount];

    // Initialization for first loop
    instructorEl.animatePose(SHORT_ANIM_ARRAY[this.loopCount], null);
    timerEl.setAttribute("visible", "true");

    // Enable sound
    let y = this.el.querySelector("#yoga-script");
    let attr = y.getAttribute("sound");
    attr.src = "#yoga-audio-short-0";
    y.setAttribute("sound", attr);
    y.components.sound.playSound();

    document.querySelector("#yoga-instructor")
            .setAttribute("sound", "src: #As-the-rain; autoplay: true; loop: true; volume: 0.05");

    // Show buttons
    document.querySelectorAll('[id^="yoga-control"]').forEach((control) => control.setAttribute("visible", "true"));

    // console.log(this.timer);

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

  // Recursively goes through images and timers until done
  imageLoop : function() {
    // Add earlier timeout to transition animation back to neutral, so it transitions to next pose as next audio clip plays
    this.animationTimeout = setTimeout(this.animateTo(this.loopCount, this.loopCount + 1),
                                       TIME_ARRAY[this.loopCount] - (this.animationDelay / 2));
    this.imageLoopTimeout = setTimeout(this.onImageLoopTimeout, TIME_ARRAY[this.loopCount]);
  },

  onImageLoopTimeout: function() {
    this.loopCount++;

    if (this.loopCount < TIME_ARRAY.length) {
      // Set yoga sound
      let y = this.el.querySelector("#yoga-script");
      let attr = y.getAttribute("sound");
      attr.src = "#yoga-audio-short-" + this.loopCount;
      y.setAttribute("sound", attr);
      y.components.sound.playSound();

      this.timer = TIME_ARRAY[this.loopCount];
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
    document.querySelector("#yoga-instructor").components['animate-yoga-poses'].animatePose(null, SHORT_ANIM_ARRAY[currLoopCount]);
    console.log("Animating " + SHORT_ANIM_ARRAY[currLoopCount] + " to null");

    clearTimeout(this.animationTimeout);
    this.animationTimeout = setTimeout(() => {
      // Animate to next pose (give 3 seconds for prev pose to animate to null)
      document.querySelector("#yoga-instructor").components['animate-yoga-poses'].animatePose(SHORT_ANIM_ARRAY[toLoopCount], null);
      console.log("Animating null to " + SHORT_ANIM_ARRAY[toLoopCount]);
    }, this.animationDelay);
  },

  yogaBack: function() {
    if (this.loopCount > 0) {
      // Animation a bit glitchy with going back
      this.animateTo(this.loopCount, --this.loopCount);

      // Set yoga sound
      let y = this.el.querySelector("#yoga-script");
      let attr = y.getAttribute("sound");
      attr.src = "#yoga-audio-short-" + this.loopCount;
      y.setAttribute("sound", attr);
      y.components.sound.playSound();

      // TODO: Still some slight bugginess with going back while paused
      this.timer = TIME_ARRAY[this.loopCount];
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
    if (this.loopCount < TIME_ARRAY.length - 1) {
      this.animateTo(this.loopCount, ++this.loopCount);

      // Set yoga sound
      let y = this.el.querySelector("#yoga-script");
      let attr = y.getAttribute("sound");
      attr.src = "#yoga-audio-short-" + this.loopCount;
      y.setAttribute("sound", attr);
      y.components.sound.playSound();

      this.timer = TIME_ARRAY[this.loopCount];
      clearInterval(this.imageLoopTimeout);
      if (this.paused) {
        this.yogaPause();
      } else {
        this.imageLoop();
      }
    }
  }
});