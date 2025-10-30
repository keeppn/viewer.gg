-- Enable RLS (Row Level Security) on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own record
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can insert their own record on first login
CREATE POLICY "Users can create own profile"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own record
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = id);

-- Policy: Allow authenticated users to read organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view organizations"
ON organizations
FOR SELECT
TO authenticated
USING (true);
