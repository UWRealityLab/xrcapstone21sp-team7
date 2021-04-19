/* global AFRAME, Q, THREE */

if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('select-bar', {
    schema: {
        controls: { type: 'boolean', default: true },
        controllerID: { type: 'string', default: 'leftController' }
    },

    log: function (string, ...etc) {
        if (!Q.LOGGING.Selector) {
            return;
        }

        console.groupCollapsed(`[Component] ${string}`, ...etc);
        console.trace(); // hidden in collapsed group
        console.groupEnd();
    },

    /**
     * Find an element's original index position in an array by searching on an
     * element's value in the array.
     * 
     * @param array The array to search
     * @param attr The attribute to compare the value to when searching
     * @param value The value of the array to attempt and find
     */
    findWithAttr: function (array, attr, value) {  // find a
        for (var i = 0; i < array.length; i += 1) {
            if (array[i][attr] === value) {
                return i;
            }
        }
        this.log('could not find value, value: ', value, ' attr: ', attr);
        return -1;
    },

    /**
     * For a given array, find the largest value and return the value of the index thereof (0-based index),
     * using the > operator for comparison.
     */
    indexOfMax: function (arr) {
        if (arr.length === 0) {
            this.log('searching for value in array of len 0', arr);
            return -1;
        }
        let max = arr[0];
        let maxIndex = 0;
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] > max) {
                maxIndex = i;
                max = arr[i];
            }
        }
        return maxIndex;
    },

    /**
     * Provide a valid index for an array if the desiredIndex is greater or
     * less than an array's length by "looping" around. Expects a 0 based index
     * and will loop around [0, arrayLength).
     */
    loopIndex: function (desiredIndex, arrayLength) {
        if (desiredIndex < 0) {
            return arrayLength + desiredIndex % arrayLength;
        } else if (desiredIndex >= arrayLength) {
            return (desiredIndex - arrayLength) % arrayLength;
        } else {
            return desiredIndex;
        }
    },

    // for a given optgroup, make the children
    makeSelectOptionsRow: function (selectedOptgroupEl, parentEl, index, offsetY, idPrefix) {
        // make the optgroup label
        let optgroupLabelEl = document.createElement('a-entity');

        optgroupLabelEl.id = idPrefix + 'optgroupLabel' + index;
        optgroupLabelEl.setAttribute('position', `0.07 ${0.045 + offsetY} -0.003`);
        optgroupLabelEl.setAttribute('scale', '0.5 0.5 0.5');
        optgroupLabelEl.setAttribute('text', 'value', selectedOptgroupEl.getAttribute('label'));
        optgroupLabelEl.setAttribute('text', 'color', '#747474');
        parentEl.appendChild(optgroupLabelEl);

        // get the options available for this optgroup row
        let optionsElements = selectedOptgroupEl.getElementsByTagName('option');  // the actual JS children elements

        // convert the NodeList of matching option elements into a Javascript Array
        let optionsElementsArray = Array.prototype.slice.call(optionsElements);

        let firstArray = optionsElementsArray.slice(0, 4); // get items 0 - 4
        let previewArray = optionsElementsArray.slice(-3); // get the 3 LAST items of the array

        // Combine into 'menuArray', a list of currently visible options where the middle index is the currently selected object
        let menuArray = previewArray.concat(firstArray);

        this.log('currently visible options: ', menuArray);

        let selectOptionsHTML = '';
        let startPositionX = -0.225;
        let deltaX = 0.075;

        let findWithAttr = this.findWithAttr;

        // For each menu option, create a preview element and its appropriate children
        menuArray.forEach(function (element, menuArrayIndex) {
            let visible = (menuArrayIndex === 0 || menuArrayIndex === 6) ? (false) : (true);
            let selected = (menuArrayIndex === 3);
            // index of the optionsElementsArray where optionsElementsArray.element.getattribute('value') = element.getattribute('value')
            let originalOptionsArrayIndex = findWithAttr(optionsElementsArray, 'value', element.getAttribute('value'));
            selectOptionsHTML += `
  <a-entity id="${idPrefix}${originalOptionsArrayIndex}" visible="${visible}" class="preview${(selected) ? " selected" : ""}" optionid="${originalOptionsArrayIndex}" value="${element.getAttribute("value")}" optgroup="${selectedOptgroupEl.getAttribute("value")}" position="${startPositionX} ${offsetY} 0">
    <a-box class="previewFrame" position="0 0 -0.003" scale="0.06 0.06 0.005" material="color: ${(selected) ? ("yellow") : ("#222222")}"></a-box>
    <a-image class="previewImage" scale="0.05 0.05 0.05" src="${element.getAttribute("src")}" ></a-image>
    <a-entity class="objectName" position="0.065 -0.04 -0.003" scale="0.18 0.18 0.18" text="value: ${element.text}; color: ${(selected) ? ("yellow") : ("#747474")}"></a-entity>
  </a-entity>`
            startPositionX += deltaX;
        });

        // Append these menu options to a new element with id of "selectOptionsRow"
        let selectOptionsRowEl = document.createElement('a-entity');
        selectOptionsRowEl.id = idPrefix + 'selectOptionsRow' + index;
        selectOptionsRowEl.innerHTML = selectOptionsHTML;
        parentEl.appendChild(selectOptionsRowEl);

    },

    init: function () {
        this.log.bind(this);
        this.findWithAttr.bind(this);
        this.indexOfMax.bind(this);
        this.loopIndex.bind(this);
        this.makeSelectOptionsRow.bind(this);
        this.onOptionSwitch.bind(this);
        this.onOptgroupNext.bind(this);
        this.onOptgroupPrevious.bind(this);

        // Create select bar menu from html child `option` elements beneath parent entity inspired by the html5 spec: http://www.w3schools.com/tags/tag_optgroup.asp
        this.lastTime = new Date();
        this.selectedOptgroupValue = null;
        this.selectedOptgroupIndex = 0;
        this.selectedOptionValue = null;
        this.selectedOptionIndex = 0;

        // we want a consistent prefix when creating IDs
        // if the parent has an id, use that; otherwise, use the string 'menu'
        this.idPrefix = this.el.id ? this.el.id : "menu";

        // Create the "frame" of the select menu bar
        var selectRenderEl = document.createElement('a-entity');
        selectRenderEl.id = this.idPrefix + "selectRender";
        selectRenderEl.innerHTML = `
  <a-box id="${this.idPrefix}Frame" scale="0.4 0.15 0.005" position="0 0 -0.0075"  material="opacity: 0.5; transparent: true; color: #000000"></a-box>
  <a-entity id="${this.idPrefix}arrowRight" position="0.225 0 0" rotation="90 180 -180" scale="-0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>
  <a-entity id="${this.idPrefix}arrowLeft" position="-0.225 0 0" rotation="90 180 0" scale="0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity:0.5; transparent:true; color:#000000"></a-entity>`;
        this.el.appendChild(selectRenderEl);

        let optgroups = this.el.getElementsByTagName('optgroup');  // Get the optgroups
        let selectedOptgroupEl = optgroups[this.selectedOptgroupIndex];  // fetch the currently selected optgroup
        this.selectedOptgroupValue = selectedOptgroupEl.getAttribute('value'); // set component property to opgroup value

        this.makeSelectOptionsRow(selectedOptgroupEl, selectRenderEl, this.selectedOptgroupIndex, 0, this.idPrefix);

        let options = selectedOptgroupEl.getElementsByTagName('option');
        let selectedOptionEl = options[this.selectedOptionIndex];
        this.selectedOptionValue = selectedOptionEl.getAttribute('value');

        this.el.setAttribute('visible', 'false');
    },

    removeSelectOptionsRow: function (index) {
        // // find the appropriate select options row
        // let selectOptionsRowEl = document.getElementById(this.idPrefix + "selectOptionsRow" + index);
        // let optgroupLabelEl = document.getElementById(this.idPrefix + "optgroupLabel" + index);

        // // delete all children of selectOptionsRowEl
        // while (selectOptionsRowEl.firstChild) {
        //     selectOptionsRowEl.removeChild(selectOptionsRowEl.firstChild);
        // }

        // // delete selectOptionsRowEl and optgroupLabelEl
        // optgroupLabelEl.parentNode.removeChild(optgroupLabelEl);
        // selectOptionsRowEl.parentNode.removeChild(selectOptionsRowEl);
    },

    logThumbstick: function (evt) {
        if (evt.target.id != this.data.controllerID) {
            return;
        }
        if (!this.prevPressed) {
            this.prevPressed = 'none';
        }

        // Ignore movement when hidden
        if (!this.el.getAttribute('visible')) {
            return;
        }

        // For now ignore up/down
        // if (evt.detail.y > 0.95) {
        //   this.onOptgroupNext();
        //   // console.log('DOWN');
        // } else if (evt.detail.y < -0.95) {
        //   this.onOptgroupPrevious();
        //   // console.log('UP');
        if (evt.detail.x < -0.95) {
            if (this.prevPressed != 'left') {
                this.onOptionSwitch('previous');
                this.prevPressed = 'left';
            }
        } else if (evt.detail.x > 0.95) {
            if (this.prevPressed != 'right') {
                this.onOptionSwitch('next');
                this.prevPressed = 'right';
            }
        } else {
            this.prevPressed = 'none';
        }
    },

    onMenuVisible: function (evt) {
        if (evt.target.id != this.data.controllerID) {
            return;
        }
        this.el.setAttribute('visible', 'true');
    },

    onMenuHidden: function (evt) {
        if (evt.target.id != this.data.controllerID) {
            return;
        }
        this.el.setAttribute('visible', 'false');
    },

    addEventListeners: function () {
        // If controls = true and a controllerID has been provided, then add controller event listeners
        if (this.data.controls && this.data.controllerID) {
            let controllerEl = document.getElementById(this.data.controllerID);
            controllerEl.addEventListener('thumbstickmoved', this.logThumbstick.bind(this));
            controllerEl.addEventListener('gripup', this.onMenuHidden.bind(this));
            controllerEl.addEventListener('gripdown', this.onMenuVisible.bind(this));
            controllerEl.addEventListener('ybuttondown', this.onMenuItemSelected.bind(this));
        }
    },

    /**
     * Remove event listeners.
     */
    removeEventListeners: function () {
        if (this.data.controls && this.data.controllerID) {
            let controllerEl = document.getElementById(this.data.controllerID);
            controllerEl.removeEventListener('thumbstickmoved', this.logThumbstick);
            controllerEl.removeEventListener('gripup', this.onMenuHidden);
            controllerEl.removeEventListener('gripdown', this.onMenuVisible);
            controllerEl.removeEventListener('ybuttondown', this.onMenuItemSelected);
        }
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

    onMenuItemSelected: function (evt) {
        if (evt.target.id != this.data.controllerID) {
            return;
        }
        this.el.emit('menuSelected');
    },

    onOptgroupNext: function () {
        // var optgroups = this.el.getElementsByTagName('optgroup');  // Get the optgroups
        // var selectRenderEl = document.getElementById(this.idPrefix + "selectRender');

        // if (this.selectedOptgroupIndex + 2 > optgroups.length) {
        //     // CAN'T DO THIS, show red arrow
        //     var arrow = document.getElementById(this.idPrefix + "arrowDown');
        //     arrow.removeAttribute('animation__color');
        //     arrow.removeAttribute('animation__opacity');
        //     arrow.removeAttribute('animation__scale');
        //     arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FF0000", to: "#000000" });
        //     arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
        //     arrow.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "-0.006 0.003 0.006", to: "-0.004 0.002 0.004" });
        // } else {
        //     // CAN DO THIS, show next optgroup

        //     this.removeSelectOptionsRow(this.selectedOptgroupIndex); // remove the old optgroup row

        //     this.selectedOptgroupIndex += 1;
        //     var selectedOptgroupEl = optgroups[this.selectedOptgroupIndex];  // fetch the currently selected optgroup
        //     this.selectedOptgroupValue = selectedOptgroupEl.getAttribute('value'); // set component property to opgroup value

        //     this.el.flushToDOM();

        //     var nextSelectedOptgroupEl = optgroups[this.selectedOptgroupIndex];  // fetch the currently selected optgroup
        //     // this.makeSelectOptionsRow(nextSelectedOptgroupEl, selectRenderEl, this.selectedOptgroupIndex, -0.15);
        //     this.makeSelectOptionsRow(nextSelectedOptgroupEl, selectRenderEl, this.selectedOptgroupIndex, 0, this.idPrefix);

        //     // Change selected option element when optgroup is changed
        //     var selectOptionsRowEl = document.getElementById(this.idPrefix + 'selectOptionsRow' + this.selectedOptgroupIndex);
        //     var newlySelectedMenuEl = selectOptionsRowEl.getElementsByClassName('selected')[0];

        //     // update selectOptionsValue and Index
        //     this.selectedOptionValue = newlySelectedMenuEl.getAttribute('value');
        //     this.selectedOptionIndex = newlySelectedMenuEl.getAttribute('optionid');

        //     this.el.flushToDOM();

        //     this.el.emit('menuOptgroupNext');
        //     this.el.emit('menuChanged');

        //     var arrow = document.getElementById(this.idPrefix + "arrowDown');
        //     arrow.removeAttribute('animation__color');
        //     arrow.removeAttribute('animation__opacity');
        //     arrow.removeAttribute('animation__scale');
        //     arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FFFF00", to: "#000000" });
        //     arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
        //     arrow.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "-0.006 0.003 0.006", to: "-0.004 0.002 0.004" });
        // }
    },

    onOptgroupPrevious: function (evt) {
        // var optgroups = this.el.getElementsByTagName('optgroup');  // Get the optgroups
        // var selectRenderEl = document.getElementById(this.idPrefix + "selectRender');

        // if (this.selectedOptgroupIndex - 1 < 0) {
        //     // CAN'T DO THIS, show red arrow
        //     var arrow = document.getElementById(this.idPrefix + "arrowUp');
        //     arrow.removeAttribute('animation__color');
        //     arrow.removeAttribute('animation__opacity');
        //     arrow.removeAttribute('animation__scale');
        //     arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FF0000", to: "#000000" });
        //     arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
        //     arrow.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "0.006 0.003 0.006", to: "0.004 0.002 0.004" });

        // } else {
        //     // CAN DO THIS, show previous optgroup

        //     this.removeSelectOptionsRow(this.selectedOptgroupIndex); // remove the old optgroup row

        //     this.selectedOptgroupIndex -= 1;
        //     var selectedOptgroupEl = optgroups[this.selectedOptgroupIndex];  // fetch the currently selected optgroup
        //     this.selectedOptgroupValue = selectedOptgroupEl.getAttribute('value'); // set component property to opgroup value

        //     this.el.flushToDOM();

        //     var nextSelectedOptgroupEl = optgroups[this.selectedOptgroupIndex];  // fetch the currently selected optgroup
        //     // this.makeSelectOptionsRow(nextSelectedOptgroupEl, selectRenderEl, this.selectedOptgroupIndex, -0.15);
        //     this.makeSelectOptionsRow(nextSelectedOptgroupEl, selectRenderEl, this.selectedOptgroupIndex, 0, this.idPrefix);

        //     // Change selected option element when optgroup is changed
        //     var selectOptionsRowEl = document.getElementById(this.idPrefix + 'selectOptionsRow' + this.selectedOptgroupIndex);
        //     var newlySelectedMenuEl = selectOptionsRowEl.getElementsByClassName('selected')[0];

        //     // update selectOptionsValue and Index
        //     this.selectedOptionValue = newlySelectedMenuEl.getAttribute('value');
        //     this.selectedOptionIndex = newlySelectedMenuEl.getAttribute('optionid');

        //     this.el.flushToDOM();

        //     this.el.emit('menuOptgroupNext');
        //     this.el.emit('menuChanged');

        //     var arrow = document.getElementById(this.idPrefix + "arrowUp');
        //     arrow.removeAttribute('animation__color');
        //     arrow.removeAttribute('animation__opacity');
        //     arrow.removeAttribute('animation__scale');
        //     arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FFFF00", to: "#000000" });
        //     arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
        //     arrow.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "0.006 0.003 0.006", to: "0.004 0.002 0.004" });
        // }
    },

    animateArrow: function (arrowId) {
        let arrow = document.getElementById(arrowId);
        arrow.removeAttribute('animation__color');
        arrow.removeAttribute('animation__opacity');
        arrow.removeAttribute('animation__scale');
        arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: '#FFFF00', to: '#000000' });
        arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: '1', to: '0.5' });
        arrow.setAttribute('animation__scale', { property: 'scale', dur: 500, from: '0.006 0.003 0.006', to: '0.004 0.002 0.004' });
    },

    onOptionSwitch: function (direction) {
        var selectOptionsRowEl = document.getElementById(`${this.idPrefix}selectOptionsRow${this.selectedOptgroupIndex}`);

        const oldMenuEl = selectOptionsRowEl.getElementsByClassName('selected')[0];

        let oldSelectedOptionIndex = parseInt(oldMenuEl.getAttribute('optionid'));
        let selectedOptionIndex = oldSelectedOptionIndex;

        let optgroups = this.el.getElementsByTagName('optgroup');  // Get the optgroups
        let selectedOptgroupEl = optgroups[this.selectedOptgroupIndex];  // fetch the currently selected optgroup

        if (direction == 'previous') {
            this.el.emit('menuPrevious');
            // PREVIOUS OPTION MENU START ===============================
            selectedOptionIndex = this.loopIndex(selectedOptionIndex -= 1, selectedOptgroupEl.childElementCount);

            // menu: animate arrow LEFT
            this.animateArrow(this.idPrefix + 'arrowLeft');

            // menu: get the newly selected menu element
            const newMenuEl = selectOptionsRowEl.querySelectorAll(`[optionid='${selectedOptionIndex}']`)[0];

            // menu: remove selected class and change colors
            oldMenuEl.classList.remove('selected');
            newMenuEl.classList.add('selected');
            this.selectedOptionValue = newMenuEl.getAttribute('value');
            this.selectedOptionIndex = selectedOptionIndex;
            this.el.flushToDOM();
            this.el.emit('menuChanged');
            oldMenuEl.getElementsByClassName('objectName')[0].setAttribute('text', 'color', 'gray');
            newMenuEl.getElementsByClassName('objectName')[0].setAttribute('text', 'color', 'yellow');
            oldMenuEl.getElementsByClassName('previewFrame')[0].setAttribute('material', 'color', '#222222');
            newMenuEl.getElementsByClassName('previewFrame')[0].setAttribute('material', 'color', 'yellow');

            // menu: slide the menu list row RIGHT by 1
            //      const selectOptionsRowEl = document.querySelector('#selectOptionsRow');
            // use the desiredPosition attribute (if exists) instead of object3D position as animation may not be done yet
            if (selectOptionsRowEl.hasAttribute('desiredPosition')) {
                var oldPosition = selectOptionsRowEl.getAttribute('desiredPosition');
                var newX = parseFloat(oldPosition.split(' ')[0]) + 0.075;
                var newPositionString = `${newX.toString()} ${oldPosition.split(' ')[1]} ${oldPosition.split(' ')[2]}`;
            } else {
                var oldPosition = selectOptionsRowEl.object3D.position;
                var newX = oldPosition.x + 0.075; // this could be a variable at the component level
                var newPositionString = `${newX.toString()} ${oldPosition.y} ${oldPosition.z}`;
            }
            selectOptionsRowEl.removeAttribute('animation__slide');
            selectOptionsRowEl.setAttribute('animation__slide', { property: 'position', dur: 500, from: oldPosition, to: newPositionString });
            selectOptionsRowEl.setAttribute('desiredPosition', newPositionString);

            // menu: make the hidden most LEFTmost object (-3 from oldMenuEl index) visible
            var newlyVisibleOptionIndex = this.loopIndex(oldSelectedOptionIndex - 3, selectedOptgroupEl.childElementCount);
            var newlyVisibleOptionEl = selectOptionsRowEl.querySelectorAll(`[optionid='${newlyVisibleOptionIndex}']`)[0];

            // make visible and animate
            newlyVisibleOptionEl.setAttribute('visible', 'true');
            newlyVisibleOptionEl.removeAttribute('animation');
            newlyVisibleOptionEl.setAttribute('animation', { property: 'scale', dur: 500, from: '0.5 0.5 0.5', to: '1.0 1.0 1.0' });
            newlyVisibleOptionEl.flushToDOM();

            // menu: destroy the hidden most RIGHTmost object (+3 from oldMenuEl index)
            var newlyRemovedOptionIndex = this.loopIndex(oldSelectedOptionIndex + 3, selectedOptgroupEl.childElementCount);
            var newlyRemovedOptionEl = selectOptionsRowEl.querySelectorAll(`[optionid='${newlyRemovedOptionIndex}']`)[0];
            newlyRemovedOptionEl.flushToDOM();
            newlyRemovedOptionEl.parentNode.removeChild(newlyRemovedOptionEl);

            // menu: make the second RIGHTmost object (+2 from oldMenuEl index) invisible
            var newlyInvisibleOptionIndex = this.loopIndex(oldSelectedOptionIndex + 2, selectedOptgroupEl.childElementCount);
            var newlyInvisibleOptionEl = selectOptionsRowEl.querySelectorAll(`[optionid='${newlyInvisibleOptionIndex}']`)[0];
            newlyInvisibleOptionEl.setAttribute('visible', 'false');
            newlyInvisibleOptionEl.flushToDOM();

            // menu: Create the next LEFTmost object preview (-4 from oldMenuEl index) but keep it hidden until it's needed
            var newlyCreatedOptionEl = newlyVisibleOptionEl.cloneNode(true);
            newlyCreatedOptionEl.setAttribute('visible', 'false');
            var newlyCreatedOptionIndex = this.loopIndex(oldSelectedOptionIndex - 4, selectedOptgroupEl.childElementCount);

            // get the actual "option" element that is the source of truth for value, image src and label so that we can populate the new menu option
            var sourceOptionEl = selectedOptgroupEl.children[newlyCreatedOptionIndex];

            newlyCreatedOptionEl.setAttribute('optionid', newlyCreatedOptionIndex);
            newlyCreatedOptionEl.setAttribute('id', this.idPrefix + newlyCreatedOptionIndex);
            newlyCreatedOptionEl.setAttribute('value', sourceOptionEl.getAttribute('value'));

            var newlyVisibleOptionPosition = newlyVisibleOptionEl.object3D.position;
            newlyCreatedOptionEl.setAttribute('position', (newlyVisibleOptionPosition.x - 0.075) + ' ' + newlyVisibleOptionPosition.y + ' ' + newlyVisibleOptionPosition.z);
            newlyCreatedOptionEl.flushToDOM();

            // menu: add the newly cloned and modified menu object preview to the dom
            selectOptionsRowEl.insertBefore(newlyCreatedOptionEl, selectOptionsRowEl.firstChild);

            // menu: get child elements for image and name, populate both appropriately
            var appendedNewlyCreatedOptionEl = selectOptionsRowEl.querySelectorAll(`[optionid='${newlyCreatedOptionIndex}']`)[0];
            appendedNewlyCreatedOptionEl.getElementsByClassName('previewImage')[0].setAttribute('src', sourceOptionEl.getAttribute('src'))
            appendedNewlyCreatedOptionEl.getElementsByClassName('objectName')[0].setAttribute('text', 'value', sourceOptionEl.text);
            appendedNewlyCreatedOptionEl.getElementsByClassName('objectName')[0].setAttribute('text', 'color', '#747474');
            appendedNewlyCreatedOptionEl.flushToDOM();

            // PREVIOUS OPTION MENU END ===============================

        } else {
            this.el.emit('menuNext');
            // NEXT OPTION MENU START ===============================
            selectedOptionIndex = this.loopIndex(selectedOptionIndex += 1, selectedOptgroupEl.childElementCount);

            // menu: animate arrow right
            this.animateArrow(this.idPrefix + 'arrowRight');

            // menu: get the newly selected menu element
            const newMenuEl = selectOptionsRowEl.querySelectorAll(`[optionid='${selectedOptionIndex}']`)[0];

            // menu: remove selected class and change colors
            oldMenuEl.classList.remove('selected');
            newMenuEl.classList.add('selected');
            this.selectedOptionValue = newMenuEl.getAttribute('value');
            //      console.log(this.selectedOptionValue);
            this.selectedOptionIndex = selectedOptionIndex;
            this.el.flushToDOM();
            this.el.emit('menuChanged');
            oldMenuEl.getElementsByClassName('objectName')[0].setAttribute('text', 'color', 'gray');
            newMenuEl.getElementsByClassName('objectName')[0].setAttribute('text', 'color', 'yellow');
            oldMenuEl.getElementsByClassName('previewFrame')[0].setAttribute('material', 'color', '#222222');
            newMenuEl.getElementsByClassName('previewFrame')[0].setAttribute('material', 'color', 'yellow');

            // menu: slide the menu list left by 1
            //      const selectOptionsRowEl = document.querySelector('#selectOptionsRow');
            // use the desiredPosition attribute (if exists) instead of object3D position as animation may not be done yet
            // TODO - error with this code when looping through index

            //      console.log(''true' old position');
            //      console.log(selectOptionsRowEl.object3D.position);

            if (selectOptionsRowEl.hasAttribute('desiredPosition')) {
                //        console.log('desiredPosition');
                var oldPosition = selectOptionsRowEl.getAttribute('desiredPosition');
                //        console.log(oldPosition);
                var newX = parseFloat(oldPosition.split(' ')[0]) - 0.075;
                var newPositionString = newX.toString() + " " + oldPosition.split(' ')[1] + " " + oldPosition.split(' ')[2];
                //        console.log(newPositionString);
            } else {
                var oldPosition = selectOptionsRowEl.object3D.position;
                var newX = oldPosition.x - 0.075; // this could be a variable soon
                var newPositionString = newX.toString() + " " + oldPosition.y + " " + oldPosition.z;
                //        console.log(newPositionString);
            }
            selectOptionsRowEl.removeAttribute('animation__slide');
            selectOptionsRowEl.setAttribute('animation__slide', { property: 'position', dur: 500, from: oldPosition, to: newPositionString });
            selectOptionsRowEl.setAttribute('desiredPosition', newPositionString);

            // menu: make the hidden most rightmost object (+3 from oldMenuEl index) visible
            var newlyVisibleOptionIndex = this.loopIndex(oldSelectedOptionIndex + 3, selectedOptgroupEl.childElementCount);
            var newlyVisibleOptionEl = selectOptionsRowEl.querySelectorAll(`[optionid='${newlyVisibleOptionIndex}']`)[0];

            // make visible and animate
            newlyVisibleOptionEl.setAttribute('visible', 'true');
            newlyVisibleOptionEl.removeAttribute('animation');
            newlyVisibleOptionEl.setAttribute('animation', { property: 'scale', dur: 500, from: '0.5 0.5 0.5', to: '1.0 1.0 1.0' });
            newlyVisibleOptionEl.flushToDOM();

            // menu: destroy the hidden most leftmost object (-3 from oldMenuEl index)
            var newlyRemovedOptionIndex = this.loopIndex(oldSelectedOptionIndex - 3, selectedOptgroupEl.childElementCount);
            var newlyRemovedOptionEl = selectOptionsRowEl.querySelectorAll(`[optionid='${newlyRemovedOptionIndex}']`)[0];
            newlyRemovedOptionEl.flushToDOM();
            newlyRemovedOptionEl.parentNode.removeChild(newlyRemovedOptionEl);

            // menu: make the second leftmost object (-2 from oldMenuEl index) invisible
            var newlyInvisibleOptionIndex = this.loopIndex(oldSelectedOptionIndex - 2, selectedOptgroupEl.childElementCount);
            var newlyInvisibleOptionEl = selectOptionsRowEl.querySelectorAll(`[optionid='${newlyInvisibleOptionIndex}']`)[0];
            newlyInvisibleOptionEl.setAttribute('visible', 'false');
            newlyInvisibleOptionEl.flushToDOM();

            // menu: Create the next rightmost object preview (+4 from oldMenuEl index) but keep it hidden until it's needed
            var newlyCreatedOptionEl = newlyVisibleOptionEl.cloneNode(true);
            newlyCreatedOptionEl.setAttribute('visible', 'false');
            var newlyCreatedOptionIndex = this.loopIndex(oldSelectedOptionIndex + 4, selectedOptgroupEl.childElementCount);
            //      console.log('newlyCreatedOptionIndex: " + newlyCreatedOptionIndex);
            // get the actual "option" element that is the source of truth for value, image src and label so that we can populate the new menu option
            var sourceOptionEl = selectedOptgroupEl.children[newlyCreatedOptionIndex];
            //      console.log('sourceOptionEl');
            //      console.log(sourceOptionEl);

            newlyCreatedOptionEl.setAttribute('optionid', newlyCreatedOptionIndex);
            newlyCreatedOptionEl.setAttribute('id', this.idPrefix + newlyCreatedOptionIndex);
            newlyCreatedOptionEl.setAttribute('value', sourceOptionEl.getAttribute('value'));

            var newlyVisibleOptionPosition = newlyVisibleOptionEl.object3D.position;
            newlyCreatedOptionEl.setAttribute('position', (newlyVisibleOptionPosition.x + 0.075) + " " + newlyVisibleOptionPosition.y + " " + newlyVisibleOptionPosition.z);
            newlyCreatedOptionEl.flushToDOM();

            // menu: add the newly cloned and modified menu object preview
            selectOptionsRowEl.insertBefore(newlyCreatedOptionEl, selectOptionsRowEl.firstChild);

            // menu: get child elements for image and name, populate both appropriately
            var appendedNewlyCreatedOptionEl = selectOptionsRowEl.querySelectorAll(`[optionid='${newlyCreatedOptionIndex}']`)[0];

            appendedNewlyCreatedOptionEl.getElementsByClassName('previewImage')[0].setAttribute('src', sourceOptionEl.getAttribute('src'))
            appendedNewlyCreatedOptionEl.getElementsByClassName('objectName')[0].setAttribute('text', 'value', sourceOptionEl.text);
            appendedNewlyCreatedOptionEl.getElementsByClassName('objectName')[0].setAttribute('text', 'color', '#747474');
            appendedNewlyCreatedOptionEl.flushToDOM();

            // NEXT MENU OPTION END ===============================
        }
    },
});
