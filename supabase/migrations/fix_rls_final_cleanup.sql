-- FINAL CLEANUP: Remove duplicate policies and ensure clean state

-- ============================================
-- APPLICATIONS TABLE - Clean up duplicates
-- ============================================

-- Drop ALL existing application policies
DROP POLICY IF EXISTS "Public can create applications" ON applications;
DROP POLICY IF EXISTS "applications_insert_public" ON applications;
DROP POLICY IF EXISTS "applications_public_insert" ON applications;
DROP POLICY IF EXISTS "applications_select_org_member" ON applications;
DROP POLICY IF EXISTS "Org members can view applications" ON applications;
DROP POLICY IF EXISTS "applications_update_admin" ON applications;
DROP POLICY IF EXISTS "Org admins can manage applications" ON applications;
DROP POLICY IF EXISTS "Org admins can update applications" ON applications;
DROP POLICY IF EXISTS "applications_delete_admin" ON applications;
DROP POLICY IF EXISTS "Org admins can delete applications" ON applications;

-- Recreate with clean single policies
CREATE POLICY "applications_public_insert"
ON applications FOR INSERT
TO public  -- Using 'public' covers both anon and authenticated
WITH CHECK (true);

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

-- ============================================
-- TOURNAMENTS TABLE - Clean up duplicates
-- ============================================

-- Drop duplicate tournament SELECT policies
DROP POLICY IF EXISTS "Public can view tournaments" ON tournaments;
DROP POLICY IF EXISTS "tournaments_public_select" ON tournaments;
DROP POLICY IF EXISTS "tournaments_select_public" ON tournaments;

-- Recreate single public SELECT policy
CREATE POLICY "tournaments_public_select"
ON tournaments FOR SELECT
TO public  -- Covers all roles
USING (true);

-- ============================================
-- PERMISSIONS
-- ============================================

-- Grant table-level permissions
GRANT SELECT ON tournaments TO anon, authenticated;
GRANT INSERT ON applications TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON applications TO authenticated;

-- Grant function execution
GRANT EXECUTE ON FUNCTION increment_tournament_applications(UUID) TO anon, authenticated;

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  app_policies INTEGER;
  tourn_select_policies INTEGER;
BEGIN
  -- Count application policies
  SELECT COUNT(*) INTO app_policies
  FROM pg_policies
  WHERE tablename = 'applications';

  -- Count tournament SELECT policies
  SELECT COUNT(*) INTO tourn_select_policies
  FROM pg_policies
  WHERE tablename = 'tournaments'
  AND cmd = 'SELECT'
  AND roles && ARRAY['public'];

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Policy Verification Results:';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Total application policies: %', app_policies;
  RAISE NOTICE 'Tournament public SELECT policies: %', tourn_select_policies;

  -- Verify critical policies exist
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'applications'
    AND policyname = 'applications_public_insert'
    AND cmd = 'INSERT'
    AND 'public' = ANY(roles)
  ) THEN
    RAISE NOTICE '✓ Applications INSERT policy: EXISTS and applies to public';
  ELSE
    RAISE WARNING '✗ Applications INSERT policy: MISSING or incorrect';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tournaments'
    AND policyname = 'tournaments_public_select'
    AND cmd = 'SELECT'
    AND 'public' = ANY(roles)
  ) THEN
    RAISE NOTICE '✓ Tournaments SELECT policy: EXISTS and applies to public';
  ELSE
    RAISE WARNING '✗ Tournaments SELECT policy: MISSING or incorrect';
  END IF;

  RAISE NOTICE '==============================================';
END $$;
