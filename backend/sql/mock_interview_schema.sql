-- ============================================================
-- ThinkRank AI Mock Interview Platform — Database Schema
-- PostgreSQL / Supabase
-- ============================================================

-- 1. Mock Interview Sessions
CREATE TABLE IF NOT EXISTS mock_interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Session config
    company_style TEXT NOT NULL DEFAULT 'google' CHECK (company_style IN ('google', 'amazon', 'microsoft', 'meta', 'startup', 'generic')),
    difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'faang')),
    language TEXT NOT NULL DEFAULT 'python' CHECK (language IN ('python', 'javascript', 'java', 'cpp')),
    
    -- Session state
    status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'active', 'paused', 'completed', 'abandoned')),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER DEFAULT 0,
    
    -- AI config
    ai_persona JSONB DEFAULT '{}',
    
    -- Integrity
    tab_switches INTEGER DEFAULT 0,
    copy_paste_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Interview Questions (per session)
CREATE TABLE IF NOT EXISTS mock_interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES mock_interview_sessions(id) ON DELETE CASCADE,
    
    -- Question data
    question_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    category TEXT, -- 'arrays', 'trees', 'dp', etc.
    constraints TEXT[],
    examples JSONB DEFAULT '[]',
    
    -- Test cases
    test_cases JSONB DEFAULT '[]',        -- visible test cases
    hidden_test_cases JSONB DEFAULT '[]', -- hidden edge cases
    
    -- Expected solution metadata
    expected_time_complexity TEXT,
    expected_space_complexity TEXT,
    optimal_approach TEXT,
    hints TEXT[],
    
    -- Follow-up tracking
    follow_up_questions JSONB DEFAULT '[]',
    is_follow_up BOOLEAN DEFAULT FALSE,
    parent_question_id UUID REFERENCES mock_interview_questions(id),
    
    -- Source
    source TEXT, -- 'ai_generated', 'leetcode_enhanced', 'custom'
    original_leetcode_id TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Code Submissions
CREATE TABLE IF NOT EXISTS mock_interview_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES mock_interview_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES mock_interview_questions(id) ON DELETE CASCADE,
    
    -- Code
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    
    -- Execution results
    submission_type TEXT DEFAULT 'run' CHECK (submission_type IN ('run', 'submit')),
    execution_status TEXT, -- 'accepted', 'wrong_answer', 'tle', 'mle', 'runtime_error', 'compile_error'
    runtime_ms INTEGER,
    memory_kb INTEGER,
    
    -- Test results
    test_results JSONB DEFAULT '[]',
    passed_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    
    -- AI review
    ai_review JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AI Conversation Log
CREATE TABLE IF NOT EXISTS mock_interview_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES mock_interview_sessions(id) ON DELETE CASCADE,
    
    role TEXT NOT NULL CHECK (role IN ('ai', 'user', 'system')),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'hint', 'follow_up', 'feedback', 'question', 'code_review')),
    
    -- Metadata
    emotion_detected TEXT,      -- 'confident', 'confused', 'frustrated', 'neutral'
    confidence_score FLOAT,
    timestamp_ms INTEGER,       -- offset from session start
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Interview Scores & Analytics
CREATE TABLE IF NOT EXISTS mock_interview_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES mock_interview_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Scores (0-100)
    overall_score INTEGER DEFAULT 0,
    communication_score INTEGER DEFAULT 0,
    dsa_score INTEGER DEFAULT 0,
    code_quality_score INTEGER DEFAULT 0,
    problem_solving_score INTEGER DEFAULT 0,
    optimization_score INTEGER DEFAULT 0,
    confidence_score INTEGER DEFAULT 0,
    interview_readiness INTEGER DEFAULT 0,
    
    -- AI feedback
    feedback_summary TEXT,
    strengths TEXT[],
    weaknesses TEXT[],
    improvement_areas TEXT[],
    recommended_topics TEXT[],
    recommended_leetcode TEXT[],
    
    -- Study plan
    ai_study_plan JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Generated Edge Cases (from LeetCode enhancement)
CREATE TABLE IF NOT EXISTS mock_interview_edge_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES mock_interview_questions(id) ON DELETE CASCADE,
    
    case_type TEXT NOT NULL CHECK (case_type IN ('edge', 'corner', 'trap', 'optimization', 'follow_up')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    input_data JSONB,
    expected_output JSONB,
    difficulty_modifier TEXT, -- 'harder', 'much_harder', 'real_world'
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mock_sessions_user ON mock_interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_sessions_status ON mock_interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_mock_questions_session ON mock_interview_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_mock_submissions_session ON mock_interview_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_mock_conversations_session ON mock_interview_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_mock_scores_user ON mock_interview_scores(user_id);

-- RLS Policies
ALTER TABLE mock_interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_interview_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_interview_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_interview_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_interview_edge_cases ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can manage own sessions" ON mock_interview_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own questions" ON mock_interview_questions
    FOR ALL USING (session_id IN (SELECT id FROM mock_interview_sessions WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own submissions" ON mock_interview_submissions
    FOR ALL USING (session_id IN (SELECT id FROM mock_interview_sessions WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own conversations" ON mock_interview_conversations
    FOR ALL USING (session_id IN (SELECT id FROM mock_interview_sessions WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own scores" ON mock_interview_scores
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own edge cases" ON mock_interview_edge_cases
    FOR ALL USING (question_id IN (
        SELECT q.id FROM mock_interview_questions q
        JOIN mock_interview_sessions s ON q.session_id = s.id
        WHERE s.user_id = auth.uid()
    ));
