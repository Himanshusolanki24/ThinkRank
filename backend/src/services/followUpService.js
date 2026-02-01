/**
 * Follow-Up Question Engine Service
 * Handles answer evaluation with keyword matching and follow-up question selection
 */

const { questionBank, getQuestionForTopic, getSubtopicsForTopic, matchSkillsToTopics } = require("../data/questionBank");

// Recruiter messages for different classifications
const recruiterMessages = {
    wrong: [
        "Let's approach this from a different angle.",
        "Let me rephrase that for you.",
        "Let's try a simpler version of this concept.",
        "No worries, let's break this down.",
        "Let's revisit the fundamentals here."
    ],
    partial: [
        "Good start! Let's go deeper into this.",
        "You're on the right track. Let me dig a bit more.",
        "Interesting perspective. Can you elaborate?",
        "That covers part of it. Let's explore further.",
        "Nice attempt! Let's clarify a few points."
    ],
    correct: [
        "Excellent! Let's move to something more challenging.",
        "Great answer! Moving on to the next topic.",
        "Perfect! Let's explore a related concept.",
        "Well done! Increasing the difficulty now.",
        "Spot on! Let's see how you handle this."
    ]
};

// Hints for different topics after multiple failed attempts
const topicHints = {
    React: {
        useEffect: "Think about what side effects are and when they should run in the component lifecycle.",
        useState: "Remember that state is how components remember information between renders.",
        hooks: "Consider why React needs hooks to be called in the same order every time."
    },
    JavaScript: {
        closures: "A closure is when a function remembers variables from where it was created.",
        async: "Think about what happens when code doesn't wait for something to complete.",
        eventLoop: "The event loop handles which code runs next when async operations complete."
    },
    DBMS: {
        sqlJoins: "JOINs combine rows from different tables based on a related column.",
        indexing: "Indexes are like a book index - they help find data faster."
    },
    DataStructures: {
        arrays: "Arrays store items sequentially in memory, which affects performance.",
        trees: "Trees are hierarchical structures with parent-child relationships."
    }
};

/**
 * Evaluate an answer based on expected keywords
 * @param {string} answer - User's answer
 * @param {string[]} expectedKeywords - Keywords to match
 * @returns {{ classification: string, matchedKeywords: string[], matchPercentage: number }}
 */
const evaluateWithKeywords = (answer, expectedKeywords) => {
    if (!answer || !expectedKeywords || expectedKeywords.length === 0) {
        return {
            classification: "wrong",
            matchedKeywords: [],
            matchPercentage: 0
        };
    }

    const normalizedAnswer = answer.toLowerCase();
    const matchedKeywords = [];

    for (const keyword of expectedKeywords) {
        const normalizedKeyword = keyword.toLowerCase();
        // Check for exact match or variations
        if (
            normalizedAnswer.includes(normalizedKeyword) ||
            normalizedAnswer.includes(normalizedKeyword.replace(/\s+/g, "")) ||
            normalizedAnswer.includes(normalizedKeyword.replace(/-/g, " "))
        ) {
            matchedKeywords.push(keyword);
        }
    }

    const matchPercentage = (matchedKeywords.length / expectedKeywords.length) * 100;

    let classification;
    if (matchPercentage >= 60) {
        classification = "correct";
    } else if (matchPercentage >= 30) {
        classification = "partial";
    } else {
        classification = "wrong";
    }

    return {
        classification,
        matchedKeywords,
        matchPercentage: Math.round(matchPercentage)
    };
};

/**
 * Get a follow-up question based on classification
 * @param {Object} currentQuestion - Current question data
 * @param {string} classification - wrong/partial/correct
 * @param {number} attemptCount - Number of attempts on this topic
 * @returns {string|null} Follow-up question text
 */
const getFollowUpQuestion = (currentQuestion, classification, attemptCount) => {
    if (!currentQuestion || !currentQuestion.follow_ups) {
        return null;
    }

    const followUps = currentQuestion.follow_ups[classification];
    if (!followUps || followUps.length === 0) {
        return null;
    }

    // Use attempt count to cycle through available follow-ups
    const index = (attemptCount - 1) % followUps.length;
    return followUps[index];
};

/**
 * Get a hint for the current topic after multiple failed attempts
 * @param {string} topic - Current topic
 * @param {string} subtopic - Current subtopic
 * @param {number} attemptCount - Number of attempts
 * @returns {string|null} Hint text or null
 */
const getHint = (topic, subtopic, attemptCount) => {
    // Only provide hints after 2 or more failed attempts
    if (attemptCount < 2) {
        return null;
    }

    const topicHintData = topicHints[topic];
    if (!topicHintData) {
        return "Think about the core concept being asked and try to explain it simply.";
    }

    return topicHintData[subtopic] || "Think about the core concept being asked and try to explain it simply.";
};

/**
 * Get a random recruiter message based on classification
 * @param {string} classification - wrong/partial/correct
 * @returns {string} Recruiter message
 */
