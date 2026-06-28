const resumeAgent = require("../services/resumeAgent");
const githubAgent = require("../services/githubAgent");
const codingSignalsAgent = require("../services/codingSignalsAgent");
const aiOrchestrator = require("../services/aiOrchestrator");
const { supabaseAdmin } = require("../../config/supabaseClient");
const { dispatchAnalysis } = require("../queues/bullQueue");
const pdfParse = require("pdf-parse");

class RecruitOSController {
    /**
     * Parse resume
     */
    async uploadResume(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "Please upload a PDF file." });
            }

            const { jobDescription = "", candidateId } = req.body;

            // Analyze resume synchronously or put into background queue
            const analysis = await dispatchAnalysis("RESUME", {
                pdfBuffer: req.file.buffer,
                jobDescription,
                candidateId
            });

            res.json({ success: true, data: analysis });
        } catch (error) {
            console.error("Resume upload error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Deep analyze Github username
     */
    async analyzeGithub(req, res) {
        try {
            const { username } = req.body;
            if (!username) {
                return res.status(400).json({ error: "Github username is required." });
            }

            const analysis = await dispatchAnalysis("GITHUB", { username });
            res.json({ success: true, data: analysis });
        } catch (error) {
            console.error("Github analysis error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Get Unified Candidate report
     */
    async getCandidateReport(req, res) {
        try {
            const { sessionId } = req.params;

            // Fetch session state from DB or memory
            // Mocking active session payload for demonstration compatibility
            const mockSession = {
                id: sessionId,
                messages: [
                    { sender: "AI", messageText: "Tell me about design patterns." },
                    { sender: "CANDIDATE", messageText: "I use structural patterns like decorators and adapters." }
                ],
                cheatingLogs: [
                    { eventType: "tab_switch", severity: "low" }
                ]
            };

            const mockProfile = {
                githubUsername: "octocat",
                leetcodeHandle: "octocat_leetcode"
            };

            const intelligence = await aiOrchestrator.generateUnifiedIntelligence(mockSession, mockProfile);
            res.json({ success: true, data: intelligence });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Recruiter Copilot Dashboard: Get Candidates Rank & Insights
     */
    async getDashboardMetrics(req, res) {
        try {
            // Simulated Recruiter dashboard metrics
            const candidates = [
                {
                    id: "cand_1",
                    name: "Alice Vance",
                    role: "Senior Full-Stack Engineer",
                    skills: ["TypeScript", "Next.js", "Docker", "PostgreSQL"],
                    scores: {
                        thinkRank: 94,
                        readiness: 92,
                        credibility: 95,
                        trustIndex: 98
                    },
                    archetype: "Full Stack Generalist",
                    decision: "HIRE"
                },
                {
                    id: "cand_2",
                    name: "Bob Chen",
                    role: "Backend Engineer",
                    skills: ["Go", "Kubernetes", "Redis", "Kafka"],
                    scores: {
                        thinkRank: 88,
                        readiness: 85,
                        credibility: 90,
                        trustIndex: 92
                    },
                    archetype: "Backend Wizard",
                    decision: "HIRE"
                },
                {
                    id: "cand_3",
                    name: "Chloe Smith",
                    role: "Frontend Engineer",
                    skills: ["React", "CSS", "Tailwind", "Figma"],
                    scores: {
                        thinkRank: 78,
                        readiness: 76,
                        credibility: 72,
                        trustIndex: 95
                    },
                    archetype: "Frontend Specialist",
                    decision: "MAYBE"
                }
            ];

            const topRecommendations = candidates.filter(c => c.scores.thinkRank >= 85);

            res.json({
                success: true,
                data: {
                    candidates,
                    topRecommendations,
                    insights: {
                        totalEvaluated: 48,
                        averageAtsScore: 82,
                        trustAlertsCount: 2,
                        pipelineConversionRate: "24%"
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Match a JD with Candidate Profile/Resume
     */
    async analyzeJobMatch(req, res) {
        try {
            const { jobDescription, skills } = req.body;
            let resumeText = "";

            if (!jobDescription) {
                return res.status(400).json({ error: "Job Description is required." });
            }

            if (req.file) {
                const pdfData = await pdfParse(req.file.buffer);
                resumeText = pdfData.text;
            }

            let profileSkills = [];
            try {
                if (skills) {
                    profileSkills = JSON.parse(skills);
                }
            } catch(e) {}

            const analysis = await resumeAgent.matchJobDescription(jobDescription, resumeText, profileSkills);

            res.json({ success: true, data: analysis });
        } catch (error) {
            console.error("Job Match analysis error:", error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new RecruitOSController();
