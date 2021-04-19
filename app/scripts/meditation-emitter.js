// this emits a signal to say that the user wants to enter "meditation mode"

AFRAME.registerComponent("meditation-emitter", {
  init: function() {
    let el = this.el;
    this.meditationMode = false;
    //     this.meditationTrigger = function() {
    //       let c = el.getAttribute('color');

    //       if (c == "#FFC65D") {
    //         el.setAttribute('color', "#FF6100");
    //       } else {
    //         el.setAttribute('color', "#FFC65D")
    //       }

    //       el.emit('goMeditation', {returnColor: c});
    //     }

    this.meditationTrigger = function(event) {
      let x = event.detail.newPosition.x;
      let z = event.detail.newPosition.z;
      let scale = el.object3D.scale;
      let center = el.object3D.position;
      let withinX = center.x - 0.5 * scale.z < x && x < center.x + 0.5 * scale.x;
      let withinZ = center.z - 0.5 * scale.z < z && z < center.z + 0.5 * scale.z;
      console.log("x: ", x);
      console.log("z: ", z);
      console.log("scale: ", scale);
      console.log("center: ", center);

      console.log("withinX: ", withinX);
      console.log("withinZ: ", withinZ);
      if (withinX && withinZ) {
        let c = el.getAttribute("color");

        if (c == "#FFC65D") {
          el.setAttribute("color", "#FF6100");
        } else {
          el.setAttribute("color", "#FFC65D");
        }

        el.emit("goMeditation", { returnColor: c });
      }
    };

    // this.el.addEventListener('click', this.meditationTrigger);
    el.sceneEl.addEventListener("teleported", this.meditationTrigger);
  },
  remove: function() {
    // this.el.removeEventListener('click', this.meditationTrigger);
    this.el.sceneEl.removeEventListener("teleported", this.meditationTrigger);
  }
});
