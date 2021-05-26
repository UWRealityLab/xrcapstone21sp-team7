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
    this.onBreathCaptureCalibrationComplete = this.onBreathCaptureCalibrationComplete.bind(this);
    this.onPauseBreathing = this.onPauseBreathing.bind(this);

    el.sceneEl.addEventListener('breathing-in', this.onBreathIn);
    el.sceneEl.addEventListener('breathing-out', this.onBreathOut);
    el.sceneEl.addEventListener('breath-capture-start', this.onMeditationStart);
    el.sceneEl.addEventListener('breath-capture-end', this.onMeditationEnd);
    el.sceneEl.addEventListener('breath-capture-calibration-complete', this.onBreathCaptureCalibrationComplete);
    el.sceneEl.addEventListener('pause-breathing', this.onPauseBreathing);

    el.setAttribute('visible', 'false');
  },

  onPauseBreathing: function(evt) {
    let state = evt.detail.state;
    if (state == 'replay') {
      // stop the automated meditation ring since this will be restarted after the intro.
      this.onMeditationEnd();
      this.onMeditationStart();
      return;
    }
  },

  onMeditationStart: function() {
    let el = this.el;

    el.setAttribute('color', '#ff0000');
    el.setAttribute('visible', 'true');
    this.scaleChangeMagnitude = 1;
    this.meditating = true;
  },

  onBreathCaptureCalibrationComplete: function(evt) {
    let displacement = evt.detail;
    console.log('displacement...', displacement);
    // scale change magnitude is inversely proportional to displacement
    this.scaleChangeMagnitude = 200 / displacement;
  },

  onMeditationEnd: function() {
    let el = this.el;

    el.setAttribute('visible', 'false');
    el.removeAttribute('sound');
    el.setAttribute('radius-tubular', 0.01);
    el.object3D.scale.x = 1;
    el.object3D.scale.y = 1;

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
      el.object3D.scale.x = Math.min(6, Math.max(1, el.object3D.scale.x + scaleChange * this.scaleChangeMagnitude));
      el.object3D.scale.y = Math.min(6, Math.max(1, el.object3D.scale.y + scaleChange * this.scaleChangeMagnitude));
      el.setAttribute('radius-tubular', 0.01 / el.object3D.scale.x);
    }
  },

  onBreathIn : function(evt) {
    let el = this.el;

    let colorAnimation = 'property: material.color; type: color; to: #00ff00; dur: 5000';
    el.setAttribute('animation__color', colorAnimation);
  },

  onBreathOut : function(evt) {
    let el = this.el;

    let colorAnimation = 'property: material.color; type: color; to: #ff0000; dur: 5000';
    el.setAttribute('animation__color', colorAnimation);
  },

  remove: function () {
    let el = this.el;

    el.sceneEl.removeEventListener('breathing-in', this.onBreathIn);
    el.sceneEl.removeEventListener('breathing-out', this.onBreathOut);
    el.sceneEl.removeEventListener('breath-capture-start', onMeditationStart);
    el.sceneEl.removeEventListener('breath-capture-end', onMeditationEnd);
    el.sceneEl.removeEventListener('breath-capture-calibration-complete', this.onBreathCaptureCalibrationComplete);
    el.sceneEl.removeEventListener('pause-breathing', this.onPauseBreathing);
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
