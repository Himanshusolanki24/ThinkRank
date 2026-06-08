const DEFAULT_TIMEOUT_MS = Number(process.env.CHATTERBOX_TTS_TIMEOUT_MS || 45000);
const CHATTERBOX_TTS_URL = (process.env.CHATTERBOX_TTS_URL || "http://localhost:8010").replace(/\/$/, "");

// How often to re-probe the upstream server (ms)
const HEALTH_PROBE_INTERVAL_MS = Number(process.env.CHATTERBOX_HEALTH_PROBE_INTERVAL_MS || 30000);
// Quick timeout for the health probe itself (ms)
const HEALTH_PROBE_TIMEOUT_MS = 3000;

const INTERVIEWER_VOICES = [
    {
        id: "sarah-google",
        persona: "google",
        displayName: "Sarah Chen",
        provider: "chatterbox",
        description: "Methodical, calm, and structured.",
        settings: { exaggeration: 0.45, cfgWeight: 0.45 }
    },
    {
        id: "james-amazon",
        persona: "amazon",
        displayName: "James Rodriguez",
        provider: "chatterbox",
        description: "Direct, practical, and edge-case focused.",
        settings: { exaggeration: 0.5, cfgWeight: 0.4 }
    },
    {
        id: "priya-microsoft",
        persona: "microsoft",
        displayName: "Priya Sharma",
        provider: "chatterbox",
        description: "Collaborative, supportive, and pair-programming oriented.",
        settings: { exaggeration: 0.4, cfgWeight: 0.5 }
    },
    {
        id: "alex-meta",
        persona: "meta",
        displayName: "Alex Kim",
        provider: "chatterbox",
        description: "Fast-paced, crisp, and optimization focused.",
        settings: { exaggeration: 0.58, cfgWeight: 0.35 }
    },
    {
        id: "dev-startup",
        persona: "startup",
        displayName: "Dev Patel",
        provider: "chatterbox",
        description: "Casual, practical, and product-minded.",
        settings: { exaggeration: 0.5, cfgWeight: 0.45 }
    }
];

const getVoiceById = (voiceId) => {
    return INTERVIEWER_VOICES.find((voice) => voice.id === voiceId) || INTERVIEWER_VOICES[0];
};

const getVoiceForPersona = (persona) => {
    return INTERVIEWER_VOICES.find((voice) => voice.persona === persona) || INTERVIEWER_VOICES[0];
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal
        });
    } finally {
        clearTimeout(timeout);
    }
};

class ChatterboxProvider {
    constructor() {
        this.baseUrl = CHATTERBOX_TTS_URL;
        // Cached health state: null = unknown, true = reachable, false = unreachable
        this._reachable = null;
        this._lastProbeTime = 0;
        this._probing = false;

        // Run initial probe (fire-and-forget)
        this._probeHealth();
    }

    /**
     * Probes the upstream Chatterbox server and caches the result.
     * Re-probes at most once every HEALTH_PROBE_INTERVAL_MS.
     */
    async _probeHealth() {
        const now = Date.now();
        if (this._probing || (now - this._lastProbeTime) < HEALTH_PROBE_INTERVAL_MS) {
            return this._reachable;
        }

        this._probing = true;
        try {
            const response = await fetchWithTimeout(
                `${this.baseUrl}/health`,
                { method: "GET" },
                HEALTH_PROBE_TIMEOUT_MS
            );
            this._reachable = response.ok;
        } catch {
            this._reachable = false;
        } finally {
            this._lastProbeTime = Date.now();
            this._probing = false;
        }

        if (!this._reachable) {
            console.warn(`[ChatterboxProvider] Upstream TTS server at ${this.baseUrl} is unreachable — browser speech fallback will be used`);
        } else {
            console.log(`[ChatterboxProvider] Upstream TTS server at ${this.baseUrl} is reachable`);
        }

        return this._reachable;
    }

    /**
     * Returns true if the upstream server is known to be reachable.
     * Triggers a background re-probe if the cache is stale.
     */
    isAvailable() {
        const stale = (Date.now() - this._lastProbeTime) >= HEALTH_PROBE_INTERVAL_MS;
        if (stale) {
            // Fire-and-forget re-probe; don't block the caller
            this._probeHealth();
        }
        return this._reachable === true;
    }

    listVoices() {
        return INTERVIEWER_VOICES;
    }

    getVoiceForPersona(persona) {
        return getVoiceForPersona(persona);
    }

    async health() {
        const response = await fetchWithTimeout(`${this.baseUrl}/health`, { method: "GET" }, 5000);
        if (!response.ok) {
            throw new Error(`Chatterbox health check failed with ${response.status}`);
        }
        return response.json();
    }

    async synthesize({ text, voiceId, persona, format = "wav", stream = false }) {
        // Fast-fail if the server is known to be down
        if (!this.isAvailable()) {
            throw new Error("Chatterbox TTS server is not available — use browser speech fallback");
        }

        const voice = voiceId ? getVoiceById(voiceId) : getVoiceForPersona(persona);
        const startedAt = Date.now();

        const response = await fetchWithTimeout(`${this.baseUrl}${stream ? "/tts/stream" : "/tts"}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text,
                voice_id: voice.id,
                format,
                settings: voice.settings
            })
        });

        if (!response.ok) {
            let detail = "";
            try {
                const payload = await response.json();
                detail = payload.detail || payload.error || "";
            } catch {
                detail = await response.text().catch(() => "");
            }
            throw new Error(`Chatterbox synthesis failed with ${response.status}${detail ? `: ${detail}` : ""}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return {
            audioBuffer: Buffer.from(arrayBuffer),
            contentType: response.headers.get("content-type") || "audio/wav",
            provider: "chatterbox",
            voice,
            latencyMs: Date.now() - startedAt
        };
    }
}

module.exports = {
    ChatterboxProvider,
    INTERVIEWER_VOICES
};
