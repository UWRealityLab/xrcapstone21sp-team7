const CALIBRATION_TIME = 4;
const AUDIO_2_PLAY_TIME = 30;
const DELTA_SAMPLES_TO_AVG = 6;
// Any displacement below this amount (in meters) is not considered to be
// the user breathing in or out
const DISPLACEMENT_DEADZONE = 0.00001;
const DISPLACEMENT_TOO_LARGE = 0.1;
const HOLDING_BREATH_DISPLACEMENT_DEADZONE = 0.005;
const FALSE_POSITIVE_TIME_DIFF = 500;

const CALIBRATION_STATES = {
  FINDING_BREATH_IN_POSITION: 0,
  FINDING_BREATH_OUT_POSITION: 1,
  CALIBRATION_COMPLETE: 2,
  AUDIO2_COMPLETE_PLAYING: 3,
}

const BREATH_STATES = {
  HOLDING_BREATH_IN: 0,
  HOLDING_BREATH_OUT: 1,
  BREATHING_IN: 2,
  BREATHING_OUT: 3,
  ERROR: 4,
}

const MEDITATION_TIME = 120000;

/**
 * Connect this component to a hand with hand-controls component.
 * 
 * How breath capture works:
 *
 * The user triggers the start of breath capture by selecting it from a menu.
 * The menu will emit the 'breath-capture-start' signal. When captured, the
 * breath capture component will start the intro audio associated with breath
 * capture.
 * 
 * During this stage, when the user presses 'x' the breath capture state changes
 * to calibration. During this phase, the breath capture waits 5 seconds for the
 * user to breath out. When calibration is complete, the second breath exercise
 * script is started.
 * 
 * When calibrated, the use is informed via another prerecorded audio file and
 * breath capture starts to give feedback about when the user has breathed in
 * and out.
 * 
 * After a short delay to let the audio file play, breath capture starts in earnest.
 * The breath-capture doesn't emit anything when this starts happening but does update
 * deltaPositionAvg, which is used to update the size of the ring.
 * 
 * The meditation-ring component uses this information for providing
 * a visual queue for when someone is breathing in and out. The breath capture
 * will run for 120 seconds or until the user presses 'x' again. When breath capture
 * is complete, the third breath capture script will start.
 */
