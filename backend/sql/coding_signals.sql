-- Coding Signals Table
-- Stores aggregated coding platform data for users

-- Create the coding_signals table
CREATE TABLE IF NOT EXISTS coding_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Platform usernames (stored for reference)
    platform_usernames JSONB DEFAULT '{}',
    
    -- Raw data from each platform
    raw_data JSONB DEFAULT '{}',
    
    -- Normalized unified profile
    normalized_data JSONB DEFAULT '{}',
    
    -- Timestamps
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint on user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_coding_signals_user_unique 
ON coding_signals(user_id);

-- Create index for expiry queries
CREATE INDEX IF NOT EXISTS idx_coding_signals_expires 
ON coding_signals(expires_at);

-- Enable Row Level Security
ALTER TABLE coding_signals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own coding signals
CREATE POLICY "Users can view own coding signals" 
ON coding_signals FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own coding signals
CREATE POLICY "Users can insert own coding signals" 
ON coding_signals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own coding signals
CREATE POLICY "Users can update own coding signals" 
ON coding_signals FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Service role can do everything (for backend operations)
CREATE POLICY "Service can manage all coding signals" 
ON coding_signals FOR ALL 
USING (auth.role() = 'service_role');

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_coding_signals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS coding_signals_updated_at ON coding_signals;
CREATE TRIGGER coding_signals_updated_at
    BEFORE UPDATE ON coding_signals
    FOR EACH ROW
    EXECUTE FUNCTION update_coding_signals_updated_at();

-- Comment on table
COMMENT ON TABLE coding_signals IS 'Stores aggregated coding platform signals (LeetCode, Codeforces, CodeChef, HackerRank, GitHub) for users';

-- Comments on columns
COMMENT ON COLUMN coding_signals.platform_usernames IS 'JSON object mapping platform names to usernames';
COMMENT ON COLUMN coding_signals.raw_data IS 'Raw data fetched from each platform';
COMMENT ON COLUMN coding_signals.normalized_data IS 'Unified normalized profile with scores 0-100';
COMMENT ON COLUMN coding_signals.expires_at IS 'Cache expiry time (24 hours after fetch)';
