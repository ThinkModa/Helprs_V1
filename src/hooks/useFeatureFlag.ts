'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { featureFlagService } from '@/lib/database/feature-flags'

export interface UseFeatureFlagResult {
  isEnabled: boolean
  loading: boolean
  error: string | null
}

export function useFeatureFlag(featureName: string): UseFeatureFlagResult {
  const { currentCompany } = useAuth()
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentCompany) {
      setIsEnabled(false)
      setLoading(false)
      setError(null)
      return
    }

    const checkFeature = async () => {
      try {
        setLoading(true)
        setError(null)
        const enabled = await featureFlagService.isFeatureEnabled(currentCompany.id, featureName)
        setIsEnabled(enabled)
      } catch (err) {
        console.error('Error checking feature flag:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsEnabled(false)
      } finally {
        setLoading(false)
      }
    }

    checkFeature()
  }, [currentCompany, featureName])

  return { isEnabled, loading, error }
}

// Hook for multiple feature flags
export function useFeatureFlags(featureNames: string[]): Record<string, UseFeatureFlagResult> {
  const { currentCompany } = useAuth()
  const [results, setResults] = useState<Record<string, UseFeatureFlagResult>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentCompany) {
      const defaultResults = featureNames.reduce((acc, name) => {
        acc[name] = { isEnabled: false, loading: false, error: null }
        return acc
      }, {} as Record<string, UseFeatureFlagResult>)
      setResults(defaultResults)
      setLoading(false)
      return
    }

    const checkFeatures = async () => {
      try {
        setLoading(true)
        const promises = featureNames.map(async (name) => {
          try {
            const enabled = await featureFlagService.isFeatureEnabled(currentCompany.id, name)
            return { name, result: { isEnabled: enabled, loading: false, error: null } }
          } catch (err) {
            return { 
              name, 
              result: { 
                isEnabled: false, 
                loading: false, 
                error: err instanceof Error ? err.message : 'Unknown error' 
              } 
            }
          }
        })

        const featureResults = await Promise.all(promises)
        const resultsMap = featureResults.reduce((acc, { name, result }) => {
          acc[name] = result
          return acc
        }, {} as Record<string, UseFeatureFlagResult>)

        setResults(resultsMap)
      } catch (err) {
        console.error('Error checking feature flags:', err)
        const errorResults = featureNames.reduce((acc, name) => {
          acc[name] = { 
            isEnabled: false, 
            loading: false, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          }
          return acc
        }, {} as Record<string, UseFeatureFlagResult>)
        setResults(errorResults)
      } finally {
        setLoading(false)
      }
    }

    checkFeatures()
  }, [currentCompany, featureNames.join(',')])

  return results
}

// Hook for feature flag management (admin only)
export function useFeatureFlagManagement() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enableForCompany = async (companyId: string, featureId: string, enabledBy: string) => {
    try {
      setLoading(true)
      setError(null)
      await featureFlagService.enableFeatureForCompany(companyId, featureId, enabledBy)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const disableForCompany = async (companyId: string, featureId: string, disabledBy: string) => {
    try {
      setLoading(true)
      setError(null)
      await featureFlagService.disableFeatureForCompany(companyId, featureId, disabledBy)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const enableForTier = async (tier: string, featureId: string, enabledBy: string) => {
    try {
      setLoading(true)
      setError(null)
      await featureFlagService.enableFeatureForTier(tier, featureId, enabledBy)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const enableForTiers = async (tiers: string[], featureId: string, enabledBy: string) => {
    try {
      setLoading(true)
      setError(null)
      await featureFlagService.enableFeatureForTiers(tiers, featureId, enabledBy)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const enableForCompanies = async (companyIds: string[], featureId: string, enabledBy: string) => {
    try {
      setLoading(true)
      setError(null)
      await featureFlagService.enableFeatureForCompanies(companyIds, featureId, enabledBy)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const enableForAllCompanies = async (featureId: string, enabledBy: string) => {
    try {
      setLoading(true)
      setError(null)
      await featureFlagService.enableFeatureForAllCompanies(featureId, enabledBy)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    enableForCompany,
    disableForCompany,
    enableForTier,
    enableForTiers,
    enableForCompanies,
    enableForAllCompanies
  }
}


