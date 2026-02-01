const axios = require('axios');

const API_URL = 'http://localhost:3001/api/interview';

// Helper to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runVerification() {
    console.log("🚀 Starting Verification of Follow-Up Engine...\n");

    try {
        // Step 1: Start Interview
        console.log("1️⃣ Starting Interview with skills: ['React', 'JavaScript']...");
        const startResponse = await axios.post(`${API_URL}/start`, {
            skills: ['React', 'JavaScript'],
            userId: 'test-user-123',
            useFollowUpEngine: true
        });

        const { sessionId, question, questionData } = startResponse.data.data;
        console.log(`   ✅ Session started: ${sessionId}`);
        console.log(`   📝 Initial Question: ${question}`);
        console.log(`   🏷️ Topic: ${questionData.topic}, Subtopic: ${questionData.subtopic}\n`);

        if (!questionData) {
            console.error("   ❌ Missing questionData in start response!");
            return;
        }

        let currentQuestion = question;
        let currentQuestionData = questionData;
        let currentQuestionNumber = 1;
        let topicAttempts = {};
        let previousQuestions = [question];

        // Step 2: Submit a WRONG answer
        console.log("2️⃣ Submitting a WRONG answer...");
        console.log("   Explaination: Answering 'I don't know' to trigger follow-up.");

        const wrongAnswerResponse = await axios.post(`${API_URL}/submit`, {
            sessionId,
            questionNumber: currentQuestionNumber,
            question: currentQuestion,
            answer: "I am not sure about this concept.",
            skills: ['React', 'JavaScript'],
            userId: 'test-user-123',
            previousQuestions,
            questionData: currentQuestionData,
            topicAttempts,
            useFollowUpEngine: true
        });

        const wrongData = wrongAnswerResponse.data.data;
        console.log(`   📊 Classification: ${wrongData.classification}`);
        console.log(`   💬 Recruiter Message: ${wrongData.recruiterMessage}`);
        console.log(`   🔄 Next Question: ${wrongData.nextQuestion}`);
        console.log(`   🏷️ Topic: ${wrongData.currentTopic}, Is Follow Up: ${wrongData.isFollowUp}`);

        if (wrongData.classification !== 'wrong') {
            console.warn("   ⚠️ expected classification to be 'wrong'");
        }
        if (!wrongData.isFollowUp || wrongData.currentTopic !== currentQuestionData.topic) {
            console.error("   ❌ Failed: Should be a follow-up on the SAME topic.");
        } else {
            console.log("   ✅ Passed: System asked a follow-up on the same topic.");
        }
        console.log("");

        // Update state
        currentQuestion = wrongData.nextQuestion;
        currentQuestionData = wrongData.nextQuestionData;
        currentQuestionNumber = wrongData.nextQuestionNumber;
        topicAttempts = wrongData.topicAttempts;
        previousQuestions.push(currentQuestion);

        // Step 3: Submit a PARTIAL answer
        console.log("3️⃣ Submitting a PARTIAL answer to follow-up...");
        const partialAnswerResponse = await axios.post(`${API_URL}/submit`, {
            sessionId,
            questionNumber: currentQuestionNumber,
            question: currentQuestion,
            answer: "It is related to how components render updates.", // Vague answer
            skills: ['React', 'JavaScript'],
            userId: 'test-user-123',
            previousQuestions,
            questionData: currentQuestionData,
            topicAttempts,
            useFollowUpEngine: true
        });

        const partialData = partialAnswerResponse.data.data;
        console.log(`   📊 Classification: ${partialData.classification}`);
        console.log(`   💬 Recruiter Message: ${partialData.recruiterMessage}`);
        console.log(`   💡 Hint Provided: ${partialData.hint ? "Yes: " + partialData.hint : "No"}`);
        console.log(`   🔄 Next Question: ${partialData.nextQuestion}`);

        if (partialData.classification !== 'partial') {
            console.warn("   ⚠️ expected classification to be 'partial'");
        }
        if (!partialData.isFollowUp) {
            console.warn("   ⚠️ Expected another follow-up for partial answer");
        }
        console.log("");

        // Update state
        currentQuestion = partialData.nextQuestion;
        currentQuestionData = partialData.nextQuestionData;
        currentQuestionNumber = partialData.nextQuestionNumber;
        topicAttempts = partialData.topicAttempts;
        previousQuestions.push(currentQuestion);

        // Step 4: Submit a CORRECT answer
        console.log("4️⃣ Submitting a CORRECT answer...");
        // Construct a likely correct answer based on keywords if available
        const correctKeywords = currentQuestionData.expected_keywords || ["state", "props", "hook"];
        const correctAnswer = `The answer involves ${correctKeywords.join(', ')} and correctly handling the lifecycle.`;

        const correctAnswerResponse = await axios.post(`${API_URL}/submit`, {
            sessionId,
            questionNumber: currentQuestionNumber,
            question: currentQuestion,
            answer: correctAnswer,
            skills: ['React', 'JavaScript'],
            userId: 'test-user-123',
            previousQuestions,
            questionData: currentQuestionData,
            topicAttempts,
            useFollowUpEngine: true
        });

        const correctData = correctAnswerResponse.data.data;
        console.log(`   📊 Classification: ${correctData.classification}`);
        console.log(`   💬 Recruiter Message: ${correctData.recruiterMessage}`);
        console.log(`   🔄 Next Question: ${correctData.nextQuestion}`);
        console.log(`   🏷️ New Topic: ${correctData.currentTopic}`);

        if (correctData.classification !== 'correct') {
            console.warn("   ⚠️ expected classification to be 'correct'");
        }
        if (correctData.isFollowUp && correctData.currentTopic === currentQuestionData.topic) {
            console.log("   ⚠️ Still on same topic (could be intended for deep dive), usually expected to move on or harder question.");
        } else {
            console.log("   ✅ Moved to new topic or advanced question.");
        }

        console.log("\n✅ Verification Follow-Up Logic Complete!");

    } catch (error) {
        console.error("❌ Verification Failed:", error.message);
        if (error.response) {
            console.error("   Response Data:", error.response.data);
        }
    }
}

runVerification();
