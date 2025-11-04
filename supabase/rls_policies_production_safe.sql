-- ============================================
-- PRODUCTION-SAFE RLS POLICIES UPDATE
-- Date: November 4, 2025
-- ============================================
-- This version is safe to run in production as it:
-- 1. Doesn't disable RLS (keeps data protected during migration)
-- 2. Drops policies one by one with IF EXISTS
-- 3. Creates new policies without disrupting service

-- ============================================
-- STEP 1: DROP OLD POLICIES (SAFE - IF EXISTS)
-- ============================================

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can modify own profile" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- Organizations table policies
DROP POLICY IF EXISTS "Authenticated users can view organizations" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Organization admins can update their org" ON organizations;
DROP POLICY IF EXISTS "Organizations are viewable by members" ON organizations;
DROP POLICY IF EXISTS "Organizations can be created by authenticated users" ON organizations;
DROP POLICY IF EXISTS "Organizations can be updated by admins" ON organizations;
DROP POLICY IF EXISTS "organizations_select_all" ON organizations;
DROP POLICY IF EXISTS "organizations_insert_authenticated" ON organizations;
DROP POLICY IF EXISTS "organizations_update_admin" ON organizations;

-- Tournaments table policies
DROP POLICY IF EXISTS "Org members can view tournaments" ON tournaments;
DROP POLICY IF EXISTS "Org admins can manage tournaments" ON tournaments;
DROP POLICY IF EXISTS "Org admins can insert tournaments" ON tournaments;
DROP POLICY IF EXISTS "Org admins can update tournaments" ON tournaments;
DROP POLICY IF EXISTS "Org admins can delete tournaments" ON tournaments;
DROP POLICY IF EXISTS "Tournaments are viewable by org members" ON tournaments;
DROP POLICY IF EXISTS "Tournaments can be created by org admins" ON tournaments;
DROP POLICY IF EXISTS "Tournaments can be updated by org admins" ON tournaments;
DROP POLICY IF EXISTS "Tournaments can be deleted by org admins" ON tournaments;
DROP POLICY IF EXISTS "tournaments_select_org_member" ON tournaments;
DROP POLICY IF EXISTS "tournaments_insert_admin" ON tournaments;
DROP POLICY IF EXISTS "tournaments_update_admin" ON tournaments;
DROP POLICY IF EXISTS "tournaments_delete_admin" ON tournaments;

-- Applications table policies
DROP POLICY IF EXISTS "Public can create applications" ON applications;
DROP POLICY IF EXISTS "Org members can view applications" ON applications;
DROP POLICY IF EXISTS "Org admins can manage applications" ON applications;
DROP POLICY IF EXISTS "Org admins can update applications" ON applications;
DROP POLICY IF EXISTS "Org admins can delete applications" ON applications;
DROP POLICY IF EXISTS "Applications can be created publicly" ON applications;
DROP POLICY IF EXISTS "Applications are viewable by org members" ON applications;
DROP POLICY IF EXISTS "Applications can be updated by org admins" ON applications;
DROP POLICY IF EXISTS "Applications can be deleted by org admins" ON applications;
DROP POLICY IF EXISTS "applications_insert_public" ON applications;
DROP POLICY IF EXISTS "applications_select_org_member" ON applications;
DROP POLICY IF EXISTS "applications_update_admin" ON applications;
DROP POLICY IF EXISTS "applications_delete_admin" ON applications;

-- Live streams table policies
DROP POLICY IF EXISTS "Anyone can view live streams" ON live_streams;
DROP POLICY IF EXISTS "Org members can manage live streams" ON live_streams;
DROP POLICY IF EXISTS "Live streams are publicly viewable" ON live_streams;
DROP POLICY IF EXISTS "Live streams can be managed by org members" ON live_streams;
DROP POLICY IF EXISTS "live_streams_select_public" ON live_streams;
DROP POLICY IF EXISTS "live_streams_insert_org_member" ON live_streams;
DROP POLICY IF EXISTS "live_streams_update_org_member" ON live_streams;
DROP POLICY IF EXISTS "live_streams_delete_org_member" ON live_streams;

