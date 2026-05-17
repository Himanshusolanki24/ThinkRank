const secureIdePolicies = {
    disableCopy: true,
    disablePaste: true,
    disableCut: true,
    monitorVisibility: true,
    monitorFocus: true,
    monitorIdle: true,
    monitorKeyboardBursts: true,
    monitorFaceCount: true,
    monitorGaze: true
};

const integritySignalWeights = {
    tabSwitches: 6,
    copyPasteAttempts: 18,
    hiddenWindowSeconds: 0.6,
    multipleFaceFrames: 1.2,
    gazeAwayFrames: 0.2,
    suspiciousIdleSeconds: 0.5,
    abnormalTypingBursts: 4,
    audioDeviceChanges: 7
};

module.exports = {
    secureIdePolicies,
    integritySignalWeights
};
