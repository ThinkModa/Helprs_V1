# Feature Comparison: Development vs Testing

Use this document to compare features between Development and Testing environments and decide what to keep in each.

## Quick Start - Compare Side by Side

```bash
# Start both environments simultaneously
./scripts/compare-environments.sh
```

This will open:
- **Development**: http://localhost:3000 (sandbox with all features)
- **Testing**: http://localhost:3001 (curated release features)

---

## Feature Comparison Template

For each feature/page, document:

### Feature Name: [e.g., "Payment Management"]

| Aspect | Development | Testing | Decision |
|--------|------------|---------|----------|
| **Status** | ✅ Present | ✅ Present | Keep in Testing |
| **Wired to DB?** | ✅ Yes | ✅ Yes | Ready for release |
| **Feature Flag** | `payments` | `payments` | Enabled |
| **UI State** | Complete | Complete | Production-ready |
| **Notes** | Fully functional | Fully functional | Include in initial release |

---

## Decision Categories

- ✅ **Keep in Testing** - Feature is production-ready and should be in initial release
- 🚧 **Keep in Development** - Feature needs more work or is experimental
- 🔄 **Modify for Testing** - Feature exists but needs changes before release
- ❌ **Remove from Testing** - Feature is not needed for initial release

---

## Current Feature Inventory

### Core Features (Tier 1 - Free)

#### Scheduling
- [ ] **Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete
- [ ] **Development Branch**: [Notes]
- [ ] **Testing Branch**: [Notes]
- [ ] **Decision**: [Keep in Testing / Keep in Dev / Modify / Remove]

#### Worker Self-Scheduling
- [ ] **Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete
- [ ] **Development Branch**: [Notes]
- [ ] **Testing Branch**: [Notes]
- [ ] **Decision**: [Keep in Testing / Keep in Dev / Modify / Remove]

---

### Communication Features (Tier 2)

#### Direct Communication (Worker ↔ Client)
- [ ] **Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete
- [ ] **Development Branch**: [Notes]
- [ ] **Testing Branch**: [Notes]
- [ ] **Decision**: [Keep in Testing / Keep in Dev / Modify / Remove]

---

### Payment Features (Tier 3 - Premium)

#### Payment Management
- [ ] **Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete
- [ ] **Development Branch**: [Notes]
- [ ] **Testing Branch**: [Notes]
- [ ] **Decision**: [Keep in Testing / Keep in Dev / Modify / Remove]

#### Stripe Integration
- [ ] **Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete
- [ ] **Development Branch**: [Notes]
- [ ] **Testing Branch**: [Notes]
- [ ] **Decision**: [Keep in Testing / Keep in Dev / Modify / Remove]

---

### Analytics & Reporting

#### Company Reports
- [ ] **Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete
- [ ] **Development Branch**: Scaffolded UI, mock data
- [ ] **Testing Branch**: [Need to wire to real DB?]
- [ ] **Decision**: [Keep in Testing / Keep in Dev / Modify / Remove]

#### AI Insights Chat
- [ ] **Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete
- [ ] **Development Branch**: Scaffolded UI, mock chat
- [ ] **Testing Branch**: [Need to wire to real AI/analytics?]
- [ ] **Decision**: [Keep in Testing / Keep in Dev / Modify / Remove]

---

### Admin Features

#### Feature Flags Management
- [ ] **Status**: ✅ Complete
- [ ] **Development Branch**: Live + Demo tabs, full rollout wizard
- [ ] **Testing Branch**: Should have same functionality
- [ ] **Decision**: ✅ Keep in Testing (essential for managing releases)

#### Activation Wizard
- [ ] **Status**: ✅ Complete
- [ ] **Development Branch**: Full rollout strategies (tier/company/all)
- [ ] **Testing Branch**: Should have same functionality
- [ ] **Decision**: ✅ Keep in Testing (essential for deploying features)

---

## Pages/Components to Review

### Development Branch (All Available)
- [ ] Dashboard
- [ ] Schedule
- [ ] Calendars
- [ ] Appointments
- [ ] Forms
- [ ] Team Management
- [ ] Customers
- [ ] Payments (scaffolded)
- [ ] Billing
- [ ] Reports (scaffolded)
- [ ] Insights (scaffolded)
- [ ] Settings

### Testing Branch (Should Only Have)
- [ ] [List features you decide to keep]

---

## Workflow for Comparison

1. **Start both environments:**
   ```bash
   ./scripts/compare-environments.sh
   ```

2. **Open both in browser:**
   - Development: http://localhost:3000
   - Testing: http://localhost:3001

3. **Navigate through each page/feature:**
   - Check if it works in Development
   - Check if it should exist in Testing
   - Document decision in table above

4. **Make changes:**
   - If feature should be in Testing but missing: Add it
   - If feature should NOT be in Testing: Remove it or gate with feature flags

5. **Document decisions:**
   - Update this document with your decisions
   - Commit changes to appropriate branch

---

## Next Steps After Comparison

1. **Update Testing Branch:**
   - Remove features not needed for initial release
   - Ensure all kept features are fully wired to database
   - Update feature flags to match release plan

2. **Keep Development Branch:**
   - All experimental/scaffolded features remain
   - Continue building new features here

3. **Document Release Scope:**
   - Create `RELEASE_NOTES.md` for initial release
   - List all features included in Testing branch

