/**
 * Mock Interview REST API Routes
 * Handles session lifecycle, AI conversation, code execution, and analytics.
 */
const express = require("express");
const router = express.Router();
const { MockInterviewAI, PERSONAS, QUESTION_BANK } = require("../services/mockInterviewAI");
const { executeCode, runTestCases } = require("../services/codeExecutionService");

const ai = new MockInterviewAI();

// In-memory session store (production: use Redis)
const sessions = new Map();

// ── START SESSION ────────────────────────────────────────────
router.post("/start", async (req, res) => {
    try {
        const { userId, companyStyle = "google", difficulty = "medium", language = "python" } = req.body;

        const sessionId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const persona = ai.getPersona(companyStyle);
        const question = ai.getQuestion(difficulty);

        const session = {
            id: sessionId,
            userId,
            companyStyle,
            difficulty,
            language,
            persona,
            status: "active",
            startedAt: Date.now(),
            currentQuestionIndex: 0,
            questions: [question],
            usedQuestions: [question.title],
            conversations: [
                { role: "ai", content: persona.greeting, type: "text", timestamp: 0 },
                { role: "ai", content: `Here's your first problem:\n\n**${question.title}**\n\n${question.description}`, type: "question", timestamp: 500 },
            ],
            submissions: [],
            code: "",
            phase: "clarification",
            tabSwitches: 0,
            copyPasteCount: 0,
        };

        sessions.set(sessionId, session);

        res.json({
            success: true,
            data: {
                sessionId,
                persona: { name: persona.name, company: persona.company },
                question: {
                    title: question.title,
                    description: question.description,
                    examples: question.examples,
                    constraints: question.constraints,
                    difficulty: question.difficulty || difficulty,
                    category: question.category,
                    testCases: question.test_cases,
                },
                greeting: persona.greeting,
                conversations: session.conversations,
            },
        });
    } catch (error) {
        console.error("Start session error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ── SEND MESSAGE (AI CONVERSATION) ──────────────────────────
router.post("/message", async (req, res) => {
    try {
        const { sessionId, message, code } = req.body;
        const session = sessions.get(sessionId);
        if (!session) return res.status(404).json({ success: false, error: "Session not found" });

        const elapsed = Date.now() - session.startedAt;

        // Save user message
        session.conversations.push({
            role: "user",
            content: message,
            type: "text",
            timestamp: elapsed,
        });

        // Update code
        if (code) session.code = code;

        // Detect phase from message content
        if (message.toLowerCase().includes("hint") || message.toLowerCase().includes("stuck")) {
            session.phase = "coding";
        }

        const currentQuestion = session.questions[session.currentQuestionIndex];

        // Generate AI response
        const aiResponse = await ai.generateResponse({
            persona: session.persona,
            question: currentQuestion,
            userMessage: message,
            conversationHistory: session.conversations.slice(-10),
            code: session.code,
            phase: session.phase,
        });

        session.conversations.push({
            role: "ai",
            content: aiResponse,
            type: "text",
            timestamp: Date.now() - session.startedAt,
        });

        res.json({
            success: true,
            data: {
                response: aiResponse,
                phase: session.phase,
                questionIndex: session.currentQuestionIndex,
                elapsed: Math.round(elapsed / 1000),
            },
        });
    } catch (error) {
        console.error("Message error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ── RUN CODE ─────────────────────────────────────────────────
router.post("/run", async (req, res) => {
    try {
        const { sessionId, code, language, customInput } = req.body;
        const session = sessions.get(sessionId);
        if (!session) return res.status(404).json({ success: false, error: "Session not found" });

        session.code = code;
        const currentQuestion = session.questions[session.currentQuestionIndex];

        // Run against visible test cases
        const testCases = customInput
            ? [{ input: customInput, expected: "custom" }]
            : currentQuestion.test_cases || [];

        if (testCases.length === 0) {
            // Simple execution with custom input
            const result = await executeCode(code, language, customInput || "");
            return res.json({ success: true, data: { type: "run", result } });
        }

        const results = await runTestCases(code, language, testCases);

        res.json({
            success: true,
            data: {
                type: "test",
                ...results,
            },
        });
    } catch (error) {
        console.error("Run code error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ── SUBMIT CODE ──────────────────────────────────────────────
router.post("/submit", async (req, res) => {
    try {
        const { sessionId, code, language } = req.body;
        const session = sessions.get(sessionId);
        if (!session) return res.status(404).json({ success: false, error: "Session not found" });

        session.code = code;
        const currentQuestion = session.questions[session.currentQuestionIndex];

        // Run against ALL test cases (visible + hidden)
        const allTestCases = [
            ...(currentQuestion.test_cases || []),
            ...(currentQuestion.hidden_test_cases || []),
        ];

        const testResults = await runTestCases(code, language, allTestCases);

        // AI code review
        const review = await ai.reviewCode(code, language, currentQuestion);

        // Store submission
        const submission = {
            questionIndex: session.currentQuestionIndex,
            code,
            language,
            testResults,
            review,
            execution_status: testResults.all_passed ? "accepted" : "wrong_answer",
            runtime_ms: testResults.results[0]?.runtime_ms,
            memory_kb: testResults.results[0]?.memory_kb,
            submittedAt: Date.now() - session.startedAt,
        };
        session.submissions.push(submission);

        // AI interviewer comments on the submission
        const comment = review.interviewerComment || "Good attempt. Let's discuss your approach.";
        session.conversations.push({
            role: "ai",
            content: comment,
            type: "code_review",
            timestamp: Date.now() - session.startedAt,
        });

        session.phase = "review";

        res.json({
            success: true,
            data: {
                testResults,
                review,
                interviewerComment: comment,
                submission: {
                    status: submission.execution_status,
                    passedCount: testResults.passed_count,
                    totalCount: testResults.total_count,
                    hiddenCasesTested: (currentQuestion.hidden_test_cases || []).length,
                },
            },
        });
    } catch (error) {
        console.error("Submit error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ── NEXT QUESTION ────────────────────────────────────────────
router.post("/next-question", async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = sessions.get(sessionId);
        if (!session) return res.status(404).json({ success: false, error: "Session not found" });

        const nextQuestion = ai.getQuestion(session.difficulty, session.usedQuestions);
        session.questions.push(nextQuestion);
        session.usedQuestions.push(nextQuestion.title);
        session.currentQuestionIndex++;
        session.phase = "clarification";
        session.code = "";

        const message = `Great work on that one. Let's move to the next problem:\n\n**${nextQuestion.title}**\n\n${nextQuestion.description}`;

        session.conversations.push({
            role: "ai",
            content: message,
            type: "question",
            timestamp: Date.now() - session.startedAt,
        });

        res.json({
            success: true,
            data: {
                question: {
                    title: nextQuestion.title,
                    description: nextQuestion.description,
                    examples: nextQuestion.examples,
                    constraints: nextQuestion.constraints,
                    category: nextQuestion.category,
                    testCases: nextQuestion.test_cases,
                },
                questionIndex: session.currentQuestionIndex,
                aiMessage: message,
            },
        });
    } catch (error) {
        console.error("Next question error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ── END SESSION ──────────────────────────────────────────────
router.post("/end", async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = sessions.get(sessionId);
        if (!session) return res.status(404).json({ success: false, error: "Session not found" });

        session.status = "completed";
        session.endedAt = Date.now();
        session.duration = session.endedAt - session.startedAt;

        // Generate comprehensive report
        const report = await ai.generateReport({
            conversations: session.conversations,
            submissions: session.submissions,
            questions: session.questions,
            persona: session.persona,
            duration: session.duration / 1000,
        });

        res.json({
            success: true,
            data: {
                report,
                sessionSummary: {
                    duration: Math.round(session.duration / 1000),
                    questionsAttempted: session.questions.length,
                    submissionsCount: session.submissions.length,
                    companyStyle: session.companyStyle,
                    difficulty: session.difficulty,
                    tabSwitches: session.tabSwitches,
                },
            },
        });
    } catch (error) {
        console.error("End session error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ── GET HINT ─────────────────────────────────────────────────
router.post("/hint", async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = sessions.get(sessionId);
        if (!session) return res.status(404).json({ success: false, error: "Session not found" });

        const currentQuestion = session.questions[session.currentQuestionIndex];
        const hints = currentQuestion.hints || [];
        const hintIndex = Math.min(
            session.conversations.filter((c) => c.type === "hint").length,
            hints.length - 1
        );

        const hint = hints[hintIndex] || "Try breaking the problem into smaller subproblems.";

        session.conversations.push({
            role: "ai",
            content: `💡 Hint: ${hint}`,
            type: "hint",
            timestamp: Date.now() - session.startedAt,
        });

        res.json({
            success: true,
            data: {
                hint,
                hintNumber: hintIndex + 1,
                totalHints: hints.length,
            },
        });
    } catch (error) {
        console.error("Hint error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ── ENHANCE LEETCODE PROBLEM ─────────────────────────────────
router.post("/enhance-problem", async (req, res) => {
    try {
        const { problemText } = req.body;
        if (!problemText) return res.status(400).json({ success: false, error: "Problem text required" });

        const enhanced = await ai.enhanceLeetCodeProblem(problemText);

        res.json({ success: true, data: enhanced });
    } catch (error) {
        console.error("Enhance error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ── INTEGRITY EVENTS ─────────────────────────────────────────
router.post("/integrity", async (req, res) => {
    try {
        const { sessionId, event } = req.body;
        const session = sessions.get(sessionId);
        if (!session) return res.status(404).json({ success: false, error: "Session not found" });

        if (event === "tab_switch") session.tabSwitches++;
        if (event === "copy_paste") session.copyPasteCount++;

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ── GET SESSION STATE ────────────────────────────────────────
router.get("/session/:sessionId", (req, res) => {
    const session = sessions.get(req.params.sessionId);
    if (!session) return res.status(404).json({ success: false, error: "Session not found" });

    res.json({
        success: true,
        data: {
            status: session.status,
            currentQuestionIndex: session.currentQuestionIndex,
            questionsCount: session.questions.length,
            submissionsCount: session.submissions.length,
            elapsed: Math.round((Date.now() - session.startedAt) / 1000),
            phase: session.phase,
            conversations: session.conversations,
        },
    });
});

// ── LIST PERSONAS ────────────────────────────────────────────
router.get("/personas", (req, res) => {
    const list = Object.entries(PERSONAS).map(([id, p]) => ({
        id,
        name: p.name,
        company: p.company,
        style: p.style.split(".")[0] + ".",
    }));
    res.json({ success: true, data: list });
});

module.exports = router;
