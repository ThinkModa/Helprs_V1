# Development Workflow

This document explains how to maintain data consistency in your test environment.

## 🎯 Problem Solved

When you run `supabase db reset`, it clears all data including test accounts. This document provides solutions to automatically recreate test data.

## 🚀 Quick Commands

### Reset Database with Test Data
```bash
npm run dev:reset
```
This will:
1. Reset the Supabase database
2. Apply all migrations
3. Seed test data automatically

### Just Seed Test Data
```bash
npm run seed
```
Use this when you want to add test data without resetting the database.

### Reset Database Only
```bash
npm run db:reset
```
Alternative command that does the same as `dev:reset`.

## 📋 Test Accounts

After seeding, you'll have these accounts available:

| Account | Email | Password | Access |
|---------|-------|----------|--------|
| **Super Admin** | `admin@helprs.com` | `admin123` | Super Admin Dashboard |
| **The Home Team** | `admin@thehometeam.com` | `hometeam123` | Company Dashboard |
| **Primetime Moving** | `admin@primetimemoving.com` | `primetime123` | Company Dashboard |

## 🗄️ What Gets Seeded

### Users & Companies
- Super Admin account with platform access
- The Home Team company with admin user
- Primetime Moving company with admin user

### Sample Data
- **Calendars**: House Cleaning Team, Office Cleaning Team, Downtown Area, North Side, Plumbing Team
- **Forms**: Contact Information, Cleaning Checklist, Safety Inspection
- **Feature Flags**: All default feature flags
- **Configuration Templates**: Default tenant configuration
- **Notification Templates**: Welcome emails, job assignments, system maintenance

## 🔧 How It Works

### 1. Seed Script (`scripts/seed-test-data.js`)
- Creates authentication users
- Creates companies and user profiles
- Adds sample calendars and forms
- Handles existing data gracefully (won't duplicate)

### 2. Supabase Seed File (`supabase/seed.sql`)
- Runs automatically after migrations
- Creates system-level data (feature flags, templates)
- Uses `ON CONFLICT DO NOTHING` to avoid duplicates

### 3. Development Reset Script (`scripts/dev-reset.js`)
- Orchestrates the full reset process
- Provides clear feedback and instructions
- Ensures environment is ready for development

## 🎨 Customization

### Adding New Test Data
Edit `scripts/seed-test-data.js` to add:
- New test companies
- Additional sample calendars
- More forms
- Test appointments

### Modifying Existing Data
The script handles existing data gracefully:
- Users: Checks if email exists before creating
- Companies: Checks if slug exists before creating
- Profiles: Updates existing profiles if they exist

## 🔄 Development Workflow

### When Starting Development
```bash
npm run dev:reset
npm run dev
```

### When Adding New Migrations
```bash
# Create your migration
supabase migration new your_migration_name

# Reset and apply all migrations with test data
npm run dev:reset

# Continue development
npm run dev
```

### When You Need Fresh Data
```bash
npm run dev:reset
```

## 🚨 Troubleshooting

### "User already exists" Warnings
These are normal and expected. The script checks for existing data and skips creation if it already exists.

### "Invalid credentials" After Reset
1. Make sure Supabase is running: `supabase status`
2. Check `.env.local` exists with correct keys
3. Run: `npm run dev:reset`

### Missing Test Data
If you don't see your test data:
1. Check the console output for errors
2. Verify Supabase is running
3. Try: `npm run seed` to add data without reset

## 📁 File Structure

```
scripts/
├── seed-test-data.js    # Main seeding script
├── dev-reset.js         # Development reset orchestrator
└── setup.js            # Initial project setup

supabase/
├── seed.sql            # Automatic SQL seeding
└── migrations/         # Database migrations
```

## 🎯 Benefits

✅ **Consistent Environment**: Same test data every time  
✅ **No Manual Setup**: Automated account creation  
✅ **Safe Resets**: Won't break existing data  
✅ **Rich Test Data**: Calendars, forms, and more  
✅ **Quick Recovery**: Get back to work in seconds  

## 🔮 Future Enhancements

- [ ] Add sample appointments
- [ ] Create test worker accounts
- [ ] Add sample customer data
- [ ] Include test notifications
- [ ] Add performance test data
