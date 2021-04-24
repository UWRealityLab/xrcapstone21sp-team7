// function onSpeech(error, results) {
//     if (error) {
//         console.log(error);
//         return;
//     }
//     console.log(results[0].label, results[0].confidence);
// }

// async function main() {
//     console.log("Loading sound classifier...");
//     const speechModel = await ml5.soundClassifier('SpeechCommands18w', { probabilityThreshold: 0.95 });
//     console.log("Loaded sound classifier.");
//     speechModel.classify(onSpeech);
// }

// async function main() {
    
// }

// main();

/**
 * Connect this component to a hand with hand-controls component
 */
AFRAME.registerComponent('breath-capture', {
    dependencies: ['hand-controls'],

    init: function() {

    },

    remove: function() {

    }
});
