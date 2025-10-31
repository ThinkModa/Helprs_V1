# Testing Supabase Instance - Port Configuration Issue

## Problem

Supabase CLI v2.39.2 is **not respecting** the port configuration in `supabase-testing/config.toml`. Even though we have:

```toml
[api]
port = 54331

[db]
port = 54332
```

The CLI keeps starting on default ports (54321, 54322).

## Current Workaround Options

### Option 1: Use Same Instance Temporarily (Quickest)

For now, both environments can use the same Supabase instance (port 54321). This works for:
- ✅ Comparing features side-by-side
- ✅ Code-level isolation (different branches)
- ❌ Database changes affect both (but this is acceptable for comparison phase)

**To do this:**
- Update `.env.test.local` to use port 54321 (same as development)
- Both apps will work immediately

### Option 2: Update Supabase CLI (Recommended Long-term)

```bash
brew upgrade supabase/tap/supabase
```

Newer versions (v2.54.11+) may handle port configuration better.

### Option 3: Manual Docker Port Mapping

Create a custom docker-compose.yml to override ports manually (complex, but gives full control).

## Current Recommendation

**Use Option 1 temporarily:**
1. Both environments use same Supabase instance
2. Compare features in both UIs
3. Decide what to remove from testing
4. Then set up true separation (update CLI or use cloud Supabase)

This gets you unblocked immediately while we work on true separation.

