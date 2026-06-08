/**
 * AI Mock Interview Engine
 * Core intelligence for realistic AI-driven coding interviews.
 * Supports Google/Amazon/Microsoft/Meta/Startup interviewer personas.
 */
const { Mistral } = require("@mistralai/mistralai");

const mistralApiKey = process.env.MISTRAL_API_KEY;
let mistralClient = null;

if (mistralApiKey && mistralApiKey !== "your_mistral_api_key_here") {
    try {
        mistralClient = new Mistral({ apiKey: mistralApiKey });
        console.log("✅ Mistral AI initialized successfully in MockInterviewAI");
    } catch (error) {
        console.warn("⚠️ Failed to initialize Mistral in MockInterviewAI:", error.message);
    }
} else {
    console.warn("⚠️ Mistral not configured in MockInterviewAI. Add MISTRAL_API_KEY to .env file.");
}

// ── INTERVIEWER PERSONAS ─────────────────────────────────────
const PERSONAS = {
    google: {
        name: "Sarah Chen",
        company: "Google",
        style: "Methodical and structured. Focuses on scalability, clean code, and optimal solutions. Asks about time/space complexity early. Encourages thinking out loud.",
        greeting: "Hi! I'm Sarah, and I'll be your interviewer today. Let's start with a coding problem. Feel free to think out loud — I'm interested in your problem-solving process.",
        follow_up_style: "What if the input size was 10 million? How would your solution scale?",
    },
    amazon: {
        name: "James Rodriguez",
        company: "Amazon",
        style: "Direct and practical. Focuses on edge cases, customer impact, and working solutions. Values speed and correctness. Will push for optimizations after brute force.",
        greeting: "Welcome! I'm James. We have about 45 minutes together. I'll give you a problem, and we'll work through it. Start with whatever approach comes to mind first — we can optimize later.",
        follow_up_style: "Good. Now, what happens when we throw bad input at this? What edge cases should we handle?",
    },
    microsoft: {
        name: "Priya Sharma",
        company: "Microsoft",
        style: "Collaborative and supportive. Treats the interview like pair programming. Gives small hints when stuck. Focuses on code quality and design patterns.",
        greeting: "Hey there! I'm Priya. Think of this as a collaborative coding session — we're working on this together. Don't hesitate to ask clarifying questions.",
        follow_up_style: "That's a solid approach. How would you refactor this for better readability? Any design patterns that could help here?",
    },
    meta: {
        name: "Alex Kim",
        company: "Meta",
        style: "Fast-paced and intense. Expects quick solutions. Focuses on optimal approaches from the start. Asks multiple follow-ups. Time pressure is real.",
        greeting: "Hi, I'm Alex. We've got a tight schedule today, so let's jump right in. I'll present a problem and I'd like you to code the optimal solution.",
        follow_up_style: "OK, that works. But can you do it in O(n) time? What about O(1) space?",
    },
    startup: {
        name: "Dev Patel",
        company: "TechStartup",
        style: "Casual and practical. Cares about shipping code that works. Asks about real-world trade-offs, maintainability, and testing. Less focus on pure algorithmic optimization.",
        greeting: "Hey! I'm Dev. This is pretty chill — I just want to see how you approach problems. We're looking for people who can ship quality code fast.",
        follow_up_style: "Cool solution. How would you test this? What if we needed to add a new feature to this later?",
    },
    generic: {
        name: "AI Interviewer",
        company: "ThinkRank",
        style: "Balanced and educational. Provides clear feedback. Guides through the problem systematically.",
        greeting: "Hello! Welcome to your mock interview. I'll present a coding challenge and we'll work through it together. Feel free to ask clarifying questions at any time.",
        follow_up_style: "Nice work. Let's think about how we could optimize this further.",
    },
};

