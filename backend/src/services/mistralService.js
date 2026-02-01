const { Mistral } = require("@mistralai/mistralai");
const { getQuestionByIndex } = require("./questionService");
const { getInitialQuestion, getQuestionForTopic, matchSkillsToTopics, getSubtopicsForTopic } = require("../data/questionBank");
const { evaluateWithKeywords, getRecruiterMessage, getHint } = require("./followUpService");

const apiKey = process.env.MISTRAL_API_KEY;
let client = null;

// Initialize Mistral client
if (apiKey && apiKey !== "your_mistral_api_key_here") {
    try {
        client = new Mistral({ apiKey });
        console.log("✅ Mistral AI initialized successfully");
    } catch (error) {
        console.warn("⚠️ Failed to initialize Mistral:", error.message);
    }
} else {
    console.warn("⚠️ Mistral not configured. Add MISTRAL_API_KEY to .env file.");
}

// Check if Mistral is configured
const isMistralConfigured = () => {
    return client !== null;
};

// Fallback questions when Mistral is unavailable or quota exceeded
const fallbackQuestions = [
    "Explain the difference between let, const, and var in JavaScript. When would you use each?",
    "What is the event loop in JavaScript and how does it handle asynchronous operations?",
    "Describe the concept of closures in JavaScript with a practical example.",
    "What are the differences between REST and GraphQL APIs? When would you choose one over the other?",
    "Explain Big O notation and give examples of O(1), O(n), and O(n²) time complexity.",
    "What is the difference between authentication and authorization? How would you implement them?",
];

/**
 * Generate a structured initial question with topic/subtopic info
 */
const generateStructuredQuestion = async (skills) => {
    const skillNames = Array.isArray(skills)
        ? skills.map(s => typeof s === 'object' ? s.name : s)
        : [skills];

    // Try to get from question bank first
    const questionData = getInitialQuestion(skillNames);

    if (questionData) {
        return {
            topic: questionData.topic,
            subtopic: questionData.subtopic,
            difficulty: questionData.difficulty,
            question: questionData.question,
            expected_keywords: questionData.expected_keywords,
            follow_ups: questionData.follow_ups,
            isFollowUp: false
        };
    }

    // Fall back to AI-generated question with structure
    if (!client) {
        return {
            topic: "JavaScript",
            subtopic: "general",
            difficulty: "medium",
            question: fallbackQuestions[0],
            expected_keywords: ["let", "const", "var", "scope", "hoisting", "block scope"],
            follow_ups: {
                wrong: ["What do you understand about variable declaration in JavaScript?"],
                partial: ["Can you explain what block scope means?"],
                correct: ["How does variable hoisting differ between var and let?"]
            },
            isFollowUp: false
        };
    }

    // Generate with Mistral
    const topic = skillNames[0] || "JavaScript";
    const prompt = `Generate a technical interview question about ${topic}.

Respond in this exact JSON format (no markdown):
{
    "question": "<the interview question>",
    "expected_keywords": ["<keyword1>", "<keyword2>", "<keyword3>"],
    "follow_ups": {
        "wrong": ["<easier follow-up question>"],
        "partial": ["<clarifying follow-up question>"],
        "correct": ["<harder follow-up question>"]
    }
}`;

    try {
        const response = await client.chat.complete({
            model: "mistral-large-latest",
            messages: [{ role: "user", content: prompt }],
        });

        let text = response.choices[0].message.content.trim();
        if (text.startsWith("```")) {
            text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        }

        const parsed = JSON.parse(text);
        return {
            topic,
            subtopic: "general",
            difficulty: "medium",
            question: parsed.question,
            expected_keywords: parsed.expected_keywords || [],
            follow_ups: parsed.follow_ups || {},
            isFollowUp: false
        };
    } catch (error) {
        console.error("Error generating structured question:", error.message);
        return {
            topic: "JavaScript",
            subtopic: "general",
            difficulty: "medium",
            question: fallbackQuestions[0],
            expected_keywords: ["let", "const", "var", "scope", "hoisting"],
            follow_ups: {},
            isFollowUp: false
        };
    }
};

