const X_DIM = 200;

AFRAME.registerComponent("cloud-generator", {
  init: function() {
    let el = this.el;

    function createCloud(model, scale, position) {
      let cloud = document.createElement("a-entity");
      cloud.setAttribute("gltf-model", `#cloud${model}`);
      cloud.setAttribute("scale", scale);
      cloud.setAttribute("position", position);
      cloud.setAttribute(
        "animation__sway",
        `property: position; to: ${position.x + X_DIM} ${position.y} ${position.z}; dur: 80000; loop: true; dir: alternate; easing: linear`  
      );
      el.appendChild(cloud);
    }

    let position = { x: -100, y: 110, z: -150 };
    let scale = { x: 20, y: 20, z: 15 };
    // Create starter clouds
    for (let i = 0; i < 3; i++) {
      createCloud(1, scale, position);
      position.z += 150;
      position.x = X_DIM * (2 * Math.random() - 1);
    }
  }
});