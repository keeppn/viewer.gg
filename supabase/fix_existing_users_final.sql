-- ============================================
-- MIGRATION: Fix Existing Users Without Organizations
-- ============================================
-- Run this AFTER applying rls_policies_improved.sql
-- This ensures all existing users have organizations

-- Step 1: Create organizations for users without one
DO $$
DECLARE
  user_record RECORD;
  new_org_id UUID;
  org_count INTEGER := 0;
BEGIN
  -- Find all users without organizations
  FOR user_record IN 
    SELECT id, name, email, avatar_url 
    FROM users 
    WHERE organization_id IS NULL
  LOOP
    -- Create a new organization for this user
    INSERT INTO organizations (name, logo_url)
    VALUES (
      COALESCE(user_record.name, SPLIT_PART(user_record.email, '@', 1)) || '''s Organization',
      user_record.avatar_url
    )
    RETURNING id INTO new_org_id;
    
    -- Link the organization to the user
    UPDATE users 
    SET organization_id = new_org_id,
        updated_at = NOW()
    WHERE id = user_record.id;
    
    org_count := org_count + 1;
    
    RAISE NOTICE 'Created organization % for user % (%)', 
      new_org_id, 
      user_record.id, 
      user_record.email;
  END LOOP;
  
  RAISE NOTICE 'Migration complete: Created % organizations', org_count;
END $$;

-- Step 2: Verify all users now have organizations
SELECT 
  COUNT(*) as total_users,
  COUNT(organization_id) as users_with_org,
  COUNT(*) - COUNT(organization_id) as users_without_org
FROM users;

-- Step 3: Show user-organization mapping
SELECT 
  u.id as user_id,
  u.email,
  u.name as user_name,
  u.role,
  o.id as org_id,
  o.name as org_name,
  u.created_at as user_created,
  o.created_at as org_created
FROM users u
LEFT JOIN organizations o ON o.id = u.organization_id
ORDER BY u.created_at DESC;

-- Step 4: Verify RLS policies are working
-- This should only show the current user's organization
SELECT * FROM organizations WHERE id IN (
  SELECT organization_id FROM users WHERE id = auth.uid()
);
