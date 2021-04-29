AFRAME.registerComponent('volume-controls', {
    init: function() {
        let el = this.el;
        let id = el.getAttribute('id');
        
        this.volumeControl = function() {
          let sky = document.querySelector('#sky');
  
          let attr = sky.getAttribute('sound');
          let prev_volume = attr.volume;

          console.log(prev_volume);
  
          if (id == "up-volume") {
              attr.volume = prev_volume + 1;
              console.log("GREEN:" + attr.volume);
          } else {
              if (prev_volume != 0) {
                  attr.volume = prev_volume - 1;  
              }
              console.log("RED" + attr.volume);
          }
  
          sky.setAttribute('sound', attr);
        }
  
        this.el.addEventListener('click', this.volumeControl);
    },
    remove: function() {
        this.el.removeEventListener('click', this.volumeControl);
    }
  })