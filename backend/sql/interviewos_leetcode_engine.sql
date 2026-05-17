create table if not exists interview_question_history (
    user_id uuid primary key,
    asked_slugs text[] not null default '{}',
    solved_slugs text[] not null default '{}',
    weak_topics text[] not null default '{}',
    strong_topics text[] not null default '{}',
    recent_difficulties text[] not null default '{}',
    repeated_mistakes text[] not null default '{}',
    updated_at timestamptz not null default now()
);

create table if not exists interview_question_fetch_log (
    id uuid primary key default gen_random_uuid(),
    provider text not null default 'leetcode',
    title_slug text not null,
    difficulty_bucket text,
    fetched_at timestamptz not null default now(),
    was_cache_hit boolean not null default false,
    notes jsonb not null default '{}'::jsonb
);

create index if not exists idx_interview_question_fetch_log_slug on interview_question_fetch_log (title_slug, fetched_at desc);
