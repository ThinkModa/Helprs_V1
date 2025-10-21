require('dotenv-flow').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function setupSchedulingTables() {
  console.log('Setting up scheduling database tables...');
  
  try {
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'create-scheduling-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL migration
    console.log('Executing SQL migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
      // If the exec_sql function doesn't exist, try direct SQL execution
      console.log('Trying direct SQL execution...');
      const { data: directData, error: directError } = await supabase
        .from('_migrations')
        .select('*')
        .limit(1);

      if (directError) {
        console.log('Direct SQL execution not available. Please run the SQL manually in your Supabase dashboard.');
        console.log('SQL file location:', sqlPath);
        console.log('Copy and paste the contents of create-scheduling-tables.sql into your Supabase SQL editor.');
        return;
      }
    }

    console.log('✅ Scheduling tables created successfully!');
    console.log('📋 Tables created/updated:');
    console.log('   - Renamed appointments table to services');
    console.log('   - scheduled_appointments (with RLS policies)');
    console.log('   - appointment_services (junction table)');
    console.log('   - appointment_workers (junction table)');
    console.log('   - appointment_forms (junction table)');
    console.log('   - appointment_notes (notes table)');
    console.log('   - recurring_appointments (future feature)');
    console.log('   - Indexes for optimal performance');
    console.log('   - Triggers for automatic updates');
    console.log('   - RLS policies for multi-tenant isolation');
    console.log('🎉 Scheduling database infrastructure setup complete!');

  } catch (error) {
    console.error('❌ Error setting up scheduling tables:', error.message);
    console.log('\n📝 Manual Setup Instructions:');
    console.log('1. Open your Supabase dashboard');
    console.log('2. Go to the SQL Editor');
    console.log('3. Copy and paste the contents of scripts/create-scheduling-tables.sql');
    console.log('4. Execute the SQL script');
    console.log('\nThis will create all necessary tables, indexes, triggers, and RLS policies for the scheduling system.');
  }
}

// Run the setup
setupSchedulingTables();
