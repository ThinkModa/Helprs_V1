-- =====================================================
-- ENHANCE FEATURE FLAGS AND COMPANIES
-- =====================================================
-- Add rollout tracking and test company markers
-- =====================================================

-- Add rollout tracking to feature flags
ALTER TABLE tenant_feature_flags 
  ADD COLUMN IF NOT EXISTS rollout_stage TEXT,
  ADD COLUMN IF NOT EXISTS rollout_percentage INTEGER DEFAULT 0;

-- Add test company markers
ALTER TABLE companies 
  ADD COLUMN IF NOT EXISTS is_test_company BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_internal_company BOOLEAN DEFAULT false;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_feature_flags_company 
  ON tenant_feature_flags(company_id);
CREATE INDEX IF NOT EXISTS idx_tenant_feature_flags_enabled 
  ON tenant_feature_flags(is_enabled);
CREATE INDEX IF NOT EXISTS idx_companies_internal 
  ON companies(is_internal_company) WHERE is_internal_company = true;

-- Add comment for documentation
COMMENT ON COLUMN tenant_feature_flags.rollout_stage IS 'Tracks the current rollout stage: internal, beta, tier_rollout, full';
COMMENT ON COLUMN tenant_feature_flags.rollout_percentage IS 'Percentage of users/companies that have this feature enabled (0-100)';
COMMENT ON COLUMN companies.is_test_company IS 'Marks company as a test/demo company (not real client)';
COMMENT ON COLUMN companies.is_internal_company IS 'Marks company as internal Helprs company for testing';



