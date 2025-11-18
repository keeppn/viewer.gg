-- Discord integrations table for storing OAuth tokens and settings
CREATE TABLE IF NOT EXISTS discord_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discord_user_id TEXT NOT NULL,
  discord_username TEXT NOT NULL,
  discord_discriminator TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  servers JSONB DEFAULT '[]'::jsonb,
  selected_server_id TEXT,
  selected_role_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organizer_id)
);

-- Role assignment history table
CREATE TABLE IF NOT EXISTS discord_role_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
  streamer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('assigned', 'removed')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add Discord-related columns to applications table (was tournament_applications)
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS discord_role_assigned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS discord_role_assigned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS discord_role_removed_at TIMESTAMPTZ;

-- Add Discord ID columns to applications table 
-- (Since streamer data is stored in JSONB, we'll add these columns for easier queries)
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS discord_id TEXT,
ADD COLUMN IF NOT EXISTS discord_username TEXT;

-- Create indices for better performance
CREATE INDEX IF NOT EXISTS idx_discord_integrations_organizer ON discord_integrations(organizer_id);
CREATE INDEX IF NOT EXISTS idx_discord_role_history_organizer ON discord_role_history(organizer_id);
CREATE INDEX IF NOT EXISTS idx_discord_role_history_timestamp ON discord_role_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_applications_discord_id ON applications(discord_id);
-- Enable Row Level Security
ALTER TABLE discord_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE discord_role_history ENABLE ROW LEVEL SECURITY;

-- Discord integrations policies
CREATE POLICY "Organizers can view their own Discord integration"
  ON discord_integrations
  FOR SELECT
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can insert their own Discord integration"
  ON discord_integrations
  FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their own Discord integration"
  ON discord_integrations
  FOR UPDATE
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their own Discord integration"
  ON discord_integrations
  FOR DELETE
  USING (auth.uid() = organizer_id);

-- Role history policies
CREATE POLICY "Organizers can view their role assignment history"
  ON discord_role_history
  FOR SELECT
  USING (auth.uid() = organizer_id);

-- Service role can insert role history (for webhook operations)
CREATE POLICY "Service role can insert role history"
  ON discord_role_history
  FOR INSERT
  WITH CHECK (true);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_discord_integration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp update
CREATE TRIGGER update_discord_integrations_timestamp
  BEFORE UPDATE ON discord_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_discord_integration_updated_at();
