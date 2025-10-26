import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type FeatureFlag = Database['public']['Tables']['feature_flags']['Row']
type TenantFeatureFlag = Database['public']['Tables']['tenant_feature_flags']['Row']
type Company = Database['public']['Tables']['companies']['Row']

export class FeatureFlagService {
  constructor(private supabase: ReturnType<typeof createClient>) {}

  // Check if feature is enabled for a company
  async isFeatureEnabled(companyId: string, featureName: string): Promise<boolean> {
    try {
      const { data: flag } = await this.supabase
        .from('feature_flags')
        .select('id, required_tier, is_enabled_by_default')
        .eq('name', featureName)
        .single()

      if (!flag) return false

      // Check tenant-specific override
      const { data: tenantFlag } = await this.supabase
        .from('tenant_feature_flags')
        .select('is_enabled')
        .eq('company_id', companyId)
        .eq('feature_flag_id', flag.id)
        .single()

      if (tenantFlag) return tenantFlag.is_enabled

      // Check company tier
      const { data: company } = await this.supabase
        .from('companies')
        .select('subscription_tier')
        .eq('id', companyId)
        .single()

      if (!company) return false

      // Return default based on tier
      return this.tierMeetsRequirement(company.subscription_tier, flag.required_tier)
    } catch (error) {
      console.error('Error checking feature flag:', error)
      return false
    }
  }

