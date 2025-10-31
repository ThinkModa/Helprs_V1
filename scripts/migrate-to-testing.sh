#!/bin/bash

# Migrate Database Schema from Development to Testing
# This script applies all migrations from development to testing instance

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔄 Migrating database schema to testing instance..."

# Check if testing Supabase is running
cd "$PROJECT_ROOT/supabase-testing"
if ! supabase status --workdir . > /dev/null 2>&1; then
  echo "❌ Testing Supabase is not running. Start it first:"
  echo "   cd supabase-testing && supabase start --workdir ."
  exit 1
fi

echo "✅ Testing instance is running"
echo ""
echo "📋 Applying migrations to testing database..."

# Push migrations to testing instance
supabase db push --workdir . --db-url "postgresql://postgres:postgres@127.0.0.1:54332/postgres"

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "  1. Seed testing database with necessary data (users, companies, etc.)"
echo "  2. Update .env.test.local with testing instance credentials"
echo "  3. Verify both instances can run simultaneously"

