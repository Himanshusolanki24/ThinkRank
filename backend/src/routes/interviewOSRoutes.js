const express = require("express");
const { sanitizeProblemForCandidate } = require("../interviewos/contracts/publicProblemView");
const { personalityProfiles } = require("../interviewos/config/personalityProfiles");
const { decideNextInterviewStep } = require("../interviewos/engine/adaptiveInterviewEngine");
const { computeIntegritySnapshot } = require("../interviewos/engine/integrityEngine");
const { websocketEvents } = require("../interviewos/websocket/events");
const { evaluationPrompts } = require("../interviewos/prompts/evaluationPrompts");
const { sampleInterviewProblem } = require("../interviewos/data/sampleInterviewProblem");
const { secureIdePolicies } = require("../interviewos/security/interviewGuardrails");
const {
    startInterviewSession,
    advanceInterviewSession
} = require("../interviewos/services/adaptiveLeetCodeInterviewService");

const router = express.Router();

router.get("/health", (req, res) => {
    res.json({
        success: true,
        data: {
            service: "ThinkRank InterviewOS",
            status: "scaffolded",
            version: "0.1.0",
            capabilities: [
                "adaptive_interview_engine",
                "hidden_problem_metadata",
                "interviewer_personality_profiles",
                "integrity_score_engine",
                "websocket_contracts",
                "evaluation_prompt_library"
            ]
        }
    });
});

router.get("/blueprint", (req, res) => {
    res.json({
        success: true,
        data: {
            publicProblemContract: {
                allowedFields: ["prompt", "constraints", "examples", "starterCode", "inputFormat", "outputFormat"],
                blockedFields: ["source", "topicTags", "difficulty", "sheet", "platformProblemId", "editorial"]
            },
            personalities: personalityProfiles,
            realtimeStack: {
                transport: "Socket.IO / WebSocket",
                stt: ["Deepgram", "Whisper"],
                tts: ["ElevenLabs Conversational AI"],
                analytics: ["MediaPipe", "behavioral scoring", "coding telemetry"]
            },
            websocketEvents,
            promptFamilies: Object.keys(evaluationPrompts),
            secureIdePolicies,
            deploymentServices: [
                "frontend-react",
                "api-gateway",
                "interview-orchestrator",
                "voice-session-service",
                "integrity-analytics-service",
                "coding-execution-service",
                "evaluation-workers",
                "postgres-pgvector",
                "redis"
            ]
        }
    });
});

router.post("/session/start", async (req, res) => {
    try {
        const { userId, persona = "google", preferredLang = "javascript" } = req.body || {};
        const session = await startInterviewSession({ userId, persona, preferredLang });

        return res.json({
            success: true,
            data: session
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to start InterviewOS session."
        });
    }
});

router.post("/session/next", async (req, res) => {
    try {
        const {
            sessionId,
            evaluation = {},
            integritySignals = {},
            preferredLang = "javascript"
        } = req.body || {};

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: "sessionId is required."
            });
        }

        const nextRound = await advanceInterviewSession({
            sessionId,
            evaluation,
            integritySignals,
            preferredLang
        });

        return res.json({
            success: true,
            data: nextRound
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to advance InterviewOS session."
        });
    }
});

router.get("/sample-problem", (req, res) => {
    res.json({
        success: true,
        data: {
            publicProblem: sanitizeProblemForCandidate(sampleInterviewProblem),
            hiddenMetadataSummary: {
                hiddenFields: Object.keys(sampleInterviewProblem.hiddenMetadata),
                internalId: sampleInterviewProblem.id
            }
        }
    });
});

router.post("/sanitize-problem", (req, res) => {
    const { problem } = req.body;

    if (!problem || typeof problem !== "object") {
        return res.status(400).json({
            success: false,
            error: "A problem object is required."
        });
    }

    return res.json({
        success: true,
        data: sanitizeProblemForCandidate(problem)
    });
});

router.post("/simulate-round", (req, res) => {
    const {
        sessionState = {},
        evaluation = {},
        integritySignals = {},
        candidateProfile = {}
    } = req.body;

    const integrity = computeIntegritySnapshot(integritySignals);
    const adaptiveDecision = decideNextInterviewStep({
        sessionState,
        evaluation,
        integrity,
        candidateProfile
    });

    return res.json({
        success: true,
        data: {
            integrity,
            adaptiveDecision
        }
    });
});

module.exports = router;
