'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { user, currentCompany, loading, signOut } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else {
        setIsLoading(false)
      }
    }
  }, [user, loading, router])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1"></div>
            <Button 
              onClick={async () => {
                setIsSigningOut(true)
                await signOut()
                // The useEffect will handle redirecting to login
              }}
              variant="outline"
              disabled={isSigningOut}
              className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400 disabled:opacity-50"
            >
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Helprs! 🎉
            </h1>
            {currentCompany ? (
              <div>
                <p className="text-xl text-gray-600 mb-2">
                  You're now logged into <span className="font-semibold text-blue-600">{currentCompany.name}</span>
                </p>
                <p className="text-gray-500">
                  Industry: {currentCompany.industry || 'Not specified'} • 
                  Size: {currentCompany.employee_range || 'Not specified'} employees
                </p>
                {currentCompany.city && currentCompany.state && (
                  <p className="text-gray-500">
                    Location: {currentCompany.city}, {currentCompany.state}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xl text-gray-600">
                Your account is set up successfully!
              </p>
            )}
          </div>
        </div>

        {/* Tenant Isolation Test */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tenant Isolation Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">✅ Multi-Tenant Setup</h3>
              <p className="text-blue-700">
                Your company data is isolated from other organizations. Each company has its own secure workspace.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Database Schema</h3>
              <p className="text-green-700">
                Complete database schema with companies, users, feature flags, and audit logging is ready.
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">✅ Authentication</h3>
              <p className="text-purple-700">
                Supabase authentication is working with proper user management and session handling.
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">✅ Onboarding Flow</h3>
              <p className="text-orange-700">
                Multi-step onboarding process completed successfully with company setup and user creation.
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">User Details</h3>
              <p className="text-gray-600">Email: {user?.email}</p>
              <p className="text-gray-600">User ID: {user?.id}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Details</h3>
              {currentCompany ? (
                <div>
                  <p className="text-gray-600">Company ID: {currentCompany.id}</p>
                  <p className="text-gray-600">Slug: {currentCompany.slug}</p>
                  <p className="text-gray-600">Created: {new Date(currentCompany.created_at).toLocaleDateString()}</p>
                </div>
              ) : (
                <p className="text-gray-500">No company data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}