-- Notifications table policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Notifications are viewable by owner" ON notifications;
DROP POLICY IF EXISTS "Notifications can be updated by owner" ON notifications;
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;

-- ============================================
-- STEP 2: ENABLE RLS (SAFE - Already enabled)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: CREATE NEW POLICIES
-- ============================================

-- ============================================
-- USERS TABLE
-- ============================================

-- Allow users to view their own profile
CREATE POLICY "users_select_own"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to create their own profile (critical for bootstrap)
CREATE POLICY "users_insert_own"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "users_update_own"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================

-- Allow authenticated users to view all organizations
CREATE POLICY "organizations_select_all"
ON organizations FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to create organizations
CREATE POLICY "organizations_insert_authenticated"
ON organizations FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow organization admins to update their organization
CREATE POLICY "organizations_update_admin"
ON organizations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.organization_id = organizations.id
    AND users.role IN ('admin', 'community_manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.organization_id = organizations.id
    AND users.role IN ('admin', 'community_manager')
  )
);

-- ============================================
-- TOURNAMENTS TABLE
-- ============================================

-- Allow organization members to view their tournaments
CREATE POLICY "tournaments_select_org_member"
ON tournaments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.organization_id = tournaments.organization_id
  )
);

-- Allow organization admins to create tournaments
CREATE POLICY "tournaments_insert_admin"
ON tournaments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.organization_id = tournaments.organization_id
    AND users.role IN ('admin', 'community_manager')
  )
);

-- Allow organization admins to update tournaments
CREATE POLICY "tournaments_update_admin"
ON tournaments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.organization_id = tournaments.organization_id
    AND users.role IN ('admin', 'community_manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.organization_id = tournaments.organization_id
    AND users.role IN ('admin', 'community_manager')
  )
);

-- Allow organization admins to delete tournaments
CREATE POLICY "tournaments_delete_admin"
ON tournaments FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.organization_id = tournaments.organization_id
    AND users.role IN ('admin', 'community_manager')
  )
);

-- ============================================
-- APPLICATIONS TABLE
-- ============================================

-- Allow anyone to create applications (public forms)
CREATE POLICY "applications_insert_public"
ON applications FOR INSERT
WITH CHECK (true);

-- Allow organization members to view applications for their tournaments
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

-- Allow organization admins to update applications
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

-- Allow organization admins to delete applications
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
-- LIVE STREAMS TABLE
-- ============================================

-- Allow anyone to view live streams (public)
CREATE POLICY "live_streams_select_public"
ON live_streams FOR SELECT
USING (true);

-- Allow organization members to manage live streams
CREATE POLICY "live_streams_insert_org_member"
ON live_streams FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tournaments t
    JOIN users u ON u.organization_id = t.organization_id
    WHERE t.id = live_streams.tournament_id
    AND u.id = auth.uid()
  )
);

CREATE POLICY "live_streams_update_org_member"
ON live_streams FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tournaments t
    JOIN users u ON u.organization_id = t.organization_id
    WHERE t.id = live_streams.tournament_id
    AND u.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tournaments t
    JOIN users u ON u.organization_id = t.organization_id
    WHERE t.id = live_streams.tournament_id
    AND u.id = auth.uid()
  )
);

CREATE POLICY "live_streams_delete_org_member"
ON live_streams FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tournaments t
    JOIN users u ON u.organization_id = t.organization_id
    WHERE t.id = live_streams.tournament_id
    AND u.id = auth.uid()
  )
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

-- Allow users to view their own notifications
CREATE POLICY "notifications_select_own"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow users to update their own notifications
CREATE POLICY "notifications_update_own"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- STEP 4: VERIFY POLICIES
-- ============================================
DO $$
DECLARE
    policy_count INTEGER;
    table_record RECORD;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'Total policies created: %', policy_count;
    
    -- List all policies
    RAISE NOTICE 'Policies by table:';
    FOR table_record IN 
        SELECT tablename, COUNT(*) as count
        FROM pg_policies
        WHERE schemaname = 'public'
        GROUP BY tablename
        ORDER BY tablename
    LOOP
        RAISE NOTICE '  % - % policies', table_record.tablename, table_record.count;
    END LOOP;
END $$;

-- Final verification query
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
