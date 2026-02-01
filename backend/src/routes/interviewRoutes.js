const express = require("express");
const { supabaseAdmin, isSupabaseConfigured } = require("../config/supabaseClient");
const {
    generateQuestion,
    generateStructuredQuestion,
    generateFollowUpQuestion,
    evaluateAnswer,
    evaluateAnswerEnhanced,
    generateInterviewReport,
    isMistralConfigured
} = require("../services/mistralService");
const { makeFollowUpDecision, getHint } = require("../services/followUpService");
const { getQuestionForTopic, matchSkillsToTopics, getSubtopicsForTopic } = require("../data/questionBank");

const router = express.Router();

// Check configuration middleware
const checkConfig = (req, res, next) => {
    if (!isMistralConfigured()) {
        return res.status(503).json({
            success: false,
            error: "Mistral AI is not configured. Please add MISTRAL_API_KEY to .env file.",
        });
    }
    next();
};

// Start a new interview session with structured questions
router.post("/start", async (req, res) => {
    try {
        const { skills, userId, useFollowUpEngine = true } = req.body;

        if (!skills || !Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Skills array is required",
            });
        }

        // Create session in database if Supabase is configured
        let sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        if (isSupabaseConfigured() && supabaseAdmin && userId) {
            const { data, error } = await supabaseAdmin
                .from("interview_sessions")
                .insert({
                    user_id: userId,
                    skills: skills.map(s => typeof s === 'object' ? s.name : s),
                    total_questions: 10, // Max questions for follow-up mode
                    completed_questions: 0,
                    status: "in_progress",
                })
                .select()
                .single();

            if (error) {
                console.error("Error creating session:", error);
            } else if (data) {
                sessionId = data.id;
            }
        }

        const skillNames = skills.map(s => typeof s === 'object' ? s.name : s);

        // Use the new structured question generator
        if (useFollowUpEngine) {
            const questionData = await generateStructuredQuestion(skillNames);

            return res.json({
                success: true,
                data: {
                    sessionId,
                    questionNumber: 1,
                    totalQuestions: 10,
                    question: questionData.question,
                    // Include structured data for follow-up engine
                    questionData: {
                        topic: questionData.topic,
                        subtopic: questionData.subtopic,
                        difficulty: questionData.difficulty,
                        expected_keywords: questionData.expected_keywords,
                        follow_ups: questionData.follow_ups,
                        isFollowUp: false
                    },
                    currentTopic: questionData.topic,
                    currentSubtopic: questionData.subtopic,
                    attemptCount: 0,
                    isFollowUp: false,
                    recruiterMessage: "Let's begin! Tell me about your experience.",
                },
            });
        }

        // Legacy mode - simple question generation
        const question = await generateQuestion(skillNames, 1, []);

        res.json({
            success: true,
            data: {
                sessionId,
                questionNumber: 1,
                totalQuestions: 6,
                question,
            },
        });
    } catch (error) {
        console.error("Interview start error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to start interview",
        });
    }
});

