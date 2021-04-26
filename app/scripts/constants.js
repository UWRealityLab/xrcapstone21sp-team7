// Constants used by Croquet for stuff like logging, etc

/* global Croquet */
const Q = Croquet.Constants;
Q.LOGGING = {
    index: false,

    system: false,
    component: false,

    Model: false,
    View: false,

    UserModel: false,
    UserView: false,

    EntityModel: false,
    EntityView: false,

    DemosView: false,

    GardenControls: false,
    Selector: false,
    BaseGardenGenerator: false,

    BreathCapture: true,
};

Q.GARDEN_BUILDER = {
    AssetsDir: '../assets/',
    GardenAssetLocation: '../assets/glb/',
    RotationSpeedModifier: 6,
};
