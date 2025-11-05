// Debug script for identifying the 500 error source
// Run this in the browser console after getting the 500 error

console.group('🔍 Dashboard Debug Info');

// Check if we're authenticated
const checkAuth = async () => {
  const { data: { session } } = await window.supabase.auth.getSession();
  console.log('Session exists:', !!session);
  if (session) {
    console.log('User ID:', session.user.id);
    console.log('User email:', session.user.email);
  }
  return session;
};

// Check user profile
const checkUserProfile = async (userId) => {
  const { data, error } = await window.supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('❌ User profile error:', error);
  } else {
    console.log('✅ User profile:', data);
  }
  return { data, error };
};

// Check organization
const checkOrganization = async (orgId) => {
  if (!orgId) {
    console.warn('⚠️ No organization ID provided');
    return null;
  }
  
  const { data, error } = await window.supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single();
  
  if (error) {
    console.error('❌ Organization error:', error);
  } else {
    console.log('✅ Organization:', data);
  }
  return { data, error };
};

// Check tournaments
const checkTournaments = async (orgId) => {
  if (!orgId) {
    console.warn('⚠️ No organization ID for tournaments check');
    return null;
  }
  
  const { data, error } = await window.supabase
    .from('tournaments')
    .select('*')
    .eq('organization_id', orgId);
  
  if (error) {
    console.error('❌ Tournaments error:', error);
  } else {
    console.log('✅ Tournaments count:', data?.length || 0);
  }
  return { data, error };
};

// Check applications with organization filter
const checkApplications = async (orgId) => {
  if (!orgId) {
    console.warn('⚠️ No organization ID for applications check');
    return null;
  }
  
  // Try the inner join query that might be failing
  const { data, error } = await window.supabase
    .from('applications')
    .select('*, tournament:tournaments!inner(*)')
    .eq('tournament.organization_id', orgId);
  
  if (error) {
    console.error('❌ Applications error:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Applications count:', data?.length || 0);
  }
  return { data, error };
};

// Check application stats
const checkStats = async (orgId) => {
  if (!orgId) {
    console.warn('⚠️ No organization ID for stats check');
    return null;
  }
  
  // Test the exact query from getStats
  const { data, error, count } = await window.supabase
    .from('applications')
    .select('status, tournament:tournaments!inner(organization_id)', { count: 'exact' })
    .eq('tournament.organization_id', orgId);
  
  if (error) {
    console.error('❌ Stats query error:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Stats query count:', count);
  }
  return { data, error, count };
};

// Run all checks
const runDiagnostics = async () => {
  try {
    console.log('Starting diagnostics...\n');
    
    // 1. Check authentication
    const session = await checkAuth();
    if (!session) {
      console.error('🛑 Not authenticated - this is the problem!');
      return;
    }
    
    // 2. Check user profile
    const { data: userProfile, error: userError } = await checkUserProfile(session.user.id);
    if (userError) {
      console.error('🛑 User profile issue - this might be the problem!');
      return;
    }
    
    // 3. Check organization
    const orgId = userProfile?.organization_id;
    if (!orgId) {
      console.error('🛑 User has no organization - this is likely the problem!');
    } else {
      await checkOrganization(orgId);
      
      // 4. Check tournaments
      await checkTournaments(orgId);
      
      // 5. Check applications
      await checkApplications(orgId);
      
      // 6. Check stats query
      await checkStats(orgId);
    }
    
    console.log('\n✨ Diagnostics complete!');
    
  } catch (error) {
    console.error('Unexpected error during diagnostics:', error);
  }
};

// Auto-run
runDiagnostics();

console.groupEnd();

// Export for manual use
window.dashboardDebug = {
  checkAuth,
  checkUserProfile,
  checkOrganization,
  checkTournaments,
  checkApplications,
  checkStats,
  runDiagnostics
};

console.log('💡 Debug functions available at window.dashboardDebug');
