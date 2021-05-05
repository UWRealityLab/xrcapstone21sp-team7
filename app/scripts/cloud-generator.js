const X_DIM = 600;

AFRAME.registerComponent("cloud-generator", {
  init: function() {
    let el = this.el;

    function createCloud(attr) {
      let cloud = document.createElement("a-entity");
      cloud.setAttribute("gltf-model", `#cloud_${attr.model}`);
      cloud.setAttribute("scale", attr.scale);
      cloud.setAttribute("position", attr.position);
      cloud.setAttribute("rotation", attr.rotation);
      el.appendChild(cloud);
    }

    let vals = {
      model: 3,
      scale: { x: 10, y: 10, z: 10 },
      position: { x: -100, y: 120, z: -150 },
      rotation: { x: 0, y: 0, z: 0 }
    };

    for (let i = 0; i < 4; i++) {
      vals.position.x = X_DIM * (Math.random() - 0.5);
      createCloud(vals);
      vals.position.z += 100;
    }
  }
});