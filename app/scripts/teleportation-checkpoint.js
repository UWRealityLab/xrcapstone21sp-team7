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
    let checkpointPosition = {
      x: myPosition.x + 2,
      y: cameraPosition.y,
      z: myPosition.z + 2,
    };
    
    el.setAttribute("blink-teleportation", { pos: checkpointPosition });
    // el.setAttribute("look-at", "#cam");
  },
  remove: function() {}
});
