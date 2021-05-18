// Modified from https://github.com/n5ro/aframe-extras/blob/master/src/primitives/a-ocean.js
AFRAME.registerPrimitive('a-lake', {
  defaultComponents: {
    lake: {},
    rotation: { x: -90, y: 0, z: 0 }
  },
  mappings: {
    width: 'lake-component.width',
    depth: 'lake-component.depth',
    density: 'lake-component.density',
    amplitude: 'lake-component.amplitude',
    amplitudeVariance: 'lake-component.amplitudeVariance',
    speed: 'lake-component.speed',
    speedVariance: 'lake-component.speedVariance',
    color: 'lake-component.color',
    opacity: 'lake-component.opacity'
  }
});

AFRAME.registerComponent('lake-component', {
  schema: {
    // Dimensions of the ocean area.
    width: { default: 10, min: 0 },
    depth: { default: 10, min: 0 },

    // Density of waves.
    density: { default: 10 },

    // Wave amplitude and variance.
    amplitude: { default: 0.1 },
    amplitudeVariance: { default: 0.3 },

    // Wave speed and variance.
    speed: { default: 1 },
    speedVariance: { default: 2 },

    // Material.
    color: { default: '#7AD2F7', type: 'color' },
    opacity: { default: 0.8 }
  },

  /**
   * Use play() instead of init(), because component mappings – unavailable as dependencies – are
   * not guaranteed to have parsed when this component is initialized.
   */
  play: function () {
    const el = this.el;
    const data = this.data;
    let material = el.components.material;

    let geometry = new THREE.PlaneGeometry(data.width, data.depth, data.density, data.density);
    geometry = THREE.BufferGeometryUtils.mergeVertices(geometry);
    this.waves = [];
    for (let v, i = 0, l = geometry.attributes.position.count; i < l; i++) {
      v = geometry.attributes.position;
      this.waves.push({
        z: v.getZ(i),
        ang: Math.random() * Math.PI,
        amp: data.amplitude + Math.random() * data.amplitudeVariance,
        speed: (data.speed + Math.random() * data.speedVariance) / 1000 // radians / frame
      });
    }

    if (!material) {
      material = {};
      material.material = new THREE.MeshPhongMaterial({
        color: data.color,
        transparent: data.opacity < 1,
        opacity: data.opacity,
        flatShading: true
      });
    }

    this.mesh = new THREE.Mesh(geometry, material.material);
    el.setObject3D('mesh', this.mesh);
  },

  remove: function () {
    this.el.removeObject3D('mesh');
  },

  tick: function (t, dt) {
    if (!dt) return;

    const verts = this.mesh.geometry.attributes.position.array;
    for (let i = 0, j = 2; i < this.waves.length; i++, j = j + 3) {
      const vprops = this.waves[i];
      verts[j] = vprops.z + Math.sin(vprops.ang) * vprops.amp;
      vprops.ang += vprops.speed * dt;
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
  }
});