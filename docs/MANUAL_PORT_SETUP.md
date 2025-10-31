# Manual Port Setup for Testing Instance

## The Problem

Supabase CLI v2.39.2 is **not respecting** the port configuration in `config.toml`. Even though we set:
- API port: 54331
- DB port: 54332

The CLI still tries to use default ports (54321, 54322).

## Solution: Manual Docker Container Port Mapping

Since Supabase CLI manages containers internally, we need to manually modify the Docker container ports after creation, or use Docker directly.

### Option 1: Use Docker Port Mapping (Quick Fix)

After Supabase CLI creates the containers, manually remap the ports:

```bash
# Stop the container
docker stop supabase_kong_Helprs_V1_Testing
docker rm supabase_kong_Helprs_V1_Testing

# Recreate with correct port mapping
docker run -d \
  --name supabase_kong_Helprs_V1_Testing \
  --network supabase_network_supabase-testing \
  -p 54331:8000 \
  # ... (other Supabase services need similar treatment)
```

**Complexity**: High - Need to recreate all 12+ containers

### Option 2: Update Supabase CLI (Recommended)

The newer Supabase CLI (v2.54.11) may handle this better:

```bash
brew upgrade supabase/tap/supabase
```

Then try starting again with `--workdir` flag.

### Option 3: Use Same Instance with Code-Level Isolation (Current)

For now, both environments use the same Supabase instance (port 54321), but:
- ✅ Code changes are isolated (different branches)
- ✅ Can compare features side-by-side
- ⚠️ Database changes affect both (but this is acceptable for comparison phase)

### Option 4: Use Cloud Supabase for Testing

Create a separate Supabase cloud project for testing:
- True isolation
- No port conflicts
- Requires cloud setup

## Current Recommendation

1. **Short-term**: Use same instance (already working)
2. **Compare features** in both environments
3. **Decide what to remove** from testing
4. **Then**: Either update CLI or use cloud instance for true separation

## Next Steps

Once you've identified features to keep/remove:
- We can create migration scripts to set up testing database properly
- Or set up cloud Supabase for true isolation

