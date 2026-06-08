const crypto = require("crypto");
const { supabaseAdmin } = require("../../config/supabaseClient");

const hashText = (text) => crypto.createHash("sha256").update(text).digest("hex");

const logVoiceGeneration = async ({
    sessionId,
    messageId,
    provider = "chatterbox",
    voiceKey,
    text,
    latencyMs,
    audioBytes,
    status,
    errorMessage
}) => {
    if (!supabaseAdmin) return;

    try {
        await supabaseAdmin.from("voice_generation_events").insert({
            session_id: sessionId || null,
            message_id: messageId || null,
            provider,
            voice_key: voiceKey || null,
            text_hash: text ? hashText(text) : null,
            latency_ms: latencyMs || null,
            audio_bytes: audioBytes || null,
            status,
            error_message: errorMessage || null
        });
    } catch (error) {
        console.warn("Voice generation log failed:", error.message);
    }
};

module.exports = {
    logVoiceGeneration
};
