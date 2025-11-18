-- Fix: Allow anonymous users to view tournament forms and submit applications
-- Two issues fixed:
-- 1. Anonymous users need to read tournament data to display the form
-- 2. Anonymous users need to execute increment_tournament_applications RPC

-- Grant execute permission on the RPC function to anonymous users
GRANT EXECUTE ON FUNCTION increment_tournament_applications(UUID) TO anon;

-- Grant SELECT permission on tournaments table for anonymous users
GRANT SELECT ON tournaments TO anon;

-- Ensure anon role has INSERT permission on applications table
GRANT INSERT ON applications TO anon;

-- Add public policy for tournaments (so anonymous users can view tournament details for the form)
DROP POLICY IF EXISTS "Public can view tournaments" ON tournaments;
CREATE POLICY "Public can view tournaments" ON tournaments
  FOR SELECT
  USING (true);

-- Verify the public insert policy exists for applications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'applications'
    AND policyname = 'Public can create applications'
  ) THEN
    CREATE POLICY "Public can create applications" ON applications
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;
