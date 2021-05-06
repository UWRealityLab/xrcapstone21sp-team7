const DX = 15;
const DY = 5;
const DZ = 14;

AFRAME.registerComponent("cloud-meditation", {
  init: function () {
    this.meditating = false;

    // Bind functions
    this.generateCloud = this.generateCloud.bind(this);
    this.onCloudMeditationStart = this.onCloudMeditationStart.bind(this);
    this.onCloudMeditationEnd = this.onCloudMeditationEnd.bind(this);

    // Create Clouds
    let position = {
      x: -25,
      y: DY,
      z: 0,
    };
    for (let i = 0; i < 3; i++) {
      this.generateCloud(position);
      position.z -= DZ;
      position.y += 2;
    }
    for (let i = 0; i < 3; i++) {
      this.generateCloud(position);
      position.x += DX;
      position.y += DY;
    }

    // Event listeners
    this.el.sceneEl.addEventListener("cloud-meditation-start", this.onCloudMeditationStart);
    this.el.sceneEl.addEventListener("menu-item-deselected", this.onCloudMeditationEnd);
  },

  generateCloud: function (position) {
    let cloud = document.createElement("a-entity");
    cloud.setAttribute("visible", false);
    cloud.setAttribute("class", "cloud");
    cloud.setAttribute("gltf-model", "#walkable-cloud");
    cloud.setAttribute("scale", "3 2.8 3");
    cloud.setAttribute("position", position);
    // Need this surface to teleport to
    let surface = document.createElement("a-plane");
    surface.setAttribute("class", "cloud-surface");
    surface.setAttribute("visible", "false");
    surface.setAttribute("rotation", "-90 0 0");
    surface.setAttribute("position", "0.05 0 -0.26");
    surface.setAttribute("scale", "3.77 3.39 1");
    cloud.appendChild(surface);
    this.el.appendChild(cloud);
  },

  onCloudMeditationStart: function () {
    this.meditating = true;
    this.el.querySelectorAll(".cloud").forEach((cloud) => {
      cloud.setAttribute(
        "animation",
        "property: scale; to: 3.1 2.9 3.1; dur: 5000; loop: true; dir: alternate;"
      );
      cloud.setAttribute("visible", true);
    });
  },

  onCloudMeditationEnd: function () {
    if (this.meditating) {
      this.el.querySelectorAll(".cloud").forEach(cloud => {
        cloud.setAttribute("visible", "false");
        cloud.removeAttribute("animation");
      });

      // Teleport the user to the center in case they are chilling
      // on a cloud :)
      let camRig = document.querySelector("#camRig");
      camRig.setAttribute("position", "0 0 0");
      this.meditating = false;
    }
  },
});
