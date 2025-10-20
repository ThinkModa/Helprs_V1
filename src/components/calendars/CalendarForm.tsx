'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Save, X, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { CalendarWithStats } from '@/lib/database/calendars'

interface CalendarFormProps {
  calendar?: CalendarWithStats | null
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function CalendarForm({ calendar, onSubmit, onCancel }: CalendarFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    calendar_type: 'team',
    is_active: true,
    sort_order: 0
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([])

  // Mock appointments data for demonstration
  const appointmentOptions = [
    { value: 'apt-001', label: 'House Cleaning Service' },
    { value: 'apt-002', label: 'Office Deep Cleaning' },
    { value: 'apt-003', label: 'Plumbing Repair Service' },
    { value: 'apt-004', label: 'Carpet Cleaning Service' },
    { value: 'apt-005', label: 'Window Cleaning Service' },
    { value: 'apt-006', label: 'Landscaping Service' }
  ]

  const calendarTypes = [
    { value: 'team', label: 'Team', description: 'Group of workers with similar skills' },
    { value: 'location', label: 'Location', description: 'Geographic area or specific location' },
    { value: 'service_area', label: 'Service Area', description: 'Type of service provided' },
    { value: 'specialization', label: 'Specialization', description: 'Specific expertise or skill set' }
  ]

  const colors = [
    { value: '#3B82F6', label: 'Blue', class: 'bg-blue-500' },
    { value: '#10B981', label: 'Green', class: 'bg-green-500' },
    { value: '#F59E0B', label: 'Yellow', class: 'bg-yellow-500' },
    { value: '#EF4444', label: 'Red', class: 'bg-red-500' },
    { value: '#8B5CF6', label: 'Purple', class: 'bg-purple-500' },
    { value: '#06B6D4', label: 'Cyan', class: 'bg-cyan-500' },
    { value: '#F97316', label: 'Orange', class: 'bg-orange-500' },
    { value: '#84CC16', label: 'Lime', class: 'bg-lime-500' },
    { value: '#EC4899', label: 'Pink', class: 'bg-pink-500' },
    { value: '#6B7280', label: 'Gray', class: 'bg-gray-500' }
  ]

  useEffect(() => {
    if (calendar) {
      setFormData({
        name: calendar.name,
        description: calendar.description || '',
        color: calendar.color,
        calendar_type: calendar.calendar_type,
        is_active: calendar.is_active,
        sort_order: calendar.sort_order
      })
    }
  }, [calendar])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Calendar name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Calendar name must be at least 2 characters'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAppointmentToggle = (appointmentId: string) => {
    setSelectedAppointments(prev => 
      prev.includes(appointmentId)
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {calendar ? 'Edit Calendar' : 'Create Calendar'}
          </h2>
          <p className="text-gray-600">
            {calendar ? 'Update calendar details' : 'Set up a new organizational calendar'}
          </p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            {/* Calendar Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Calendar Name *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., House Cleaning Team, Downtown Area"
                className={errors.name ? 'border-red-300 focus:ring-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this calendar represents..."
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-300 focus:ring-red-500' : ''
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/500 characters
              </p>
            </div>
          </div>

          {/* Calendar Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Calendar Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {calendarTypes.map((type) => (
                <label
                  key={type.value}
                  className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.calendar_type === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="calendar_type"
                    value={type.value}
                    checked={formData.calendar_type === type.value}
                    onChange={(e) => handleInputChange('calendar_type', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </div>
                  {formData.calendar_type === type.value && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Color</h3>
            <div className="grid grid-cols-5 gap-3">
              {colors.map((color) => (
                <label
                  key={color.value}
                  className={`relative flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.color === color.value
                      ? 'border-gray-900 ring-2 ring-gray-900'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="color"
                    value={color.value}
                    checked={formData.color === color.value}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full ${color.class}`}></div>
                  {formData.color === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Choose a color to help visually distinguish this calendar
            </p>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
            
            <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Active</div>
                <div className="text-sm text-gray-600">
                  This calendar is available for scheduling
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  formData.is_active ? 'bg-blue-600' : 'bg-gray-200'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    formData.is_active ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`}></div>
                </div>
              </label>
            </div>
          </div>

          {/* Appointment Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Appointment Assignment
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Appointments
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Choose which appointments this calendar can be assigned to
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {appointmentOptions.map((appointment) => (
                  <label
                    key={appointment.value}
                    className={`relative flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAppointments.includes(appointment.value)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAppointments.includes(appointment.value)}
                      onChange={() => handleAppointmentToggle(appointment.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{appointment.label}</div>
                    </div>
                    {selectedAppointments.includes(appointment.value) && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{calendar ? 'Update Calendar' : 'Create Calendar'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