// ── QUESTION BANK BY DIFFICULTY ──────────────────────────────
const QUESTION_BANK = {
    easy: [
        {
            title: "Two Sum",
            description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.",
            category: "arrays",
            examples: [
                { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
                { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "" },
            ],
            constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists."],
            test_cases: [
                { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
                { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
                { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
            ],
            hidden_test_cases: [
                { input: { nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], target: 19 }, expected: [8, 9] },
                { input: { nums: [-1, -2, -3, -4, -5], target: -8 }, expected: [2, 4] },
            ],
            expected_time_complexity: "O(n)",
            expected_space_complexity: "O(n)",
            optimal_approach: "Hash map to store complement values",
            hints: [
                "Think about what value you need to find for each element.",
                "A hash map can help you look up values in O(1) time.",
                "For each element, check if (target - element) exists in the map.",
            ],
        },
        {
            title: "Valid Parentheses",
            description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
            category: "stacks",
            examples: [
                { input: 's = "()"', output: "true", explanation: "" },
                { input: 's = "()[]{}"', output: "true", explanation: "" },
                { input: 's = "(]"', output: "false", explanation: "" },
            ],
            constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'. "],
            test_cases: [
                { input: { s: "()" }, expected: true },
                { input: { s: "()[]{}" }, expected: true },
                { input: { s: "(]" }, expected: false },
            ],
            hidden_test_cases: [
                { input: { s: "((()))" }, expected: true },
                { input: { s: "([)]" }, expected: false },
                { input: { s: "" }, expected: true },
            ],
            expected_time_complexity: "O(n)",
            expected_space_complexity: "O(n)",
            optimal_approach: "Stack-based matching",
            hints: [
                "Use a stack to keep track of opening brackets.",
                "When you encounter a closing bracket, check if it matches the top of the stack.",
                "At the end, the stack should be empty for a valid string.",
            ],
        },
        {
            title: "Best Time to Buy and Sell Stock",
            description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `ith` day.\n\nYou want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.",
            category: "arrays",
            examples: [
                { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5." },
                { input: "prices = [7,6,4,3,1]", output: "0", explanation: "No profitable transaction is possible." },
            ],
            constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
            test_cases: [
                { input: { prices: [7, 1, 5, 3, 6, 4] }, expected: 5 },
                { input: { prices: [7, 6, 4, 3, 1] }, expected: 0 },
                { input: { prices: [2, 4, 1] }, expected: 2 },
            ],
            hidden_test_cases: [
                { input: { prices: [1] }, expected: 0 },
                { input: { prices: [1, 2] }, expected: 1 },
            ],
            expected_time_complexity: "O(n)",
            expected_space_complexity: "O(1)",
            optimal_approach: "Track minimum price and maximum profit in single pass",
            hints: [
                "Keep track of the minimum price seen so far.",
                "At each step, calculate the profit if you sold at the current price.",
                "You only need one pass through the array.",
            ],
        },
    ],
    medium: [
        {
            title: "Longest Substring Without Repeating Characters",
            description: "Given a string `s`, find the length of the **longest substring** without repeating characters.",
            category: "sliding_window",
            examples: [
                { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' },
                { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b", with the length of 1.' },
                { input: 's = "pwwkew"', output: "3", explanation: 'The answer is "wke", with the length of 3.' },
            ],
            constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
            test_cases: [
                { input: { s: "abcabcbb" }, expected: 3 },
                { input: { s: "bbbbb" }, expected: 1 },
                { input: { s: "pwwkew" }, expected: 3 },
            ],
            hidden_test_cases: [
                { input: { s: "" }, expected: 0 },
                { input: { s: " " }, expected: 1 },
                { input: { s: "dvdf" }, expected: 3 },
            ],
            expected_time_complexity: "O(n)",
            expected_space_complexity: "O(min(m,n))",
            optimal_approach: "Sliding window with hash set/map",
            hints: [
                "Use a sliding window approach with two pointers.",
                "Use a set or map to track characters in the current window.",
                "When you find a duplicate, shrink the window from the left.",
            ],
        },
        {
            title: "3Sum",
            description: "Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.",
            category: "two_pointers",
            examples: [
                { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", explanation: "" },
                { input: "nums = [0,1,1]", output: "[]", explanation: "The only possible triplet does not sum up to 0." },
            ],
            constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
            test_cases: [
                { input: { nums: [-1, 0, 1, 2, -1, -4] }, expected: [[-1, -1, 2], [-1, 0, 1]] },
                { input: { nums: [0, 1, 1] }, expected: [] },
                { input: { nums: [0, 0, 0] }, expected: [[0, 0, 0]] },
            ],
            hidden_test_cases: [
                { input: { nums: [-2, 0, 1, 1, 2] }, expected: [[-2, 0, 2], [-2, 1, 1]] },
            ],
            expected_time_complexity: "O(n²)",
            expected_space_complexity: "O(1)",
            optimal_approach: "Sort + two pointers for each element",
            hints: [
                "Sort the array first.",
                "Fix one element and use two pointers to find the other two.",
                "Skip duplicates to avoid duplicate triplets.",
            ],
        },
        {
            title: "LRU Cache",
            description: "Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.\n\nImplement the `LRUCache` class:\n- `LRUCache(int capacity)` Initialize the LRU cache with positive size capacity.\n- `int get(int key)` Return the value of the key if the key exists, otherwise return -1.\n- `void put(int key, int value)` Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity, evict the least recently used key.",
            category: "design",
            examples: [
                { input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', output: "[null,null,null,1,null,-1,null,-1,3,4]", explanation: "" },
            ],
            constraints: ["1 <= capacity <= 3000", "0 <= key <= 10^4", "0 <= value <= 10^5", "At most 2 * 10^5 calls will be made to get and put."],
            test_cases: [],
            hidden_test_cases: [],
            expected_time_complexity: "O(1) for both get and put",
            expected_space_complexity: "O(capacity)",
            optimal_approach: "Hash map + doubly linked list",
            hints: [
                "You need O(1) lookup AND O(1) insertion/deletion.",
                "A hash map gives O(1) lookup, a doubly linked list gives O(1) ordered removal.",
                "Combine both: map keys to nodes in the linked list.",
            ],
        },
    ],
    hard: [
        {
            title: "Median of Two Sorted Arrays",
            description: "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the **median** of the two sorted arrays.\n\nThe overall run time complexity should be `O(log (m+n))`.",
            category: "binary_search",
            examples: [
                { input: "nums1 = [1,3], nums2 = [2]", output: "2.0", explanation: "merged array = [1,2,3] and median is 2." },
                { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.5", explanation: "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5." },
            ],
            constraints: ["nums1.length == m", "nums2.length == n", "0 <= m <= 1000", "0 <= n <= 1000", "1 <= m + n <= 2000", "-10^6 <= nums1[i], nums2[i] <= 10^6"],
            test_cases: [
                { input: { nums1: [1, 3], nums2: [2] }, expected: 2.0 },
                { input: { nums1: [1, 2], nums2: [3, 4] }, expected: 2.5 },
            ],
            hidden_test_cases: [
                { input: { nums1: [], nums2: [1] }, expected: 1.0 },
                { input: { nums1: [2], nums2: [] }, expected: 2.0 },
            ],
            expected_time_complexity: "O(log(min(m,n)))",
            expected_space_complexity: "O(1)",
            optimal_approach: "Binary search on the smaller array",
            hints: [
                "Don't merge the arrays — that would be O(m+n).",
                "Binary search on the smaller array to find the partition point.",
                "At the correct partition, max of left parts <= min of right parts.",
            ],
        },
        {
            title: "Trapping Rain Water",
            description: "Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.",
            category: "two_pointers",
            examples: [
                { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "The elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped." },
                { input: "height = [4,2,0,3,2,5]", output: "9", explanation: "" },
            ],
            constraints: ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
            test_cases: [
                { input: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }, expected: 6 },
                { input: { height: [4, 2, 0, 3, 2, 5] }, expected: 9 },
            ],
            hidden_test_cases: [
                { input: { height: [0] }, expected: 0 },
                { input: { height: [1, 2, 3, 4, 5] }, expected: 0 },
            ],
            expected_time_complexity: "O(n)",
            expected_space_complexity: "O(1)",
            optimal_approach: "Two pointer approach",
            hints: [
                "Water at any position = min(maxLeft, maxRight) - height[i].",
                "You can precompute maxLeft and maxRight arrays.",
                "For O(1) space, use two pointers from both ends.",
            ],
        },
    ],
    faang: [
        {
            title: "Serialize and Deserialize Binary Tree",
            description: "Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.",
            category: "trees",
            examples: [
                { input: "root = [1,2,3,null,null,4,5]", output: "[1,2,3,null,null,4,5]", explanation: "" },
            ],
            constraints: ["The number of nodes is in the range [0, 10^4].", "-1000 <= Node.val <= 1000"],
            test_cases: [],
            hidden_test_cases: [],
            expected_time_complexity: "O(n)",
            expected_space_complexity: "O(n)",
            optimal_approach: "BFS or preorder DFS with null markers",
            hints: [
                "Use BFS (level-order) traversal for serialization.",
                "Mark null children explicitly in the serialized string.",
                "For deserialization, reconstruct level by level using a queue.",
            ],
        },
    ],
};

// ── CORE AI ENGINE ───────────────────────────────────────────

class MockInterviewAI {
    constructor() {
        this.client = mistralClient;
    }

    /**
     * Get persona configuration
     */
    getPersona(companyStyle) {
        return PERSONAS[companyStyle] || PERSONAS.generic;
    }

    /**
     * Generate a question for the interview
     */
    getQuestion(difficulty, usedQuestions = []) {
        const pool = QUESTION_BANK[difficulty] || QUESTION_BANK.medium;
        const available = pool.filter((q) => !usedQuestions.includes(q.title));
        if (available.length === 0) return pool[Math.floor(Math.random() * pool.length)];
        return available[Math.floor(Math.random() * available.length)];
    }

    /**
     * Generate AI interviewer response based on conversation context
     */
    async generateResponse(context) {
        const { persona, question, userMessage, conversationHistory, code, phase } = context;

        const systemPrompt = `You are ${persona.name}, a senior software engineer at ${persona.company} conducting a technical coding interview.

PERSONALITY: ${persona.style}

CURRENT QUESTION: "${question.title}"
${question.description}

EXPECTED OPTIMAL APPROACH: ${question.optimal_approach}
EXPECTED TIME COMPLEXITY: ${question.expected_time_complexity}
EXPECTED SPACE COMPLEXITY: ${question.expected_space_complexity}

INTERVIEW PHASE: ${phase}
${phase === 'clarification' ? 'The candidate is asking clarifying questions. Answer them helpfully but don\'t give away the solution.' : ''}
${phase === 'coding' ? 'The candidate is coding. Observe their approach. If they\'re stuck for 2+ minutes, offer a subtle hint.' : ''}
${phase === 'review' ? 'Review their code. Ask about time/space complexity. Suggest optimizations.' : ''}
${phase === 'follow_up' ? 'Ask a follow-up question that makes the problem harder or tests a different edge case.' : ''}

CANDIDATE'S CURRENT CODE:
\`\`\`
${code || 'No code yet'}
\`\`\`

RULES:
- Be conversational and natural, like a real interviewer
- Keep responses concise (2-4 sentences max)
- Ask ONE question or make ONE point at a time
- If the candidate is on the right track, acknowledge it
- If the candidate is stuck, give a small hint (not the answer)
- Ask about edge cases, complexity, and optimizations naturally
- Never write the solution code for the candidate
- Use the interviewer personality style consistently`;

        if (!this.client) {
            return "Let me rephrase — could you walk me through your current thinking?";
        }

        try {
            let historyToUse = [...conversationHistory];
            const lastMsg = historyToUse[historyToUse.length - 1];
            if (!lastMsg || lastMsg.role !== "user" || lastMsg.content !== userMessage) {
                historyToUse.push({ role: "user", content: userMessage || "The candidate is silent. Gently check in." });
            }

            const messages = [
                { role: "system", content: systemPrompt },
                ...historyToUse.map(msg => ({
                    role: msg.role === "ai" ? "assistant" : "user",
                    content: msg.content
                }))
            ];

            const response = await this.client.chat.complete({
                model: "mistral-large-latest",
                messages: messages
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error("AI response error:", error.message || error);
            return "Let me rephrase — could you walk me through your current thinking?";
        }
    }

    /**
     * Analyze submitted code with AI
     */
    async reviewCode(code, language, question) {
        const prompt = `You are a senior software engineer conducting a code review during a technical interview.

QUESTION: ${question.title}
${question.description}

EXPECTED OPTIMAL:
- Time: ${question.expected_time_complexity}
- Space: ${question.expected_space_complexity}
- Approach: ${question.optimal_approach}

CANDIDATE'S CODE (${language}):
\`\`\`${language}
${code}
\`\`\`

Analyze the code and return a JSON object with this EXACT structure (no markdown, no code fences, just raw JSON):
{
    "correctness": { "score": 0-100, "issues": ["list of correctness issues"] },
    "timeComplexity": { "detected": "O(?)", "optimal": "${question.expected_time_complexity}", "score": 0-100 },
    "spaceComplexity": { "detected": "O(?)", "optimal": "${question.expected_space_complexity}", "score": 0-100 },
    "codeQuality": { "score": 0-100, "issues": ["naming", "readability", etc] },
    "edgeCases": { "handled": ["list"], "missing": ["list"], "score": 0-100 },
    "optimization": { "suggestions": ["list"], "score": 0-100 },
    "overallScore": 0-100,
    "feedback": "2-3 sentence summary",
    "interviewerComment": "What the interviewer would say next"
}`;

        if (!this.client) {
            return {
                correctness: { score: 50, issues: ["Unable to fully analyze (Mistral not configured)"] },
                timeComplexity: { detected: "Unknown", optimal: question.expected_time_complexity, score: 50 },
                spaceComplexity: { detected: "Unknown", optimal: question.expected_space_complexity, score: 50 },
                codeQuality: { score: 50, issues: [] },
                edgeCases: { handled: [], missing: [], score: 50 },
                optimization: { suggestions: [], score: 50 },
                overallScore: 50,
                feedback: "Review partially completed.",
                interviewerComment: "Let's discuss your approach.",
            };
        }

        try {
            const response = await this.client.chat.complete({
                model: "mistral-large-latest",
                messages: [{ role: "user", content: prompt }]
            });
            let text = response.choices[0].message.content.trim();
            if (text.startsWith("```json")) {
                text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
            } else if (text.startsWith("```")) {
                text = text.replace(/```\n?/g, "");
            }
            return JSON.parse(text);
        } catch (error) {
            console.error("Code review error:", error);
            return {
                correctness: { score: 50, issues: ["Unable to fully analyze"] },
                timeComplexity: { detected: "Unknown", optimal: question.expected_time_complexity, score: 50 },
                spaceComplexity: { detected: "Unknown", optimal: question.expected_space_complexity, score: 50 },
                codeQuality: { score: 50, issues: [] },
                edgeCases: { handled: [], missing: [], score: 50 },
                optimization: { suggestions: [], score: 50 },
                overallScore: 50,
                feedback: "Review partially completed.",
                interviewerComment: "Let's discuss your approach.",
            };
        }
    }

    /**
     * Generate post-interview analytics report
     */
    async generateReport(session) {
        const { conversations, submissions, questions, persona, duration } = session;

        const prompt = `You are an expert technical interview coach analyzing a completed mock interview.

INTERVIEW DETAILS:
- Company Style: ${persona.company}
- Duration: ${Math.round(duration / 60)} minutes
- Questions Attempted: ${questions.length}

CONVERSATION TRANSCRIPT:
${conversations.map((c) => `[${c.role}]: ${c.content}`).join("\n")}

CODE SUBMISSIONS:
${submissions.map((s, i) => `Question ${i + 1}: ${s.execution_status || "not submitted"} | Runtime: ${s.runtime_ms || "N/A"}ms`).join("\n")}

Generate a comprehensive interview report as JSON (no markdown, just raw JSON):
{
    "overall_score": 0-100,
    "communication_score": 0-100,
    "dsa_score": 0-100,
    "code_quality_score": 0-100,
    "problem_solving_score": 0-100,
    "optimization_score": 0-100,
    "confidence_score": 0-100,
    "interview_readiness": 0-100,
    "feedback_summary": "3-4 sentence overall assessment",
    "strengths": ["list of 3-5 strengths"],
    "weaknesses": ["list of 3-5 areas to improve"],
    "improvement_areas": ["specific actionable recommendations"],
    "recommended_topics": ["topics to study"],
    "recommended_leetcode": ["specific problem names to practice"],
    "study_plan": {
        "week1": "focus area",
        "week2": "focus area",
        "week3": "focus area",
        "week4": "focus area"
    }
}`;

        if (!this.client) {
            return {
                overall_score: 0,
                feedback_summary: "Unable to generate report (Mistral not configured). Please try again.",
                strengths: [],
                weaknesses: [],
            };
        }

        try {
            const response = await this.client.chat.complete({
                model: "mistral-large-latest",
                messages: [{ role: "user", content: prompt }]
            });
            let text = response.choices[0].message.content.trim();
            if (text.startsWith("```json")) {
                text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
            } else if (text.startsWith("```")) {
                text = text.replace(/```\n?/g, "");
            }
            return JSON.parse(text);
        } catch (error) {
            console.error("Report generation error:", error);
            return {
                overall_score: 0,
                feedback_summary: "Unable to generate report. Please try again.",
                strengths: [],
                weaknesses: [],
            };
        }
    }

    /**
     * Enhance a LeetCode problem with harder variations, edge cases, and follow-ups
     */
    async enhanceLeetCodeProblem(problemText) {
        const prompt = `You are a senior FAANG interviewer. Given this LeetCode problem, generate interview enhancements.

ORIGINAL PROBLEM:
${problemText}

Return JSON (no markdown, just raw JSON):
{
    "original_summary": "one line summary",
    "harder_variations": [
        { "title": "Streaming Version", "description": "...", "difficulty": "hard" },
        { "title": "Distributed Version", "description": "...", "difficulty": "hard" },
        { "title": "Memory Constrained", "description": "...", "difficulty": "hard" }
    ],
    "edge_cases": [
        { "type": "edge", "description": "...", "why_tricky": "..." },
        { "type": "corner", "description": "...", "why_tricky": "..." },
        { "type": "trap", "description": "...", "why_tricky": "..." }
    ],
    "follow_up_questions": [
        "What if the input doesn't fit in memory?",
        "How would you handle concurrent access?"
    ],
    "common_mistakes": ["list of common candidate errors"],
    "interviewer_twists": ["unexpected modifications an interviewer might add mid-problem"]
}`;

        if (!this.client) {
            return { error: "Failed to enhance problem (Mistral not configured)" };
        }

        try {
            const response = await this.client.chat.complete({
                model: "mistral-large-latest",
                messages: [{ role: "user", content: prompt }]
            });
            let text = response.choices[0].message.content.trim();
            if (text.startsWith("```json")) {
                text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
            } else if (text.startsWith("```")) {
                text = text.replace(/```\n?/g, "");
            }
            return JSON.parse(text);
        } catch (error) {
            console.error("Enhancement error:", error);
            return { error: "Failed to enhance problem" };
        }
    }
}

module.exports = { MockInterviewAI, PERSONAS, QUESTION_BANK };
