-- Migration: Simplify auth for Tournament Organizer-only signup
-- Execute this in your Supabase SQL Editor
-- Date: 2024

-- ============================================
-- STEP 1: Remove streamer-specific columns
-- ============================================

-- Drop streaming_platform column (no longer needed - streamers use public application form)
ALTER TABLE users DROP COLUMN IF EXISTS streaming_platform CASCADE;

-- ============================================
-- STEP 2: Update user_type constraints
-- ============================================

-- Remove old constraint and add new one for organizer-only
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;
ALTER TABLE users ADD CONSTRAINT users_user_type_check CHECK (user_type = 'organizer');

-- Set default value for new signups
ALTER TABLE users ALTER COLUMN user_type SET DEFAULT 'organizer';

-- ============================================
-- STEP 3: Update oauth_provider constraints
-- ============================================

-- Only allow Google and Discord OAuth
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_oauth_provider_check;
ALTER TABLE users ADD CONSTRAINT users_oauth_provider_check CHECK (oauth_provider IN ('google', 'discord'));

-- ============================================
-- STEP 4: Migrate existing users
-- ============================================

-- Convert all existing users to organizers
-- (Backup your data before running this if you have important streamer accounts)
UPDATE users 
SET user_type = 'organizer' 
WHERE user_type IS NULL OR user_type = 'streamer';

-- Set admin role for organizers who don't have a role set
UPDATE users 
SET role = 'admin' 
WHERE user_type = 'organizer' AND (role IS NULL OR role = 'viewer');

-- ============================================
-- VERIFICATION QUERIES (Run these to check)
-- ============================================

-- Check user_type distribution
-- SELECT user_type, COUNT(*) FROM users GROUP BY user_type;

-- Check oauth_provider distribution  
-- SELECT oauth_provider, COUNT(*) FROM users GROUP BY oauth_provider;

-- Check role distribution
-- SELECT role, COUNT(*) FROM users GROUP BY role;

-- ============================================
-- NOTES
-- ============================================
-- 1. All new signups will be Tournament Organizers (TOs)
-- 2. TOs can only sign in with Google or Discord
-- 3. Streamers will use the public application form at /apply
-- 4. Existing RLS policies remain unchanged (they work with roles)
-- 5. Applications table is unchanged (streamers don't need auth accounts)
