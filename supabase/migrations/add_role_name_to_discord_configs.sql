-- Add role_name column to discord_configs table
ALTER TABLE discord_configs
ADD COLUMN IF NOT EXISTS role_name TEXT DEFAULT 'Approved Co-Streamer';

-- Update existing records to have the default role name
UPDATE discord_configs
SET role_name = 'Approved Co-Streamer'
WHERE role_name IS NULL;
