-- Fix Existing Users - Create Organizations and Update Records
-- Run this in Supabase SQL Editor to fix users that don't have organizations
-- Date: November 3, 2025

-- ============================================
-- STEP 1: Create organizations for users who don't have one
-- ============================================

-- For each user without an organization, create one and link it
DO $$
DECLARE
    user_record RECORD;
    new_org_id UUID;
BEGIN
    -- Loop through users without organizations
    FOR user_record IN
        SELECT id, name, email, avatar_url
        FROM users
        WHERE organization_id IS NULL
    LOOP
        -- Create organization for this user
        INSERT INTO organizations (name, logo_url)
        VALUES (
            user_record.name || '''s Organization',
            user_record.avatar_url
        )
        RETURNING id INTO new_org_id;

        -- Update user with organization_id
        UPDATE users
        SET organization_id = new_org_id
        WHERE id = user_record.id;

        RAISE NOTICE 'Created organization % for user %', new_org_id, user_record.email;
    END LOOP;
END $$;

-- ============================================
-- STEP 2: Fix oauth_provider for users where it's null
-- ============================================

-- Update oauth_provider based on email domain or set to 'discord' as default
UPDATE users
SET oauth_provider = CASE
    WHEN email LIKE '%@gmail.com' THEN 'google'
    ELSE 'discord'
END
WHERE oauth_provider IS NULL;

-- ============================================
-- STEP 3: Verification queries
-- ============================================

-- Check all users now have organizations
SELECT
    id,
    name,
    email,
    oauth_provider,
    organization_id,
    CASE
        WHEN organization_id IS NULL THEN '❌ MISSING'
        ELSE '✅ HAS ORG'
    END as org_status
FROM users
ORDER BY created_at DESC;

-- Check organizations
SELECT
    o.id,
    o.name,
    COUNT(u.id) as user_count
FROM organizations o
LEFT JOIN users u ON u.organization_id = o.id
GROUP BY o.id, o.name
ORDER BY o.created_at DESC;

-- Summary
SELECT
    'Total Users' as metric,
    COUNT(*) as count
FROM users
UNION ALL
SELECT
    'Users with Organizations' as metric,
    COUNT(*) as count
FROM users
WHERE organization_id IS NOT NULL
UNION ALL
SELECT
    'Users without Organizations' as metric,
    COUNT(*) as count
FROM users
WHERE organization_id IS NULL
UNION ALL
SELECT
    'Total Organizations' as metric,
    COUNT(*) as count
FROM organizations;
