const { supabaseAdmin, isSupabaseConfigured } = require("../../config/supabaseClient");
const { sanitizeProblemForCandidate } = require("../contracts/publicProblemView");
const { listQuestions, getQuestionDetails } = require("./leetCodeGraphQLClient");

const localQuestionCache = new Map();

const decodeHtmlEntities = (text = "") => {
    return text
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
};

const htmlToText = (html = "") => {
    return decodeHtmlEntities(
        html
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/p>/gi, "\n\n")
            .replace(/<li>/gi, "- ")
            .replace(/<\/li>/gi, "\n")
            .replace(/<\/pre>/gi, "\n\n")
            .replace(/<pre[^>]*>/gi, "\n")
            .replace(/<[^>]+>/g, "")
    )
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};

const parseExamplesFromHtml = (html = "") => {
    const matches = html.matchAll(/<strong[^>]*>Example\s*\d*:?\s*<\/strong>[\s\S]*?<pre>([\s\S]*?)<\/pre>/gi);
    const examples = [];

    for (const match of matches) {
        const block = htmlToText(match[1]);
        const input = block.match(/Input:\s*([^\n]+)/i)?.[1]?.trim() || "";
        const output = block.match(/Output:\s*([^\n]+)/i)?.[1]?.trim() || "";
        const explanation = block.match(/Explanation:\s*([\s\S]+)/i)?.[1]?.trim();

        if (input || output) {
            examples.push({ input, output, explanation });
        }
    }

    return examples;
};

const parseConstraints = (contentText = "") => {
    const match = contentText.match(/Constraints:\s*([\s\S]*?)(?:\n\n[A-Z][^\n]*:|\n\nFollow-up:|$)/i);

    if (!match) {
        return [];
    }

    return match[1]
        .split("\n")
        .map((line) => line.replace(/^-+\s*/, "").trim())
        .filter(Boolean);
};

const buildPrompt = (contentText = "") => {
    const prompt = contentText
        .split(/\bExample\s*\d*:/i)[0]
        .split(/\bConstraints:/i)[0]
        .trim();

    return prompt;
};

const extractFunctionSignature = (codeSnippets = [], preferredLang = "javascript") => {
    const exact = codeSnippets.find((snippet) => snippet.langSlug === preferredLang);
    const fallback = exact || codeSnippets[0];

    if (!fallback?.code) {
        return "";
    }

    const lines = fallback.code
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    return lines[0] || fallback.code;
};

const parseMetadata = (metaData) => {
    if (!metaData) return null;

    try {
        return JSON.parse(metaData);
    } catch {
        return null;
    }
};

const normalizeLeetCodeQuestion = (question, preferredLang = "javascript") => {
    const contentText = htmlToText(question.content || "");
    const examples = parseExamplesFromHtml(question.content || "");
    const metadata = parseMetadata(question.metaData);

    return {
        id: `leetcode_${question.questionFrontendId || question.questionId || question.titleSlug}`,
        provider: "leetcode",
        providerProblemId: question.questionId || question.questionFrontendId || null,
        titleSlug: question.titleSlug,
        title: question.title,
        difficulty: String(question.difficulty || "").toLowerCase(),
        topicTags: (question.topicTags || []).map((tag) => tag.slug),
        companyTagStats: question.companyTagStats || null,
        functionSignature: extractFunctionSignature(question.codeSnippets || [], preferredLang),
        prompt: buildPrompt(contentText),
        constraints: parseConstraints(contentText),
        examples,
        starterCode: Object.fromEntries(
            (question.codeSnippets || []).map((snippet) => [snippet.langSlug, snippet.code])
        ),
        inputFormat: metadata?.params?.length ? `Parameters: ${metadata.params.map((param) => `${param.name}: ${param.type}`).join(", ")}` : "",
        outputFormat: metadata?.return?.type ? `Returns: ${metadata.return.type}` : "",
        notes: [],
        hiddenMetadata: {
            title: question.title,
            titleSlug: question.titleSlug,
            difficulty: question.difficulty,
            topicTags: question.topicTags || [],
            providerProblemId: question.questionId || question.questionFrontendId || null,
            companyTagStats: question.companyTagStats || null,
            sampleTestCase: question.sampleTestCase || null,
            hints: question.hints || []
        }
    };
};

const persistNormalizedQuestion = async (question) => {
    localQuestionCache.set(question.titleSlug, question);

    if (isSupabaseConfigured() && supabaseAdmin) {
        try {
            await supabaseAdmin.from("interview_problem_bank").upsert({
                provider: "leetcode",
                provider_problem_id: question.providerProblemId,
                canonical_title: question.title,
                clean_prompt: question.prompt,
                constraints: question.constraints,
                examples: question.examples,
                starter_code: question.starterCode,
                hidden_metadata: question.hiddenMetadata,
                public_payload: sanitizeProblemForCandidate(question),
                difficulty_bucket: question.difficulty || "easy",
                topic_tags: question.topicTags || [],
                company_tags: [],
                sheet_tags: []
            }, {
                onConflict: "provider,provider_problem_id"
            });
        } catch (error) {
            console.warn("Question persistence skipped:", error.message);
        }
    }

    return question;
};

const getCachedOrFetchQuestion = async (titleSlug, preferredLang = "javascript") => {
    if (localQuestionCache.has(titleSlug)) {
        return localQuestionCache.get(titleSlug);
    }

    const details = await getQuestionDetails(titleSlug);
    const normalized = normalizeLeetCodeQuestion(details, preferredLang);
    return persistNormalizedQuestion(normalized);
};

const randomInt = (max) => Math.floor(Math.random() * Math.max(max, 1));

const scoreCandidateQuestion = (question, history, weakTopicHints = []) => {
    const askedPenalty = (history.askedSlugs || []).includes(question.titleSlug) ? 1000 : 0;
    const solvedPenalty = (history.solvedSlugs || []).includes(question.titleSlug) ? 500 : 0;
    const weakTopicBoost = question.topicTags?.some((tag) => weakTopicHints.includes(tag)) ? -15 : 0;
    const noveltyBoost = Math.random() * 10;

    return askedPenalty + solvedPenalty + weakTopicBoost - noveltyBoost;
};

const fetchRandomQuestion = async ({
    difficulty = "easy",
    userHistory = {},
    preferredLang = "javascript",
    weakTopicHints = [],
    limit = 50
} = {}) => {
    const firstPage = await listQuestions({
        difficulty,
        limit,
        skip: randomInt(400)
    });

    const candidates = (firstPage.questions || []).filter((question) => !question.paidOnly);

    if (candidates.length === 0) {
        throw new Error(`No LeetCode ${difficulty} questions available from the current query.`);
    }

    const ranked = [...candidates].sort(
        (a, b) => scoreCandidateQuestion(a, userHistory, weakTopicHints) - scoreCandidateQuestion(b, userHistory, weakTopicHints)
    );

    const selected = ranked[0];
    return getCachedOrFetchQuestion(selected.titleSlug, preferredLang);
};

module.exports = {
    fetchRandomQuestion,
    getCachedOrFetchQuestion,
    normalizeLeetCodeQuestion,
    htmlToText
};
