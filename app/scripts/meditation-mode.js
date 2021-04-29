AFRAME.registerComponent("meditation-mode", {
  init: function () {
    let el = this.el;

    this.changeSkyAndMusic = this.changeSkyAndMusic.bind(this);
    this.onMeditationStart = this.onMeditationStart.bind(this);
    this.onMeditationEnd = this.onMeditationEnd.bind(this);

    // this.el.sceneEl.addEventListener("goMeditation", this.onMeditation);
    this.el.sceneEl.addEventListener("startMeditation", this.onMeditationStart);
    this.el.sceneEl.addEventListener("endMeditation", this.onMeditationEnd);
  },
  remove: function () {
    // this.el.sceneEl.removeEventListener("goMeditation", this.onMeditation);
    this.el.sceneEl.removeEventListener("startMeditation", this.onMeditationStart);
    this.el.sceneEl.removeEventListener("endMeditation", this.onMeditationEnd);
  },

  /*
    Change to values = { color, music, visibility }
  */
  changeSkyAndMusic: function (values) {
    let sound;
    let params;

    params = {
      property: "color",
      to: values.color,
      dur: 2000,
      easing: "linear",
    };

    sound = this.el.getAttribute("sound");
    sound.src = values.music;

    document.querySelectorAll(".flame").forEach((flame) => {
      flame.setAttribute("visible", values.visibility);
    });

    //el.setAttribute('src', source);
    this.el.setAttribute("animation", params);
    this.el.setAttribute("sound", sound);
  },

  onMeditationStart: function () {
    this.changeSkyAndMusic({
      color: "#171F3E",
      music: "#meditation-music",
      visibility: true,
    });
  },

  onMeditationEnd: function () {
    this.changeSkyAndMusic({
      color: "#FFF",
      music: "#background-music",
      visibility: false,
    });
  },
});
