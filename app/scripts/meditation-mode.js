AFRAME.registerComponent("meditation-mode", {
  init: function() {
    let el = this.el;

    this.onMeditation = function(e) {
      let c = e.detail.returnColor;
      //console.log(c);

      let sound;
      let params;

      if (c == "#FFC65D") {
        // we want to change the sky to darker

        params = {
          property: "color",
          to: "#171F3E",
          dur: 2000,
          easing: "linear"
        };

        sound =
          "src: #meditation-music; autoplay: true; loop: true; positional: false; volume: 0.1";

        // Turn on lanterns
        document.querySelectorAll(".lantern").forEach(lantern => {
          let flame = document.createElement("a-entity");
          flame.setAttribute("class", "flame");
          flame.setAttribute("position", "0 1 0");
          flame.setAttribute("gltf-model", "#flame");
          lantern.appendChild(flame);
        });
      } else {
        // we want to change it back to the defualt sky

        params = {
          property: "color",
          to: "#FFF",
          dur: 2000,
          easing: "linear"
        };

        sound =
          "src: #background-music; autoplay: true; loop: true; positional: false; volume: 0.1";

        // Turn off lanterns
         // Turn on lanterns
        document.querySelectorAll(".lantern").forEach((lantern) => {
          // Assuming we only have the flame as the child
          lantern.removeChild(lantern.firstChild);
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
