/**
 * Practice Recommendation Service
 * 
 * Provides skill-gap-driven, platform-aware problem recommendations.
 * Uses interview results to detect weak areas and suggests targeted practice.
 */

const problemDatabase = require("../data/problemDatabase.json");

/**
 * Gap types and their characteristics
 */
const GAP_TYPES = {
    conceptual: {
        description: "Understanding of core concepts needs improvement",
        platform: "LeetCode",
        reason: "LeetCode provides detailed explanations and community discussions"
    },
    fundamentals: {
        description: "Basic implementation skills need practice",
        platform: "HackerRank",
        reason: "HackerRank offers structured tutorials and beginner-friendly problems"
    },
    speed: {
        description: "Problem-solving speed and consistency need improvement",
        platform: "CodeChef",
        reason: "CodeChef contests help build speed and consistency"
    },
    algorithmic: {
        description: "Advanced algorithmic thinking needs development",
        platform: "Codeforces",
        reason: "Codeforces offers challenging algorithmic problems"
    }
};

/**
 * Detect skill gaps from interview results
 * @param {Array} interviewResults - Array of interview answer results
 * @returns {Object} Skill gap analysis
 */
const detectSkillGap = (interviewResults) => {
    if (!interviewResults || interviewResults.length === 0) {
        // Default fallback when no interview data
        return {
            topic: "Arrays",
            gapType: "fundamentals",
            severity: "medium",
            confidence: 0.5,
            reason: "Start with fundamentals - no interview history available"
        };
    }

    // Analyze weak topics from interview results
    const topicScores = {};
    const topicFollowUps = {};

    for (const result of interviewResults) {
        const topic = result.topic || result.question_topic || "General";
        const score = result.score || 0;
        const classification = result.classification || "partial";

        if (!topicScores[topic]) {
            topicScores[topic] = [];
            topicFollowUps[topic] = 0;
        }

        topicScores[topic].push(score);

        // Count follow-up failures (wrong or partial answers)
        if (classification === "wrong" || classification === "partial") {
            topicFollowUps[topic]++;
        }
    }

    // Calculate average scores and find weakest topic
    let weakestTopic = null;
    let lowestAvgScore = Infinity;
    let mostFollowUps = 0;

    for (const [topic, scores] of Object.entries(topicScores)) {
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const followUps = topicFollowUps[topic] || 0;

        // Weight by both low scores and high follow-up count
        const weaknessScore = avgScore - (followUps * 5);

        if (weaknessScore < lowestAvgScore) {
            lowestAvgScore = weaknessScore;
            weakestTopic = topic;
            mostFollowUps = followUps;
        }
    }

    // Determine gap type based on topic
    const topicMapping = problemDatabase.topicToGapType || {};
    const gapType = topicMapping[weakestTopic] || "conceptual";

    // Determine severity
    let severity = "low";
    if (lowestAvgScore < 3) severity = "high";
    else if (lowestAvgScore < 6) severity = "medium";

    return {
        topic: weakestTopic || "Arrays",
        gapType,
        severity,
        confidence: Math.max(0.5, 1 - (lowestAvgScore / 10)),
        avgScore: lowestAvgScore,
        followUpCount: mostFollowUps,
        reason: GAP_TYPES[gapType]?.description || "Needs improvement"
    };
};

/**
 * Select the appropriate platform based on gap type
 * @param {string} gapType - Type of skill gap
 * @returns {Object} Platform information
 */
const selectPlatform = (gapType) => {
    const platformMapping = problemDatabase.gapTypeToPlatform || GAP_TYPES;
    const platform = platformMapping[gapType] || "LeetCode";

    return {
        platform,
        reason: GAP_TYPES[gapType]?.reason || "Best for general practice"
    };
};

/**
 * Select a problem based on topic, platform, and difficulty
 * @param {string} topic - Target topic
 * @param {string} platform - Target platform
 * @param {string} difficulty - Target difficulty
 * @param {Array} excludeIds - Problem IDs to exclude (e.g., yesterday's problem)
 * @returns {Object|null} Selected problem
 */
