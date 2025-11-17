-- COMPREHENSIVE FIX: Applications table RLS for public form submissions
-- This fixes the "new row violates row-level security policy" error

-- Step 1: Drop all existing policies on applications table to start fresh
DROP POLICY IF EXISTS "Public can create applications" ON applications;
DROP POLICY IF EXISTS "applications_insert_public" ON applications;
DROP POLICY IF EXISTS "applications_select_org_member" ON applications;
DROP POLICY IF EXISTS "Org members can view applications" ON applications;
DROP POLICY IF EXISTS "applications_update_admin" ON applications;
DROP POLICY IF EXISTS "Org admins can manage applications" ON applications;
DROP POLICY IF EXISTS "Org admins can update applications" ON applications;
DROP POLICY IF EXISTS "applications_delete_admin" ON applications;
DROP POLICY IF EXISTS "Org admins can delete applications" ON applications;

-- Step 2: Ensure RLS is enabled
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Step 3: Create INSERT policy for anonymous and authenticated users (public form)
CREATE POLICY "applications_insert_public"
ON applications FOR INSERT
TO anon, authenticated  -- CRITICAL: Must specify anon explicitly
WITH CHECK (true);      -- Allow all inserts

-- Step 4: Create SELECT policy for organization members
CREATE POLICY "applications_select_org_member"
ON applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tournaments t
    JOIN users u ON u.organization_id = t.organization_id
    WHERE t.id = applications.tournament_id
    AND u.id = auth.uid()
  )
);

-- Step 5: Create UPDATE policy for organization admins
CREATE POLICY "applications_update_admin"
ON applications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tournaments t
    JOIN users u ON u.organization_id = t.organization_id
    WHERE t.id = applications.tournament_id
    AND u.id = auth.uid()
    AND u.role IN ('admin', 'community_manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tournaments t
    JOIN users u ON u.organization_id = t.organization_id
    WHERE t.id = applications.tournament_id
    AND u.id = auth.uid()
    AND u.role IN ('admin', 'community_manager')
  )
);

-- Step 6: Create DELETE policy for organization admins
CREATE POLICY "applications_delete_admin"
ON applications FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tournaments t
    JOIN users u ON u.organization_id = t.organization_id
    WHERE t.id = applications.tournament_id
    AND u.id = auth.uid()
    AND u.role IN ('admin', 'community_manager')
  )
);

-- Step 7: Grant necessary table permissions to anon role
GRANT INSERT ON applications TO anon;
GRANT SELECT ON applications TO authenticated;
GRANT UPDATE, DELETE ON applications TO authenticated;

-- Step 8: Grant permissions on tournaments table (needed to view form)
GRANT SELECT ON tournaments TO anon, authenticated;

-- Step 8b: Add public SELECT policy for tournaments (so anonymous users can view tournament details on form)
DROP POLICY IF EXISTS "tournaments_select_public" ON tournaments;
CREATE POLICY "tournaments_select_public"
ON tournaments FOR SELECT
TO anon, authenticated
USING (true);  -- Allow anyone to read tournament data for public forms

-- Step 9: Ensure the RPC function can be executed by anon
GRANT EXECUTE ON FUNCTION increment_tournament_applications(UUID) TO anon, authenticated;

-- Step 10: Verify policies were created
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'applications';

  RAISE NOTICE 'Total application policies created: %', policy_count;

  -- Check specifically for the insert policy
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'applications'
    AND policyname = 'applications_insert_public'
    AND cmd = 'INSERT'
  ) THEN
    RAISE NOTICE '✓ INSERT policy exists for applications';
  ELSE
    RAISE WARNING '✗ INSERT policy missing for applications';
  END IF;
END $$;
