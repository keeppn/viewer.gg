-- Discord Bot Configuration Table
-- This table stores Discord server (guild) configurations for organizations
-- When a TO adds the bot to their Discord server, an entry is created here

CREATE TABLE IF NOT EXISTS discord_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  guild_id TEXT NOT NULL UNIQUE, -- Discord server ID (snowflake)
  guild_name TEXT NOT NULL, -- Discord server name (for display)
  approved_role_id TEXT, -- ID of "Approved Co-streamers" role
  invite_link TEXT, -- Optional: permanent invite link to server
  bot_added TIMESTAMPTZ DEFAULT NOW(), -- When bot was added to server
  enabled BOOLEAN DEFAULT true, -- Can disable without removing bot
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one config per guild
  CONSTRAINT unique_guild_config UNIQUE(guild_id),
  -- Ensure organization exists
  CONSTRAINT fk_organization FOREIGN KEY(organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Discord Messages Audit Log
-- Tracks all Discord actions (role assignments, DMs sent, etc.)
CREATE TABLE IF NOT EXISTS discord_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
  discord_user_id TEXT NOT NULL, -- Discord snowflake ID
  message_type TEXT NOT NULL CHECK (message_type IN ('role_assignment', 'dm_notification', 'role_removal')),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error_message TEXT, -- If failed, what went wrong
  attempts INTEGER DEFAULT 1, -- How many retry attempts
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional context (guild_id, role_id, etc.)
  
  -- Index for fast lookups
  CONSTRAINT fk_application FOREIGN KEY(application_id) REFERENCES applications(id) ON DELETE SET NULL,
  CONSTRAINT fk_tournament FOREIGN KEY(tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL
);

-- Indices for performance
CREATE INDEX idx_discord_configs_organization ON discord_configs(organization_id);
CREATE INDEX idx_discord_configs_guild ON discord_configs(guild_id);
CREATE INDEX idx_discord_messages_application ON discord_messages(application_id);
CREATE INDEX idx_discord_messages_tournament ON discord_messages(tournament_id);
CREATE INDEX idx_discord_messages_user ON discord_messages(discord_user_id);
CREATE INDEX idx_discord_messages_status ON discord_messages(status);
CREATE INDEX idx_discord_messages_sent_at ON discord_messages(sent_at DESC);

-- Enable Row Level Security
ALTER TABLE discord_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE discord_messages ENABLE ROW LEVEL SECURITY;

-- Discord configs RLS policies
-- Organizers can only see their own organization's config
CREATE POLICY "Organizers can view their organization's Discord config"
  ON discord_configs
  FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can insert their organization's Discord config"
  ON discord_configs
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can update their organization's Discord config"
  ON discord_configs
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can delete their organization's Discord config"
  ON discord_configs
  FOR DELETE
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

-- Discord messages RLS policies
CREATE POLICY "Organizers can view their tournament's Discord messages"
  ON discord_messages
  FOR SELECT
  USING (
    tournament_id IN (
      SELECT id FROM tournaments WHERE organization_id IN (
        SELECT id FROM organizations WHERE owner_id = auth.uid()
      )
    )
  );

-- Service role can insert messages (for system operations)
CREATE POLICY "Service role can insert Discord messages"
  ON discord_messages
  FOR INSERT
  WITH CHECK (true);

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_discord_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp update
CREATE TRIGGER update_discord_configs_timestamp
  BEFORE UPDATE ON discord_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_discord_config_updated_at();

-- Comments for documentation
COMMENT ON TABLE discord_configs IS 'Stores Discord bot configuration per organization/guild';
COMMENT ON COLUMN discord_configs.guild_id IS 'Discord server ID (snowflake) - unique identifier';
COMMENT ON COLUMN discord_configs.approved_role_id IS 'Role ID that gets assigned to approved streamers';
COMMENT ON TABLE discord_messages IS 'Audit log for all Discord bot actions (roles, DMs, etc.)';
COMMENT ON COLUMN discord_messages.message_type IS 'Type of action: role_assignment, dm_notification, or role_removal';
COMMENT ON COLUMN discord_messages.status IS 'Result: sent (success), failed (error), skipped (intentional skip)';
