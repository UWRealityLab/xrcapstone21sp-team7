/* global AFRAME, Croquet, Q, THREE */

function humanize(str) {
    let frags = str.split('-');
    let i = 0;
    for (i = 0; i < frags.length; i++) {
        frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
    }
    return frags.join(' ');
}

/**
 * Controller used for placing assets in a scene.
 *
 * Modified from https://github.com/kfarr/aframe-city-builder/ for use with the Oculus
 * Quest 2 with this project's asset framework.
 */
AFRAME.registerComponent('garden-controls', {
    /**
     * hand-controls for user button interactions, raycaster used for object placement.
     */
    dependencies: ['hand-controls', 'raycaster'],

    /**
     * menuId: The entity that contains a optgroups of items to be cycled through.
     * previewItemId: The entity that contains a preview of the object that will be placed
     * that the garden-builder component 'owns'.
     * gardenBaseId: The entity that contains the base-garden component.
     * newAssetId: The entity in which newly created garden elements will be placed.
     */
    schema: {
        menuId: { type: 'string', default: 'menu' },
        previewItemId: { type: 'string', default: 'preview' },
        gardenBaseId: { type: 'string', default: 'garden' },
        newAssetContainerId: { type: 'string', default: 'new-asset-container' }
    },

    log: function (string, ...etc) {
        if (!Q.LOGGING.GardenControls) {
            return;
        }

        console.groupCollapsed(`[Component] ${string}`, ...etc);
        console.trace(); // hidden in collapsed group
        console.groupEnd();
    },

    /**
     * Add event listeners.
     */
    addEventListeners: function () {
        // The main hand-controls interactions are handled by this component
        let el = this.el;
        el.addEventListener('gripup', this.handReleased.bind(this));
        el.addEventListener('gripdown', this.handSqueezed.bind(this));
        el.addEventListener('xbuttondown', this.onUndo.bind(this));
        el.addEventListener('triggerdown', this.rotateItem.bind(this));
        el.addEventListener('triggerup', this.stopRotatingItem.bind(this));

        // The rest of the controls are handled by the menu element
        let menuEl = document.getElementById(this.data.menuId);
        menuEl.addEventListener('menuChanged', this.onObjectChange.bind(this));
        menuEl.addEventListener('menuSelected', this.onPlaceObject.bind(this));
    },

    /**
     * Remove event listeners.
     */
    removeEventListeners: function () {
        let el = this.el;
        el.removeEventListener('gripup', this.handReleased);
        el.removeEventListener('gripdown', this.handSqueezed);
        el.removeEventListener('xbuttondown', this.onUndo);
        el.removeEventListener('triggerdown', this.rotateItem);
        el.removeEventListener('triggerup', this.stopRotatingItem);

        let menuEl = document.getElementById(this.data.menuId);
        menuEl.removeEventListener('menuChanged', this.onObjectChange);
        menuEl.removeEventListener('menuSelected', this.onPlaceObject);
    },

    init: function () {
        this.log.bind(this);
      
        this.log('hello world');

        // get the list of object group json directories - which json files should we read?
        // for each group, fetch the json file and populate the optgroup and option elements as children of the appropriate menu element
        let list = ['plants', 'rocks'];

        let groupJSONArray = [];
        const menuId = this.data.menuId;
        this.log('garden-controls menuId: ' + menuId);

        let log = this.log;

        // TODO: wrap this in promise and then request aframe-select-bar component to re-init when done loading
        list.forEach(function (groupName, index) {
            // excellent reference: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON
            let requestURL = `${Q.GARDEN_BUILDER.AssetsDir}${groupName}.json`;
            let request = new XMLHttpRequest();
            request.open('GET', requestURL);
            request.responseType = 'json';
            request.send();

            request.onload = function () {  // for each grouplist json file when loaded
                groupJSONArray[groupName] = request.response;
                log(groupJSONArray[groupName]);
                log('groupName: ' + groupName);

                // find the optgroup parent element - the menu option?
                let menuEl = document.getElementById(menuId);

                // add the parent optgroup node like: <optgroup label="Aliens" value="mmmm_alien">
                let newOptgroupEl = document.createElement('optgroup');
                newOptgroupEl.setAttribute('label', humanize(groupName)); // TODO: this should be a prettier label, not the filename
                newOptgroupEl.setAttribute('value', groupName);

                // create each child
                let optionsHTML = '';
                groupJSONArray[groupName].forEach(function (objectDefinition, index) {
                    log(objectDefinition['file']);
                    log(objectDefinition);
                    optionsHTML += `<option value="${objectDefinition['file']}" src="${Q.GARDEN_BUILDER.AssetsDir}img/${objectDefinition['file']}.png">${humanize(objectDefinition['file'])}</option>`
                });

                newOptgroupEl.innerHTML = optionsHTML;
                // TODO: BAD WORKAROUND TO NOT RELOAD TREES since it's defined in HTML. Instead, no objects should be listed in HTML. This should use a promise and then init the select-bar component once all objects are listed.
                if (groupName == 'plants') {
                    // do nothing - don't append this to the DOM because one is already there
                } else {
                    menuEl.appendChild(newOptgroupEl);
                }
            }
        });

        this.groupJSONArray = groupJSONArray;

        this.thisItemEl = document.getElementById(this.data.previewItemId);
        this.thisItemEl.setAttribute('visible', 'false');

        this.el.setAttribute('raycaster', 'enabled', false);
        this.el.setAttribute('raycaster', 'showLine', false);

        // Function to be called in tick to rotate the item
        this.rotating = false;

        this.updateItemRotaton = AFRAME.utils.throttle(() => {
            if (this.thisItemEl.getAttribute('visible')) {
                if (this.rotating) {
                    this.thisItemEl.object3D.rotation.y = (this.thisItemEl.object3D.rotation.y + Q.GARDEN_BUILDER.RotationSpeedModifier * Math.PI / 180.0) % (2 * Math.PI);
                    this.previewEl.object3D.rotation.y = this.thisItemEl.object3D.rotation.y;
                }
            }
            },
            1000 / 24,
            this);

        this.previewEl = document.createElement('a-entity');
        this.previewEl.setAttribute('gltf-model', this.thisItemEl.getAttribute('gltf-model'));
        this.previewEl.setAttribute('visible', 'false');
        this.previewEl.setAttribute('position', '0 0 0');
        this.el.sceneEl.appendChild(this.previewEl);

        this.updatePreviewItem = AFRAME.utils.throttle(() => {
            if (this.thisItemEl.getAttribute('visible')) {
                let gardenEl = document.getElementById(this.data.gardenBaseId);
                let intersectionPoint = gardenEl.components['base-garden'].data.intersectedPoint;
                if (intersectionPoint) {
                    // Update position of model based on intersection point with ground
                    this.previewEl.object3D.position.x = intersectionPoint.x;
                    this.previewEl.object3D.position.z = intersectionPoint.z;
                    if (!this.previewEl.getAttribute('visible')) {
                        this.previewEl.setAttribute('visible', 'true');
                    }
                } else {
                    this.previewEl.setAttribute('visible', 'false');
                }
            }
            },
            1000 / 24,
            this);
    },

    /**
     * Called when entity resumes.
     * Use to continue or add any dynamic or background behavior such as events.
     */
    play: function () {
        this.addEventListeners();
    },

    /**
     * Called when entity pauses.
     * Use to stop or remove any dynamic or background behavior such as events.
     */
    pause: function () {
        this.removeEventListeners();
    },

    /**
     * Called when a component is removed (e.g., via removeAttribute).
     * Generally undoes all modifications to the entity.
     */
    remove: function () {
        this.removeEventListeners();
    },

    /**
     * Spawns the currently selected object at the controller location when trigger pressed
     */
    onPlaceObject: function () {
        // Check to see if builder preview item is visible (if it is we can place items)
        let thisItemEl = document.getElementById(this.data.previewItemId);
        if (thisItemEl.getAttribute('visible') == false) {
            return;
        }

        // Check to see if the user's raycaster is pointing on a valid position,
        // this position will be used for placement
        let gardenEl = document.getElementById(this.data.gardenBaseId);
        let intersectionPoint = gardenEl.components['base-garden'].data.intersectedPoint;
        if (!intersectionPoint) {
            return;
        }

        // Which object should be placed here? This ID is 'stored' in the DOM element of the current Item
        let objectId = parseInt(thisItemEl.attributes.objectId.value);

        // What's the type of object? For example, 'plants'
        let objectGroup = thisItemEl.attributes.objectGroup.value;

        // Get an Array of all the objects of this type
        let objectArray = this.groupJSONArray[objectGroup];

        // let thisItemWorldRotation = thisItemEl.object3D.getWorldRotation();
        let position = intersectionPoint.x + ' ' + 0 + ' ' + intersectionPoint.z;

        let rotationStr = '0 ' + (this.thisItemEl.object3D.rotation.y * 180 / Math.PI) + ' 0';

        // NEW https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
        let newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8; return v.toString(16);
        });

        let newEntity = document.createElement('a-entity');
        newEntity.setAttribute('id', newId);
        newEntity.setAttribute('class', 'movable-plants');
        newEntity.setAttribute('croquet', 'name: ' + newId);
        newEntity.setAttribute('scale', objectArray[objectId].actualScale);
        newEntity.setAttribute('rotation', rotation);
        newEntity.setAttribute('gltf-model', `${Q.GARDEN_BUILDER.GardenAssetLocation}${objectArray[objectId].file}.glb`);
        newEntity.setAttribute('position', position);
        newEntity.setAttribute('shadow', 'receive: false; cast: true');

        this.log('adding item with ID = ' + newId, newEntity);
        // Place entity as a child of the floor
        document.getElementById(this.data.newAssetContainerId).appendChild(newEntity);
    },

    /**
     * The y component of the joystick is used to rotate the preview item.
     */
    onJoystickChanged: function (evt) {
        // Ignore if not the came controller
        if (evt.target.id != this.el.id) {
            return;
        }

        let thisItemEl = document.getElementById(this.data.previewItemId);
        if (thisItemEl.getAttribute('visible') == false) {
            return;
        }

        let rotateY = Q.GARDEN_BUILDER.RotationSpeedModifier * evt.detail.y;
        let rotation = thisItemEl.getAttribute('rotation');
        rotation.y += rotateY;
        thisItemEl.setAttribute('rotation', rotation);
    },
  
    rotateItem: function(evt) {
        // Ignore if not the came controller
        if (evt.target.id != this.el.id) {
            return;
        }

        // Ignore if invisible
        let thisItemEl = document.getElementById(this.data.previewItemId);
        if (thisItemEl.getAttribute('visible') == false) {
            return;
        }
      
        this.rotating = true;
    },
  
    stopRotatingItem: function(evt) {
        // Ignore if not the came controller
        if (evt.target.id != this.el.id) {
            return;
        }
      
        // Ignore if invisible
        let thisItemEl = document.getElementById(this.data.previewItemId);
        if (thisItemEl.getAttribute('visible') == false) {
            return;
        }
      
        this.rotating = false;
    },
  
    tick: function() {
        this.updateItemRotaton();
        this.updatePreviewItem();
    },

    /**
     * Squeezing hand indicates the preview asset should be visible.
     */
    handSqueezed: function (evt) {
        // Ignore hand events from different controller
        if (evt.target.id != this.el.id) {
            return;
        }

        let thisItemEl = document.getElementById(this.data.previewItemId);
        thisItemEl.setAttribute('visible', 'true');

        // Show the raycaster
        this.log('enabling raycaster');
        this.el.setAttribute('raycaster', 'enabled', true);
      
        let gardenEl = document.getElementById(this.data.gardenBaseId);
        let intersectionPoint = gardenEl.components['base-garden'].data.intersectedPoint;
        if (intersectionPoint) {
            this.previewEl.setAttribute('visible', 'true');
            this.previewEl.object3D.position.x = intersectionPoint.x;
            this.previewEl.object3D.position.z = intersectionPoint.z;
        }
    },

    /**
     * Releasing hand indicates the preview asset should be hidden.
     */
    handReleased: function (evt) {
        // Ignore hand events from different controller
        if (evt.target.id != this.el.id) {
            return;
        }

        let thisItemEl = document.getElementById(this.data.previewItemId);
        thisItemEl.setAttribute('visible', 'false');

        // Hide the raycaster (not necessary to show when items can't be placed)
        this.el.setAttribute('raycaster', 'enabled', false);
      
        this.previewEl.setAttribute('visible', 'false');
    },

    /**
     * Updates the preview item.
     */
    onObjectChange: function () {
        this.log('onObjectChange triggered');

        // Fetch the preview and menu elements
        let thisItemEl = document.getElementById(this.data.previewItemId);
        let menuEl = document.getElementById(this.data.menuId);

        // What's the type of object currently selected? For example, 'plants'
        let objectGroup = menuEl.components['select-bar'].selectedOptgroupValue;

        // Get an Array of all the objects of this type
        let objectArray = this.groupJSONArray[objectGroup];

        // What is the ID of the currently selected item? An index into the objectArray
        let newObjectId = parseInt(menuEl.components['select-bar'].selectedOptionIndex);

        // Set the preview object to be the currently selected 'preview' item
        thisItemEl.setAttribute('gltf-model', `${Q.GARDEN_BUILDER.GardenAssetLocation}${objectArray[newObjectId].file}.glb`);
        thisItemEl.setAttribute('scale', objectArray[newObjectId].replicaScale);
        thisItemEl.setAttribute('position', objectArray[newObjectId].replicaPosition);
        thisItemEl.setAttribute('objectId', newObjectId);
        thisItemEl.setAttribute('objectGroup', objectGroup);
        thisItemEl.flushToDOM();
      
        this.previewEl.setAttribute('gltf-model', `${Q.GARDEN_BUILDER.GardenAssetLocation}${objectArray[newObjectId].file}.glb`);
        this.previewEl.setAttribute('scale', objectArray[newObjectId].actualScale);
    },

    /**
     * Undo - deletes the most recently placed object
     */
    onUndo: function () {
        // Check to see if builder is visible (meaning we can remove items)
        let thisItemEl = document.getElementById(this.data.previewItemId);
        if (thisItemEl.getAttribute('visible') == false) {
            return;
        }

        let newAssetContainer = document.getElementById(this.data.newAssetContainerId);
        if (newAssetContainer.childElementCount > 0) {
            // Find and remove the last element
            let elementToRemove = newAssetContainer.children[newAssetContainer.childElementCount - 1];
            elementToRemove.parentNode.removeChild(elementToRemove);
        }
    }
});
