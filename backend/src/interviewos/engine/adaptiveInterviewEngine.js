const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const DIFFICULTY_LADDER = ["easy", "medium", "hard"];

const moveDifficulty = (current, offset) => {
    const currentIndex = Math.max(DIFFICULTY_LADDER.indexOf(current), 0);
    const nextIndex = clamp(currentIndex + offset, 0, DIFFICULTY_LADDER.length - 1);
    return DIFFICULTY_LADDER[nextIndex];
};

const inferPerformanceBand = (evaluation = {}) => {
    const score = Number(evaluation.score || 0);
    const optimization = Number(evaluation.optimizationScore || 0);
    const communication = Number(evaluation.communicationScore || 0);

    if (score >= 8 && optimization >= 7 && communication >= 6) {
        return "strong";
    }

    if (score >= 5) {
        return "mixed";
    }

    return "weak";
};

const decideNextInterviewStep = ({
    sessionState = {},
    evaluation = {},
    integrity = {},
    candidateProfile = {}
}) => {
    const currentDifficulty = sessionState.currentDifficulty || "easy";
    const performanceBand = inferPerformanceBand(evaluation);
    const weakTopics = candidateProfile.weakTopics || [];
    const pendingBehavioralProbe = Boolean(sessionState.pendingBehavioralProbe);
    const roundIndex = Number(sessionState.roundIndex || 1);

    let nextDifficulty = currentDifficulty;
    let trajectory = "hold";

    if (performanceBand === "strong") {
        nextDifficulty = moveDifficulty(currentDifficulty, 1);
        trajectory = "upgrade";
    } else if (performanceBand === "weak") {
        nextDifficulty = moveDifficulty(currentDifficulty, -1);
        trajectory = "downgrade";
    }

    const shouldEscalateIntegrityReview = (integrity.integrityScore || 100) < 70;

    return {
        roundIndex,
        performanceBand,
        trajectory,
        nextDifficulty,
        shouldAskOptimizationFollowUp: performanceBand !== "weak",
        shouldProbeEdgeCases: performanceBand === "strong" || evaluation.edgeCaseScore >= 6,
        shouldInjectBehavioralProbe: pendingBehavioralProbe || roundIndex % 3 === 0,
        shouldEscalateIntegrityReview,
        nextTopicStrategy: weakTopics.length > 0 ? "target_weak_topic" : "balanced_rotation",
        recommendedWeakTopic: weakTopics[0] || null,
        backendOnlyRationale: {
            score: evaluation.score || 0,
            optimizationScore: evaluation.optimizationScore || 0,
            communicationScore: evaluation.communicationScore || 0,
            integrityScore: integrity.integrityScore || 100
        }
    };
};

const chooseDifficultyFromProgression = ({
    currentDifficulty = "easy",
    problemSolvingScore = 0,
    optimizationScore = 0,
    communicationScore = 0
} = {}) => {
    const performanceBand = inferPerformanceBand({
        score: problemSolvingScore,
        optimizationScore,
        communicationScore
    });

    if (performanceBand === "strong") {
        return moveDifficulty(currentDifficulty, 1);
    }

    if (performanceBand === "weak") {
        return moveDifficulty(currentDifficulty, -1);
    }

    return currentDifficulty;
};

module.exports = {
    decideNextInterviewStep,
    inferPerformanceBand,
    moveDifficulty,
    chooseDifficultyFromProgression
};
