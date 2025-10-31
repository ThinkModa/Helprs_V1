# Side-by-Side Comparison Workflow

## ✅ Capability Confirmed

You **can** compare Development and Testing versions simultaneously:

1. **Both Supabase instances** run on different ports (54321 vs 54331)
2. **Both Next.js apps** run on different ports (3000 vs 3001)
3. **Side-by-side comparison** is enabled via `npm run dev:compare`

---

## Quick Start

### Option 1: Automated (Recommended)
```bash
./scripts/compare-environments.sh
```

This will:
- ✅ Start both Supabase instances (if not running)
- ✅ Launch both Next.js servers simultaneously
- ✅ Open both in your browser automatically (if configured)

### Option 2: Manual
```bash
# Terminal 1: Start Development
NODE_ENV=development npm run dev:development
# Opens on http://localhost:3000

# Terminal 2: Start Testing
NODE_ENV=testing npm run dev:testing
# Opens on http://localhost:3001
```

---

## What You Can Do

### 1. Visual Comparison
- Open http://localhost:3000 (Development) in one browser tab
- Open http://localhost:3001 (Testing) in another browser tab
- Navigate to the same pages and compare

### 2. Feature Inventory
- List all pages/features in Development
- Check which ones exist in Testing
- Decide: Keep, Remove, or Modify

### 3. Functionality Check
- Test each feature in Development
- Verify same feature works in Testing (if it should)
- Document any differences

### 4. Decision Documentation
- Use `FEATURE_COMPARISON.md` to document decisions
- Mark features as: ✅ Keep in Testing | 🚧 Keep in Dev | 🔄 Modify | ❌ Remove

---

## What's Already Configured

✅ **Separate Supabase Instances**
- Development: Port 54321
- Testing: Port 54331
- Both can run simultaneously

✅ **Environment Files**
- `.env.development.local` (Development config)
- `.env.testing.local` (Testing config)
- Next.js automatically loads based on `NODE_ENV`

✅ **Port Configuration**
- Development app: Port 3000
- Testing app: Port 3001
- No conflicts

✅ **Helper Scripts**
- `./scripts/compare-environments.sh` - Start both
- `./scripts/start-testing-supabase.sh` - Start testing DB
- `./scripts/stop-testing-supabase.sh` - Stop testing DB

---

## Communication Template

After comparison, communicate decisions like this:

### Features to Keep in Testing:
- ✅ Scheduling (Tier 1)
- ✅ Worker Self-Scheduling (Tier 1)
- ✅ Feature Flags Management (Admin)
- ✅ Activation Wizard (Admin)
- [Add more...]

### Features to Keep ONLY in Development:
- 🚧 Reports/Analytics (scaffolded, not wired)
- 🚧 Insights Chat (scaffolded, mock data)
- 🚧 [Add experimental features...]

### Features to Modify Before Testing:
- 🔄 Payment Management (needs Stripe integration completion)
- 🔄 Direct Communication (needs WebSocket setup)
- [Add features needing work...]

---

## Example Comparison Session

1. **Start comparison:**
   ```bash
   ./scripts/compare-environments.sh
   ```

2. **Open both URLs:**
   - http://localhost:3000 (Development)
   - http://localhost:3001 (Testing)

3. **Navigate to "Feature Flags" page on both:**
   - Development: Shows Live + Demo tabs (everything)
   - Testing: Should show only Live tab (production-ready flags)

4. **Navigate to "Reports" page:**
   - Development: Has Reports page (scaffolded)
   - Testing: Should have Reports? (Decision: Keep/Remove)

5. **Document decision in `FEATURE_COMPARISON.md`**

6. **Make changes to Testing branch:**
   - Remove unwanted features
   - Ensure kept features are wired to DB

---

## Troubleshooting

**"Port 3000 or 3001 already in use"**
- Stop the conflicting server
- Or kill the process: `lsof -ti:3000 | xargs kill`

**"Supabase not connecting"**
- Check if both instances are running: `docker ps | grep supabase`
- Verify environment files have correct URLs/keys

**"Environment not loading"**
- Ensure `.env.development.local` and `.env.testing.local` exist
- Check `NODE_ENV` matches the script you're running
- Restart Next.js server after changing `.env` files

---

**You're all set!** Run `./scripts/compare-environments.sh` to start comparing. 🚀

