-- Fix Discord configs RLS policies to use correct organization relationship
-- The organizations table has NO owner_id field
-- Correct relationship: users.organization_id -> organizations.id

-- Drop old incorrect policies
DROP POLICY IF EXISTS "Organizers can view their organization's Discord config" ON discord_configs;
DROP POLICY IF EXISTS "Organizers can insert their organization's Discord config" ON discord_configs;
DROP POLICY IF EXISTS "Organizers can update their organization's Discord config" ON discord_configs;
DROP POLICY IF EXISTS "Organizers can delete their organization's Discord config" ON discord_configs;

-- Create corrected policies using proper relationship
CREATE POLICY "Organizers can view their organization's Discord config"
  ON discord_configs
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organizers can insert their organization's Discord config"
  ON discord_configs
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organizers can update their organization's Discord config"
  ON discord_configs
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organizers can delete their organization's Discord config"
  ON discord_configs
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Add comment explaining the fix
COMMENT ON POLICY "Organizers can view their organization's Discord config" ON discord_configs IS
  'Fixed to use users.organization_id instead of non-existent organizations.owner_id';
