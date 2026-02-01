-- FIX GRAPH DATA VISUALIZATION
-- Run this script in your Supabase SQL Editor to ensure all tables for graphs are correctly set up.

-- 1. Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create interview_results table (for Dashboard/Analytics graphs)
CREATE TABLE IF NOT EXISTS interview_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    skill VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    difficulty_level VARCHAR(20) DEFAULT 'intermediate',
    interview_date TIMESTAMPTZ DEFAULT NOW(),
    xp_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_interview_results_user_id ON interview_results(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_results_date ON interview_results(interview_date);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE interview_results ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies (Drop existing first to ensure clean state)
DROP POLICY IF EXISTS "Users can view own interview results" ON interview_results;
DROP POLICY IF EXISTS "Users can insert own interview results" ON interview_results;
DROP POLICY IF EXISTS "Service role can manage all results" ON interview_results;

CREATE POLICY "Users can view own interview results"
    ON interview_results FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interview results"
    ON interview_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all results"
    ON interview_results FOR ALL
    USING (auth.role() = 'service_role');

-- 6. Add 'topic' column to interview_answers (for Interview Report graphs)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_answers' AND column_name = 'topic') THEN
        ALTER TABLE interview_answers ADD COLUMN topic TEXT DEFAULT 'General';
    END IF;
END $$;
