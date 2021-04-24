// See https://github.com/aframevr/aframe/blob/v1.2.0/src/components/hand-controls.js for reference

var MODEL_URLS = {
    toonLeft: 'https://cdn.aframe.io/controllers/hands/leftHand.glb',
    toonRight: 'https://cdn.aframe.io/controllers/hands/rightHand.glb',
    lowPolyLeft: 'https://cdn.aframe.io/controllers/hands/leftHandLow.glb',
    lowPolyRight: 'https://cdn.aframe.io/controllers/hands/rightHandLow.glb',
    highPolyLeft: 'https://cdn.aframe.io/controllers/hands/leftHandHigh.glb',
    highPolyRight: 'https://cdn.aframe.io/controllers/hands/rightHandHigh.glb'
};

// Poses.
var ANIMATIONS = {
    open: 'Open',
    // point: grip active, trackpad surface active, trigger inactive.
    point: 'Point',
    // pointThumb: grip active, trigger inactive, trackpad surface inactive.
    pointThumb: 'Point + Thumb',
    // fist: grip active, trigger active, trackpad surface active.
    fist: 'Fist',
    // hold: trigger active, grip inactive.
    hold: 'Hold',
    // thumbUp: grip active, trigger active, trackpad surface inactive.
    thumbUp: 'Thumb Up'
};

// Map animation to public events for the API.
var EVENTS = {};
EVENTS[ANIMATIONS.fist] = 'grip';
EVENTS[ANIMATIONS.thumbUp] = 'pistol';
EVENTS[ANIMATIONS.point] = 'pointing';

AFRAME.registerComponent('fake-hands', {
    schema: {
        color: { default: 'white', type: 'color' },
        hand: { default: 'left' },
        handModelStyle: { default: 'lowPoly', oneOf: ['lowPoly', 'highPoly', 'toon'] }
    },

    init: function() {
        this.loader = new THREE.GLTFLoader();
        this.loader.setCrossOrigin('anonymous');    
    },

    // TODO add in graphics (i.e. update hand model when changed)

    update: function (previousHand) {
        var el = this.el;
        var hand = this.data.hand;
        var handModelStyle = this.data.handModelStyle;
        var handColor = this.data.color;
        var self = this;

        if (hand !== previousHand) {
            var handmodelUrl = MODEL_URLS[handModelStyle + hand.charAt(0).toUpperCase() + hand.slice(1)];
            this.loader.load(handmodelUrl, function (gltf) {
                var mesh = gltf.scene.children[0];
                var handModelOrientation = hand === 'left' ? Math.PI / 2 : -Math.PI / 2;
                mesh.mixer = new THREE.AnimationMixer(mesh);
                self.clips = gltf.animations;
                el.setObject3D('mesh', mesh);

                var handMaterial = mesh.children[1].material;
                handMaterial.color = new THREE.Color(handColor);
                mesh.position.set(0, 0, 0);
                mesh.rotation.set(0, 0, handModelOrientation);
            });
        }
    },

    remove: function () {
        this.el.removeObject3D('mesh');
      },
});
