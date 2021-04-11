AFRAME.registerComponent('model-selector', {
    schema: {
        model: { type: 'asset' }
    },

    init: function () {
        let el = this.el;
        // TODO when the entity is selected, create the model and deem it draggable
        // by the user, make sure this has the croquet attribute
    },

    remove: function () { }
});
