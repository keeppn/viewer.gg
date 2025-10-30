-- ⚡ QUICK FIX: Run this in Supabase SQL Editor RIGHT NOW
-- This fixes the "infinite recursion detected in policy for relation 'users'" error

-- 1️⃣ DROP all conflicting policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Organization members can view their org" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can view organizations" ON organizations;

-- 2️⃣ CREATE simple policies (no recursion)
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view all organizations"
ON organizations FOR SELECT
TO authenticated
USING (true);

-- ✅ DONE! Now try Discord login again.
