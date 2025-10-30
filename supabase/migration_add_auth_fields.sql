-- Migration: Add auth-related fields to users table
-- Run this in your Supabase SQL Editor

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('organizer', 'streamer')),
ADD COLUMN IF NOT EXISTS oauth_provider TEXT,
ADD COLUMN IF NOT EXISTS streaming_platform TEXT CHECK (streaming_platform IN ('Twitch', 'YouTube', 'Kick'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_oauth_provider ON users(oauth_provider);

-- Update existing users to have a default user_type if null
-- You can run this after the migration if needed
-- UPDATE users SET user_type = 'organizer' WHERE role = 'admin';
-- UPDATE users SET user_type = 'streamer' WHERE role = 'viewer' AND user_type IS NULL;
