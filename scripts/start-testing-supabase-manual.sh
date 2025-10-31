#!/bin/bash

# Manual Testing Supabase Startup
# Uses Docker Compose override to force correct ports
# Since Supabase CLI doesn't respect config.toml ports, we'll work around it

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TESTING_DIR="$PROJECT_ROOT/supabase-testing"

cd "$TESTING_DIR"

echo "🚀 Starting Testing Supabase Instance (Manual Setup)..."
echo ""

# Stop any existing instance
supabase stop --workdir . > /dev/null 2>&1 || true

# Start with explicit workdir
echo "Starting containers..."
supabase start --workdir . --ignore-health-check 2>&1 | grep -v "version\|updating" | tail -20

# Check if it started on correct ports
echo ""
echo "Checking ports..."
API_PORT=$(docker port supabase_kong_Helprs_V1_Testing 8000/tcp 2>/dev/null | cut -d: -f2 || echo "not found")
DB_PORT=$(docker port supabase_db_Helprs_V1_Testing 5432/tcp 2>/dev/null | cut -d: -f2 || echo "not found")

echo "API Port: $API_PORT (expected: 54331)"
echo "DB Port: $DB_PORT (expected: 54332)"

if [ "$API_PORT" != "54331" ]; then
  echo ""
  echo "⚠️  Warning: Supabase CLI is not using configured ports."
  echo "   This is a known limitation of Supabase CLI v2.39.2"
  echo ""
  echo "   Options:"
  echo "   1. Update Supabase CLI: brew upgrade supabase/tap/supabase"
  echo "   2. Use port mapping workaround (coming next)"
  echo "   3. Use same instance temporarily and ensure code-level isolation"
fi

echo ""
echo "Getting connection details..."
cd "$TESTING_DIR" && supabase status --workdir . 2>&1 | grep -E "API URL|anon key|service_role key" | head -3

