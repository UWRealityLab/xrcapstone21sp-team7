/* global Croquet, AFRAME */

class UserView extends Croquet.View {
    constructor(model) {
        super(model);
        // The user-model is associated with this view, you can access stuff in the model this way
        this.model = model;

        this.log(`Creating User View with userViewId "${this.userViewId}"`);

        // grabing the <a-scene /> so we can add/remove our user <a-entity />
        this.scene = AFRAME.scenes[0];

        this.eventListeners = [];

        // check if this user represents you or a remote user. If it's you there's no need to create a User entity, and we'll focus on publishing our camera matrix to our User Model
        this.log("Checking if this UserView represents you or a remote user");
        if (this.isMyUser) {
            // create actual user hands in our scene
            let handEntity = document
                .getElementById("user-hands")
                .content.cloneNode(true);

            this.leftHand = handEntity.querySelector(".left");
            this.leftHand.setAttribute("color", "#ff0000");
            this.lastTimeLeftHandUpdated = 0;
            this.log("Remote User Left Hand Entity Created", this.leftHand);
            this.scene.appendChild(this.leftHand);

            this.rightHand = handEntity.querySelector('.right');
            this.rightHand.setAttribute('color', '#00ff00');
            this.lastTimeLeftHandUpdated = 0;
            this.log('Remote User Right Hand Entity Created', this.rightHand);
            this.scene.appendChild(this.rightHand);

            this.log("This UserView represents you. Adding a throttled function to publish our camera matrix to the UserModel");
            this.publishCameraMatrix = AFRAME.utils.throttle(
                () => {
                    const hasCameraMovedSinceLastModelMatrixUpdate = this.camera.matrixWorld.elements.every((value, index) => value === this.model.matrix.elements[index]);
                    if (!hasCameraMovedSinceLastModelMatrixUpdate) {
                        this.publish(this.viewId, "set-matrix", this.camera.matrixWorld);
                    }
                },
                1000 / 24,
                this
            );
            this.publishLeftHandMatrix = AFRAME.utils.throttle(
                () => {
                    if (!this.leftHand || !this.leftHand.object3D || !this.leftHand.object3D.matrixWorld) return;

                    const moved = this.leftHand.object3D.matrixWorld.elements.every((value, index) => value === this.model.leftHandMatrix.elements[index]);
                    if (!moved) {
                        this.publish(this.viewId, "set-left-hand-matrix", this.leftHand.object3D.matrixWorld);
                    }
                },
                1000 / 24,
                this
            );
            this.publishRightHandMatrix = AFRAME.utils.throttle(
                () => {
                    if (!this.rightHand || !this.rightHand.object3D || !this.rightHand.object3D.matrixWorld) return;

                    const moved = this.rightHand.object3D.matrixWorld.elements.every((value, index) => value === this.model.rightHandMatrix.elements[index]);
                    if (!moved) {
                        this.publish(this.viewId, "set-right-hand-matrix", this.rightHand.object3D.matrixWorld);
                    }
                },
                1000 / 24,
                this
            )
        } else {
            this.log("This UserView represents a remote user. Creating a User Entity");
            // cloning the user template in our scene to create a user entity
            this.entity = document
                .getElementById("user-template")
                .content.cloneNode(true)
                .querySelector(".user");
            this.head = this.entity.querySelector(".head")
            this.head.setAttribute("color", this.color);
            this.subscribe(this.userViewId, "update-color", this.updateColor);
            this.lastTimeMatrixWasUpdated = 0;
            this.log("Remote User Entity Created", this.entity);
            this.addEventListener(this.head, "componentchanged", this.onHeadComponentChanged);
            this.entity.addEventListener(
                "loaded",
                event => {
                    this.log("Remote User Entity loaded", this.entity);
                    // We want to manually update the matrix in our "update" method
                    this.entity.object3D.matrixAutoUpdate = false;
                },
                { once: true }
            );
            this.log("Adding remote user entity to the scene");
            this.scene.appendChild(this.entity);

            // create fake user hands in our scene if this user view is not the actual user
            let handEntity = document
                .getElementById("user-hands-fake")
                .content.cloneNode(true)
                .querySelector(".user");

            this.leftHand = handEntity.querySelector(".left");
            this.leftHand.setAttribute("color", "#ff0000");
            this.lastTimeLeftHandUpdated = 0;
            this.log("Remote User Left Hand Entity Created", this.leftHand);
            this.leftHand.addEventListener(
                "loaded",
                event => {
                    this.log("Remote User Left Hand Entity Loaded", this.leftHand);
                    // We want to manually update the matrix in our "update" method
                    this.leftHand.object3D.matrixAutoUpdate = false;
                },
                { once: true }
            );
            this.log("Adding remote left hand user entity to the scene");
            this.scene.appendChild(this.leftHand);

            this.rightHand = handEntity.querySelector('.right');
            this.rightHand.setAttribute('color', '#00ff00');
            this.lastTimeRightHandUpdated = 0;
            this.log('Remote User Right Hand Entity Created', this.rightHand);
            this.rightHand.addEventListener(
                'loaded',
                event => {
                    this.log('Remote User Right Hand Entity Loaded', this.rightHand);
                    this.rightHand.object3D.matrixAutoUpdate = false;
                },
                { once: true }
            )
            this.log('Adding remote right hand user entity to the scene');
            this.scene.appendChild(this.rightHand);
        }
    }

