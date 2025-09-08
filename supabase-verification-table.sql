-- Create user_verifications table for storing verification status
-- Run this SQL in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS user_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    step_id TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user per step
    UNIQUE(user_id, step_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_verifications_user_id ON user_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verifications_step_id ON user_verifications(step_id);
CREATE INDEX IF NOT EXISTS idx_user_verifications_verified ON user_verifications(verified);

-- Enable Row Level Security (RLS)
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see and modify their own verification records
CREATE POLICY "Users can view own verifications" ON user_verifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verifications" ON user_verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verifications" ON user_verifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Optional: Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_verifications_updated_at 
    BEFORE UPDATE ON user_verifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON user_verifications TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
