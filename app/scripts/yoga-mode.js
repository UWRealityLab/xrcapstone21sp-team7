// Not actually used, but I'm keeping it here for now
// as a nice reference for which times go with which images.
const IMG_ARRAY = ["cherry-blossom.png",
                   "flat-rock.png"];
// Time for each image until moving onto next (in milliseconds)
const TIME_ARRAY = [10000, 15000];

/* This code will go through the linked images in the image array, and
 * switch to the next one after the amount of time in the corresponding
 * array.
 * TODO: draw up yoga images
 *       add yoga mat and emitter button to test
 *       plan out future yoga functionality
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
      
      // Initialization for first loop\
      imagesEl.setAttribute("visible", "true");
      imagesEl.setAttribute("src", "#yoga-" + loopCount);
      timerEl.setAttribute("visible", "true");
      imageLoop();
      
      // Recursively goes through images and timers until done
      function imageLoop() {
        setTimeout(function() {
          loopCount++;
          
          if (loopCount < IMG_ARRAY.length) {
            imagesEl.setAttribute("src", "#yoga-" + loopCount);
            timer = TIME_ARRAY[loopCount];
            imageLoop();
          } else { // Clear when done looping
            imagesEl.setAttribute("visible", "false");
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