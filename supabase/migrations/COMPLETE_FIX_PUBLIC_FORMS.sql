-- ============================================
-- COMPLETE FIX FOR PUBLIC APPLICATION FORMS
-- This script fixes ALL RLS issues for anonymous submissions
-- Date: November 17, 2025
-- ============================================

-- ============================================
-- STEP 1: DIAGNOSE CURRENT STATE
-- ============================================
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '=== CURRENT POLICIES ON APPLICATIONS TABLE ===';
    FOR rec IN
        SELECT policyname, roles::text, cmd
        FROM pg_policies
        WHERE tablename = 'applications'
        ORDER BY policyname
    LOOP
        RAISE NOTICE 'Policy: % | Roles: % | Command: %', rec.policyname, rec.roles, rec.cmd;
    END LOOP;

    RAISE NOTICE '=== CURRENT POLICIES ON TOURNAMENTS TABLE ===';
    FOR rec IN
        SELECT policyname, roles::text, cmd
        FROM pg_policies
        WHERE tablename = 'tournaments'
        ORDER BY policyname
    LOOP
        RAISE NOTICE 'Policy: % | Roles: % | Command: %', rec.policyname, rec.roles, rec.cmd;
    END LOOP;
END $$;

-- ============================================
-- STEP 2: CLEAN UP ALL PUBLIC-RELATED POLICIES
-- ============================================
-- Drop all variations of public insert policies
DROP POLICY IF EXISTS "applications_insert_public" ON applications;
DROP POLICY IF EXISTS "Public can create applications" ON applications;
DROP POLICY IF EXISTS "applications_insert_anon" ON applications;

-- Drop all variations of public select policies on tournaments
DROP POLICY IF EXISTS "tournaments_select_public" ON tournaments;
DROP POLICY IF EXISTS "Public can view tournaments" ON tournaments;
DROP POLICY IF EXISTS "tournaments_select_anon" ON tournaments;

DO $$ BEGIN RAISE NOTICE '=== Dropped all existing public policies ==='; END $$;

-- ============================================
-- STEP 3: CREATE CORRECT POLICIES
-- ============================================

-- Enable RLS (in case it's not enabled)
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Tournament SELECT for everyone (needed to view application form)
CREATE POLICY "tournaments_public_select"
ON tournaments
FOR SELECT
TO public  -- Applies to BOTH anon and authenticated
USING (true);

-- Application INSERT for everyone (needed to submit application)
CREATE POLICY "applications_public_insert"
ON applications
FOR INSERT
TO public  -- Applies to BOTH anon and authenticated
WITH CHECK (true);

DO $$ BEGIN RAISE NOTICE '=== Created new public policies ==='; END $$;

-- ============================================
-- STEP 4: GRANT TABLE-LEVEL PERMISSIONS
-- ============================================

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant SELECT on tournaments to anon (for viewing tournament details)
GRANT SELECT ON TABLE tournaments TO anon;

-- Grant INSERT on applications to anon (for submitting applications)
GRANT INSERT ON TABLE applications TO anon;

-- Grant EXECUTE on the increment function to anon
GRANT EXECUTE ON FUNCTION increment_tournament_applications(uuid) TO anon;

-- Grant EXECUTE on uuid generation function (might be needed)
GRANT EXECUTE ON FUNCTION uuid_generate_v4() TO anon;

DO $$ BEGIN RAISE NOTICE '=== Granted all necessary permissions to anon role ==='; END $$;

-- ============================================
-- STEP 5: VERIFY THE FIX
-- ============================================
DO $$
DECLARE
    rec RECORD;
    policy_count INT;
BEGIN
    -- Check policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename IN ('tournaments', 'applications')
    AND policyname LIKE '%public%';

    RAISE NOTICE '=== VERIFICATION ===';
    RAISE NOTICE 'Found % public policies', policy_count;

    IF policy_count < 2 THEN
        RAISE WARNING 'Expected at least 2 public policies, found %', policy_count;
    END IF;

    RAISE NOTICE '=== NEW POLICIES ===';
    FOR rec IN
        SELECT tablename, policyname, roles::text, cmd
        FROM pg_policies
        WHERE tablename IN ('tournaments', 'applications')
        AND policyname LIKE '%public%'
        ORDER BY tablename, policyname
    LOOP
        RAISE NOTICE 'Table: % | Policy: % | Roles: % | Command: %',
            rec.tablename, rec.policyname, rec.roles, rec.cmd;
    END LOOP;

    -- Check grants
    RAISE NOTICE '=== GRANTS TO ANON ROLE ===';
    FOR rec IN
        SELECT table_name, privilege_type
        FROM information_schema.table_privileges
        WHERE grantee = 'anon'
        AND table_name IN ('tournaments', 'applications')
        ORDER BY table_name, privilege_type
    LOOP
        RAISE NOTICE 'Table: % | Privilege: %', rec.table_name, rec.privilege_type;
    END LOOP;
END $$;

-- ============================================
-- STEP 6: FINAL MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '====================================';
    RAISE NOTICE 'PUBLIC FORMS FIX COMPLETE';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Anonymous users can now:';
    RAISE NOTICE '  ✓ View tournaments (SELECT)';
    RAISE NOTICE '  ✓ Submit applications (INSERT)';
    RAISE NOTICE '  ✓ Increment tournament counters (RPC)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Test in incognito mode';
    RAISE NOTICE '====================================';
END $$;
