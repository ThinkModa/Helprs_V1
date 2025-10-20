'use client'

import React, { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, User, Building2, DollarSign, Calendar, FileText, Settings, Upload, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ProfilePictureUpload } from '@/components/ui/profile-picture-upload'
import { UserService, UserWithDetails, PositionWithStats } from '@/lib/database/users'

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserCreated: (user: UserWithDetails) => void
  companyId: string
  positions: PositionWithStats[]
  calendars: Array<{ id: string; name: string; color: string }>
}

interface FormData {
  // Step 1: Profile
  firstName: string
  lastName: string
  email: string
  phone: string
  profilePicture: File | null
  assignedCalendars: string[]
  
  // Step 2: Assignments
  role: 'admin' | 'manager' | 'supervisor' | 'general'
  positionId: string
  calendarIds: string[]
  
  // Step 3: Wages
  wageType: 'salary' | 'hourly'
  wageAmount: string
  
  // Step 4: Time Off
  vacationDays: string
  sickDays: string
  personalDays: string
  
  // Step 5: Log/Notes
  hireDate: string
  startDate: string
  notes: string
  
  // Step 6: Advanced
  status: 'active' | 'inactive' | 'archived' | 'terminated'
  department: string
  jobTitle: string
}

const steps = [
  { id: 1, title: 'Profile', icon: User, description: 'Basic information' },
  { id: 2, title: 'Assignments', icon: Building2, description: 'Role and position' },
  { id: 3, title: 'Wages', icon: DollarSign, description: 'Compensation details' },
  { id: 4, title: 'Time Off', icon: Calendar, description: 'Leave policies' },
  { id: 5, title: 'Log/Notes', icon: FileText, description: 'Additional information' },
  { id: 6, title: 'Advanced', icon: Settings, description: 'System settings' }
]

