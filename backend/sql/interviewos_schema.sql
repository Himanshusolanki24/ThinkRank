create extension if not exists "pgcrypto";
create extension if not exists "vector";

create table if not exists interview_problem_bank (
    id uuid primary key default gen_random_uuid(),
    provider text not null,
    provider_problem_id text,
    canonical_title text not null,
    clean_prompt text not null,
    constraints jsonb not null default '[]'::jsonb,
    examples jsonb not null default '[]'::jsonb,
    starter_code jsonb not null default '{}'::jsonb,
    hidden_metadata jsonb not null default '{}'::jsonb,
    public_payload jsonb not null default '{}'::jsonb,
    difficulty_bucket text not null check (difficulty_bucket in ('easy', 'medium', 'hard')),
    topic_tags text[] not null default '{}',
    company_tags text[] not null default '{}',
    sheet_tags text[] not null default '{}',
    embedding vector(3072),
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create index if not exists idx_interview_problem_bank_difficulty on interview_problem_bank (difficulty_bucket);
create index if not exists idx_interview_problem_bank_topics on interview_problem_bank using gin (topic_tags);

create table if not exists interviewer_persona_configs (
    id uuid primary key default gen_random_uuid(),
    persona_key text unique not null,
    display_name text not null,
    config jsonb not null,
    created_at timestamptz not null default now()
);

create table if not exists interview_sessions_v2 (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    persona_key text not null,
    session_mode text not null default 'technical',
    session_status text not null default 'initialized',
    verification_status text not null default 'verified',
    integrity_score numeric(5,2) not null default 100,
    current_round integer not null default 0,
    current_difficulty_bucket text not null default 'easy',
    genome_snapshot jsonb not null default '{}'::jsonb,
    hidden_session_state jsonb not null default '{}'::jsonb,
    started_at timestamptz,
    ended_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_interview_sessions_v2_user on interview_sessions_v2 (user_id, created_at desc);

create table if not exists interview_rounds (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references interview_sessions_v2(id) on delete cascade,
    round_number integer not null,
    problem_id uuid references interview_problem_bank(id),
    round_type text not null default 'coding',
    backend_difficulty_bucket text not null,
    public_problem_payload jsonb not null,
    hidden_problem_payload jsonb not null,
    adaptive_decision jsonb not null default '{}'::jsonb,
    started_at timestamptz not null default now(),
    ended_at timestamptz
);

create unique index if not exists idx_interview_rounds_session_round on interview_rounds (session_id, round_number);

create table if not exists interview_code_snapshots (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references interview_sessions_v2(id) on delete cascade,
    round_id uuid not null references interview_rounds(id) on delete cascade,
    language text not null,
    code text not null,
    cursor_position jsonb,
    execution_result jsonb,
    captured_at timestamptz not null default now()
);

create table if not exists interview_voice_transcripts (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references interview_sessions_v2(id) on delete cascade,
    round_id uuid references interview_rounds(id) on delete cascade,
    speaker text not null check (speaker in ('candidate', 'interviewer', 'system')),
    transcript text not null,
    confidence numeric(5,2),
    timing jsonb,
    created_at timestamptz not null default now()
);

create table if not exists interview_behavioral_analytics (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references interview_sessions_v2(id) on delete cascade,
    round_id uuid references interview_rounds(id) on delete cascade,
    metric_key text not null,
    metric_value numeric(10,2),
    metric_payload jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create table if not exists interview_integrity_violations (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references interview_sessions_v2(id) on delete cascade,
    round_id uuid references interview_rounds(id) on delete cascade,
    violation_type text not null,
    severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
    evidence jsonb not null default '{}'::jsonb,
    penalty numeric(6,2) not null default 0,
    created_at timestamptz not null default now()
);

create table if not exists interview_evaluations (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references interview_sessions_v2(id) on delete cascade,
    round_id uuid references interview_rounds(id) on delete cascade,
    problem_solving_score numeric(5,2) not null,
    communication_score numeric(5,2) not null,
    optimization_score numeric(5,2) not null,
    confidence_score numeric(5,2) not null,
    dsa_mastery_score numeric(5,2) not null,
    edge_case_score numeric(5,2) not null,
    debugging_score numeric(5,2) not null,
    ai_summary text,
    strengths jsonb not null default '[]'::jsonb,
    risks jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now()
);

create table if not exists interview_skill_genome_profiles (
    user_id uuid primary key,
    strong_topics text[] not null default '{}',
    weak_topics text[] not null default '{}',
    repeated_mistakes jsonb not null default '[]'::jsonb,
    confidence_trend jsonb not null default '[]'::jsonb,
    communication_trend jsonb not null default '[]'::jsonb,
    optimization_trend jsonb not null default '[]'::jsonb,
    adaptive_roadmap jsonb not null default '{}'::jsonb,
    last_updated_at timestamptz not null default now()
);

create table if not exists interview_skill_genome_dimensions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    topic_key text not null,
    mastery_score numeric(5,2) not null default 0,
    confidence_score numeric(5,2) not null default 0,
    optimization_score numeric(5,2) not null default 0,
    communication_score numeric(5,2) not null default 0,
    evidence_count integer not null default 0,
    last_session_id uuid references interview_sessions_v2(id) on delete set null,
    updated_at timestamptz not null default now(),
    unique (user_id, topic_key)
);
