/* global Croquet, THREE, Q */

class UserModel extends Croquet.Model {
    init({ userViewId }) {
        super.init();

        this.userViewId = userViewId;

        this.log(`Creating User Model with userViewId "${userViewId}"`);

        this.color = "#";
        // generating a random string of 6 hex values for our color (RRGGBB)
        for (let colorIndex = 0; colorIndex < 6; colorIndex++) {
            this.color += Math.floor(this.random() * 16).toString(16);
        }
        this.log(`Created a random color ${this.color} for our user`);
        this.subscribe(this.userViewId, "set-color", this.setColor);

        // Head-specific information
        this.matrix = new THREE.Matrix4();
        this.position = new THREE.Vector3();
        this.quaternion = new THREE.Quaternion();
        this.scale = new THREE.Vector3();
        this.matrix.decompose(this.position, this.quaternion, this.scale);
        this.subscribe(this.userViewId, "set-matrix", this.setMatrix);
        this.lastTimeMatrixWasSet = this.now();

        // Left hand-related matricies 
        this.leftHandMatrix = new THREE.Matrix4();
        this.leftHandPosition = new THREE.Vector3();
        this.leftHandQuaternion = new THREE.Quaternion();
        this.leftHandScale = new THREE.Vector3();
        this.leftHandMatrix.decompose(this.leftHandPosition, this.leftHandQuaternion, this.leftHandScale);
        this.subscribe(this.userViewId, "set-left-hand-matrix", this.setLeftHandMatrix);
        this.lastTimeLeftHandSet = this.now();

        // Right hand-related matricies
        this.rightHandMatrix = new THREE.Matrix4();
        this.rightHandPosition = new THREE.Vector3();
        this.rightHandQuaternion = new THREE.Quaternion();
        this.rightHandScale = new THREE.Vector3();
        this.rightHandMatrix.decompose(this.rightHandPosition, this.rightHandQuaternion, this.rightHandScale);
        this.subscribe(this.userViewId, "set-right-hand-matrix", this.setRightHandMatrix);
        this.lastTimeRightHandSet = this.now();
    }

    log(string, ...etc) {
        if (!Q.LOGGING.UserModel) return;

        console.groupCollapsed(`[UserModel-${this.userViewId}] ${string}`, ...etc);
        console.trace(); // hidden in collapsed group
        console.groupEnd();
    }

    static types() {
        return {
            "THREE.Matrix4": THREE.Matrix4,
            "THREE.Vector3": THREE.Vector3,
            "THREE.Quaternion": THREE.Quaternion
        };
    }

    setColor(color) {
        this.log(`Changing color to ${color}`)
        this.color = color;
        this.publish(this.userViewId, "update-color");
    }

    setMatrix(matrix) {
        this.matrix.copy(matrix);
        this.matrix.decompose(this.position, this.quaternion, this.scale);
        this.lastTimeMatrixWasSet = this.now();
    }

    setLeftHandMatrix(matrix) {
        this.leftHandMatrix.copy(matrix);
        this.leftHandMatrix.decompose(this.leftHandPosition, this.leftHandQuaternion, this.leftHandScale);
        this.lastTimeLeftHandSet = this.now();
    }

    setRightHandMatrix(matrix) {
        this.rightHandMatrix.copy(matrix);
        this.rightHandMatrix.decompose(this.rightHandPosition, this.rightHandQuaternion, this.rightHandScale);
        this.lastTimeRightHandSet = this.now();
    }

    destroy() {
        this.log("Destroying self");
        super.destroy();
    }
}
UserModel.register("User");

export default UserModel;
