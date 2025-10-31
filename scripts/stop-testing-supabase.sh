#!/bin/bash

# Stop Testing Supabase Instance

echo "Stopping Testing Supabase instance..."

# Navigate to project root
cd "$(dirname "$0")/.." || exit

# Stop Supabase using the testing config
cd supabase-testing || exit

supabase stop

cd ..

if [ $? -eq 0 ]; then
  echo "✅ Testing Supabase instance stopped"
else
  echo "⚠️  Testing instance may already be stopped"
fi

