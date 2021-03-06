// const DX = 15;
// const DY = 5;
// const DZ = 14;

const SCALE = {
  x: 3,
  y: 2.8,
  z: 2
};

AFRAME.registerComponent("cloud-meditation", {
  init: function () {
    this.meditating = false;

    // Bind functions
    this.generateCloud = this.generateCloud.bind(this);
    this.onCloudMeditationStart = this.onCloudMeditationStart.bind(this);
    this.onCloudMeditationEnd = this.onCloudMeditationEnd.bind(this);

    // Create Clouds
    let position = {
      x: -36,
      y: 3.5,
      z: -16,
    };

    this.generateCloud(position);

    // Event listeners
    this.el.sceneEl.addEventListener("cloud-meditation-start", this.onCloudMeditationStart);
    this.el.sceneEl.addEventListener("cloud-meditation-end", this.onCloudMeditationEnd);
  },

  generateCloud: function (position) {
    let cloud = document.createElement("a-entity");
    cloud.setAttribute("visible", false);
    cloud.setAttribute("class", "cloud walkable");
    cloud.setAttribute("gltf-model", "#walkable-cloud");
    cloud.setAttribute("scale", SCALE);
    cloud.setAttribute("position", position);
    this.el.appendChild(cloud);
  },

  onCloudMeditationStart: function () {
    this.meditating = true;
    this.el.querySelectorAll(".cloud")?.forEach((cloud) => {
      cloud.setAttribute(
        "animation",
        `property: scale; to: ${SCALE.x + 0.05} ${SCALE.y} ${SCALE.z + 0.05}; dur: 6000; loop: true; dir: alternate;`
      );
      cloud.setAttribute("visible", true);
    });
  },

  onCloudMeditationEnd: function () {
    if (this.meditating) {
      this.el.querySelectorAll(".cloud")?.forEach(cloud => {
        cloud.setAttribute("visible", "false");
        cloud.removeAttribute("animation");
      });
      this.meditating = false;
    }
  },
});
