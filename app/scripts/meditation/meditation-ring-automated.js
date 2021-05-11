AFRAME.registerComponent('meditation-ring-automated', {
  schema: {
    breathCaptureId: { type: 'string' },
    meditationBreathAcceptableThreshold: { type: 'number', default: 1000 }
  },

  init: function () {
    let el = this.el;

    this.onBreathInComplete = this.onBreathInComplete.bind(this);
    this.onBreathOutComplete = this.onBreathOutComplete.bind(this);
    this.onHoldingBreathInComplete = this.onHoldingBreathInComplete.bind(this);
    this.onHoldingBreathOutComplete = this.onHoldingBreathOutComplete.bind(this);
    this.startAutomatedMeditationRing = this.startAutomatedMeditationRing.bind(this);
    this.endAutomatedMeditationRing = this.endAutomatedMeditationRing.bind(this);
    this.onLoopTimeout = this.onLoopTimeout.bind(this);
    this.onTimeLeftTimeout = this.onTimeLeftTimeout.bind(this);
    this.onBreathChangeHelper = this.onBreathChangeHelper.bind(this);

    el.sceneEl.addEventListener('holding-breath-in-complete', this.onHoldingBreathInComplete);
    el.sceneEl.addEventListener('holding-breath-out-complete', this.onHoldingBreathOutComplete);
    el.sceneEl.addEventListener('breath-in-complete', this.onBreathInComplete);
    el.sceneEl.addEventListener('breath-out-complete', this.onBreathOutComplete);
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

    el.sceneEl.removeEventListener('holding-breath-in-complete', this.onHoldingBreathInComplete);
    el.sceneEl.removeEventListener('holding-breath-out-complete', this.onHoldingBreathOutComplete);
    el.sceneEl.removeEventListener('breath-in-complete', this.onBreathInComplete);
    el.sceneEl.removeEventListener('breath-out-complete', this.onBreathOutComplete);
    el.sceneEl.removeEventListener('breath-capture-calibration-complete', this.startAutomatedMeditationRing);
    el.sceneEl.removeEventListener('breath-capture-end', this.endAutomatedMeditationRing);
  },

  onHoldingBreathInComplete: function(evt) {
    this.log('holding breath in time ', evt.detail);
  },

  onHoldingBreathOutComplete: function(evt) {
    this.log('holding breath out time ', evt.detail);
  },

  onBreathOutComplete : function(evt) {
    this.log('breath out time ', evt.detail);
    this.onBreathChangeHelper(evt);
  },

  onBreathInComplete : function(evt) {
    this.log('breath in time ', evt.detail);
    this.onBreathChangeHelper(evt);
  },

  onBreathChangeHelper: function(evt) {
    let params = {
      value: '',
      color: ''
    }

    if (evt.detail < 5000 - this.data.meditationBreathAcceptableThreshold) {
      this.log('too short outwards breath');
      params.value = 'Too Shallow!';
      params.color = '#ff0000';
    } else if (evt.detail > 5000 + this.data.meditationBreathAcceptableThreshold) {
      this.log('too long outwards breath');
      params.value = 'Too Deep!';
      params.color = '#ff0000';
    } else {
      params.value = 'Great!';
      params.color = '#00ff00';
    }

    let notification = document.getElementById('breath-meditation-text-feedback');
    this.setTextAnimation(notification, params);
  },

  setTextAnimation: function(notification, params) {
    let animationScale = {
      property: 'scale',
      from: '2.5 2.5 2.5',
      to: '2 2 2',
      dur: '200'
    };

    notification.setAttribute('text', 'value', params.value);
    notification.setAttribute('text', 'color', params.color);
    notification.setAttribute('visible', 'true');
    notification.removeAttribute('animation__scale');
    notification.setAttribute('animation__scale', animationScale);
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

    this.timeLeft = MEDITATION_TIME / 1000;
    this.timeLeftTimer = setInterval(this.onTimeLeftTimeout, 1000);
  },

  onTimeLeftTimeout: function() {
    this.timeLeft--;
    let timeLeftStr = `${Math.floor(this.timeLeft / 60)}:${this.timeLeft % 60 < 10 ? '0' : ''}${this.timeLeft % 60}`;
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

    let notification = document.getElementById('breath-meditation-text-feedback');
    notification.setAttribute('visible', 'false');
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
