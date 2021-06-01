// Yoga arrays need one extra "burner" pose at start to set the starting pose

// Arrays for morning yoga routine - 4 min 35 sec
const MORNING_YOGA_ANIM_ARRAY = [
    'mountain',
    null,
    null,
    'mountain',
    'tree',
    'chair',
    'lunge',
    'lunge2',
    'warrior2',
    'warrior3',
    'plank',
    'sidePlank',
    'mountain'
];
  
const MORNING_YOGA_TIME_ARRAY = [
    15000,  // welcome screen
    15000,  // headset adjustment
    30000,  // mountain pose
    30000,  // tree pose
    30000,  // chair pose
    15000,  // lunge 1
    15000,  // lunge 2
    30000,  // warrior 2
    30000,  // warrior 1 (even though its called 3)
    30000,  // plank
    30000,  // side plank
    10000   // end
];

const QUICK_YOGA_ANIM_ARRAY = [
    'staff',
    'staff',
    'headToKnee',
    'headToKnee',
    'seatedForwardBend',
    'lunge',
    'lunge2',
    'garland',
    'mountain'
];

const QUICK_YOGA_TIME_ARRAY = [
    20000,  // staff
    15000,  // leg stretches
    15000,  // other leg
    20000,  // both legs
    20000,  // lunge 1
    20000,  // lunge 2
    30000,  // garland
    10000   // end
];

const PLANK_YOGA_ANIM_ARRAY = [
    "plank",
    "plank",
    "sidePlank",
    "sidePlank",
    "boatPose",
    "mountain"
];

const PLANK_YOGA_TIME_ARRAY = [
    60000,  // plank (tell user can pause and hold for longer)
    30000,  // sideplank side 1
    30000,  // sideplank side 2
    45000,  // boat pose
    10000   // end
];