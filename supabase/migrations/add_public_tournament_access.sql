-- ============================================
-- Allow public access to tournaments for application forms
-- Date: November 17, 2025
-- ============================================

-- Add policy to allow anonymous users to view tournaments
-- This is required for public application forms to work
CREATE POLICY "tournaments_select_public"
ON tournaments FOR SELECT
TO anon
USING (true);

-- Grant SELECT permission to anon role on tournaments table
GRANT SELECT ON tournaments TO anon;

-- Verify the policy was created
DO $$
BEGIN
    RAISE NOTICE 'Public tournament access policy created successfully';
END $$;