const selectProblem = (topic, platform, difficulty = "easy", excludeIds = []) => {
    const problems = problemDatabase.problems || [];

    // Filter by topic and platform
    let candidates = problems.filter(p =>
        p.topic.toLowerCase() === topic.toLowerCase() &&
        p.platform === platform &&
        !excludeIds.includes(p.id)
    );

    // If no exact match, try just the topic
    if (candidates.length === 0) {
        candidates = problems.filter(p =>
            p.topic.toLowerCase() === topic.toLowerCase() &&
            !excludeIds.includes(p.id)
        );
    }

    // If still no match, try platform only
    if (candidates.length === 0) {
        candidates = problems.filter(p =>
            p.platform === platform &&
            !excludeIds.includes(p.id)
        );
    }

    // If still no match, get any problem
    if (candidates.length === 0) {
        candidates = problems.filter(p => !excludeIds.includes(p.id));
    }

    if (candidates.length === 0) {
        return null;
    }

    // Sort by difficulty preference: easy < medium < hard
    const diffOrder = { easy: 1, medium: 2, hard: 3 };
    const targetDiff = diffOrder[difficulty] || 1;

    candidates.sort((a, b) => {
        const aDiff = diffOrder[a.difficulty] || 2;
        const bDiff = diffOrder[b.difficulty] || 2;
        return Math.abs(aDiff - targetDiff) - Math.abs(bDiff - targetDiff);
    });

    // Pick a random problem from top matches
    const topCandidates = candidates.slice(0, Math.min(5, candidates.length));
    return topCandidates[Math.floor(Math.random() * topCandidates.length)];
};

/**
 * Generate today's practice task based on user's interview history
 * @param {Array} interviewResults - User's recent interview results
 * @param {Array} recentProblemIds - IDs of recently recommended problems
 * @returns {Object} Today's practice recommendation
 */
const generateTodayTask = (interviewResults = [], recentProblemIds = []) => {
    // Step 1: Detect skill gap
    const skillGap = detectSkillGap(interviewResults);

    // Step 2: Select platform
    const platformInfo = selectPlatform(skillGap.gapType);

    // Step 3: Determine difficulty based on gap severity
    let targetDifficulty = "easy";
    if (skillGap.severity === "low") targetDifficulty = "medium";
    if (skillGap.severity === "high") targetDifficulty = "easy"; // Go back to basics

    // Step 4: Select problem
    const problem = selectProblem(
        skillGap.topic,
        platformInfo.platform,
        targetDifficulty,
        recentProblemIds
    );

    if (!problem) {
        // Fallback problem
        return {
            topic: "Arrays",
            platform: "LeetCode",
            title: "Two Sum",
            url: "https://leetcode.com/problems/two-sum/",
            difficulty: "easy",
            reason: "A great problem to practice fundamentals",
            explanation: "This classic problem helps build a strong foundation in array manipulation and hash table usage."
        };
    }

    // Generate human-readable explanation
    const explanation = generateExplanation(skillGap, platformInfo, problem);

    return {
        topic: problem.topic,
        platform: problem.platform,
        title: problem.title,
        url: problem.url,
        difficulty: problem.difficulty,
        tags: problem.tags || [],
        reason: platformInfo.reason,
        explanation,
        skillGap: {
            type: skillGap.gapType,
            severity: skillGap.severity,
            topic: skillGap.topic
        }
    };
};

/**
 * Generate a human-readable explanation for the recommendation
 * @param {Object} skillGap - Skill gap analysis
 * @param {Object} platformInfo - Platform selection info
 * @param {Object} problem - Selected problem
 * @returns {string} Explanation text
 */
const generateExplanation = (skillGap, platformInfo, problem) => {
    const severityText = {
        high: "significantly improve",
        medium: "strengthen",
        low: "polish"
    };

    const action = severityText[skillGap.severity] || "practice";

    return `Based on your interview performance, we recommend focusing on ${skillGap.topic} to ${action} your skills. ` +
        `This ${problem.difficulty} problem on ${problem.platform} will help you ${skillGap.reason.toLowerCase()}. ` +
        `${platformInfo.reason}.`;
};

/**
 * Get all available topics from the problem database
 * @returns {Array} List of unique topics
 */
const getAvailableTopics = () => {
    const problems = problemDatabase.problems || [];
    return [...new Set(problems.map(p => p.topic))];
};

/**
 * Get problems by topic
 * @param {string} topic - Topic to filter by
 * @returns {Array} Problems for the topic
 */
const getProblemsByTopic = (topic) => {
    const problems = problemDatabase.problems || [];
    return problems.filter(p => p.topic.toLowerCase() === topic.toLowerCase());
};

module.exports = {
    detectSkillGap,
    selectPlatform,
    selectProblem,
    generateTodayTask,
    generateExplanation,
    getAvailableTopics,
    getProblemsByTopic,
    GAP_TYPES
};