export function AddUserModal({ isOpen, onClose, onUserCreated, companyId, positions, calendars }: AddUserModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePicture: null,
    assignedCalendars: [],
    role: 'general',
    positionId: '',
    calendarIds: [],
    wageType: 'hourly',
    wageAmount: '',
    vacationDays: '10',
    sickDays: '5',
    personalDays: '3',
    hireDate: '',
    startDate: '',
    notes: '',
    status: 'active',
    department: '',
    jobTitle: ''
  })

  const userService = new UserService({} as any) // Mock service

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        profilePicture: null,
        assignedCalendars: [],
        role: 'general',
        positionId: '',
        calendarIds: [],
        wageType: 'hourly',
        wageAmount: '',
        vacationDays: '10',
        sickDays: '5',
        personalDays: '3',
        hireDate: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'active',
        department: '',
        jobTitle: ''
      })
    }
  }, [isOpen])

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }


  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Create user with form data
      const newUser: UserWithDetails = {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        company_id: companyId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        avatar_url: null,
        role: formData.role,
        department: formData.department,
        job_title: formData.jobTitle,
        employee_id: `${companyId.substring(0, 2).toUpperCase()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        mobile_number: formData.phone,
        start_date: formData.startDate,
        position_id: formData.positionId,
        status: formData.status,
        profile_picture_url: null, // Would be uploaded to Supabase Storage
        hire_date: formData.hireDate,
        is_active: true,
        last_login_at: null,
        preferences: {},
        metadata: {
          wageType: formData.wageType,
          wageAmount: formData.wageAmount,
          vacationDays: formData.vacationDays,
          sickDays: formData.sickDays,
          personalDays: formData.personalDays,
          notes: formData.notes
        },
        location_coordinates: null,
        timezone: 'America/New_York',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current-user-id',
        updated_by: null,
        position_name: positions.find(p => p.id === formData.positionId)?.name || null,
        position_color: positions.find(p => p.id === formData.positionId)?.color || null,
        assigned_calendars: formData.calendarIds.map(id => ({
          id,
          name: `Calendar ${id.split('-')[1]}`,
          color: '#3B82F6'
        })),
        calendar_count: formData.calendarIds.length
      }

      onUserCreated(newUser)
      onClose()
    } catch (error) {
      console.error('Error creating user:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <ProfilePictureUpload
                currentImageUrl={formData.profilePicture ? URL.createObjectURL(formData.profilePicture) : null}
                onImageChange={(file, previewUrl) => {
                  handleInputChange('profilePicture', file)
                }}
                disabled={false}
                size="md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            {/* Calendar Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Calendar Assignments</label>
              <div className="grid grid-cols-2 gap-3">
                {calendars.map((calendar) => (
                  <label key={calendar.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.assignedCalendars?.includes(calendar.id) || false}
                      onChange={(e) => {
                        const currentCalendars = formData.assignedCalendars || []
                        if (e.target.checked) {
                          handleInputChange('assignedCalendars', [...currentCalendars, calendar.id])
                        } else {
                          handleInputChange('assignedCalendars', currentCalendars.filter(id => id !== calendar.id))
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: calendar.color }}
                    />
                    <span className="text-sm font-medium text-gray-900">{calendar.name}</span>
                  </label>
                ))}
              </div>
              {(!formData.assignedCalendars || formData.assignedCalendars.length === 0) && (
                <p className="text-sm text-gray-500 mt-2">Select at least one calendar to assign this user to</p>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="supervisor">Supervisor</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
              <select
                value={formData.positionId}
                onChange={(e) => handleInputChange('positionId', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a position</option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Calendar Assignments</label>
              <div className="space-y-2">
                {['House Cleaning Team', 'Office Cleaning Team', 'Downtown Area', 'Residential Services'].map((calendar, index) => (
                  <label key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.calendarIds.includes(`cal-${index + 1}`)}
                      onChange={(e) => {
                        const calendarId = `cal-${index + 1}`
                        if (e.target.checked) {
                          handleInputChange('calendarIds', [...formData.calendarIds, calendarId])
                        } else {
                          handleInputChange('calendarIds', formData.calendarIds.filter(id => id !== calendarId))
                        }
                      }}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">{calendar}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wage Type *</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    value="hourly"
                    checked={formData.wageType === 'hourly'}
                    onChange={(e) => handleInputChange('wageType', e.target.value)}
                    className="mr-3"
                  />
                  <span>Hourly</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    value="salary"
                    checked={formData.wageType === 'salary'}
                    onChange={(e) => handleInputChange('wageType', e.target.value)}
                    className="mr-3"
                  />
                  <span>Salary</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.wageType === 'hourly' ? 'Hourly Rate' : 'Annual Salary'} *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={formData.wageAmount}
                  onChange={(e) => handleInputChange('wageAmount', e.target.value)}
                  placeholder={formData.wageType === 'hourly' ? '0.00' : '0'}
                  className="pl-8"
                  required
                />
              </div>
            </div>

          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vacation Days</label>
                <Input
                  type="number"
                  value={formData.vacationDays}
                  onChange={(e) => handleInputChange('vacationDays', e.target.value)}
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sick Days</label>
                <Input
                  type="number"
                  value={formData.sickDays}
                  onChange={(e) => handleInputChange('sickDays', e.target.value)}
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Days</label>
                <Input
                  type="number"
                  value={formData.personalDays}
                  onChange={(e) => handleInputChange('personalDays', e.target.value)}
                  placeholder="3"
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Time Off Policy</h4>
              <p className="text-sm text-blue-700">
                These are the default time off allowances for this employee. You can adjust these values based on company policy and employee level.
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date *</label>
                <Input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleInputChange('hireDate', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes about this employee..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <Input
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Enter department"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
              <Input
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                placeholder="Enter job title"
              />
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium text-green-900">Ready to Create</h4>
              </div>
              <p className="text-sm text-green-700 mt-1">
                All required information has been collected. Click "Create User" to add this employee to your team.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Team Member</h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                  currentStep > step.id
                    ? 'bg-green-500 text-white'
                    : currentStep === step.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className="text-xs font-medium text-gray-500">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {currentStep === steps.length ? (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? 'Creating...' : 'Create User'}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="flex items-center"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
