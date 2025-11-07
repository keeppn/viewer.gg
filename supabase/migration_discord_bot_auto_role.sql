-- Migration: Add Discord Bot Auto-Role Assignment Support
-- Date: 2025-11-07
-- Description: Adds columns and triggers needed for automatic Discord role assignment

-- Step 1: Add discord_user_id to applications table
-- This stores the Discord user ID of the streamer applying
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS discord_user_id TEXT;

-- Step 2: Add approved_role_id to discord_configs table
-- This stores the ID of the "Approved Co-Streamer" role
ALTER TABLE discord_configs
ADD COLUMN IF NOT EXISTS approved_role_id TEXT;

-- Step 3: Add is_active flag to discord_configs table
-- Allows TOs to temporarily disable Discord integration
ALTER TABLE discord_configs
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 4: Add tournament_organizer_id to discord_configs
-- Links Discord config to a specific TO (user), not organization
-- This allows per-TO Discord configuration
ALTER TABLE discord_configs
ADD COLUMN IF NOT EXISTS tournament_organizer_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Step 5: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_applications_discord_user_id 
ON applications(discord_user_id);

CREATE INDEX IF NOT EXISTS idx_discord_configs_tournament_organizer_id 
ON discord_configs(tournament_organizer_id);

-- Step 6: Create function to handle application approval notifications
-- This function will be called by a trigger when application status changes to "Approved"
CREATE OR REPLACE FUNCTION notify_application_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if status changed to "Approved" from a different status
  IF NEW.status = 'Approved' AND (OLD.status IS NULL OR OLD.status != 'Approved') THEN
    -- You can add logic here to:
    -- 1. Call an Edge Function
    -- 2. Insert into a job queue table
    -- 3. Send a notification
    
    -- For now, we'll just log that an approval happened
    -- The actual role assignment will be triggered by the API endpoint
    RAISE NOTICE 'Application % approved, ready for Discord role assignment', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger on applications table
-- Fires after application status is updated
DROP TRIGGER IF EXISTS on_application_approved ON applications;

CREATE TRIGGER on_application_approved
  AFTER UPDATE OF status ON applications
  FOR EACH ROW
  WHEN (NEW.status = 'Approved')
  EXECUTE FUNCTION notify_application_approval();

-- Step 8: Add error_message column to discord_messages for better logging
ALTER TABLE discord_messages
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Step 9: Drop the old error column (rename to error_message)
-- Only if the old column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discord_messages' AND column_name = 'error'
  ) THEN
    ALTER TABLE discord_messages DROP COLUMN error;
  END IF;
END $$;

-- Migration complete
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Update application approval logic to call /api/discord/assign-role
-- 3. Test with a real Discord server
