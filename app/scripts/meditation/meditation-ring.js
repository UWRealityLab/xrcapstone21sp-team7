const SCALE_CHANGE_MAGNITUDE = 1000;
const LIGHT_CHANGE_MAGNITUDE = 300;

AFRAME.registerComponent('meditation-ring', {
  schema: {
    breathCaptureId: { type: 'string' }
  },

  init: function () {
    let el = this.el;

    this.onBreathIn = this.onBreathIn.bind(this);
    this.onBreathOut = this.onBreathOut.bind(this);
    this.onMeditationStart = this.onMeditationStart.bind(this);
    this.onMeditationEnd = this.onMeditationEnd.bind(this);

    el.sceneEl.addEventListener('breathing-in', this.onBreathIn);
    el.sceneEl.addEventListener('breathing-out', this.onBreathOut);
    el.sceneEl.addEventListener('breath-capture-start', this.onMeditationStart);
    el.sceneEl.addEventListener('breath-capture-end', this.onMeditationEnd);

    el.setAttribute('visible', 'false');
  },

  onMeditationStart: function() {
    let el = this.el;

    el.setAttribute('visible', 'true');
    sound = 'on: model-loaded; src: #Meditation-Aquatic; autoplay: true; loop: false; positional: false; volume: 1';
    el.setAttribute('sound', sound);
    this.meditating = true;
  },

  onMeditationEnd: function() {
    let el = this.el;

    el.setAttribute('visible', 'false');
    el.removeAttribute('sound');
    this.meditating = false;
  },

  tick: function() {
    if (this.meditating) {
      let el = this.el;

      if (!this.breathCaptureEl) {
        this.breathCaptureEl = document.getElementById(this.data.breathCaptureId);
      }

      let scaleChange = this.breathCaptureEl.getAttribute('breath-capture', 'deltaPositionAvg').deltaPositionAvg;
      this.log('scaleChange', scaleChange);
      el.object3D.scale.x = Math.min(6, Math.max(1, el.object3D.scale.x + scaleChange * SCALE_CHANGE_MAGNITUDE));
      el.object3D.scale.y = Math.min(6, Math.max(1, el.object3D.scale.y + scaleChange * SCALE_CHANGE_MAGNITUDE));
      el.setAttribute('radius-tubular', 0.01 / el.object3D.scale.x);

      el.setAttribute(
        'light',
        'intensity',
        Math.min(1, Math.max(0, el.getAttribute('light','intensity').intensity + scaleChange * LIGHT_CHANGE_MAGNITUDE)));
    }
  },

  onBreathIn : function(evt) {
    let el = this.el;

    let colorAnimation = 'property: material.color; type: color; to: #00ff00; dur: 2000';
    el.setAttribute('animation__color', colorAnimation);
  },

  onBreathOut : function(evt) {
    let el = this.el;

    let colorAnimation = 'property: material.color; type: color; to: #ff0000; dur: 2000';
    el.setAttribute('animation__color', colorAnimation);
  },

  remove: function () {
    let el = this.el;

    el.sceneEl.removeEventListener('breathing-in', this.onBreathIn);
    el.sceneEl.removeEventListener('breathing-out', this.onBreathOut);
    el.sceneEl.removeEventListener('breath-capture-start', onMeditationStart);
    el.sceneEl.removeEventListener('breath-capture-end', onMeditationEnd);
  },

  log(string, ...etc) {
    if (!Q.LOGGING.MeditationRing) return;

    console.groupCollapsed(
      `[UserView-${this.userViewId}${this.isMyUser ? " (YOU)" : ""}] ${string}`,
      ...etc
    );
    console.trace(); // hidden in collapsed group
    console.groupEnd();
  }
});