/**
 * Generate a follow-up question based on the classification
 */
const generateFollowUpQuestion = async (topic, subtopic, difficulty, classification, previousQuestion, previousAnswer) => {
    // Try question bank first
    const questionData = getQuestionForTopic(topic, subtopic, difficulty);

    if (questionData && questionData.follow_ups && questionData.follow_ups[classification]) {
        const followUps = questionData.follow_ups[classification];
        const followUp = followUps[Math.floor(Math.random() * followUps.length)];
        return {
            topic,
            subtopic,
            difficulty,
            question: followUp,
            expected_keywords: questionData.expected_keywords,
            follow_ups: questionData.follow_ups,
            isFollowUp: true
        };
    }

    // Fall back to AI generation
    if (!client) {
        const difficultyAdjust = classification === "wrong" ? "simpler" : classification === "partial" ? "clarifying" : "more challenging";
        return {
            topic,
            subtopic,
            difficulty,
            question: `Let me ask a ${difficultyAdjust} question about ${topic}: Can you explain the basic concept?`,
            expected_keywords: [],
            follow_ups: {},
            isFollowUp: true
        };
    }

    const classificationPrompts = {
        wrong: "The candidate's answer was incorrect. Generate a simpler, more conceptual follow-up question on the same topic.",
        partial: "The candidate's answer was partially correct. Generate a clarifying follow-up to help them elaborate.",
        correct: "The candidate answered correctly. Generate a more challenging follow-up question on the same topic."
    };

    const prompt = `Topic: ${topic}
Subtopic: ${subtopic}
Previous Question: ${previousQuestion}
Candidate's Answer: ${previousAnswer}

${classificationPrompts[classification]}

Respond in this exact JSON format (no markdown):
{
    "question": "<follow-up question>",
    "expected_keywords": ["<keyword1>", "<keyword2>"]
}`;

    try {
        const response = await client.chat.complete({
            model: "mistral-large-latest",
            messages: [{ role: "user", content: prompt }],
        });

        let text = response.choices[0].message.content.trim();
        if (text.startsWith("```")) {
            text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        }

        const parsed = JSON.parse(text);
        return {
            topic,
            subtopic,
            difficulty,
            question: parsed.question,
            expected_keywords: parsed.expected_keywords || [],
            follow_ups: {},
            isFollowUp: true
        };
    } catch (error) {
        console.error("Error generating follow-up:", error.message);
        return {
            topic,
            subtopic,
            difficulty,
            question: `Can you explain your understanding of ${subtopic} in ${topic}?`,
            expected_keywords: [],
            follow_ups: {},
            isFollowUp: true
        };
    }
};

// Generate a technical interview question based on user skills (legacy support)
const generateQuestion = async (skills, questionNumber, previousQuestions = []) => {
    const skillNames = Array.isArray(skills)
        ? skills.map(s => typeof s === 'object' ? s.name : s)
        : [skills];

    // Use fallback if Mistral not configured
    if (!client) {
        console.log("Using database fallback (Mistral not configured)");
        const dbQuestion = await getQuestionByIndex(skillNames, questionNumber);
        return dbQuestion || fallbackQuestions[questionNumber - 1] || fallbackQuestions[0];
    }

    const skillsList = skillNames.join(", ");

    const prompt = `You are a technical interviewer. Generate question #${questionNumber} of 6 for a software developer interview.

The candidate has these skills: ${skillsList}

${previousQuestions.length > 0 ? `Previous questions asked (avoid repeating similar topics):
${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}` : ""}

Requirements:
- Ask a practical, real-world technical question
- Focus on problem-solving, not just definitions
- Vary difficulty: questions 1-2 are easy, 3-4 medium, 5-6 hard
- Keep the question concise but clear
- Don't ask multi-part questions

Respond with ONLY the question text, nothing else.`;

    try {
        const response = await client.chat.complete({
            model: "mistral-large-latest",
            messages: [
                { role: "user", content: prompt }
            ],
        });

        const question = response.choices[0].message.content.trim();
        return question;
    } catch (error) {
        console.error("Mistral error, using database fallback:", error.message);
        // Try database fallback first, then hardcoded
        const dbQuestion = await getQuestionByIndex(skillNames, questionNumber);
        return dbQuestion || fallbackQuestions[questionNumber - 1] || fallbackQuestions[0];
    }
};