// Submit an answer with follow-up engine support
router.post("/submit", async (req, res) => {
    try {
        const {
            sessionId,
            questionNumber,
            question,
            answer,
            skills,
            userId,
            previousQuestions = [],
            // New follow-up engine params
            questionData = null,
            topicAttempts = {},
            useFollowUpEngine = true
        } = req.body;

        if (!question || !answer) {
            return res.status(400).json({
                success: false,
                error: "Question and answer are required",
            });
        }

        const skillNames = skills ? skills.map(s => typeof s === 'object' ? s.name : s) : [];

        // Use enhanced evaluation with follow-up engine
        if (useFollowUpEngine && questionData) {
            const evaluation = await evaluateAnswerEnhanced(
                question,
                answer,
                skillNames,
                questionData.expected_keywords || []
            );

            // Store answer in database
            if (isSupabaseConfigured() && supabaseAdmin && sessionId && !sessionId.startsWith("session_")) {
                await supabaseAdmin
                    .from("interview_answers")
                    .insert({
                        session_id: sessionId,
                        question_number: questionNumber,
                        question,
                        answer,
                        score: evaluation.score,
                        feedback: evaluation.feedback,
                        classification: evaluation.classification,
                        topic: questionData?.topic || "General",
                    });

                await supabaseAdmin
                    .from("interview_sessions")
                    .update({ completed_questions: questionNumber })
                    .eq("id", sessionId);
            }

            // Use the follow-up decision engine
            const decision = makeFollowUpDecision({
                currentQuestion: questionData,
                answer,
                userSkills: skillNames,
                topicAttempts,
                questionCount: questionNumber,
                maxQuestions: 10
            });

            // If decision doesn't have a next question, generate one
            if (!decision.isComplete && !decision.nextQuestion) {
                const followUp = await generateFollowUpQuestion(
                    questionData.topic,
                    questionData.subtopic,
                    questionData.difficulty,
                    evaluation.classification,
                    question,
                    answer
                );
                decision.nextQuestion = followUp;
            }

            // Check if interview is complete
            if (decision.isComplete) {
                let averageScore = evaluation.score;

                if (isSupabaseConfigured() && supabaseAdmin && sessionId && !sessionId.startsWith("session_")) {
                    const { data: answers } = await supabaseAdmin
                        .from("interview_answers")
                        .select("score")
                        .eq("session_id", sessionId);

                    if (answers && answers.length > 0) {
                        const totalScore = answers.reduce((sum, a) => sum + Number(a.score), 0);
                        averageScore = totalScore / answers.length;

                        await supabaseAdmin
                            .from("interview_sessions")
                            .update({
                                average_score: averageScore,
                                status: "completed",
                                completed_at: new Date().toISOString(),
                            })
                            .eq("id", sessionId);
                    }
                }

                // Generate comprehensive report
                let interviewReport = null;
                if (isSupabaseConfigured() && supabaseAdmin && sessionId && !sessionId.startsWith("session_")) {
                    const { data: allAnswers } = await supabaseAdmin
                        .from("interview_answers")
                        .select("*")
                        .eq("session_id", sessionId)
                        .order("question_number", { ascending: true });

                    if (allAnswers) {
                        interviewReport = await generateInterviewReport({
                            skills: skillNames,
                            answers: allAnswers,
                            averageScore: Math.round(averageScore * 10) / 10,
                            totalQuestions: allAnswers.length
                        });
                    }
                }

                // If no database or report failed, try to generate with current context (fallback)
                if (!interviewReport) {
                    interviewReport = await generateInterviewReport({
                        skills: skillNames,
                        answers: [{
                            question,
                            answer,
                            score: evaluation.score,
                            feedback: evaluation.feedback,
                            topic: questionData.topic
                        }], // Partial data if DB fails
                        averageScore: evaluation.score,
                        totalQuestions: questionNumber
                    });
                }

                return res.json({
                    success: true,
                    data: {
                        isComplete: true,
                        evaluation,
                        averageScore: Math.round(averageScore * 10) / 10,
                        classification: evaluation.classification,
                        recruiterMessage: decision.recruiterMessage || "Great job completing the interview!",
                        interviewReport // Return the full report
                    },
                });
            }

            // Return next question with all follow-up data
            return res.json({
                success: true,
                data: {
                    isComplete: false,
                    evaluation,
                    // Next question data
                    nextQuestionNumber: questionNumber + 1,
                    nextQuestion: decision.nextQuestion.question,
                    nextQuestionData: decision.nextQuestion,
                    // Follow-up engine data
                    classification: evaluation.classification,
                    currentTopic: decision.currentTopic,
                    currentSubtopic: decision.currentSubtopic,
                    attemptCount: decision.attemptCount,
                    isFollowUp: decision.isFollowUp,
                    recruiterMessage: evaluation.recruiterMessage || decision.recruiterMessage,
                    hint: decision.hint,
                    topicAttempts: decision.topicAttempts,
                    matchedKeywords: evaluation.matchedKeywords,
                    matchPercentage: evaluation.matchPercentage,
                },
            });
        }

        // Legacy mode - original evaluation flow
        const evaluation = await evaluateAnswer(question, answer, skillNames);

        // Store answer in database if configured
        if (isSupabaseConfigured() && supabaseAdmin && sessionId && !sessionId.startsWith("session_")) {
            const { error } = await supabaseAdmin
                .from("interview_answers")
                .insert({
                    session_id: sessionId,
                    question_number: questionNumber,
                    question,
                    answer,
                    score: evaluation.score,
                    feedback: evaluation.feedback,
                    topic: questionData?.topic || skillNames[0] || "General",
                });

            if (error) {
                console.error("Error storing answer:", error);
            }

            // Update session progress
            await supabaseAdmin
                .from("interview_sessions")
                .update({ completed_questions: questionNumber })
                .eq("id", sessionId);
        }

        // Check if interview is complete
        if (questionNumber >= 6) {
            // Calculate average score
            let averageScore = evaluation.score;

            if (isSupabaseConfigured() && supabaseAdmin && sessionId && !sessionId.startsWith("session_")) {
                // Get all answers for this session
                const { data: answers } = await supabaseAdmin
                    .from("interview_answers")
                    .select("score")
                    .eq("session_id", sessionId);

                if (answers && answers.length > 0) {
                    const totalScore = answers.reduce((sum, a) => sum + Number(a.score), 0);
                    averageScore = totalScore / answers.length;

                    // Update session with final results
                    await supabaseAdmin
                        .from("interview_sessions")
                        .update({
                            average_score: averageScore,
                            status: "completed",
                            completed_at: new Date().toISOString(),
                        })
                        .eq("id", sessionId);
                }
            }

            return res.json({
                success: true,
                data: {
                    isComplete: true,
                    evaluation,
                    averageScore: Math.round(averageScore * 10) / 10,
                },
            });
        }

        // Generate next question
        const allPreviousQuestions = [...previousQuestions, question];
        const nextQuestion = await generateQuestion(skillNames, questionNumber + 1, allPreviousQuestions);

        res.json({
            success: true,
            data: {
                isComplete: false,
                evaluation,
                nextQuestionNumber: questionNumber + 1,
                nextQuestion,
            },
        });
    } catch (error) {
        console.error("Answer submission error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to process answer",
        });
    }
});

