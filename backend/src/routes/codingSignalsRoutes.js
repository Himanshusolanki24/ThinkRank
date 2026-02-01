/**
 * Coding Signals API Routes
 * 
 * Endpoints for fetching and managing coding platform signals
 */

const express = require("express");
const router = express.Router();
const {
    checkPythonServiceHealth,
    fetchCodeforcesStats,
    fetchLeetCodeStats,
    fetchCodeChefStats,
    fetchHackerRankStats,
    fetchUnifiedProfile,
    saveCodingSignals,
    getCodingSignals,
    getInitialDifficulty,
    generatePracticeRecommendations
} = require("../services/codingSignalsService");
const { extractSkillsFromGitHub } = require("../services/githubService");

/**
 * GET /api/coding-signals/health
 * Check if the coding signals service is available
 */
router.get("/health", async (req, res) => {
    try {
        const pythonHealthy = await checkPythonServiceHealth();

        res.json({
            success: true,
            data: {
                nodeService: "healthy",
                pythonService: pythonHealthy ? "healthy" : "unavailable"
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/coding-signals/fetch
 * Fetch coding signals from all connected platforms
 * 
 * Body:
 * {
 *   userId: "uuid",
 *   platforms: {
 *     leetcode: "username",
 *     codeforces: "handle",
 *     codechef: "username",
 *     hackerrank: "username",
 *     github: "username"
 *   },
 *   forceRefresh: false
 * }
 */
router.post("/fetch", async (req, res) => {
    try {
        const { userId, platforms, forceRefresh = false } = req.body;

        if (!platforms || typeof platforms !== "object") {
            return res.status(400).json({
                success: false,
                error: "platforms object is required"
            });
        }

        // If not forcing refresh, check for existing data
        if (!forceRefresh && userId) {
            const existing = await getCodingSignals(userId);
            if (existing && !existing.expired) {
                return res.json({
                    success: true,
                    data: {
                        raw: existing.raw_data,
                        normalized: existing.normalized_data,
                        fetchedAt: existing.fetched_at
                    },
                    cached: true
                });
            }
        }

        // Fetch GitHub data if username provided
        let githubData = null;
        if (platforms.github) {
            try {
                githubData = await extractSkillsFromGitHub(platforms.github);
            } catch (error) {
                console.warn("GitHub fetch failed:", error.message);
            }
        }

        // Fetch unified profile from Python service
        const result = await fetchUnifiedProfile(platforms, githubData);

        // Save to database if userId provided
        if (userId && result.success) {
            try {
                await saveCodingSignals(
                    userId,
                    platforms,
                    result.data.raw,
                    result.data.normalized
                );
            } catch (dbError) {
                console.warn("Failed to save to database:", dbError.message);
            }
        }

        res.json({
            success: true,
            data: {
                raw: result.data.raw,
                normalized: result.data.normalized,
                errors: result.data.errors,
                fetchedAt: new Date().toISOString()
            },
            cached: false
        });

    } catch (error) {
        console.error("Fetch coding signals error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/coding-signals/profile/:userId
 * Get stored coding signals for a user
 */
router.get("/profile/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const data = await getCodingSignals(userId);

        if (!data) {
            return res.status(404).json({
                success: false,
                error: "No coding signals found for this user"
            });
        }

        res.json({
            success: true,
            data: {
                platforms: data.platform_usernames,
                raw: data.raw_data,
                normalized: data.normalized_data,
                fetchedAt: data.fetched_at,
                expired: data.expired || false
            }
        });

    } catch (error) {
        console.error("Get coding signals error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/coding-signals/platform/:platform
 * Fetch data from a specific platform
 * 
 * Params:
 *   platform: "leetcode" | "codeforces" | "codechef" | "hackerrank"
 * 
 * Body:
 *   { username: "string" }
 */
router.post("/platform/:platform", async (req, res) => {
    try {
        const { platform } = req.params;
        const { username } = req.body;

        console.log(`[ROUTE] Received request for ${platform}/${username}`);

        if (!username) {
            return res.status(400).json({
                success: false,
                error: "username is required"
            });
        }

        let result;

        switch (platform.toLowerCase()) {
            case "leetcode":
                result = await fetchLeetCodeStats(username);
                break;
            case "codeforces":
                result = await fetchCodeforcesStats(username);
                break;
            case "codechef":
                result = await fetchCodeChefStats(username);
                break;
            case "hackerrank":
                result = await fetchHackerRankStats(username);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: `Unknown platform: ${platform}`
                });
        }

        res.json(result);

    } catch (error) {
        const status = error.message.includes("not found") ? 404 : 500;
        res.status(status).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/coding-signals/difficulty/:userId
 * Get recommended initial interview difficulty based on coding signals
 */
router.get("/difficulty/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const data = await getCodingSignals(userId);
        const normalizedProfile = data?.normalized_data || null;

        const difficulty = getInitialDifficulty(normalizedProfile);

        res.json({
            success: true,
            data: {
                difficulty,
                hasSignals: !!normalizedProfile,
                scores: normalizedProfile ? {
                    problemSolving: normalizedProfile.problemSolving,
                    competitiveStrength: normalizedProfile.competitiveStrength
                } : null
            }
        });

    } catch (error) {
        console.error("Get difficulty error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/coding-signals/recommendations/:userId
 * Get practice recommendations based on coding signals
 */
router.get("/recommendations/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const data = await getCodingSignals(userId);
        const normalizedProfile = data?.normalized_data || null;

        const recommendations = generatePracticeRecommendations(normalizedProfile);

        res.json({
            success: true,
            data: {
                recommendations,
                profile: normalizedProfile ? {
                    overallGrade: normalizedProfile.overallGrade,
                    overallScore: normalizedProfile.overallScore
                } : null
            }
        });

    } catch (error) {
        console.error("Get recommendations error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
