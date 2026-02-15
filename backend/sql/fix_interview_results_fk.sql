-- Fix for Dashboard/Analytics Graph Data Issue
-- The interview_results table has a foreign key to users(id), which in turn references auth.users(id)
-- This causes inserts to fail if the user doesn't exist in the custom 'users' table
-- 
-- Run this in Supabase SQL Editor to fix the issue

-- Option 1: Remove the foreign key constraint (RECOMMENDED)
-- This allows interview_results to store any user_id without requiring them to exist in users table

ALTER TABLE interview_results DROP CONSTRAINT IF EXISTS interview_results_user_id_fkey;

-- Option 2: Alternatively, add a "soft" foreign key (just for reference, no enforcement)
-- This creates the column without the constraint
-- ALTER TABLE interview_results ALTER COLUMN user_id DROP NOT NULL;

-- Also disable RLS temporarily to allow service role inserts (optional - service role should bypass RLS anyway)
-- ALTER TABLE interview_results DISABLE ROW LEVEL SECURITY;

-- Create a more permissive insert policy for service role
DROP POLICY IF EXISTS "Service role can insert interview results" ON interview_results;
CREATE POLICY "Service role can insert interview results"
    ON interview_results FOR INSERT
    TO service_role
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can select all interview results" ON interview_results;
CREATE POLICY "Service role can select all interview results"
    ON interview_results FOR SELECT
    TO service_role
    USING (true);

-- Also ensure users can view their own results
DROP POLICY IF EXISTS "Users can view own interview results" ON interview_results;
CREATE POLICY "Users can view own interview results"
    ON interview_results FOR SELECT
    USING (auth.uid()::text = user_id::text);

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'interview_results';

-- Success message
SELECT 'Foreign key constraint removed! Interview results can now be saved without users table dependency.' as message;
