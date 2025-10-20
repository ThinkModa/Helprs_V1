#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Helprs Workforce Management Platform...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env.local from env.example');
    console.log('⚠️  Please update .env.local with your Supabase credentials\n');
  } else {
    console.log('❌ env.example not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env.local already exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully\n');
  } catch (error) {
    console.log('❌ Failed to install dependencies');
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed\n');
}

console.log('🎉 Setup complete! Next steps:');
console.log('');
console.log('1. Update .env.local with your Supabase credentials');
console.log('2. Run the SQL schema in your Supabase project:');
console.log('   - Go to Supabase Dashboard > SQL Editor');
console.log('   - Copy and run the contents of supabase-schema.sql');
console.log('3. Configure Supabase Auth settings:');
console.log('   - Site URL: http://localhost:3000');
console.log('   - Redirect URLs: http://localhost:3000/auth/callback, http://localhost:3000/reset-password');
console.log('4. Start the development server:');
console.log('   npm run dev');
console.log('');
console.log('📚 For detailed instructions, see README.md');
