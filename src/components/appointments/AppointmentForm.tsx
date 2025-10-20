'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Save, X, Calendar, Clock, MapPin, User, Phone, Mail, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AppointmentWithDetails } from '@/lib/database/appointments'

interface AppointmentFormProps {
  appointment?: AppointmentWithDetails | null
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function AppointmentForm({ appointment, onSubmit, onCancel }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'scheduled',
    priority: 'medium',
    estimated_cost: '',
    currency: 'USD',
    pricing_type: 'fixed',
    duration: '',
    is_private: false,
    selected_calendars: [] as string[],
    notes: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const pricingTypes = [
    { value: 'fixed', label: 'Fixed Price', description: 'One-time fixed cost for the service' },
    { value: 'hourly', label: 'Hourly Rate', description: 'Cost per hour of work' }
  ]

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled', color: 'blue' },
    { value: 'in_progress', label: 'In Progress', color: 'yellow' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'gray' },
    { value: 'medium', label: 'Medium', color: 'blue' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ]

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CAD', label: 'CAD (C$)' }
  ]

  // Mock teams for assignment (in real app, this would come from calendars)
  const teamOptions = [
    { value: 'cal-001', label: 'House Cleaning Team' },
    { value: 'cal-002', label: 'Office Cleaning Team' },
    { value: 'cal-003', label: 'Downtown Area' },
    { value: 'cal-004', label: 'North Side' },
    { value: 'cal-005', label: 'Residential Services' },
    { value: 'cal-006', label: 'Plumbing Team' }
  ]

  useEffect(() => {
    if (appointment) {
      setFormData({
        title: appointment.title,
        description: appointment.description || '',
        status: appointment.status,
        priority: appointment.priority,
        estimated_cost: appointment.estimated_cost?.toString() || '',
        currency: appointment.currency,
        pricing_type: appointment.metadata?.pricing_type || 'fixed',
        duration: appointment.metadata?.duration || '',
        is_private: appointment.metadata?.is_private || false,
        selected_calendars: appointment.calendar_names || [],
        notes: appointment.notes || ''
      })
    }
  }, [appointment])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Service title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (formData.estimated_cost && isNaN(Number(formData.estimated_cost))) {
      newErrors.estimated_cost = 'Please enter a valid cost amount'
    }

    if (formData.selected_calendars.length === 0) {
      newErrors.calendars = 'Please select at least one calendar'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        estimated_cost: formData.estimated_cost ? Number(formData.estimated_cost) : null,
        metadata: { 
          pricing_type: formData.pricing_type,
          duration: formData.duration,
          is_private: formData.is_private
        },
        calendar_names: formData.selected_calendars
      }
      onSubmit(submitData)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCalendarToggle = (calendarId: string) => {
    setFormData(prev => ({
      ...prev,
      selected_calendars: prev.selected_calendars.includes(calendarId)
        ? prev.selected_calendars.filter(id => id !== calendarId)
        : [...prev.selected_calendars, calendarId]
    }))
    
    // Clear calendar error when user makes a selection
    if (errors.calendars) {
      setErrors(prev => ({ ...prev, calendars: '' }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
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
            {appointment ? 'Edit Service' : 'Create Service'}
          </h2>
          <p className="text-gray-600">
            {appointment ? 'Update service details' : 'Define a new service that can be assigned to calendars'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Service Information
            </h3>
            
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Service Title *
              </label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., House Cleaning Service"
                className={errors.title ? 'border-red-300 focus:ring-red-500' : ''}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
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
                placeholder="Describe what this service includes..."
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-300 focus:ring-red-500' : ''
                }`}
              />
            </div>
          </div>
        </Card>

        {/* Calendar Assignment */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Calendar Assignment
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Calendars *
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Choose which calendars this service can be assigned to
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teamOptions.map((team) => (
                  <label
                    key={team.value}
                    className={`relative flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.selected_calendars.includes(team.value)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selected_calendars.includes(team.value)}
                      onChange={() => handleCalendarToggle(team.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{team.label}</div>
                    </div>
                    {formData.selected_calendars.includes(team.value) && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
              {errors.calendars && (
                <p className="mt-2 text-sm text-red-600">{errors.calendars}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Pricing */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Pricing
            </h3>
            
            {/* Pricing Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pricingTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.pricing_type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pricing_type"
                      value={type.value}
                      checked={formData.pricing_type === type.value}
                      onChange={(e) => handleInputChange('pricing_type', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </div>
                    {formData.pricing_type === type.value && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Cost */}
            <div>
              <label htmlFor="estimated_cost" className="block text-sm font-medium text-gray-700 mb-2">
                {formData.pricing_type === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}
              </label>
              <div className="flex">
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                >
                  {currencyOptions.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
                <Input
                  id="estimated_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.estimated_cost}
                  onChange={(e) => handleInputChange('estimated_cost', e.target.value)}
                  placeholder="0.00"
                  className={`rounded-l-none ${errors.estimated_cost ? 'border-red-300 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.estimated_cost && (
                <p className="mt-1 text-sm text-red-600">{errors.estimated_cost}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Duration & Access */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Duration & Access
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <Input
                  id="duration"
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 2 hours, 30 minutes, 1 day"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Estimated time to complete this service
                </p>
              </div>

              {/* Access Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Level
                </label>
                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      {formData.is_private ? 'Private (Internal Only)' : 'Public (External & Internal)'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formData.is_private 
                        ? 'Only internal team members can see this service'
                        : 'Both external clients and internal team can see this service'
                      }
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_private}
                      onChange={(e) => handleInputChange('is_private', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      formData.is_private ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        formData.is_private ? 'translate-x-5' : 'translate-x-0.5'
                      } mt-0.5`}></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Additional Information
            </h3>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes or special instructions for this service..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Assigned Calendars */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Assigned Calendars
            </h3>
            
            <div className="text-sm text-gray-600">
              {formData.selected_calendars.length} calendar{formData.selected_calendars.length !== 1 ? 's' : ''} assigned to this service
            </div>
            
            {/* This would show the actual calendars in a real implementation */}
            <div className="text-sm text-gray-500 italic">
              Calendars will be displayed here when assigned to this service
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6">
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
            <span>{appointment ? 'Update Service' : 'Create Service'}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
