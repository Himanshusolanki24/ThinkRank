-- ThinkRank Voice TTS Schema
-- Supports Chatterbox now and keeps provider migration clean later.

CREATE TABLE IF NOT EXISTS interviewer_voices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL DEFAULT 'chatterbox',
    voice_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    persona_key TEXT,
    reference_audio_path TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_generation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT,
    message_id TEXT,
    provider TEXT NOT NULL DEFAULT 'chatterbox',
    voice_key TEXT,
    text_hash TEXT,
    latency_ms INTEGER,
    audio_bytes INTEGER,
    status TEXT NOT NULL CHECK (status IN ('success', 'fallback', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interviewer_voices_provider ON interviewer_voices(provider);
CREATE INDEX IF NOT EXISTS idx_voice_generation_events_session ON voice_generation_events(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_generation_events_created ON voice_generation_events(created_at DESC);

INSERT INTO interviewer_voices (provider, voice_key, display_name, persona_key, settings)
VALUES
    ('chatterbox', 'sarah-google', 'Sarah Chen', 'google', '{"exaggeration":0.45,"cfg_weight":0.45}'),
    ('chatterbox', 'james-amazon', 'James Rodriguez', 'amazon', '{"exaggeration":0.5,"cfg_weight":0.4}'),
    ('chatterbox', 'priya-microsoft', 'Priya Sharma', 'microsoft', '{"exaggeration":0.4,"cfg_weight":0.5}'),
    ('chatterbox', 'alex-meta', 'Alex Kim', 'meta', '{"exaggeration":0.58,"cfg_weight":0.35}'),
    ('chatterbox', 'dev-startup', 'Dev Patel', 'startup', '{"exaggeration":0.5,"cfg_weight":0.45}')
ON CONFLICT (voice_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    persona_key = EXCLUDED.persona_key,
    settings = EXCLUDED.settings,
    updated_at = NOW();
