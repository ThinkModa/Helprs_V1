#!/bin/bash

# Compare Development vs Testing Environments
# This script starts both Supabase instances and Next.js servers side-by-side

echo "🔄 Starting Comparison Mode..."
echo ""
echo "This will start:"
echo "  • Development Supabase (port 54321) → App on http://localhost:3000"
echo "  • Testing Supabase (port 54331) → App on http://localhost:3001"
echo ""
echo "⚠️  Make sure you have:"
echo "    • .env.development.local (for development)"
echo "    • .env.test.local (for testing - note: .test.local, not .testing.local)"
echo ""

# Check if development Supabase is running
if ! docker ps | grep -q "supabase.*Helprs_V1[^T]"; then
  echo "📦 Starting Development Supabase..."
  supabase start > /dev/null 2>&1
  sleep 3
fi

# Check if testing Supabase is running
if ! docker ps | grep -q "supabase.*Helprs_V1_Testing"; then
  echo "📦 Starting Testing Supabase..."
  cd supabase-testing 2>/dev/null && supabase start > /dev/null 2>&1 && cd .. || echo "⚠️  Could not start testing Supabase - run ./scripts/start-testing-supabase.sh manually"
  sleep 3
fi

echo ""
echo "✅ Both Supabase instances should be running"
echo ""
echo "🌐 Opening comparison windows..."
echo "  Development: http://localhost:3000 (all features + demos)"
echo "  Testing:     http://localhost:3001 (curated release features)"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Run both Next.js servers concurrently
npm run dev:compare