// Get interview results
router.get("/results/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!isSupabaseConfigured() || !supabaseAdmin) {
            return res.status(503).json({
                success: false,
                error: "Database not configured",
            });
        }

        // Get session
        const { data: session, error: sessionError } = await supabaseAdmin
            .from("interview_sessions")
            .select("*")
            .eq("id", sessionId)
            .single();

        if (sessionError || !session) {
            return res.status(404).json({
                success: false,
                error: "Session not found",
            });
        }

        // Get all answers
        const { data: answers, error: answersError } = await supabaseAdmin
            .from("interview_answers")
            .select("*")
            .eq("session_id", sessionId)
            .order("question_number", { ascending: true });

        if (answersError) {
            return res.status(500).json({
                success: false,
                error: "Failed to fetch answers",
            });
        }

        res.json({
            success: true,
            data: {
                session,
                answers,
            },
        });
    } catch (error) {
        console.error("Get results error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to get results",
        });
    }
});

// Get user's interview history
router.get("/history/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!isSupabaseConfigured() || !supabaseAdmin) {
            return res.status(503).json({
                success: false,
                error: "Database not configured",
            });
        }

        const { data: sessions, error } = await supabaseAdmin
            .from("interview_sessions")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(500).json({
                success: false,
                error: "Failed to fetch history",
            });
        }

        res.json({
            success: true,
            data: sessions,
        });
    } catch (error) {
        console.error("Get history error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to get history",
        });
    }
});

// Save interview results for dashboard analytics
router.post("/save-results", async (req, res) => {
    try {
        const { userId, skill, skillsArray, averageScore, totalQuestions, correctAnswers, xpEarned } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required",
            });
        }

        if (!isSupabaseConfigured() || !supabaseAdmin) {
            return res.status(503).json({
                success: false,
                error: "Database not configured",
            });
        }

        // Calculate correct answers based on average score
        const calculatedCorrect = correctAnswers || Math.round((averageScore / 10) * totalQuestions);
        const calculatedXp = xpEarned || Math.round(averageScore * 10);

        // Insert main interview result (with combined skill label)
        const { data, error } = await supabaseAdmin
            .from("interview_results")
            .insert({
                user_id: userId,
                skill: skill || "General",
                score: Math.round(averageScore * 10), // Convert 0-10 to 0-100
                total_questions: totalQuestions || 6,
                correct_answers: calculatedCorrect,
                xp_earned: calculatedXp,
                interview_date: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error("Error saving interview results:", error);
            return res.status(500).json({
                success: false,
                error: "Failed to save interview results",
            });
        }

        // If skillsArray provided, also save individual skill progress records
        // This allows each skill to be tracked for focus area progress
        if (skillsArray && Array.isArray(skillsArray) && skillsArray.length > 0) {
            const individualSkillRecords = skillsArray.map(skillName => ({
                user_id: userId,
                skill: skillName,
                score: Math.round(averageScore * 10),
                total_questions: Math.ceil(totalQuestions / skillsArray.length) || 1,
                correct_answers: Math.ceil(calculatedCorrect / skillsArray.length) || 0,
                xp_earned: Math.round(calculatedXp / skillsArray.length),
                interview_date: new Date().toISOString(),
            }));

            // Insert individual skill records (ignore errors to not break main flow)
            await supabaseAdmin
                .from("interview_results")
                .insert(individualSkillRecords)
                .catch(err => {
                    console.warn("Could not save individual skill records:", err.message);
                });
        }

        // Also update user's total XP
        await supabaseAdmin.rpc("increment_user_xp", {
            user_id_param: userId,
            xp_amount: calculatedXp,
        }).catch(() => {
            // If RPC doesn't exist, try direct update
            return supabaseAdmin
                .from("users")
                .update({ total_xp: supabaseAdmin.raw(`COALESCE(total_xp, 0) + ${calculatedXp}`) })
                .eq("id", userId);
        });

        // Record activity for heatmap
        try {
            const today = new Date().toISOString().split("T")[0];
            await supabaseAdmin
                .from("user_activity_log")
                .insert({
                    user_id: userId,
                    activity_type: "interview_completed",
                    activity_date: today,
                    xp_earned: calculatedXp,
                });
        } catch (err) {
            console.log("Activity log note:", err.message);
        }

        res.json({
            success: true,
            data: {
                id: data.id,
                xpEarned: calculatedXp,
            },
        });
    } catch (error) {
        console.error("Save results error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to save results",
        });
    }
});

module.exports = router;
