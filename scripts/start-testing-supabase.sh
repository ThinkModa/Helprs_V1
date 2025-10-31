#!/bin/bash

# Start Testing Supabase Instance
# Uses different ports (54331+) to run alongside development instance

echo "Starting Testing Supabase instance..."

# Navigate to project root
cd "$(dirname "$0")/.." || exit

# Create supabase-testing directory with migrations symlink if needed
if [ ! -d "supabase-testing/migrations" ]; then
  echo "Setting up testing Supabase directory..."
  mkdir -p supabase-testing/migrations
  # Link migrations from main supabase directory
  ln -sf ../supabase/migrations/* supabase-testing/migrations/ 2>/dev/null || true
fi

# Start Supabase using the testing config
# Note: Supabase CLI uses config.toml from current directory
cd supabase-testing || exit

supabase start

if [ $? -eq 0 ]; then
  cd ..
  echo ""
  echo "✅ Testing Supabase instance started!"
  echo ""
  echo "Connection details:"
  echo "  API URL: http://127.0.0.1:54331"
  echo "  Studio: http://127.0.0.1:54333"
  echo "  Database: postgresql://postgres:postgres@127.0.0.1:54332/postgres"
  echo ""
  echo "Get keys by running (from supabase-testing directory):"
  echo "  cd supabase-testing && supabase status"
  echo ""
  echo "Update your .env.testing.local with these values"
else
  cd ..
  echo "❌ Failed to start Testing Supabase instance"
  echo "Make sure development instance is stopped or using different ports"
  exit 1
fi

