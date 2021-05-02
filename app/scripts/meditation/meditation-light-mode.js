AFRAME.registerComponent('meditation-light-mode', {
  init: function() {
    let el = this.el;

    this.changeLighting = this.changeLighting.bind(this);
    this.onMeditationStart = this.onMeditationStart.bind(this);
    this.onMeditationEnd = this.onMeditationEnd.bind(this);

    // this.el.sceneEl.addEventListener('goMeditation', this.onMeditation);
    this.el.sceneEl.addEventListener("startMeditation", this.onMeditationStart);
    this.el.sceneEl.addEventListener("endMeditation", this.onMeditationEnd);
  },
  remove: function() {
    // this.el.sceneEl.removeEventListener('goMeditation', this.onMeditation);
    this.el.sceneEl.removeEventListener("startMeditation", this.onMeditationStart);
    this.el.sceneEl.removeEventListener("endMeditation", this.onMeditationEnd);
  },
  changeLighting: function(intensity) {
    let light = {
      property: 'light.intensity',
      to: intensity,
      dur: 2000,
      easing: 'linear'
    };
    this.el.setAttribute('animation', light);
  },
  onMeditationEnd: function() {
    this.changeLighting(2.5);
  },
  onMeditationStart: function() {
    this.changeLighting(0.2);
  }
})