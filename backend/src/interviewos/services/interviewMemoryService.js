const { supabaseAdmin, isSupabaseConfigured } = require("../../config/supabaseClient");

const userHistoryStore = new Map();
const sessionStore = new Map();

const getEmptyUserHistory = () => ({
    askedSlugs: [],
    solvedSlugs: [],
    weakTopics: [],
    strongTopics: [],
    recentDifficulties: [],
    repeatedMistakes: []
});

const ensureUserHistory = (userId = "anonymous") => {
    if (!userHistoryStore.has(userId)) {
        userHistoryStore.set(userId, getEmptyUserHistory());
    }

    return userHistoryStore.get(userId);
};

const getSession = (sessionId) => sessionStore.get(sessionId) || null;

const saveSession = (sessionId, sessionState) => {
    sessionStore.set(sessionId, sessionState);
    return sessionState;
};

const createSession = ({ userId = "anonymous", persona = "google" } = {}) => {
    const sessionId = `ios_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const sessionState = {
        sessionId,
        userId,
        persona,
        roundIndex: 0,
        currentDifficulty: "easy",
        askedSlugs: [],
        weakTopics: [],
        strongTopics: [],
        performanceHistory: [],
        integrityHistory: [],
        createdAt: new Date().toISOString()
    };

    sessionStore.set(sessionId, sessionState);
    return sessionState;
};

const mergeUnique = (items = []) => Array.from(new Set(items.filter(Boolean)));

const updateUserHistory = async (userId = "anonymous", update = {}) => {
    const current = ensureUserHistory(userId);
    const next = {
        ...current,
        askedSlugs: mergeUnique([...(current.askedSlugs || []), ...(update.askedSlugs || [])]),
        solvedSlugs: mergeUnique([...(current.solvedSlugs || []), ...(update.solvedSlugs || [])]),
        weakTopics: mergeUnique([...(update.weakTopics || []), ...(current.weakTopics || [])]).slice(0, 20),
        strongTopics: mergeUnique([...(update.strongTopics || []), ...(current.strongTopics || [])]).slice(0, 20),
        recentDifficulties: [...(current.recentDifficulties || []), ...(update.recentDifficulties || [])].slice(-20),
        repeatedMistakes: [...(current.repeatedMistakes || []), ...(update.repeatedMistakes || [])].slice(-20)
    };

    userHistoryStore.set(userId, next);

    if (isSupabaseConfigured() && supabaseAdmin) {
        try {
            await supabaseAdmin.from("interview_question_history").upsert({
                user_id: userId,
                asked_slugs: next.askedSlugs,
                solved_slugs: next.solvedSlugs,
                weak_topics: next.weakTopics,
                strong_topics: next.strongTopics,
                recent_difficulties: next.recentDifficulties,
                repeated_mistakes: next.repeatedMistakes,
                updated_at: new Date().toISOString()
            }, {
                onConflict: "user_id"
            });
        } catch (error) {
            console.warn("Interview memory persistence skipped:", error.message);
        }
    }

    return next;
};

const loadUserHistory = async (userId = "anonymous") => {
    if (userHistoryStore.has(userId)) {
        return userHistoryStore.get(userId);
    }

    if (isSupabaseConfigured() && supabaseAdmin) {
        try {
            const { data, error } = await supabaseAdmin
                .from("interview_question_history")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (!error && data) {
                const history = {
                    askedSlugs: data.asked_slugs || [],
                    solvedSlugs: data.solved_slugs || [],
                    weakTopics: data.weak_topics || [],
                    strongTopics: data.strong_topics || [],
                    recentDifficulties: data.recent_difficulties || [],
                    repeatedMistakes: data.repeated_mistakes || []
                };

                userHistoryStore.set(userId, history);
                return history;
            }
        } catch (error) {
            console.warn("Interview memory load skipped:", error.message);
        }
    }

    return ensureUserHistory(userId);
};

module.exports = {
    createSession,
    getSession,
    saveSession,
    loadUserHistory,
    updateUserHistory
};
