# Setting Up Separate Databases for Development and Testing

## Current Status

**Issue**: Supabase CLI doesn't easily support running two separate local instances with different ports from the same workspace. Both directories are treated as the same project.

**Current Workaround**: Testing environment is temporarily using the same Supabase instance as development (port 54321) so both environments work.

## Solutions for Separate Databases

### Option 1: Use Same Instance Initially (Current)

✅ **Pros**: Works immediately, easy to compare
❌ **Cons**: Same database, not truly isolated

**Status**: Currently configured - both environments use port 54321

### Option 2: Use Docker Compose Directly (Recommended for True Separation)

This requires creating a separate `docker-compose.yml` for the testing instance with different ports.

**Steps**:
1. Create `supabase-testing/docker-compose.yml`
2. Configure different ports (54331, 54332, 54333, etc.)
3. Use Docker Compose directly instead of Supabase CLI
4. Update `.env.test.local` with the new ports and keys

### Option 3: Cloud Supabase Projects

Create separate Supabase cloud projects:
- Development: Local Supabase (port 54321)
- Testing: Cloud Supabase project (separate URL)

This provides true isolation but requires cloud setup.

### Option 4: Database Dumps and Restores

1. Export development database: `supabase db dump > dev_backup.sql`
2. Create fresh testing instance
3. Import backup: `psql < dev_backup.sql` (to testing DB)
4. They'll have same schema/data but can diverge

## Migration Strategy

Once you have separate databases, you'll need to migrate:

### 1. Database Schema
- Tables, functions, triggers, policies
- Run migrations on both databases

### 2. Seed Data
- Quick access accounts (super admin, etc.)
- Initial company data
- Feature flags configuration

### 3. Auth Users
- User accounts from development (if needed)
- Password hashes need to be handled carefully

## Next Steps

**What I Need From You**:

1. **Priority**: Do you want separate databases NOW, or can we compare features first using the same database?

2. **Migration Scope**: What should be migrated to testing?
   - ✅ Database schema (tables, migrations)
   - ✅ Quick access accounts
   - ✅ Feature flags
   - ❓ User accounts from development?
   - ❓ Test company data?
   - ❓ Other seed data?

3. **Preferred Approach**:
   - Option A: Use same DB now, separate later (fastest)
   - Option B: Set up Docker Compose for true separation (more work)
   - Option C: Use cloud Supabase for testing (requires account)

## Current Configuration

**Development**:
- Port: 3000
- Supabase: http://127.0.0.1:54321
- Env: `.env.development.local` (or `.env.local`)

**Testing**:
- Port: 3001
- Supabase: http://127.0.0.1:54321 (same as dev - temporary)
- Env: `.env.test.local`

Both should now work with the same database so you can compare features!

