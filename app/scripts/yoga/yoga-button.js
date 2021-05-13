AFRAME.registerComponent("yoga-button", {
  init: function() {
    let el = this.el;

    // Handlers
    this.yogaToggle = this.yogaToggle.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    
    // Listeners
    this.el.addEventListener("click", this.yogaToggle);
    this.el.addEventListener("mouseenter", this.onMouseEnter);
    this.el.addEventListener("mouseleave", this.onMouseLeave);
  },

  remove: function() {
    this.el.removeEventListener("click", this.yogaToggle);
    this.el.removeEventListener("mouseenter", this.onMouseEnter);
    this.el.removeEventListener("mouseleave", this.onMouseLeave);
  },

  yogaToggle: function() {
    this.el.setAttribute("color", "gray");
    let buttonId = this.el.getAttribute("id");

    /*
    switch(buttonId) {
      case "yoga-back":
        break;
      case "yoga-pause":
        break;
      case "yoga-next":
        break;
    }
    */
  },

  onMouseEnter: function() {
    let hand = document.getElementById('rightHand');
    this.el.setAttribute("color", "#C0C0C0");
    hand.setAttribute("raycaster", "lineOpacity", 1);
  },

  onMouseLeave: function() {
    let hand = document.getElementById('rightHand');
    this.el.setAttribute("color", "white");
    hand.setAttribute("raycaster", "lineOpacity", 0);
  }
});