const resumeAgent = require("./resumeAgent");
const githubAgent = require("./githubAgent");
const codingSignalsAgent = require("./codingSignalsAgent");
const behavioralAgent = require("./behavioralAgent");

class AIOrchestrator {
    /**
     * Generate complete Unified Candidate Intelligence Report
     */
    async generateUnifiedIntelligence(sessionData, candidateProfile) {
        try {
            console.log(`AI Orchestrator: Compiling report for session: ${sessionData.id}`);

            // 1. Process Behavioral signals
            const transcriptText = sessionData.messages
                ? sessionData.messages.map(m => `${m.sender}: ${m.messageText}`).join("\n")
                : "No interview messages recorded.";

            const behavioralReport = await behavioralAgent.analyze(
                transcriptText,
                sessionData.cheatingLogs || []
            );

            // 2. Fetch Github Analysis if handle exists
            let gitHubReport = null;
            if (candidateProfile.githubUsername) {
                gitHubReport = await githubAgent.analyze(candidateProfile.githubUsername);
            }

            // 3. Fetch Coding Signals
            let codingSignalsReport = null;
            if (candidateProfile.leetcodeHandle || candidateProfile.githubUsername) {
                codingSignalsReport = await codingSignalsAgent.fetchProfile(
                    candidateProfile.leetcodeHandle,
                    candidateProfile.githubUsername,
                    ""
                );
            }

            // 4. Calculate Unified Metrics
            const githubScore = gitHubReport ? gitHubReport.credibilityScore : 75;
            const leetcodeScore = codingSignalsReport ? codingSignalsReport.unifiedScore : 70;
            const clarityScore = behavioralReport.clarity || 80;
            const confidenceScore = behavioralReport.confidence || 80;

            // ThinkRank Score: weighted combination of coding, system design, and communication
            const thinkRankScore = Math.round((githubScore * 0.25) + (leetcodeScore * 0.35) + (clarityScore * 0.20) + (confidenceScore * 0.20));

            // Placement Readiness: inverse to cheating, positive to skills & consistency
            const cheatPenalty = Math.round((behavioralReport.cheatingProb || 0) * 0.5);
            const placementReadiness = Math.max(0, Math.min(100, Math.round(thinkRankScore * 0.95) - cheatPenalty));

            // Recruiter Trust Index: heavily penalized by cheating
            const trustIndex = Math.max(0, 100 - (behavioralReport.cheatingProb || 0));

            // AI Decision Recommendation
            let decision = "MAYBE";
            let reasoning = "The candidate demonstrated competent skills. Further review of code execution is recommended.";

            if (thinkRankScore >= 85 && trustIndex >= 85) {
                decision = "HIRE";
                reasoning = "Outstanding candidate with excellent technical depth, clean communication, and flawless integrity score.";
            } else if (thinkRankScore < 60 || trustIndex < 50) {
                decision = "REJECT";
                reasoning = "Performance is below required technical baseline or trust score is critically compromised.";
            }

            return {
                aiRecommendation: {
                    thinkRankScore,
                    placementReadiness,
                    credibilityScore: githubScore,
                    trustIndex,
                    decision,
                    reasoning
                },
                behavioralScore: behavioralReport,
                recruiterReport: {
                    strengths: this.compileStrengths(githubScore, leetcodeScore, clarityScore, confidenceScore),
                    weaknesses: this.compileWeaknesses(githubScore, leetcodeScore, clarityScore, confidenceScore, trustIndex),
                    overallSummary: `Candidate scored ${thinkRankScore}/100. Archetype: ${gitHubReport ? gitHubReport.archetype : "Full Stack Engineer"}. Communication clarity was strong at ${clarityScore}%.`
                }
            };
        } catch (error) {
            console.error("AIOrchestrator compilation failed:", error);
            throw error;
        }
    }

    compileStrengths(git, lc, clarity, conf) {
        const strengths = [];
        if (git >= 80) strengths.push("Strong repository architecture and framework patterns.");
        if (lc >= 80) strengths.push("Excellent algorithmic efficiency and edge case handling.");
        if (clarity >= 80) strengths.push("Clear, structured explanation of systems design concepts.");
        if (conf >= 80) strengths.push("Displays composure and directness in technical problem-solving.");
        if (strengths.length === 0) strengths.push("Familiarity with standard software development workflow.");
        return strengths;
    }

    compileWeaknesses(git, lc, clarity, conf, trust) {
        const weaknesses = [];
        if (git < 75) weaknesses.push("Needs better project structures and repository organization.");
        if (lc < 75) weaknesses.push("Struggles with time-complexity bounds under strict constraints.");
        if (clarity < 75) weaknesses.push("Communication is slightly disorganized when explaining state modifications.");
        if (trust < 80) weaknesses.push("Suspicious activity logs (e.g. browser focus changes) require verification.");
        if (weaknesses.length === 0) weaknesses.push("None identified at this skill level.");
        return weaknesses;
    }
}

module.exports = new AIOrchestrator();
