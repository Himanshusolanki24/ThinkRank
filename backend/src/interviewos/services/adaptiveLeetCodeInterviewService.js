const { decideNextInterviewStep } = require("../engine/adaptiveInterviewEngine");
const { computeIntegritySnapshot } = require("../engine/integrityEngine");
const {
    createSession,
    getSession,
    saveSession,
    loadUserHistory,
    updateUserHistory
} = require("./interviewMemoryService");
const { fetchRandomQuestion } = require("./questionIntelligenceService");
const { sanitizeProblemForCandidate } = require("../contracts/publicProblemView");

const PERFORMANCE_WEAK_TOPIC_THRESHOLD = 5;

const inferWeakTopicsFromQuestion = (question, evaluation = {}) => {
    if ((evaluation.problemSolvingScore || evaluation.score || 0) > PERFORMANCE_WEAK_TOPIC_THRESHOLD) {
        return [];
    }

    return question.topicTags || [];
};

const inferStrongTopicsFromQuestion = (question, evaluation = {}) => {
    const score = evaluation.problemSolvingScore || evaluation.score || 0;
    return score >= 8 ? (question.topicTags || []) : [];
};

const buildRoundSummary = (question, evaluation, adaptiveDecision, integrity) => ({
    internalQuestionId: question.id,
    performanceBand: adaptiveDecision.performanceBand,
    trajectory: adaptiveDecision.trajectory,
    nextDifficulty: adaptiveDecision.nextDifficulty,
    integrityScore: integrity.integrityScore,
    weakTopicsDetected: inferWeakTopicsFromQuestion(question, evaluation)
});

const startInterviewSession = async ({
    userId = "anonymous",
    persona = "google",
    preferredLang = "javascript"
} = {}) => {
    const session = createSession({ userId, persona });
    const userHistory = await loadUserHistory(userId);
    const question = await fetchRandomQuestion({
        difficulty: "easy",
        userHistory,
        preferredLang,
        weakTopicHints: userHistory.weakTopics || []
    });

    session.roundIndex = 1;
    session.currentDifficulty = "easy";
    session.currentQuestion = question;
    session.askedSlugs = [question.titleSlug];

    saveSession(session.sessionId, session);
    await updateUserHistory(userId, {
        askedSlugs: [question.titleSlug],
        recentDifficulties: ["easy"]
    });

    return {
        sessionId: session.sessionId,
        persona,
        roundIndex: session.roundIndex,
        publicProblem: sanitizeProblemForCandidate(question),
        interviewState: {
            verificationStatus: "verified",
            integrityScore: 100
        }
    };
};

const advanceInterviewSession = async ({
    sessionId,
    evaluation = {},
    integritySignals = {},
    preferredLang = "javascript"
}) => {
    const session = getSession(sessionId);

    if (!session) {
        throw new Error("Interview session not found.");
    }

    const currentQuestion = session.currentQuestion;
    const userHistory = await loadUserHistory(session.userId);
    const integrity = computeIntegritySnapshot(integritySignals);

    const adaptiveDecision = decideNextInterviewStep({
        sessionState: {
            roundIndex: session.roundIndex,
            currentDifficulty: session.currentDifficulty
        },
        evaluation,
        integrity,
        candidateProfile: {
            weakTopics: userHistory.weakTopics || []
        }
    });

    const weakTopics = inferWeakTopicsFromQuestion(currentQuestion, evaluation);
    const strongTopics = inferStrongTopicsFromQuestion(currentQuestion, evaluation);

    await updateUserHistory(session.userId, {
        solvedSlugs: (evaluation.problemSolvingScore || evaluation.score || 0) >= 7 ? [currentQuestion.titleSlug] : [],
        weakTopics,
        strongTopics,
        recentDifficulties: [session.currentDifficulty],
        repeatedMistakes: weakTopics.length > 0 ? [`round_${session.roundIndex}:${weakTopics.join(",")}`] : []
    });

    const nextQuestion = await fetchRandomQuestion({
        difficulty: adaptiveDecision.nextDifficulty,
        userHistory,
        preferredLang,
        weakTopicHints: adaptiveDecision.recommendedWeakTopic ? [adaptiveDecision.recommendedWeakTopic] : weakTopics
    });

    session.roundIndex += 1;
    session.currentDifficulty = adaptiveDecision.nextDifficulty;
    session.currentQuestion = nextQuestion;
    session.askedSlugs = [...session.askedSlugs, nextQuestion.titleSlug];
    session.performanceHistory = [...session.performanceHistory, buildRoundSummary(currentQuestion, evaluation, adaptiveDecision, integrity)];
    session.integrityHistory = [...session.integrityHistory, integrity];

    saveSession(sessionId, session);
    await updateUserHistory(session.userId, {
        askedSlugs: [nextQuestion.titleSlug]
    });

    return {
        sessionId,
        roundIndex: session.roundIndex,
        adaptiveDecision,
        integrity,
        nextProblem: sanitizeProblemForCandidate(nextQuestion),
        interviewerGuidance: {
            optimizationFollowUp: adaptiveDecision.shouldAskOptimizationFollowUp
                ? "Can you improve the brute-force approach and explain the complexity tradeoff?"
                : "Walk me through your reasoning and test strategy.",
            edgeCaseProbe: adaptiveDecision.shouldProbeEdgeCases
                ? "What edge cases would break a naive implementation?"
                : "What assumptions are you making about the input?",
            pressurePrompt: "I care about the final production-quality approach, not just a passing answer."
        }
    };
};

module.exports = {
    startInterviewSession,
    advanceInterviewSession
};
