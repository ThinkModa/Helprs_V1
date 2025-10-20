#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Development Environment Reset');
console.log('================================');

try {
  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found. Please ensure Supabase is configured.');
    process.exit(1);
  }

  console.log('1️⃣  Resetting Supabase database...');
  execSync('supabase db reset', { stdio: 'inherit' });

  console.log('\n2️⃣  Seeding test data...');
  execSync('npm run seed', { stdio: 'inherit' });

  console.log('\n✅ Development environment reset complete!');
  console.log('\n📋 Quick Access Accounts:');
  console.log('👑 Super Admin: admin@helprs.com / admin123');
  console.log('🏠 The Home Team: admin@thehometeam.com / hometeam123');
  console.log('🚛 Primetime Moving: admin@primetimemoving.com / primetime123');
  console.log('\n🚀 You can now start the development server with: npm run dev');

} catch (error) {
  console.error('❌ Error during reset:', error.message);
  process.exit(1);
}
