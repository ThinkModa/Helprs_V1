'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileUpload } from '@/components/ui/fileUpload'
import { useAuth } from '@/contexts/AuthContext'
import { sanitizeInput } from '@/lib/utils/sanitize'
import { uploadCompanyLogo } from '@/lib/utils/fileUpload'

interface OnboardingData {
  // Step 1: Personal Info
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  
  // Step 2: Company Basics
  companyName: string
  industry: string
  employeeRange: string
  
  // Step 3: Company Details
  logo: File | null
  logoUrl: string
  workerInvites: string[]
  city: string
  state: string
}

const industries = [
  'Moving And Storage / Moving Labor',
  'Landscaping And Lawn Care / Maintenance',
  'Home Painting',
  'Home Repair / Remodeling',
  'Cleaning / Janitorial Services'
]

const employeeRanges = [
  '1-10',
  '11-25', 
  '26-50',
  '51-100',
  '100+'
]

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
]

// Validation functions
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return 'Email is required'
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  return null
}

const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter'
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number'
  return null
}

const validateName = (name: string, fieldName: string): string | null => {
  if (!name.trim()) return `${fieldName} is required`
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`
  if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
  return null
}

const validateCompanyName = (name: string): string | null => {
  if (!name.trim()) return 'Company name is required'
  if (name.trim().length < 2) return 'Company name must be at least 2 characters'
  if (name.trim().length > 100) return 'Company name must be less than 100 characters'
  return null
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const { user, signUp, signIn, createCompany } = useAuth()
  const router = useRouter()

  // Load form data from localStorage on component mount
  const [formData, setFormData] = useState<OnboardingData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onboarding-form-data')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          console.log('Loaded saved form data:', parsed)
          return parsed
        } catch (e) {
          console.error('Error parsing saved form data:', e)
        }
      }
    }
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      industry: '',
      employeeRange: '',
      logo: null,
      logoUrl: '',
      workerInvites: [''],
      city: '',
      state: ''
    }
  })

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    // Sanitize string inputs
    const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value
    
    setFormData(prev => {
      const newData = { ...prev, [field]: sanitizedValue }
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboarding-form-data', JSON.stringify(newData))
      }
      return newData
    })
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {}
    
    const firstNameError = validateName(formData.firstName, 'First name')
    if (firstNameError) errors.firstName = firstNameError
    
    const lastNameError = validateName(formData.lastName, 'Last name')
    if (lastNameError) errors.lastName = lastNameError
    
    const emailError = validateEmail(formData.email)
    if (emailError) errors.email = emailError
    
    const passwordError = validatePassword(formData.password)
    if (passwordError) errors.password = passwordError
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {}
    
    const companyNameError = validateCompanyName(formData.companyName)
    if (companyNameError) errors.companyName = companyNameError
    
    if (!formData.industry) {
      errors.industry = 'Please select an industry'
    }
    
    if (!formData.employeeRange) {
      errors.employeeRange = 'Please select employee range'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.city) {
      errors.city = 'Please select a city'
    }
    
    if (!formData.state) {
      errors.state = 'Please select a state'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateStep1()) {
      return
    }

    // Check if user is already authenticated
    if (user) {
      // User is already logged in, just proceed to next step
      setCurrentStep(2)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      )
      
      if (error) {
        // If user already exists, try to sign them in instead
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          const { data: signInData, error: signInError } = await signIn(formData.email, formData.password)
          if (signInError) {
            setError('Account exists but password is incorrect. Please try signing in instead.')
          } else {
            setCurrentStep(2)
          }
        } else {
          setError(error.message)
        }
      } else {
        setCurrentStep(2)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateStep2()) {
      return
    }
    
    setCurrentStep(3)
  }

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateStep3()) {
      return
    }

    setLoading(true)
    setError('')
    
    try {
      console.log('Starting company creation...')
      
      // Create company
      const { data, error } = await createCompany({
        name: formData.companyName,
        industry: formData.industry,
        employeeRange: formData.employeeRange,
        city: formData.city,
        state: formData.state,
        logoUrl: formData.logoUrl || undefined
      })

      console.log('Company creation result:', { data, error })

      if (error) {
        console.error('Company creation error:', error)
        setError(error.message || 'Failed to create company')
      } else {
        console.log('Company created successfully, redirecting...')
        // Clear saved form data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('onboarding-form-data')
        }
        // Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Unexpected error during company creation:', err)
      setError('An unexpected error occurred: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const addWorkerInvite = () => {
    updateFormData('workerInvites', [...formData.workerInvites, ''])
  }

  const removeWorkerInvite = (index: number) => {
    const newInvites = formData.workerInvites.filter((_, i) => i !== index)
    updateFormData('workerInvites', newInvites)
  }

  const updateWorkerInvite = (index: number, email: string) => {
    const newInvites = [...formData.workerInvites]
    newInvites[index] = email
    updateFormData('workerInvites', newInvites)
  }

  const handleLogoUpload = async (file: File | null) => {
    if (!file) {
      updateFormData('logo', null)
      updateFormData('logoUrl', '')
      return
    }

    if (!user) {
      setError('Please sign in first to upload a logo')
      return
    }

    setUploadingLogo(true)
    setError('')

    try {
      const result = await uploadCompanyLogo(file, user.id)
      
      if (result.success && result.url) {
        updateFormData('logo', file)
        updateFormData('logoUrl', result.url)
      } else {
        setError(result.error || 'Failed to upload logo')
      }
    } catch (err) {
      setError('An unexpected error occurred while uploading the logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-2">
            <p className="text-sm text-gray-600">
              Step {currentStep} of 3: {
                currentStep === 1 ? 'Personal Information' :
                currentStep === 2 ? 'Company Setup' : 'Final Details'
              }
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-8">
          <div className="relative overflow-visible">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="animate-slide-in">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-semibold text-blue-600 mb-2">Create your account</h1>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Get started</h2>
                  <p className="text-gray-600">Let's set up your personal information first.</p>
                </div>

                <form onSubmit={handleStep1Submit} className="space-y-6 mx-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 py-2">
                    <div>
                      <Input
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        required
                        className={`h-12 px-4 bg-gray-50 border-0 rounded-lg shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                          validationErrors.firstName ? 'ring-2 ring-red-500/20' : ''
                        }`}
                      />
                      {validationErrors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Input
                        type="text"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        required
                        className={`h-12 px-4 bg-gray-50 border-0 rounded-lg shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                          validationErrors.lastName ? 'ring-2 ring-red-500/20' : ''
                        }`}
                      />
                      {validationErrors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      required
                      className={`h-12 px-4 bg-gray-50 border-0 rounded-lg shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                        validationErrors.email ? 'ring-2 ring-red-500/20' : ''
                      }`}
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      required
                      className={`h-12 px-4 bg-gray-50 border-0 rounded-lg shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                        validationErrors.password ? 'ring-2 ring-red-500/20' : ''
                      }`}
                    />
                    {validationErrors.password && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                      required
                      className={`h-12 px-4 bg-gray-50 border-0 rounded-lg shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                        validationErrors.confirmPassword ? 'ring-2 ring-red-500/20' : ''
                      }`}
                    />
                    {validationErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Continue'}
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Company Basics */}
            {currentStep === 2 && (
              <div className="animate-slide-in">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-semibold text-blue-600 mb-2">Company setup</h1>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Tell us about your business</h2>
                  <p className="text-gray-600">Help us customize your experience.</p>
                </div>

                <form onSubmit={handleStep2Submit} className="space-y-6 mx-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <Input
                    type="text"
                    placeholder="Company name"
                    value={formData.companyName}
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                    required
                    className="h-12 px-4 bg-gray-50 border-0 rounded-lg shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />

                  <select
                    value={formData.industry}
                    onChange={(e) => updateFormData('industry', e.target.value)}
                    required
                    className="w-full h-12 px-4 bg-gray-50 border-0 rounded-lg shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-gray-900"
                  >
                    <option value="">Select your industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>

                  <select
                    value={formData.employeeRange}
                    onChange={(e) => updateFormData('employeeRange', e.target.value)}
                    required
                    className="w-full h-12 px-4 bg-gray-50 border-0 rounded-lg shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-gray-900"
                  >
                    <option value="">Number of employees / contractors</option>
                    {employeeRanges.map((range) => (
                      <option key={range} value={range}>{range} employees / contractors</option>
                    ))}
                  </select>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goBack}
                      className="flex-1 h-12 border-gray-300 text-gray-700"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      Continue
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Company Details */}
            {currentStep === 3 && (
              <div className="animate-slide-in">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-semibold text-blue-600 mb-2">Final details</h1>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Almost done!</h2>
                  <p className="text-gray-600">Add some finishing touches to your account.</p>
                </div>

                <form onSubmit={handleStep3Submit} className="space-y-6 mx-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Logo (Optional)
                    </label>
                    <FileUpload
                      onFileSelect={handleLogoUpload}
                      currentFile={formData.logo}
                      currentUrl={formData.logoUrl}
                      disabled={uploadingLogo}
                    />
                    {uploadingLogo && (
                      <p className="text-blue-600 text-sm mt-2">Uploading logo...</p>
                    )}
                  </div>

                  {/* Worker Invites */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invite Team Members (Optional)
                    </label>
                    {formData.workerInvites.map((email, index) => (
                      <div key={index} className="flex space-x-2 mb-2">
                        <Input
                          type="email"
                          placeholder="team@company.com"
                          value={email}
                          onChange={(e) => updateWorkerInvite(index, e.target.value)}
                          className="h-12 px-4 bg-gray-50 border-0 rounded-lg shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                        />
                        {formData.workerInvites.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeWorkerInvite(index)}
                            className="h-12 px-3 border-red-300 text-red-600 hover:bg-red-50"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addWorkerInvite}
                      className="w-full h-10 border-gray-300 text-gray-600"
                    >
                      + Add another team member
                    </Button>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-2 gap-4 py-2">
                    <Input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      required
                      className="h-12 px-4 bg-gray-50 border-0 rounded-lg shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                    <select
                      value={formData.state}
                      onChange={(e) => updateFormData('state', e.target.value)}
                      required
                      className="h-12 px-4 bg-gray-50 border-0 rounded-lg shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-gray-900"
                    >
                      <option value="">State</option>
                      {states.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goBack}
                      className="flex-1 h-12 border-gray-300 text-gray-700"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                      disabled={loading}
                    >
                      {loading ? 'Completing setup...' : 'Complete Setup'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">
              Already have an account?{' '}
            </span>
            <Link 
              href="/login" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}