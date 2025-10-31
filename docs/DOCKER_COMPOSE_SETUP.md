# Docker Compose Setup for Testing Instance

## Current Issue

Supabase CLI (v2.39.2) is not respecting the port configuration in `config.toml` when running from a subdirectory. The testing instance keeps defaulting to port 54321 instead of the configured 54331.

## Solution Options

### Option A: Manual Docker Compose Override (Complex)
Create a full `docker-compose.yml` file with all Supabase services configured with custom ports. This requires:
- Defining all 12+ Supabase services manually
- Proper networking configuration
- Volume management
- Environment variables

**Complexity**: High - Would need to replicate Supabase's entire Docker setup

### Option B: Use Supabase Branching (Recommended for Production)
Use Supabase's cloud branching feature to create separate cloud instances:
- Development: Local Supabase
- Testing: Cloud Supabase branch
- True isolation, but requires cloud setup

### Option C: Separate Schema Approach (Current Workaround)
Use the same Docker instance but separate schemas or databases:
- Same Supabase container
- Different database names or schemas
- Requires application-level separation

### Option D: Wait for CLI Update
Supabase CLI v2.54.11 is available and may have better support for multiple instances. Update might fix the port configuration issue.

## Recommended Next Steps

1. **Short-term**: Use same Supabase instance temporarily (already configured)
2. **Verify isolation at application level**: Ensure code changes in testing branch don't affect development
3. **Test migration strategy**: Set up process to migrate schema/data to separate instance when ready
4. **Long-term**: Either:
   - Update Supabase CLI and retry
   - Use cloud Supabase for testing branch
   - Create manual docker-compose (if absolutely necessary)

## Current Status

- ✅ Development: Port 54321 (working)
- ❌ Testing: Port 54331 (CLI not respecting config)
- ✅ Both apps: Port 3000 (dev) and 3001 (testing) - working
- ⚠️ **Both using same database temporarily** - need to ensure code-level isolation

