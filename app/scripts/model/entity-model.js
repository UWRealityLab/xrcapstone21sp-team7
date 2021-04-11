/* global Croquet, AFRAME, THREE, Q */

class EntityModel extends Croquet.Model {
    init({ creatorUserViewId, name, parentName, tagName, components }) {
        super.init();

        this.name = name;
        this.parentName = parentName;
        this.tagName = tagName;

        this.position = new THREE.Vector3();
        this.quaternion = new THREE.Quaternion();
        this.scale = new THREE.Vector3(1, 1, 1);
        this.euler = new THREE.Euler();
        this.matrix = new THREE.Matrix4();

        this.creatorUserViewId = creatorUserViewId;

        this.lastTimeComponentsWereSet = this.now();
        this.lastTimeComponentsWereSetByUser = {}; // {userViewId: timestamp}
        this.subscribe(this.id, "set-components", this.setComponents);
        this.subscribe(this.sessionId, "view-exit", this.onViewExit);

        this.components = {};
        this.setComponents({
            componentDifferences: components,
            userViewId: creatorUserViewId
        });
    }

    log(string, ...etc) {
        if (!Q.LOGGING.EntityModel) return;

        console.groupCollapsed(`[EntityModel-${this.id}] ${string}`, ...etc);
        console.trace(); // hidden in collapsed group
        console.groupEnd();
    }

    static types() {
        return {
            "THREE.Vector3": THREE.Vector3,
            "THREE.Quaternion": THREE.Quaternion,
            "THREE.Euler": THREE.Euler,
            "THREE.Matrix4": THREE.Matrix4
        };
    }

    get mass() {
        return (this.components.croquet && this.components.croquet.mass) || 0;
    }

    get radius() {
        return (this.components.geometry && this.components.geometry.radius) || 1;
    }

    get height() {
        return (this.components.geometry && this.components.geometry.height) || 1;
    }

    get primitive() {
        return (
            (this.components.geometry && this.components.geometry.primitive) || "box"
        );
    }

    setComponents({ componentDifferences, userViewId }) {
        this.log(
            `Received "set-components" event from userViewId "${userViewId}"`,
            componentDifferences
        );

        for (const componentName in componentDifferences) {
            // Check if component exists in the model - if it doesn't we'll assume componentDifferences[componentDifference] is the entire component
            if (componentName in this.components) {
                // check if this.components[componentName] is defined - otherwise we'll assume it was deleted and we'll remove it
                if (componentName in componentDifferences) {
                    // check if componentDifferences[componentDifference] is an object - if so we can use Object.assign rather than just overwrite it
                    if (typeof componentDifferences[componentName] === "object") {
                        // check if the value is not null/undefined
                        if (componentDifferences[componentName]) {
                            // check each property of componentDifferences[propertyName] to see if it's not null - otherwise we'll delete that property
                            for (const propertyName in componentDifferences[componentName]) {
                                if (
                                    typeof componentDifferences[componentName][propertyName] ===
                                    "object"
                                ) {
                                    // may be an object/array or null
                                    if (componentDifferences[componentName][propertyName]) {
                                        this.components[componentName][propertyName] =
                                            componentDifferences[componentName][propertyName];
                                    } else {
                                        delete this.components[componentName][propertyName];
                                    }
                                } else {
                                    this.components[componentName][propertyName] =
                                        componentDifferences[componentName][propertyName];
                                }
                            }
                        } else {
                            delete this.components[componentName];
                        }
                    } else {
                        this.components[componentName] =
                            componentDifferences[componentName];
                    }
                } else {
                    delete this.components[componentName];
                }
            } else {
                if (componentName in componentDifferences) {
                    this.components[componentName] = componentDifferences[componentName];
                }
            }
        }

        // check if position/rotation/scale were changed, update THREE.js position/quaternion/scale/matrix
        let didPositionRotationOrScaleUpdate = false;
        if ("position" in componentDifferences) {
            didPositionRotationOrScaleUpdate = true;

            for (const positionComponentName in componentDifferences.position) {
                this.position[positionComponentName] =
                    componentDifferences.position[positionComponentName];
            }
        }
        if ("rotation" in componentDifferences) {
            didPositionRotationOrScaleUpdate = true;

            for (const rotationComponentName in componentDifferences.rotation) {
                this.euler[rotationComponentName] = THREE.Math.degToRad(
                    componentDifferences.rotation[rotationComponentName]
                );
            }

            this.quaternion.setFromEuler(this.euler);
        }
        if ("scale" in componentDifferences) {
            didPositionRotationOrScaleUpdate = true;

            for (const scaleComponentName in componentDifferences.scale) {
                this.scale[scaleComponentName] =
                    componentDifferences.scale[scaleComponentName];
            }
        }
        if (didPositionRotationOrScaleUpdate) {
            this.matrix.compose(
                this.position,
                this.quaternion,
                this.scale
            );
        }

        this.log("updated components", this.components);
        const now = this.now();
        this.lastTimeComponentsWereSet = now;
        this.lastTimeComponentsWereSetByUser[userViewId] = now;
    }

    onViewExit(userViewId) {
        delete this.lastTimeComponentsWereSetByUser[userViewId];
    }

    destroy() {
        super.destroy();
    }
}
EntityModel.register("Entity");

export default EntityModel;
