const CALIBRATION_TIME = 3;
const DELTA_SAMPLES_TO_AVG = 6;
// Any displacement below this amount (in meters) is not considered to be
// the user breathing in or out
const DISPLACEMENT_DEADZONE = 0.000001;
const DISPLACEMENT_TOO_LARGE = 0.1;

const CALIBRATION_STATES = {
  FINDING_BREATH_IN_POSITION: 0,
  FINDING_BREATH_OUT_POSITION: 1,
  CALIBRATION_COMPLETE: 2
}

const MEDITATION_TIME = 120;

/**
 * Connect this component to a hand with hand-controls component
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

    el.sceneEl.addEventListener('breath-capture-start', this.startBreathCapture);
    el.sceneEl.addEventListener('breath-capture-end', this.stopBreathCapture);
    el.addEventListener('controllerconnected', this.onControllerConnected);
    el.addEventListener('controllerdisconnected', this.onControllerDisconnected);
    el.addEventListener('xbuttondown', this.onCaptureBreathInPosition);
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
      if (this.calibrationObj.calibrationState != CALIBRATION_STATES.CALIBRATION_COMPLETE) {
        this.runCalibration();
        this.calibrationObj.startTime = time / 1000
      } else {
        if (time - this.calibrationObj.startTime > MEDITATION_TIME) {
          this.onCaptureBreathInPosition();
        } else {
          this.runBreathCapture(timeDelta / 1000);
        }
      }
    }
  },

  runCalibration: function () {
    // The user must place the controller on their belly, breathe in all the way, press the y button
    // and breath all the way. This gives us a bunch of positions that we can do linear regression to
    // find a best fit line. Then when we are computing the displacement during operation, we use the
    // best fit line as the target vector and only consider displacements in this direction
    // 
    // Note that direction is important to us because we need to know when they are breathing in vs. 
    // when they are breathing out.
    let el = this.el;

    let position = new THREE.Vector3();
    let rotation = new THREE.Quaternion();
    let scale = new THREE.Vector3();
    el.object3D.matrixWorld.decompose(position, rotation, scale);

    switch (this.calibrationObj.calibrationState) {
      case CALIBRATION_STATES.FINDING_BREATH_IN_POSITION:
        break;
      case CALIBRATION_STATES.FINDING_BREATH_OUT_POSITION:
        // Each time we get a new position compute its displacement from the breathInPosition.
        let position = this.getControllerPosition();
        let dx = this.calibrationObj.breathInPosition.x - position.x;
        let dy = this.calibrationObj.breathInPosition.y - position.y;
        let dz = this.calibrationObj.breathInPosition.z - position.z;
        let displacement = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Store the displacement and position
        this.calibrationObj.displacementArr.push(displacement);
        this.calibrationObj.positionArr.push(position);

        // Keep track of the max displacement measured
        if (this.calibrationObj.displacementArr[this.calibrationObj.maxDisplacementIndex] < displacement) {
          this.calibrationObj.maxDisplacementIndex = this.calibrationObj.displacementArr.length - 1;
        }

        // After some time for calibration has passed, find the largest
        // displacement and use this to find the target vector.
        if (Date.now() / 1000 - this.calibrationObj.startTime > CALIBRATION_TIME) {
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
    this.log('timedelta: ', timeDelta);

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

    if (this.displacementArr.length < DELTA_SAMPLES_TO_AVG) {
      this.displacementArr.push(deltaPositionProjected * timeDelta);
    } else {
      this.displacementArr.push(deltaPositionProjected * timeDelta);
      this.displacementArr = this.displacementArr.slice(1);
      let deltaPositionAvg = this.avg(this.displacementArr);
      this.el.setAttribute('breath-capture', 'deltaPositionAvg', deltaPositionAvg);
      this.classifyBreathing(deltaPositionAvg);
    }
  },

  // todo do more filtering to reduce false transitions
  classifyBreathing: function (deltaPositionAvg) {
    if (Math.abs(deltaPositionAvg) > DISPLACEMENT_DEADZONE) {
      if (Math.abs(deltaPositionAvg) > DISPLACEMENT_TOO_LARGE) {
        this.breathClassification = 'error: controller moving too much';
      } else if (deltaPositionAvg > 0) {
        if (this.breathClassification != 'breathing in') {
          this.breathClassification = 'breathing in';
          this.el.sceneEl.emit('breathing-in');
        }
      } else {
        if (this.breathClassification != 'breathing out') {
          this.breathClassification = 'breathing out';
          this.el.sceneEl.emit('breathing-out');
        }
      }
    } else {
      this.breathClassification = 'holding breath';
    }
    this.log(this.breathClassification, deltaPositionAvg);
  },

  onCaptureBreathInPosition: function () {
    if (this.meditating) {
      if (this.calibrationObj.calibrationState == CALIBRATION_STATES.FINDING_BREATH_IN_POSITION) {
        let position = this.getControllerPosition();
        this.calibrationObj.breathInPosition = position;
        this.calibrationObj.startTime = Date.now() / 1000;
        this.calibrationObj.calibrationState = CALIBRATION_STATES.FINDING_BREATH_OUT_POSITION;

        let sound = 'on: model-loaded; src: #breath-exercise-meditation-2; autoplay: true; loop: false; positional: false; volume: 1';
        this.el.setAttribute('sound', sound);
      } else {
        // Breath capture finished
        this.el.sceneEl.emit('breath-capture-end');
        let sound = 'on: model-loaded; src: #breath-exercise-meditation-3; autoplay: true; loop: false; positional: false; volume: 1';
        this.el.setAttribute('sound', sound);
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
    this.breathClassification = 'not breathing';

    let sound = 'on: model-loaded; src: #breath-exercise-meditation-1; autoplay: true; loop: false; positional: false; volume: 1';
    this.el.setAttribute('sound', sound);
  },

  stopBreathCapture: function () {
    this.meditating = false;
    this.el.setAttribute('breath-capture', 'deltaPositionAvg', 0);
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
