AFRAME.registerComponent('meditation-ring-automated', {
  schema: {
    breathCaptureId: { type: 'string' },
    meditationBreathPeriod: { type: 'number', default: 9000 },
    meditationBreathAcceptableThreshold: { type: 'number', default: 1000 }
  },

  init: function () {
    let el = this.el;

    this.onBreathIn = this.onBreathIn.bind(this);
    this.onBreathOut = this.onBreathOut.bind(this);
    this.startAutomatedMeditationRing = this.startAutomatedMeditationRing.bind(this);
    this.endAutomatedMeditationRing = this.endAutomatedMeditationRing.bind(this);

    el.sceneEl.addEventListener('breathing-in', this.onBreathIn);
    el.sceneEl.addEventListener('breathing-out', this.onBreathOut);
    el.sceneEl.addEventListener('breath-capture-calibration-complete', this.startAutomatedMeditationRing);
    el.sceneEl.addEventListener('breath-capture-end', this.endAutomatedMeditationRing);

    el.setAttribute('visible', 'false');
  },

  update: function () {
    let el = this.el;
    el.setAttribute('radius-tubular', 0.01 / el.object3D.scale.x);
  },

  remove: function () {
    let el = this.el;

    el.sceneEl.removeEventListener('breathing-in', this.onBreathIn);
    el.sceneEl.removeEventListener('breathing-out', this.onBreathOut);
    el.sceneEl.removeEventListener('breath-capture-calibration-complete', this.startAutomatedMeditationRing);
    el.sceneEl.removeEventListener('breath-capture-end', this.endAutomatedMeditationRing);
  },

  onBreathIn : function(evt) {
    this.breathInTime = Date.now();
    let breathOutTime = this.breathInTime - this.breathOutTime;
    if (breathOutTime < this.data.meditationBreathPeriod / 2 - this.data.meditationBreathAcceptableThreshold) {
      this.log('too short outwards breath');
    } else if (breathOutTime > this.data.meditationBreathPeriod / 2 + this.data.meditationBreathAcceptableThreshold) {
      this.log('too long outwards breath');
    }
  },

  onBreathOut : function(evt) {
    this.breathOutTime = Date.now();
    let breathInTime = this.breathOutTime - this.breathInTime;
    if (breathInTime < this.data.meditationBreathPeriod / 2 - this.data.meditationBreathAcceptableThreshold) {
      this.log('too short inward breath');
    } else if (breathInTime > this.dat.meditationBreathPeriod / 2 + this.data.meditationBreathAcceptableThreshold) {
      this.log('too long inward breath');
    }
  },

  startAutomatedMeditationRing: function() {
    let el = this.el;
    let scaleAnimation = 'property: scale; from: 1 1 1; to: 6 6 6; loop: true; dir: alternate; easing: easeInOutCubic; dur: ' + this.data.meditationBreathPeriod;
    let colorAnimation = 'property: material.color; type: color; loop: true; from: #ff0000; to: #00ff00; dir: alternate; easing: easeInOutCubic; dur: ' + this.data.meditationBreathPeriod;
    el.setAttribute('visible', 'true');
    el.setAttribute('animation__scale', scaleAnimation);
    el.setAttribute('animation__color', colorAnimation);
  },

  endAutomatedMeditationRing: function() {
    let el = this.el;
    el.setAttribute('visible', 'false');
    el.removeAttribute('animation__scale');
    el.removeAttribute('animation__color');
  },

  log(string, ...etc) {
    if (!Q.LOGGING.MeditationRingAutomated) return;

    console.groupCollapsed(
      `[UserView-${this.userViewId}${this.isMyUser ? " (YOU)" : ""}] ${string}`,
      ...etc
    );
    console.trace(); // hidden in collapsed group
    console.groupEnd();
  }
});
