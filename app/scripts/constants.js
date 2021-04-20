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

    EntityModel: true,
    EntityView: true,

    DemosView: false,

    GardenControls: true,
    Selector: false,
    BaseGardenGenerator: true,
};

Q.GARDEN_BUILDER = {
    AssetsDir: '../assets/',
    GardenAssetLocation: '../assets/glb/',
    RotationSpeedModifier: 6,
};
