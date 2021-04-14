// Width of wall segment in meters
const WALL_SEG_WIDTH = 2;
// Width (and depth) of corner wall segment in meters
const CORNER_WALL_SEG_WIDTH = 1;

AFRAME.registerComponent('base-garden', {
    schema: {
        sceneWidth: { default: 10, type: 'int' },
        sceneDepth: { default: 10, type: 'int' },
        intersectedPoint: { default: null, type: 'vec3' }
    },

    init: function () {
        const { THREE } = AFRAME;

        let el = this.el;
        let sceneWidth = Math.round(this.data.sceneWidth / WALL_SEG_WIDTH) * WALL_SEG_WIDTH;
        let sceneDepth = Math.round(this.data.sceneDepth / WALL_SEG_WIDTH) * WALL_SEG_WIDTH;

        let cornerPositions = [
            new THREE.Vector3(-sceneWidth / 2, 0, -sceneDepth / 2),
            new THREE.Vector3(sceneWidth / 2, 0, -sceneDepth / 2),
            new THREE.Vector3(sceneWidth / 2, 0, sceneDepth / 2),
            new THREE.Vector3(-sceneWidth / 2, 0, sceneDepth / 2)
        ];

        let cornerRotations = [
            new THREE.Vector3(0, 270, 0),
            new THREE.Vector3(0, 180, 0),
            new THREE.Vector3(0, 90, 0),
            new THREE.Vector3(0, 0, 0)
        ];

        function createWall(position, rotation, name) {
            let wall = document.createElement('a-entity');
            wall.setAttribute('gltf-model', '#single-wall-asset');
            wall.setAttribute('position', el.object3D.worldToLocal(position));
            wall.setAttribute('rotation', el.object3D.worldToLocal(rotation));
            wall.setAttribute('id', name);
            el.appendChild(wall);
        };

        // Add straight walls, 1 less to account for corners
        for (let i = 0; i < sceneWidth / WALL_SEG_WIDTH - 1; i++) {
            // left wall
            let wall = document.createElement('a-entity');
            createWall(
                new THREE.Vector3(cornerPositions[0].x + i * WALL_SEG_WIDTH + WALL_SEG_WIDTH, 0, cornerPositions[0].z),
                new THREE.Vector3(0, 180, 0),
                'wall' + i.toString() + 'left');

            // right wall
            createWall(
                new THREE.Vector3(cornerPositions[3].x + i * WALL_SEG_WIDTH + WALL_SEG_WIDTH, 0, cornerPositions[3].z),
                new THREE.Vector3(0, 0, 0),
                'wall' + i.toString() + 'right');
        }

        for (let i = 0; i < sceneDepth / WALL_SEG_WIDTH - 1; i++) {
            // back
            let wall = document.createElement('a-entity');
            createWall(
                new THREE.Vector3(cornerPositions[0].x, 0, cornerPositions[0].z + i * WALL_SEG_WIDTH + WALL_SEG_WIDTH),
                new THREE.Vector3(0, 270, 0),
                'wall' + i.toString() + 'back');

            // right wall
            createWall(
                new THREE.Vector3(cornerPositions[2].x, 0, cornerPositions[2].z - i * WALL_SEG_WIDTH - WALL_SEG_WIDTH),
                new THREE.Vector3(0, 90, 0),
                'wall' + i.toString() + 'front');
        }

        // Add corner walls
        for (let i = 0; i < 4; i++) {
            let corner = document.createElement('a-entity');
            corner.setAttribute('gltf-model', '#corner-wall-asset');
            corner.setAttribute('position', el.object3D.worldToLocal(cornerPositions[i]));
            corner.setAttribute('rotation', el.object3D.worldToLocal(cornerRotations[i]));
            corner.setAttribute('croquet', 'name: corner' + i.toString());
            el.appendChild(corner);
        }

        // Add floor
        console.log('width: ' + sceneWidth + ' depth: ' + sceneDepth);
        this.floorPlane = document.createElement('a-plane');
        this.floorPlane.setAttribute('width', sceneWidth);
        this.floorPlane.setAttribute('height', sceneDepth);
        this.floorPlane.setAttribute('rotation', '-90 0 0');
        this.floorPlane.setAttribute('id', 'floor');
        this.floorPlane.setAttribute('color', 'green');
        this.floorPlane.setAttribute('class', 'leftclickable');
        el.appendChild(this.floorPlane);

        this.floorPlane.addEventListener('raycaster-intersected', this.raycasterIntersected.bind(this));
        this.floorPlane.addEventListener('raycaster-intersected-cleared', this.raycasterIntersectedCleared.bind(this));
    },

    remove: function () {
        this.floorPlane.removeEventListener('raycaster-intersected', this.raycasterIntersected);
        this.floorPlane.removeEventListener('raycaster-intersected-cleared', this.raycasterIntersectedCleared);
    },

    raycasterIntersected: function (evt) {
        this.raycaster = evt.detail.el;
    },

    raycasterIntersectedCleared: function () {
        this.raycaster = null;
    },

    tick: function () {
        if (!this.raycaster) {
            this.data.intersectedPoint = null;
        } else {
            let intersection = this.raycaster.components.raycaster.getIntersection(this.floorPlane);
            if (!intersection) {
                this.data.intersectedPoint = null;
            } else {
                this.data.intersectedPoint = intersection.point;
            }
        }
    }
});
