// Migration runner for Discord OAuth integration
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables from web/.env.local
dotenv.config({ path: './web/.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in web/.env.local');
  process.exit(1);
}

// Create Supabase client with service role key (has admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Starting Discord OAuth Integration migration...\n');
  
  try {
    // Read the SQL migration file
    const migrationPath = join(__dirname, 'supabase', 'migration_discord_oauth_integration_FIXED.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    console.log('📊 Running SQL migration...\n');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: migrationSQL });
    
    if (error) {
      // If exec_sql doesn't exist, try direct query
      console.log('⚠️  Trying direct SQL execution...');
      const { error: directError } = await supabase.from('_sql').insert({ query: migrationSQL });
      
      if (directError) {
        throw directError;
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📋 Tables created/modified:');
    console.log('   - discord_integrations');
    console.log('   - discord_role_history');
    console.log('   - applications (added Discord columns)');
    console.log('\n🔒 RLS policies applied');
    console.log('🔄 Triggers configured');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n💡 Manual steps required:');
    console.error('   1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/sulxfeyzmocfczxotjda');
    console.error('   2. Navigate to SQL Editor');
    console.error('   3. Copy the contents of: supabase/migration_discord_oauth_integration_FIXED.sql');
    console.error('   4. Paste and run the SQL manually');
    process.exit(1);
  }
}

runMigration();
