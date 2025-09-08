-- Create comprehensive user_profiles table for tracking all user data and verification steps
-- Run this SQL in your Supabase SQL editor

-- Drop existing table if it exists (be careful in production)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Wallet Information
    wallet_address TEXT UNIQUE NOT NULL,
    wallet_connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Twitter Information
    twitter_user_id TEXT,
    twitter_username TEXT,
    twitter_display_name TEXT,
    twitter_profile_image TEXT,
    twitter_connected BOOLEAN DEFAULT FALSE,
    twitter_connected_at TIMESTAMP WITH TIME ZONE,
    
    -- Verification Steps
    twitter_followed_cluster BOOLEAN DEFAULT FALSE,
    twitter_followed_at TIMESTAMP WITH TIME ZONE,
    
    twitter_posted_about_cluster BOOLEAN DEFAULT FALSE,
    twitter_posted_at TIMESTAMP WITH TIME ZONE,
    twitter_post_url TEXT,
    
    custom_username_checked BOOLEAN DEFAULT FALSE,
    custom_username TEXT,
    custom_username_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Special name detection (content in parentheses)
    special_name_exists BOOLEAN DEFAULT FALSE,
    special_name TEXT,
    
    telegram_joined BOOLEAN DEFAULT FALSE,
    telegram_joined_at TIMESTAMP WITH TIME ZONE,
    
    -- Overall verification status
    all_steps_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata for additional information
    verification_metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet_address ON user_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_profiles_twitter_username ON user_profiles(twitter_username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_status ON user_profiles(all_steps_completed);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Auto-update all_steps_completed when all verification steps are done
    NEW.all_steps_completed = (
        NEW.twitter_connected = TRUE AND
        NEW.twitter_followed_cluster = TRUE AND
        NEW.twitter_posted_about_cluster = TRUE AND
        NEW.custom_username_checked = TRUE AND
        NEW.telegram_joined = TRUE
    );
    
    -- Set completed_at timestamp when all steps are completed
    IF NEW.all_steps_completed = TRUE AND OLD.all_steps_completed = FALSE THEN
        NEW.completed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update timestamps and completion status
CREATE TRIGGER update_user_profiles_trigger 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- Function to extract special name from parentheses
CREATE OR REPLACE FUNCTION extract_special_name(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Extract text between parentheses using regex
    RETURN substring(input_text FROM '\(([^)]+)\)');
END;
$$ language 'plpgsql';

-- Function to check and update special name
CREATE OR REPLACE FUNCTION check_special_name_in_profile(profile_id UUID, display_name TEXT)
RETURNS VOID AS $$
DECLARE
    extracted_name TEXT;
BEGIN
    extracted_name := extract_special_name(display_name);
    
    IF extracted_name IS NOT NULL AND extracted_name != '' THEN
        UPDATE user_profiles 
        SET 
            special_name_exists = TRUE,
            special_name = extracted_name,
            updated_at = NOW()
        WHERE id = profile_id;
    END IF;
END;
$$ language 'plpgsql';

-- Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_profiles_updated_at() TO authenticated;
GRANT EXECUTE ON FUNCTION extract_special_name(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_special_name_in_profile(UUID, TEXT) TO authenticated;

-- Insert some example data (optional, remove in production)
-- INSERT INTO user_profiles (
--     user_id, 
--     wallet_address, 
--     twitter_username, 
--     twitter_display_name,
--     twitter_connected
-- ) VALUES (
--     auth.uid(), 
--     '0x1234567890123456789012345678901234567890', 
--     'example_user', 
--     'Example User (Special Name)',
--     TRUE
-- );
