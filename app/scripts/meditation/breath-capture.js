// TODO clean this up and add feedback mechanism

console.log('ml5 version', ml5.version)

const CALIBRATION_TIME = 3;

/**
 * Connect this component to a hand with hand-controls component
 */
AFRAME.registerComponent('breath-capture', {
    dependencies: ['hand-controls'],

    init: function () {
        let el = this.el;

        // State variables
        this.meditating = false;
        this.controllerConnected = false;

        // Breath capture-related variables
        this.deltaTime = 0;
        this.previousTime = 0;
        this.deltaPosition = null;
        this.previousPosition = null;
        this.targetVector = new THREE.Vector3();
        this.displacement = 0;
        this.displacementArr = [];
        this.deltaPositionArr = [];
        this.shortMovingDisplacement = 0;
        this.longMovingDisplacement = 0;

        this.calibrationObj = {
            breathInPositionFound: false,
            breathOutPositionFound: false,
            breathInPosition: null,
            breathOutPosition: null,
            maxDisplacementFromBreathInPosition: 0,
            maxDisplacementIndex: 0,
            positionArr: [],
            displacementArr: [],
            startTime: 0
        };

        // Bound functions
        this.startBreathCapture = this.startBreathCapture.bind(this);
        this.stopBreathCapture = this.stopBreathCapture.bind(this);
        this.onControllerConnected = this.onControllerConnected.bind(this);
        this.onControllerDisconnected = this.onControllerDisconnected.bind(this);

        el.addEventListener('meditation-start', this.startBreathCapture);
        el.addEventListener('meditation-end', this.stopBreathCapture);
        el.addEventListener('controllerconnected', this.onControllerConnected);
        el.addEventListener('controllerdisconnected', this.onControllerDisconnected);

        // TODO remove this when integrated, just for testing
        el.addEventListener('xbuttondown', evt => {
            el.emit('meditation-start');
        });
        el.addEventListener('xbuttonup', evt => {
            el.emit('meditation-end');
        })
    },

    remove: function () {
        el.removeEventListener('meditation-start', this.startBreathCapture);
        el.removeEventListener('meditation-end', this.stopBreathCapture);
        el.removeEventListener('controllerconnected', this.onControllerConnected);
        el.removeEventListener('controllerdisconnected', this.onControllerDisconnected);
    },

    tick: function () {
        let el = this.el;

        if (this.controllerConnected && this.meditating) {
            // TODO Assume target vector is (0, 1, 0) (only look at change in position in y direction)

            if (!this.calibrationObj.breathOutPositionFound) {
                // The user must place the controller on their belly, breathe in all the way, press the y button
                // and breath all the way. This gives us a bunch of positions that we can do linear regression to
                // find a best fit line. Then when we are computing the displacement during operation, we use the
                // best fit line as the target vector and only consider displacements in this direction
                // 
                // Note that direction is important to us because we need to know when they are breathing in vs. 
                // when they are breathing out.

                let worldMatrix = el.object3D.matrixWorld;
                let position = new THREE.Vector3();
                let rotation = new THREE.Quaternion();
                let scale = new THREE.Vector3();
                worldMatrix.decompose(position, rotation, scale);

                // Assume initially we are breathing in, so this starting position is breathInPosition
                if (!this.calibrationObj.breathInPositionFound) {
                    this.calibrationObj.breathInPosition = position;
                    this.calibrationObj.breathInPositionFound = true;
                    this.calibrationObj.startTime = Date.now() / 1000;
                } else {
                    // Each time we get a new position compute its displacement from the breathInPosition.
                    let dx = this.calibrationObj.breathInPosition.x - position.x;
                    let dy = this.calibrationObj.breathInPosition.y - position.y;
                    let dz = this.calibrationObj.breathInPosition.z - position.z;

                    let displacement = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    this.calibrationObj.displacementArr.push(displacement);
                    this.calibrationObj.positionArr.push(position);

                    if (this.calibrationObj.maxDisplacementFromBreathInPosition < displacement) {
                        this.calibrationObj.maxDisplacementFromBreathInPosition = displacement;
                        this.calibrationObj.maxDisplacementIndex = this.calibrationObj.displacementArr.length - 1;
                    }

                    // After some time for calibration has passed, find the largest displacement and use this to
                    // find the target vector.
                    if (Date.now() / 1000 - this.calibrationObj.startTime > CALIBRATION_TIME) {
                        this.calibrationObj.breathOutPosition = this.calibrationObj.positionArr[this.calibrationObj.maxDisplacementIndex];
                        this.calibrationObj.breathOutPositionFound = true;
                        this.targetVector.subVectors(this.calibrationObj.breathInPosition, this.calibrationObj.breathOutPosition).normalize();

                        this.log(
                            'breathing calibrated, breathInPosition',
                            this.calibrationObj.breathInPosition,
                            'breath out position',
                            this.calibrationObj.breathOutPosition,
                            'maxDisplacementFromBreathInPosition',
                            this.calibrationObj.maxDisplacementFromBreathInPosition);
                    }
                }
            } else {
                let worldMatrix = el.object3D.matrixWorld;
                let position = new THREE.Vector3();
                let rotation = new THREE.Quaternion();
                let scale = new THREE.Vector3();
                worldMatrix.decompose(position, rotation, scale);

                this.deltaPosition = new THREE.Vector3(
                    position.x - this.previousPosition.x,
                    position.y - this.previousPosition.y,
                    position.z - this.previousPosition.z);
                this.previousPosition = position;

                
                this.displacement += this.deltaPosition.y * this.deltaTime;//TODO unhardcode
                this.deltaPositionArr.push(this.deltaPosition.y);

                this.displacementArr.push(this.displacement);

                if (this.displacementArr.length == 10) {
                    // Calculate average
                    let avg = 0;
                    let avgDelta = 0;
                    for (let i = 0; i < this.displacementArr.length; i++) {
                        avg += this.displacementArr[i];
                        avgDelta += this.displacementArr[i];
                    }
                    avg /= this.displacementArr.length;
                    avgDelta /= this.deltaPositionArr.length;
                    this.log('avg', avg);
                    this.log('avgDelta', avgDelta);
                    this.displacementArr = [];
                    this.deltaPositionArr = [];
                }

                let currTime = Date.now() / 1000;
                this.deltaTime = currTime - this.previousTime;
                this.previousTime = currTime;
            }
        }
    },

    startBreathCapture: function () {
        let el = this.el;

        this.meditating = true;

        let worldMatrix = el.object3D.matrixWorld;
        let position = new THREE.Vector3();
        let rotation = new THREE.Quaternion();
        let scale = new THREE.Vector3();
        worldMatrix.decompose(position, rotation, scale);

        this.previousPosition = position;
        this.previousTime = Date.now() / 1000;

        this.displacement = 0;
        this.displacementArr = [];
        this.shortMovingDisplacement = 0;
        this.longMovingDisplacement = 0;

        this.calibrationObj = {
            breathInPositionFound: false,
            breathOutPositionFound: false,
            breathInPosition: null,
            breathOutPosition: null,
            maxDisplacementFromBreathInPosition: 0,
            maxDisplacementIndex: 0,
            positionArr: [],
            displacementArr: [],
            startTime: 0
        };
    },

    stopBreathCapture: function () { this.meditating = false; },

    onControllerConnected: function () { this.controllerConnected = true; },

    onControllerDisconnected: function () { this.controllerConnected = false; },

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
