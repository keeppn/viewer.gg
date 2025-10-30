-- Database Functions for Viewer.gg
-- Run these after the main schema

-- Function to increment tournament application count
CREATE OR REPLACE FUNCTION increment_tournament_applications(tournament_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE tournaments
  SET application_count = application_count + 1
  WHERE id = tournament_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement tournament application count
CREATE OR REPLACE FUNCTION decrement_tournament_applications(tournament_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE tournaments
  SET application_count = GREATEST(application_count - 1, 0)
  WHERE id = tournament_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update application count when application is deleted
CREATE OR REPLACE FUNCTION handle_application_delete()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM decrement_tournament_applications(OLD.tournament_id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER application_delete_trigger
AFTER DELETE ON applications
FOR EACH ROW
EXECUTE FUNCTION handle_application_delete();

-- Function to get tournament statistics
CREATE OR REPLACE FUNCTION get_tournament_stats(tournament_id UUID)
RETURNS TABLE (
  total_applications BIGINT,
  approved_applications BIGINT,
  rejected_applications BIGINT,
  pending_applications BIGINT,
  live_streamers BIGINT,
  total_viewers BIGINT,
  peak_viewers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE TRUE) as total_applications,
    COUNT(*) FILTER (WHERE status = 'Approved') as approved_applications,
    COUNT(*) FILTER (WHERE status = 'Rejected') as rejected_applications,
    COUNT(*) FILTER (WHERE status = 'Pending') as pending_applications,
    (SELECT COUNT(*) FROM live_streams WHERE live_streams.tournament_id = $1 AND is_live = true) as live_streamers,
    (SELECT COALESCE(SUM(current_viewers), 0) FROM live_streams WHERE live_streams.tournament_id = $1 AND is_live = true) as total_viewers,
    (SELECT COALESCE(MAX(viewer_count), 0) FROM viewership_snapshots WHERE viewership_snapshots.tournament_id = $1) as peak_viewers
  FROM applications
  WHERE applications.tournament_id = $1;
END;
$$ LANGUAGE plpgsql;

-- Function to get application statistics for an organization
CREATE OR REPLACE FUNCTION get_organization_application_stats(org_id UUID)
RETURNS TABLE (
  total_applications BIGINT,
  approved_applications BIGINT,
  rejected_applications BIGINT,
  pending_applications BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE TRUE) as total_applications,
    COUNT(*) FILTER (WHERE a.status = 'Approved') as approved_applications,
    COUNT(*) FILTER (WHERE a.status = 'Rejected') as rejected_applications,
    COUNT(*) FILTER (WHERE a.status = 'Pending') as pending_applications
  FROM applications a
  JOIN tournaments t ON a.tournament_id = t.id
  WHERE t.organization_id = org_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old viewership snapshots (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_snapshots(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM viewership_snapshots
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate average viewers for a live stream
CREATE OR REPLACE FUNCTION calculate_stream_average_viewers(stream_id UUID)
RETURNS INTEGER AS $$
DECLARE
  avg_viewers INTEGER;
BEGIN
  SELECT COALESCE(AVG(viewer_count)::INTEGER, 0)
  INTO avg_viewers
  FROM viewership_snapshots
  WHERE live_stream_id = stream_id;
  
  UPDATE live_streams
  SET average_viewers = avg_viewers
  WHERE id = stream_id;
  
  RETURN avg_viewers;
END;
$$ LANGUAGE plpgsql;

-- Realtime publication setup
-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE applications;
ALTER PUBLICATION supabase_realtime ADD TABLE live_streams;
ALTER PUBLICATION supabase_realtime ADD TABLE viewership_snapshots;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Create indexes for common queries (already in schema, but listed here for reference)
-- These improve performance significantly
CREATE INDEX IF NOT EXISTS idx_applications_tournament_status ON applications(tournament_id, status);
CREATE INDEX IF NOT EXISTS idx_live_streams_tournament_live ON live_streams(tournament_id, is_live);
CREATE INDEX IF NOT EXISTS idx_viewership_tournament_timestamp ON viewership_snapshots(tournament_id, timestamp DESC);
