/* global AFRAME, Q, THREE */

// Width of wall segment in meters
const WALL_SEG_WIDTH = 10;
// Width of entry building in meters
const ENTRY_WIDTH = 10;
// Width (and depth) of corner wall segment in meters
const CORNER_WALL_SEG_WIDTH = 1.8;

AFRAME.registerComponent("base-garden", {
  schema: {
    sceneWidth: { default: 1, type: "int" },
    sceneDepth: { default: 1, type: "int" },
    intersectedPoint: { default: null, type: "vec3" },
  },

  init: function () {
    const { THREE } = AFRAME;

    let el = this.el;
    let sceneWidth =
      this.data.sceneWidth * WALL_SEG_WIDTH + 2 * CORNER_WALL_SEG_WIDTH;
    let sceneDepth =
      this.data.sceneDepth * WALL_SEG_WIDTH + 2 * CORNER_WALL_SEG_WIDTH;
    console.log("sceneWidth: ", sceneWidth);
    console.log("sceneDepth: ", sceneDepth);

    let cornerPositions = [
      new THREE.Vector3(-sceneWidth / 2, 0, -sceneDepth / 2),
      new THREE.Vector3(sceneWidth / 2, 0, -sceneDepth / 2),
      new THREE.Vector3(sceneWidth / 2, 0, sceneDepth / 2),
      new THREE.Vector3(-sceneWidth / 2, 0, sceneDepth / 2),
    ];

    let cornerRotations = [
      new THREE.Vector3(0, 180, 0),
      new THREE.Vector3(0, 90, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 270, 0),
    ];

    function createWall(position, rotation, name) {
      let wall = document.createElement("a-entity");
      wall.setAttribute("gltf-model", "#single-wall-asset");
      wall.setAttribute("position", el.object3D.worldToLocal(position));
      wall.setAttribute("rotation", el.object3D.worldToLocal(rotation));
      // wall.setAttribute('croquet', 'name: ' + name);
      wall.setAttribute("shadow", "receive: true; cast: true");
      wall.setAttribute("scale", "1.0006 0.6 1");
      wall.setAttribute("id", name);
      el.appendChild(wall);
    }

    // Add straight walls, 1 less to account for corners
    const widthGap = sceneWidth - 2 * CORNER_WALL_SEG_WIDTH;
    const depthGap = sceneDepth - 2 * CORNER_WALL_SEG_WIDTH;
    const wallOffset = CORNER_WALL_SEG_WIDTH + WALL_SEG_WIDTH / 2;
    for (let i = 0; i < widthGap / WALL_SEG_WIDTH; i++) {
      // left wall
      createWall(
        new THREE.Vector3(
          cornerPositions[0].x + i * WALL_SEG_WIDTH + wallOffset,
          0,
          cornerPositions[0].z
        ),
        new THREE.Vector3(0, 180, 0),
        "wall" + i.toString() + "left"
      );

      // right wall
      createWall(
        new THREE.Vector3(
          cornerPositions[3].x + i * WALL_SEG_WIDTH + wallOffset,
          0,
          cornerPositions[3].z
        ),
        new THREE.Vector3(0, 0, 0),
        "wall" + i.toString() + "right"
      );
    }

    const middle = Math.floor(depthGap / WALL_SEG_WIDTH / 2);
    for (let i = 0; i < depthGap / WALL_SEG_WIDTH; i++) {
      console.log("i: ", i);
      // back
      createWall(
        new THREE.Vector3(
          cornerPositions[0].x,
          0,
          cornerPositions[0].z + i * WALL_SEG_WIDTH + wallOffset
        ),
        new THREE.Vector3(0, 270, 0),
        "wall" + i.toString() + "back"
      );

      // front and entry building
      if (i != middle) {
        createWall(
          new THREE.Vector3(
            cornerPositions[2].x,
            0,
            cornerPositions[2].z - i * WALL_SEG_WIDTH - wallOffset
          ),
          new THREE.Vector3(0, 90, 0),
          "wall" + i.toString() + "front"
        );
      } else {
        let building = document.createElement("a-entity");
        building.setAttribute("id", "entrance-building");
        building.setAttribute("class", "walkable");
        building.setAttribute("gltf-model", "#entry-building");
        building.setAttribute(
          "position",
          el.object3D.worldToLocal(
            new THREE.Vector3(
              cornerPositions[2].x,
              0,
              cornerPositions[2].z -
                i * WALL_SEG_WIDTH - wallOffset
            )
          )
        );
        building.setAttribute(
          "rotation",
          el.object3D.worldToLocal(new THREE.Vector3(0, 270, 0))
        );
        building.setAttribute("scale", "1.1 1 1");
        el.appendChild(building);
      }
    }

    // Add corner walls
    for (let i = 0; i < 4; i++) {
      let corner = document.createElement("a-entity");
      corner.setAttribute("gltf-model", "#corner-wall-asset");
      corner.setAttribute("scale", "1 0.6 1.1");
      corner.setAttribute(
        "position",
        el.object3D.worldToLocal(cornerPositions[i])
      );
      corner.setAttribute(
        "rotation",
        el.object3D.worldToLocal(cornerRotations[i])
      );
      // corner.setAttribute('croquet', 'name: corner' + i.toString());
      corner.setAttribute("shadow", "receive: true; cast: true");
      el.appendChild(corner);
    }

    // Add floor
    console.log("width: " + sceneWidth + " depth: " + sceneDepth);
    this.floorPlane = document.createElement("a-plane");
    this.floorPlane.setAttribute("width", sceneWidth);
    this.floorPlane.setAttribute("height", sceneDepth);
    this.floorPlane.setAttribute("rotation", "-90 0 0");
    this.floorPlane.setAttribute("id", "floor");
    this.floorPlane.setAttribute("color", "green");
    this.floorPlane.setAttribute("class", "ground");
    this.floorPlane.setAttribute("roughness", "0.9");
    this.floorPlane.setAttribute("shadow", "receive: true; cast: false");

    el.appendChild(this.floorPlane);

    this.floorPlane.addEventListener(
      "raycaster-intersected",
      this.raycasterIntersected.bind(this)
    );
    this.floorPlane.addEventListener(
      "raycaster-intersected-cleared",
      this.raycasterIntersectedCleared.bind(this)
    );

    // Add teleportation cubes
    // let halfWidth = sceneWidth / 2;
    // let halfDepth = sceneDepth / 2;
    // let teleportIncrement = 10;
    // for (let width = -halfWidth + 5; width < halfWidth; width += teleportIncrement) {
    //   for (let depth = -halfDepth + 5; depth < halfDepth; depth += teleportIncrement) {
    //     let teleport = document.createElement('a-box')
    //     teleport.setAttribute('class', 'clickable');
    //     teleport.setAttribute('blink-teleportation', {});
    //     teleport.setAttribute('teleportation-checkpoint', {});
    //     teleport.setAttribute('position', {x: width, y: -0.35, z: depth});
    //     // Not sure if necessary but saw the corners had these, so just in case
    //     teleport.setAttribute('croquet', 'name: teleport-' + width.toString() + '-' + depth.toString());
    //     el.appendChild(teleport);
    //   }
    // }
  },

  remove: function () {
    this.floorPlane.removeEventListener(
      "raycaster-intersected",
      this.raycasterIntersected
    );
    this.floorPlane.removeEventListener(
      "raycaster-intersected-cleared",
      this.raycasterIntersectedCleared
    );
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
      let intersection = this.raycaster.components.raycaster.getIntersection(
        this.floorPlane
      );
      // TODO make this less janky
      if (
        !intersection ||
        (intersection.point.x == 0 &&
          intersection.point.y == 0 &&
          intersection.point.z == 0)
      ) {
        this.data.intersectedPoint = null;
      } else {
        this.data.intersectedPoint = intersection.point;
      }
    }
  },

  log: function (string, ...etc) {
    if (!Q.LOGGING.BaseGardenGenerator) {
      return;
    }

    console.groupCollapsed(`[Component] ${string}`, ...etc);
    console.trace(); // hidden in collapsed group
    console.groupEnd();
  },
});
