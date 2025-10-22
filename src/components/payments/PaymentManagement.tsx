'use client'

import React, { useState } from 'react'
import { CreditCard, Users, TrendingUp, Settings, ArrowRight, CheckCircle, Clock, AlertCircle, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Toggle } from '@/components/ui/toggle'

interface PaymentManagementProps {
  companyId: string
}

export function PaymentManagement({ companyId }: PaymentManagementProps) {
  console.log('PaymentManagement demo component rendering with companyId:', companyId)
  
  // Demo mode - simple state management
  const [viewMode, setViewMode] = useState<'onboarding' | 'dashboard'>('onboarding')
  const [onboardingStep, setOnboardingStep] = useState(1)
  
  console.log('PaymentManagement demo mode - viewMode:', viewMode, 'onboardingStep:', onboardingStep)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600">Monitor payments, manage workers, and track revenue</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <CreditCard className="h-4 w-4 mr-2" />
            View All Transactions
          </Button>
        </div>
      </div>

      {/* Toggle Switch - Always visible */}
      <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <span className={`text-sm font-medium ${viewMode === 'onboarding' ? 'text-blue-600' : 'text-gray-500'}`}>
          Onboarding View
        </span>
        <Toggle 
          checked={viewMode === 'dashboard'} 
          onChange={(checked) => setViewMode(checked ? 'dashboard' : 'onboarding')} 
        />
        <span className={`text-sm font-medium ${viewMode === 'dashboard' ? 'text-blue-600' : 'text-gray-500'}`}>
          Active Dashboard
        </span>
      </div>

      {/* Conditional Content */}
      {viewMode === 'onboarding' ? (
        // Onboarding View
        <div className="max-w-4xl mx-auto">
          {onboardingStep === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Up Payments</h1>
                <p className="text-gray-600">
                  Connect your bank account to start accepting payments from customers and paying your workers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Fast</h3>
                  <p className="text-gray-600">
                    Powered by Stripe, the industry standard for online payments
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Worker Payouts</h3>
                  <p className="text-gray-600">
                    Automatically pay your workers based on their time tracking
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Everything</h3>
                  <p className="text-gray-600">
                    Monitor all payments, fees, and worker payouts in one place
                  </p>
                </Card>
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  onClick={() => setOnboardingStep(2)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Connect Bank Account
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  Takes less than 5 minutes • No monthly fees
                </p>
              </div>
            </>
          )}

          {onboardingStep === 2 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Connect Your Bank Account</h1>
                <p className="text-gray-600">
                  We'll redirect you to Stripe to securely connect your bank account.
                </p>
              </div>

              <Card className="p-8 mb-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Business Information</h3>
                      <p className="text-gray-600">Provide your business details and tax information</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Bank Account Details</h3>
                      <p className="text-gray-600">Connect your business bank account for payouts</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Identity Verification</h3>
                      <p className="text-gray-600">Verify your identity with a photo ID</p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="text-center">
                <Button
                  size="lg"
                  onClick={() => setOnboardingStep(3)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Continue to Stripe
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  You'll be redirected to Stripe's secure platform
                </p>
              </div>
            </>
          )}

          {onboardingStep === 3 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Connected!</h1>
                <p className="text-gray-600">
                  Your bank account has been successfully connected. You can now start accepting payments.
                </p>
              </div>

              <Card className="p-8 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Bank Account Connected</span>
                    </div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Identity Verified</span>
                    </div>
                    <span className="text-sm text-green-600">Complete</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Tax Information</span>
                    </div>
                    <span className="text-sm text-green-600">Complete</span>
                  </div>
                </div>
              </Card>

              <div className="text-center">
                <Button
                  size="lg"
                  onClick={() => {
                    setViewMode('dashboard')
                    setOnboardingStep(1) // Reset for next time
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Go to Payment Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  Start managing payments and worker payouts
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        // Active Dashboard View
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">$12,450</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Workers</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">$3,200</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Demo Content */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Jobs</h3>
            <p className="text-gray-600">Demo: Active jobs feed would appear here</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed Jobs Awaiting Payment</h3>
            <p className="text-gray-600">Demo: Completed jobs feed would appear here</p>
          </Card>
        </>
      )}
    </div>
  )
}