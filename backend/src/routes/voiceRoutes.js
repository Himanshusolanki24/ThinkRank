const express = require("express");
const rateLimit = require("express-rate-limit");
const { ChatterboxProvider } = require("../services/voice/chatterboxProvider");
const { logVoiceGeneration } = require("../services/voice/voiceLogger");

const router = express.Router();
const provider = new ChatterboxProvider();

const ttsLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: Number(process.env.VOICE_TTS_RATE_LIMIT_PER_MINUTE || 30),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: "Too many voice requests. Please wait a moment and try again."
    }
});

const MAX_TEXT_LENGTH = Number(process.env.VOICE_TTS_MAX_CHARS || 1200);

const sanitizeText = (value) => {
    if (typeof value !== "string") return "";
    return value.replace(/\s+/g, " ").trim();
};

router.get("/health", async (req, res) => {
    try {
        const health = await provider.health();
        res.json({
            success: true,
            data: {
                provider: "chatterbox",
                status: "ok",
                available: provider.isAvailable(),
                upstream: health
            }
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            provider: "chatterbox",
            available: false,
            error: error.message,
            fallback: "browser_speech"
        });
    }
});

router.get("/voices", (req, res) => {
    res.json({
        success: true,
        data: {
            provider: "chatterbox",
            voices: provider.listVoices()
        }
    });
});

router.post("/tts", ttsLimiter, async (req, res) => {
    try {
        const text = sanitizeText(req.body?.text);
        const voiceId = req.body?.voiceId || req.body?.voice_id;
        const persona = req.body?.persona;
        const format = req.body?.format || "wav";
        const stream = Boolean(req.body?.stream);
        const sessionId = req.body?.sessionId;
        const messageId = req.body?.messageId;

        if (!text) {
            return res.status(400).json({
                success: false,
                error: "text is required."
            });
        }

        if (text.length > MAX_TEXT_LENGTH) {
            return res.status(413).json({
                success: false,
                error: `text must be ${MAX_TEXT_LENGTH} characters or fewer.`
            });
        }

        // Fast-fail: if the upstream TTS server is known to be down, skip the request entirely
        if (!provider.isAvailable()) {
            return res.status(503).json({
                success: false,
                provider: "chatterbox",
                error: "TTS server unavailable",
                fallback: "browser_speech"
            });
        }

        const result = await provider.synthesize({ text, voiceId, persona, format, stream });
        await logVoiceGeneration({
            sessionId,
            messageId,
            provider: result.provider,
            voiceKey: result.voice.id,
            text,
            latencyMs: result.latencyMs,
            audioBytes: result.audioBuffer.length,
            status: "success"
        });

        res.setHeader("Content-Type", result.contentType);
        res.setHeader("X-Voice-Provider", result.provider);
        res.setHeader("X-Voice-Id", result.voice.id);
        res.setHeader("X-Voice-Latency-Ms", String(result.latencyMs));
        res.setHeader("Cache-Control", "no-store");
        return res.send(result.audioBuffer);
    } catch (error) {
        console.error("Voice synthesis error:", error.message);
        await logVoiceGeneration({
            sessionId: req.body?.sessionId,
            messageId: req.body?.messageId,
            voiceKey: req.body?.voiceId || req.body?.voice_id,
            text: sanitizeText(req.body?.text),
            status: "failed",
            errorMessage: error.message
        });
        return res.status(502).json({
            success: false,
            provider: "chatterbox",
            error: error.message,
            fallback: "browser_speech"
        });
    }
});

module.exports = router;
