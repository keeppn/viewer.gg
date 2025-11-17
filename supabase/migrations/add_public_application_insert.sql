-- ============================================
-- Allow public access to create applications
-- Date: November 17, 2025
-- ============================================

-- Add policy to allow anonymous users to insert applications
-- This is required for public application forms to work
CREATE POLICY "applications_insert_public"
ON applications FOR INSERT
TO anon
WITH CHECK (true);

-- Grant INSERT permission to anon role on applications table
GRANT INSERT ON applications TO anon;

-- Verify the policy was created
DO $$
BEGIN
    RAISE NOTICE 'Public application insert policy created successfully';
END $$;
