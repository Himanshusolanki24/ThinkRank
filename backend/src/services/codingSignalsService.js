/**
 * Coding Signals Service
 * 
 * Proxies requests to the Python FastAPI microservice and handles:
 * - Fetching platform data
 * - Caching
 * - Integration with Supabase for persistence
 */

const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

// Python service URL (configurable via environment)
const PYTHON_SERVICE_URL = process.env.CODING_SIGNALS_URL || "http://localhost:8000";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

// Timeout for Python service calls (scrapers can be slow)
const REQUEST_TIMEOUT = 60000; // 60 seconds

/**
 * Check if Python service is healthy
 */
/**
 * Check if Python service is healthy
 */
async function checkPythonServiceHealth() {
    console.log(`Checking Python service health at ${PYTHON_SERVICE_URL}...`);
    try {
        const response = await fetch(`${PYTHON_SERVICE_URL}/health`);
        const data = await response.json();
        const isHealthy = data?.status === "healthy";
        console.log(`Python service health: ${isHealthy ? '✅ OK' : '❌ Bad Response'}`);
        return isHealthy;
    } catch (error) {
        console.error("Python service health check failed:", error.message);
        if (error.cause) console.error("Cause:", error.cause);
        return false;
    }
}

/**
 * Fetch Codeforces stats
 * @param {string} username - Codeforces handle
 * @param {boolean} useCache - Whether to use cached data
 */
