/* global AFRAME, Croquet, Q */
import View from "./view/view.js";
import Model from "./model/model.js";

function log(string, ...etc) {
    if (!Q.LOGGING.index) return;
    console.groupCollapsed(`[System] ${string}`, ...etc);
    console.trace(); // hidden in collapsed group
    console.groupEnd();
}

const onSceneExists = () => {
    // grab the main A-Frame scene
    const scene = AFRAME.scenes[0];

    // Because modules load after the document/scene loads, we can't register the system/component in this file
    // instead wait for the scene to load before creating the session
    // otherwise the registered "croquet" system won't receive the emitted "createcroquetsession" event containing the Model/View
    const onSceneLoaded = () => {
        log("A-Frame scene has loaded");
        scene.emit("createcroquetsession", { Model, View });
    };

    log("Waiting for A-Frame scene to load...");
    if (scene.hasLoaded) {
        onSceneLoaded();
    } else {
        scene.addEventListener("loaded", event => onSceneLoaded(), { once: true });
    }
}

const scene = AFRAME.scenes[0];
if (scene) {
    onSceneExists();
} else {
    log("Waiting for A-Frame scene to exist...");
    document.querySelector('a-scene').addEventListener('loaded', event=> onSceneExists(), { once: true });
}
