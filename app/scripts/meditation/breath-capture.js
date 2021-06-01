const CALIBRATION_TIME = 4000;
const AUDIO_2_PLAY_TIME = 30000;
const MEDITATION_TIME = 120000;

const DELTA_SAMPLES_TO_AVG = 8;
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
    this.onBreathCaptureStart = this.onBreathCaptureStart.bind(this);
    this.onBreathCaptureEnd = this.onBreathCaptureEnd.bind(this);
    this.onControllerConnected = this.onControllerConnected.bind(this);
    this.onControllerDisconnected = this.onControllerDisconnected.bind(this);
    this.runCalibration = this.runCalibration.bind(this);
    this.runBreathCapture = this.runBreathCapture.bind(this);
    this.getControllerPosition = this.getControllerPosition.bind(this);
    this.onToggleBreathCalibrationStart = this.onToggleBreathCalibrationStart.bind(this);
    this.classifyBreathing = this.classifyBreathing.bind(this);
    this.onMenuItemDeselected = this.onMenuItemDeselected.bind(this);
    this.updateBreathingAverageTimes = this.updateBreathingAverageTimes.bind(this);
    this.onMeditationCompleteTimeout = this.onMeditationCompleteTimeout.bind(this);
    this.onPauseBreathing = this.onPauseBreathing.bind(this);
    this.onBreathAudio2Timeout = this.onBreathAudio2Timeout.bind(this);
    this.onMeditationCalibrationComplete = this.onMeditationCalibrationComplete.bind(this);

    this.breathOutEmitters = [
      { emitString: 'holding-breath-in-complete', breathTime: 0 },
      { emitString: 'holding-breath-out-complete', breathTime: 0 },
      { emitString: 'breath-in-complete', breathTime: 0 },
      { emitString: 'breath-out-complete', breathTime: 0 },
      { emitString: 'breath-error', breathTime: -1 }
    ];

    el.sceneEl.addEventListener('breath-capture-start', this.onBreathCaptureStart);
    el.sceneEl.addEventListener('breath-capture-end', this.onBreathCaptureEnd);
    // el.sceneEl.addEventListener('menu-item-deselected', this.onMenuItemDeselected);
    el.sceneEl.addEventListener('pause-breathing', this.onPauseBreathing);
    el.addEventListener('controllerconnected', this.onControllerConnected);
    el.addEventListener('controllerdisconnected', this.onControllerDisconnected);
    el.addEventListener('xbuttondown', this.onToggleBreathCalibrationStart);
  },

  remove: function () {
    let el = this.el;
    el.sceneEl.removeEventListener('breath-capture-start', this.onBreathCaptureStart);
    el.sceneEl.removeEventListener('breath-capture-end', this.onBreathCaptureEnd);
    // el.sceneEl.removeEventListener('menu-item-deselected', this.onMenuItemDeselected);
    el.sceneEl.removeEventListener('pause-breathing', this.onPauseBreathing);
    el.removeEventListener('controllerconnected', this.onControllerConnected);
    el.removeEventListener('controllerdisconnected', this.onControllerDisconnected);
    el.removeEventListener('xbuttondown', this.onToggleBreathCalibrationStart);
  },

  tick: function (_, timeDelta) {
    if (!this.controllerConnected || !this.meditating || this.paused) {
      return;
    }

    switch (this.calibrationObj.calibrationState) {
      case CALIBRATION_STATES.FINDING_BREATH_IN_POSITION:
        // State transition out of here via user button press
        break;
      case CALIBRATION_STATES.FINDING_BREATH_OUT_POSITION:
        this.runCalibration();
        break;
      case CALIBRATION_STATES.CALIBRATION_COMPLETE:
        // State transition out of here via timer
        break;
      case CALIBRATION_STATES.AUDIO2_COMPLETE_PLAYING:
        this.runBreathCapture(timeDelta);
        break;
    }
  },

  /**
   * Captures controller displacement necessary for calibration
   */
  runCalibration: function () {
    // The user must place the controller on their belly, breathe in all the way, press the y button
    // and breath all the way. This gives us a bunch of positions that we can do linear regression to
    // find a best fit line. Then when we are computing the displacement during operation, we use the
    // best fit line as the target vector and only consider displacements in this direction
    // 
    // Note that direction is important to us because we need to know when they are breathing in vs. 
    // when they are breathing out.

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
  },

  // Timeout callbacks

  /**
   * Timeout indicating that calibration is complete
   */
  onMeditationCalibrationComplete: function() {
    this.calibrationObj.breathOutPosition = this.calibrationObj.positionArr[this.calibrationObj.maxDisplacementIndex];
    // Find the target vector using the in and out breath positions
    this.targetVector = new THREE.Vector3();
    this.targetVector.subVectors(this.calibrationObj.breathInPosition, this.calibrationObj.breathOutPosition).normalize();

    this.log(
      'onMeditationCalibrationComplete called, breathInPosition',
      this.calibrationObj.breathInPosition,
      'breath out position',
      this.calibrationObj.breathOutPosition,
      'targetVector:',
      this.targetVector);

    this.calibrationObj.calibrationState = CALIBRATION_STATES.CALIBRATION_COMPLETE;

    // Initialize breath capture variables needed now that calibration is complete
    this.previousPosition = this.getControllerPosition();

    // Start breathing exercise audio 2 and timer that will expire when audio is done
    this.el.emit("change-breathing-exercise-2");
    console.log("change-breathing-exercise-2");
    this.waitBreathExercise2Audio = new Timer(this.onBreathAudio2Timeout, AUDIO_2_PLAY_TIME);

    this.calibrationObj.startTime = Date.now();
  },

  /**
   * Timeout indicating that the second breath audio is complete
   */
  onBreathAudio2Timeout: function () {
    this.log('onBreathAudio2Timeout called');

    this.calibrationObj.calibrationState = CALIBRATION_STATES.AUDIO2_COMPLETE_PLAYING;
    this.el.sceneEl.emit(
      'breath-capture-calibration-complete',
      this.calibrationObj.displacementArr[this.calibrationObj.maxDisplacementIndex]);
    this.meditationCompleteTimeout = new Timer(this.onMeditationCompleteTimeout, MEDITATION_TIME);
    this.prevClassificationChangeTime = Date.now();
  },

  /**
   * Timeout indicating that meditation is complete.
   */
  onMeditationCompleteTimeout: function () {
    // Stop breath capture
    this.el.sceneEl.emit('breath-capture-end');
    this.onBreathCaptureEnd();
  },

  // Breath capture and classification functions

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

  classifyBreathing: function (deltaPositionAvg, position) {
    // Project positions onto the target vector and then find the current
    // controller displacement from breath in and out positions, if the displacement is
    // very small, this probably means that the person is holding their breath.

    let breathInDisplacementVector = new THREE.Vector3(
      this.calibrationObj.breathInPosition.x - position.x,
      this.calibrationObj.breathInPosition.y - position.y,
      this.calibrationObj.breathInPosition.z - position.z);
    let breathOutDisplacementVector = new THREE.Vector3(
      this.calibrationObj.breathOutPosition.x - position.x,
      this.calibrationObj.breathOutPosition.y - position.y,
      this.calibrationObj.breathOutPosition.z - position.z);

    let breathInProjectedDisplacement = this.dot(this.targetVector, breathInDisplacementVector);
    let breathOutProjectedDisplacement = this.dot(this.targetVector, breathOutDisplacementVector);

    // this.log('breathInProjectedDisplacement ' + breathInProjectedDisplacement + ' breathOutProjectedDisplacement ' + breathOutProjectedDisplacement);
    // This is terrible but it works
    if (breathInProjectedDisplacement < HOLDING_BREATH_DISPLACEMENT_DEADZONE) {
      // You are at or past the calibrated breath in position
      this.updateBreathingAverageTimes(BREATH_STATES.HOLDING_BREATH_IN);
      // deltaPositionAvg = 0;
    // } else if (breathOutProjectedDisplacement > HOLDING_BREATH_DISPLACEMENT_DEADZONE) {
    //   // You are at or past the calibrated breath out position
    //   this.updateBreathingAverageTimes(BREATH_STATES.HOLDING_BREATH_OUT);
    //   // deltaPositionAvg = 0;
    } else if (Math.abs(deltaPositionAvg) > DISPLACEMENT_TOO_LARGE) {
      // Too large displacement
      this.log('error, too large displacement');
      this.updateBreathingAverageTimes(BREATH_STATES.ERROR);
      deltaPositionAvg = 0;
    } else if (deltaPositionAvg < 0) {
      if (this.breathClassification != BREATH_STATES.BREATHING_OUT) {
        // you are breathing out
        if (Math.abs(deltaPositionAvg) >= DISPLACEMENT_DEADZONE) {
          this.updateBreathingAverageTimes(BREATH_STATES.BREATHING_OUT);
        }
      }
    } else if (deltaPositionAvg > 0) {
      // you are breathing in
      if (this.breathClassification != BREATH_STATES.BREATHING_IN) {
        if (Math.abs(deltaPositionAvg) >= DISPLACEMENT_DEADZONE) {
          this.updateBreathingAverageTimes(BREATH_STATES.BREATHING_IN);
        }
      }
    }

    this.el.setAttribute('breath-capture', 'deltaPositionAvg', deltaPositionAvg);
    // this.log(this.breathClassification, deltaPositionAvg, breathInProjectedDisplacement, breathOutProjectedDisplacement);
  },

  updateBreathingAverageTimes: function (newBreathClassification) {
    if (this.breathClassification != newBreathClassification) {
      if ((Date.now() - this.prevClassificationChangeTime) < FALSE_POSITIVE_TIME_DIFF) {
        console.log('false positive');
      } else {
        this.breathOutEmitters[this.breathClassification].breathTime = Date.now() - this.prevClassificationChangeTime;
        this.log(`emitting ${this.breathOutEmitters[this.breathClassification].emitString}, time = ${Date.now() - this.prevClassificationChangeTime}`);
        this.el.sceneEl.emit(this.breathOutEmitters[this.breathClassification].emitString, this.breathOutEmitters[this.breathClassification].breathTime);
        this.prevClassificationChangeTime = Date.now();
        this.breathClassification = newBreathClassification;
        this.breathClassificationCount = 0;
      }
    }
  },

  // Functions for starting/stopping breath classification

  onToggleBreathCalibrationStart: function () {
    if (this.meditating) {
      if (this.calibrationObj.calibrationState == CALIBRATION_STATES.FINDING_BREATH_IN_POSITION) {
        this.log('starting calibration, capturing breath in position');

        let position = this.getControllerPosition();
        this.calibrationObj.breathInPosition = position;
        this.calibrationTimeout = new Timer(this.onMeditationCalibrationComplete, CALIBRATION_TIME);
        this.calibrationObj.calibrationState = CALIBRATION_STATES.FINDING_BREATH_OUT_POSITION;
      } else {
        this.log('stopping breath capture via calibration start toggle');

        this.el.sceneEl.emit('breath-capture-end');
      }
    }
  },

  onBreathCaptureStart: function () {
    this.log('starting breath capture');

    this.meditating = true;

    this.calibrationObj = {
      breathInPosition: null,
      breathOutPosition: null,
      maxDisplacementIndex: 0,
      positionArr: [],
      displacementArr: [],
      calibrationState: CALIBRATION_STATES.FINDING_BREATH_IN_POSITION
    };

    this.displacementArr = [];
    this.breathClassification = BREATH_STATES.HOLDING_BREATH_IN;

    this.paused = false;
  },

  onBreathCaptureEnd: function () {
    this.log('stopping breath capture');

    this.meditating = false;
    this.el.setAttribute('breath-capture', 'deltaPositionAvg', 0);
    if (this.waitBreathExercise2Audio) this.waitBreathExercise2Audio.pause();
    if (this.meditationCompleteTimeout) this.meditationCompleteTimeout.pause();
    if (this.calibrationTimeout) this.calibrationTimeout.pause();
  },

  onPauseBreathing: function (evt) {
    this.log('onPauseBreathing ', evt.detail);

    if (!this.meditating) {
      return;
    }

    if (evt.detail.state == 'replay') {
      this.el.sceneEl.emit('breath-capture-end');
      this.el.sceneEl.emit('breath-capture-start');
      return;
    }

    this.paused = evt.detail.state == 'pause'

    if (this.paused) {
      // Stop calibration and reset calibration state to beginning since pausing in the middle of calibration
      // is bad or pause timer
      switch (this.calibrationObj.calibrationState) {
        case CALIBRATION_STATES.FINDING_BREATH_IN_POSITION:
          break;
        case CALIBRATION_STATES.FINDING_BREATH_OUT_POSITION:
          if (this.calibrationTimeout) this.calibrationTimeout.pause();
          break;
        case CALIBRATION_STATES.CALIBRATION_COMPLETE:
          if (this.waitBreathExercise2Audio) this.waitBreathExercise2Audio.pause();
          break;
        case CALIBRATION_STATES.AUDIO2_COMPLETE_PLAYING:
          if (this.meditationCompleteTimeout) this.meditationCompleteTimeout.pause();
          break;
      }
    } else {
      switch (this.calibrationObj.calibrationState) {
        case CALIBRATION_STATES.FINDING_BREATH_IN_POSITION:
          this.onToggleBreathCalibrationStart();
          break;
        case CALIBRATION_STATES.FINDING_BREATH_OUT_POSITION:
          if (this.calibrationTimeout) this.calibrationTimeout.resume();
          break;
        case CALIBRATION_STATES.CALIBRATION_COMPLETE:
          if (this.waitBreathExercise2Audio) this.waitBreathExercise2Audio.resume();
          break;
        case CALIBRATION_STATES.AUDIO2_COMPLETE_PLAYING:
          if (this.meditationCompleteTimeout) this.meditationCompleteTimeout.resume();
          break;
      }
    }
  },

  onMenuItemDeselected: function () {
    if (this.meditating) {
      this.el.sceneEl.emit('breath-capture-end');
      this.onBreathCaptureEnd();
    }
  },

  onControllerConnected: function () { this.controllerConnected = true; },

  onControllerDisconnected: function () { this.controllerConnected = false; },

  // Helper functions

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

  displacement: function (v1, v2) {
    return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2) + Math.pow(v1.z - v2.z, 2));
  },

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
      `[breath-capture] ${string}`,
      ...etc
    );
    console.trace(); // hidden in collapsed group
    console.groupEnd();
  }
});
