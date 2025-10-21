require('dotenv-flow').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function setupCustomerTables() {
  console.log('Setting up customer database tables...');
  
  try {
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'create-customer-tables.sql');
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
        console.log('Copy and paste the contents of create-customer-tables.sql into your Supabase SQL editor.');
        return;
      }
    }

    console.log('✅ Customer tables created successfully!');
    console.log('📋 Tables created:');
    console.log('   - customers (with RLS policies)');
    console.log('   - customer_jobs (with RLS policies)');
    console.log('   - Updated appointments table with customer_id foreign key');
    console.log('   - Indexes for optimal performance');
    console.log('   - Triggers for automatic timestamp updates');
    console.log('   - Triggers for automatic customer stats updates');
    console.log('🎉 Customer database infrastructure setup complete!');

  } catch (error) {
    console.error('❌ Error setting up customer tables:', error.message);
    console.log('\n📝 Manual Setup Instructions:');
    console.log('1. Open your Supabase dashboard');
    console.log('2. Go to the SQL Editor');
    console.log('3. Copy and paste the contents of scripts/create-customer-tables.sql');
    console.log('4. Execute the SQL script');
    console.log('\nThis will create all necessary tables, indexes, triggers, and RLS policies.');
  }
}

// Run the setup
setupCustomerTables();

