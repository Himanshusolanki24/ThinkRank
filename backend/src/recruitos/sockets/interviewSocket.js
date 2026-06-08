const interviewAgent = require("../services/interviewAgent");
const codingSignalsAgent = require("../services/codingSignalsAgent");

function setupInterviewSocket(io) {
    const interviewNamespace = io.of("/api/recruit-os/session");

    interviewNamespace.on("connection", socket => {
        console.log("WebSocket Client Connected to RecruitOS Interview:", socket.id);

        let activeSessionId = null;

        // Initialize Session
        socket.on("join_session", ({ sessionId, candidateName }) => {
            activeSessionId = sessionId;
            socket.join(sessionId);
            console.log(`Candidate ${candidateName} joined session ${sessionId}`);

            // Send initial welcoming speech event
            const greeting = "Hello, welcome to your AI technical interview. I will be evaluating your coding and behavioral capabilities today. Let me know when you are ready to begin.";
            socket.emit("ai_speaking", {
                text: greeting,
                isInitial: true
            });
        });

        // Speech input received from candidate (Whisper transcription)
        socket.on("audio_chunk", async ({ sessionId, buffer }) => {
            try {
                socket.emit("ai_thinking", { status: true, step: "transcribing" });

                const transcription = await interviewAgent.transcribeAudio(Buffer.from(buffer));
                socket.emit("transcription_result", { transcription });

                // Process transcription to adaptive prompt response
                socket.emit("ai_thinking", { status: true, step: "generating_answer" });

                // Mock dynamic reply
                const responseText = "That makes sense. Could you explain the time complexity of that solution, especially if we have massive arrays?";
                
                // Synthesize voice
                const audioBuffer = await interviewAgent.synthesizeSpeech(responseText, "FAANG");

                socket.emit("ai_thinking", { status: false });
                socket.emit("ai_response", {
                    text: responseText,
                    audio: audioBuffer ? audioBuffer.toString("base64") : null
                });
            } catch (e) {
                console.error("Audio processing failed:", e);
                socket.emit("ai_thinking", { status: false });
                socket.emit("error", { message: "Failed to process audio stream" });
            }
        });

        // Code synchronize event
        socket.on("code_change", ({ sessionId, code, language }) => {
            socket.to(sessionId).emit("code_sync", { code, language });
        });

        // Code Execution trigger
        socket.on("run_code", async ({ sessionId, code, language, testCases }) => {
            try {
                socket.emit("execution_started");
                const results = await codingSignalsAgent.runCode(code, language, testCases);
                socket.emit("execution_result", { results });
            } catch (err) {
                socket.emit("execution_result", { error: err.message });
            }
        });

        // Anti-Cheat / Suspicious event tracking
        socket.on("anti_cheat_alert", ({ sessionId, eventType, severity }) => {
            console.warn(`Anti-Cheat alert [${sessionId}]: ${eventType} with severity ${severity}`);
            // Log to all listening dashboards/recruiters
            socket.to(sessionId).emit("recruiter_cheat_alert", {
                eventType,
                severity,
                timestamp: new Date()
            });
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected from session:", socket.id);
        });
    });
}

module.exports = { setupInterviewSocket };
