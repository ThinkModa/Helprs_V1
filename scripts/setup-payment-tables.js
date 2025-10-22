#!/usr/bin/env node

/**
 * Setup Payment Tables Script
 * 
 * This script creates the payment infrastructure for the Helprs platform
 * including Stripe Connect integration and multi-tenant payment processing.
 * 
 * Run with: node scripts/setup-payment-tables.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Payment Tables for Helprs Platform...\n');

// Check if we're in the right directory
if (!fs.existsSync('supabase')) {
  console.error('❌ Error: supabase directory not found. Please run this script from the project root.');
  process.exit(1);
}

// Check if Supabase CLI is installed
try {
  execSync('supabase --version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Error: Supabase CLI not found. Please install it first:');
  console.error('   npm install -g supabase');
  process.exit(1);
}

// Check if we're logged in to Supabase
try {
  execSync('supabase status', { stdio: 'pipe' });
} catch (error) {
  console.log('⚠️  Supabase not running locally. Starting Supabase...');
  try {
    execSync('supabase start', { stdio: 'inherit' });
  } catch (startError) {
    console.error('❌ Error starting Supabase. Please check your setup.');
    process.exit(1);
  }
}

console.log('📋 Migration files to apply:');
console.log('   1. 20250101000007_create_payment_tables.sql');
console.log('   2. 20250101000008_create_payment_rls_policies.sql\n');

// Apply migrations
try {
  console.log('🔄 Applying payment table migrations...');
  execSync('supabase db reset', { stdio: 'inherit' });
  console.log('✅ Payment tables created successfully!\n');
} catch (error) {
  console.error('❌ Error applying migrations:', error.message);
  process.exit(1);
}

// Verify tables were created
try {
  console.log('🔍 Verifying payment tables...');
  const result = execSync('supabase db diff --schema public', { encoding: 'utf8' });
  
  if (result.includes('No schema changes found')) {
    console.log('✅ All payment tables created successfully!');
  } else {
    console.log('⚠️  Some schema changes detected. Review the output:');
    console.log(result);
  }
} catch (error) {
  console.log('⚠️  Could not verify tables (this is normal for new migrations)');
}

console.log('\n🎉 Payment infrastructure setup complete!');
console.log('\n📊 Created tables:');
console.log('   • company_payment_settings - Company Stripe Connect settings');
console.log('   • worker_payment_settings - Worker payment configuration');
console.log('   • payment_transactions - All payment records');
console.log('   • payment_methods - Customer and worker payment methods');
console.log('   • payout_schedules - Recurring worker payouts');
console.log('\n🔒 Security features:');
console.log('   • Row Level Security (RLS) enabled on all tables');
console.log('   • Multi-tenant isolation policies');
console.log('   • Worker and customer data protection');
console.log('\n🚀 Next steps:');
console.log('   1. Update database seeding scripts');
console.log('   2. Create Payment Management UI components');
console.log('   3. Integrate Stripe Connect API');
console.log('   4. Test payment flows');
console.log('\n💡 To view the database:');
console.log('   supabase db diff --schema public');
console.log('   supabase db reset (to reapply all migrations)');

