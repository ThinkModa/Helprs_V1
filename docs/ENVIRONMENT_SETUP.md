# Environment Setup Guide

This guide explains how to set up and use multiple environments for Helprs development.

## Environment Overview

- **Development**: Local Docker Supabase (port 54321) - Your sandbox/playground
- **Testing**: Local Docker Supabase (port 54331) - Separate isolated testing instance
- **Staging**: Cloud Supabase project - Cloud-based validation environment
- **Production**: Cloud Supabase project - Live production environment

## Local Supabase Setup

### Development Instance (Default)

The development Supabase instance uses the default configuration in `supabase/config.toml`:
- **API URL**: `http://127.0.0.1:54321`
- **Database**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- **Studio**: `http://127.0.0.1:54323`

**To start:**
```bash
# From the project root
supabase start
```

**To stop:**
```bash
supabase stop
```

**To get status/keys:**
```bash
supabase status
```

### Testing Instance (Separate Container)

The testing instance uses different ports to run alongside development:

- **API URL**: `http://127.0.0.1:54331`
- **Database**: `postgresql://postgres:postgres@127.0.0.1:54332/postgres`
- **Studio**: `http://127.0.0.1:54333`

**To start testing instance:**
```bash
# Use the helper script
./scripts/start-testing-supabase.sh
```

**To stop testing instance:**
```bash
./scripts/stop-testing-supabase.sh
```

**Important Notes:**
- Both instances can run simultaneously
- Testing instance uses different Docker container names to avoid conflicts
- Testing instance has its own database, completely isolated from development

## Environment Configuration Files

Next.js loads environment files based on `NODE_ENV`:
- **Development**: `.env.development.local` (when `NODE_ENV=development`)
- **Testing**: `.env.test.local` (when `NODE_ENV=test`) ⚠️ Note: Uses `.test.local`, not `.testing.local`
- **Production**: `.env.production.local` (when `NODE_ENV=production`)

### Development (`.env.development.local`)
- Copy from `.env.example`
- Use development Supabase instance (port 54321)
- Stripe TEST keys
- Demo feature flags enabled

### Testing (`.env.test.local`)
- Copy from `.env.example` and rename to `.env.test.local`
- Use testing Supabase instance (port 54331)
- Stripe TEST keys
- Only live feature flags (no demos)

### Staging (`.env.staging.local`)
- Copy from `.env.example`
- Use cloud Supabase project (create in Supabase dashboard)
- Stripe TEST keys (never use live in staging!)
- Only live feature flags

### Production (`.env.production.local`)
- Copy from `.env.example`
- Use cloud Supabase project (separate from staging)
- Stripe LIVE keys (only production!)
- Only live feature flags

## Creating Environment Files

1. Copy the example template:
   ```bash
   cp .env.example .env.development.local
   cp .env.example .env.test.local  # Note: .test.local (not .testing.local)
   ```

2. Fill in the actual values for each environment:
   - Development: Use values from `supabase status` (port 54321)
   - Testing: Use values from `cd supabase-testing && supabase status` (port 54331)
   - Staging: Get from Supabase dashboard
   - Production: Get from Supabase dashboard

3. Generate security secrets:
   ```bash
   openssl rand -base64 32  # Use for JWT_SECRET, SESSION_SECRET, ENCRYPTION_KEY
   ```

## Running the Application

### Single Environment
```bash
# Development
npm run dev:development
# Opens on http://localhost:3000

# Testing
npm run dev:testing
# Opens on http://localhost:3001
```

### Compare Side-by-Side
```bash
# Run both simultaneously
./scripts/compare-environments.sh
# Or manually:
npm run dev:compare
```

This opens:
- **Development**: http://localhost:3000 (all features + demos)
- **Testing**: http://localhost:3001 (curated release features)

## Switching Between Environments

### Switch Supabase Instance (Local)

When working on the **testing** branch:
1. Stop development Supabase: `supabase stop`
2. Start testing Supabase: `./scripts/start-testing-supabase.sh`
3. Update `.env.test.local` with keys from `cd supabase-testing && supabase status`
4. Run app with `npm run dev:testing`

When working on the **development** branch:
1. Stop testing Supabase: `./scripts/stop-testing-supabase.sh`
2. Start development Supabase: `supabase start`
3. Run app with `npm run dev:development`

## Migration Management

Migrations are shared across all environments but applied separately:

**Development:**
```bash
supabase db push
```

**Testing:**
```bash
cd supabase-testing
supabase db push
```

**Staging/Production:**
```bash
# Connect to cloud database and run migrations
# Or use Supabase Dashboard → SQL Editor
```

## Troubleshooting

### Port Conflicts
If ports are already in use:
- Check what's using them: `lsof -i :54321` or `lsof -i :54331`
- Stop the conflicting service or change ports in config

### Docker Container Conflicts
- Each Supabase instance uses different container names
- Development: `supabase_*_Helprs_V1`
- Testing: `supabase_*_Helprs_V1_Testing`
- Verify with: `docker ps | grep supabase`

### Environment Not Loading
- Ensure `.env.development.local` and `.env.test.local` exist
- Note: Testing uses `.env.test.local` (not `.env.testing.local`)
- Restart Next.js dev server after changing `.env` files

## Best Practices

1. **Never commit `.env*.local` files** - They're in `.gitignore`
2. **Always use TEST Stripe keys** except in production
3. **Use unique secrets** for each environment (generate with `openssl rand -base64 32`)
4. **Isolate databases** - Never mix development and testing data
5. **Backup before reset** - Use `supabase db dump` before `supabase db reset`
