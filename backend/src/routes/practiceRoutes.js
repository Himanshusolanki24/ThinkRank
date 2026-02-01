/**
 * Practice Routes
 * 
 * Handles daily practice recommendations and practice history.
 */

const express = require("express");
const router = express.Router();
const practiceService = require("../services/practiceService");

// Optional Supabase integration
let supabaseAdmin = null;
try {
    const supabaseModule = require("../supabaseClient");
    supabaseAdmin = supabaseModule.supabaseAdmin;
} catch (e) {
    console.log("[Practice Routes] Supabase not configured, using in-memory storage");
}

/**
 * POST /api/practice/today-task
 * Generate today's practice recommendation based on user's interview history
 */
router.post("/today-task", async (req, res) => {
    try {
        const { userId } = req.body;

        let interviewResults = [];
        let recentProblemIds = [];

        // Try to fetch interview results from Supabase
        if (supabaseAdmin && userId) {
            try {
                // Fetch recent interview answers
                const { data: answers, error: answersError } = await supabaseAdmin
                    .from("interview_answers")
                    .select("*")
                    .eq("user_id", userId)
                    .order("created_at", { ascending: false })
                    .limit(50);

                if (!answersError && answers) {
                    interviewResults = answers.map(a => ({
                        topic: a.question_topic || a.topic || "General",
                        score: a.score || 0,
                        classification: a.classification || "partial"
                    }));
                }

                // Fetch recent practice recommendations to avoid repeats
                const { data: recentRecs, error: recsError } = await supabaseAdmin
                    .from("practice_history")
                    .select("problem_id")
                    .eq("user_id", userId)
                    .order("created_at", { ascending: false })
                    .limit(7);

                if (!recsError && recentRecs) {
                    recentProblemIds = recentRecs.map(r => r.problem_id);
                }
            } catch (dbError) {
                console.log("[Practice] Database query failed, using defaults:", dbError.message);
            }
        }

        // Generate today's task
        const todayTask = practiceService.generateTodayTask(interviewResults, recentProblemIds);

        // Store recommendation in history (if DB available)
        if (supabaseAdmin && userId && todayTask) {
            try {
                await supabaseAdmin
                    .from("practice_history")
                    .insert({
                        user_id: userId,
                        problem_id: todayTask.id || null,
                        problem_title: todayTask.title,
                        problem_url: todayTask.url,
                        platform: todayTask.platform,
                        topic: todayTask.topic,
                        difficulty: todayTask.difficulty,
                        recommended_at: new Date().toISOString()
                    });
            } catch (insertError) {
                // Table might not exist, that's ok
                console.log("[Practice] Could not store recommendation:", insertError.message);
            }
        }

        res.json({
            success: true,
            data: {
                todayTask,
                generatedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error("[Practice] Error generating today's task:", error);
        res.status(500).json({
            success: false,
            error: "Failed to generate practice recommendation"
        });
    }
});

/**
 * GET /api/practice/topics
 * Get all available practice topics
 */
router.get("/topics", (req, res) => {
    try {
        const topics = practiceService.getAvailableTopics();
        res.json({
            success: true,
            data: topics
        });
    } catch (error) {
        console.error("[Practice] Error fetching topics:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch topics"
        });
    }
});

/**
 * GET /api/practice/problems/:topic
 * Get problems for a specific topic
 */
router.get("/problems/:topic", (req, res) => {
    try {
        const { topic } = req.params;
        const problems = practiceService.getProblemsByTopic(topic);
        res.json({
            success: true,
            data: problems
        });
    } catch (error) {
        console.error("[Practice] Error fetching problems:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch problems"
        });
    }
});

/**
 * POST /api/practice/complete
 * Mark a practice problem as completed
 */
router.post("/complete", async (req, res) => {
    try {
        const { userId, problemId, problemUrl, completed } = req.body;

        if (supabaseAdmin && userId) {
            await supabaseAdmin
                .from("practice_history")
                .update({
                    completed,
                    completed_at: completed ? new Date().toISOString() : null
                })
                .eq("user_id", userId)
                .eq("problem_url", problemUrl);
        }

        res.json({
            success: true,
            message: "Practice status updated"
        });
    } catch (error) {
        console.error("[Practice] Error updating completion:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update practice status"
        });
    }
});

/**
 * GET /api/practice/history/:userId
 * Get user's practice history
 */
router.get("/history/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!supabaseAdmin) {
            return res.json({
                success: true,
                data: []
            });
        }

        const { data, error } = await supabaseAdmin
            .from("practice_history")
            .select("*")
            .eq("user_id", userId)
            .order("recommended_at", { ascending: false })
            .limit(30);

        if (error) throw error;

        res.json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error("[Practice] Error fetching history:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch practice history"
        });
    }
});

module.exports = router;