    log(string, ...etc) {
        if (!Q.LOGGING.UserView) return;

        console.groupCollapsed(
            `[UserView-${this.userViewId}${this.isMyUser ? " (YOU)" : ""}] ${string}`,
            ...etc
        );
        console.trace(); // hidden in collapsed group
        console.groupEnd();
    }

    onHeadComponentChanged(event) {
        const componentName = event.detail.name;
        this.log(`"${componentName}" changed for head`);
        switch (componentName) {
            case "material":
                const { color } = this.head.components.material.data;
                this.setColor(color);
                break;
        }
    }

    onLeftHandComponentChanged(event) {
        const componentName = event.detail.name;
        this.log(`"${componentName}" changed for left hand`);
    }

    onRightHandComponentChanged(event) {
        const componentName = event.detail.name;
        this.log(`"${componentName}" changed for right hand`);
    }

    // Helper for adding/removing eventlisteners to entities that automatically get removed when detaching from the session
    addEventListener(target, type, listener, options) {
        this.log(`Adding "${type}" eventlistener`, target);

        const boundListener = listener.bind(this);
        target.addEventListener(type, boundListener, options);
        this.eventListeners.push({ target, type, listener, boundListener });
    }
    removeEventListener(_target, _type, _listener) {
        const eventListenerObject = this.eventListeners.find(
            ({ target, type, listener }) => {
                return target === target && type === _type && listener === _listener;
            }
        );
        if (eventListenerObject) {
            const { target, type, boundListener } = eventListenerObject;
            this.log(`Removing "${type}" eventlistener`, target);
            target.removeEventListener(type, boundListener);

            const index = this.eventListeners.indexOf(eventListenerObject);
            this.eventListeners.splice(index, 1);
        }
    }
    // Removing all eventlisteners created so when we rejoin the session we won't trigger eventlisteners added in the previous session
    removeAllEventListeners() {
        this.eventListeners.forEach(({ target, type, boundListener }) => {
            this.log(`Removing "${type}" eventlistener`, target);
            target.removeEventListener(type, boundListener);
        });
        this.eventListeners.length = 0;
    }

    setColor(color) {
        if (this.isAColor(color) && color !== this.model.color) {
            this.log(`Setting color of user "${this.userViewId}"`)
            this.publish(this.userViewId, "set-color", color);
        }
    }

    isAColor(color) {
        if (!this._styleUsedForTestingColor) {
            this._styleUsedForTestingColor = (new Option()).style;
        }
        const style = this._styleUsedForTestingColor;
        style.color = "";
        style.color = color;
        return (style.color.length > 0);
    }

    updateColor() {
        this.log(`Changing color to ${this.color}`)
        this.head.setAttribute("color", this.color);
    }

    // SCENE GETTERS
    get camera() {
        return this.scene.camera;
    }

    // MODEL GETTERS
    get userViewId() {
        return this.model.userViewId;
    }
    get color() {
        return this.model.color;
    }
    get matrix() {
        return this.model.matrix;
    }
    get leftHandMatrix() {
        return this.model.leftHandMatrix;
    }
    get rightHandMatrix() {
        return this.model.rightHandMatrix;
    }
    get lastTimeMatrixWasSet() {
        return this.model.lastTimeMatrixWasSet;
    }
    get lastTimeLeftHandSet() {
        return this.model.lastTimeLeftHandSet;
    }
    get lastTimeRightHandSet() {
        return this.model.lastTimeRightHandSet;
    }

    // useful to determine whether to create an entity or not
    get isMyUser() {
        return this.userViewId === this.viewId;
    }

    update() {
        if (this.isMyUser) {
            // If this is the user, publish some stuff
            this.publishCameraMatrix();
            this.publishLeftHandMatrix();
            this.publishRightHandMatrix();
        } else {
            // otherwise, check if the remote user has moved since last time we updated their matrix
            // from the model
            if (
                this.entity &&
                this.entity.hasLoaded &&
                this.lastTimeMatrixWasSet > this.lastTimeMatrixWasUpdated
            ) {
                this.entity.object3D.matrix.copy(this.matrix);
                this.entity.object3D.matrixWorldNeedsUpdate = true;
                this.lastTimeMatrixWasUpdated = this.lastTimeMatrixWasSet;
            }

            if (
                this.leftHand &&
                this.leftHand.hasLoaded &&
                this.leftHand.object3D &&
                this.lastTimeLeftHandSet > this.lastTimeLeftHandUpdated
            ) {
                this.leftHand.object3D.matrix.copy(this.leftHandMatrix);
                this.leftHand.object3D.matrixWorldNeedsUpdate = true;
                this.lastTimeLeftHandUpdated = this.lastTimeLeftHandSet;
            }

            if (
                this.rightHand &&
                this.rightHand.hasLoaded &&
                this.rightHand.object3D &&
                this.lastTimeRightHandSet > this.lastTimeRightHandUpdated
            ) {
                this.rightHand.object3D.matrix.copy(this.rightHandMatrix);
                this.rightHand.object3D.matrixWorldNeedsUpdate = true;
                this.lastTimeRightHandUpdated = this.lastTimeRightHandSet;
            }
        }
    }

    detach() {
        super.detach();

        this.log(`detaching user`);

        this.removeAllEventListeners();

        // we only create user <a-entity> for other users, so we can't remove an entity if there isn't one
        if (!this.isMyUser && this.entity) {
            this.log(`removing user entity from our scene`);
            this.entity.remove();
        }

        this.log(`removing user hand entity from our scene`);
        this.leftHand.remove();
        this.rightHand.remove();
    }
}

export default UserView;
