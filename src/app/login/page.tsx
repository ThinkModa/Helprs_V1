'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const router = useRouter()

  // Quick access accounts
  const quickAccessAccounts = {
    superAdmin: {
      email: 'admin@helprs.com',
      password: 'superadmin123',
      label: 'Super Admin',
      icon: '👑',
      description: 'Platform Administrator'
    },
    helprsTest: {
      email: 'admin@helprstest.com',
      password: 'helprstest123',
      label: 'Helprs Test Company',
      icon: '🧪',
      description: 'Internal Testing'
    },
    homeTeam: {
      email: 'admin@thehometeam.com',
      password: 'hometeam123',
      label: 'The Home Team',
      icon: '🏠',
      description: 'Moving & Storage Company'
    },
    primetimeMoving: {
      email: 'admin@primetimemoving.com',
      password: 'primetime123',
      label: 'Primetime Moving',
      icon: '🚛',
      description: 'Professional Moving Services'
    }
  }

  const handleQuickAccess = async (account: typeof quickAccessAccounts.superAdmin) => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
    setLoading(true)

    try {
      const { error } = await signIn(account.email, account.password)
      if (error) {
        setError(error.message)
      } else {
        // Redirect based on account type
        if (account.email === 'admin@helprs.com') {
          router.push('/admin/dashboard') // Super admin dashboard
        } else {
          router.push('/dashboard') // Company dashboard
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-0.5 bg-blue-600 mx-auto mb-6"></div>
          <h1 className="text-2xl font-semibold text-blue-600 mb-4">Sign in</h1>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back
          </h2>
          <p className="text-gray-600 text-lg">
            Sign in to your account to continue managing your workforce.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {/* Email Field */}
            <div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your email"
              />
            </div>
            
            {/* Password Field */}
            <div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your password"
              />
            </div>
            
            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                href="/forgot-password" 
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          
          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">
              Don't have an account?{' '}
            </span>
            <Link 
              href="/register" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Create account
            </Link>
          </div>

          {/* Quick Access Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 font-medium">Quick Access</p>
              <p className="text-xs text-gray-500 mt-1">Click to sign in instantly</p>
            </div>
            
            <div className="space-y-3">
              {/* Super Admin */}
              <button
                onClick={() => handleQuickAccess(quickAccessAccounts.superAdmin)}
                disabled={loading}
                className="w-full p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{quickAccessAccounts.superAdmin.icon}</span>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-gray-900">{quickAccessAccounts.superAdmin.label}</p>
                    <p className="text-xs text-gray-600">{quickAccessAccounts.superAdmin.description}</p>
                  </div>
                </div>
              </button>

              {/* Helprs Test Company */}
              <button
                onClick={() => handleQuickAccess(quickAccessAccounts.helprsTest)}
                disabled={loading}
                className="w-full p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{quickAccessAccounts.helprsTest.icon}</span>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-gray-900">{quickAccessAccounts.helprsTest.label}</p>
                    <p className="text-xs text-gray-600">{quickAccessAccounts.helprsTest.description}</p>
                  </div>
                </div>
              </button>

              {/* The Home Team */}
              <button
                onClick={() => handleQuickAccess(quickAccessAccounts.homeTeam)}
                disabled={loading}
                className="w-full p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg hover:from-green-100 hover:to-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{quickAccessAccounts.homeTeam.icon}</span>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-gray-900">{quickAccessAccounts.homeTeam.label}</p>
                    <p className="text-xs text-gray-600">{quickAccessAccounts.homeTeam.description}</p>
                  </div>
                </div>
              </button>

              {/* Primetime Moving */}
              <button
                onClick={() => handleQuickAccess(quickAccessAccounts.primetimeMoving)}
                disabled={loading}
                className="w-full p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg hover:from-orange-100 hover:to-red-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{quickAccessAccounts.primetimeMoving.icon}</span>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-gray-900">{quickAccessAccounts.primetimeMoving.label}</p>
                    <p className="text-xs text-gray-600">{quickAccessAccounts.primetimeMoving.description}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}