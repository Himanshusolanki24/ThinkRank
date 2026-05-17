const weightedPenalty = (value, weight, cap = 100) => {
    return Math.min(Number(value || 0) * weight, cap);
};

const computeIntegritySnapshot = (signals = {}) => {
    const penalties = {
        tabSwitches: weightedPenalty(signals.tabSwitches, 6),
        copyPasteAttempts: weightedPenalty(signals.copyPasteAttempts, 18),
        hiddenWindowSeconds: weightedPenalty(signals.hiddenWindowSeconds, 0.6),
        multipleFaceFrames: weightedPenalty(signals.multipleFaceFrames, 1.2),
        gazeAwayFrames: weightedPenalty(signals.gazeAwayFrames, 0.2),
        suspiciousIdleSeconds: weightedPenalty(signals.suspiciousIdleSeconds, 0.5),
        abnormalTypingBursts: weightedPenalty(signals.abnormalTypingBursts, 4),
        audioDeviceChanges: weightedPenalty(signals.audioDeviceChanges, 7)
    };

    const totalPenalty = Object.values(penalties).reduce((sum, penalty) => sum + penalty, 0);
    const integrityScore = Math.max(0, Math.round(100 - totalPenalty));

    let status = "verified";
    if (integrityScore < 85) status = "review";
    if (integrityScore < 60) status = "unverified";

    return {
        integrityScore,
        status,
        penalties,
        requiresHumanReview: integrityScore < 85,
        shouldFreezeSession: integrityScore < 40
    };
};

module.exports = {
    computeIntegritySnapshot
};