/**
 * Evaluate answer with both AI and keyword matching
 */
const evaluateAnswerEnhanced = async (question, answer, skills, expectedKeywords = []) => {
    // First, do keyword-based classification
    const keywordEval = evaluateWithKeywords(answer, expectedKeywords);

    // Get recruiter message based on classification
    const recruiterMessage = getRecruiterMessage(keywordEval.classification);

    // Fallback evaluation when Mistral is not available
    if (!client) {
        console.log("Using fallback evaluation (Mistral not configured)");

        // Use keyword-based scoring as primary
        let score;
        if (keywordEval.classification === "correct") {
            score = 8 + Math.random() * 2; // 8-10
        } else if (keywordEval.classification === "partial") {
            score = 5 + Math.random() * 2; // 5-7
        } else {
            score = 2 + Math.random() * 2; // 2-4
        }

        return {
            score: Math.round(score * 10) / 10,
            feedback: "Your answer has been evaluated based on key concepts.",
            strengths: keywordEval.matchedKeywords.length > 0
                ? `You mentioned: ${keywordEval.matchedKeywords.join(", ")}`
                : "Answer was provided",
            improvements: keywordEval.classification !== "correct"
                ? "Try to include more specific technical terms and concepts."
                : "Great job covering the key concepts!",
            classification: keywordEval.classification,
            matchedKeywords: keywordEval.matchedKeywords,
            matchPercentage: keywordEval.matchPercentage,
            recruiterMessage
        };
    }

    const prompt = `You are a technical interviewer evaluating a candidate's answer.

Question: ${question}

Candidate's Answer: ${answer}

Candidate's Skills: ${Array.isArray(skills) ? skills.join(", ") : skills}

Evaluate the answer based on:
1. Technical accuracy
2. Completeness
3. Clarity of explanation
4. Practical understanding

Respond in this exact JSON format (no markdown, just JSON):
{
    "score": <number from 0 to 10>,
    "feedback": "<brief constructive feedback, 1-2 sentences>",
    "strengths": "<what they did well, if any>",
    "improvements": "<what could be improved, if any>"
}`;

    try {
        const response = await client.chat.complete({
            model: "mistral-large-latest",
            messages: [
                { role: "user", content: prompt }
            ],
        });

        let text = response.choices[0].message.content.trim();

        // Clean up the response if it has markdown code blocks
        if (text.startsWith("```json")) {
            text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (text.startsWith("```")) {
            text = text.replace(/```\n?/g, "");
        }

        const evaluation = JSON.parse(text);

        // Ensure score is within bounds
        evaluation.score = Math.max(0, Math.min(10, Number(evaluation.score) || 0));

        // Merge with keyword evaluation
        return {
            ...evaluation,
            classification: keywordEval.classification,
            matchedKeywords: keywordEval.matchedKeywords,
            matchPercentage: keywordEval.matchPercentage,
            recruiterMessage
        };
    } catch (error) {
        console.error("Mistral evaluation error:", error);
        // Return keyword-based evaluation if AI fails
        let score = keywordEval.classification === "correct" ? 8 :
            keywordEval.classification === "partial" ? 5 : 3;

        return {
            score,
            feedback: "Unable to fully evaluate the answer. Please review manually.",
            strengths: keywordEval.matchedKeywords.length > 0
                ? `Mentioned: ${keywordEval.matchedKeywords.join(", ")}`
                : "Answer was provided",
            improvements: "Could not parse full evaluation",
            classification: keywordEval.classification,
            matchedKeywords: keywordEval.matchedKeywords,
            matchPercentage: keywordEval.matchPercentage,
            recruiterMessage
        };
    }
};

// Generate a comprehensive interview report
const generateInterviewReport = async (sessionData) => {
    const {
        skills,
        answers,
        averageScore,
        totalQuestions
    } = sessionData;

    // Analyze answers by topic to build proper topicAnalysis
    const topicScores = new Map();

    // Process each answer to group by topic
    if (answers && answers.length > 0) {
        answers.forEach(answer => {
            const topic = answer.topic || "General";
            const existing = topicScores.get(topic) || { scores: [], attempts: 0 };
            existing.scores.push(Number(answer.score) || 0);
            existing.attempts += 1;
            topicScores.set(topic, existing);
        });
    }

    // Build topicAnalysis from the grouped data
    const topicAnalysis = [];
    topicScores.forEach((data, topic) => {
        const avgTopicScore = data.scores.length > 0
            ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
            : 0;

        // Determine strength based on score
        let strength = "Average";
        if (avgTopicScore >= 7) strength = "Strong";
        else if (avgTopicScore < 5) strength = "Weak";

        topicAnalysis.push({
            topic,
            attempts: data.attempts,
            strength,
            score: Math.round(avgTopicScore * 10) / 10
        });
    });

    // If no topics were extracted from answers, use skills as fallback
    if (topicAnalysis.length === 0 && skills && skills.length > 0) {
        skills.forEach(skill => {
            topicAnalysis.push({
                topic: skill,
                attempts: Math.ceil(totalQuestions / skills.length),
                strength: averageScore >= 7 ? "Strong" : averageScore >= 5 ? "Average" : "Weak",
                score: Math.round(averageScore * 10) / 10
            });
        });
    }

    // Determine difficulty and performance level
    const difficultyReached = averageScore >= 8 ? "Hard" : averageScore >= 5 ? "Medium" : "Easy";
    const performanceLevel = averageScore >= 8 ? "Senior" : averageScore >= 6 ? "Mid" : "Junior";

    if (!client) {
        // Fallback report with proper structure
        const strongTopics = topicAnalysis.filter(t => t.strength === "Strong").map(t => t.topic);
        const weakTopics = topicAnalysis.filter(t => t.strength === "Weak").map(t => t.topic);

        return {
            summary: {
                totalQuestions,
                averageScore: Math.round(averageScore * 10) / 10,
                difficultyReached,
                performanceLevel
            },
            topicAnalysis,
            recruiterInsights: [
                `Candidate demonstrated ${performanceLevel.toLowerCase()}-level expertise across ${topicAnalysis.length} topic areas.`,
                averageScore >= 7
                    ? "Shows strong grasp of core concepts and problem-solving abilities."
                    : "Has foundational knowledge but could benefit from deeper exploration of key topics."
            ],
            strengths: strongTopics.length > 0
                ? strongTopics.map(t => `Strong understanding of ${t}`)
                : ["Completed all interview questions", "Good communication during the session"],
            weaknesses: weakTopics.length > 0
                ? weakTopics.map(t => `Needs improvement in ${t}`)
                : ["Some areas could use more depth"],
            recommendations: [
                ...weakTopics.slice(0, 3).map(t => `Practice more problems on ${t}`),
                "Review fundamental concepts regularly",
                "Try solving real-world coding challenges"
            ].slice(0, 4),
            finalVerdict: averageScore >= 8 ? "Strong Hire" :
                averageScore >= 6 ? "Interview Ready" :
                    averageScore >= 4 ? "Needs Improvement" : "Not Ready"
        };
    }

    const transcript = answers.map((a, i) =>
        `Q${i + 1} (${a.topic || "General"}): ${a.question}
        Answer: ${a.answer}
        Score: ${a.score}/10
        Feedback: ${a.feedback}`
    ).join("\n\n");

    const prompt = `You are a Senior Technical Recruiter creating a final interview report.
    
    Candidate Skills: ${skills.join(", ")}
    Overall Score: ${averageScore}/10
    
    Interview Transcript:
    ${transcript}
    
    Generate a detailed JSON report with the following structure (no markdown):
    {
        "summary": {
            "totalQuestions": ${totalQuestions},
            "averageScore": ${averageScore},
            "difficultyReached": "Easy/Medium/Hard",
            "performanceLevel": "Junior/Mid/Senior"
        },
        "topicAnalysis": [
            { "topic": "TopicName", "attempts": number, "strength": "Weak/Average/Strong", "score": number }
        ],
        "recruiterInsights": [
            "2-3 sentences of professional, human-like insight about the candidate's mindset and depth."
        ],
        "strengths": ["List of specific strong areas"],
        "weaknesses": ["List of specific weak areas"],
        "recommendations": [
            "Specific, actionable study advice for weak areas"
        ],
        "finalVerdict": "Not Ready / Needs Improvement / Interview Ready / Strong Hire"
    }`;

    try {
        const response = await client.chat.complete({
            model: "mistral-large-latest",
            messages: [{ role: "user", content: prompt }],
        });

        let text = response.choices[0].message.content.trim();
        if (text.startsWith("```")) {
            text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        }

        const aiReport = JSON.parse(text);

        // Ensure topicAnalysis from AI has all required fields, merge with our analysis
        if (!aiReport.topicAnalysis || aiReport.topicAnalysis.length === 0) {
            aiReport.topicAnalysis = topicAnalysis;
        } else {
            // Validate and fix AI's topicAnalysis
            aiReport.topicAnalysis = aiReport.topicAnalysis.map(t => ({
                topic: t.topic || "Unknown",
                attempts: t.attempts || 1,
                strength: t.strength || "Average",
                score: typeof t.score === 'number' ? t.score : averageScore
            }));
        }

        // Ensure summary has all fields
        if (!aiReport.summary.performanceLevel) {
            aiReport.summary.performanceLevel = performanceLevel;
        }

        return { ...aiReport, skills };
    } catch (error) {
        console.error("Error generating report:", error);
        // Return a complete fallback report
        const strongTopics = topicAnalysis.filter(t => t.strength === "Strong").map(t => t.topic);
        const weakTopics = topicAnalysis.filter(t => t.strength === "Weak").map(t => t.topic);

        return {
            skills,
            summary: {
                totalQuestions,
                averageScore: Math.round(averageScore * 10) / 10,
                difficultyReached,
                performanceLevel
            },
            topicAnalysis,
            recruiterInsights: [
                `Candidate showed ${performanceLevel.toLowerCase()}-level competency.`,
                "Performance was evaluated based on technical accuracy and depth of answers."
            ],
            strengths: strongTopics.length > 0
                ? strongTopics.map(t => `Strong understanding of ${t}`)
                : ["Completed the interview session"],
            weaknesses: weakTopics.length > 0
                ? weakTopics.map(t => `Needs improvement in ${t}`)
                : ["Could provide more detailed explanations"],
            recommendations: [
                "Continue practicing coding challenges",
                "Review core concepts for weaker topics"
            ],
            finalVerdict: averageScore >= 7 ? "Interview Ready" : "Needs Improvement"
        };
    }
};


// Legacy alias
const evaluateAnswer = evaluateAnswerEnhanced;

module.exports = {
    generateQuestion,
    generateStructuredQuestion,
    generateFollowUpQuestion,
    evaluateAnswer,
    evaluateAnswerEnhanced,
    generateInterviewReport,
    isMistralConfigured,
};

