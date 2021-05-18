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
    //sound.src = values.music;

    document.querySelectorAll(".flame").forEach((flame) => {
      flame.setAttribute("visible", values.visibility);
    });

    //el.setAttribute('src', source);
    this.el.setAttribute("animation", params);
    //this.el.setAttribute("sound", sound);
  },

  onMeditationStart: function () {
    this.changeSkyAndMusic({
      color: "#171F3E",
      music: "#meditation-music",
      visibility: true,
    });

    let sunPositionAnimation = 'property: material.sunPosition; to: 0 -70 0; dur: 2000';
    let lightColorAnimation = 'property: material.lightColor; to: #0b1026; dur: 2000';
    let lightDarkColorAnimation = 'property: material.darkColor; to: #242b4b; dur: 2000';
    let lightFogAnimation = 'property: material.fogColor; to: #000000; dur: 2000';
    this.el.setAttribute('animation__sun', sunPositionAnimation);
    this.el.setAttribute('animation__light_color', lightColorAnimation);
    this.el.setAttribute('animation__dark_color', lightDarkColorAnimation);
    this.el.setAttribute('animation__fog_color', lightFogAnimation);
  },

  onMeditationEnd: function (evt) {
    this.changeSkyAndMusic({
      color: "#FFF",
      music: "#" + evt.detail.song,
      visibility: false,
    });

    let sunPositionAnimation = 'property: material.sunPosition; to: 10 70 20; dur: 2000';
    let lightColorAnimation = 'property: material.lightColor; to: #8fdeea; dur: 2000'
    let lightDarkColorAnimation = 'property: material.darkColor; to: #ebf7f5; dur: 2000';
    let lightFogAnimation = 'property: material.fogColor; to: #eeeeee; dur: 2000';
    this.el.setAttribute('animation__sun', sunPositionAnimation);
    this.el.setAttribute('animation__color', lightColorAnimation);
    this.el.setAttribute('animation__dark_color', lightDarkColorAnimation);
    this.el.setAttribute('animation__fog_color', lightFogAnimation);
  },
});
