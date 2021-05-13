// AFRAME.registerComponent('garden-pick-and-placer', {
//   schema: {
//     menuId: { type: 'string', default: 'menu' },
//     previewItemId: { type: 'string', default: 'preview' },
//     gardenBaseId: { type: 'string', default: 'garden' },
//     newAssetContainerId: { type: 'string', default: 'new-asset-container' }
//   },

//   log: function (string, ...etc) {
//     if (!Q.LOGGING.GardenPickAndPlacer) {
//       return;
//     }

//     console.groupCollapsed(`[Component] ${string}`, ...etc);
//     console.trace(); // hidden in collapsed group
//     console.groupEnd();
//   },

//   init: function () {
//     this.itemGrabbed = false;
//     this.itemEl = null;

//     this.getIntersectedPoint = this.getIntersectedPoint.bind(this);
//     this.createItemEl = this.createItemEl.bind(this);

//     let el = this.el;
//     el.addEventListener('gripup', this.handReleased.bind(this));
//     el.addEventListener('gripdown', this.handSqueezed.bind(this));
//     el.addEventListener('raycaster-intersection', this.onRaycasterIntersection.bind(this));
//     el.addEventListener('raycaster-intersection-cleared', this.onRaycasterIntersectionCleared.bind(this));
//   },
  
//   remove: function () {
//     let el = this.el;
//     el.removeEventListener('gripup', this.handReleased);
//     el.removeEventListener('gripdown', this.handSqueezed);
//     el.removeEventListener('raycaster-intersection', this.onRaycasterIntersection);
//     el.removeEventListener('raycaster-intersection-cleared', this.onRaycasterIntersectionCleared);
//   },

//   handReleased: function() {
//     console.log(this.el.getAttribute('raycaster').intersectedEls);

//     if (!this.itemEl) return;

//     this.itemGrabbed = false;
//     // Place item
//     // check if it is in a valid location
//     if (!this.getIntersectedPoint())
//     {
//       document.getElementById(this.data.newAssetContainerId).removeChild(this.itemEl);
//     } else {
//       // give item we own the croquet attribute
//       this.itemEl.setAttribute('croquet');
//       // remove reference to the itemEl...we no longer own it
//       this.itemEl = null;
//     }
//   },

//   handSqueezed: function() {
//     console.log(this.el.getAttribute('raycaster').intersectedEls);

//     this.itemGrabbed = true;
//     // Create item
//     this.createItemEl();
//   },

//   onRaycasterIntersection: function(evt) {},

//   onRaycasterIntersectionCleared: function(evt) {},

//   getIntersectedPoint: function() {
//     let gardenEl = document.getElementById(this.data.gardenBaseId);
//     return intersectionPoint = gardenEl.components['base-garden'].data.intersectedPoint;
//   },

//   /**
//    * Spawns the currently selected object at the controller location when trigger pressed
//    */
//   createItemEl: function () {
//     // Check to see if builder preview item is visible (if it is we can place items)
//     let thisItemEl = document.getElementById(this.data.previewItemId);
//     if (thisItemEl.getAttribute('visible') == false) {
//       return;
//     }

//     // Check to see if the user's raycaster is pointing on a valid position,
//     // this position will be used for initial location. If not, we still create
//     // the item, it is just not visible
//     let intersectedPoint = this.getIntersectedPoint();
//     if (!intersectionPoint) {
//       return;
//     }

//     // Which object should be placed here? This ID is 'stored' in the DOM element of the current Item
//     let objectId = parseInt(thisItemEl.attributes.objectId.value);

//     // What's the type of object? For example, 'plants'
//     let objectGroup = thisItemEl.attributes.objectGroup.value;

//     // Get an Array of all the objects of this type
//     let objectArray = this.groupJSONArray[objectGroup];

//     let position = intersectionPoint.x + ' ' + 0 + ' ' + intersectionPoint.z;

//     let rotationStr = '0 ' + (thisItemEl.object3D.rotation.y * 180 / Math.PI) + ' 0';

//     // NEW https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
//     let newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
//       let r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8; return v.toString(16);
//     });

//     let newEntity = document.createElement('a-entity');
//     newEntity.setAttribute('id', newId);
//     newEntity.setAttribute('class', 'movable-plants');
//     newEntity.setAttribute('croquet', 'name: ' + newId);
//     newEntity.setAttribute('scale', objectArray[objectId].actualScale);
//     newEntity.setAttribute('rotation', rotationStr);
//     newEntity.setAttribute('gltf-model', `${Q.GARDEN_BUILDER.GardenAssetLocation}${objectArray[objectId].file}.glb`);
//     newEntity.setAttribute('position', position);
//     newEntity.setAttribute('shadow', 'receive: false; cast: true');

//     this.log('adding item with ID = ' + newId, newEntity);
//     // Place entity as a child of the floor
//     document.getElementById(this.data.newAssetContainerId).appendChild(newEntity);
//   },
// });