  // Enable feature for specific company
  async enableFeatureForCompany(
    companyId: string, 
    featureId: string, 
    enabledBy: string
  ) {
    try {
      return await this.supabase
        .from('tenant_feature_flags')
        .upsert({
          company_id: companyId,
          feature_flag_id: featureId,
          is_enabled: true,
          enabled_by: enabledBy,
          enabled_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error enabling feature for company:', error)
      throw error
    }
  }

  // Disable feature for specific company
  async disableFeatureForCompany(
    companyId: string, 
    featureId: string, 
    disabledBy: string
  ) {
    try {
      return await this.supabase
        .from('tenant_feature_flags')
        .upsert({
          company_id: companyId,
          feature_flag_id: featureId,
          is_enabled: false,
          enabled_by: disabledBy,
          enabled_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error disabling feature for company:', error)
      throw error
    }
  }

  // Enable feature for all companies in a tier
  async enableFeatureForTier(tier: string, featureId: string, enabledBy: string) {
    try {
      const { data: companies } = await this.supabase
        .from('companies')
        .select('id')
        .eq('subscription_tier', tier)

      if (!companies || companies.length === 0) return

      const inserts = companies.map(company => ({
        company_id: company.id,
        feature_flag_id: featureId,
        is_enabled: true,
        enabled_by: enabledBy,
        enabled_at: new Date().toISOString()
      }))

      return await this.supabase
        .from('tenant_feature_flags')
        .upsert(inserts)
    } catch (error) {
      console.error('Error enabling feature for tier:', error)
      throw error
    }
  }

  // Enable feature for specific tier(s)
  async enableFeatureForTiers(tiers: string[], featureId: string, enabledBy: string) {
    try {
      const { data: companies } = await this.supabase
        .from('companies')
        .select('id')
        .in('subscription_tier', tiers)

      if (!companies || companies.length === 0) return

      const inserts = companies.map(company => ({
        company_id: company.id,
        feature_flag_id: featureId,
        is_enabled: true,
        enabled_by: enabledBy,
        enabled_at: new Date().toISOString()
      }))

      return await this.supabase
        .from('tenant_feature_flags')
        .upsert(inserts)
    } catch (error) {
      console.error('Error enabling feature for tiers:', error)
      throw error
    }
  }

  // Enable feature for specific companies
  async enableFeatureForCompanies(
    companyIds: string[], 
    featureId: string, 
    enabledBy: string
  ) {
    try {
      const inserts = companyIds.map(companyId => ({
        company_id: companyId,
        feature_flag_id: featureId,
        is_enabled: true,
        enabled_by: enabledBy,
        enabled_at: new Date().toISOString()
      }))

      return await this.supabase
        .from('tenant_feature_flags')
        .upsert(inserts)
    } catch (error) {
      console.error('Error enabling feature for companies:', error)
      throw error
    }
  }

  // Enable feature for ALL companies
  async enableFeatureForAllCompanies(featureId: string, enabledBy: string) {
    try {
      const { data: companies } = await this.supabase
        .from('companies')
        .select('id')

      if (!companies || companies.length === 0) return

      const inserts = companies.map(company => ({
        company_id: company.id,
        feature_flag_id: featureId,
        is_enabled: true,
        enabled_by: enabledBy,
        enabled_at: new Date().toISOString()
      }))

      return await this.supabase
        .from('tenant_feature_flags')
        .upsert(inserts)
    } catch (error) {
      console.error('Error enabling feature for all companies:', error)
      throw error
    }
  }

  // Get all features for a company
  async getCompanyFeatures(companyId: string) {
    try {
      const { data, error } = await this.supabase
        .from('tenant_feature_flags')
        .select(`
          *,
          feature_flags (
            id,
            name,
            description,
            category,
            required_tier,
            is_enabled_by_default
          )
        `)
        .eq('company_id', companyId)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting company features:', error)
      throw error
    }
  }

  // Get all feature flags with company status
  async getAllFeatureFlags(companyId?: string) {
    try {
      const { data: flags, error: flagsError } = await this.supabase
        .from('feature_flags')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (flagsError) throw flagsError

      if (!companyId) return flags

      // Get company-specific overrides
      const { data: overrides, error: overridesError } = await this.supabase
        .from('tenant_feature_flags')
        .select('feature_flag_id, is_enabled')
        .eq('company_id', companyId)

      if (overridesError) throw overridesError

      // Merge flags with company overrides
      return flags.map(flag => {
        const override = overrides?.find(o => o.feature_flag_id === flag.id)
        return {
          ...flag,
          company_override: override ? override.is_enabled : null
        }
      })
    } catch (error) {
      console.error('Error getting all feature flags:', error)
      throw error
    }
  }

  // Create new feature flag
  async createFeatureFlag(feature: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await this.supabase
        .from('feature_flags')
        .insert(feature)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating feature flag:', error)
      throw error
    }
  }

  // Update feature flag
  async updateFeatureFlag(
    featureId: string, 
    updates: Partial<Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>>
  ) {
    try {
      const { data, error } = await this.supabase
        .from('feature_flags')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', featureId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating feature flag:', error)
      throw error
    }
  }

  // Delete feature flag
  async deleteFeatureFlag(featureId: string) {
    try {
      // First delete all tenant overrides
      await this.supabase
        .from('tenant_feature_flags')
        .delete()
        .eq('feature_flag_id', featureId)

      // Then delete the feature flag
      const { error } = await this.supabase
        .from('feature_flags')
        .delete()
        .eq('id', featureId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting feature flag:', error)
      throw error
    }
  }

  // Get companies by tier
  async getCompaniesByTier(tier: string) {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select('id, name, subscription_tier')
        .eq('subscription_tier', tier)
        .order('name', { ascending: true })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting companies by tier:', error)
      throw error
    }
  }

  // Get all companies with their tiers
  async getAllCompanies() {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select('id, name, subscription_tier, is_test_company, is_internal_company')
        .order('name', { ascending: true })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting all companies:', error)
      throw error
    }
  }

  // Get feature flag usage statistics
  async getFeatureFlagStats(featureId: string) {
    try {
      const { data: totalCompanies } = await this.supabase
        .from('companies')
        .select('id', { count: 'exact' })

      const { data: enabledCompanies } = await this.supabase
        .from('tenant_feature_flags')
        .select('company_id', { count: 'exact' })
        .eq('feature_flag_id', featureId)
        .eq('is_enabled', true)

      const { data: disabledCompanies } = await this.supabase
        .from('tenant_feature_flags')
        .select('company_id', { count: 'exact' })
        .eq('feature_flag_id', featureId)
        .eq('is_enabled', false)

      return {
        totalCompanies: totalCompanies?.length || 0,
        enabledCompanies: enabledCompanies?.length || 0,
        disabledCompanies: disabledCompanies?.length || 0,
        notSetCompanies: (totalCompanies?.length || 0) - (enabledCompanies?.length || 0) - (disabledCompanies?.length || 0)
      }
    } catch (error) {
      console.error('Error getting feature flag stats:', error)
      throw error
    }
  }

  private tierMeetsRequirement(companyTier: string, requiredTier: string): boolean {
    const tierHierarchy = ['free', 'basic', 'professional', 'enterprise']
    const companyLevel = tierHierarchy.indexOf(companyTier)
    const requiredLevel = tierHierarchy.indexOf(requiredTier)
    return companyLevel >= requiredLevel
  }
}

// Export a singleton instance
export const featureFlagService = new FeatureFlagService(createClient())


