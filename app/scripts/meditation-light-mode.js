AFRAME.registerComponent('meditation-light-mode', {
  init: function() {
    let el = this.el;
    
    this.onMeditation = function(e) {
      
      let n = e.detail.returnColor;
      console.log(n);
      
      let light;
      if (n == "meditation") {
        // we want to change the sky to lower intensity
        
        light = {
          property: 'light.intensity',
          to: 0.2,
          dur: 2000,
          easing: 'linear'
        };
      } else {
        // we want to change the light to brighter intensity
        light = {
          property: 'light.intensity',
          to: 0.7,
          dur: 2000,
          easing: 'linear'
        };
      }
      
      //el.setAttribute('src', source);
      el.setAttribute('animation', light);
    }
    this.el.sceneEl.addEventListener('goMeditation', this.onMeditation);
  },
  remove: function() {
    this.el.sceneEl.removeEventListener('goMeditation', this.onMeditation);
  }
})