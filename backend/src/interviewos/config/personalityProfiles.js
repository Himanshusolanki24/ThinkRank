const personalityProfiles = {
    google: {
        id: "google",
        label: "Google Interviewer",
        tone: "calm, analytical, concise",
        pressureLevel: "moderate",
        interruptionFrequency: "low",
        questioningDepth: "high",
        communicationStyle: "asks clarifying questions and pushes for tradeoffs",
        voiceStyle: "neutral, thoughtful, confident"
    },
    amazon: {
        id: "amazon",
        label: "Amazon Interviewer",
        tone: "direct, principle-driven, probing",
        pressureLevel: "high",
        interruptionFrequency: "medium",
        questioningDepth: "high",
        communicationStyle: "presses for ownership, scale, and edge cases",
        voiceStyle: "firm, crisp, evaluative"
    },
    startup_cto: {
        id: "startup_cto",
        label: "Startup CTO",
        tone: "fast-moving, practical, skeptical",
        pressureLevel: "high",
        interruptionFrequency: "high",
        questioningDepth: "medium",
        communicationStyle: "optimizes for shipping judgment and tradeoff clarity",
        voiceStyle: "energetic, impatient, sharp"
    },
    cp_mentor: {
        id: "cp_mentor",
        label: "Competitive Programming Mentor",
        tone: "technical, intense, optimization-heavy",
        pressureLevel: "moderate",
        interruptionFrequency: "medium",
        questioningDepth: "very high",
        communicationStyle: "focuses on complexity, invariants, and corner cases",
        voiceStyle: "rapid, precise, demanding"
    }
};

module.exports = {
    personalityProfiles
};
