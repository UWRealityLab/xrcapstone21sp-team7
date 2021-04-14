// this emits a signal to say that the user wants to enter "meditation mode"

AFRAME.registerComponent('meditation-emitter', {
  init: function() {
    let el = this.el;
    this.meditationTrigger = function() {
      let c = el.getAttribute('color');
      
      if (c == "#FFC65D") {
        el.setAttribute('color', "#FF6100");
      } else {
        el.setAttribute('color', "#FFC65D")
      }
      
      el.emit('goMeditation', {returnColor: c});
    }
    this.el.addEventListener('click', this.meditationTrigger);
  },
  remove: function() {
    this.el.removeEventListener('click', this.meditationTrigger);
  }
})