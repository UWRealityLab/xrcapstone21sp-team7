/*
This component should be placed on entities that we want to
designate as checkpoints for teleportation. Use on classes marked
'clickable' along with the 'blink-teleportation' component.

Might be able to merge with blink-teleportation to avoid redundancy
ex.
  <a-entity class="clickable" blink-teleportation teleportation-checkpoint></entity>
*/
AFRAME.registerComponent("teleportation-checkpoint", {
  init: function() {
    let el = this.el;
    let myPosition = el.getAttribute("position");
    let cameraPosition = el.sceneEl.querySelector("#camRig").getAttribute("position");
    
    console.log(cameraPosition);
    
    // Arbitrary values used, can be anything
    // Current values should teleport you to ontop the object - calibrated for the white cubes
    let checkpointPosition = {
      x: myPosition.x,
      // y: cameraPosition.y,
      y: myPosition.y + 0.6,
      z: myPosition.z,
    };
    
    el.setAttribute("blink-teleportation", { pos: checkpointPosition });
    // el.setAttribute("look-at", "#cam");
    
    this.teleportationIntersected = function() {
      el.setAttribute('color', 'grey');
    }
    
    this.teleportationCleared = function() {
      el.setAttribute('color', 'white');
    }
    
    this.el.addEventListener('raycaster-intersected', this.teleportationIntersected);
    this.el.addEventListener('raycaster-intersected-cleared', this.teleportationCleared);
  },
  remove: function() {
    this.el.removeEventListener('raycaster-intersected', this.teleportationIntersected);
    this.el.removeEventListener('raycaster-intersected-cleared', this.teleportationCleared);
  }
});
