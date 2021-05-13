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
*/

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

/* This code will go through the linked images in the image array, and
 * switch to the next one after the amount of time in the corresponding
 * array.
 */
AFRAME.registerComponent("yoga-mode", {
  init: function() {
    this.yogaStart = this.yogaStart.bind(this);
    this.stopYogaMode = this.stopYogaMode.bind(this);
    this.imageLoop = this.imageLoop.bind(this);
    this.onImageLoopTimeout = this.onImageLoopTimeout.bind(this);
    this.countdown = this.countdown.bind(this);
    this.el.sceneEl.addEventListener('menu-item-deselected', this.stopYogaMode);
    this.el.sceneEl.addEventListener('yogaStart', this.yogaStart);
  },

  remove: function() {
    this.el.sceneEl.removeEventListener('menu-item-deselected', this.stopYogaMode);
    this.el.sceneEl.removeEventListener("yogaStart", this.yogaStart);
  },

  yogaStart: function() {
    console.log('starting yoga');
    this.inYogaMode = true;
    let imagesEl = document.querySelector("#yoga-images");
    let timerEl = document.querySelector("#timer");

    this.timerId = setInterval(this.countdown, 1000);

    this.loopCount = 0;
    this.timer = TIME_ARRAY[this.loopCount];

    // Initialization for first loop
    // imagesEl.setAttribute("visible", "true");
    imagesEl.setAttribute("src", "#yoga-short-" + this.loopCount);
    timerEl.setAttribute("visible", "true");
    this.el.setAttribute("sound", "src: #yoga-audio-short-0; autoplay: true; loop: false; positional: false; volume: 0.25");
    this.el.components.sound.playSound();
    document.querySelector("#yoga-images").setAttribute("sound", "src: #As-the-rain; autoplay: true; loop: true; volume: 0.05");

    // console.log(this.timer);

    this.imageLoop();
  },

  stopYogaMode: function() {
    if (this.inYogaMode) {
      this.inYogaMode = false;
      this.el.components.sound.stopSound();
      document.querySelector("#yoga-images").removeAttribute('sound');
      document.querySelector("#yoga-images").setAttribute('src', '#yoga-short-0');
      document.querySelector('#timer').setAttribute("visible", "false");
      document.querySelector("#timer").setAttribute('visible', 'false');
      if (this.timerId) {
        clearInterval(this.timerId);
      }
      if (this.imageLoopTimeout) {
        clearTimeout(this.imageLoopTimeout);
      }
    }
  },

  // Recursively goes through images and timers until done
  imageLoop : function() {
    this.imageLoopTimeout = setTimeout(this.onImageLoopTimeout, TIME_ARRAY[this.loopCount]);
  },

  onImageLoopTimeout: function() {
    let timerEl = document.querySelector("#timer");
    let imagesEl = document.querySelector("#yoga-images");

    this.loopCount++;

    if (this.loopCount < TIME_ARRAY.length) {
      imagesEl.setAttribute("src", "#yoga-short-" + this.loopCount);
      this.el.setAttribute("sound", "src: #yoga-audio-short-" + this.loopCount + "; autoplay: true; loop: false; positional: false; volume: 0.25");
      this.timer = TIME_ARRAY[this.loopCount];
      this.imageLoop();
    } else { // Clear when done looping
      // imagesEl.setAttribute("visible", "false");
      timerEl.setAttribute("visible", "false");
      clearInterval(this.timerId);
    }
  },
  
  // Decrements timer every second
  countdown: function() {
    let timerEl = document.querySelector("#timer");
    this.timer -= 1000;
    timerEl.setAttribute("text", "value", this.timer / 1000);
  }
});