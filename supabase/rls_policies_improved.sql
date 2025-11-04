-- ============================================
-- IMPROVED RLS POLICIES
-- ============================================
-- This file contains improved RLS policies that fix the bootstrap issue
-- and ensure proper data isolation

-- ============================================
-- 1. USERS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own record
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can insert their own record on first login
-- This is critical for the bootstrap process
CREATE POLICY "Users can create own profile"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own record
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. ORGANIZATIONS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view organizations" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Organization admins can update their org" ON organizations;

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view any organization
-- This is needed for the bootstrap process when creating a new user
CREATE POLICY "Authenticated users can view organizations"
ON organizations
FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users can create organizations
-- Needed during user registration flow
CREATE POLICY "Users can create organizations"
ON organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Organization members can update their organization
CREATE POLICY "Organization admins can update their org"
ON organizations
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'community_manager')
  )
)
WITH CHECK (
  id IN (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'community_manager')
  )
);

-- ============================================
-- 3. TOURNAMENTS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Org members can view tournaments" ON tournaments;
DROP POLICY IF EXISTS "Org admins can manage tournaments" ON tournaments;

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Policy: Organization members can view their organization's tournaments
CREATE POLICY "Org members can view tournaments"
ON tournaments
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Policy: Organization admins can insert tournaments
CREATE POLICY "Org admins can insert tournaments"
ON tournaments
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'community_manager')
  )
);

-- Policy: Organization admins can update tournaments
CREATE POLICY "Org admins can update tournaments"
ON tournaments
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'community_manager')
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'community_manager')
  )
);

-- Policy: Organization admins can delete tournaments
CREATE POLICY "Org admins can delete tournaments"
ON tournaments
FOR DELETE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'community_manager')
  )
);

-- ============================================
-- 4. APPLICATIONS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Public can create applications" ON applications;
DROP POLICY IF EXISTS "Org members can view applications" ON applications;
DROP POLICY IF EXISTS "Org admins can manage applications" ON applications;

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit applications (public application forms)
CREATE POLICY "Public can create applications"
ON applications
FOR INSERT
WITH CHECK (true);

-- Policy: Organization members can view applications for their tournaments
CREATE POLICY "Org members can view applications"
ON applications
FOR SELECT
TO authenticated
USING (
  tournament_id IN (
    SELECT t.id 
    FROM tournaments t
    INNER JOIN users u ON u.organization_id = t.organization_id
    WHERE u.id = auth.uid()
  )
);

-- Policy: Organization admins can update applications
CREATE POLICY "Org admins can update applications"
ON applications
FOR UPDATE
TO authenticated
USING (
  tournament_id IN (
    SELECT t.id 
    FROM tournaments t
    INNER JOIN users u ON u.organization_id = t.organization_id
    WHERE u.id = auth.uid() 
    AND u.role IN ('admin', 'community_manager')
  )
)
WITH CHECK (
  tournament_id IN (
    SELECT t.id 
    FROM tournaments t
    INNER JOIN users u ON u.organization_id = t.organization_id
    WHERE u.id = auth.uid() 
    AND u.role IN ('admin', 'community_manager')
  )
);

-- Policy: Organization admins can delete applications
CREATE POLICY "Org admins can delete applications"
ON applications
FOR DELETE
TO authenticated
USING (
  tournament_id IN (
    SELECT t.id 
    FROM tournaments t
    INNER JOIN users u ON u.organization_id = t.organization_id
    WHERE u.id = auth.uid() 
    AND u.role IN ('admin', 'community_manager')
  )
);

-- ============================================
-- 5. LIVE STREAMS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view live streams" ON live_streams;
DROP POLICY IF EXISTS "Org members can manage live streams" ON live_streams;

ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view live streams (public data)
CREATE POLICY "Anyone can view live streams"
ON live_streams
FOR SELECT
USING (true);

-- Policy: Organization members can manage their streams
CREATE POLICY "Org members can manage live streams"
ON live_streams
FOR ALL
TO authenticated
USING (
  tournament_id IN (
    SELECT t.id 
    FROM tournaments t
    INNER JOIN users u ON u.organization_id = t.organization_id
    WHERE u.id = auth.uid()
  )
)
WITH CHECK (
  tournament_id IN (
    SELECT t.id 
    FROM tournaments t
    INNER JOIN users u ON u.organization_id = t.organization_id
    WHERE u.id = auth.uid()
  )
);

-- ============================================
-- 6. NOTIFICATIONS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- VERIFICATION
-- ============================================

-- Run this to verify all policies are in place:
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;