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
 * TODO: draw up yoga images
 *       plan out future yoga functionality
 *       idea: skip to next slide button for yoga?
 *       play audio script so user doesn't have to look up at instructions
 *       integrate yoga into menu
 *       choose between yoga routines
 */
AFRAME.registerComponent("yoga-mode", {
  init: function() {
    let el = this.el;
    
    this.yogaStart = function() {
      let imagesEl = document.querySelector("#yoga-images");
      let timerEl = document.querySelector("#timer");
      
      let loopCount = 0;
      let timer = TIME_ARRAY[loopCount];
      let timerId = setInterval(countdown, 1000);
      
      // Initialization for first loop
      // imagesEl.setAttribute("visible", "true");
      imagesEl.setAttribute("src", "#yoga-short-" + loopCount);
      timerEl.setAttribute("visible", "true");
      el.setAttribute("sound", "src: #yoga-audio-short-0; autoplay: true; loop: false; positional: false; volume: 0.25");
      document.querySelector("#yoga-images").setAttribute("sound", "src: #As-the-rain; autoplay: true; loop: true; volume: 0.05");
      imageLoop();
      
      // Recursively goes through images and timers until done
      function imageLoop() {
        setTimeout(function() {
          loopCount++;
          
          if (loopCount < TIME_ARRAY.length) {
            imagesEl.setAttribute("src", "#yoga-short-" + loopCount);
            el.setAttribute("sound", "src: #yoga-audio-short-" + loopCount + "; autoplay: true; loop: false; positional: false; volume: 0.25");
            timer = TIME_ARRAY[loopCount];
            imageLoop();
          } else { // Clear when done looping
            // imagesEl.setAttribute("visible", "false");
            timerEl.setAttribute("visible", "false");
            clearInterval(timerId);
          }
        }, TIME_ARRAY[loopCount]) 
      }
      
      // Decrements timer every second
      function countdown() {
        timer -= 1000;
        timerEl.setAttribute("text", "value", timer / 1000);
      }
    };
    
    this.el.sceneEl.addEventListener("yogaStart", this.yogaStart);
  },
  remove: function() {
    this.el.sceneEl.removeEventListener("yogaStart", this.yogaStart);
  }
});