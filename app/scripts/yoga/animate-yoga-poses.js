var YOGA_MODEL_URLS = [
  "#yoga-animations",
  "#sitting-yoga-animations",
  "#yoga-cat-cow-animations"
]

var YOGA_ANIMATIONS = [
  LYING_AND_STANDING = {
    threeLegDownwardDog: '3_leg_downward_dog',
    chair: 'chair',
    garland: 'garland',
    kingDancer: 'king_dancer',
    lunge: 'lunge',
    lunge2: 'lunge2',
    mountain: 'mountain',
    plank: 'Take 001',
    pyramid: 'pyramid',
    pyramid2: 'pyramid2',
    reverseWarrior: 'reverse_warrior',
    sidePlank: 'sidePlank',
    standingArmsRaised: 'standing_arms_raised',
    standingForwardBent: 'standing_forward_bent',
    tree: 'Tree',
    trianglePose: 'triangle_pose',
    upwardFacingDog: 'upwardFacingDog',
    warrior: 'Warrior',
    warrior2: 'warrior_2',
    warrior3: 'warrior_3',
    wideLeggedForwardBend: 'wide_legged_forward_bend'
  },
  SITTING = {
    boatPose: 'Take 001',
    headToKnee: 'headToKnee',
    seatedForwardBend: 'seatedForwardBend',
    staff: 'staff'
  },
  CAT_COW = {
    cat: 'cat',
    cow: 'Take 001'
  }
];

AFRAME.registerComponent('animate-yoga-poses', {
  init: function () {
    this.alwaysDisplay = AFRAME.utils.throttle((delta) => {
      if (this.el.getAttribute('visible') == false) return;

      this.el.object3D.traverse((object) => {
        if (object.isMesh) object.frustumCulled = false;

        let mesh = this.el.getObject3D('mesh');
        if (!mesh || !mesh.mixer) return;
        mesh.mixer.update(delta / 1000);
      });
    }, 1000 / 50, this);

    this.getTranslatedPose = this.getTranslatedPose.bind(this);
    this.findModelEntity = this.findModelEntity.bind(this);

    this.loader = new THREE.GLTFLoader();
    this.loader.setCrossOrigin('anonymous');

    this.el.setAttribute('visible', 'false');
    this.el.sceneEl.addEventListener('yogaStart', this.onYogaStart.bind(this));
    this.el.sceneEl.addEventListener('yogaStop', this.onYogaStop.bind(this));

    for (let i = 0; i < YOGA_MODEL_URLS.length; i++) {
      let newEl = document.createElement('a-entity');
      newEl.setAttribute('visible', 'false');
      newEl.setAttribute('gltf-model', YOGA_MODEL_URLS[i]);
      newEl.setAttribute('animation-mixer', {
        clampWhenFinished: true,
        clip: 'none',
        repetitions: 1
      });
      this.el.appendChild(newEl);
    }

    this.lastDisplayedEntityEl = this.el.children[0];
    this.lastDisplayedEntityEl.setAttribute('visible', 'true');
  },

  remove: function () {
    this.el.sceneEl.removeEventListener('yogaStart', this.onYogaStart);
    this.el.sceneEl.removeEventListener('yogaStop', this.onYogaStop);
  },

  onYogaStart: function () {
    this.el.setAttribute('visible', 'true');
  },

  onYogaStop: function () {
    this.el.setAttribute('visible', 'false');
  },

  tick: function (time, delta) {
    this.alwaysDisplay(delta);
  },

  /**
   * 
   * @param {string} pose - Which pose to animate to. If absent, animate to standing position
   * @param {string} lastPose - Previous gesture to reverse back to if needed
   */
  animatePose(pose, lastPose) {
    if (pose != null) {
      this.playAnimation(pose, lastPose, false);
    } else {
      this.playAnimation(lastPose, pose, true);
    }
  },

  playAnimation: function (pose, lastPose, reverse) {
    var poseEntity = this.findModelEntity(pose);
    var lastPoseEntity = this.findModelEntity(lastPose);

    if (poseEntity == null && lastPoseEntity == null) return;
    if (poseEntity != lastPoseEntity && poseEntity != null && lastPoseEntity != null) return;

    var entityToUse = poseEntity || lastPoseEntity;

    if (this.lastDisplayedEntityEl != entityToUse) {
      this.lastDisplayedEntityEl.setAttribute('visible', 'false');
      entityToUse.setAttribute('visible', 'true');
      this.lastDisplayedEntityEl = entityToUse;
    }

    var timeScale = reverse ? -1 : 1;
    entityToUse.setAttribute('animation-mixer', 'timeScale', timeScale);
    if (!lastPose) {
      entityToUse.setAttribute('animation-mixer', 'clip', 'none');
      entityToUse.setAttribute('animation-mixer', 'clip', this.getTranslatedPose(pose));
    } else {
      // Note: this doesn't work great, instead you should animate from some pose to null, then null
      // to the other pose.
      entityToUse.setAttribute('animation-mixer', 'clip', this.getTranslatedPose(pose));
      entityToUse.setAttribute('animation-mixer', 'crossFadeDuration', 2);
    }
  },

  getTranslatedPose: function (pose) {
    let i;
    for (i = 0; i < this.el.children.length; i++) {
      if (YOGA_ANIMATIONS[i][pose] != null) {
        return YOGA_ANIMATIONS[i][pose];
      }
    }
    return null;
  },

  findModelEntity: function(pose) {
    if (pose == null) return;

    for (let i = 0; i < YOGA_ANIMATIONS.length; i++) {
      if (YOGA_ANIMATIONS[i][pose] != null) {
        return this.el.children[i];
      }
    }
    return null;
  },
});
