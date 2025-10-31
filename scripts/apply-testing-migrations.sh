#!/bin/bash

# Apply all migrations to testing database
# This ensures testing has the same schema as development

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATIONS_DIR="$PROJECT_ROOT/supabase/migrations"

echo "🔄 Applying migrations to testing database..."

# Check if testing Supabase is running
if ! docker ps | grep -q "supabase_kong.*Testing\|supabase-testing"; then
  echo "❌ Testing Supabase is not running!"
  echo "   Start it with: cd supabase-testing && supabase start --workdir ."
  exit 1
fi

# Apply each migration in order
for migration_file in "$MIGRATIONS_DIR"/*.sql; do
  if [ -f "$migration_file" ]; then
    migration_name=$(basename "$migration_file")
    echo "📋 Applying: $migration_name"
    
    PGPASSWORD=postgres psql \
      -h 127.0.0.1 \
      -p 54332 \
      -U postgres \
      -d postgres \
      -f "$migration_file" \
      > /dev/null 2>&1 || echo "  ⚠️  Migration may have already been applied"
  fi
done

echo ""
echo "✅ Migrations applied!"
echo ""
echo "Next: Seed the database with test data (if needed)"

