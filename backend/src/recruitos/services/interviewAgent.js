const axios = require("axios");
const { ChatterboxProvider } = require("../../services/voice/chatterboxProvider");

const WHISPER_API_KEY = process.env.WHISPER_API_KEY || process.env.OPENAI_API_KEY || "";
const chatterboxProvider = new ChatterboxProvider();

const INTERVIEWER_PERSONALITIES = {
    FAANG: {
        name: "Marcus",
        role: "Principal Engineer at Google",
        description: "Direct, focuses on algorithm optimization, Big O notation, and performance details.",
        greeting: "Hi, I'm Marcus. Let's dig into some systems and coding problems today. I'm looking for highly optimized solutions.",
        voicePersona: "google"
    },
    HR: {
        name: "Sarah",
        role: "Director of Talent Acquisition",
        description: "Warm, collaborative, evaluates core team fit, leadership traits, and behavioral structure.",
        greeting: "Hello! I'm Sarah. I'm really excited to chat with you today about your past experiences and how you handle teamwork.",
        voicePersona: "microsoft"
    },
    CTO: {
        name: "Vikram",
        role: "Co-Founder & CTO",
        description: "Fast-paced, product-minded, values rapid prototyping, architecture trade-offs, and scalability.",
        greeting: "Hey there! Vikram here. Let's discuss architecture trade-offs and how you scale things under pressure.",
        voicePersona: "startup"
    },
    SYSTEM_DESIGN: {
        name: "Alex",
        role: "Systems Architect",
        description: "Rigorous, analytical, evaluates load balancers, database replication, and fault tolerance.",
        greeting: "Welcome. Let's design a highly available distributed system today. I want you to walk me through every bottleneck.",
        voicePersona: "meta"
    }
};

class InterviewAgent {
    getPersonality(style) {
        return INTERVIEWER_PERSONALITIES[style.toUpperCase()] || INTERVIEWER_PERSONALITIES.FAANG;
    }

    /**
     * Transcribe speech audio buffer to text using OpenAI Whisper API
     */
    async transcribeAudio(audioBuffer) {
        if (!WHISPER_API_KEY) {
            console.warn("Whisper API key not configured, returning simulated transcription.");
            return "Simulated response transcription: I solved this problem using a hash map for constant time lookup.";
        }

        try {
            // Whisper multipart request
            const FormData = require("form-data");
            const form = new FormData();
            form.append("file", audioBuffer, { filename: "audio.wav", contentType: "audio/wav" });
            form.append("model", "whisper-1");

            const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", form, {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${WHISPER_API_KEY}`
                }
            });

            return response.data.text;
        } catch (error) {
            console.error("Whisper transcription failed, falling back:", error.message);
            return "Simulated response fallback due to API error.";
        }
    }

    /**
     * Synthesize text to speech audio using the shared Chatterbox provider.
     */
    async synthesizeSpeech(text, personalityStyle) {
        const personality = this.getPersonality(personalityStyle);

        try {
            const result = await chatterboxProvider.synthesize({
                text,
                persona: personality.voicePersona || "google",
                format: "wav"
            });
            return result.audioBuffer;
        } catch (error) {
            console.error("Chatterbox speech synthesis failed:", error.message);
            return null;
        }
    }
}

const agentInstance = new InterviewAgent();
agentInstance.INTERVIEWER_PERSONALITIES = INTERVIEWER_PERSONALITIES;
module.exports = agentInstance;
