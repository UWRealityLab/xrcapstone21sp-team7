AFRAME.registerComponent("meditation-mode", {
  init: function() {
    let el = this.el;

    this.onMeditation = function(e) {
      let n = e.detail.returnColor;
      console.log("MEDITATION MODE");

      let sound;
      let params;

      if (n == "meditation" && el.getAttribute("sound").src != "#meditation-music") {
        // we want to change the sky to darker

        params = {
          property: "color",
          to: "#171F3E",
          dur: 2000,
          easing: "linear"
        };

        sound = el.getAttribute("sound");
        sound.src = "#meditation-music";

        //sound =
          //"src: #meditation-music; autoplay: true; loop: true; positional: false; volume: 0.1";

        // let flameNum = 0;
        // Turn on lanterns
        document.querySelectorAll(".flame").forEach(flame => {
          flame.setAttribute("visible", false);
        });
      } else {
        // we want to change it back to the defualt sky

        params = {
          property: "color",
          to: "#FFF",
          dur: 2000,
          easing: "linear"
        };

        el.getAttribute("sound");
        sound.src = "#background-music";

        //sound =
          //"src: #background-music; autoplay: true; loop: true; positional: false; volume: 0.1";

        // Turn off lanterns
        document.querySelectorAll(".flame").forEach(flame => {
          flame.setAttribute("visible", false);
        });
      }
      //el.setAttribute('src', source);
      el.setAttribute("animation", params);
      el.setAttribute("sound", sound);
    };
    this.el.sceneEl.addEventListener("goMeditation", this.onMeditation);
  },
  remove: function() {
    this.el.sceneEl.removeEventListener("goMeditation", this.onMeditation);
  }
});
