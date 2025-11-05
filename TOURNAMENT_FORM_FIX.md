# Tournament Application Form URL Fix

## Issue
The public tournament application form URLs were returning 404 errors when accessed.

## Root Cause
There was a mismatch between the URL pattern generated in the UI and the actual Next.js route structure:

- **Generated URL Pattern**: `/tournaments/{tournamentId}/apply`
- **Actual Route Structure**: `/apply/{tournamentId}`

## Files Modified
1. **`web/src/components/tournaments/ManageTournamentForm.tsx`** (Line 21)
   - Changed from: `${window.location.origin}/tournaments/${tournament.id}/apply`
   - Changed to: `${window.location.origin}/apply/${tournament.id}`

## Solution Applied
Updated the URL generation logic in the ManageTournamentForm component to match the actual Next.js route structure.

## Verification
After the fix, the public form URLs should now follow this pattern:
- **Correct URL**: `https://app.viewer.gg/apply/{tournamentId}`
- **Example**: `https://app.viewer.gg/apply/374e89f1-5fd7-4015-8304-2aa87d246bd5`

## Next Steps
1. The development server has been restarted to reflect the changes
2. Test the new URL format by creating a tournament and accessing its public form
3. The form should now load correctly without 404 errors

## Additional Notes
- The application form page (`apply/[tournamentId]/page.tsx`) was already correctly implemented
- No other files were referencing the incorrect URL pattern
- No middleware or redirects were interfering with the routing