const getRecruiterMessage = (classification) => {
    const messages = recruiterMessages[classification] || recruiterMessages.partial;
    return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Determine the difficulty for the next question
 * @param {string} currentDifficulty - Current difficulty level
 * @param {string} classification - Answer classification
 * @returns {string} New difficulty level
 */
const adjustDifficulty = (currentDifficulty, classification) => {
    const difficulties = ["easy", "medium", "hard"];
    const currentIndex = difficulties.indexOf(currentDifficulty);

    if (classification === "correct") {
        // Move up in difficulty
        return difficulties[Math.min(currentIndex + 1, difficulties.length - 1)];
    } else if (classification === "wrong") {
        // Move down in difficulty
        return difficulties[Math.max(currentIndex - 1, 0)];
    }
    // Keep same difficulty for partial
    return currentDifficulty;
};

/**
 * Get the next topic and subtopic based on progression
 * @param {string} currentTopic - Current topic
 * @param {string} currentSubtopic - Current subtopic
 * @param {string[]} userSkills - User's skills
 * @param {Object} topicProgress - Progress tracking object
 * @returns {{ topic: string, subtopic: string }|null}
 */
const getNextTopicSubtopic = (currentTopic, currentSubtopic, userSkills, topicProgress = {}) => {
    const matchedTopics = matchSkillsToTopics(userSkills);

    // Try to find next subtopic in current topic
    const subtopics = getSubtopicsForTopic(currentTopic);
    const currentSubtopicIndex = subtopics.indexOf(currentSubtopic);

    if (currentSubtopicIndex < subtopics.length - 1) {
        // Move to next subtopic in same topic
        return {
            topic: currentTopic,
            subtopic: subtopics[currentSubtopicIndex + 1]
        };
    }

    // Move to next topic
    const currentTopicIndex = matchedTopics.indexOf(currentTopic);
    if (currentTopicIndex < matchedTopics.length - 1) {
        const nextTopic = matchedTopics[currentTopicIndex + 1];
        const nextSubtopics = getSubtopicsForTopic(nextTopic);
        if (nextSubtopics.length > 0) {
            return {
                topic: nextTopic,
                subtopic: nextSubtopics[0]
            };
        }
    }

    // No more topics - interview complete
    return null;
};

/**
 * Main decision engine for determining the next question
 * Fixed: Ensures interview continues until maxQuestions (10) are reached
 * @param {Object} params - Engine parameters
 * @returns {Object} Next question decision
 */
const makeFollowUpDecision = ({
    currentQuestion,
    answer,
    userSkills,
    topicAttempts = {},
    questionCount = 0,
    maxQuestions = 10
}) => {
    // Check if interview should end - ONLY when max questions reached
    if (questionCount >= maxQuestions) {
        return {
            isComplete: true,
            reason: "max_questions_reached"
        };
    }

    // Evaluate the answer
    const evaluation = evaluateWithKeywords(answer, currentQuestion.expected_keywords);
    const { classification, matchedKeywords, matchPercentage } = evaluation;

    // Track attempts for current topic
    const topicKey = `${currentQuestion.topic}-${currentQuestion.subtopic}`;
    const currentAttempts = (topicAttempts[topicKey] || 0) + 1;

    // Get recruiter message
    const recruiterMessage = getRecruiterMessage(classification);

    // Get hint if needed
    const hint = classification !== "correct" ? getHint(currentQuestion.topic, currentQuestion.subtopic, currentAttempts) : null;

    // Determine next question
    let nextQuestion = null;
    let isFollowUp = false;
    let newTopic = currentQuestion.topic;
    let newSubtopic = currentQuestion.subtopic;
    let newDifficulty = currentQuestion.difficulty;

    if (classification === "correct") {
        // Move to next topic or increase difficulty
        let nextTopicData = getNextTopicSubtopic(
            currentQuestion.topic,
            currentQuestion.subtopic,
            userSkills,
            topicAttempts
        );

        // If no more topics but we haven't reached 10 questions, cycle back to first topic
        if (!nextTopicData && questionCount < maxQuestions - 1) {
            const matchedTopics = matchSkillsToTopics(userSkills);
            if (matchedTopics.length > 0) {
                const cycleTopic = matchedTopics[questionCount % matchedTopics.length];
                const subtopics = getSubtopicsForTopic(cycleTopic);
                if (subtopics.length > 0) {
                    nextTopicData = {
                        topic: cycleTopic,
                        subtopic: subtopics[Math.floor(Math.random() * subtopics.length)]
                    };
                }
            }
        }

        if (!nextTopicData) {
            // Truly no more questions available AND we've asked enough
            if (questionCount >= maxQuestions - 1) {
                return {
                    isComplete: true,
                    reason: "all_topics_covered",
                    classification,
                    matchedKeywords,
                    matchPercentage,
                    recruiterMessage
                };
            }
            // Fallback: generate from any available topic
            nextTopicData = getRandomTopicSubtopic(userSkills);
        }

        if (nextTopicData) {
            newTopic = nextTopicData.topic;
            newSubtopic = nextTopicData.subtopic;
            newDifficulty = currentQuestion.topic === newTopic ? adjustDifficulty(currentQuestion.difficulty, classification) : "easy";

            const questionData = getQuestionForTopic(newTopic, newSubtopic, newDifficulty);
            if (questionData) {
                nextQuestion = {
                    topic: newTopic,
                    subtopic: newSubtopic,
                    difficulty: newDifficulty,
                    question: questionData.question,
                    expected_keywords: questionData.expected_keywords,
                    follow_ups: questionData.follow_ups,
                    isFollowUp: false
                };
            }
        }
    } else {
        // Ask follow-up on same topic
        isFollowUp = true;

        // After 3 attempts, give up on this subtopic and move on
        if (currentAttempts >= 3) {
            let nextTopicData = getNextTopicSubtopic(
                currentQuestion.topic,
                currentQuestion.subtopic,
                userSkills,
                topicAttempts
            );

            // If no more topics but we haven't reached 10 questions, cycle
            if (!nextTopicData && questionCount < maxQuestions - 1) {
                const matchedTopics = matchSkillsToTopics(userSkills);
                if (matchedTopics.length > 0) {
                    const cycleTopic = matchedTopics[questionCount % matchedTopics.length];
                    const subtopics = getSubtopicsForTopic(cycleTopic);
                    if (subtopics.length > 0) {
                        nextTopicData = {
                            topic: cycleTopic,
                            subtopic: subtopics[Math.floor(Math.random() * subtopics.length)]
                        };
                    }
                }
            }

            if (!nextTopicData) {
                if (questionCount >= maxQuestions - 1) {
                    return {
                        isComplete: true,
                        reason: "all_topics_covered",
                        classification,
                        matchedKeywords,
                        matchPercentage,
                        recruiterMessage: "Let's move on. We've covered the key areas.",
                        hint
                    };
                }
                // Fallback
                nextTopicData = getRandomTopicSubtopic(userSkills);
            }

            if (nextTopicData) {
                newTopic = nextTopicData.topic;
                newSubtopic = nextTopicData.subtopic;
                newDifficulty = "easy";
                isFollowUp = false;

                const questionData = getQuestionForTopic(newTopic, newSubtopic, newDifficulty);
                if (questionData) {
                    nextQuestion = {
                        topic: newTopic,
                        subtopic: newSubtopic,
                        difficulty: newDifficulty,
                        question: questionData.question,
                        expected_keywords: questionData.expected_keywords,
                        follow_ups: questionData.follow_ups,
                        isFollowUp: false
                    };
                }
            }
        } else {
            // Get follow-up question
            const followUpText = getFollowUpQuestion(currentQuestion, classification, currentAttempts);

            if (followUpText) {
                // Adjust difficulty for follow-up
                newDifficulty = adjustDifficulty(currentQuestion.difficulty, classification);

                nextQuestion = {
                    topic: currentQuestion.topic,
                    subtopic: currentQuestion.subtopic,
                    difficulty: newDifficulty,
                    question: followUpText,
                    expected_keywords: currentQuestion.expected_keywords,
                    follow_ups: currentQuestion.follow_ups,
                    isFollowUp: true
                };
            }
        }
    }

    // Update topic attempts
    const updatedTopicAttempts = { ...topicAttempts };
    if (classification !== "correct") {
        updatedTopicAttempts[topicKey] = currentAttempts;
    } else {
        // Reset attempts for completed topic
        delete updatedTopicAttempts[topicKey];
    }

    return {
        isComplete: false,
        nextQuestion,
        classification,
        matchedKeywords,
        matchPercentage,
        currentTopic: nextQuestion?.topic || currentQuestion.topic,
        currentSubtopic: nextQuestion?.subtopic || currentQuestion.subtopic,
        attemptCount: classification === "correct" ? 0 : currentAttempts,
        recruiterMessage,
        hint,
        isFollowUp,
        topicAttempts: updatedTopicAttempts
    };
};

/**
 * Get a random topic and subtopic from available options
 * Fallback when normal topic progression is exhausted
 */
const getRandomTopicSubtopic = (userSkills) => {
    const matchedTopics = matchSkillsToTopics(userSkills);
    if (matchedTopics.length === 0) return null;

    const randomTopic = matchedTopics[Math.floor(Math.random() * matchedTopics.length)];
    const subtopics = getSubtopicsForTopic(randomTopic);
    if (subtopics.length === 0) return null;

    return {
        topic: randomTopic,
        subtopic: subtopics[Math.floor(Math.random() * subtopics.length)]
    };
};

module.exports = {
    evaluateWithKeywords,
    getFollowUpQuestion,
    getHint,
    getRecruiterMessage,
    adjustDifficulty,
    getNextTopicSubtopic,
    makeFollowUpDecision
};
