-- ============================================
-- Final fix for anonymous application submission
-- Date: November 17, 2025
-- ============================================

-- Step 1: Check current policies (for debugging)
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename IN ('tournaments', 'applications')
ORDER BY tablename, policyname;

-- Step 2: Drop ALL existing public-related policies
DROP POLICY IF EXISTS "applications_insert_public" ON applications;
DROP POLICY IF EXISTS "tournaments_select_public" ON tournaments;

-- Step 3: Create policies using PUBLIC role (allows both anon and authenticated)
CREATE POLICY "tournaments_select_public"
ON tournaments FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "applications_insert_public"
ON applications FOR INSERT
TO PUBLIC
WITH CHECK (true);

-- Step 4: Ensure table has RLS enabled but grants are in place
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Step 5: Grant table-level permissions
GRANT SELECT ON tournaments TO anon, authenticated;
GRANT INSERT ON applications TO anon, authenticated;

-- Step 6: Grant function execution
GRANT EXECUTE ON FUNCTION increment_tournament_applications(uuid) TO anon, authenticated;

-- Step 7: Verify policies were created
SELECT
    'Policy created: ' || policyname as status,
    tablename,
    roles::text as applies_to,
    cmd as command
FROM pg_policies
WHERE tablename IN ('tournaments', 'applications')
AND policyname IN ('tournaments_select_public', 'applications_insert_public')
ORDER BY tablename;