async function fetchCodeforcesStats(username, useCache = true) {
    console.log(`Fetching Codeforces data for ${username} from ${PYTHON_SERVICE_URL}...`);
    try {
        const response = await fetch(
            `${PYTHON_SERVICE_URL}/api/codeforces/${username}?use_cache=${useCache}`,
            {
                method: "POST",
                signal: AbortSignal.timeout(REQUEST_TIMEOUT)
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Codeforces user "${username}" not found`);
            }
            const errorText = await response.text();
            throw new Error(`Python service error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        console.log("Codeforces fetch success");
        return data; // Python wrapper returns { success: true, data: ... }
    } catch (error) {
        console.error("Codeforces fetch failed:", error.message);
        if (error.cause) console.error("Cause:", error.cause);
        throw new Error(`Failed to fetch Codeforces data: ${error.message}`);
    }
}

/**
 * Fetch LeetCode stats
 * @param {string} username - LeetCode username
 * @param {boolean} useCache - Whether to use cached data
 */
async function fetchLeetCodeStats(username, useCache = true) {
    try {
        const response = await axios.post(
            `${PYTHON_SERVICE_URL}/api/leetcode/${username}`,
            null,
            {
                params: { use_cache: useCache },
                timeout: REQUEST_TIMEOUT
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error(`LeetCode user "${username}" not found`);
        }
        throw new Error(`Failed to fetch LeetCode data: ${error.message}`);
    }
}

/**
 * Fetch CodeChef stats
 * @param {string} username - CodeChef username
 * @param {boolean} useCache - Whether to use cached data
 */
async function fetchCodeChefStats(username, useCache = true) {
    try {
        const response = await axios.post(
            `${PYTHON_SERVICE_URL}/api/codechef/${username}`,
            null,
            {
                params: { use_cache: useCache },
                timeout: REQUEST_TIMEOUT
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error(`CodeChef user "${username}" not found`);
        }
        throw new Error(`Failed to fetch CodeChef data: ${error.message}`);
    }
}

/**
 * Fetch HackerRank stats
 * @param {string} username - HackerRank username
 * @param {boolean} useCache - Whether to use cached data
 */
async function fetchHackerRankStats(username, useCache = true) {
    try {
        const response = await axios.post(
            `${PYTHON_SERVICE_URL}/api/hackerrank/${username}`,
            null,
            {
                params: { use_cache: useCache },
                timeout: REQUEST_TIMEOUT
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error(`HackerRank user "${username}" not found`);
        }
        throw new Error(`Failed to fetch HackerRank data: ${error.message}`);
    }
}

/**
 * Fetch unified profile from all platforms
 * @param {Object} usernames - Object with platform usernames
 * @param {Object} githubData - Pre-fetched GitHub data (optional)
 */
async function fetchUnifiedProfile(usernames, githubData = null) {
    try {
        const requestBody = {
            leetcode: usernames.leetcode || null,
            codeforces: usernames.codeforces || null,
            codechef: usernames.codechef || null,
            hackerrank: usernames.hackerrank || null,
            github: githubData,
            use_cache: true
        };

        const response = await axios.post(
            `${PYTHON_SERVICE_URL}/api/unified`,
            requestBody,
            { timeout: REQUEST_TIMEOUT * 2 }  // Longer timeout for unified fetch
        );

        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch unified profile: ${error.message}`);
    }
}

/**
 * Normalize pre-fetched platform data
 * @param {Object} platformData - Object with platform data
 */
async function normalizePlatformData(platformData) {
    try {
        const response = await axios.post(
            `${PYTHON_SERVICE_URL}/api/normalize`,
            platformData,
            { timeout: REQUEST_TIMEOUT }
        );
        return response.data;
    } catch (error) {
        throw new Error(`Failed to normalize data: ${error.message}`);
    }
}

/**
 * Save coding signals to Supabase
 * @param {string} userId - User ID
 * @param {Object} platforms - Platform usernames
 * @param {Object} rawData - Raw platform data
 * @param {Object} normalizedData - Normalized profile
 */
async function saveCodingSignals(userId, platforms, rawData, normalizedData) {
    if (!supabase) {
        console.warn("Supabase not configured, skipping save");
        return null;
    }

    try {
        // Upsert the coding signals record
        const { data, error } = await supabase
            .from("coding_signals")
            .upsert({
                user_id: userId,
                platform_usernames: platforms,
                raw_data: rawData,
                normalized_data: normalizedData,
                fetched_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }, {
                onConflict: "user_id"
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Failed to save coding signals:", error);
        throw new Error(`Database error: ${error.message}`);
    }
}

/**
 * Get stored coding signals for a user
 * @param {string} userId - User ID
 */
async function getCodingSignals(userId) {
    if (!supabase) {
        return null;
    }

    try {
        const { data, error } = await supabase
            .from("coding_signals")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (error && error.code !== "PGRST116") {  // PGRST116 = not found
            throw error;
        }

        // Check if data is expired
        if (data?.expires_at) {
            const expiresAt = new Date(data.expires_at);
            if (expiresAt < new Date()) {
                return { ...data, expired: true };
            }
        }

        return data;
    } catch (error) {
        console.error("Failed to get coding signals:", error);
        return null;
    }
}

/**
 * Get initial interview difficulty based on coding signals
 * @param {Object} normalizedProfile - Normalized coding profile
 * @returns {string} - "easy", "medium", or "hard"
 */
function getInitialDifficulty(normalizedProfile) {
    if (!normalizedProfile) return "medium";

    const competitiveStrength = normalizedProfile.competitiveStrength || 0;
    const problemSolving = normalizedProfile.problemSolving || 0;

    // Calculate weighted score
    const score = competitiveStrength * 0.6 + problemSolving * 0.4;

    if (score >= 70) return "hard";
    if (score >= 40) return "medium";
    return "easy";
}

/**
 * Generate practice recommendations based on coding signals
 * @param {Object} normalizedProfile - Normalized coding profile
 * @returns {Array} - List of recommendation objects
 */
function generatePracticeRecommendations(normalizedProfile) {
    const recommendations = [];

    if (!normalizedProfile) {
        return [{
            type: "platform",
            message: "Connect your coding platform accounts to get personalized recommendations",
            priority: "high"
        }];
    }

    const { problemSolving, algorithmicDepth, consistency, competitiveStrength, platformCoverage } = normalizedProfile;

    // Problem solving recommendations
    if (problemSolving < 50) {
        recommendations.push({
            type: "practice",
            topic: "fundamentals",
            message: "Practice more Easy and Medium problems on LeetCode",
            priority: "high",
            suggestedProblems: ["Two Sum", "Valid Parentheses", "Merge Two Sorted Lists"]
        });
    }

    // Algorithmic depth recommendations
    if (algorithmicDepth < 40) {
        recommendations.push({
            type: "practice",
            topic: "algorithms",
            message: "Focus on advanced algorithms: Dynamic Programming, Graphs, Trees",
            priority: "medium",
            suggestedTopics: ["Dynamic Programming", "Graph Algorithms", "Tree Traversals"]
        });
    }

    // Consistency recommendations
    if (consistency < 30) {
        recommendations.push({
            type: "habit",
            message: "Participate in weekly contests on Codeforces or LeetCode",
            priority: "medium"
        });
    }

    // Platform coverage recommendations
    if (!platformCoverage?.leetcode) {
        recommendations.push({
            type: "platform",
            platform: "leetcode",
            message: "Create a LeetCode account for interview preparation",
            priority: "high"
        });
    }

    if (!platformCoverage?.codeforces && competitiveStrength < 50) {
        recommendations.push({
            type: "platform",
            platform: "codeforces",
            message: "Join Codeforces to improve competitive programming skills",
            priority: "low"
        });
    }

    return recommendations;
}

module.exports = {
    checkPythonServiceHealth,
    fetchCodeforcesStats,
    fetchLeetCodeStats,
    fetchCodeChefStats,
    fetchHackerRankStats,
    fetchUnifiedProfile,
    normalizePlatformData,
    saveCodingSignals,
    getCodingSignals,
    getInitialDifficulty,
    generatePracticeRecommendations
};