AFRAME.registerComponent('breath-capture', {
  schema: {
    deltaPositionAvg: { type: 'number', default: 0 }
  },

  dependencies: ['hand-controls'],

  init: function () {
    let el = this.el;

    // State variables
    this.meditating = false;
    this.controllerConnected = false;

    // Bound functions
    this.startBreathCapture = this.startBreathCapture.bind(this);
    this.stopBreathCapture = this.stopBreathCapture.bind(this);
    this.onControllerConnected = this.onControllerConnected.bind(this);
    this.onControllerDisconnected = this.onControllerDisconnected.bind(this);
    this.runCalibration = this.runCalibration.bind(this);
    this.runBreathCapture = this.runBreathCapture.bind(this);
    this.getControllerPosition = this.getControllerPosition.bind(this);
    this.onCaptureBreathInPosition = this.onCaptureBreathInPosition.bind(this);
    this.classifyBreathing = this.classifyBreathing.bind(this);
    this.onItemDeselected = this.onItemDeselected.bind(this);
    this.updateBreathingAverageTimes = this.updateBreathingAverageTimes.bind(this);
    this.onMeditationCompleteTimeout = this.onMeditationCompleteTimeout.bind(this);

    this.breathOutEmitters = [
      'holding-breath-in-complete',
      'holding-breath-out-complete',
      'breath-in-complete',
      'breath-out-complete',
      'breath-error'
    ];

    el.sceneEl.addEventListener('breath-capture-start', this.startBreathCapture);
    el.sceneEl.addEventListener('breath-capture-end', this.stopBreathCapture);
    el.sceneEl.addEventListener('menu-item-deselected', this.onItemDeselected);
    el.addEventListener('controllerconnected', this.onControllerConnected);
    el.addEventListener('controllerdisconnected', this.onControllerDisconnected);
    el.addEventListener('xbuttondown', this.onCaptureBreathInPosition);
  },

  onItemDeselected: function () {
    if (this.meditating) {
      this.el.sceneEl.emit('breath-capture-end');
      this.stopBreathCapture();
    }
  },

  remove: function () {
    let el = this.el;
    el.sceneEl.removeEventListener('breath-capture-start', this.startBreathCapture);
    el.sceneEl.removeEventListener('breath-capture-end', this.stopBreathCapture);
    el.removeEventListener('controllerconnected', this.onControllerConnected);
    el.removeEventListener('controllerdisconnected', this.onControllerDisconnected);
  },

  tick: function (time, timeDelta) {
    if (this.controllerConnected && this.meditating) {
      if (this.calibrationObj.calibrationState == CALIBRATION_STATES.FINDING_BREATH_IN_POSITION ||
        this.calibrationObj.calibrationState == CALIBRATION_STATES.FINDING_BREATH_OUT_POSITION) {
        this.runCalibration(Date.now() / 1000)
      } else if (this.calibrationObj.calibrationState == CALIBRATION_STATES.CALIBRATION_COMPLETE) {
        // Check to see if delay for playing second audio file is complete
        if (Date.now() / 1000 - this.calibrationObj.startTime > AUDIO_2_PLAY_TIME) {
          this.calibrationObj.calibrationState = CALIBRATION_STATES.AUDIO2_COMPLETE_PLAYING;
          this.el.sceneEl.emit(
            'breath-capture-calibration-complete',
            this.calibrationObj.displacementArr[this.calibrationObj.maxDisplacementIndex]);
          this.meditationCompleteTimeout = setTimeout(this.onMeditationCompleteTimeout, MEDITATION_TIME);
        }
      } else {
        // Run normal breath capture
        this.runBreathCapture(timeDelta);
      }
    }
  },

  onMeditationCompleteTimeout: function() {
    // Stop breath capture
    this.el.sceneEl.emit('breath-capture-end');
    this.stopBreathCapture();
  },

  displacement: function (v1, v2) {
    return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2) + Math.pow(v1.z - v2.z, 2));
  },

  runCalibration: function (time) {
    // The user must place the controller on their belly, breathe in all the way, press the y button
    // and breath all the way. This gives us a bunch of positions that we can do linear regression to
    // find a best fit line. Then when we are computing the displacement during operation, we use the
    // best fit line as the target vector and only consider displacements in this direction
    // 
    // Note that direction is important to us because we need to know when they are breathing in vs. 
    // when they are breathing out.
    switch (this.calibrationObj.calibrationState) {
      case CALIBRATION_STATES.FINDING_BREATH_IN_POSITION:
        break;
      case CALIBRATION_STATES.FINDING_BREATH_OUT_POSITION:
        // Each time we get a new position compute its displacement from the breathInPosition.
        let position = this.getControllerPosition();
        let displacement = this.displacement(this.calibrationObj.breathInPosition, position);

        // Store the displacement and position
        this.calibrationObj.displacementArr.push(displacement);
        this.calibrationObj.positionArr.push(position);

        // Keep track of the max displacement measured
        if (this.calibrationObj.displacementArr[this.calibrationObj.maxDisplacementIndex] < displacement) {
          this.calibrationObj.maxDisplacementIndex = this.calibrationObj.displacementArr.length - 1;
        }

        // After some time for calibration has passed, find the largest
        // displacement and use this to find the target vector.
        if (time - this.calibrationObj.startTime > CALIBRATION_TIME) {
          this.calibrationObj.breathOutPosition = this.calibrationObj.positionArr[this.calibrationObj.maxDisplacementIndex];
          // Find the target vector using the in and out breath positions
          this.targetVector = new THREE.Vector3();
          this.targetVector.subVectors(this.calibrationObj.breathInPosition, this.calibrationObj.breathOutPosition).normalize();

          this.log(
            'breathing calibrated, breathInPosition',
            this.calibrationObj.breathInPosition,
            'breath out position',
            this.calibrationObj.breathOutPosition,
            'targetVector:',
            this.targetVector);

          this.calibrationObj.calibrationState = CALIBRATION_STATES.CALIBRATION_COMPLETE;

          // Initialize breath capture variables needed now that calibration is complete
          this.previousPosition = position;

          //let sound = 'on: model-loaded; src: #breath-exercise-meditation-2; autoplay: true; loop: false; positional: false; volume: 0.1';
          //this.el.setAttribute('sound', sound);
          this.el.emit("change-breathing-exercise-2");
          console.log("change-breathing-exercise-2");

          this.calibrationObj.startTime = time;

          this.prevClassificationChangeTime = Date.now();
        }
        break;
      default:
        this.log('Invalid state during calibration');
        break;
    }
  },

  dot: function (v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  },

  avg: function (arr) {
    let avg = 0;
    for (let i = 0; i < arr.length; i++) {
      avg += arr[i];
    }
    return avg / arr.length;
  },

  runBreathCapture: function (timeDelta) {
    let position = this.getControllerPosition();
    let deltaPosition = new THREE.Vector3(
      position.x - this.previousPosition.x,
      position.y - this.previousPosition.y,
      position.z - this.previousPosition.z);
    this.previousPosition = position;

    // The change in position along the target vector
    // Projection of a on b is a dot b / length(b).
    // In this case length(b) == 1
    let deltaPositionProjected = this.dot(deltaPosition, this.targetVector);
    this.displacementArr.push(deltaPositionProjected / timeDelta);
    if (this.displacementArr.length >= DELTA_SAMPLES_TO_AVG) {
      this.displacementArr = this.displacementArr.slice(1);
      let deltaPositionAvg = this.avg(this.displacementArr);
      this.classifyBreathing(deltaPositionAvg, position);
    }
  },

  updateBreathingAverageTimes: function(newBreathClassification) {
    if (this.breathClassification != newBreathClassification) {
      this.log(newBreathClassification);
      let falsePositive = (Date.now() - this.prevClassificationChangeTime) < FALSE_POSITIVE_TIME_DIFF;
      if (falsePositive) {
        console.log('false positive');
        return;
      }

      switch(this.breathClassification) {
        case BREATH_STATES.BREATHING_IN:
          this.breathInTime = Date.now() - this.prevClassificationChangeTime;
          this.log('breathInTime', this.breathInTime);
          this.el.sceneEl.emit(this.breathOutEmitters[this.breathClassification], this.breathInTime);
          break;
        case BREATH_STATES.BREATHING_OUT:
          this.breathOutTime = Date.now() - this.prevClassificationChangeTime;
          this.log('breathOutTime', this.breathOutTime);
          this.el.sceneEl.emit(this.breathOutEmitters[this.breathClassification], this.breathOutTime);
          break;
        case BREATH_STATES.HOLDING_BREATH_IN:
          this.holdingBreathInTime = Date.now() - this.prevClassificationChangeTime;
          this.el.sceneEl.emit(this.breathOutEmitters[this.breathClassification], this.holdingBreathInTime);
          break;
        case BREATH_STATES.HOLDING_BREATH_OUT:
          this.holdingBreathOutTime = Date.now() - this.prevClassificationChangeTime;
          this.el.sceneEl.emit(this.breathOutEmitters[this.breathClassification], this.holdingBreathOutTime);
          break;
      }
      this.prevClassificationChangeTime = Date.now();
      this.breathClassification = newBreathClassification;
    }
  },

  classifyBreathing: function (deltaPositionAvg, position) {
    // Project positions onto the target vector and then find the current
    // controller displacement from breath in and out positions, if the displacement is
    // very small, this probably means that the person is holding their breath.

    let breathInDisplacementVector = new THREE.Vector3(this.calibrationObj.breathInPosition.x - position.x,
                                                       this.calibrationObj.breathInPosition.y - position.y,
                                                       this.calibrationObj.breathInPosition.z - position.z);
    let breathOutDisplacementVector = new THREE.Vector3(this.calibrationObj.breathOutPosition.x - position.x,
                                                        this.calibrationObj.breathOutPosition.y - position.y,
                                                        this.calibrationObj.breathOutPosition.z - position.z);

    let breathInProjectedDisplacement = Math.abs(this.dot(this.targetVector, breathInDisplacementVector));
    let breathOutProjectedDisplacement = Math.abs(this.dot(this.targetVector, breathOutDisplacementVector));

    // This is terrible but it works
    if (Math.abs(breathInProjectedDisplacement) < HOLDING_BREATH_DISPLACEMENT_DEADZONE) {
      this.updateBreathingAverageTimes(BREATH_STATES.HOLDING_BREATH_IN);
      deltaPositionAvg = 0;
    } else if (Math.abs(breathOutProjectedDisplacement) < HOLDING_BREATH_DISPLACEMENT_DEADZONE) {
      this.updateBreathingAverageTimes(BREATH_STATES.HOLDING_BREATH_OUT);
      deltaPositionAvg = 0;
    } else if (Math.abs(deltaPositionAvg) > DISPLACEMENT_TOO_LARGE) {
      this.updateBreathingAverageTimes(BREATH_STATES.ERROR);
      deltaPositionAvg = 0;
    } else if (deltaPositionAvg > 0) {
      if (this.breathClassification != BREATH_STATES.BREATHING_OUT ||
          Math.abs(deltaPositionAvg) >= DISPLACEMENT_DEADZONE) {
        this.updateBreathingAverageTimes(BREATH_STATES.BREATHING_IN);
      }
    } else if (deltaPositionAvg < 0) {
      if (this.breathClassification != BREATH_STATES.BREATHING_IN ||
          Math.abs(deltaPositionAvg) >= DISPLACEMENT_DEADZONE) {
        this.updateBreathingAverageTimes(BREATH_STATES.BREATHING_OUT);
      }
    }

    this.el.setAttribute('breath-capture', 'deltaPositionAvg', deltaPositionAvg);
    // this.log(this.breathClassification, deltaPositionAvg, breathInProjectedDisplacement, breathOutProjectedDisplacement);
  },

  onCaptureBreathInPosition: function () {
    if (this.meditating) {
      if (this.calibrationObj.calibrationState == CALIBRATION_STATES.FINDING_BREATH_IN_POSITION) {
        let position = this.getControllerPosition();
        this.calibrationObj.breathInPosition = position;
        this.calibrationObj.startTime = Date.now() / 1000;
        this.calibrationObj.calibrationState = CALIBRATION_STATES.FINDING_BREATH_OUT_POSITION;
        this.log('found breath in position');
      } else {
        // Breath capture finished
        this.el.sceneEl.emit('breath-capture-end');
      }
    }
  },

  startBreathCapture: function () {
    this.log('starting breath capture');

    this.meditating = true;

    this.calibrationObj = {
      breathInPosition: null,
      breathOutPosition: null,
      maxDisplacementIndex: 0,
      positionArr: [],
      displacementArr: [],
      startTime: 0,
      calibrationState: CALIBRATION_STATES.FINDING_BREATH_IN_POSITION
    };

    this.displacementArr = [];
    this.breathClassification = BREATH_STATES.HOLDING_BREATH_IN;

    //let sound = 'on: model-loaded; src: #breath-exercise-meditation-1; autoplay: true; loop: false; positional: false; volume: 0.1';
    //this.el.setAttribute('sound', sound);
    //this.el.components.sound.playSound();
  },

  stopBreathCapture: function () {
    this.meditating = false;
    this.el.setAttribute('breath-capture', 'deltaPositionAvg', 0);
    //let sound = 'on: model-loaded; src: #breath-exercise-meditation-3; autoplay: true; loop: false; positional: false; volume: 0.1';
    //this.el.setAttribute('sound', sound);
    this.log('stopping breath capture');
    clearTimeout(this.onMeditationCompleteTimeout);
  },

  onControllerConnected: function () { this.controllerConnected = true; },

  onControllerDisconnected: function () { this.controllerConnected = false; },

  getControllerPosition: function () {
    let position = new THREE.Vector3();
    let rotation = new THREE.Quaternion();
    let scale = new THREE.Vector3();
    this.el.object3D.matrixWorld.decompose(position, rotation, scale);
    return position;
  },

  log(string, ...etc) {
    if (!Q.LOGGING.BreathCapture) return;

    console.groupCollapsed(
      `[UserView-${this.userViewId}${this.isMyUser ? " (YOU)" : ""}] ${string}`,
      ...etc
    );
    console.trace(); // hidden in collapsed group
    console.groupEnd();
  }
});
