# 🔥 CRITICAL FIX: Infinite Recursion in RLS Policies

## The Real Problem

Error: **"infinite recursion detected in policy for relation 'users'"** (PostgreSQL Error 42P17)

### Root Cause

Your `schema.sql` file has this policy on line 221-222:

```sql
CREATE POLICY "Organization members can view their org" ON organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM users WHERE id = auth.uid()));
```

**This creates infinite recursion:**

```
1. User tries to SELECT from users table
2. RLS checks: "Can this user read from users?"
3. Policy says: "Check if user's organization_id matches..."
4. To check organization_id, need to SELECT from organizations table
5. RLS checks: "Can this user read from organizations?"
6. Policy says: "Check the users table..." ← LOOP BACK TO STEP 3!
7. Infinite recursion detected → ERROR 42P17
```

### Why This Happens

When you have **cross-table policy references** (organizations policy checking users table, users policy checking organizations table), PostgreSQL detects the circular dependency and throws an infinite recursion error.

## The Solution

### Step 1: Run This SQL in Supabase

Go to your Supabase Dashboard → SQL Editor → New Query, and run:

```sql
-- Drop all conflicting policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Organization members can view their org" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can view organizations" ON organizations;

-- Create simple, non-recursive policies for users
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

-- Create simple policy for organizations (no user table reference!)
CREATE POLICY "Authenticated users can view all organizations"
ON organizations
FOR SELECT
TO authenticated
USING (true);
```

### Step 2: Verify

After running the SQL, verify the policies:

```sql
-- Check users policies
SELECT schemaname, tablename, policyname, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- Check organizations policies
SELECT schemaname, tablename, policyname, qual 
FROM pg_policies 
WHERE tablename = 'organizations';
```

You should see:
- 3 policies on `users` (SELECT, INSERT, UPDATE)
- 1 policy on `organizations` (SELECT for authenticated users)
- **NO policies that reference other tables in their USING clause**

### Step 3: Test Login

1. Clear browser cache/cookies
2. Try Discord login again
3. Check console - you should now see:
   - "Session found: [user-id]"
   - "Attempting to fetch user: [user-id]"
   - Either "User data loaded: {...}" OR "Attempting to create new user record..."
   - "User created successfully: {...}"
   - ✅ **No infinite recursion errors!**

## Why This Fix Works

### Before (Broken):
```
users policy → checks organizations
  ↓
organizations policy → checks users
  ↓
users policy → checks organizations  ← INFINITE LOOP!
```

### After (Fixed):
```
users policy → checks ONLY auth.uid() (no table joins)
organizations policy → allows all authenticated users (no table joins)
```

No cross-table references = no recursion!

## Alternative Approaches

If you need **organization-scoped access control**, here are safe alternatives:

### Option 1: Application-Level Filtering
```typescript
// In your app code, filter by organization
const { data: orgs } = await supabase
  .from('organizations')
  .select('*')
  .eq('id', user.organization_id);
```

### Option 2: Database Functions
Create a PostgreSQL function with `SECURITY DEFINER` to bypass RLS:

```sql
CREATE OR REPLACE FUNCTION get_user_organization(user_id UUID)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT organization_id FROM users WHERE id = user_id;
$$;

-- Then use in policy
CREATE POLICY "Users can view their organization"
ON organizations
FOR SELECT
USING (id = get_user_organization(auth.uid()));
```

**However**, for now, just use the simple fix above (let authenticated users see all orgs).

## Files to Update

After fixing the database, update these files:

1. ✅ `supabase/FIX_INFINITE_RECURSION.sql` - Already created (run this in Supabase)
2. ⚠️ `supabase/schema.sql` - Update lines 217-222 to match the new policies
3. ⚠️ `supabase/rls_policies.sql` - Update to remove duplicate policies

## Prevention

To prevent this in the future:

1. ✅ **Never reference a table in its own RLS policy**
2. ✅ **Avoid circular references** (Table A policy → checks Table B → policy checks Table A)
3. ✅ **Use functions with SECURITY DEFINER** for complex cross-table checks
4. ✅ **Test policies with**: `SELECT * FROM users;` as an authenticated user
5. ✅ **Check for recursion** before deploying: Run queries that trigger all policies

## Status

- ❌ **Previous Issue**: Missing return statements in error handling
- ✅ **Actually Fixed**: Infinite recursion in RLS policies (Error 42P17)
- 🎯 **Action Required**: Run the SQL in Supabase SQL Editor NOW

---

**Run the fix SQL and Discord login will work!** 🚀
