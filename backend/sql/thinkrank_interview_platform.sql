-- ThinkRank Interview Platform Production Schema
-- PostgreSQL 15+

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('candidate', 'recruiter', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_status') THEN
    CREATE TYPE room_status AS ENUM ('scheduled', 'active', 'completed', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
    CREATE TYPE session_status AS ENUM ('waiting', 'live', 'completed', 'abandoned');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'participant_role') THEN
    CREATE TYPE participant_role AS ENUM ('candidate', 'recruiter', 'observer', 'ai');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transcript_source') THEN
    CREATE TYPE transcript_source AS ENUM ('candidate', 'recruiter', 'ai');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coding_event_type') THEN
    CREATE TYPE coding_event_type AS ENUM ('change', 'run', 'submit', 'cursor', 'selection', 'result');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recording_type') THEN
    CREATE TYPE recording_type AS ENUM ('audio', 'video', 'screen', 'combined', 'code_timeline');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'candidate',
  avatar_url TEXT,
  headline TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resume_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_url TEXT,
  parsed_text TEXT,
  extracted_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_roles JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  candidate_id UUID REFERENCES users(id) ON DELETE SET NULL,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  status room_status NOT NULL DEFAULT 'scheduled',
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES interview_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role participant_role NOT NULL,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  device_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (room_id, user_id, role)
);

CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES interview_rooms(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES users(id) ON DELETE SET NULL,
  recruiter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_status session_status NOT NULL DEFAULT 'waiting',
  ai_provider TEXT,
  voice_provider TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  overall_score NUMERIC(5,2),
  communication_score NUMERIC(5,2),
  technical_score NUMERIC(5,2),
  confidence_score NUMERIC(5,2),
  integrity_score NUMERIC(5,2),
  recommendation TEXT,
  summary TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  speaker_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  speaker_type transcript_source NOT NULL,
  speaker_label TEXT,
  transcript_text TEXT NOT NULL,
  confidence NUMERIC(5,2),
  started_ms BIGINT,
  ended_ms BIGINT,
  words_per_minute NUMERIC(6,2),
  sentiment_score NUMERIC(5,2),
  filler_word_count INTEGER NOT NULL DEFAULT 0,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  transcript_id UUID REFERENCES transcripts(id) ON DELETE SET NULL,
  event_time_ms BIGINT,
  feedback_type TEXT NOT NULL,
  confidence_score NUMERIC(5,2),
  communication_score NUMERIC(5,2),
  technical_score NUMERIC(5,2),
  engagement_score NUMERIC(5,2),
  sentiment_score NUMERIC(5,2),
  speaking_speed_wpm NUMERIC(6,2),
  follow_up_question TEXT,
  summary TEXT,
  model_name TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  prompt_title TEXT,
  prompt_description TEXT,
  starter_code TEXT,
  latest_code TEXT,
  visible_tests JSONB NOT NULL DEFAULT '[]'::jsonb,
  hidden_tests JSONB NOT NULL DEFAULT '[]'::jsonb,
  judge0_submission_id TEXT,
  last_run_status TEXT,
  last_run_output TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coding_session_id UUID NOT NULL REFERENCES coding_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type coding_event_type NOT NULL,
  code_snapshot TEXT,
  cursor_payload JSONB,
  execution_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  recording_type recording_type NOT NULL,
  storage_key TEXT NOT NULL,
  mime_type TEXT,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  checksum TEXT,
  encryption_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recruiter_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  decision TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES interview_rooms(id) ON DELETE CASCADE,
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
  recruiter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rank_score NUMERIC(6,2) NOT NULL,
  hiring_recommendation TEXT,
  justification TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integrity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_rooms_created_by ON interview_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_room_id ON interview_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_session_id ON transcripts(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_session_id ON ai_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_coding_sessions_session_id ON coding_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_recordings_session_id ON recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_notes_session_id ON recruiter_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_integrity_events_session_id ON integrity_events(session_id);
