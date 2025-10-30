-- FIX FOR INFINITE RECURSION IN RLS POLICIES
-- Run this in your Supabase SQL Editor

-- First, drop ALL existing policies on users and organizations
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Organization members can view their org" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can view organizations" ON organizations;

-- Create SIMPLE policies for users table (NO recursion)
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = id);

-- Create SIMPLE policy for organizations (NO user table reference)
CREATE POLICY "Authenticated users can view all organizations"
ON organizations
FOR SELECT
TO authenticated
USING (true);

-- Alternative: If you want organization members only to see their org,
-- use this instead (but requires service role or function):
-- CREATE POLICY "Users can view their organization"
-- ON organizations
-- FOR SELECT
-- USING (id = (SELECT organization_id FROM users WHERE id = auth.uid()));
-- ⚠️ This still causes recursion! Don't use it.

-- The safe way is to let authenticated users see all orgs,
-- or handle the filtering in your application code.
