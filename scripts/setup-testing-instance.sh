#!/bin/bash

# Setup Standalone Testing Supabase Instance
# This script ensures the testing instance is properly configured
# and can run alongside development

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TESTING_DIR="$PROJECT_ROOT/supabase-testing"

echo "🔧 Setting up Testing Supabase Instance..."

# Ensure testing directory exists
mkdir -p "$TESTING_DIR/migrations"

# Copy migrations
echo "📋 Copying migrations..."
cp -f "$PROJECT_ROOT/supabase/migrations"/*.sql "$TESTING_DIR/migrations/" 2>/dev/null || true

# Copy seed file if exists
if [ -f "$PROJECT_ROOT/supabase/seed.sql" ]; then
  cp -f "$PROJECT_ROOT/supabase/seed.sql "$TESTING_DIR/" 2>/dev/null || true
fi

# Ensure config.toml has correct project_id
if [ -f "$TESTING_DIR/config.toml" ]; then
  # Verify project_id is set correctly
  if ! grep -q 'project_id = "Helprs_V1_Testing"' "$TESTING_DIR/config.toml"; then
    echo "⚠️  Warning: config.toml project_id may not be set correctly"
  fi
fi

echo "✅ Testing instance setup complete!"
echo ""
echo "To start testing instance:"
echo "  cd supabase-testing && supabase start --workdir ."
echo ""
echo "To stop:"
echo "  cd supabase-testing && supabase stop --workdir ."

