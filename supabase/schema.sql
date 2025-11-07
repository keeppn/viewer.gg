-- Viewer.gg Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  discord_guild_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'community_manager', 'marketing', 'viewer')),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournaments table
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  game TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  banner_url TEXT,
  logo_url TEXT,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  form_fields JSONB DEFAULT '[]'::jsonb,
  custom_fields JSONB DEFAULT '[]'::jsonb,
  discord_role_id TEXT,
  discord_channel_id TEXT,
  approval_message TEXT,
  rejection_message TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'archived')) DEFAULT 'draft',
  application_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  streamer JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
  submission_date TIMESTAMPTZ DEFAULT NOW(),
  reviewed_date TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  custom_data JSONB DEFAULT '{}'::jsonb,
  previous_experience TEXT,
  availability_confirmed BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live streams table
CREATE TABLE live_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('Twitch', 'YouTube', 'Kick')),
  streamer_name TEXT NOT NULL,
  game TEXT NOT NULL,
  title TEXT NOT NULL,
  current_viewers INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  average_viewers INTEGER DEFAULT 0,
  stream_start TIMESTAMPTZ NOT NULL,
  stream_end TIMESTAMPTZ,
  avatar_url TEXT,
  stream_url TEXT NOT NULL,
  language TEXT NOT NULL,
  is_live BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Viewership snapshots table (for analytics)
CREATE TABLE viewership_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  live_stream_id UUID REFERENCES live_streams(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewer_count INTEGER NOT NULL,
  streamer_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discord configuration table
CREATE TABLE discord_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  guild_id TEXT NOT NULL,
  guild_name TEXT NOT NULL,
  bot_token TEXT NOT NULL,
  default_role_id TEXT,
  announcement_channel_id TEXT,
  is_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- Discord messages log
CREATE TABLE discord_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  discord_user_id TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('approval', 'rejection', 'update')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT false,
  error TEXT
);

-- Report configurations
CREATE TABLE report_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'csv')),
  branding JSONB DEFAULT '{}'::jsonb,
  sections JSONB DEFAULT '{}'::jsonb,
  date_range JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated reports
CREATE TABLE generated_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES report_configs(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_applications_tournament ON applications(tournament_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_submission_date ON applications(submission_date DESC);
CREATE INDEX idx_live_streams_tournament ON live_streams(tournament_id);
CREATE INDEX idx_live_streams_is_live ON live_streams(is_live);
CREATE INDEX idx_viewership_snapshots_tournament ON viewership_snapshots(tournament_id);
CREATE INDEX idx_viewership_snapshots_timestamp ON viewership_snapshots(timestamp DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_tournaments_organization ON tournaments(organization_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_live_streams_updated_at BEFORE UPDATE ON live_streams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discord_configs_updated_at BEFORE UPDATE ON discord_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewership_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE discord_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE discord_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Organization members can view organization data
CREATE POLICY "Organization members can view their org" ON organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Tournament policies (organization-based access)
CREATE POLICY "Org members can view tournaments" ON tournaments FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Org admins can manage tournaments" ON tournaments FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'community_manager')
  ));

-- Application policies
CREATE POLICY "Public can create applications" ON applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Org members can view applications" ON applications FOR SELECT
  USING (tournament_id IN (
    SELECT id FROM tournaments WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Org admins can manage applications" ON applications FOR UPDATE
  USING (tournament_id IN (
    SELECT id FROM tournaments WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'community_manager')
    )
  ));

-- Live streams policies (public read, org write)
CREATE POLICY "Anyone can view live streams" ON live_streams FOR SELECT USING (true);

CREATE POLICY "Org members can manage live streams" ON live_streams FOR ALL
  USING (tournament_id IN (
    SELECT id FROM tournaments WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  ));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE
  USING (user_id = auth.uid());
