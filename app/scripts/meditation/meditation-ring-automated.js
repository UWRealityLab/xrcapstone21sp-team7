AFRAME.registerComponent('meditation-ring-automated', {
  schema: {
    breathCaptureId: { type: 'string' },
    meditationBreathAcceptableThreshold: { type: 'number', default: 1000 }
  },

  init: function () {
    let el = this.el;

    this.onBreathIn = this.onBreathIn.bind(this);
    this.onBreathOut = this.onBreathOut.bind(this);
    this.startAutomatedMeditationRing = this.startAutomatedMeditationRing.bind(this);
    this.endAutomatedMeditationRing = this.endAutomatedMeditationRing.bind(this);
    this.onLoopTimeout = this.onLoopTimeout.bind(this);
    this.onTimeLeftTimeout = this.onTimeLeftTimeout.bind(this);

    el.sceneEl.addEventListener('breathing-in', this.onBreathIn);
    el.sceneEl.addEventListener('breathing-out', this.onBreathOut);
    el.sceneEl.addEventListener('breath-capture-calibration-complete', this.startAutomatedMeditationRing);
    el.sceneEl.addEventListener('breath-capture-end', this.endAutomatedMeditationRing);

    el.setAttribute('visible', 'false');
  },

  tick: function () {
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
    } else if (breathInTime > this.data.meditationBreathPeriod / 2 + this.data.meditationBreathAcceptableThreshold) {
      this.log('too long inward breath');
    }
  },

  startAutomatedMeditationRing: function() {
    let el = this.el;
    el.setAttribute('visible', 'true');

    let menu = document.getElementById('breath-meditation-menu');
    menu.setAttribute('visible', 'true');

    let text = document.getElementById('breath-meditation-text');
    text.setAttribute('text', 'value', 'Breath In');

    let scaleAnimation = 'property: scale; from: 1 1 1; to: 6 6 6; dur: 4999';
    let colorAnimation = 'property: material.color; type: color; from: #ff0000; to: #00ff00; dur: 4999';
    el.setAttribute('animation__scale', scaleAnimation);
    el.setAttribute('animation__color', colorAnimation);

    this.loopCount = 0;
    this.loopTimer = setInterval(this.onLoopTimeout, 5000);

    this.timeLeft = MEDITATION_TIME;
    this.timeLeftTimer = setInterval(this.onTimeLeftTimeout, 1000);
  },

  onTimeLeftTimeout: function() {
    this.timeLeft--;
    let timeLeftStr = `${Math.floor(this.timeLeft / 60)}:${this.timeLeft % 60 < 10 ? '0' : ''}${this.timeLeft % 60}`;
    console.log(timeLeftStr);
    let timer = document.getElementById('breath-meditation-timer');
    timer.setAttribute('text', 'value', timeLeftStr);
  },

  onLoopTimeout: function() {
    let el = this.el;
    this.loopCount++;
    this.loopCount %= 3;
    if (this.loopCount == 0) {
      document.getElementById('breath-meditation-text').setAttribute('text', 'value', 'Breath In');
      let scaleAnimation = 'property: scale; from: 1 1 1; to: 6 6 6; dur: 4999';
      let colorAnimation = 'property: material.color; type: color; from: #ff0000; to: #00ff00; dur: 4999';
      el.setAttribute('animation__scale', scaleAnimation);
      el.setAttribute('animation__color', colorAnimation);
    } else if (this.loopCount == 1) {
      document.getElementById('breath-meditation-text').setAttribute('text', 'value', 'Hold Breath');
    } else {
      document.getElementById('breath-meditation-text').setAttribute('text', 'value', 'Breath Out');
      let scaleAnimation = 'property: scale; from: 6 6 6; to: 1 1 1; dur: 4999';
      let colorAnimation = 'property: material.color; type: color; from: #00ff00; to: #ff0000; dur: 4999';
      el.setAttribute('animation__scale', scaleAnimation);
      el.setAttribute('animation__color', colorAnimation);
    }
  },

  endAutomatedMeditationRing: function() {
    let el = this.el;
    el.setAttribute('visible', 'false');
    el.removeAttribute('animation__scale');
    el.removeAttribute('animation__color');
    clearInterval(this.loopTimer);
    clearInterval(this.timeLeftTimer);

    let menu = document.getElementById('breath-meditation-menu');
    menu.setAttribute('visible', 'false');

    let timer = document.getElementById('breath-meditation-timer');
    timer.setAttribute('text', 'value', '2:00');
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
