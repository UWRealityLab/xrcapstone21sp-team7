// Modified from -> https://github.com/aframevr/aframe/blob/master/examples/showcase/ui/highlight.js
// cameraRig: { type: "selector", default: "#camRig" },
    // deviceButtons: { default: ["click", "mousedown", "triggerdown"] },
    AFRAME.registerComponent('menu-button', {
      init: function () {
        let el = this.el;
        
        this.onClick = this.onClick.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.reset = this.reset.bind(this);
        // backgroundEl.addEventListener('click', this.reset);
        el.addEventListener('mouseenter', this.onMouseEnter);
        el.addEventListener('mouseleave', this.onMouseLeave);
        el.addEventListener('click', this.onClick);
      },
      
      remove: function() {
        // this.backgroundEl.removeEventListener('click', this.reset);
        this.el.removeEventListener('mouseenter', this.onMouseEnter);
        this.el.removeEventListener('mouseleave', this.onMouseLeave);
        this.el.removeEventListener('click', this.onClick);    
      },
    
      onClick: function (evt) {
        // evt.target.setAttribute('material', 'color', '#046de7');
        console.log(`${evt.target.id}-clicked`);
        this.el.emit(`${evt.target.id}-clicked`, {});
      },
    
      onMouseEnter: function (evt) {
        evt.target.setAttribute('material', 'color', '#046de7');
      },
    
      onMouseLeave: function (evt) {
        evt.target.setAttribute('material', 'color', 'white');
      },
    
      reset: function () {
        this.el.emit('mouseleave');
      },
      
    //   play: function() {
    //     this.addEventListeners();
    //   },
      
    //   pause: function() {
    //     this.removeEventListeners();
    //   },
      
    //   addEventListeners: function() {
    //     this.el.addEventListener('mouseenter', this.onMouseEnter);
    //     this.el.addEventListener('mouseleave', this.onMouseLeave);
    //     this.el.addEventListener('click', this.onClick);
    //   },
      
    //   removeEventListeners: function() {
    //     this.el.removeEventListener('mouseenter', this.onMouseEnter);
    //     this.el.removeEventListener('mouseleave', this.onMouseLeave);
    //     this.el.removeEventListener('click', this.onClick);
    //   }
    });