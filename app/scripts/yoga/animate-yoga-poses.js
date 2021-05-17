var YOGA_MODEL_URLS = {
  standingAnimations: '../assets/glb/yoga-animations.glb'
};

var YOGA_ANIMATIONS = {
  threeLegDownwardDog: 0,
  chair: 1,
  garland: 2,
  kingDancer: 3,
  lunge: 4,
  lunge2: 5,
  mountain: 6,
  plank: 7,
  pyramid: 8,
  pyramid2: 9,
  reverseWarrior: 10,
  standingArmsRaised: 11,
  standingForwardBent: 12,
  tree: 13,
  trianglePose: 14,
  warrior: 15,
  warrior2: 16,
  warrior3: 17,
  wideLeggedForwardBend: 18
};

AFRAME.registerComponent('animate-yoga-poses', {
  init: function () {
    this.alwaysDisplay = AFRAME.utils.throttle((delta) => {
      this.el.object3D.traverse((object) => {
        if (object.isMesh) object.frustumCulled = false;

        let mesh = this.el.getObject3D('mesh');
        if (!mesh || !mesh.mixer) return;
        mesh.mixer.update(delta / 1000);
      });
    }, 1000 / 50, this);

    this.loader = new THREE.GLTFLoader();
    this.loader.setCrossOrigin('anonymous');
  },

  update: function() {
    let yogaModelURL = YOGA_MODEL_URLS.standingAnimations;
    let el = this.el;
    let self = this;

    this.loader.load(yogaModelURL, function (gltf) {
      var mesh = gltf.scene.children[0];
      mesh.mixer = new THREE.AnimationMixer(mesh);
      self.clips = gltf.animations;
      el.setObject3D('mesh', mesh);
    });
  },

  tick: function (time, delta) {
    this.alwaysDisplay(delta);
  },

  /**
   * 
   * @param {string} pose - Which pose to animate to. If absent, animate to standing position
   * @param {string} lastPose - Previous gesture to reverse back to if needed
   */
  animateGesture(pose, lastPose) {
    if (pose != null) {
      this.playAnimation(pose, lastPose, false);
    } else {
      this.playAnimation(lastPose, pose, true);
    }
  },

  playAnimation: function(pose, lastPose, reverse) {
    var clip;
    var fromAction;
    var mesh = this.el.getObject3D('mesh');
    var toAction;

    if (!mesh) { return; }

    mesh.mixer.stopAllAction();
    clip = this.getClip(pose);
    toAction = mesh.mixer.clipAction(clip);
    toAction.clampWhenFinished = true;
    toAction.loop = THREE.LoopRepeat;
    toAction.repetitions = 0;
    toAction.timeScale = 0.05 * (reverse ? -1 : 1);
    toAction.time = reverse ? clip.duration : 0;
    console.log(toAction.time);
    toAction.weight = 1;

    console.log(pose, lastPose);

    // No gesture to gesture or gesture to no gesture.
    if (!lastPose || pose === lastPose) {
      // Stop all current animations.
      mesh.mixer.stopAllAction();
      // Play animation.
      toAction.play();
      return;
    }

    // Animate or crossfade from gesture to gesture.
    clip = this.getClip(lastPose);
    fromAction = mesh.mixer.clipAction(clip);
    fromAction.weight = 0.15;
    fromAction.timeScale = 0.05;
    fromAction.play();
    toAction.play();
    console.log(fromAction.time);
    fromAction.crossFadeTo(toAction, 10, true);
  },

  getClip: function(pose) {
    return this.clips[YOGA_ANIMATIONS[pose]];
  }
});
