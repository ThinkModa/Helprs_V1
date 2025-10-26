'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { featureFlagService } from '@/lib/database/feature-flags'
import { useFeatureFlagManagement } from '@/hooks/useFeatureFlag'
import { 
  Flag, 
  Plus, 
  Settings, 
  Users, 
  Building2, 
  Crown, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Trash2,
  Edit
} from 'lucide-react'
import type { Database } from '@/types/database'

type FeatureFlag = Database['public']['Tables']['feature_flags']['Row']
type Company = Database['public']['Tables']['companies']['Row']

interface FeatureFlagWithStats extends FeatureFlag {
  company_override?: boolean | null
  stats?: {
    totalCompanies: number
    enabledCompanies: number
    disabledCompanies: number
    notSetCompanies: number
  }
}

export default function FeatureFlagsManagement() {
  const { user } = useAuth()
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagWithStats[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<FeatureFlagWithStats | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRolloutModal, setShowRolloutModal] = useState(false)
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set())

  const { 
    loading: actionLoading, 
    error: actionError,
    enableForCompany,
    disableForCompany,
    enableForTier,
    enableForTiers,
    enableForCompanies,
    enableForAllCompanies
  } = useFeatureFlagManagement()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [flagsData, companiesData] = await Promise.all([
        featureFlagService.getAllFeatureFlags(),
        featureFlagService.getAllCompanies()
      ])

      // Get stats for each feature flag
      const flagsWithStats = await Promise.all(
        flagsData.map(async (flag) => {
          const stats = await featureFlagService.getFeatureFlagStats(flag.id)
          return { ...flag, stats }
        })
      )

      setFeatureFlags(flagsWithStats)
      setCompanies(companiesData)
    } catch (err) {
      console.error('Error loading feature flags data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFeature = async (featureData: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await featureFlagService.createFeatureFlag(featureData)
      await loadData()
      setShowCreateModal(false)
    } catch (err) {
      console.error('Error creating feature flag:', err)
      setError(err instanceof Error ? err.message : 'Failed to create feature flag')
    }
  }

  const handleDeleteFeature = async (featureId: string) => {
    if (!confirm('Are you sure you want to delete this feature flag? This action cannot be undone.')) {
      return
    }

    try {
      await featureFlagService.deleteFeatureFlag(featureId)
      await loadData()
    } catch (err) {
      console.error('Error deleting feature flag:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete feature flag')
    }
  }

  const handleRollout = async (rolloutType: string, featureId: string, targets: string[]) => {
    if (!user) return

    try {
      switch (rolloutType) {
        case 'tier':
          await enableForTier(targets[0], featureId, user.id)
          break
        case 'tiers':
          await enableForTiers(targets, featureId, user.id)
          break
        case 'companies':
          await enableForCompanies(targets, featureId, user.id)
          break
        case 'all':
          await enableForAllCompanies(featureId, user.id)
          break
      }
      await loadData()
      setShowRolloutModal(false)
    } catch (err) {
      console.error('Error rolling out feature:', err)
      setError(err instanceof Error ? err.message : 'Failed to rollout feature')
    }
  }

  const toggleFeatureExpansion = (featureId: string) => {
    const newExpanded = new Set(expandedFeatures)
    if (newExpanded.has(featureId)) {
      newExpanded.delete(featureId)
    } else {
      newExpanded.add(featureId)
    }
    setExpandedFeatures(newExpanded)
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free': return <Users className="h-4 w-4 text-gray-500" />
      case 'basic': return <Building2 className="h-4 w-4 text-blue-500" />
      case 'professional': return <Crown className="h-4 w-4 text-purple-500" />
      case 'enterprise': return <Crown className="h-4 w-4 text-gold-500" />
      default: return <Building2 className="h-4 w-4 text-gray-500" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'text-gray-600 bg-gray-100'
      case 'basic': return 'text-blue-600 bg-blue-100'
      case 'professional': return 'text-purple-600 bg-purple-100'
      case 'enterprise': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading feature flags...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
          <p className="text-gray-600 mt-1">Manage feature rollouts across all companies</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Feature Flag
        </button>
      </div>

      {/* Feature Flags List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="space-y-4">
            {featureFlags.map((feature) => (
              <div key={feature.id} className="border border-gray-200 rounded-lg">
                {/* Feature Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleFeatureExpansion(feature.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {expandedFeatures.has(feature.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      <Flag className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Tier Badge */}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTierColor(feature.required_tier)}`}>
                        {getTierIcon(feature.required_tier)}
                        <span className="ml-1 capitalize">{feature.required_tier}</span>
                      </span>

                      {/* Stats */}
                      {feature.stats && (
                        <div className="text-sm text-gray-600">
                          <span className="text-green-600 font-medium">{feature.stats.enabledCompanies}</span>
                          <span className="mx-1">/</span>
                          <span>{feature.stats.totalCompanies}</span>
                          <span className="ml-1">companies</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedFeature(feature)
                            setShowRolloutModal(true)
                          }}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Rollout Feature"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFeature(feature.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Feature"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedFeatures.has(feature.id) && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Stats Cards */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Enabled</p>
                            <p className="text-2xl font-bold text-green-600">{feature.stats?.enabledCompanies || 0}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center">
                          <XCircle className="h-5 w-5 text-red-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Disabled</p>
                            <p className="text-2xl font-bold text-red-600">{feature.stats?.disabledCompanies || 0}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Not Set</p>
                            <p className="text-2xl font-bold text-yellow-600">{feature.stats?.notSetCompanies || 0}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center">
                          <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Total</p>
                            <p className="text-2xl font-bold text-blue-600">{feature.stats?.totalCompanies || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Feature Details */}
                    <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Feature Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Category:</span>
                          <span className="ml-2 text-gray-600 capitalize">{feature.category}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Default Status:</span>
                          <span className="ml-2">
                            {feature.is_enabled_by_default ? (
                              <span className="text-green-600 font-medium">Enabled</span>
                            ) : (
                              <span className="text-red-600 font-medium">Disabled</span>
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Created:</span>
                          <span className="ml-2 text-gray-600">
                            {new Date(feature.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Updated:</span>
                          <span className="ml-2 text-gray-600">
                            {new Date(feature.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Feature Modal */}
      {showCreateModal && (
        <CreateFeatureModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateFeature}
        />
      )}

      {/* Rollout Modal */}
      {showRolloutModal && selectedFeature && (
        <RolloutModal
          feature={selectedFeature}
          companies={companies}
          onClose={() => setShowRolloutModal(false)}
          onRollout={handleRollout}
          loading={actionLoading}
        />
      )}
    </div>
  )
}

// Create Feature Modal Component
function CreateFeatureModal({ 
  onClose, 
  onCreate 
}: { 
  onClose: () => void
  onCreate: (feature: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>) => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    required_tier: 'free',
    is_enabled_by_default: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create Feature Flag</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feature Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="general">General</option>
              <option value="billing">Billing</option>
              <option value="analytics">Analytics</option>
              <option value="integrations">Integrations</option>
              <option value="ui">UI/UX</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required Tier
            </label>
            <select
              value={formData.required_tier}
              onChange={(e) => setFormData({ ...formData, required_tier: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled_by_default"
              checked={formData.is_enabled_by_default}
              onChange={(e) => setFormData({ ...formData, is_enabled_by_default: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enabled_by_default" className="ml-2 text-sm text-gray-700">
              Enabled by default
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Feature Flag
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Rollout Modal Component
function RolloutModal({ 
  feature, 
  companies, 
  onClose, 
  onRollout, 
  loading 
}: { 
  feature: FeatureFlagWithStats
  companies: Company[]
  onClose: () => void
  onRollout: (type: string, featureId: string, targets: string[]) => void
  loading: boolean
}) {
  const [rolloutType, setRolloutType] = useState('tier')
  const [selectedTier, setSelectedTier] = useState('')
  const [selectedTiers, setSelectedTiers] = useState<string[]>([])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    let targets: string[] = []
    switch (rolloutType) {
      case 'tier':
        targets = [selectedTier]
        break
      case 'tiers':
        targets = selectedTiers
        break
      case 'companies':
        targets = selectedCompanies
        break
      case 'all':
        targets = ['all']
        break
    }

    onRollout(rolloutType, feature.id, targets)
  }

  const tiers = ['free', 'basic', 'professional', 'enterprise']
  const companiesByTier = tiers.reduce((acc, tier) => {
    acc[tier] = companies.filter(c => c.subscription_tier === tier)
    return acc
  }, {} as Record<string, Company[]>)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Rollout Feature: {feature.name}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rollout Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rollout Strategy
            </label>
            <div className="space-y-3">
              {[
                { value: 'tier', label: 'Enable for all clients in a specific tier', description: 'Enable for all companies in one tier' },
                { value: 'tiers', label: 'Enable for specific tier(s) of clients', description: 'Enable for multiple tiers' },
                { value: 'companies', label: 'Enable for specific individual clients', description: 'Select specific companies' },
                { value: 'all', label: 'Enable for all companies at once', description: 'Universal rollout' }
              ].map((option) => (
                <label key={option.value} className="flex items-start">
                  <input
                    type="radio"
                    name="rolloutType"
                    value={option.value}
                    checked={rolloutType === option.value}
                    onChange={(e) => setRolloutType(e.target.value)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Target Selection */}
          {rolloutType === 'tier' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Tier
              </label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a tier</option>
                {tiers.map(tier => (
                  <option key={tier} value={tier}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)} ({companiesByTier[tier]?.length || 0} companies)
                  </option>
                ))}
              </select>
            </div>
          )}

          {rolloutType === 'tiers' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Tiers
              </label>
              <div className="space-y-2">
                {tiers.map(tier => (
                  <label key={tier} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTiers.includes(tier)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTiers([...selectedTiers, tier])
                        } else {
                          setSelectedTiers(selectedTiers.filter(t => t !== tier))
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {tier.charAt(0).toUpperCase() + tier.slice(1)} ({companiesByTier[tier]?.length || 0} companies)
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {rolloutType === 'companies' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Companies
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                <div className="space-y-2">
                  {companies.map(company => (
                    <label key={company.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCompanies([...selectedCompanies, company.id])
                          } else {
                            setSelectedCompanies(selectedCompanies.filter(id => id !== company.id))
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {company.name} ({company.subscription_tier})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {rolloutType === 'all' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-blue-800 text-sm">
                  This will enable the feature for all {companies.length} companies in the system.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Rolling Out...
                </>
              ) : (
                'Rollout Feature'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


