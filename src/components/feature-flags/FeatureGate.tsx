'use client'

import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { Loader2 } from 'lucide-react'

interface FeatureGateProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showLoading?: boolean
  loadingComponent?: React.ReactNode
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback = null, 
  showLoading = true,
  loadingComponent 
}: FeatureGateProps) {
  const { isEnabled, loading, error } = useFeatureFlag(feature)

  // Show loading state
  if (loading && showLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }
    
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        <span className="ml-2 text-sm text-gray-500">Loading feature...</span>
      </div>
    )
  }

  // Show error state (optional - could be handled differently)
  if (error) {
    console.warn(`Feature flag error for "${feature}":`, error)
    // In production, you might want to show fallback or nothing
    // For development, you might want to show the error
    return <>{fallback}</>
  }

  // Show children if feature is enabled, otherwise show fallback
  if (!isEnabled) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Higher-order component version
export function withFeatureGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: string,
  fallback?: React.ReactNode
) {
  const WithFeatureGateComponent = (props: P) => {
    return (
      <FeatureGate feature={feature} fallback={fallback}>
        <WrappedComponent {...props} />
      </FeatureGate>
    )
  }

  WithFeatureGateComponent.displayName = `withFeatureGate(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithFeatureGateComponent
}

// Conditional rendering hook
export function useFeatureGate(feature: string) {
  const { isEnabled, loading, error } = useFeatureFlag(feature)
  
  return {
    isEnabled,
    loading,
    error,
    // Helper methods
    render: (children: React.ReactNode, fallback?: React.ReactNode) => {
      if (loading) return null
      if (error) return fallback || null
      return isEnabled ? children : (fallback || null)
    },
    // Conditional class names
    getClassName: (enabledClass: string, disabledClass: string = '') => {
      if (loading || error) return disabledClass
      return isEnabled ? enabledClass : disabledClass
    }
  }
}


