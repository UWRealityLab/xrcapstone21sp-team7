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
    // console.log("sceneWidth: ", sceneWidth);
    // console.log("sceneDepth: ", sceneDepth);

    this.raycasterIntersected = this.raycasterIntersected.bind(this);
    this.raycasterIntersectedCleared = this.raycasterIntersectedCleared.bind(this);

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

    // function createWall(position, rotation, name) {
    //   let wall = document.createElement("a-entity");
    //   wall.setAttribute("gltf-model", "#single-wall-asset");
    //   wall.setAttribute("position", el.object3D.worldToLocal(position));
    //   wall.setAttribute("rotation", el.object3D.worldToLocal(rotation));
    //   // wall.setAttribute('croquet', 'name: ' + name);
    //   wall.setAttribute("shadow", "receive: true; cast: true");
    //   wall.setAttribute("scale", "1.0006 0.6 1");
    //   wall.setAttribute("id", name);
    //   el.appendChild(wall);
    // }

    // function createYogaCorner(index, xoffset, yoffset, rotation) {
    //   let corner = document.createElement("a-entity");
    //   corner.setAttribute("gltf-model", "#corner-wall-asset");
    //   corner.setAttribute("scale", "1 0.6 1.1");
    //   corner.setAttribute(
    //     "position",
    //     el.object3D.worldToLocal(
    //       new THREE.Vector3(
    //         cornerPositions[0].x + xoffset,
    //         0,
    //         cornerPositions[0].z + index * WALL_SEG_WIDTH + CORNER_WALL_SEG_WIDTH + yoffset
    //       )
    //     )
    //   );
    //   corner.setAttribute(
    //     "rotation",
    //     el.object3D.worldToLocal(new THREE.Vector3(0, rotation, 0))
    //   );
    //   corner.setAttribute("shadow", "receive: true; cast: true");
    //   el.appendChild(corner);
    // }

    // function generateYogaGarden(index) {
    //     // gate, walls, and corners
    //     // TODO: change hardcoded offsets for corners
    //     createYogaCorner(index, 0, 1.8, 0);
    //     createYogaCorner(index, -10, 1.8, 180);
    //     createYogaCorner(index, 0, 8.2, 90);
    //     createYogaCorner(index, -10, 8.2, 270);

    //     createWall(
    //       new THREE.Vector3(
    //         cornerPositions[0].x - 5,
    //         0,
    //         cornerPositions[0].z + index * WALL_SEG_WIDTH + wallOffset - 3.25
    //       ),
    //       new THREE.Vector3(0, 0, 0),
    //       "yoga-wall-left"
    //     )
    //     createWall(
    //       new THREE.Vector3(
    //         cornerPositions[0].x - 5,
    //         0,
    //         cornerPositions[0].z + index * WALL_SEG_WIDTH + wallOffset + 3.2
    //       ),
    //       new THREE.Vector3(0, 0, 0),
    //       "yoga-wall-right"
    //     )
    //     // Custom scaling for back wall
    //     let wall = document.createElement("a-entity");
    //     wall.setAttribute("gltf-model", "#single-wall-asset");
    //     wall.setAttribute("position", 
    //     el.object3D.worldToLocal(new THREE.Vector3(
    //       cornerPositions[0].x - 10,
    //       0,
    //       cornerPositions[0].z + index * WALL_SEG_WIDTH + wallOffset 
    //     )));
    //     wall.setAttribute("rotation", el.object3D.worldToLocal(new THREE.Vector3(0, 90, 0)));
    //     wall.setAttribute("shadow", "receive: true; cast: true");
    //     wall.setAttribute("scale", "0.75 0.6 1");
    //     wall.setAttribute("id", "yoga-wall-back");
    //     el.appendChild(wall);

    //     // Add yoga area gate
    //     let gate = document.createElement("a-entity");
    //     gate.setAttribute("id", "yoga-gate");
    //     gate.setAttribute("gltf-model", "#wall-gate");
    //     gate.setAttribute(
    //       "position",
    //       el.object3D.worldToLocal(
    //         new THREE.Vector3(
    //           cornerPositions[0].x,
    //           0,
    //           cornerPositions[0].z + index * WALL_SEG_WIDTH + wallOffset
    //         )
    //       )
    //     );
    //     gate.setAttribute(
    //       "rotation",
    //       el.object3D.worldToLocal(new THREE.Vector3(0, 270, 0))
    //     );
    //     gate.setAttribute("scale", "0.65 0.6 1");
    //     gate.setAttribute("shadow", "receive: true; cast: false");
    //     el.appendChild(gate);

        // Add yoga floor
        this.yogaPlane = document.createElement("a-plane");
        this.yogaPlane.setAttribute("position", "-31.6 0 0");
        this.yogaPlane.setAttribute("width", 14);
        this.yogaPlane.setAttribute("height", 9.6);
        this.yogaPlane.setAttribute("rotation", "-90 0 0");
        // this.yogaPlane.setAttribute("id", "floor");
        this.yogaPlane.setAttribute("color", "green");
        this.yogaPlane.setAttribute("class", "ground");
        this.yogaPlane.setAttribute("roughness", "0.9");
        this.yogaPlane.setAttribute("shadow", "receive: true; cast: false");

        el.appendChild(this.yogaPlane);

        this.yogaPlane.addEventListener(
          "raycaster-intersected",
          this.raycasterIntersected
        );
        this.yogaPlane.addEventListener(
          "raycaster-intersected-cleared",
          this.raycasterIntersectedCleared
        );
    // }

    // // Add straight walls, 1 less to account for corners
    // const widthGap = sceneWidth - 2 * CORNER_WALL_SEG_WIDTH;
    // const depthGap = sceneDepth - 2 * CORNER_WALL_SEG_WIDTH;
    // const wallOffset = CORNER_WALL_SEG_WIDTH + WALL_SEG_WIDTH / 2;
    // for (let i = 0; i < widthGap / WALL_SEG_WIDTH; i++) {
    //   // left wall
    //   createWall(
    //     new THREE.Vector3(
    //       cornerPositions[0].x + i * WALL_SEG_WIDTH + wallOffset,
    //       0,
    //       cornerPositions[0].z
    //     ),
    //     new THREE.Vector3(0, 180, 0),
    //     "wall" + i.toString() + "left"
    //   );

    //   // right wall
    //   createWall(
    //     new THREE.Vector3(
    //       cornerPositions[3].x + i * WALL_SEG_WIDTH + wallOffset,
    //       0,
    //       cornerPositions[3].z
    //     ),
    //     new THREE.Vector3(0, 0, 0),
    //     "wall" + i.toString() + "right"
    //   );
    // }

    // const depthMiddle = Math.floor(depthGap / WALL_SEG_WIDTH / 2);
    // for (let i = 0; i < depthGap / WALL_SEG_WIDTH; i++) {
    //   // back and yoga area
    //   if (i != depthMiddle) {
    //     createWall(
    //       new THREE.Vector3(
    //         cornerPositions[0].x,
    //         0,
    //         cornerPositions[0].z + i * WALL_SEG_WIDTH + wallOffset
    //       ),
    //       new THREE.Vector3(0, 270, 0),
    //       "wall" + i.toString() + "back"
    //     );
    //   } else {
    //     generateYogaGarden(i);
    //   }

    //   // front and entry building
    //   if (i != depthMiddle) {
    //     createWall(
    //       new THREE.Vector3(
    //         cornerPositions[2].x,
    //         0,
    //         cornerPositions[2].z - i * WALL_SEG_WIDTH - wallOffset
    //       ),
    //       new THREE.Vector3(0, 90, 0),
    //       "wall" + i.toString() + "front"
    //     );
    //   } else {
    //     let building = document.createElement("a-entity");
    //     building.setAttribute("id", "entrance-building");
    //     building.setAttribute("class", "walkable");
    //     building.setAttribute("gltf-model", "#entry-building");
    //     building.setAttribute(
    //       "position",
    //       el.object3D.worldToLocal(
    //         new THREE.Vector3(
    //           cornerPositions[2].x,
    //           0,
    //           cornerPositions[2].z -
    //             i * WALL_SEG_WIDTH - wallOffset
    //         )
    //       )
    //     );
    //     building.setAttribute(
    //       "rotation",
    //       el.object3D.worldToLocal(new THREE.Vector3(0, 270, 0))
    //     );
    //     building.setAttribute("scale", "1.1 1 1");
    //     el.appendChild(building);
    //   }
    // }

    // // Add corner walls
    // for (let i = 0; i < 4; i++) {
    //   let corner = document.createElement("a-entity");
    //   corner.setAttribute("gltf-model", "#corner-wall-asset");
    //   corner.setAttribute("scale", "1 0.6 1.1");
    //   corner.setAttribute(
    //     "position",
    //     el.object3D.worldToLocal(cornerPositions[i])
    //   );
    //   corner.setAttribute(
    //     "rotation",
    //     el.object3D.worldToLocal(cornerRotations[i])
    //   );
    //   // corner.setAttribute('croquet', 'name: corner' + i.toString());
    //   corner.setAttribute("shadow", "receive: true; cast: true");
    //   el.appendChild(corner);
    // }

    let gardenWalls = document.createElement("a-entity");
    gardenWalls.setAttribute("id", "building-with-walls");
    gardenWalls.setAttribute("gltf-model", "#garden-walls");
    gardenWalls.setAttribute("class", "walkable");
    el.appendChild(gardenWalls);

    // Add floor
    // console.log("width: " + sceneWidth + " depth: " + sceneDepth);
    this.floorPlane = document.createElement("a-plane");
    // Hardcoded these for now since gates are one object
    this.floorPlane.setAttribute("width", 51);
    this.floorPlane.setAttribute("height", 64);
    this.floorPlane.setAttribute("position", "0.87 0 0");
    this.floorPlane.setAttribute("rotation", "-90 0 0");
    this.floorPlane.setAttribute("id", "floor");
    this.floorPlane.setAttribute("color", "green");
    this.floorPlane.setAttribute("class", "ground");
    this.floorPlane.setAttribute("roughness", "0.9");
    this.floorPlane.setAttribute("shadow", "receive: true; cast: false");

    el.appendChild(this.floorPlane);

    this.floorPlane.addEventListener(
      "raycaster-intersected",
      this.raycasterIntersected
    );
    this.floorPlane.addEventListener(
      "raycaster-intersected-cleared",
      this.raycasterIntersectedCleared
    );

    // If a predefined garden has been specified, load it in
    const urlParams = new URLSearchParams(window.location.search);
    const preMadeGarden = urlParams.get('preMadeGarden');
    const gardenJsonURL = urlParams.get('gardenJson');
    if (preMadeGarden) {
      // read json file with garden parameters

      const gardenMetaDataURL = gardenJsonURL || `${Q.GARDEN_BUILDER.AssetsDir}preMadeGardens.json`;

      let request = new XMLHttpRequest();
      request.open('GET', gardenMetaDataURL);
      request.responseType = 'json';
      request.send();

      request.onload = function () {
        let sharedEntities = document.getElementById('new-asset-container');
        let jsonArray = request.response;

        if (!jsonArray) {
          return;
        }

        let gardenJsonData = null;
        let model = null;
        jsonArray.forEach(element => {
          if (element.name == preMadeGarden) {
            gardenJsonData = element.data
            model = element.model;
          }
        });

        if (!model && !gardenJsonData) {
          return false;
        }

        console.log('loading garden');

        if (model) {
          this.gardenModel = document.createElement('a-entity');
          this.gardenModel.setAttribute('gltf-model', model);
          this.gardenModel.setAttribute('croquet', `name: ${model}`);
          this.gardenModel.setAttribute('shadow', 'receive: false; cast: true');
          sharedEntities.appendChild(this.gardenModel);
        } else {
          // For backwards compatibility, its better to load in a single model with everything,
          // but in case we don't specify a model load in the data individually
          gardenJsonData.forEach(element => {
            let newEl = document.createElement('a-entity');
            newEl.setAttribute('position', element['position']);
            newEl.setAttribute('scale', element['scale']);
            newEl.setAttribute('rotation', element['rotation']);
            newEl.setAttribute('gltf-model', element['gltf-model']);
            newEl.setAttribute('croquet', `name=${element['croquet-name']}`);
            newEl.setAttribute('shadow', 'receive: false; cast: true');
            sharedEntities.appendChild(newEl);
          });
        }
      }
    }
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
    this.yogaPlane.removeEventListener(
      "raycaster-intersected",
      this.raycasterIntersected
    );
    this.yogaPlane.removeEventListener(
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
