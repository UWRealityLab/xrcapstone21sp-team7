// Positioning - note should probably be siblings with mediakeys
const FROM_CENTER = 1.1;
const Y_ROTATION = 10;
const TITLE_SIZE = 1.5;

AFRAME.registerComponent("info-panel", {
  init: function() {
    const el = this.el;

    // Music
    this.audioHeader = document.createElement("a-entity");
    this.audioHeader.setAttribute("position", { x: 0, y: 0, z: 0 });
    this.audioHeader.setAttribute("text", {
      value: "Garden Audio",
      align: "center",
      shader: "msdf",
      width: TITLE_SIZE,
    });

    this.audioInfo = document.createElement("a-entity");
    this.audioInfo.setAttribute("position", { x: 0, y: -0.1, z: 0 });
    this.audioInfo.setAttribute("id", "audio-info");
    this.audioInfo.setAttribute("text", {
      value: "",
      align: "center",
      shader: "msdf",
    });

    // Activity
    this.activityHeader = document.createElement("a-entity");
    this.audioHeader.setAttribute("position", { x: 0, y: 0, z: 0 });
    this.activityHeader.setAttribute("text", {
      value: "Activity",
      align: "center",
      shader: "msdf",
      width: TITLE_SIZE
    });

    this.activityInfo = document.createElement("a-entity");
    this.activityInfo.setAttribute("position", { x: 0, y: -0.1, z: 0 });
    this.activityInfo.setAttribute("id", "activity-info");
    this.activityInfo.setAttribute("text", {
      value: "",
      align: "center",
      shader: "msdf",
    });

    // Containers
    const leftContainer = document.createElement("a-entity");
    leftContainer.setAttribute("position", {
      x: -FROM_CENTER,
      y: 0,
      z: 0
    });
    leftContainer.setAttribute("rotation", {
      x: 0,
      y: Y_ROTATION,
      z: 0
    });

    const rightContainer = document.createElement("a-entity");
    rightContainer.setAttribute("position", {
      x: FROM_CENTER,
      y: 0,
      z: 0
    });
    rightContainer.setAttribute("rotation", {
      x: 0,
      y: -Y_ROTATION,
      z: 0
    });

    leftContainer.appendChild(this.activityHeader);
    leftContainer.appendChild(this.activityInfo);
    rightContainer.appendChild(this.audioHeader);
    rightContainer.appendChild(this.audioInfo);

    el.appendChild(leftContainer);
    el.appendChild(rightContainer);
  },
  remove: function() {}
});