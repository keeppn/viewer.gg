-- ============================================
-- Fix public application submission
-- Date: November 17, 2025
-- ============================================

-- Step 1: Drop existing policies that might be blocking
DROP POLICY IF EXISTS "applications_insert_public" ON applications;
DROP POLICY IF EXISTS "tournaments_select_public" ON tournaments;

-- Step 2: Create proper policies for anonymous users

-- Allow anonymous users to view tournaments (needed for form)
CREATE POLICY "tournaments_select_public"
ON tournaments FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anonymous users to insert applications (needed for form submission)
CREATE POLICY "applications_insert_public"
ON applications FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Step 3: Grant necessary permissions to anon role
GRANT SELECT ON tournaments TO anon;
GRANT INSERT ON applications TO anon;
GRANT USAGE ON SEQUENCE applications_id_seq TO anon;

-- Step 4: Allow anon to execute the increment function
GRANT EXECUTE ON FUNCTION increment_tournament_applications(uuid) TO anon;

-- Step 5: Verify the policies were created
DO $$
BEGIN
    RAISE NOTICE 'Public application submission policies created successfully';
    RAISE NOTICE 'Anonymous users can now:';
    RAISE NOTICE '  - View tournaments';
    RAISE NOTICE '  - Submit applications';
END $$;

-- Step 6: Check current policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('tournaments', 'applications')
AND policyname LIKE '%public%'
ORDER BY tablename, policyname;
