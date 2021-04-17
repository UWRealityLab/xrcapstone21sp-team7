
function humanize(str) {
    var frags = str.split('_');
    var i = 0;
    for (i = 0; i < frags.length; i++) {
        frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
    }
    return frags.join(' ');
}

/**
 * Vive Controller Template component for A-Frame.
 * Modifed from A-Frame Dominoes.
 */
AFRAME.registerComponent('builder-controls', {
    schema: {
        menuId: { type: "string", default: "menu" },
    },

    /**
     * Add event listeners.
     */
    addEventListeners: function () {
        var el = this.el;
        el.addEventListener('gripup', this.handReleased.bind(this));
        el.addEventListener('gripdown', this.handSqueezed.bind(this));
        el.addEventListener('xbuttondown', this.onUndo.bind(this));

        // the rest of the controls are handled by the menu element
        var menuEl = document.getElementById(this.data.menuId);
        menuEl.addEventListener('menuChanged', this.onObjectChange.bind(this));
        menuEl.addEventListener('menuSelected', this.onPlaceObject.bind(this));
    },

    /**
     * Remove event listeners.
     */
    removeEventListeners: function () {
        var el = this.el;
        el.removeEventListener('gripup', this.handReleased);
        el.removeEventListener('gripdown', this.handSqueezed);
        el.addEventListener('xbuttondown', this.onUndo);

        var menuEl = document.getElementById(this.data.menuId);
        menuEl.removeEventListener('menuChanged', this.onObjectChange);
        menuEl.removeEventListener('menuSelected', this.onPlaceObject);
    },

    init: function () {
        // get the list of object group json directories - which json files should we read?
        // for each group, fetch the json file and populate the optgroup and option elements as children of the appropriate menu element
        var list = ["plants"];

        var groupJSONArray = [];
        const menuId = this.data.menuId;
        console.log("builder-controls menuId: " + menuId);

        // TODO: wrap this in promise and then request aframe-select-bar component to re-init when done loading
        list.forEach(function (groupName, index) {
            // excellent reference: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON
            var requestURL = '../assets/' + groupName + ".json";
            var request = new XMLHttpRequest();
            request.open('GET', requestURL);
            request.responseType = 'json';
            request.send();

            request.onload = function () { // for each grouplist json file when loaded
                groupJSONArray[groupName] = request.response;
                console.log(groupJSONArray[groupName]);
                // console.log("groupName: " + groupName);

                // find the optgroup parent element - the menu option?
                var menuEl = document.getElementById(menuId);

                // add the parent optgroup node like: <optgroup label="Aliens" value="mmmm_alien">
                var newOptgroupEl = document.createElement("optgroup");
                newOptgroupEl.setAttribute("label", humanize(groupName)); // TODO: this should be a prettier label, not the filename
                newOptgroupEl.setAttribute("value", groupName);

                // create each child
                var optionsHTML = "";
                groupJSONArray[groupName].forEach(function (objectDefinition, index) {
                    // console.log(objectDefinition["file"]);
                    // console.log(objectDefinition);
                    optionsHTML += `<option value="${objectDefinition["file"]}" src="../../assets/img/${objectDefinition["file"]}.png">${humanize(objectDefinition["file"])}</option>`
                });

                newOptgroupEl.innerHTML = optionsHTML;
                // TODO: BAD WORKAROUND TO NOT RELOAD TREES since it's defined in HTML. Instead, no objects should be listed in HTML. This should use a promise and then init the select-bar component once all objects are listed.
                if (groupName == "plants") {
                    // do nothing - don't append this to the DOM because one is already there
                } else {
                    menuEl.appendChild(newOptgroupEl);
                }
            }
        });

        var thisItemID = (this.el.id === 'leftHand') ? '#leftItem' : '#rightItem';
        var thisItemEl = document.querySelector(thisItemID);

        // disable raycaster and hide the selected item
        thisItemEl.setAttribute('visible', 'false');
        this.el.setAttribute('raycaster', 'enabled', false);
        this.el.setAttribute('raycaster', 'showLine', false);

        this.groupJSONArray = groupJSONArray;
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
        // Check to see if builder is visible (meaning we can place items)
        var thisItemID = (this.el.id === 'leftHand') ? '#leftItem' : '#rightItem';
        var thisItemEl = document.querySelector(thisItemID);
        if (thisItemEl.getAttribute('visible') == false) return;

        // Check to see if the user's raycaster is pointing on a valid position, this position will be used for placement
        let gardenEl = document.getElementById('garden');
        let intersectionPoint = gardenEl.components["base-garden"].data.intersectedPoint;
        if (!intersectionPoint) return;

        // Fetch the Item element (the placeable city object) selected on this controller
        var thisItemID = (this.el.id === 'leftHand') ? '#leftItem' : '#rightItem';
        var thisItemEl = document.querySelector(thisItemID);

        // Which object should be placed here? This ID is "stored" in the DOM element of the current Item
        var objectId = parseInt(thisItemEl.attributes.objectId.value);

        // What's the type of object? For example, "mmmm_alien" or "bases"
        var objectGroup = thisItemEl.attributes.objectGroup.value;

        // Get an Array of all the objects of this type
        var objectArray = this.groupJSONArray[objectGroup];

        // var thisItemWorldRotation = thisItemEl.object3D.getWorldRotation();
        var originalPositionString = intersectionPoint.x + ' ' + 0 + ' ' + intersectionPoint.z;

        // NEW https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
        var newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8; return v.toString(16); });
        console.log("newId:" + newId);

        // TODO: replace this with appropiate code to add objects to our zen garden
        let newEntity = document.createElement('a-entity');
        newEntity.setAttribute('id', newId);
        newEntity.setAttribute('class', 'movable-plants');
        newEntity.setAttribute('scale', objectArray[objectId].actualScale);
        // TODO handle rotation
        newEntity.setAttribute('gltf-model', '../assets/glb/' + objectArray[objectId].file + '.glb');
        newEntity.setAttribute('position', originalPositionString);
        newEntity.setAttribute('croquet', 'name: ' + newId);
        newEntity.setAttribute('shadow', 'receive: false; cast: true');

        // Place entity as a child of the floor
        document.getElementById('new-asset-container').appendChild(newEntity);
    },

    handSqueezed: function (evt) {
        if (evt.target.id != this.el.id) {
            return;
        }

        var thisItemID = (this.el.id === 'leftHand') ? '#leftItem' : '#rightItem';
        var thisItemEl = document.querySelector(thisItemID);

        thisItemEl.setAttribute('visible', 'true');

        this.el.setAttribute('raycaster', 'enabled', true);
        this.el.setAttribute('raycaster', 'showLine', true);
    },

    handReleased: function (evt) {
        if (evt.target.id != this.el.id) {
            return;
        }

        var thisItemID = (this.el.id === 'leftHand') ? '#leftItem' : '#rightItem';
        var thisItemEl = document.querySelector(thisItemID);

        thisItemEl.setAttribute('visible', 'false');

        this.el.setAttribute('raycaster', 'enabled', false);
        this.el.setAttribute('raycaster', 'showLine', false);
    },

    onObjectChange: function () {
        // console.log("onObjectChange triggered");

        // Fetch the Item element selected on this controller
        var thisItemID = (this.el.id === 'leftHand') ? '#leftItem' : '#rightItem';
        var thisItemEl = document.querySelector(thisItemID);

        var menuEl = document.getElementById(this.data.menuId);

        // What's the type of object currently selected? For example, "mmmm_alien" or "bases"
        var objectGroup = menuEl.components['select-bar'].selectedOptgroupValue;

        // Get an Array of all the objects of this type
        var objectArray = this.groupJSONArray[objectGroup];

        // What is the ID of the currently selected item?
        var newObjectId = parseInt(menuEl.components['select-bar'].selectedOptionIndex);
        var selectedOptionValue = menuEl.components['select-bar'].selectedOptionValue;

        // Set the preview object to be the currently selected "preview" item
        thisItemEl.setAttribute('gltf-model', '../assets/glb/' + objectArray[newObjectId].file + '.glb');
        thisItemEl.setAttribute('scale', objectArray[newObjectId].replicaScale);
        thisItemEl.setAttribute('position', objectArray[newObjectId].replicaPosition);
        thisItemEl.setAttribute('objectId', newObjectId);
        thisItemEl.setAttribute('objectGroup', objectGroup);
        thisItemEl.flushToDOM();
    },

    /**
     * Undo - deletes the most recently placed object
     */
    onUndo: function () {
        // Check to see if builder is visible (meaning we can remove items)
        var thisItemID = (this.el.id === 'leftHand') ? '#leftItem' : '#rightItem';
        var thisItemEl = document.querySelector(thisItemID);
        if (thisItemEl.getAttribute('visible') == false) return;

        let assetsCreatedCount = document.getElementById('new-asset-container').childElementCount;
        if (assetsCreatedCount > 0) {
            let elementToRemove = document.getElementById('new-asset-container').children[assetsCreatedCount - 1];
            elementToRemove.parentNode.removeChild(elementToRemove);
        }
    }
});