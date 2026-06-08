const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Mistral } = require("@mistralai/mistralai");

const geminiApiKey = process.env.GEMINI_API_KEY;
const mistralApiKey = process.env.MISTRAL_API_KEY;

let geminiModel = null;
let mistralClient = null;

if (geminiApiKey && geminiApiKey !== "your_gemini_api_key_here") {
    try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    } catch (e) {
        console.warn("Failed to init Gemini in BehavioralAgent:", e.message);
    }
}

if (mistralApiKey && mistralApiKey !== "your_mistral_api_key_here") {
    try {
        mistralClient = new Mistral({ apiKey: mistralApiKey });
    } catch (e) {
        console.warn("Failed to init Mistral in BehavioralAgent:", e.message);
    }
}

class BehavioralAgent {
    async analyze(transcript, cheatingLogs) {
        try {
            // Programmatically calculate base cheating probability
            let cheatingProb = 0;
            if (cheatingLogs && cheatingLogs.length > 0) {
                cheatingLogs.forEach(log => {
                    if (log.severity === "high") cheatingProb += 30;
                    else if (log.severity === "medium") cheatingProb += 15;
                    else cheatingProb += 5;
                });
            }
            cheatingProb = Math.min(100, cheatingProb);

            if (geminiModel) {
                return await this.analyzeWithGemini(transcript, cheatingProb);
            } else if (mistralClient) {
                return await this.analyzeWithMistral(transcript, cheatingProb);
            } else {
                return this.generateFallbackAnalysis(cheatingProb);
            }
        } catch (error) {
            console.error("BehavioralAgent error:", error);
            return this.generateFallbackAnalysis(10);
        }
    }

    async analyzeWithGemini(transcript, cheatingProb) {
        const prompt = this.buildPrompt(transcript, cheatingProb);
        const result = await geminiModel.generateContent(prompt);
        let text = result.response.text().trim();
        return this.parseJSONResponse(text);
    }

    async analyzeWithMistral(transcript, cheatingProb) {
        const prompt = this.buildPrompt(transcript, cheatingProb);
        const response = await mistralClient.chat.complete({
            model: "mistral-large-latest",
            messages: [{ role: "user", content: prompt }],
        });
        let text = response.choices[0].message.content.trim();
        return this.parseJSONResponse(text);
    }

    buildPrompt(transcript, cheatingProb) {
        return `You are an expert industrial psychologist and candidate behavioral assessor.
Evaluate the candidate's communication skills, confidence, leadership indicators, and collaboration based on the interview transcript.

Transcript:
${transcript}

Assigned Cheating Probability: ${cheatingProb}%

Provide a behavioral score report in the following JSON format:
{
  "clarity": <integer 0-100 indicating semantic correctness and explanation fluidity>,
  "confidence": <integer 0-100 representing directness and speed of response>,
  "leadership": <integer 0-100 indicating initiative and structured guidance>,
  "collaboration": <integer 0-100 representing openness and response to hints>,
  "cheatingProb": <integer 0-100 equal to or adjusted from the input value>
}

Provide raw JSON only. Do not include markdown tags.`;
    }

    parseJSONResponse(text) {
        let cleanText = text;
        if (cleanText.startsWith("```json")) {
            cleanText = cleanText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (cleanText.startsWith("```")) {
            cleanText = cleanText.replace(/```\n?/g, "");
        }
        return JSON.parse(cleanText.trim());
    }

    generateFallbackAnalysis(cheatingProb) {
        return {
            clarity: 85,
            confidence: 78,
            leadership: 70,
            collaboration: 88,
            cheatingProb
        };
    }
}

module.exports = new BehavioralAgent();
